# Despliegue local

## Opción 1: base de datos con Docker

1. Levanta la base de datos:
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```
2. Asegúrate de que la variable `DATABASE_URL` del archivo `.env` apunte a la base de datos local.

Ejemplo:
```env
DATABASE_URL=postgresql://postgres:postgres825j@localhost:5432/protectora?schema=public
```

## Opción 2: base de datos externa

Si ya tienes PostgreSQL disponible, configura la variable `DATABASE_URL` en el archivo `.env` y ejecuta:

```bash
npm run prisma:generate
npm run prisma:push
```

## Arranque de la aplicación

```bash
npm run dev:backend
npm run dev:frontend
```

## Despliegue en Oracle Cloud

Este despliegue está pensado para una instancia de Oracle Cloud con Ubuntu y un dominio. El proxy Caddy obtiene y renueva automáticamente el certificado HTTPS.

Requisitos de red:

- Apunta un registro DNS `A` del dominio a la IP pública de la instancia.
- Abre los puertos TCP `80` y `443` en la lista de seguridad o NSG de Oracle Cloud.
- Abre también esos puertos en el firewall de Ubuntu si está activo.
- No abras los puertos `4000` ni `5432`.

En la instancia, instala Docker Engine y el complemento Docker Compose. Después clona el repositorio y ejecuta desde su raíz:

```bash
cp .env.example.oracle .env.oracle
nano .env.oracle
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml up -d --build
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml ps
```

`APP_DOMAIN` debe contener solo el dominio, sin `https://`, y `CORS_ORIGINS` debe contener la URL HTTPS completa. Usa contraseñas y secretos nuevos; no conserves los valores de ejemplo.

Para crear o restablecer el administrador:

```bash
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml exec backend npx tsx scripts/seedAdmin.ts
```

Actualización posterior:

```bash
git pull
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml up -d --build
```

Los datos de PostgreSQL, las imágenes subidas y los certificados TLS se guardan en volúmenes Docker. Para consultar logs:

```bash
docker compose --env-file .env.oracle -f docker/docker-compose.oracle.yml logs -f --tail=100
```
