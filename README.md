# Gifted Grads Insurance

> Captura de leads de seguros con formulario propio en React, backend en
> Cloudflare Workers, asignación de número de participante para rifa de
> iPad y dashboard del manager.
>
> **Stack:** React 18 + TypeScript + Vite + TailwindCSS · Cloudflare Pages + Pages Functions + D1 + Resend.
> **API contract:** [`API.md`](./API.md) · **Migrations:** [`migrations/`](./migrations/)

## Inicio rápido

```bash
npm install

# Dev local: usa mock automáticamente si no configuras VITE_API_BASE_URL.
# Password del manager en mock: "admin".
npm run dev
```

Si quieres forzar el backend real desde Vite, define `VITE_USE_MOCK_API=false` y `VITE_API_BASE_URL`.

Compilación de producción: `npm run build` (sale a `dist/`). Tests: `npm test`.

## Estructura

- `src/` — aplicación React (rutas, componentes, hooks, i18n, cliente API).
- `shared/` — tipos y esquemas zod compartidos entre frontend y Workers.
- `functions/` — Cloudflare Pages Functions (handlers + middleware + helpers).
- `migrations/0001_init.sql` — esquema D1.
- `wrangler.toml` — configuración de Cloudflare Pages + binding D1.
- `public/_redirects` — fallback SPA para rutas del cliente.

## Flujo de registro

El formulario de registro (`src/components/RegisterForm.tsx`) envía directo a `POST /api/register` (Cloudflare Pages Function). El handler valida con Zod, asigna el siguiente `participantNumber` atómicamente, guarda en D1, dispara el correo al organizador vía Resend, y responde con el número para mostrarlo en `/confirmacion`. El toggle ES/EN solo cambia la UI alrededor — el endpoint y el flujo son los mismos.

Variables de entorno del worker (`wrangler.toml` para vars + Cloudflare dashboard para secrets):

```toml
[vars]
RESEND_FROM = "Gifted Grads <noreply@aainsurances.com>"
ORGANIZER_EMAIL = "info@aainsurances.com"
```

Para dev local: copia `.dev.vars.example` a `.dev.vars` y rellena los secrets.

## Despliegue en Cloudflare

### 1. Crear la base de datos D1

```bash
npx wrangler d1 create gifted-grads
```

Copia el `database_id` impreso y reemplázalo en `wrangler.toml`.

### 2. Aplicar migraciones

```bash
# Local (para wrangler pages dev)
npx wrangler d1 migrations apply DB --local

# Producción
npx wrangler d1 migrations apply DB --remote
```

### 3. Configurar secretos

```bash
npx wrangler pages secret put MANAGER_PASSWORD
npx wrangler pages secret put RESEND_API_KEY
```

Para desarrollo local, copia `.dev.vars.example` a `.dev.vars` y rellena los valores.

### 4. Desarrollo local contra el Worker real

```bash
npx wrangler pages dev -- npm run dev
```

### 5. Deploy

Conecta el repositorio a Cloudflare Pages:
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Functions directory:** `functions` (autodetectado)
- **Compatibility flags:** `nodejs_compat`

## Variables de entorno

### Frontend (build-time, prefijo `VITE_`)

- `VITE_API_BASE_URL` — vacío para mismo origen (Pages Functions).
- `VITE_USE_MOCK_API` — `"true"` activa el mock in-memory; `"false"` lo desactiva. En `npm run dev`, si no hay `VITE_API_BASE_URL`, el mock se activa automáticamente.

### Worker

| Nombre | Tipo | Notas |
|--------|------|-------|
| `DB` | D1 binding | Definido en `wrangler.toml`. Aplicar `migrations/*.sql`. |
| `MANAGER_PASSWORD` | Secret | Contraseña del manager. |
| `RESEND_API_KEY` | Secret | API key de Resend. |
| `RESEND_FROM` | Var (en `wrangler.toml`) | Remitente verificado en Resend. |
| `ORGANIZER_EMAIL` | Var (en `wrangler.toml`) | `onelio@aaservices.com`. |

---

## Descripción del proyecto

Gifted Grads Events será una aplicación web diseñada para registrar, organizar y administrar la información de las personas que asistirán a un evento. La plataforma tendrá como objetivo facilitar el proceso de inscripción, centralizar los datos de los asistentes, mostrar métricas en tiempo real y automatizar el proceso de una rifa al finalizar el evento.

Se estima que aproximadamente **200 personas** se registrarán en la aplicación.

## Registro de asistentes

La aplicación deberá contar con una sección de registro donde cada persona pueda completar un formulario con su información personal. Este formulario puede incluir datos como:

