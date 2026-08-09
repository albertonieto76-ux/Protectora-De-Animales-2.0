# OWASP_MODIFICACIONES_2026

Este documento resume las modificaciones de seguridad aplicadas al proyecto para endurecer el acceso de administración y aproximarlo a buenas prácticas OWASP (Top 10 + ASVS).

## 1. Autenticación y Sesión Admin

### 1.1 Login endurecido
- Validación estricta de email y contraseña en backend.
- Mensajes de error genéricos para evitar enumeración de usuarios.
- Hash de contraseñas con bcrypt (12 rondas para altas de admin).

Archivos:
- backend/src/controllers/auth.controller.ts
- backend/src/controllers/register.controller.ts

### 1.2 JWT robusto
- Firma con HS256 explícita.
- Verificación con `issuer`, `audience` y algoritmo permitido.
- Duración limitada de sesión.

Archivos:
- backend/src/controllers/auth.controller.ts
- backend/src/admin/middleware/adminAuth.ts

### 1.3 Cookies seguras
- `admin_token` con `HttpOnly`, `SameSite`, `Secure` en producción.
- Expiración definida.
- Borrado explícito de cookies en logout.

Archivos:
- backend/src/controllers/auth.controller.ts

## 2. MFA (Segundo Factor) para Admin

### 2.1 Flujo MFA TOTP implementado
- Setup de secreto TOTP y URL `otpauth://`.
- Activación MFA validando código de 6 dígitos.
- Verificación MFA en login (2 pasos cuando está activo).
- Posibilidad de desactivación MFA validando código.
- Recovery codes de un solo uso para contingencia.
- Regeneración controlada de recovery codes.

### 2.2 Secretos MFA protegidos
- Secreto MFA cifrado con AES-256-GCM antes de persistir.
- Campos dedicados en BBDD para MFA activo y secreto temporal.

Archivos:
- backend/prisma/schema.prisma
- backend/src/controllers/auth.controller.ts
- backend/src/utils/mfaTotp.ts
- backend/src/utils/mfaCrypto.ts
- backend/src/routes/auth.routes.ts
- frontend/src/admin/pages/AdminLogin.jsx
- frontend/src/admin/pages/AdminSecurity.tsx

## 3. Protección CSRF

### 3.1 Double Submit Cookie
- Emisión de `csrf_token`.
- Validación de `X-CSRF-Token` en métodos mutantes con sesión admin.
- Frontend actualizado para enviar el header automáticamente.

Archivos:
- backend/src/middleware/httpSecurity.ts
- backend/src/controllers/auth.controller.ts
- frontend/src/api.js
- frontend/src/admin/pages/AdminLogin.jsx
- frontend/src/admin/layout/Navbar.tsx

## 4. Rate Limiting y Bloqueo de Fuerza Bruta

- Límite de intentos de login por IP con ventana temporal.
- Bloqueo temporal al superar umbral.
- `Retry-After` en respuestas bloqueadas.

Archivos:
- backend/src/middleware/authRateLimit.ts
- backend/src/routes/auth.routes.ts

## 5. Auditoría de Seguridad en BBDD

### 5.1 Registro persistente de eventos
- Nuevo modelo `SecurityAuditLog`.
- Registro de eventos de autenticación:
  - login éxito/fallo
  - MFA requerido
  - MFA verificado/fallido
  - logout
  - errores relevantes

### 5.2 Trazabilidad de acciones críticas
- Middleware de auditoría para mutaciones críticas administrativas.
- Registro de acción, éxito/fracaso, status HTTP, ruta, método, IP y user agent.

### 5.3 Visualización en panel admin
- Nueva vista de seguridad en admin con logs recientes de auditoría.
- Endpoint protegido para consultar eventos de seguridad.

Archivos:
- backend/prisma/schema.prisma
- backend/src/services/securityAudit.service.ts
- backend/src/middleware/criticalActionAudit.ts
- backend/src/routes/animals.routes.ts
- backend/src/routes/events.routes.ts
- backend/src/routes/paymentTypes.routes.ts
- backend/src/routes/adoption.routes.ts
- backend/src/routes/donations.routes.ts
- backend/src/routes/volunteers.routes.ts
- backend/src/controllers/admin.controller.ts
- backend/src/routes/admin.routes.ts
- frontend/src/admin/pages/AdminSecurity.tsx

## 6. Hardening HTTP y CORS

- CORS restringido por allowlist (`CORS_ORIGINS`).
- Cabeceras de seguridad:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy` restrictiva
  - `Content-Security-Policy` para API
  - `Strict-Transport-Security` en producción
- Límite de payload JSON.

Archivos:
- backend/src/middleware/httpSecurity.ts
- backend/src/app.ts

## 7. Registro de Admin Endurecido

- Endpoint de bootstrap admin protegido por clave (`x-admin-bootstrap-key`).
- Política de contraseña fuerte para alta.
- Restricción para impedir múltiples admins por endpoint público de bootstrap.

Archivos:
- backend/src/controllers/register.controller.ts

## 8. Estado Checklist OWASP (resumen)

### Implementado
- Control de autenticación robusta (parcial ASVS V2).
- MFA para cuentas administrativas.
- Recovery codes MFA de un solo uso.
- Protección CSRF en operaciones autenticadas por cookie.
- Mitigación de fuerza bruta (rate limit + lockout).
- Logging y trazabilidad de eventos de seguridad.
- Endurecimiento de cabeceras y CORS.

### Parcial / Recomendado siguiente fase
- Gestión avanzada de pérdida de dispositivo y proceso de recuperación fuera de banda.
- Rotación/revocación centralizada de sesiones/JWT (deny-list/refresh tokens).
- Gestión avanzada de secretos (HSM/KMS/Vault en producción).
- SIEM y alertas en tiempo real sobre eventos críticos.
- Pruebas automáticas de seguridad (SAST/DAST/dependencias) en CI/CD.

## 9. Variables de entorno necesarias

- `JWT_SECRET` (obligatoria, alta entropía)
- `CORS_ORIGINS` (lista separada por comas)
- `ADMIN_BOOTSTRAP_KEY` (obligatoria para bootstrap admin)
- `MFA_ENCRYPTION_KEY` (recomendada, alta entropía)

Plantilla incluida:
- .env.example

## 10. Nota de cumplimiento

Se han aplicado controles técnicos relevantes alineados con OWASP. El cumplimiento formal completo requiere además:
- threat modeling
- pruebas de intrusión
- hardening de infraestructura
- gobierno de secretos
- evidencia operativa continua
