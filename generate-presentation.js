const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Proyecto Protectora';
pptx.company = 'Master Programación con IA';
pptx.subject = 'Presentación del proyecto';
pptx.title = 'Protectora Web 2';
pptx.theme = {
  colorScheme: {
    accent1: '1F4E79',
    accent2: '2E8B57',
    accent3: 'F59E0B',
    accent4: 'D97706',
    accent5: '0EA5E9',
    accent6: '2D3748',
    hlink: '2563EB',
    folHlink: '1D4ED8'
  },
  fontFace: { title: 'Aptos', body: 'Aptos' }
};

const palette = {
  navy: '1F4E79',
  green: '2E8B57',
  gold: 'F59E0B',
  orange: 'D97706',
  lightBlue: 'EAF4FF',
  lightGreen: 'EAFBF3',
  dark: '1F2937',
  soft: 'F7FAFC'
};

const addHeader = (slide, title, subtitle = '') => {
  slide.background = { color: palette.soft };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.35, fill: { color: palette.navy }, line: { color: palette.navy }
  });
  slide.addText(title, {
    x: 0.6, y: 0.45, w: 8.5, h: 0.5, fontSize: 24, bold: true, color: palette.navy
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 0.9, w: 10, h: 0.35, fontSize: 11, color: palette.dark
    });
  }
};

const titleSlide = pptx.addSlide();
titleSlide.background = { color: 'F8FBFF' };

titleSlide.addShape(pptx.ShapeType.rect, {
  x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: 'F8FBFF' }, line: { color: 'F8FBFF' }
});
titleSlide.addShape(pptx.ShapeType.rect, {
  x: 0, y: 0, w: 6.6, h: 7.5, fill: { color: palette.navy }, line: { color: palette.navy }
});
titleSlide.addShape(pptx.ShapeType.rect, {
  x: 6.5, y: 0.8, w: 5.9, h: 2.7, fill: { color: palette.lightBlue }, line: { color: palette.lightBlue }
});
titleSlide.addText('Protectora Web 2', {
  x: 0.9, y: 1.7, w: 4.5, h: 0.8, fontSize: 28, bold: true, color: 'FFFFFF'
});
titleSlide.addText('Plataforma digital para la gestión integral de una protectora de animales', {
  x: 0.9, y: 2.5, w: 4.6, h: 1.5, fontSize: 18, color: 'E2E8F0', breakLine: true
});
titleSlide.addText('Proyecto de fin de máster', {
  x: 0.9, y: 4.3, w: 3.7, h: 0.4, fontSize: 12, bold: true, color: 'BEE3F8'
});
titleSlide.addText('React • Node.js • Prisma • PostgreSQL', {
  x: 0.9, y: 4.8, w: 3.8, h: 0.4, fontSize: 12, color: 'E2E8F0'
});
titleSlide.addShape(pptx.ShapeType.roundRect, {
  x: 7.2, y: 1.7, w: 4.7, h: 1.5, fill: { color: palette.green }, line: { color: palette.green }, radius: 0.12
});
titleSlide.addText('Adopciones', { x: 7.7, y: 2.0, w: 3.8, h: 0.5, fontSize: 17, bold: true, color: 'FFFFFF' });
titleSlide.addShape(pptx.ShapeType.roundRect, {
  x: 7.2, y: 3.6, w: 4.7, h: 1.5, fill: { color: palette.gold }, line: { color: palette.gold }, radius: 0.12
});
titleSlide.addText('Voluntariado', { x: 7.7, y: 3.9, w: 3.8, h: 0.5, fontSize: 17, bold: true, color: 'FFFFFF' });
titleSlide.addShape(pptx.ShapeType.roundRect, {
  x: 7.2, y: 5.5, w: 4.7, h: 1.5, fill: { color: palette.orange }, line: { color: palette.orange }, radius: 0.12
});
titleSlide.addText('Eventos y donaciones', { x: 7.7, y: 5.8, w: 3.8, h: 0.5, fontSize: 17, bold: true, color: 'FFFFFF' });

