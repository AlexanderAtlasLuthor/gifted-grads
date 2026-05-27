# Gifted Grads Events

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
