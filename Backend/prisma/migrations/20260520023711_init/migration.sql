-- CreateTable
CREATE TABLE "personas" (
    "cedula" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("cedula")
);

-- CreateTable
CREATE TABLE "empresas" (
    "rif" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre_empresa" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("rif")
);

-- CreateIndex
CREATE UNIQUE INDEX "personas_email_key" ON "personas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_email_key" ON "empresas"("email");
