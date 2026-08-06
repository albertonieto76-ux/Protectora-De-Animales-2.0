import { beforeEach } from 'vitest';
import { resetDb } from './resetDb.ts';

beforeEach(async () => {
    console.log(">>> Ejecutando resetDb antes de cada test");
    await resetDb();
});



