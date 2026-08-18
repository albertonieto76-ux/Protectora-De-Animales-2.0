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



## 1) Instalación para desarrollo con npm

Esta opción sirve para trabajar en local con el backend y el frontend ejecutándose directamente desde Node.

Primero crea el `.env` para npm:

```bash
copy .env.example.npm .env
```

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

Crear el administrador inicial:

```bash
npm --prefix backend exec tsx backend/scripts/seedAdmin.ts

Credenciales por defecto:
- Email: `admin@protectora.com`
- Contraseña: `Admin1234!`

Nota: el seed del administrador ahora deja siempre activa esa contraseña por defecto, salvo que pases `ADMIN_PASSWORD`.

```
```bash
# Terminal 1 (backend)
npm --prefix backend run dev

# Terminal 2 (frontend)
npm --prefix frontend run dev
```
## PRUEBAS 

## 1.1) Pruebas automáticas (con todo arriba)

Antes de ejecutar pruebas, levanta backend y frontend en terminales separadas:

Si quieres lanzar pruebas automáticas mientras backend y frontend siguen levantados para revisar todo en vivo:

1. Terminal 3 (pruebas backend):

```bash
npm --prefix backend run test:unit
npm --prefix backend run test:integration
```

2. Terminal 4 (pruebas frontend):

```bash
npm --prefix frontend run test
```

Si prefieres ejecutar todo en modo no interactivo desde una sola terminal:

```bash
npm --prefix backend run test
npm --prefix frontend run test
```

Para ejecutar solo la prueba de backup/exportación de la base de datos con imágenes, usa la invocación directa de Vitest para evitar duplicar `--run`:

```bash
cd backend
npx vitest --config src/vitest.config.ts --run src/tests/integration/admin.backup.test.ts
```

Para ejecutar también pruebas e2e del backend (más estrictas y con requisitos extra de auth/datos):

```bash
npm --prefix backend run test:e2e
```

### Importación de backups: JSON sin comprimir y gzip

El panel de administración acepta los dos formatos de backup siguientes:

1. JSON plano: `protectora-backup.json`
2. GZIP: `protectora-backup.json.gz`

Ejemplos de validación y uso:

```bash
# Caso 1: JSON plano
# 1) Exporta el backup desde el panel admin
# 2) Selecciona el archivo .json en "Importar BBDD"

# Caso 2: JSON comprimido
# 1) Exporta el backup y comprímelo si lo necesitas
gzip -c protectora-backup.json > protectora-backup.json.gz
# 2) Sube el archivo .json.gz desde el panel admin
```

Importante:
- El backend valida el contenido JSON tras descomprimir si el archivo viene en gzip.
- Límite recomendado: JSON sin comprimir hasta 20 MB; JSON comprimido hasta 200 MB.
- Si el tamaño del backup supera ese valor, el navegador puede fallar al importarlo por límites de memoria o carga del archivo.
```

3. Terminal 5 (de carga):

Si quieres rellenar la base de datos con datos de prueba (animales, eventos, voluntariado, etc.) OJO!!! LAS FOTOS SE COGEN DE INTERNET ALEATORIAMENTE, NO SE CORRESPONDE CON LO QUE REPRESENTAN (es solo prueba de carga para comprobar que se puede navegar sobre todas las funcionalidades):

```bash
npm --prefix backend run seed:load-test

```

## 2) Instalación con Docker

Antes de levantar contenedores, crea el archivo `.env` en la raíz del proyecto:

```bash
copy .env.docker.dev .env
```

Ese archivo debe contener al menos estas variables para Docker en producción:

```env
JWT_SECRET=replace-with-a-long-random-secret
MFA_ENCRYPTION_KEY=replace-with-a-long-random-secret
POSTGRES_DB=protectora
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres825j
CORS_ORIGINS=http://localhost:8080
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
Nota: si el administrador ya existe, el seed sí actualiza su contraseña; por defecto queda en `Admin1234!`, salvo que definas `ADMIN_PASSWORD`.

- Backend API mediante el proxy del frontend: http://localhost:8080/api
- Base de datos: localhost:5432

En Docker de producción solo se publica el puerto `8080`. El backend escucha en el puerto `4000` únicamente dentro de la red interna de Docker.

## DESPLIEGUE DOCKER EN ORACLE CLOUD

El archivo `docker/docker-compose.oracle.yml` permite desplegar la aplicación en una instancia de Oracle Cloud. El despliegue incluye:

