# Flujo del sistema Gifted Grads Insurance

> Cómo funciona la captura de leads ahora que el formulario es 100% propio
> (sin Jotform). Cero servicios externos de formularios — todo corre en tu
> infraestructura Cloudflare.

## Resumen visual

```
                    ┌─────────────────────────┐
                    │  RegisterForm (React)   │  ← diseño propio
                    │  /                      │
                    └──────────┬──────────────┘
                               │ POST /api/register
                               ▼
                    ┌─────────────────────────┐
                    │  Cloudflare Pages Func  │
                    │  - valida Zod           │
                    │  - asigna #N atómico    │
                    │  - guarda en D1         │
                    │  - envía email (Resend) │
                    └──┬──────────────────┬───┘
                       │                  │
                       ▼                  ▼
            ┌──────────────────┐  ┌─────────────────┐
            │  /confirmacion   │  │  📧 Inbox       │
            │  muestra #003    │  │  Lead #003      │
            └──────────────────┘  └─────────────────┘
                       │
                       │ (tiempo real)
                       ▼
            ┌──────────────────────────────────┐
            │  /manager (login + JWT)          │
            │  - tabla de leads                │
            │  - métricas                      │
            │  - búsqueda / export CSV         │
            │  - sortear rifa → email ganador  │
            └──────────────────────────────────┘
```

---

## 1. ¿Con qué se reemplaza el formulario?

`src/components/RegisterForm.tsx` — componente React propio con tu diseño
(header con icono, badge "Incluye rifa del iPad", validación inline). El
user llena 4 campos y hace **POST a `/api/register`** (Cloudflare Pages
Function definida en `functions/api/register.ts`).

No depende de ningún servicio externo de formularios.

## 2. ¿Cómo se reciben los correos?

Cada submission dispara un email automático a `ORGANIZER_EMAIL`
(configurado en `wrangler.toml`, hoy `info@aainsurances.com` — puedes
cambiarlo al que prefieras), enviado vía **Resend**.

Flujo (`functions/api/register.ts`):

1. Validación Zod del body.
2. `insertAttendee()` asigna `#001, #002, #003...` atómicamente (lock
   optimista con retry en colisiones de UNIQUE).
3. Guarda en D1 (tabla `attendees`).
4. `ctx.waitUntil(sendResendEmail(...))` — envía el correo sin bloquear
   la respuesta al cliente.
5. Responde al frontend con `{ participantNumber, createdAt }`.

## 3. ¿Cómo llega el correo? (template)

Definido en `functions/_shared/emails.ts` → función `organizerEmail()`.
HTML con marca azul de Gifted Grads.

```
De:      Gifted Grads <noreply@aainsurances.com>
Para:    info@aainsurances.com
Asunto:  Nuevo lead de seguro #003 — Ana López

┌─────────────────────────────────────┐
│  Gifted Grads Insurance             │  ← header azul de marca
├─────────────────────────────────────┤
│  Llegó un nuevo lead de seguro:     │
│                                     │
│  Número         #003                │
│  Nombre         Ana López           │
│  Email          ana@correo.com      │
│  Teléfono       +1 555 1234         │
│  Tipo de seguro Auto                │
│  Recibido       28 May 09:01        │
│                                     │
│  Puedes responder este correo       │
│  directamente para contactar.       │
└─────────────────────────────────────┘
```

Si das **Reply** al correo, le contestas directo al lead (el `reply-to`
está configurado al email del cliente, no a `noreply@`).

## 4. ¿Cómo se hace la rifa?

Manager va a `/manager/login` → mete `MANAGER_PASSWORD` → entra al
dashboard. En la sección "Rifa del iPad" tiene dos botones:

| Opción | Qué hace |
|--------|----------|
| **Sortear ganador aleatorio** | Backend hace `ORDER BY RANDOM() LIMIT 1` excluyendo participantes ya sorteados |
| **Seleccionar número manualmente** | Manager escribe el número (`#003`), backend valida que existe y no esté ya sorteado |

Cuando hay ganador:

1. Se guarda en tabla `raffle_draws` → no se puede repetir el mismo
   ganador.
