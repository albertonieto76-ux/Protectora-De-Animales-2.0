## a. Descripción general del proyecto.

Aplicación full-stack para gestionar una protectora de animales con experiencia pública para adopciones, voluntariado, eventos y donaciones, y un panel administrativo para gestionar contenido y operaciones internas.

## b. Stack tecnológico utilizado.

- Frontend: React + Vite
- Backend: Node.js + Express + TypeScript
- Base de datos: PostgreSQL + Prisma
- Contenedores: Docker Compose

## Requisitos

- Node.js 22+
- npm 10+
- PostgreSQL 16+ disponible localmente o con Docker
- Docker Desktop activo si vas a usar contenedores
- Git


## c. Información sobre su instalación y ejecución.

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto a partir del ejemplo:

```bash
copy .env.example .env
```

Contenido mínimo recomendado:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/protectora?schema=public
JWT_SECRET=tu_secreto_muy_largo
MFA_ENCRYPTION_KEY=otra_clave_muy_larga
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
VITE_API_URL=http://localhost:4000/api
```

## 1) Instalación para desarrollo con npm

Esta opción sirve para trabajar en local con el backend y el frontend ejecutándose directamente desde Node.

### 1.1. Instalar dependencias

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 1.2. Preparar la base de datos

Asegúrate de que PostgreSQL esté arrancado y que exista la base de datos `protectora`.

```bash
npm --prefix backend exec prisma generate
npm --prefix backend exec prisma db push
```

Si quieres crear el administrador inicial:

```bash
npm --prefix backend exec tsx backend/scripts/seedAdmin.ts
```

Si quieres rellenar la base de datos con datos de prueba (animales, eventos, voluntariado, etc.):

```bash
npm --prefix backend run seed:load-test
```

En Windows PowerShell, usa estas variantes si `npm.ps1` está bloqueado:

```bash
npm.cmd --prefix backend run seed:admin
npm.cmd --prefix backend run seed:load-test
```

Credenciales por defecto:
- Email: `admin@protectora.com`
- Contraseña: `Admin1234!`

Nota: el seed del administrador ahora deja siempre activa esa contraseña por defecto, salvo que pases `ADMIN_PASSWORD`.

## 2) Pruebas automáticas (con todo arriba)

Si quieres lanzar pruebas automáticas mientras backend y frontend siguen levantados para revisar todo en vivo:
3. Terminal 3 (pruebas backend):

```bash
npm --prefix backend run test:unit
npm --prefix backend run test:integration
```

4. Terminal 4 (pruebas frontend):

```bash
npm --prefix frontend run test
```

Si prefieres ejecutar todo en modo no interactivo desde una sola terminal:

```bash
npm --prefix backend run test
npm --prefix frontend run test
```

Para ejecutar también pruebas e2e del backend (más estrictas y con requisitos extra de auth/datos):

```bash
npm --prefix backend run test:e2e
```

## 2) Instalación con Docker

Antes de levantar contenedores, crea el archivo `.env` en la raíz del proyecto:

```bash
copy .env.example .env
```

Ese archivo debe contener al menos estas variables para Docker en producción:

```env
JWT_SECRET=replace-with-a-long-random-secret
MFA_ENCRYPTION_KEY=replace-with-a-long-random-secret
POSTGRES_DB=protectora
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres825j
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
```

```bash
docker compose --env-file .env -f docker/docker-compose.prod.yml up --build -d
```

Si quieres crear el administrador inicial dentro del contenedor backend:

```bash
docker compose --env-file .env -f docker/docker-compose.prod.yml exec backend npx tsx scripts/seedAdmin.ts
```
Ese comando también restablece la contraseña del admin a `Admin1234!`, salvo que definas `ADMIN_PASSWORD`.
Nota: puedes volver a ejecutar el seed del admin para restablecer esa contraseña en cualquier momento.

Si quieres rellenar la base de datos con datos de prueba dentro del contenedor backend:

```bash
docker compose --env-file .env -f docker/docker-compose.prod.yml exec backend npx tsx scripts/seedLoadTestData.ts
```

Para parar:

```bash
docker compose --env-file .env -f docker/docker-compose.prod.yml down
```

URLs:

- Frontend: http://localhost:8080
- Panel admin: http://localhost:8080/admin/login
	Email: `admin@protectora.com`
	Contraseña: `Admin1234!`
Nota: si el administrador ya existe, el seed **no** actualiza su contraseña.

- Backend API: http://localhost:4000/api
- Base de datos: localhost:5432



## Verificación funcional

Se han validado estos puntos con ejecución real:

- Los contenedores `db`, `backend` y `frontend` quedan levantados correctamente en Docker.
- El backend responde en `http://localhost:4000/api` con `200 OK`.
- El frontend queda disponible en `http://localhost:5173` en desarrollo y en `http://localhost:8080` en producción Docker.
- El endpoint `/api/events` responde correctamente tras sincronizar el esquema Prisma con la base de datos.

### 2.1. Tests del backend contra Docker (recomendado en Windows)

Si tienes PostgreSQL local instalado en Windows, `localhost:5432` puede apuntar a tu servicio local en lugar de la BD Docker, y los tests pueden fallar con `P1003`.