- PostgreSQL 16 con almacenamiento persistente.
- Backend Node.js con migraciones Prisma automáticas.
- Frontend React servido por Nginx.
- Caddy como proxy público, con certificado HTTPS automático.
- Persistencia de las imágenes subidas por los usuarios.
- Healthchecks y rotación de logs.
- Base de datos y backend accesibles solo desde la red interna de Docker.

### 1. Preparar la instancia y la red

Se recomienda una instancia de Oracle Linux o Ubuntu con Docker Engine y el complemento Docker Compose instalados. El dominio debe tener un registro DNS `A` apuntando a la IP pública de la instancia.

En la lista de seguridad o NSG de la VCN de Oracle Cloud abre únicamente:

- TCP `22` para SSH, limitado a tu IP siempre que sea posible.
- TCP `80` para la validación y redirección HTTP.
- TCP `443` para la aplicación mediante HTTPS.
- UDP `443` para HTTP/3, opcional pero recomendado.

No abras los puertos `4000` ni `5432`: el backend y PostgreSQL no se publican fuera de Docker.

Si la instancia usa UFW, permite también el tráfico web en el sistema operativo:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
```

### 2. Configurar las variables de producción

Después de clonar el repositorio en la instancia, entra en su directorio y crea el archivo de entorno:

```bash
cp .env.example.oracle .env.oracle
nano .env.oracle
```

Configura al menos estos valores:

```env
APP_DOMAIN=protectora.example.com
CORS_ORIGINS=https://protectora.example.com

POSTGRES_DB=protectora
POSTGRES_USER=postgres
POSTGRES_PASSWORD=una-contrasena-larga-y-aleatoria

JWT_SECRET=un-secreto-largo-y-aleatorio
MFA_ENCRYPTION_KEY=otro-secreto-largo-y-diferente
ADMIN_BOOTSTRAP_KEY=otra-clave-de-inicializacion
```

`APP_DOMAIN` debe contener solo el dominio, sin `http://`, `https://` ni una ruta. `CORS_ORIGINS` debe contener la URL pública HTTPS completa. Puedes generar secretos con:

```bash
openssl rand -hex 32
```

No publiques ni subas `.env.oracle` al repositorio.

### 3. Construir y arrancar la aplicación

```bash
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml up -d --build
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml ps
```

Caddy solicitará automáticamente el certificado TLS cuando el DNS apunte a la instancia y los puertos `80` y `443` sean accesibles. La aplicación quedará disponible en:

- Frontend: `https://protectora.example.com`
- Panel admin: `https://protectora.example.com/admin/login`
- API mediante proxy: `https://protectora.example.com/api`

### 4. Crear el administrador y datos opcionales

Para crear o restablecer el administrador inicial:

```bash
docker compose -f docker/docker-compose.oracle.yml --env-file .env.oracle exec backend npx tsx scripts/seedAdmin.ts

```

Credenciales por defecto, salvo que se configure `ADMIN_PASSWORD`:

- Email: `admin@protectora.com`
- Contraseña: `Admin1234!`

Para cargar datos de demostración opcionales:

```bash
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml exec backend npx tsx scripts/seedLoadTestData.ts
```

### 5. Operación y actualizaciones

Consultar logs y estado:

```bash
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml logs -f --tail=100
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml ps
```

Actualizar la aplicación conservando los datos:

```bash
git pull
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml up -d --build
```

Detener la aplicación sin borrar datos:

```bash
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml down
```

PostgreSQL, las imágenes subidas y los certificados TLS se almacenan en volúmenes Docker. No uses `down -v` en producción, ya que elimina esos volúmenes y puede provocar pérdida de datos.



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
- `test:unit` excluye `src/tests/docker/**`, por lo que no requiere backend escuchando en `localhost:4000`.

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
copy .env.example.docker .env
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
   Para la parte de administración de la página: (desde la parte de admin en la esquina inferior izquierda se sale a la página de presentación)
   Postgres en local:
	Panel admin: http://localhost:5173/admin/login
	Email: `admin@protectora.com`
	Contraseña: `Admin1234!`
   Docker:
    Panel admin: http://localhost:8080/admin/login
	Email: `admin@protectora.com`
	Contraseña: `Admin1234!`
   Oracle cloud:
    Panel admin: http://51.170.48.202/admin/
	Email: `admin@protectora.com`
	Contraseña: `Admin1234!`

   
DOCUMENTACION:
Copia de Seguridad en github: Protectora-De-Animales-2.0/DOCUMENTACION
