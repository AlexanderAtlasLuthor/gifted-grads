# Despliegue a producción · Born Gifted

Runbook para llevar la app a producción en Cloudflare. Ejecutar los pasos **en orden**.

## Estado actual del deploy

Última actualización: 2026-05-28.

### Hecho

- Rama local `main` sincronizada con remoto.
- Dependencias verificadas con `npm install`.
- Build de producción verificada con `npm run build`.
- Login de Wrangler completado.
- D1 creada:
  - Nombre: `gifted-grads`
  - Binding esperado por la app: `DB`
  - `database_id`: `1f16d1ab-b12f-4f1a-98af-4bfef669537d`
- [`wrangler.toml`](./wrangler.toml) actualizado con el `database_id` real.
- Migraciones remotas aplicadas con:
  ```bash
  npx wrangler d1 migrations apply DB --remote
  ```
- Verificación de migraciones: `npx wrangler d1 migrations list DB --remote` devuelve `No migrations to apply`.
- Tablas verificadas en D1 remota:
  - `attendees`
  - `manager_sessions`
  - `raffle_draws`
  - internas de Cloudflare/SQLite: `_cf_KV`, `d1_migrations`, `sqlite_sequence`
- Proyecto Cloudflare Pages creado:
  - Project name: `gifted-grads-events`
  - URL principal: `https://gifted-grads-events.pages.dev`
  - Production branch configurada: `main`
  - Compatibility date: `2025-01-01`
  - Compatibility flag: `nodejs_compat`
- Secrets de Pages creados en producción:
  - `MANAGER_PASSWORD`
- Jotform eliminado el 2026-05-28:
  - Form ahora es `src/components/RegisterForm.tsx` (nativo, sin iframe).
  - Submisiones van directo a `POST /api/register` (D1 + Resend).
  - Backend de Jotform (webhook, parser, registration/by-submission) eliminado.
- Resend pendiente de configurar (siguiente paso):
  - Falta verificar dominio en Resend.
  - Falta setear `RESEND_API_KEY` como secret en Cloudflare.
  - `RESEND_FROM` y `ORGANIZER_EMAIL` ya están en `wrangler.toml` y se aplican en el próximo deploy.
- Deploy inicial hecho por Wrangler:
  ```bash
  npx wrangler pages deploy dist --project-name gifted-grads-events --branch main --commit-dirty=true
  ```
- Smoke tests hechos:
  - `https://gifted-grads-events.pages.dev/` responde `200`.
  - `https://gifted-grads-events.pages.dev/api/metrics` sin token responde `401`, no `500`.
  - Login manager responde `200`.
  - `/api/metrics` con token responde métricas desde D1.
- Tests locales verificados:
  ```bash
  npm run test
  ```
  Resultado: 8 archivos de test, 48 tests pasando.
- Cambios commiteados y pusheados a `main`:
  - Commit: `9ea278e chore: configure production deploy`

### Ajuste técnico hecho durante el deploy

El deploy directo de Pages fallaba porque las Functions importaban `@shared/*`.
Vite y TypeScript sí resolvían ese alias, pero el bundler de Cloudflare Pages Functions no.
Se cambiaron sólo los imports dentro de `functions/` a rutas relativas (`../../shared/...`, `../../../shared/...`) para que futuros deploys de Pages compilen correctamente.

### Plan en curso: form nativo + Resend

1. Eliminar Jotform por completo (form nativo en React, sin iframe).
2. Submisiones directas a `/api/register` (D1 + Resend).
3. Configurar Resend para notificaciones al organizador y al ganador de la rifa.
4. Mantener Cloudflare/D1 como fuente de datos para confirmación, manager, métricas y rifa.

Estado actual: form nativo ya en código (esta PR). Resend pendiente de configurar como secret en Cloudflare.

### Pendiente para ir 100% funcional

- Verificar el dominio en Resend (o usar `onboarding@resend.dev` como remitente temporal).
- Setear `RESEND_API_KEY` como secret en Cloudflare Pages:
  ```bash
  npx wrangler pages secret put RESEND_API_KEY --project-name gifted-grads-events
  ```
