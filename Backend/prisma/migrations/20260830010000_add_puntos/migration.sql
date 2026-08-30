ALTER TABLE "cursos"
ADD COLUMN "puntos_base" INTEGER NOT NULL DEFAULT 100;

ALTER TABLE "inscripciones"
ADD COLUMN "progreso_pct" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "puntos_acreditados" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "historial_puntos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "inscripcion_id" TEXT NOT NULL,
    "progreso_pct" INTEGER NOT NULL,
    "puntos_ganados" INTEGER NOT NULL,
    "total_acreditado" INTEGER NOT NULL,
    "tipo_movimiento" TEXT NOT NULL DEFAULT 'acreditacion',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_puntos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "historial_puntos_inscripcion_id_progreso_pct_key"
ON "historial_puntos"("inscripcion_id", "progreso_pct");

CREATE INDEX "historial_puntos_usuario_id_created_at_idx"
ON "historial_puntos"("usuario_id", "created_at");

ALTER TABLE "historial_puntos"
ADD CONSTRAINT "historial_puntos_usuario_id_fkey"
FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "historial_puntos"
ADD CONSTRAINT "historial_puntos_curso_id_fkey"
FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "historial_puntos"
ADD CONSTRAINT "historial_puntos_inscripcion_id_fkey"
FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
