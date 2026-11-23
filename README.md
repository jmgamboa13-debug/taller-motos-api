# API de turnos para un taller de motos

Taller final de Arquitectura de Software. API REST desarrollada con Node.js y Express, organizada en rutas, controladores y servicios.

## Integrantes del equipo

Grupo 2, martes. Nombres completos y números según el listado oficial incluido en el enunciado, ordenados alfabéticamente por apellido:

| Apellidos | Nombres | Número de lista |
| --- | --- | --- |
| Gamboa Velandia | Jhonatan Mauricio | 4 |
| Gonzalez Echavarria | Jhoan Stiven | 5 |
| Perez Bedoya | Alejandra | 11 |

El primer integrante por apellido es Jhonatan Mauricio Gamboa Velandia. Su número oficial es 4, por lo tanto **N = 4**.

## Caso de negocio

El servicio elegido es un taller de motos que realiza mantenimiento y reparaciones: cambios de aceite, ajustes de frenos y revisiones generales.

La API permite registrar turnos, consultar su información, corregir sus datos y eliminarlos cuando ya no se necesitan. Cada turno identifica al cliente y su teléfono de contacto, la placa de la moto, el servicio solicitado, la fecha y hora, el precio base y si requiere atención prioritaria.

La atención prioritaria tiene un cobro adicional. El total lo calcula el servidor; el cliente no puede asignarlo enviando un campo `totalPagar`.

## Regla de negocio del equipo

```text
N = 4
porcentajeRecargo = N × 2 = 8 %

Si prioritario es true:
  totalPagar = precioBase + (precioBase × 8 / 100)

Si prioritario es false o no se envía:
  totalPagar = precioBase
```

Ejemplos con un precio base de $100.000 COP:

| Prioridad | Precio base | Recargo | Total a pagar |
| --- | ---: | ---: | ---: |
| `true` | $100.000 | $8.000 | $108.000 |
| `false` | $100.000 | $0 | $100.000 |
| No se envía | $100.000 | $0 | $100.000 |

La regla está en `services/turnosService.js`. El total con recargo se redondea a dos decimales. Al actualizar un turno también se vuelve a calcular su total.

## Instalación y ejecución

Requisito: Node.js 22 o superior y npm.

Desde la carpeta del proyecto:

```bash
npm install
npm start
```

La API estará disponible en `http://localhost:3000/api/turnos`.

Para reiniciar automáticamente al modificar el código:

```bash
npm run dev
```

Para utilizar otro puerto en Linux o macOS:

```bash
PORT=3001 npm start
```

Para detener el servidor, presionar `Ctrl+C` en la terminal.

## Arquitectura por capas

