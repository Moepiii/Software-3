-- CreateTable
CREATE TABLE "abonos" (
    "id" TEXT NOT NULL,
    "deuda_id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abonos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "abonos_deuda_id_fecha_idx" ON "abonos"("deuda_id", "fecha");

-- AddForeignKey
ALTER TABLE "abonos" ADD CONSTRAINT "abonos_deuda_id_fkey" FOREIGN KEY ("deuda_id") REFERENCES "deudas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
