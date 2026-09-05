#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

compose=(docker compose -p mispuntos-tests -f docker-compose.yml -f docker-compose.test.yml)
"${compose[@]}" up --build -d

# Esperar a que el comando normal de arranque haya aplicado las migraciones.
for intento in {1..60}; do
  aplicadas=$(docker exec mispuntos-tests-postgres psql -U ecouser -d ecologic_db -Atc \
    'SELECT COUNT(*) FROM _prisma_migrations WHERE finished_at IS NOT NULL;' 2>/dev/null || true)
  if [[ "$aplicadas" == "5" ]]; then break; fi
  sleep 1
done
[[ "$aplicadas" == "5" ]] || { echo 'El arranque no aplicó las cinco migraciones'; exit 1; }

task_dir=$(mktemp -d /tmp/mispuntos-upgrade.XXXXXX)
test_db="mispuntos_upgrade_${RANDOM}_${RANDOM}"
container_dir="/tmp/${test_db}"
cleanup() {
  docker exec mispuntos-tests-postgres dropdb -U ecouser --if-exists "$test_db" >/dev/null 2>&1 || true
  docker exec mispuntos-tests-backend rm -rf -- "$container_dir" >/dev/null 2>&1 || true
  rm -rf -- "$task_dir"
}
trap cleanup EXIT

mkdir -p "$task_dir/migrations"
cp Backend/prisma/schema.prisma "$task_dir/schema.prisma"
cp Backend/prisma/migrations/migration_lock.toml "$task_dir/migrations/"
for migration in Backend/prisma/migrations/202606* Backend/prisma/migrations/202607*; do
  cp -R "$migration" "$task_dir/migrations/"
done

docker exec mispuntos-tests-postgres createdb -U ecouser "$test_db"
docker cp "$task_dir/." "mispuntos-tests-backend:$container_dir"
database_url="postgresql://ecouser:ecopass@postgres:5432/$test_db"
docker exec -e "DATABASE_URL=$database_url" mispuntos-tests-backend \
  go run github.com/steebchen/prisma-client-go migrate deploy --schema "$container_dir/schema.prisma"

docker exec -i mispuntos-tests-postgres psql -U ecouser -d "$test_db" -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO usuarios (id,email,password_hash,tipo,nombre,updated_at,nivel,experiencia)
VALUES ('upgrade-user','upgrade@test.local','test','NATURAL','Datos a preservar',CURRENT_TIMESTAMP,3,3456);
INSERT INTO cursos (id,titulo,descripcion,"fechaInicio","fechaFin",updated_at)
VALUES ('upgrade-course','Curso existente','Preservar','2026-09-01','2026-09-30',CURRENT_TIMESTAMP);
INSERT INTO inscripciones (id,usuario_id,curso_id,estado,updated_at)
VALUES ('upgrade-inscripcion','upgrade-user','upgrade-course','completada',CURRENT_TIMESTAMP);
INSERT INTO deudas (id,usuario_id,monto) VALUES ('upgrade-deuda','upgrade-user',987.65);
SQL

for intento in 1 2; do
  docker exec -e "DATABASE_URL=$database_url" mispuntos-tests-backend \
    go run github.com/steebchen/prisma-client-go migrate deploy
  docker exec -i mispuntos-tests-postgres psql -U ecouser -d "$test_db" -v ON_ERROR_STOP=1 <<'SQL'
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id='upgrade-user' AND nombre='Datos a preservar' AND nivel=3 AND experiencia=3456) THEN RAISE EXCEPTION 'Se alteró el usuario/experiencia'; END IF;
 IF NOT EXISTS (SELECT 1 FROM cursos WHERE id='upgrade-course' AND titulo='Curso existente' AND puntos_base=100) THEN RAISE EXCEPTION 'Se alteró el curso'; END IF;
 IF NOT EXISTS (SELECT 1 FROM inscripciones WHERE id='upgrade-inscripcion' AND estado='completada' AND progreso_pct=0 AND puntos_acreditados=0) THEN RAISE EXCEPTION 'Se alteró la inscripción'; END IF;
 IF NOT EXISTS (SELECT 1 FROM deudas WHERE id='upgrade-deuda' AND monto=987.65) THEN RAISE EXCEPTION 'Se alteró la deuda'; END IF;
 IF (SELECT COUNT(*) FROM _prisma_migrations WHERE finished_at IS NOT NULL) <> 5 THEN RAISE EXCEPTION 'Faltan migraciones'; END IF;
 IF (SELECT COUNT(*) FROM historial_puntos) <> 0 THEN RAISE EXCEPTION 'Se inventaron puntos retroactivos'; END IF;
END $$;
SQL
done

echo 'OK: arranque automático, actualización con datos e idempotencia.'
