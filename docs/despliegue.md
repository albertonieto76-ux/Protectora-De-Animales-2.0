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
