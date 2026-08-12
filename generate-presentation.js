const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Proyecto Protectora';
pptx.company = 'Master Programación con IA';
pptx.subject = 'Presentación del proyecto';
pptx.title = 'Protectora de Animales 2.0';

const addTitleSlide = (title, subtitle) => {
  const slide = pptx.addSlide();
  slide.background = { color: 'F7FAFC' };
  slide.addText(title, {
    x: 0.6, y: 1.2, w: 12, h: 1,
    fontSize: 28, bold: true, color: '1F4E79'
  });
  slide.addText(subtitle, {
    x: 0.6, y: 2.2, w: 12, h: 0.8,
    fontSize: 16, color: '4A5568'
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 3.2, w: 12.5, h: 1.8, fill: { color: 'DCEBF7' },
    line: { color: '1F4E79', width: 1 }
  });
  slide.addText('Aplicación web full-stack para gestionar una protectora de animales', {
    x: 1.0, y: 3.7, w: 11.7, h: 0.8,
    fontSize: 18, color: '1F4E79', bold: true
  });
};

addTitleSlide('Protectora de Animales 2.0', 'Proyecto de fin de máster: desarrollo web, gestión y administración');

const slide2 = pptx.addSlide();
slide2.addText('1. ¿Qué ofrece la web?', { x: 0.5, y: 0.3, w: 6, h: 0.5, fontSize: 24, bold: true, color: '1F4E79' });
slide2.addText('• Página pública para mostrar animales disponibles\n• Formularios de adopción para usuarios\n• Registro de voluntarios y disponibilidad\n• Gestión de eventos y donaciones\n• Panel administrativo para gestionar el negocio', {
  x: 0.8, y: 1.0, w: 8.5, h: 3.0, fontSize: 20, color: '2D3748', breakLine: true
});
slide2.addShape(pptx.ShapeType.rect, { x: 9.7, y: 0.9, w: 3.2, h: 2.8, fill: { color: 'E6F3FF' }, line: { color: '1F4E79', width: 1 } });
slide2.addText('Objetivo principal', { x: 10.0, y: 1.2, w: 2.8, h: 0.4, fontSize: 16, bold: true, color: '1F4E79' });
slide2.addText('Facilitar la gestión de una protectora y mejorar la experiencia de los usuarios.', { x: 10.0, y: 1.7, w: 2.7, h: 1.2, fontSize: 13, color: '4A5568' });

const slide3 = pptx.addSlide();
slide3.addText('2. Funcionalidades públicas', { x: 0.5, y: 0.3, w: 7.5, h: 0.5, fontSize: 24, bold: true, color: '1F4E79' });
slide3.addText('• Adopciones: selección de animal y solicitud de adopción\n• Voluntariado: registro de disponibilidad y datos de contacto\n• Donaciones: elección de tipo de aporte y importe\n• Eventos: visualización de actividades y acceso a información\n• Inicio: presentación del proyecto y navegación principal', {
  x: 0.8, y: 1.0, w: 9.5, h: 3.3, fontSize: 19, color: '2D3748', breakLine: true
});

const slide4 = pptx.addSlide();
slide4.addText('3. Panel de administración', { x: 0.5, y: 0.3, w: 7.5, h: 0.5, fontSize: 24, bold: true, color: '1F4E79' });
slide4.addText('• Dashboard con métricas clave\n• Gestión de animales: alta, baja y modificación\n• Gestión de eventos con imágenes\n• Gestión de adopciones y solicitudes\n• Gestión de voluntarios y donaciones\n• Acceso seguro con autenticación administrativa', {
  x: 0.8, y: 1.0, w: 10.2, h: 3.4, fontSize: 19, color: '2D3748', breakLine: true
});

const slide5 = pptx.addSlide();
slide5.addText('4. Tecnologías y arquitectura', { x: 0.5, y: 0.3, w: 8.0, h: 0.5, fontSize: 24, bold: true, color: '1F4E79' });
slide5.addText('Frontend: React + Vite\nBackend: Node.js + Express + TypeScript\nBase de datos: Prisma + PostgreSQL\nSeguridad: middleware, rate limiting y auditoría\nDespliegue: scripts de instalación y ejecución local', {
  x: 0.8, y: 1.0, w: 8.8, h: 3.0, fontSize: 19, color: '2D3748', breakLine: true
});
slide5.addShape(pptx.ShapeType.rect, { x: 10.0, y: 1.1, w: 2.6, h: 2.2, fill: { color: 'F7E7D0' }, line: { color: 'C97A00', width: 1 } });
slide5.addText('Full stack', { x: 10.2, y: 1.5, w: 2.2, h: 0.4, fontSize: 16, bold: true, color: 'C97A00' });
slide5.addText('Aplicación completa de extremo a extremo.', { x: 10.2, y: 2.0, w: 2.2, h: 0.8, fontSize: 12, color: '4A5568' });

const slide6 = pptx.addSlide();
slide6.addText('5. Conclusión', { x: 0.5, y: 0.3, w: 6.0, h: 0.5, fontSize: 24, bold: true, color: '1F4E79' });
slide6.addText('Se ha desarrollado una plataforma funcional para gestionar una protectora de animales.\nCombina experiencia de usuario, administración, seguridad y bases de datos.\nEs una solución sólida para demostrar habilidades full-stack y proyecto realista.', {
  x: 0.8, y: 1.2, w: 10.0, h: 2.4, fontSize: 21, color: '2D3748', breakLine: true
});

pptx.writeFile({ fileName: 'presentacion-protectora.pptx' })
  .then(() => console.log('PowerPoint creado correctamente: presentacion-protectora.pptx'))
  .catch((err) => {
    console.error('Error al generar la presentación:', err);
    process.exit(1);
  });
