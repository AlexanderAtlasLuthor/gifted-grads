# Setup paso a paso — Gifted Grads Insurance

Guía completa para tener el sitio funcionando en producción desde cero.
Tiempo estimado: **30–45 minutos** la primera vez.

## Lo que vas a necesitar

- Cuenta de Cloudflare (gratis) → [dash.cloudflare.com](https://dash.cloudflare.com)
- Cuenta de Resend (gratis, 3,000 correos/mes) → [resend.com](https://resend.com)
- Node.js 20+ y npm instalados localmente
- (Opcional) Un dominio propio — si no, usas el subdominio gratis `.pages.dev`

## Resumen de pasos

1. [Resend](#1-resend-emails) — sacar API key (5 min)
2. [Cloudflare D1](#2-cloudflare-d1-base-de-datos) — crear DB y aplicar migrations (10 min)
3. [Secrets y vars](#3-secrets-y-variables-de-entorno) — configurar passwords y keys (5 min)
4. [Deploy](#4-deploy-a-cloudflare-pages) — conectar el repo (10 min)
5. [Test end-to-end](#5-prueba-end-to-end) — registrar a alguien y confirmar (5 min)

---

## 1. Resend (emails)

Resend manda los correos: el de "nuevo lead" al organizador, y el de
"ganaste el iPad" al ganador.

### 1.1. Crear cuenta

1. Entra a [resend.com/signup](https://resend.com/signup)
2. Confirma tu email

### 1.2. Verificar un dominio (recomendado)

Esto hace que los correos lleguen de `noreply@tudominio.com` en vez
de `onboarding@resend.dev`, y reduce mucho el riesgo de spam.

**Si tienes dominio propio (ej. `aainsurances.com`):**

1. En Resend → **Domains** → **Add Domain** → escribes `aainsurances.com`
2. Resend te muestra 3 registros DNS para agregar (SPF, DKIM, DMARC)
3. Los copias en el panel DNS de tu registrar (Cloudflare DNS / Namecheap / GoDaddy / etc.)
4. Vuelves a Resend y le das **Verify Domain** — tarda 5–60 minutos
5. Una vez verificado, podés enviar desde cualquier `*@aainsurances.com`

**Si NO tienes dominio propio todavía:** salta este paso y usá
`onboarding@resend.dev` por ahora — funciona pero los correos pueden
caer más fácil en spam. Más adelante compras un dominio (~$10/año) y
vuelves a hacer este paso.

### 1.3. Sacar el API key

1. En Resend → **API Keys** → **Create API Key**
2. Nombre: `gifted-grads-prod` (o el que quieras)
3. Permission: **Sending access** (no necesitas full access)
4. Domain: tu dominio verificado, o "All domains"
5. Copia el key (`re_xxxxxxxxxxxxxxxxxxxxxxxx`) — **solo se muestra una vez**
6. Guárdalo temporalmente en un sitio seguro (lo pegas en Cloudflare en paso 3)

---

## 2. Cloudflare D1 (base de datos)

D1 es la base de datos SQLite serverless de Cloudflare. Acá se guardan
los leads y los ganadores de la rifa.

### 2.1. Instalar wrangler (CLI de Cloudflare)

```bash
npm install -g wrangler
wrangler login   # abre el browser para autorizar
```

### 2.2. Crear la base de datos

```bash
npx wrangler d1 create gifted-grads
```

Te imprime algo así:

```toml
[[d1_databases]]
binding = "DB"
database_name = "gifted-grads"
database_id = "abc123-def456-..."   # ← copia este id
```

### 2.3. Pegar el database_id en `wrangler.toml`

Abrí `wrangler.toml` y reemplazá `REPLACE_WITH_YOUR_D1_DATABASE_ID` con
el id que te dio el comando anterior. Hacé commit + push del cambio.

### 2.4. Aplicar las migrations

```bash
# A producción
npx wrangler d1 migrations apply DB --remote

# (Opcional) Local también, si vas a usar `wrangler pages dev`
npx wrangler d1 migrations apply DB --local
```

Esto crea las tablas `attendees`, `raffle_draws`, índices, etc.

---

## 3. Secrets y variables de entorno

### 3.1. Vars públicos (en `wrangler.toml`)

Editá `wrangler.toml` y ajusta los valores reales:

```toml
[vars]
RESEND_FROM = "Gifted Grads <noreply@aainsurances.com>"
ORGANIZER_EMAIL = "info@aainsurances.com"
```

- `RESEND_FROM`: el "From" que va a aparecer. **Tiene que ser un
  email del dominio que verificaste en Resend.** Si todavía no
  verificaste dominio, usá `onboarding@resend.dev`.
- `ORGANIZER_EMAIL`: a dónde llegan los avisos de nuevos leads. Cambialo
  al correo que de verdad querés que reciba los avisos.

Hacé commit + push del cambio.

### 3.2. Secrets (sensibles — NO van en el repo)

Estos se configuran directo en Cloudflare. Dos opciones:

**Opción A — desde CLI (después de que el proyecto Pages existe):**

```bash
npx wrangler pages secret put MANAGER_PASSWORD
# te pide el valor → escribís la contraseña del dashboard

npx wrangler pages secret put RESEND_API_KEY
# te pide el valor → pegás el re_xxxxx que copiaste de Resend
```

**Opción B — desde el dashboard de Cloudflare:**

Después del paso 4 (deploy), entrás a Cloudflare Pages → tu proyecto →
**Settings → Environment variables → Production** → **Add variable** →
marcás **Encrypt** y agregás:

| Variable | Valor |
|----------|-------|
| `MANAGER_PASSWORD` | la contraseña del dashboard del manager |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxxxxxxxxxx` |

---

## 4. Deploy a Cloudflare Pages

### 4.1. Conectar el repo

1. Cloudflare dashboard → **Workers & Pages** → **Create application**
   → tab **Pages** → **Connect to Git**
2. Autoriza GitHub si es la primera vez
3. Seleccioná el repo `gifted-grads`
4. Branch: `main` (o el que uses para producción)

### 4.2. Build settings

| Campo | Valor |
|-------|-------|
| Framework preset | None (o "Vite" si aparece) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (vacío) |
| Environment variables | `NODE_VERSION` = `20` |

### 4.3. Compatibility flags

Después del primer deploy: **Settings → Functions → Compatibility flags
→ Production** → agregá `nodejs_compat`.

### 4.4. Configurar secrets

Si no los pusiste por CLI en paso 3.2, hacelo ahora desde el dashboard:
**Settings → Environment variables → Production** → agregás
`MANAGER_PASSWORD` y `RESEND_API_KEY` (marcando "Encrypt").

### 4.5. Re-deploy

**Deployments → Retry deployment** (para que tome los secrets y el
compatibility flag).

### 4.6. (Opcional) Custom domain

**Custom domains → Set up a custom domain** → escribís tu dominio.
Cloudflare te da los CNAME a poner en tu DNS (si tu dominio ya está en
Cloudflare DNS, lo configura automáticamente).

Si no querés dominio propio, el sitio queda en
`gifted-grads-events.pages.dev` y funciona igual.

---

## 5. Prueba end-to-end

### 5.1. Test del flujo del lead

1. Entrás a `https://tu-dominio.com/` (o `.pages.dev`)
2. Llená el form con datos de prueba (usá un email tuyo)
3. Click **"Solicitar cotización"**
4. Te redirige a `/confirmacion` con un número (`#001`)
5. Revisá el inbox del `ORGANIZER_EMAIL` → debería estar el correo
   "Nuevo lead de seguro #001 — [tu nombre]"

### 5.2. Test del dashboard

1. Entrás a `https://tu-dominio.com/manager/login`
2. Metes el `MANAGER_PASSWORD`
3. Deberías ver el lead que acabás de crear en la tabla
4. Métricas: total = 1, leads hoy = 1
5. Click en la fila → modal con el detalle

### 5.3. Test de la rifa

1. En el dashboard, sección "Rifa del iPad" → click **"Sortear ganador
   aleatorio"**
2. Como solo hay 1 lead, sale ese
3. Revisá el inbox del email que usaste en el form → debería estar el
   correo "🎉 ¡Ganaste el iPad! — Gifted Grads"

### 5.4. Si algo falla

| Síntoma | Causa probable | Fix |
|---------|----------------|-----|
| Error 500 al submitir | D1 no configurada | Revisar `database_id` en `wrangler.toml` y que las migrations corrieron en `--remote` |
| Lead se guarda pero no llega correo | `RESEND_API_KEY` mal o `RESEND_FROM` no verificado en Resend | Revisar en Resend → Logs |
| Login del manager no funciona | `MANAGER_PASSWORD` no configurado | Volver a paso 3.2 |
| "Functions failed to load" | Falta el compatibility flag | Paso 4.3 + re-deploy |
| Correos al ganador no llegan | Mismo: `RESEND_API_KEY` o dominio sin verificar | Resend → Logs |

Logs de las Functions: Cloudflare Pages → tu proyecto → **Functions → Logs**.
Logs de Resend: dashboard de Resend → **Emails**.

---

## Resumen de lo que cuesta

| Servicio | Plan usado | Costo |
|----------|------------|-------|
| Cloudflare Pages + Functions | Free | $0 |
| Cloudflare D1 | Free | $0 |
| Resend | Free (3K correos/mes) | $0 |
| Subdominio `.pages.dev` | — | $0 |
| Dominio propio (opcional) | — | ~$10/año |
| **Total mensual** | | **$0** |

Ver `FLUJO.md` para el diagrama completo del sistema y dónde vive cada
pieza en el código.
