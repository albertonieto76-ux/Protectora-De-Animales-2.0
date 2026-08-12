"# Protectora de Animales 2.0
a. Descripción general del proyecto.

Aplicación full-stack para gestionar una protectora de animales con una experiencia pública para personas interesadas en adopciones, voluntariado, eventos y donaciones, además de un panel administrativo para gestionar los contenidos y operaciones internas.

## Características principales

- Gestión de animales y solicitudes de adopción
- Registro de voluntarios y citas de voluntariado
- Gestión de eventos y donaciones
- Panel de administración con autenticación por email y contraseña


b. Stack tecnológico utilizado

## Tecnologías utilizadas

### Frontend
- React
- Vite
- React Router DOM

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL

c .Información sobre su instalación y ejecución.
1. Clona el repositorio.
2. Instala las dependencias del proyecto raíz:
   ```bash
   npm install
   ```
3. Instala las dependencias del backend:
   ```bash
   npm --prefix backend install
   ```
4. Instala las dependencias del frontend:
   ```bash
   npm --prefix frontend install
   ```
5. Configura las variables de entorno necesarias para el backend, incluyendo la conexión a PostgreSQL 

## Configuración de la base de datos

Genera el cliente de Prisma y aplica el esquema:

```bash
npm run prisma:generate
npm run prisma:push
```

## Ejecución

### Backend
```bash
npm run dev:backend
```

### Frontend
```bash
npm run dev:frontend
```

### Arranque conjunto

En Windows PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-dev.ps1
```

En Linux/macOS:
```bash
bash ./scripts/run-dev.sh
```

## Instalación completa desde cero

En Windows PowerShell, ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-project.ps1
```

En Linux/macOS, ejecuta:

```bash
bash ./scripts/install-project.sh
```

Para una instalación más completa que además crea el administrador inicial, usa el script de configuración completa:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-full-project.ps1
```

```bash
bash ./scripts/setup-full-project.sh
```

Ambos scripts de configuración completa instalan dependencias, crean el archivo .env si no existe, generan el cliente de Prisma, aplican el esquema de la base de datos y crean un administrador inicial.

d. Estructura del proyecto.

## Estructura del proyecto

- frontend/: interfaz de usuario
- backend/: API REST y lógica de negocio
- backend/prisma/: esquema de base de datos y migraciones
- docs/: documentación técnica del proyecto
- docker/: configuración para ejecución con contenedores

## Requisitos previos

- Node.js 18 o superior
- npm
- PostgreSQL disponible

e. Funcionalidades principales

- Pantalla principal:
Se presentan los 10 animales que más tiempo llevan en el refugio.
Botones superiores:
  - Adopta un amigo: Para seleccionar el tipo de animal que quieres adoptar.
  - Eventos: Para ver todos los eventos que organiza la asociación.
  - Donar: Para hacer una donación puntual o elegir en qué se invierte el dinero.
  - Ser voluntario: Seleccionando por los botones cuándo puedes aportar tu tiempo a la asociación.
- Administracion: http://localhost:5173/admin/
  - Dashboard para visualizar cómo va el progreso de voluntarios, animales, donaciones y adopciones.
  - Gestión de Animales: para alta/baja/modificación de animales. Al seleccionar se ven las fotos en miniatura y se pueden subir hasta 10 fotos.
  - Solicitudes de Adopción: Calendario para las entrevistas personales a los adoptantes. En el lateral se cargan todas las entrevistas del mes.
  - Gestión de Voluntarios: Calendario donde se va anotando por voluntario su participación en el refugio.
  - Gestión de Eventos: Alta/Baja de eventos insertando hasta 10 fotos.
  - Registro de Donaciones: Tiene 2 partes:
    - Registro de las donaciones hechas
    - Ata/baja/modificación del tipo de donación
  - Seguridad: registro del acceso como administrador por fechas

f. Usuario y contraseña de prueba
Para la página de administración:
http://localhost:5173/admin/
Email: admin@protectora.com
Contraseña: admin1234


## Documentación

- [docs/arquitectura.md](docs/arquitectura.md)
- [docs/endpoints.md](docs/endpoints.md)
- [docs/modelos.md](docs/modelos.md)
- [docs/despliegue.md](docs/despliegue.md)
- [docs/seed-data.md](docs/seed-data.md)

## Scripts útiles

- Backend:
  - `npm --prefix backend run dev`
  - `npm --prefix backend run test`
  - `npm --prefix backend run test:integration`
- Frontend:
  - `npm --prefix frontend run build`
  - `npm --prefix frontend run dev`

## Docker

La carpeta `docker/` incluye una configuración con 3 contenedores:

- `db`: PostgreSQL 16
- `backend`: API Express + Prisma en el puerto `4000`
- `frontend`: Vite + React en el puerto `5173`

Para levantar el entorno completo:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Para detenerlo:

```bash
docker compose -f docker/docker-compose.yml down
```

Notas:

- El backend usa la base de datos Docker mediante `DATABASE_URL=postgresql://postgres:postgres@db:5432/protectora?schema=public`.
- El frontend publica `http://localhost:5173` y redirige `/api`, `/uploads` y `/seed-assets` al contenedor `backend`.
- Al arrancar, el backend ejecuta `prisma generate` y `prisma migrate deploy` antes de iniciar el servidor.

## Notas de desarrollo

- La API del backend queda expuesta bajo el prefijo `/api`.
- El acceso administrativo depende de las credenciales de administrador configuradas en la base de datos.
- Para trabajar con imágenes y archivos subidos, el servidor expone la carpeta `uploads`.
" 
