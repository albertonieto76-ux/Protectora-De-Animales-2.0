# Arquitectura del proyecto

## Visión general
Protectora Web 2 es una aplicación full-stack para la gestión de una protectora de animales con una experiencia pública para usuarios y un panel administrativo para gestión interna.

## Componentes principales

### Frontend
- Framework: React + Vite
- Ruta principal: aplicación de páginas públicas y administración
- Funcionalidades visibles: adopciones, voluntariado, eventos, donaciones y login de administrador

### Backend
- Runtime: Node.js + Express + TypeScript
- API REST bajo el prefijo /api
- Autenticación administrativa con email y contraseña
- Integración con Prisma y PostgreSQL

### Base de datos
- ORM: Prisma
- Esquema central: animales, solicitudes de adopción, voluntarios, eventos, donaciones, tipos de pago, usuarios y logs de auditoría

## Estructura de carpetas
- frontend/: interfaz de usuario
- backend/: API y servicios del servidor
- backend/prisma/: esquema, migraciones y configuración de Prisma
- docs/: documentación técnica
- docker/: configuración para ejecución en contenedores

## Flujo de funcionamiento
1. El frontend envía peticiones al backend a través de /api.
2. El backend valida permisos, autenticación y seguridad.
3. Prisma conecta con PostgreSQL y devuelve los datos a la API.
4. El frontend renderiza las respuestas en las vistas públicas o de administración.

## Seguridad
- Headers de seguridad en Express
- Rate limiting en login
- Auditoría de acciones críticas
- Validación básica de credenciales y control de acceso para el panel administrativo

## Ejecución recomendada
- Backend: npm --prefix backend run dev
- Frontend: npm --prefix frontend run dev
- Base de datos: usar Prisma y PostgreSQL configurado en el entorno