const slide2 = pptx.addSlide();
addHeader(slide2, '1. Resumen ejecutivo', 'Solución digital para operar con mayor eficiencia');
slide2.addText('Una plataforma full-stack que centraliza la gestión de la protectora y mejora la experiencia de usuarios, voluntarios y administradores.', {
  x: 0.7, y: 1.4, w: 8.6, h: 1.0, fontSize: 22, bold: true, color: palette.dark, breakLine: true
});
const highlights = [
  'Centraliza adopciones, voluntariado y eventos',
  'Automatiza procesos administrativos y registros',
  'Mejora la visibilidad y confianza de la entidad',
  'Aumenta la captación de donaciones y participación'
];
highlights.forEach((item, i) => {
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 2.6 + i * 1.05, w: 7.5, h: 0.65, fill: { color: i % 2 === 0 ? palette.lightBlue : palette.lightGreen }, line: { color: i % 2 === 0 ? palette.navy : palette.green }, radius: 0.08
  });
  slide2.addText('• ' + item, {
    x: 1.2, y: 2.8 + i * 1.05, w: 6.8, h: 0.35, fontSize: 17, color: palette.dark
  });
});
slide2.addShape(pptx.ShapeType.rect, {
  x: 9.2, y: 1.8, w: 3.3, h: 2.7, fill: { color: palette.navy }, line: { color: palette.navy }
});
slide2.addText('Valor de negocio', {
  x: 9.5, y: 2.1, w: 2.7, h: 0.4, fontSize: 16, bold: true, color: 'FFFFFF'
});
slide2.addText('Más eficiencia\nMás traza\nMás participación', {
  x: 9.5, y: 2.8, w: 2.7, h: 1.3, fontSize: 17, color: 'E2E8F0', breakLine: true
});

const slide3 = pptx.addSlide();
addHeader(slide3, '2. Problema y oportunidad', 'El reto de digitalizar la gestión');
slide3.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.4, w: 5.5, h: 3.8, fill: { color: 'FDE7E7' }, line: { color: 'DC2626' } });
slide3.addText('Problema', { x: 1.1, y: 1.7, w: 2.2, h: 0.4, fontSize: 18, bold: true, color: '991B1B' });
slide3.addText('• Gestión dispersa de adopciones\n• Procesos manuales\n• Falta de trazabilidad\n• Baja visibilidad para la comunidad\n• Seguridad y auditoría insuficiente', {
  x: 1.2, y: 2.2, w: 4.6, h: 2.5, fontSize: 18, color: '4B5563', breakLine: true
});
slide3.addShape(pptx.ShapeType.rect, { x: 7.0, y: 1.4, w: 5.6, h: 3.8, fill: { color: 'EAFBF3' }, line: { color: palette.green } });
slide3.addText('Oportunidad', { x: 7.4, y: 1.7, w: 2.2, h: 0.4, fontSize: 18, bold: true, color: '166534' });
slide3.addText('• Digitalizar procesos internos\n• Mejorar la experiencia del usuario\n• Aumentar adopciones y donaciones\n• Impulsar comunidad y voluntariado\n• Crear una marca digital profesional', {
  x: 7.5, y: 2.2, w: 4.8, h: 2.5, fontSize: 18, color: '4B5563', breakLine: true
});

const slide4 = pptx.addSlide();
addHeader(slide4, '3. Objetivos del proyecto', 'Qué buscamos construir');
const obj = [
  ['Simplificar adopciones', 'Facilitar la gestión de animales y solicitudes'],
  ['Impulsar voluntariado', 'Organizar disponibilidad y citas de forma clara'],
  ['Potenciar eventos', 'Difundir actividades con información centralizada'],
  ['Aumentar donaciones', 'Recoger aportaciones de forma segura y ordenada'],
  ['Control administrativo', 'Gestionar contenido y usuarios con seguridad']
];
obj.forEach(([title, desc], i) => {
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 0.8 + (i % 2) * 6.2, y: 1.5 + Math.floor(i / 2) * 2.0, w: 5.2, h: 1.6, fill: { color: i % 2 === 0 ? palette.lightBlue : palette.lightGreen }, line: { color: i % 2 === 0 ? palette.navy : palette.green }, radius: 0.08
  });
  slide4.addText(title, { x: 1.15 + (i % 2) * 6.2, y: 1.8 + Math.floor(i / 2) * 2.0, w: 4.6, h: 0.4, fontSize: 18, bold: true, color: i % 2 === 0 ? palette.navy : palette.green });
  slide4.addText(desc, { x: 1.15 + (i % 2) * 6.2, y: 2.3 + Math.floor(i / 2) * 2.0, w: 4.6, h: 0.7, fontSize: 13, color: palette.dark });
});

