import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.ts';
import { resetDb } from './setup/resetDb.ts';
import { prisma } from '../../services/prisma.ts';

describe('Animals E2E Tests', { concurrent: false }, () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create an animal (POST /api/animals)', async () => {
    const animalData = {
      name: 'Luna',
      species: 'Perro',
      age: 3,
      description: 'Una perrita muy juguetona',
      imageUrl: 'https://example.com/luna.jpg'
    };

    const res = await request(app)
      .post('/api/animals')
      .send(animalData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(animalData.name);
    expect(res.body.species).toBe(animalData.species);
    expect(res.body.age).toBe(animalData.age);
    expect(res.body.description).toBe(animalData.description);
    expect(res.body.imageUrl).toBe(animalData.imageUrl);

    // Verify it exists in the database
    const dbAnimal = await prisma.animal.findUnique({
      where: { id: res.body.id }
    });
    expect(dbAnimal).not.toBeNull();
    expect(dbAnimal!.name).toBe(animalData.name);
  });

  it('should get all animals (GET /api/animals)', async () => {
    // Seed an animal
    const created = await prisma.animal.create({
      data: {
        name: 'Toby',
        species: 'Gato',
        age: 2
      }
    });

    const res = await request(app).get('/api/animals');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(created.id);
    expect(res.body[0].name).toBe('Toby');
  });

  it('should get an animal by id (GET /api/animals/:id)', async () => {
    const created = await prisma.animal.create({
      data: {
        name: 'Max',
        species: 'Perro'
      }
    });

    const res = await request(app).get(`/api/animals/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Max');

    // Test non-existing animal
    const resNotFound = await request(app).get('/api/animals/9999');
    expect(resNotFound.status).toBe(404);
  });

  it('should update an animal (PUT /api/animals/:id)', async () => {
    const created = await prisma.animal.create({
      data: {
        name: 'Rocky',
        species: 'Perro',
        age: 4
      }
    });

    const updateData = {
      name: 'Rocky Balboa',
      age: 5
    };

    const res = await request(app)
      .put(`/api/animals/${created.id}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Rocky Balboa');
    expect(res.body.age).toBe(5);

    // Verify in database
    const dbAnimal = await prisma.animal.findUnique({
      where: { id: created.id }
    });
    expect(dbAnimal!.name).toBe('Rocky Balboa');
    expect(dbAnimal!.age).toBe(5);
  });

  it('should delete an animal (DELETE /api/animals/:id)', async () => {
    const created = await prisma.animal.create({
      data: {
        name: 'Bobby',
        species: 'Perro'
      }
    });

    const res = await request(app).delete(`/api/animals/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Animal eliminado correctamente');

    // Verify deleted in database
    const dbAnimal = await prisma.animal.findUnique({
      where: { id: created.id }
    });
    expect(dbAnimal).toBeNull();
  });
});
