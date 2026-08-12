# Seeds y datos iniciales

## Crear administrador inicial

Ejecuta:

```bash
npm --prefix backend exec tsx scripts/seedAdmin.ts
```

Puedes personalizar el usuario y la contraseña con variables de entorno:

```bash
ADMIN_EMAIL=admin@protectora.test ADMIN_PASSWORD=Admin1234! npm --prefix backend exec tsx scripts/seedAdmin.ts
```

## Cargar datos de prueba completos

Ejecuta:

```bash
npm --prefix backend exec tsx scripts/seedLoadTestData.ts
```

Este seed crea:
- animales
- solicitudes de adopción
- voluntarios
- citas de voluntariado
- eventos
- donaciones y tipos de pago
