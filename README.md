# Protectora de Animales 2.0

Aplicación full-stack para gestionar una protectora de animales con experiencia pública para adopciones, voluntariado, eventos y donaciones, y un panel administrativo para gestionar contenido y operaciones internas.

## Stack

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
CORS_ORIGINS=http://localhost:5173
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

En Windows PowerShell, usa esta variante para evitar bloqueos de `npm.ps1`:

```bash
npm.cmd run seed:admin
```

Credenciales por defecto:
- Email: `admin@protectora.com`
- Contraseña: `Admin1234!`

Nota: si el administrador ya existe, el seed **no** actualiza su contraseña.

### 1.3. Arrancar backend y frontend

Desde la raíz del proyecto:

```bash
npm run dev:backend
```

En otra terminal:

```bash
npm run dev:frontend
```

URLs:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Panel admin: http://localhost:5173/admin/login

---

## 2) Instalación para producción con npm

Esta opción es para desplegar la app sin Docker, usando Node para el backend y un servidor estático para el frontend compilado.

### 2.1. Instalar dependencias

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2.2. Preparar entorno de producción

Crea un `.env` con valores de producción, por ejemplo:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/protectora?schema=public
JWT_SECRET=un_secreto_largo_y_seguro
MFA_ENCRYPTION_KEY=otra_clave_larga_y_segura
CORS_ORIGINS=http://localhost:4173
VITE_API_URL=http://localhost:4000/api
```

### 2.3. Generar schema de Prisma y aplicar migraciones

```bash
npm --prefix backend exec prisma generate
npm --prefix backend exec prisma migrate deploy
```

### 2.4. Arrancar el backend en producción

```bash
NODE_ENV=production PORT=4000 JWT_SECRET=tu_secreto MFA_ENCRYPTION_KEY=tu_clave CORS_ORIGINS=http://localhost:4173 npm --prefix backend exec tsx src/server.ts
```

### 2.5. Compilar y servir el frontend

```bash
npm --prefix frontend run build
npm --prefix frontend run preview -- --host 0.0.0.0 --port 4173
```

Esto genera el build estático en `frontend/dist` y lo sirve con Vite Preview.

> Si necesitas una puesta en producción real, lo recomendable es servir ese build con Nginx o Apache, pero la secuencia anterior es la válida para una ejecución con npm sin Docker.

URLs esperadas:
- Frontend: http://localhost:4173
- Backend API: http://localhost:4000/api

---

## 3) Instalación con Docker

Hay dos configuraciones disponibles: desarrollo y producción.

### 3.1. Desarrollo con Docker

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

Para parar:

```bash
docker compose -f docker/docker-compose.yml down
```

URLs:
- Frontend: http://localhost:5173
- Panel admin: http://localhost:5173/admin/login
	Email: `admin@protectora.com`
	Contraseña: `Admin1234!`
Nota: si el administrador ya existe, el seed **no** actualiza su contraseña.

- Backend API: http://localhost:4000/api
- Base de datos: localhost:5432

### 3.2. Producción con Docker

```bash
docker compose --env-file .env -f docker/docker-compose.prod.yml up --build -d
```

Para parar:

```bash
docker compose --env-file .env -f docker/docker-compose.prod.yml down
```

URLs esperadas:
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000/api

---

## Verificación funcional

Se han validado estos puntos con ejecución real:

- Los contenedores `db`, `backend` y `frontend` quedan levantados correctamente en Docker.
- El backend responde en `http://localhost:4000/api` con `200 OK`.
- El frontend queda disponible en `http://localhost:5173` en desarrollo y en `http://localhost:8080` en producción Docker.
- El endpoint `/api/events` responde correctamente tras sincronizar el esquema Prisma con la base de datos.

## Estructura principal

- `frontend/`: aplicación React
- `backend/`: API Express + Prisma
- `backend/prisma/`: esquema y migraciones de la base de datos
- `docker/`: configuración de Docker
- `docs/`: documentación del proyecto

## Panel administrativo

Acceso:

```text
http://localhost:5173/admin/login
```

## Notas

- La instalación con npm es la recomendada para desarrollo y pruebas locales.
- La instalación con npm también sirve para poner en producción sin Docker.
- La instalación con Docker es una ruta independiente para despliegue incluido y pruebas de entorno.
- En Docker, el backend apunta a la base de datos con host `db`.
- No se deben compartir archivos `.env` ni credenciales reales en repositorios públicos.

