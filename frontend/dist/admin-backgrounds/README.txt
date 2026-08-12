Rutas de fondos del Dashboard Admin

1) Fondo principal del dashboard:
   /admin-backgrounds/dashboard-main.jpg

2) Fondo del bloque superior (hero):
   /admin-backgrounds/dashboard-hero.jpg

Como cambiar las fotos:
- Sustituye esos dos archivos por tus imagenes manteniendo exactamente los mismos nombres.
- Si prefieres otros nombres o formatos (png, webp), cambia las variables en:
  frontend/src/admin/pages/dashboard.module.css
  Variables:
  --admin-dashboard-bg
  --admin-dashboard-hero-bg