- Confirmar que `RESEND_FROM` y `ORGANIZER_EMAIL` en `wrangler.toml` apuntan a los valores correctos (el `from` debe ser un correo del dominio verificado en Resend).
- Redesplegar para que las funciones tomen el nuevo secret.
- Smoke test end-to-end: registrar un lead → verificar que llega el correo a `ORGANIZER_EMAIL` y aparece en `/manager`.
- Opcional: conectar el proyecto Pages al repo GitHub desde Cloudflare Dashboard. El proyecto quedó creado por CLI y aparece como `Git Provider: No`, aunque el deploy manual ya está activo.

> Nota de seguridad: `MANAGER_PASSWORD` y `RESEND_API_KEY` no deben commitearse en este documento. Se guardan como secrets en Cloudflare Pages.

---

Pre-requisitos:

- `node` 22+ y `npm` instalados
- Una cuenta de Cloudflare (gratis sirve) y una cuenta de Resend (gratis, 3,000 correos/mes)
- Estar en la raíz del repo (`gifted-grads/`) y con `main` actualizado:

  ```bash
  git checkout main && git pull
  npm install
  ```

- (Sólo una vez) login de Wrangler:

  ```bash
  npx wrangler login
  ```

---

## 1 · Crear la base de datos D1

```bash
npx wrangler d1 create gifted-grads
```

El comando imprime algo así:

```
[[d1_databases]]
binding = "DB"
database_name = "gifted-grads"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copia el `database_id` real y pégalo en [`wrangler.toml:32`](./wrangler.toml) reemplazando `REPLACE_WITH_YOUR_D1_DATABASE_ID`. Después:

```bash
git add wrangler.toml
git commit -m "chore: set production D1 database id"
git push
```

---

## 2 · Aplicar migraciones a la D1

Las 4 migraciones en `migrations/` crean las tablas de aplicación (`attendees`, `raffle_draws`, `manager_sessions`) y los tipos de seguro actuales (`AUTO/HOME/COMMERCIAL/RENTERS`).

```bash
# Producción
npx wrangler d1 migrations apply DB --remote

# (opcional) Local — sólo si usarás `wrangler pages dev`
npx wrangler d1 migrations apply DB --local
```

Verifica:

```bash
npx wrangler d1 migrations list DB --remote
npx wrangler d1 execute DB --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

Debe listar esas tres tablas de aplicación, además de tablas internas de Cloudflare/SQLite como `d1_migrations` y `sqlite_sequence`.

---

## 3 · Configurar Resend (envío de correos)

Resend manda dos correos: el de "nuevo lead" al organizador, y el de "ganaste el iPad" al ganador.

### 3.1 · Crear cuenta y API key

