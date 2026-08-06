import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Pool con tu conexión
const pool = new Pool({
    connectionString: "postgresql://postgres:postgres825j@127.0.0.1:5432/AdoptaBBDD_db?schema=public"
});

// Adaptador para Prisma 7
const adapter = new PrismaPg(pool);

// Cliente Prisma 7 usando el adaptador
export const prisma = new PrismaClient({
    adapter,
});

