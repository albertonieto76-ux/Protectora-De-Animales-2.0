import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:5432/protectora?schema=public";

const pool = new Pool({
    connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
    adapter,
});