const slide5 = pptx.addSlide();
addHeader(slide5, '4. Solución propuesta', 'Arquitectura moderna y escalable');
slide5.addText('Frontend', { x: 0.8, y: 1.5, w: 2.1, h: 0.4, fontSize: 18, bold: true, color: palette.navy });
slide5.addText('React + Vite\nInterfaz pública y administrativa', { x: 0.8, y: 1.9, w: 2.4, h: 0.9, fontSize: 14, color: palette.dark, breakLine: true });
slide5.addText('Backend', { x: 4.1, y: 1.5, w: 2.1, h: 0.4, fontSize: 18, bold: true, color: palette.navy });
slide5.addText('Node.js + Express\nAPI REST segura y modular', { x: 4.1, y: 1.9, w: 2.6, h: 0.9, fontSize: 14, color: palette.dark, breakLine: true });
slide5.addText('Datos', { x: 7.5, y: 1.5, w: 2.1, h: 0.4, fontSize: 18, bold: true, color: palette.navy });
slide5.addText('PostgreSQL\nPrisma ORM', { x: 7.5, y: 1.9, w: 2.6, h: 0.9, fontSize: 14, color: palette.dark, breakLine: true });
slide5.addText('Seguridad', { x: 10.8, y: 1.5, w: 2.1, h: 0.4, fontSize: 18, bold: true, color: palette.navy });
slide5.addText('Autenticación\nAuditoría y control', { x: 10.8, y: 1.9, w: 2.0, h: 0.9, fontSize: 14, color: palette.dark, breakLine: true });
slide5.addShape(pptx.ShapeType.rect, { x: 1.5, y: 3.4, w: 10.2, h: 2.5, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1' } });
slide5.addText('Flujo principal', { x: 1.9, y: 3.8, w: 2.1, h: 0.35, fontSize: 16, bold: true, color: palette.navy });
slide5.addText('Usuario / Administrador → Frontend → Backend → Prisma → PostgreSQL', { x: 2.0, y: 4.4, w: 8.8, h: 0.4, fontSize: 18, color: palette.dark });
slide5.addText('Resultado: información centralizada, segura y actualizada en tiempo real.', { x: 2.0, y: 5.1, w: 8.8, h: 0.5, fontSize: 16, color: palette.green, bold: true });

const slide6 = pptx.addSlide();
addHeader(slide6, '5. Modelo de datos clave', 'Relaciones para una gestión sólida');
slide6.addText('Animal', { x: 0.9, y: 1.6, w: 1.8, h: 0.4, fontSize: 14, bold: true, color: palette.navy });
slide6.addText('• animales disponibles\n• solicitudes de adopción', { x: 0.9, y: 2.0, w: 2.2, h: 0.8, fontSize: 12, color: palette.dark, breakLine: true });
slide6.addText('Voluntario', { x: 3.2, y: 1.6, w: 1.8, h: 0.4, fontSize: 14, bold: true, color: palette.navy });
slide6.addText('• contacto\n• disponibilidad\n• citas', { x: 3.2, y: 2.0, w: 2.2, h: 0.8, fontSize: 12, color: palette.dark, breakLine: true });
slide6.addText('Evento', { x: 5.5, y: 1.6, w: 1.8, h: 0.4, fontSize: 14, bold: true, color: palette.navy });
slide6.addText('• título\n• fecha\n• asistentes', { x: 5.5, y: 2.0, w: 2.2, h: 0.8, fontSize: 12, color: palette.dark, breakLine: true });
slide6.addText('Donación', { x: 7.8, y: 1.6, w: 1.8, h: 0.4, fontSize: 14, bold: true, color: palette.navy });
slide6.addText('• importe\n• método de pago\n• usuario', { x: 7.8, y: 2.0, w: 2.2, h: 0.8, fontSize: 12, color: palette.dark, breakLine: true });
slide6.addText('Usuario', { x: 10.1, y: 1.6, w: 1.8, h: 0.4, fontSize: 14, bold: true, color: palette.navy });
slide6.addText('• acceso admin\n• auditoría\n• seguridad', { x: 10.1, y: 2.0, w: 2.2, h: 0.8, fontSize: 12, color: palette.dark, breakLine: true });
slide6.addShape(pptx.ShapeType.rect, { x: 1.5, y: 3.5, w: 10.2, h: 2.1, fill: { color: palette.lightBlue }, line: { color: palette.navy } });
slide6.addText('Relaciones clave', { x: 1.9, y: 3.9, w: 2.4, h: 0.35, fontSize: 16, bold: true, color: palette.navy });
slide6.addText('Animal 1:N SolicitudAdopcion   •   Voluntario 1:N CitaVoluntariado   •   Evento 1:N AsistenteEvento   •   TipoPago 1:N Donacion', { x: 2.0, y: 4.5, w: 9.2, h: 0.7, fontSize: 16, color: palette.dark });

const slide7 = pptx.addSlide();
addHeader(slide7, '6. Stack tecnológico', 'Tecnologías modernas y competitivas');
slide7.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 1.6, w: 3.6, h: 2.1, fill: { color: 'EAF4FF' }, line: { color: palette.navy }, radius: 0.08 });
slide7.addText('Frontend', { x: 1.4, y: 2.0, w: 2.5, h: 0.3, fontSize: 18, bold: true, color: palette.navy });
slide7.addText('React + Vite', { x: 1.4, y: 2.6, w: 2.5, h: 0.3, fontSize: 16, color: palette.dark });
slide7.addShape(pptx.ShapeType.roundRect, { x: 4.9, y: 1.6, w: 3.6, h: 2.1, fill: { color: 'EAFBF3' }, line: { color: palette.green }, radius: 0.08 });
slide7.addText('Backend', { x: 5.4, y: 2.0, w: 2.5, h: 0.3, fontSize: 18, bold: true, color: palette.green });
slide7.addText('Node.js + Express', { x: 5.4, y: 2.6, w: 2.5, h: 0.3, fontSize: 16, color: palette.dark });
slide7.addShape(pptx.ShapeType.roundRect, { x: 8.9, y: 1.6, w: 3.6, h: 2.1, fill: { color: 'FFF7ED' }, line: { color: palette.orange }, radius: 0.08 });
slide7.addText('Datos', { x: 9.4, y: 2.0, w: 2.5, h: 0.3, fontSize: 18, bold: true, color: palette.orange });
slide7.addText('Prisma + PostgreSQL', { x: 9.4, y: 2.6, w: 2.5, h: 0.3, fontSize: 16, color: palette.dark });
slide7.addShape(pptx.ShapeType.rect, { x: 2.2, y: 4.4, w: 8.8, h: 1.7, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1' } });
slide7.addText('Ventaja competitiva', { x: 2.7, y: 4.8, w: 2.8, h: 0.3, fontSize: 18, bold: true, color: palette.navy });
slide7.addText('Arquitectura moderna, mantenible y escalable con una base sólida para crecimiento futuro.', { x: 5.2, y: 4.8, w: 5.2, h: 0.8, fontSize: 16, color: palette.dark });

const slide8 = pptx.addSlide();
addHeader(slide8, '7. Impacto de negocio', 'Solución útil para la comunidad y la organización');
slide8.addText('Más adopciones', { x: 0.9, y: 1.7, w: 2.2, h: 0.4, fontSize: 18, bold: true, color: palette.navy });
slide8.addText('Mejor visibilidad de animales y procesos para usuarios', { x: 0.9, y: 2.1, w: 3.8, h: 0.6, fontSize: 14, color: palette.dark });
slide8.addText('Más voluntariado', { x: 4.9, y: 1.7, w: 2.2, h: 0.4, fontSize: 18, bold: true, color: palette.navy });
slide8.addText('Organización clara de formaciones y turnos', { x: 4.9, y: 2.1, w: 3.8, h: 0.6, fontSize: 14, color: palette.dark });
slide8.addText('Más eventos', { x: 8.9, y: 1.7, w: 2.2, h: 0.4, fontSize: 18, bold: true, color: palette.navy });
slide8.addText('Difusión más profesional y centralizada', { x: 8.9, y: 2.1, w: 3.5, h: 0.6, fontSize: 14, color: palette.dark });
slide8.addText('Más apoyo económico', { x: 0.9, y: 4.0, w: 2.6, h: 0.4, fontSize: 18, bold: true, color: palette.navy });
slide8.addText('Gestión más sencilla y segura de donaciones', { x: 0.9, y: 4.4, w: 3.8, h: 0.6, fontSize: 14, color: palette.dark });
slide8.addText('Mejor gestión interna', { x: 4.9, y: 4.0, w: 2.8, h: 0.4, fontSize: 18, bold: true, color: palette.navy });
slide8.addText('Control de contenido, usuarios y auditoría', { x: 4.9, y: 4.4, w: 3.8, h: 0.6, fontSize: 14, color: palette.dark });
slide8.addShape(pptx.ShapeType.rect, { x: 8.8, y: 3.7, w: 3.5, h: 1.8, fill: { color: palette.navy }, line: { color: palette.navy } });
slide8.addText('Conclusión', { x: 9.2, y: 4.2, w: 2.7, h: 0.3, fontSize: 17, bold: true, color: 'FFFFFF' });
slide8.addText('Tecnología que conecta a la protectora con su comunidad.', { x: 9.2, y: 4.7, w: 2.6, h: 0.7, fontSize: 12, color: 'E2E8F0' });

const slide9 = pptx.addSlide();
slide9.background = { color: 'F8FBFF' };
slide9.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: 'F8FBFF' }, line: { color: 'F8FBFF' } });
slide9.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.7, fill: { color: palette.navy }, line: { color: palette.navy } });
slide9.addText('Cierre', { x: 0.8, y: 0.15, w: 2.4, h: 0.3, fontSize: 22, bold: true, color: 'FFFFFF' });
slide9.addText('Protectora Web 2', { x: 1.1, y: 1.8, w: 6.0, h: 0.7, fontSize: 28, bold: true, color: palette.navy });
slide9.addText('Tecnología que transforma la protectora en una organización más eficiente, visible y sostenible.', { x: 1.1, y: 2.7, w: 8.6, h: 1.0, fontSize: 20, color: palette.dark });
slide9.addText('• Más adopciones\n• Más voluntariado\n• Más eventos\n• Más apoyo económico\n• Mejor gestión interna', { x: 1.2, y: 4.0, w: 6.0, h: 2.0, fontSize: 19, color: palette.dark, breakLine: true });
slide9.addShape(pptx.ShapeType.roundRect, { x: 8.5, y: 2.4, w: 3.4, h: 2.5, fill: { color: palette.green }, line: { color: palette.green }, radius: 0.12 });
slide9.addText('Impacto', { x: 9.0, y: 3.0, w: 2.5, h: 0.4, fontSize: 20, bold: true, color: 'FFFFFF' });
slide9.addText('Comunidad activa', { x: 9.1, y: 4.0, w: 2.2, h: 0.4, fontSize: 14, color: 'E2E8F0' });

pptx.writeFile({ fileName: 'presentacion-protectora-premium.pptx' })
  .then(() => console.log('PowerPoint premium creado correctamente: presentacion-protectora-premium.pptx'))
  .catch((err) => {
    console.error('Error al generar la presentación premium:', err);
    process.exit(1);
  });
