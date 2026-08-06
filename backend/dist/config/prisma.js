import pkg from '@prisma/client';
const PrismaClient = pkg.PrismaClient;
const prisma = new PrismaClient();
export { prisma };
