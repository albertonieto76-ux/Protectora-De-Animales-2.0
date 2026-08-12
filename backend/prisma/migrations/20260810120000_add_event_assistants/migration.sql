-- CreateTable
CREATE TABLE "AsistenteEvento" (
    "id" SERIAL NOT NULL,
    "eventoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "mensaje" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AsistenteEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AsistenteEvento_eventoId_idx" ON "AsistenteEvento"("eventoId");
CREATE INDEX "AsistenteEvento_email_idx" ON "AsistenteEvento"("email");

-- AddForeignKey
ALTER TABLE "AsistenteEvento"
ADD CONSTRAINT "AsistenteEvento_eventoId_fkey"
FOREIGN KEY ("eventoId") REFERENCES "Evento"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
