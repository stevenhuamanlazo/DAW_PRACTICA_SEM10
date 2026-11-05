# TechParts Admin - API REST de Componentes de PC

API REST y panel web para gestionar el inventario de una tienda de componentes de PC y hardware.
Practica **Semana 10** - Desarrollo de Aplicaciones Web (IS093A) - Universidad Nacional del Centro del Perú.

## Tecnologías

- Node.js (>= 20) y Express 5
- `mysql2/promise` con **pool de conexiones** y consultas preparadas (`execute` con `?`)
- `dotenv` para variables de entorno, `cors`, `nodemon` (desarrollo)
- MySQL / MariaDB (XAMPP)
- Interfaz web en HTML, CSS y JavaScript puro (`public/index.html`)

## Estructura del proyecto

## Instalación y ejecución

1. Clonar el repositorio e instalar dependencias:
   ```bash
   git clone https://github.com/stevenhuamanlazo/DAW_PRACTICA_SEM10.git
   cd DAW_PRACTICA_SEM10
   npm install
   ```
2. Crear el archivo `.env` a partir de `.env.example` y ajustar las credenciales:
3. Iniciar MySQL (XAMPP) e importar `sql/schema.sql` (phpMyAdmin, pestaña Importar).
4. Verificar la conexión: `node src/test-db.js`
5. Iniciar el servidor: `npm run dev` y abrir http://localhost:3000

> El archivo `.env` está en `.gitignore` y **no** se sube al repositorio.
## Modelo de datos (tabla `productos`)

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT, PK, autoincremental | Identificador |
| sku | VARCHAR(30), único | Código del producto |
| nombre | VARCHAR(150) | Nombre comercial |
| categoria | VARCHAR(50) | Procesadores, Tarjetas Gráficas, Placas Madre, Memoria RAM, etc. |
| marca | VARCHAR(80) | Fabricante |
| precio | DECIMAL(10,2) | Precio en soles (S/) |
| stock | INT | Unidades disponibles |
| especificaciones | VARCHAR(255) | Datos técnicos (socket, capacidad, etc.) |
| activo | TINYINT(1) | 1 = visible, 0 = eliminado (eliminación lógica) |
| created_at / updated_at | TIMESTAMP | Auditoría |

## Endpoints

Base URL: `http://localhost:3000/api/productos`. Todas las respuestas son `application/json`.

| Método | Ruta | Propósito | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/productos` | Lista los productos activos. Admite `?categoria=` y `?buscar=` (nombre, marca o SKU) | 200 | 500 |
| GET | `/api/productos/:id` | Obtiene un producto por su id | 200 | 404, 500 |
| POST | `/api/productos` | Crea un producto nuevo | 201 | 400, 409, 500 |
| PUT | `/api/productos/:id` | Actualiza un producto (total o parcial: solo los campos enviados) | 200 | 400, 404, 409, 500 |
| DELETE | `/api/productos/:id` | Elimina un producto (eliminación lógica: `activo = 0`) | 200 | 404, 500 |
### Ejemplo: crear un producto (`POST /api/productos`)

```json
{
  "sku": "CPU-AMD-7600",
  "nombre": "Ryzen 5 7600",
  "categoria": "Procesadores",
  "marca": "AMD",
  "precio": 849,
  "stock": 14,
  "especificaciones": "Socket AM5, 6 núcleos / 12 hilos"
}
```

Respuesta `201 Created`: el producto creado, con su `id`, `activo`, `created_at` y `updated_at`.

### Ejemplo: actualización parcial (`PUT /api/productos/5`)

```json
{ "precio": 799.9, "stock": 20 }
```

### Formato de errores

```json
{ "error": "El stock debe ser un entero mayor o igual a 0" }
```

| Código | Cuándo ocurre |
|---|---|
| 400 | Faltan campos obligatorios, precio o stock inválidos, o JSON mal formado |
| 404 | El producto no existe (o fue eliminado) o la ruta no existe |
| 409 | El SKU ya está registrado |
| 500 | Error interno (por ejemplo, base de datos no disponible). No se envía el stack trace al cliente |

## Seguridad y buenas prácticas

- Credenciales en variables de entorno (`dotenv`); `.env` excluido de Git.
- Consultas preparadas con `execute()` y `?` para prevenir inyección SQL; los nombres de columna de `PUT` salen de una lista blanca.
- Uso exclusivo de `mysql2/promise` con `async/await` (sin callbacks).
- `try/catch` en cada controlador y errores con `res.status(codigo).json({ error })`.

## Pruebas

La API se probó con Thunder Client: GET lista, GET por id (200 y 404), POST (201, 400 y 409), PUT (200), DELETE (200 y 404) y un 500 provocado al detener MySQL.

## Autor

Steven Huamanlazo Pariona - Ingeniería de Sistemas - UNCP

## Demo en linea (GitHub Pages)

Demo estatica de la interfaz, publicada con GitHub Pages desde la carpeta `/docs`:

**https://stevenhuamanlazo.github.io/DAW_PRACTICA_SEM10/**

> GitHub Pages solo aloja archivos estaticos (no ejecuta Node.js ni MySQL). Por eso la demo
> simula la API REST en el navegador (`docs/demo-api.js`) con los datos reales exportados de la
> base de datos (`docs/demo-data.json`). Los cambios hechos en la demo no se guardan.
> La version completa (Express + MySQL) se ejecuta en local con `npm run dev`.

### Como se publico

1. Se copio la interfaz de `public/` a `docs/` y se agrego `docs/demo-api.js` (API simulada).
2. En GitHub: Settings -> Pages -> Source: Deploy from a branch -> Branch `main` y carpeta `/docs`.
3. GitHub genera la URL publica de arriba en 1 o 2 minutos.