Flujo recomendado para ejecutar tests realmente contra Docker:

```bash
docker compose -f docker/docker-compose.yml up -d db backend
docker exec protectora-backend npm install
docker exec protectora-backend npm run test:docker
```

Notas:
- `test:docker:smoke` valida conectividad real del contenedor (health + `/api/events`).
- `test:docker` ejecuta primero smoke y luego la suite normal (`test`).

Comandos de ejecucion (resumen rapido):

```bash
# 1) Levantar solo BD y backend de desarrollo
docker compose -f docker/docker-compose.yml up -d db backend

# 2) Instalar dependencias dentro del contenedor backend (primera vez o tras cambios)
docker exec protectora-backend npm install

# 3) Smoke rapido de Docker (conectividad real)
docker exec protectora-backend npm run test:docker:smoke

# 4) Suite completa docker-friendly (smoke + unit + integration)
docker exec protectora-backend npm run test:docker
```

Equivalencias:
- `test:docker:smoke` -> solo pruebas de conectividad en `src/tests/docker`.
- `test:docker` -> equivale a `test:docker:smoke` + `npm run test`.
- `npm run test` -> `test:unit` + `test:integration`.

## d. Estructura del proyecto.

- `frontend/`: aplicación React
- `backend/`: API Express + Prisma
- `backend/prisma/`: esquema y migraciones de la base de datos
- `docker/`: configuración de Docker
- `docs/`: documentación del proyecto

## TROUBLESHOOTING DE DOCKERS:

## 0) Instalación limpia recomendada

Si vienes de un clon nuevo, o si Docker ya había levantado una base de datos antigua y aparecen errores de Prisma como `P2021`, `P2022` o columnas/tablas que no existen, usa esta secuencia completa.

### 0.1. Instalación limpia con Docker

Este flujo borra los volúmenes de Docker de este proyecto y recrea la base de datos desde cero.

```bash
copy .env.example .env
docker compose --env-file .env -f docker/docker-compose.prod.yml down -v --remove-orphans
docker compose --env-file .env -f docker/docker-compose.prod.yml up --build -d
docker compose --env-file .env -f docker/docker-compose.prod.yml exec backend npx prisma migrate deploy
docker compose --env-file .env -f docker/docker-compose.prod.yml exec backend npx tsx scripts/seedAdmin.ts
docker compose --env-file .env -f docker/docker-compose.prod.yml exec backend npx tsx scripts/seedLoadTestData.ts
```

Qué hace cada paso:
- crea el archivo `.env` si todavía no existe
- elimina contenedores y volúmenes anteriores del proyecto
- reconstruye backend y frontend con la versión correcta de Node
- aplica todas las migraciones de Prisma
- crea el usuario administrador
- carga datos de prueba

Credenciales por defecto del admin:
- Email: `admin@protectora.com`
- Contraseña: `Admin1234!`

URLs tras el arranque:
- Frontend: http://localhost:8080
- Panel admin: http://localhost:8080/admin/login
- Backend API: http://localhost:4000/api

### 0.2. Limpieza rápida sin borrar datos locales de npm

Si el problema está solo en Docker, no hace falta reinstalar dependencias con npm. Normalmente basta con:

```bash
docker compose --env-file .env -f docker/docker-compose.prod.yml down -v --remove-orphans
docker compose --env-file .env -f docker/docker-compose.prod.yml up --build -d
docker compose --env-file .env -f docker/docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Diagnostico rapido (si "esta manana funcionaba")

Si tras un reset el panel admin en `http://localhost:8080/admin/login` falla (por ejemplo, `500` en `POST /api/auth/login`), revisa CORS primero.

Comprobacion minima:

```bash
docker logs protectora-backend-prod --tail 80
```

Si aparece `Origen no permitido por CORS`, usa ambos origenes en `.env`:

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
```

Aplica cambio recreando backend:

```bash
docker compose --env-file .env -f docker/docker-compose.prod.yml up -d --force-recreate backend
```

- La instalación con npm es la recomendada para desarrollo y pruebas locales.
- La instalación con npm también sirve para poner en producción sin Docker.
- La instalación con Docker es una ruta independiente para despliegue incluido y pruebas de entorno.
- En Docker, el backend apunta a la base de datos con host `db`.
- No se deben compartir archivos `.env` ni credenciales reales en repositorios públicos.

## e. Funcionalidades principales.

Es una pagina que tiene 2 partes:
- Administración:
    -   Dashboard general del funcionamiento del día a día
	-	Alta de animales.
	-   Gestión de adopciones.
	-	Gestión de Voluntarios.
	-	Gestión de Donnaciones.
	-	Gestión de Eventos.
	-	Visualización de eventos de la página.
- Acciones de Usuario:ç
	-	Adopciones.
	-	Suscripción a eventos.
	-	Donaciones
	-	Sucripción a voluntariado.

## f. Usuario y contraseña de prueba
   Para la parte de administración de la página:
   Postgres en local:
	Panel admin: http://localhost:5173/admin/login
	Email: `admin@protectora.com`
	Contraseña: `Admin1234!`
   Docker:
    Panel admin: http://localhost:8080/admin/login
	Email: `admin@protectora.com`
	Contraseña: `Admin1234!`

   
