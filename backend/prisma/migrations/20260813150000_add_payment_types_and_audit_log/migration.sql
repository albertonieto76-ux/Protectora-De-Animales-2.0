CREATE TABLE IF NOT EXISTS "TipoPago" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "account" TEXT,

    CONSTRAINT "TipoPago_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TipoPago_tipo_key" ON "TipoPago"("tipo");

ALTER TABLE "Donacion"
ADD COLUMN IF NOT EXISTS "metodoId" INTEGER,
ADD COLUMN IF NOT EXISTS "tipoDonacion" TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Donacion'
          AND column_name = 'metodo'
    ) THEN
        ALTER TABLE "Donacion" ALTER COLUMN "metodo" DROP NOT NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Donacion_metodoId_fkey'
    ) THEN
        ALTER TABLE "Donacion"
        ADD CONSTRAINT "Donacion_metodoId_fkey"
        FOREIGN KEY ("metodoId") REFERENCES "TipoPago"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "SecurityAuditLog" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "email" TEXT,
    "action" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "path" TEXT,
    "method" TEXT,
    "reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "SecurityAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SecurityAuditLog_createdAt_idx" ON "SecurityAuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_action_idx" ON "SecurityAuditLog"("action");
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_userId_idx" ON "SecurityAuditLog"("userId");