1. Crea cuenta en [resend.com/signup](https://resend.com/signup).
2. **Domains → Add Domain** → escribe el dominio que usarás como remitente (ej. `aainsurances.com`).
3. Resend muestra 3 registros DNS (SPF, DKIM, DMARC). Agrégalos en tu panel DNS (Cloudflare DNS / Namecheap / GoDaddy).
4. Vuelve a Resend → **Verify Domain** (tarda 5–60 minutos).
5. **API Keys → Create API Key**:
   - Nombre: `gifted-grads-prod`
   - Permission: **Sending access**
   - Copia el key (`re_xxxxxxxxxxxxxxxxxxxxxxxx`) — solo se muestra una vez.

> Si todavía no tienes dominio propio, usa `onboarding@resend.dev` como `RESEND_FROM` temporal. Los correos llegan pero pueden caer más fácil en spam. Verifica un dominio cuando lo tengas.

### 3.2 · Verificar las variables en `wrangler.toml`

```toml
[vars]
RESEND_FROM = "Gifted Grads <noreply@aainsurances.com>"
ORGANIZER_EMAIL = "info@aainsurances.com"
```

- `RESEND_FROM`: el "From" que aparece. **Tiene que ser un email del dominio que verificaste en Resend.**
- `ORGANIZER_EMAIL`: a dónde llegan los avisos de nuevos leads.

Si cambias estos valores, haz commit + push para que el siguiente deploy los tome.

---

## 4 · Conectar el repo a Cloudflare Pages

Dashboard de Cloudflare → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.

| Campo | Valor |
|---|---|
| Repositorio | `AlexanderAtlasLuthor/gifted-grads` |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Output directory | `dist` |

Después de crear el proyecto, en **Settings → Functions → Compatibility flags** añade `nodejs_compat` (production **y** preview).

El primer deploy compilará el frontend pero las funciones fallarán en runtime hasta los siguientes pasos. Es normal.

---

## 5 · Configurar secrets y binding D1

### Secrets

Seteá los dos secrets necesarios (te pedirán cada valor por stdin):

```bash
npx wrangler pages secret put MANAGER_PASSWORD --project-name gifted-grads-events
npx wrangler pages secret put RESEND_API_KEY   --project-name gifted-grads-events
```

- `MANAGER_PASSWORD`: la contraseña del dashboard de manager.
- `RESEND_API_KEY`: el key `re_xxxxx` que copiaste en el paso 3.1.

> Si el `--project-name` no coincide, búscalo con `npx wrangler pages project list`.

### Binding D1 en producción

Dashboard → **Pages → gifted-grads-events → Settings → Functions → D1 database bindings**:

- Variable name: `DB`
- D1 database: `gifted-grads`

(También aplícalo a **Preview** si vas a usar deploys de preview.)

Redeploy para tomar los secrets y el binding: dashboard → **Deployments → Retry deployment** (o haz un commit vacío y push).

---

## 6 · Smoke test end-to-end

- [ ] `https://TU-DOMINIO/` carga con el background del flyer (`/register-bg.png`)
- [ ] Llenar el form en la sección `#registration` y hacer submit
- [ ] Redirige a `/confirmacion` y muestra el ticket con el número de participante
- [ ] Llega el correo "Nuevo lead de seguro #N — [nombre]" a `ORGANIZER_EMAIL`
- [ ] Reply al correo va al lead (campo `reply-to` correcto)
- [ ] `https://TU-DOMINIO/manager/login` carga, login con `MANAGER_PASSWORD` funciona
- [ ] Ver la submission en `/manager` → métricas y tabla actualizadas
- [ ] Sorteo de rifa: seleccionar ganador → llega correo "🎉 ¡Ganaste el iPad!" al lead

Healthcheck rápido (sin token, debería responder `401`, no `500`):

```bash
curl -i https://TU-DOMINIO/api/metrics
```

---

## Comandos útiles después del deploy

```bash
# Ver últimas filas registradas
npx wrangler d1 execute DB --remote --command \
  "SELECT participant_number, nombre, email, insurance_type, created_at FROM attendees ORDER BY id DESC LIMIT 10;"

# Contar registros
npx wrangler d1 execute DB --remote --command "SELECT COUNT(*) FROM attendees;"

# Ver el último ganador
npx wrangler d1 execute DB --remote --command \
  "SELECT * FROM raffle_draws ORDER BY id DESC LIMIT 1;"

# Re-aplicar migraciones (idempotente)
npx wrangler d1 migrations apply DB --remote
```

---

## Troubleshooting

**`D1_ERROR: no such table: attendees`** → No corriste las migraciones (paso 2) o el binding `DB` no está apuntando a la D1 correcta.

**Submit del form devuelve 500** → Revisa **Pages → Functions → Logs**. Causa más común: D1 no enlazada al binding `DB`.

**No llegan emails** → Revisa el dashboard de Resend → **Emails**. Si no aparecen ahí, `RESEND_API_KEY` no está seteado o `RESEND_FROM` no está verificado en Resend. Si aparecen como `sent` pero no llegan a la bandeja, revisa spam.

**Login del manager devuelve 401** → `MANAGER_PASSWORD` no seteado como secret o redeploy pendiente tras setearlo.

---

## Bloqueador #1

Si sólo lees una cosa: **crea la D1, pega el `database_id` en `wrangler.toml:32` y aplica migraciones**. Sin eso nada funciona en runtime.
