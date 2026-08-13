import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres825j@localhost:5432/protectora?schema=public";

const pool = new Pool({
    connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
    adapter,
});