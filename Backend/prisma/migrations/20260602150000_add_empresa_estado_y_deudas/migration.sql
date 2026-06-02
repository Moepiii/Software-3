-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "estado_id" TEXT;

-- CreateTable
CREATE TABLE "deudas_empresas" (
    "id" TEXT NOT NULL,
    "empresa_rif" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deudas_empresas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deudas_empresas_empresa_rif_vigente_idx" ON "deudas_empresas"("empresa_rif", "vigente");

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deudas_empresas" ADD CONSTRAINT "deudas_empresas_empresa_rif_fkey" FOREIGN KEY ("empresa_rif") REFERENCES "empresas"("rif") ON DELETE CASCADE ON UPDATE CASCADE;

