import { prisma } from "./src/config/prisma";

async function main() {
    const animales = await prisma.animal.findMany();
    console.log(animales);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });