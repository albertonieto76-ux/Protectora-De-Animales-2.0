# Endpoints principales

## API base
La API del backend está disponible bajo el prefijo /api.

## Endpoints públicos

### Animales
- GET /api/animals: listar animales
- GET /api/animals/:id: consultar un animal

### Adopciones
- GET /api/adoptions: listar solicitudes de adopción
- POST /api/adoptions: crear una solicitud de adopción
- GET /api/adoptions/:id: consultar una solicitud
- PUT /api/adoptions/:id: actualizar una solicitud
- DELETE /api/adoptions/:id: eliminar una solicitud

### Voluntarios
- GET /api/volunteers: listar voluntarios
- POST /api/volunteers: crear un voluntario
- GET /api/volunteers/:id: consultar uno
- PUT /api/volunteers/:id: actualizar uno
- DELETE /api/volunteers/:id: eliminar uno

### Eventos
- GET /api/events: listar eventos
- POST /api/events: crear un evento
- GET /api/events/:id: consultar un evento
- PUT /api/events/:id: actualizar un evento
- DELETE /api/events/:id: eliminar un evento

### Donaciones
- GET /api/donations: listar donaciones
- POST /api/donations: crear una donación

### Tipos de pago
- GET /api/payment-types: listar tipos de pago

## Endpoints de autenticación
- POST /api/auth/login: iniciar sesión de administrador
- POST /api/auth/logout: cerrar sesión
- GET /api/auth/me: consultar información del usuario autenticado

## Endpoints de administración
- GET /api/admin/dashboard: obtener datos del dashboard
- POST /api/auth/mfa/setup: preparar configuración MFA
- POST /api/auth/mfa/enable: activar MFA
- POST /api/auth/mfa/disable: desactivar MFA
- POST /api/auth/mfa/recovery/regenerate: regenerar recovery codes