```text
taller-motos-api/
├── index.js
├── routes/
│   └── turnosRoutes.js
├── controllers/
│   └── turnosController.js
├── services/
│   └── turnosService.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

| Parte | Responsabilidad |
| --- | --- |
| `index.js` | Inicializa Express, configura middlewares, conecta las rutas y levanta el servidor. |
| `routes/` | Declara los endpoints y los conecta con sus controladores. |
| `controllers/` | Valida la entrada y maneja las solicitudes, respuestas y códigos HTTP. |
| `services/` | Guarda los turnos, asigna identificadores y calcula las tarifas con N. |

Flujo de una creación: solicitud POST → ruta → controlador que valida → servicio que calcula y guarda → controlador que responde con 201.

## Almacenamiento

Los turnos se guardan en un arreglo en memoria dentro del servicio. Al reiniciar el servidor se borran y el contador de identificadores vuelve a empezar en 1. Al iniciar, la lista está vacía.

## Datos de un turno

Los valores monetarios se envían como números en pesos colombianos, sin símbolos ni separadores de miles.

| Campo | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- |
| `cliente` | Texto | Sí | Nombre del cliente. |
| `telefono` | Texto | Sí | Teléfono de contacto; se envía entre comillas. |
| `placa` | Texto | Sí | Placa de la moto; se almacena en mayúsculas. |
| `servicio` | Texto | Sí | Mantenimiento o reparación solicitada. |
| `fecha` | Texto | Sí | Fecha y hora; usar formato ISO, por ejemplo `2026-11-24T09:00:00-05:00`. |
| `precioBase` | Número | Sí | Precio del servicio, finito y mayor que cero. |
| `prioritario` | Booleano | No | `true` aplica recargo y `false` no. Por defecto es `false`. |
| `id` | Número | Lo genera el servidor | Identificador consecutivo. |
| `totalPagar` | Número | Lo calcula el servidor | Precio final según la prioridad. |

Los textos obligatorios no pueden estar vacíos ni contener solo espacios. `prioritario` debe ser un booleano: el texto `"true"` no es válido. Los campos adicionales del cuerpo se ignoran.

## Endpoints

| Método | Ruta | Función | Respuestas |
| --- | --- | --- | --- |
| GET | `/api/turnos` | Listar todos los turnos. | 200 |
| GET | `/api/turnos/:id` | Consultar un turno. | 200, 404 |
| POST | `/api/turnos` | Crear un turno. | 201, 400 |
| PUT | `/api/turnos/:id` | Reemplazar los datos de un turno. | 200, 400, 404 |
| DELETE | `/api/turnos/:id` | Eliminar un turno. | 200, 404 |

GET, GET por id y POST corresponden a los requisitos mínimos. PUT permite corregir la reserva y DELETE permite retirarla.

Para POST y PUT, enviar `Content-Type: application/json`. PUT requiere los mismos campos obligatorios que POST; conserva el id. Si se omite `prioritario` en PUT, queda en `false`.

## Ejemplo exitoso: POST con respuesta 201

Solicitud:

```http
POST http://localhost:3000/api/turnos
Content-Type: application/json
```

```json
{
  "cliente": "Carlos Ruiz",
  "telefono": "3001234567",
  "placa": "ABC12D",
  "servicio": "Cambio de aceite",
  "fecha": "2026-11-24T09:00:00-05:00",
  "precioBase": 100000,
  "prioritario": true
}
```

Respuesta al crear el primer turno después de iniciar el servidor: **201 Created**.

```json
{
  "id": 1,
  "cliente": "Carlos Ruiz",
  "telefono": "3001234567",
  "placa": "ABC12D",
  "servicio": "Cambio de aceite",
  "fecha": "2026-11-24T09:00:00-05:00",
  "precioBase": 100000,
  "prioritario": true,
  "totalPagar": 108000
}
```

Ejemplo de la misma petición desde una terminal:

```bash
curl -i -X POST http://localhost:3000/api/turnos \
  -H 'Content-Type: application/json' \
  -d '{"cliente":"Carlos Ruiz","telefono":"3001234567","placa":"ABC12D","servicio":"Cambio de aceite","fecha":"2026-11-24T09:00:00-05:00","precioBase":100000,"prioritario":true}'
```

## Ejemplo de validación: POST con respuesta 400

Enviar a `POST /api/turnos` el siguiente JSON:

```json
{
  "cliente": "Carlos Ruiz",
  "telefono": "3001234567",
  "placa": "ABC12D",
  "servicio": "Cambio de aceite",
  "fecha": "2026-11-24T09:00:00-05:00",
  "precioBase": 0,
  "prioritario": true
}
```

Respuesta: **400 Bad Request**. El turno no se guarda.

```json
{
  "mensaje": "El campo precioBase debe ser un número mayor que cero."
}
```

También se rechazan campos obligatorios ausentes, tipos incorrectos, fechas ilegibles y JSON mal escrito.

## Consultas, actualización y eliminación

Listar todos los turnos: **200 OK**, con un arreglo JSON. Si no hay registros, devuelve `[]`.

```bash
curl -i http://localhost:3000/api/turnos
```

Consultar un turno existente: **200 OK**, con el objeto del turno.

```bash
curl -i http://localhost:3000/api/turnos/1
```

Consultar un turno que no existe: **404 Not Found**.

```bash
curl -i http://localhost:3000/api/turnos/999999
```

```json
{
  "mensaje": "Turno no encontrado."
}
```

Actualizar un turno existente: **200 OK**, con sus datos completos y el total recalculado. Este ejemplo deja el total en 80000.

```bash
curl -i -X PUT http://localhost:3000/api/turnos/1 \
  -H 'Content-Type: application/json' \
  -d '{"cliente":"Carlos Ruiz","telefono":"3001234567","placa":"ABC12D","servicio":"Revisión de frenos","fecha":"2026-11-24T11:00:00-05:00","precioBase":80000,"prioritario":false}'
