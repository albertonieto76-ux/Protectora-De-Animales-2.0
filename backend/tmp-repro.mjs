import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from './src/app.ts';
import { prisma } from './src/services/prisma.ts';

const secret = process.env.JWT_SECRET || 'change-me-in-production';
const token = jwt.sign({ sub: 1, role: 'admin', email: 'admin@test' }, secret, {
  issuer: 'protectora-backend',
  audience: 'protectora-admin',
});

const animal = await prisma.animal.create({
  data: { name: 'Temp', species: 'Perro', images: ['https://old'] },
});

const res = await request(app)
  .put(`/api/animals/${animal.id}`)
  .set('Cookie', ['admin_token=' + token, 'csrf_token=test-token'])
  .set('X-CSRF-Token', 'test-token')
  .attach('images', Buffer.from('fake-image-data'), { filename: 'a.png', contentType: 'image/png' })
  .field('name', 'Nuevo')
  .field('existingImages', JSON.stringify(['https://old']))
  .field('replaceIndex', '0');

console.log('status', res.status);
console.log('body', res.body);
console.log('text', res.text);

await prisma.animal.delete({ where: { id: animal.id } });
await prisma.$disconnect();