- Nombre completo
- Correo electrónico
- Número de teléfono
- Género
- Edad
- Institución o universidad
- Carrera o área de estudio
- Nivel académico
- Cualquier otro dato necesario para la organización del evento

Una vez que la persona complete el formulario, el sistema deberá guardar su información de forma segura y confirmar que el registro fue realizado correctamente.

## Asignación de número de participante

Al momento de registrarse, cada persona deberá recibir automáticamente un número único de participante. Este número servirá para identificar al asistente dentro del evento y también será utilizado para una rifa especial que se realizará después del evento.

Por ejemplo, si una persona se registra, el sistema puede asignarle el número `001`, a la siguiente persona el `002`, y así sucesivamente hasta completar todos los registros.

## Envío de información por correo

Cada vez que una persona complete su registro, la información deberá enviarse automáticamente al correo electrónico:

**onelio@aaservices.com**

Este correo deberá incluir los datos principales del asistente, junto con su número único de participante, para que el equipo organizador tenga una copia del registro.

## Panel administrativo para el manager

La aplicación también deberá incluir un panel administrativo para el manager. Desde este panel, el manager podrá ver en tiempo real la información de todas las personas registradas.

El dashboard deberá permitir:

- Ver la lista completa de asistentes registrados
- Revisar la información personal de cada participante
- Ver el número asignado a cada persona
- Buscar asistentes por nombre, correo o número de participante
- Confirmar que una persona se registró correctamente
- Ver el total de personas inscritas
- Monitorear métricas importantes del evento

## Métricas actualizadas en tiempo real

El dashboard del manager deberá mostrar estadísticas que se actualicen automáticamente cada vez que una nueva persona se registre.

Algunas métricas que puede mostrar son:

- Total de personas registradas
- Porcentaje de participantes por género
- Cantidad de hombres y mujeres registrados
- Porcentaje por carrera o área de estudio
- Porcentaje por institución o universidad
- Promedio de edad de los asistentes
- Cantidad de registros completados

Por ejemplo, si el 50% de las personas registradas son mujeres, esa información deberá mostrarse automáticamente en el dashboard. Si luego se registra otra persona, el porcentaje deberá actualizarse en vivo sin necesidad de recargar la página.

## Rifa del iPad

Después del evento, se realizará una rifa entre las personas registradas. Como cada participante tendrá un número único asignado, el sistema deberá permitir seleccionar un número ganador.

La persona que tenga el número ganador recibirá un **iPad** como premio.

El manager deberá poder realizar o registrar la rifa desde el panel administrativo. Una vez seleccionado el número ganador, la aplicación deberá identificar automáticamente a la persona asociada a ese número.

## Notificación al ganador

Cuando se seleccione el número ganador de la rifa, el sistema deberá enviar automáticamente un correo electrónico a la persona ganadora, notificándole que ganó el iPad.

El correo deberá incluir un mensaje de felicitación y la información necesaria para reclamar el premio.

## Objetivo principal de la aplicación

El objetivo principal de Gifted Grads Events es crear una plataforma moderna y eficiente para manejar el registro de asistentes a un evento. La aplicación permitirá recopilar información personal, asignar números únicos de participación, enviar registros por correo, mostrar datos en tiempo real al manager y automatizar el proceso de selección y notificación del ganador de la rifa.

En resumen, la aplicación deberá ayudar al equipo organizador a tener un mejor control del evento, reducir procesos manuales, confirmar registros fácilmente y ofrecer una experiencia más organizada tanto para los asistentes como para el manager.

## Resumen funcional del sistema

Gifted Grads Events deberá incluir dos áreas principales:

### 1. Aplicación para asistentes

En esta parte, los usuarios podrán registrarse llenando un formulario con su información personal. Al completar el registro, recibirán un número único de participante que será utilizado para la rifa del iPad.

### 2. Aplicación o dashboard para el manager

En esta parte, el manager podrá ver todos los registros en tiempo real, revisar la información de los asistentes, consultar métricas actualizadas, buscar participantes y gestionar la rifa del iPad.

## Flujo general de la aplicación

1. El asistente entra a la aplicación web.
2. Completa el formulario con su información personal.
3. El sistema guarda el registro.
4. El sistema asigna automáticamente un número único de participante.
5. La información del asistente se envía al correo `onelio@aaservices.com`.
6. El registro aparece automáticamente en el dashboard del manager.
7. Las métricas del dashboard se actualizan en tiempo real.
8. Después del evento, el manager realiza la rifa.
9. El sistema selecciona o registra el número ganador.
10. La aplicación identifica al ganador.
11. El ganador recibe una notificación por correo electrónico informándole que ganó el iPad.
