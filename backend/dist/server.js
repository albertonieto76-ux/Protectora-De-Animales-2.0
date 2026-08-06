import express from "express";
import { prisma } from "./config/prisma.js";
const app = express();
app.use(express.json());
app.get("/", async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            ok: true,
            database: "Conectada",
            prisma: "Funcionando"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false
        });
    }
});
app.listen(3000, () => {
    console.log("Servidor iniciado");
});