```

Eliminar un turno existente: **200 OK**.

```bash
curl -i -X DELETE http://localhost:3000/api/turnos/1
```

```json
{
  "mensaje": "Turno eliminado correctamente."
}
```

Si se consulta, actualiza o elimina un id inexistente, la respuesta es 404. Si PUT recibe datos inválidos para un turno existente, responde 400 y conserva la información anterior.

## Cómo probar

### Colección de Postman

La colección **Taller de Motos - API de Turnos** está creada en **Jhonatan Gamboa's Workspace**: [abrir en Postman](https://jhonatan-gamboa-2386115.postman.co/workspace/Jhonatan-Gamboa's-Workspace~2557c92b-8fcd-4c20-8bdd-47316dd24fc8/collection/49502335-0cd7571e-8b7d-4d7e-a16f-38bf5a3d6972).

Incluye 19 solicitudes con los cinco endpoints y 27 ejemplos guardados de respuestas reales. Está organizada en cuatro carpetas:

1. **Recorrido completo:** crear un turno prioritario, listar, consultar, actualizar, eliminar y consultar el turno eliminado.
2. **Turnos sin recargo:** crear con `prioritario: false` y omitiendo el campo.
3. **Validaciones:** campos ausentes, precios inválidos, tipos incorrectos, fecha ilegible, JSON mal escrito y actualización inválida.
4. **Turnos inexistentes:** GET, PUT y DELETE con respuesta 404.

Para usarla, abrir el enlace de la colección e iniciar la API con `npm start`. Después de crear un turno, copiar el `id` de la respuesta a la variable correspondiente (`turnoId`, `turnoNormalId` o `turnoSinPrioridadId`) para consultar, actualizar o eliminar ese registro.

También se pueden ejecutar las carpetas en orden con el servidor recién iniciado: los identificadores iniciales son 1, 2 y 3. Al repetir el recorrido, reiniciar el servidor o actualizar las variables con los nuevos identificadores.

La variable de colección `baseUrl` tiene el valor `http://localhost:3000`. Si se usa otro puerto, cambiarla en la pestaña **Variables** de la colección. No es necesario crear un entorno adicional. Para probar localhost desde Postman web, usar el Desktop Agent; también se puede utilizar Postman de escritorio.

Los ejemplos se pueden abrir desde cada solicitud sin ejecutar el servidor. La colección no contiene scripts de pruebas ni otros scripts automáticos. El recorrido completo crea y elimina su propio turno; los dos turnos normales quedan registrados para practicar. Los casos inválidos muestran respuestas 400 o 404 de forma intencional.

## Guion para la sustentación

1. Explicar el negocio del taller y los datos de un turno.
2. Mostrar los integrantes, sus números oficiales y por qué N es 4.
3. Ejecutar `npm start` y listar los turnos: 200.
4. Crear un turno prioritario de 100000: 201 y total 108000.
5. Crear un turno sin prioridad: el total coincide con el precio base.
6. Consultar un id existente: 200.
7. Enviar un precio igual a cero: 400 y mensaje JSON.
8. Consultar un id inexistente: 404.
9. Mostrar PUT y DELETE.
10. Recorrer las capas y explicar dónde se valida, dónde se calcula y dónde se responde.

Todos los integrantes deben poder ejecutar y explicar cualquier parte del proyecto.

## Entrega

Publicar el código en un repositorio público de GitHub y entregar su enlace en la plataforma institucional. Incluir `package.json`, `package-lock.json` y este README. La carpeta `node_modules` está excluida mediante `.gitignore`; las dependencias se instalan con `npm install`.

## Referencias técnicas

- [Rutas en Express](https://expressjs.com/en/starter/basic-routing/).
- [Referencia de Express](https://expressjs.com/en/api/).
- [Postman Desktop Agent para solicitudes locales](https://learning.postman.com/docs/getting-started/basics/about-postman-agent).
