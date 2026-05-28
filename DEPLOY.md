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
  - `JOTFORM_WEBHOOK_SECRET`
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

### Pendiente

- Crear/verificar el dominio `aainsurances.com` en Resend.
- Crear la API key de Resend y subirla como:
  ```bash
  npx wrangler pages secret put RESEND_API_KEY --project-name gifted-grads-events
  ```
- Configurar Jotform `261465857224059`:
  - Redirect:
    ```text
    https://gifted-grads-events.pages.dev/confirmacion?submission={id}
    ```
  - Webhook:
    ```text
    https://gifted-grads-events.pages.dev/api/jotform/webhook/EL_VALOR_DE_JOTFORM_WEBHOOK_SECRET
    ```
- Hacer una submission real desde Jotform para validar el flujo end-to-end y el correo de Resend.
- Opcional: conectar el proyecto Pages al repo GitHub desde Cloudflare Dashboard. El proyecto quedó creado por CLI y aparece como `Git Provider: No`, aunque el deploy manual ya está activo.

> Nota de seguridad: `MANAGER_PASSWORD`, `RESEND_API_KEY` y `JOTFORM_WEBHOOK_SECRET` no deben commitearse en este documento. Están o deben estar guardados como secrets en Cloudflare Pages.

---

Pre-requisitos:

- `node` 22+ y `npm` instalados
- Una cuenta de Cloudflare (gratis sirve), una de Resend y acceso al Jotform `261465857224059`
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

## 3 · Verificar dominio en Resend

1. Entra a [Resend](https://resend.com) → **Domains** → añade y verifica `aainsurances.com` (registros DNS que Resend te da).
2. Si no controlas ese dominio, edita [`wrangler.toml`](./wrangler.toml) y cambia:
   ```toml
   RESEND_FROM     = "Born Gifted <noreply@TU-DOMINIO.com>"
   ORGANIZER_EMAIL = "tu-correo@TU-DOMINIO.com"
   ```
   Commit y push.
3. **API Keys** → crea una key con permisos de envío → guárdala para el paso 5.

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

Genera el secret del webhook:

```bash
openssl rand -hex 32
# copia el output: lo necesitarás en el paso 6
```

Después seteá los tres secrets (te pedirán cada valor por stdin):

```bash
npx wrangler pages secret put MANAGER_PASSWORD       --project-name gifted-grads-events
npx wrangler pages secret put RESEND_API_KEY         --project-name gifted-grads-events
npx wrangler pages secret put JOTFORM_WEBHOOK_SECRET --project-name gifted-grads-events
```

> Si el `--project-name` no coincide, búscalo con `npx wrangler pages project list`.

### Binding D1 en producción

Dashboard → **Pages → gifted-grads-events → Settings → Functions → D1 database bindings**:

- Variable name: `DB`
- D1 database: `gifted-grads`

(También aplícalo a **Preview** si vas a usar deploys de preview.)

Redeploy para tomar los secrets y el binding: dashboard → **Deployments → Retry deployment** (o haz un commit vacío y push).

---

## 6 · Configurar Jotform (form `261465857224059`)

1. **Settings → Thank You Page → Redirect to external link**:
   ```
   https://TU-DOMINIO/confirmacion?submission={id}
   ```
   Jotform sustituye `{id}` por el submission ID real. La página de confirmación hace polling al backend hasta que llegue el webhook.

2. **Settings → Integrations → Webhooks → Add webhook**:
   ```
   https://TU-DOMINIO/api/jotform/webhook/EL-SECRET-DEL-PASO-5
   ```
   (El secret es el valor que generaste con `openssl rand -hex 32` y guardaste como `JOTFORM_WEBHOOK_SECRET`.)

3. **Verificar campos**. El matcher en [`functions/_shared/jotform.ts`](./functions/_shared/jotform.ts) busca por slug:

   | Campo Jotform | Mapea a | Tipo |
   |---|---|---|
   | Name | `nombre` | Full Name / Short Text |
   | Email | `email` | Email |
   | Number | `telefono` | Phone |
   | What type of insurance are you interested in? | `insuranceType` | Dropdown / Radio |

   El dropdown debe devolver uno de: `Auto insurance`, `Home insurance`, `Commercial insurance`, `Renters insurance` (ver `INSURANCE_TYPE_MAP` para los aliases en ES/EN aceptados). Si Jotform usa otros textos, agrégalos al map y haz commit.

4. **Haz una submission de prueba**. Si la confirmación tarda más de 10s o no aparece el número:
   - Dashboard Cloudflare → **Pages → gifted-grads-events → Functions → Real-time logs**
   - Busca la línea con `rawKeys` — son las claves que envió Jotform. Compara contra `FIELD_ALIASES`.

---

## 7 · Smoke test end-to-end

- [ ] `https://TU-DOMINIO/` carga con el background del flyer (`/register-bg.png`)
- [ ] `https://TU-DOMINIO/manager/login` carga con el background gris
- [ ] Submit del Jotform redirige a `/confirmacion?submission=...` y muestra el número de participante en pocos segundos
- [ ] Llega el correo a `info@aainsurances.com` (Resend dashboard → Logs)
- [ ] Login del manager con `MANAGER_PASSWORD` → ve la submission en `/manager`
- [ ] Sorteo de rifa: el ganador recibe el email con su número

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

**Submission no llega a la confirmación** → Webhook mal configurado o secret incorrecto. Revisa **Pages → Functions → Logs** y confirma que la URL coincide con `JOTFORM_WEBHOOK_SECRET`.

**`Resend: domain not verified`** → DNS de Resend pendiente, o `RESEND_FROM` apunta a un dominio que no controlas. Cambia a uno verificado.

**Login del manager devuelve 401** → `MANAGER_PASSWORD` no seteado como secret o redeploy pendiente tras setearlo.

**`Invalid form id`** → El form ID que llegó al webhook no está en `JOTFORM_ALLOWED_FORM_IDS` (`wrangler.toml:25`). Asegúrate de que coincida.

---

## Bloqueador #1

Si sólo lees una cosa: **crea la D1, pega el `database_id` en `wrangler.toml:32` y aplica migraciones**. Sin eso nada funciona en runtime.
