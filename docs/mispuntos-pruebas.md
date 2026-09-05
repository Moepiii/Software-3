# Validación de Mis Puntos

Fecha: 2026-09-05. Rama: `feature/gamificacion`.

## Resultado y correcciones

Se validaron cálculo de niveles, persistencia en PostgreSQL, permisos HTTP,
concurrencia, recuperación de errores, navegación para personas y empresas,
modo oscuro, tipografía, tamaños de 320, 375 y 768 px y recorrido real en Docker.

Las pruebas reprodujeron y permitieron corregir:

- Acreditación concurrente incorrecta: 24 solicitudes sobre un curso de 100
  puntos llegaron a sumar 250 en el historial y dejar el progreso en 75 %.
  Ahora el cálculo bloquea la inscripción en PostgreSQL y realiza avance e
  historial en una única sentencia atómica con parámetros. No retrocede el
  progreso ni se acreditan dos veces los mismos hitos.
- Inscripciones canceladas al 100 % que aparecían entre los cursos completados.
- Validación ausente de porcentajes fuera de rango en el repositorio.
- Tarjetas de cursos que se recortaban en móvil y porcentajes que se partían
  junto a títulos largos. Se ajustaron grillas, distribución y navegación.
- Contraste insuficiente de los acentos verdes en modo oscuro. Mis Puntos usa
  los colores, bordes, sombras, radios y tipografía del sistema; la prueba de
  contraste del descuento oscuro exige al menos 4.5:1.
- Build Docker del frontend fallido por no copiar `pnpm-workspace.yaml` antes
  de instalar. Se copia la configuración existente y se fija pnpm 11.25.0,
  versión con la que se verificó el build. Los contextos excluyen dependencias
  del host, resultados de pruebas y archivos `.env`.

## Verificaciones ejecutadas

| Verificación | Resultado |
| --- | --- |
| TypeScript y build Vite | Correcto |
| Jest, suite completa | 23 pruebas correctas; 1 omitida preexistente |
| Go, suite completa con `-race` y PostgreSQL | Correcto |
| Avances de 0, 24, 25, 26, 49, 50, 75 y 100 %, redondeo, repeticiones y retrocesos | Correcto |
| Cancelaciones, inscripción inexistente, límites y aislamiento entre usuarios | Correcto |
| Rollback del avance cuando falla la escritura del historial | Correcto |
| Cambios de puntos base sin recreditar hitos ni quitar puntos previos | Correcto |
| Finalización con avance inicial de 0, 50 y 100 %, sin duplicar puntos/EXP | Correcto |
| 10 rondas de 24 solicitudes concurrentes | Correcto |
| Fuzzing de cálculo de niveles | 74.159 ejecuciones en 5 segundos, sin fallos |
| Playwright Chromium, navegación existente y Mis Puntos | 6 pruebas correctas |
| Playwright Chromium contra Docker, sin mocks de API | 2 pruebas correctas |
| Reintento con teclado y comprobaciones de modo oscuro/móvil | Correcto |
| Migraciones en una base vacía | Las 5 aplicadas automáticamente al arrancar |
| Actualización desde las 4 migraciones anteriores | Conserva usuario, EXP, curso, inscripción y deuda |
| Segundo despliegue de migraciones | Sin pendientes ni duplicados |
| ESLint en el módulo de puntos y nuevas pruebas | Correcto |
| ESLint general | 21 errores y 1 advertencia preexistentes; misma cuenta en una copia de HEAD anterior a estos cambios |

No se ejecutaron Firefox, WebKit ni una auditoría exhaustiva de accesibilidad.
El análisis visual y las comprobaciones de teclado, contraste, nombres accesibles
y tamaños se realizaron en Chromium. La suite Go no equivale a una prueba de
carga general de toda la aplicación.

## Docker y migraciones automáticas

`docker compose build` construye imágenes; no levanta servicios ni modifica la
base de datos. El comando normal del backend en `docker-compose.yml` ya ejecuta
`prisma-client-go migrate deploy` antes de iniciar el servidor. El recorrido
completo es `docker compose up --build -d`.

Las pruebas usan `docker-compose.test.yml`, un proyecto, puertos y volumen
separados. No se migra ni se reinicia el PostgreSQL habitual `ecologic-postgres`.

Desde la raíz del proyecto:

```sh
# Construye, arranca y comprueba actualización con datos e idempotencia.
# Crea y elimina su propia base temporal de actualización.
bash scripts/test-mispuntos-migraciones.sh

# Solo levantar el entorno aislado:
docker compose -p mispuntos-tests -f docker-compose.yml -f docker-compose.test.yml up --build -d
```

Frontend aislado: http://127.0.0.1:15173.
Backend aislado: http://127.0.0.1:18080.
PostgreSQL aislado: puerto 55439; usuario `ecouser`, clave `ecopass`, base
`ecologic_db` (credenciales de desarrollo definidas en Compose).

## Repetir las pruebas

Desde `Backend`:

```sh
# Generar el cliente para el host si aún no está generado.
go run github.com/steebchen/prisma-client-go generate
MIS_PUNTOS_TEST_DATABASE_URL='postgresql://ecouser:ecopass@127.0.0.1:55439/ecologic_db' go test -race ./... -count=1
MIS_PUNTOS_TEST_DATABASE_URL='postgresql://ecouser:ecopass@127.0.0.1:55439/ecologic_db' go test ./internal/repositories -run TestPuntosAvancesConcurrentes -count=10
go test ./internal/services -run '^$' -fuzz FuzzResumenPuntos -fuzztime=5s -parallel=2
```

Desde `Frontend`:

```sh
pnpm run build
pnpm exec jest --runInBand
pnpm exec playwright install chromium
pnpm exec playwright test tests/configuracion.spec.ts tests/persona.spec.ts tests/mispuntos.spec.ts --project=chromium
# Requiere el entorno Docker aislado ya iniciado.
pnpm exec playwright test --config=playwright.docker.config.ts
```

Las pruebas reales crean usuarios y cursos propios y los eliminan al terminar.
Las pruebas de repositorio se omiten si no se define
`MIS_PUNTOS_TEST_DATABASE_URL`; configurarlo siempre a una base de pruebas.

## Comportamiento conservado

- Los puntos del módulo y la experiencia de gamificación son métricas distintas.
  Se conservan los 100 EXP por finalización y el cálculo de nivel del equipo.
- La migración no inventa puntos retroactivos para cursos ya completados.
- Si cambia el valor del curso, los hitos anteriores no se recalculan ni se
  retiran puntos. El siguiente hito usa el valor vigente sin reducir el total.
- El porcentaje de descuento se calcula y muestra; esta tarea no modifica las
  reglas de cobro o de pagos del equipo.
- La rama `integracion` y los remotos permanecen sin cambios durante esta tarea.
