-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('NATURAL', 'JURIDICO', 'ADMIN');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "identificacion" TEXT,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "estado_id" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasa_estados" (
    "id" TEXT NOT NULL,
    "estado_id" TEXT NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "valido_desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valido_hasta" TIMESTAMP(3),

    CONSTRAINT "tasa_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deudas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deudas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_identificacion_key" ON "usuarios"("identificacion");

-- CreateIndex
CREATE UNIQUE INDEX "estados_nombre_key" ON "estados"("nombre");

-- CreateIndex
CREATE INDEX "tasa_estados_estado_id_valido_desde_valido_hasta_idx" ON "tasa_estados"("estado_id", "valido_desde", "valido_hasta");

-- CreateIndex
CREATE INDEX "deudas_usuario_id_vigente_idx" ON "deudas"("usuario_id", "vigente");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasa_estados" ADD CONSTRAINT "tasa_estados_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deudas" ADD CONSTRAINT "deudas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
