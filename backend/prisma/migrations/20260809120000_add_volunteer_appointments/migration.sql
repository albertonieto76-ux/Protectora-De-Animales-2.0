-- CreateTable
CREATE TABLE "CitaVoluntariado" (
    "id" SERIAL NOT NULL,
    "voluntarioId" INTEGER NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'confirmada',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitaVoluntariado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CitaVoluntariado_inicio_idx" ON "CitaVoluntariado"("inicio");

-- CreateIndex
CREATE INDEX "CitaVoluntariado_voluntarioId_inicio_idx" ON "CitaVoluntariado"("voluntarioId", "inicio");

-- AddForeignKey
ALTER TABLE "CitaVoluntariado" ADD CONSTRAINT "CitaVoluntariado_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "Voluntario"("id") ON DELETE CASCADE ON UPDATE CASCADE;