2. **Email automático al ganador** con template "🎉 ¡Ganaste el iPad! —
   Gifted Grads" mostrándole su número y un CTA para reclamar el premio
   (template en `functions/_shared/emails.ts` → `winnerEmail()`).
3. Dashboard muestra el ganador en tarjeta destacada (nombre, número,
   email).

Backend: `functions/api/raffle/draw.ts`. UI: `src/components/RafflePanel.tsx`.

## 5. ¿Cómo los managers ven quién entra?

`/manager` (tras login con JWT). Dashboard incluye:

- **Métricas en tiempo real** (auto-refresh cada submission):
  - Total de leads
  - Leads hoy
  - Distribución por tipo de seguro (Auto / Home / Commercial / Renters)
- **Tabla de leads** con columnas `#, Nombre, Correo, Teléfono, Tipo de
  seguro, Recibido`
- **Búsqueda** por nombre, correo o número
- **Paginación**
- **Click en una fila** → modal con detalle del lead
- **Botón "Exportar CSV"** descarga toda la lista
- **Panel de Rifa** integrado al lado, con ganador actual si ya existe

Endpoints (todos protegidos con JWT):

- `GET /api/attendees` — lista paginada
- `GET /api/attendees/[id]` — detalle
- `GET /api/metrics` — métricas
- `GET /api/raffle/current` — ganador si existe
- `POST /api/raffle/draw` — sortear

---

## Configuración mínima para deploy

En Cloudflare dashboard (o `npx wrangler pages secret put NOMBRE`):

| Secret | Para qué |
|--------|----------|
| `MANAGER_PASSWORD` | Contraseña del dashboard |
| `RESEND_API_KEY` | API key de Resend (resend.com) |

En `wrangler.toml` (ya configurado, solo verifica los valores):

```toml
[vars]
RESEND_FROM = "Gifted Grads <noreply@aainsurances.com>"
ORGANIZER_EMAIL = "info@aainsurances.com"
```

---

## Costo del sistema

**Para un evento de ~200 personas: $0/mes.** Todo cabe en los planes
gratuitos.

### Cloudflare Pages + Pages Functions (free tier)

- Hosting del sitio: **gratis ilimitado** (ancho de banda incluido)
- 500 builds al mes gratis
- 100,000 requests/día gratis para Pages Functions (Workers)
- 200 registros + tráfico del dashboard = ~lejos del límite

### Cloudflare D1 (base de datos, free tier)

- 5 GB almacenamiento gratis
- 5 millones de lecturas/día gratis
- 100,000 escrituras/día gratis
- 200 attendees ≈ <1 MB → cabe miles de veces

### Resend (envío de correos, free tier)

- 3,000 correos/mes gratis
- 100 correos/día gratis
- 200 registros = 200 correos al organizador + 1 correo al ganador ≈
  201 correos totales

### Dominio

- Usando `gifted-grads-events.pages.dev` → **gratis**
- Dominio propio (ej. `giftedgrads.com`) → ~$10–15/año en cualquier
  registrar

### Resumen

| Componente | Plan | Costo |
|------------|------|-------|
| Hosting (Cloudflare Pages) | Free | $0 |
| Functions/Workers | Free | $0 |
| Base de datos (D1) | Free | $0 |
| Correos (Resend) | Free | $0 |
| Subdominio `.pages.dev` | — | $0 |
| **Total mensual** | | **$0** |

Si el evento crece a miles de personas o haces muchos eventos al mes:

- Cloudflare Workers Paid: **$5/mes** (10M requests, sobra todo)
- Resend Pro: **$20/mes** (50,000 correos)
- Sigue siendo muy barato vs. cualquier alternativa (Jotform paid plans
  empiezan en ~$34/mes solo por el formulario).

### Lo único que sí cuesta plata si lo activas

- **Dominio propio** (opcional) — $10–15/año.
- **Email transactional con dominio propio verificado** (recomendado
  para que no caigan en spam) — el dominio cuesta lo de arriba; verificar
  el dominio en Resend es gratis.
