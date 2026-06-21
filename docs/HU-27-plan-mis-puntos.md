# HU-27 - Plan de Implementacion: Mis Puntos

## 1. Contexto
La historia de usuario HU-27 pertenece a la epica de incentivos y puntos por capacitacion. El objetivo es agregar una seccion dedicada llamada **Mis Puntos** dentro del panel autenticado para que el usuario pueda ver:

- el total de puntos acumulados,
- su nivel actual,
- su avance hacia el siguiente nivel,
- el porcentaje de descuento aplicable al impuesto de basura.

En el estado actual del proyecto, la aplicacion ya tiene:

- paneles separados para usuario natural, empresa y admin,
- navegacion interna por vistas en el frontend,
- backend unificado para usuario, deuda, estados y cursos,
- modulo de estadisticas financieras ya conectado al usuario autenticado.

Esto significa que **Mis Puntos** encaja mejor como una subvista del panel de persona/empresa, no como una ruta independiente.

## 2. Objetivo
Implementar una experiencia estable y consistente para consultar beneficios de gamificacion por capacitacion, con datos provenientes del backend y una UI clara para entender:

- cuanto ha avanzado el usuario,
- que nivel tiene,
- que descuento obtiene,
- cuanto le falta para el siguiente beneficio.

## 3. Alcance
### Incluido
- Nueva vista `Mis Puntos` dentro del panel autenticado.
- Endpoint backend para consultar el resumen de puntos del usuario.
- Persistencia de puntos y/o historial en base de datos.
- Calculo de nivel, progreso y descuento desde backend.
- Barra de progreso accesible.
- Estados de carga, error y sin datos.

### Excluido por ahora
- Panel administrativo para configurar reglas de puntos.
- Parametrizacion dinamica de niveles desde UI.
- Recompensas complejas fuera del descuento del impuesto de basura.
- Notificaciones push o correos por cambio de nivel.

## 4. Decisiones de producto
Para esta primera version se adoptan estas decisiones:

1. Los puntos seran **persistidos en backend**.
2. Las reglas de nivel y descuento seran **fijas**.
3. La seccion estara disponible para usuarios autenticados de tipo **NATURAL** y **JURIDICO**.
4. El credito de puntos se asociara a **cursos completados**, no a reservas.
5. El frontend solo mostrara el resumen; el backend resolvera el nivel, progreso y descuento.

## 5. Estado actual del codigo
### Frontend
La navegacion principal se controla desde [`Frontend/src/App.tsx`](Frontend/src/App.tsx).

El layout del usuario natural vive en [`Frontend/src/vistas/persona/DisenoPersona.tsx`](Frontend/src/vistas/persona/DisenoPersona.tsx) y ya soporta vistas internas como:

- panel principal,
- cursos,
- estadisticas,
- configuracion.

La API de usuario vive en [`Frontend/src/api/usuario.ts`](Frontend/src/api/usuario.ts).

### Backend
La ruta centralizada de usuario y cursos ya existe en:

- [`Backend/internal/routes/routes.go`](Backend/internal/routes/routes.go)
- [`Backend/internal/services/usuario_service.go`](Backend/internal/services/usuario_service.go)
- [`Backend/internal/handlers/usuario_handlers.go`](Backend/internal/handlers/usuario_handlers.go)
- [`Backend/prisma/schema.prisma`](Backend/prisma/schema.prisma)

Tambien existe ya una base para estadisticas y abonos, pero **no existe aun un modulo de puntos**.

## 6. Propuesta funcional
### Datos a mostrar
La vista `Mis Puntos` deberia renderizar al menos:

- `Puntos acumulados`
- `Nivel actual`
- `Progreso al siguiente nivel`
- `Descuento aplicable`
- `Descripcion breve del beneficio`

### Estados de la vista
- **Carga**: mostrar skeleton o mensaje de carga.
- **Error**: mostrar mensaje comprensible y opcion de reintento.
- **Sin puntos**: mostrar estado inicial con CTA o mensaje educativo.
- **Nivel maximo**: mostrar progreso completo y aclarar que ya alcanzo el maximo beneficio.

## 7. Regla de negocio inicial
Se propone una tabla fija de niveles para la primera version:

| Rango de puntos | Nivel | Descuento |
| --- | --- | --- |
| 0 - 99 | Eco-Iniciado | 0% |
| 100 - 249 | Eco-Heroe | 5% |
| 250 - 499 | Guardian Verde | 10% |
| 500+ | Embajador Circular | 15% |

### Comportamiento esperado
- El nivel actual se calcula por el total acumulado.
- El progreso se calcula hacia el siguiente umbral.
- Si el usuario esta en el nivel maximo, el progreso queda completo.
- El descuento devuelto por backend sera el que la UI presenta sin recalcularlo.

## 8. Diseno tecnico
### 8.1 Frontend
Se agregara una nueva vista interna, por ejemplo:

- `Frontend/src/vistas/persona/MisPuntos.tsx`

Tambien se extendera:

- `Frontend/src/App.tsx` para habilitar la nueva vista,
- `Frontend/src/vistas/persona/DisenoPersona.tsx` para mostrar la opcion en el menu o header,
- `Frontend/src/api/usuario.ts` para consumir el resumen de puntos.

La vista debe:

- reutilizar el layout actual del panel,
- mantener coherencia visual con las demas secciones,
- usar una barra de progreso accesible,
- evitar depender de rutas nuevas o router global.

### 8.2 Backend
Se necesita una fuente de verdad para puntos. Hay dos piezas probables:

1. una tabla principal de acumulado de puntos por usuario,
2. una tabla de movimientos o acreditaciones para auditar como se sumaron.

La implementacion final deberia exponer un endpoint autenticado, por ejemplo:

- `GET /api/usuario/puntos`

Ese endpoint debe devolver algo equivalente a:

- total de puntos,
- nivel actual,
- porcentaje de descuento,
- progreso actual,
- progreso maximo del nivel siguiente,
- mensaje o label del beneficio.

### 8.3 Evento de acreditacion
Como hoy no hay un flujo formal de "curso completado", el plan requiere agregar el minimo necesario para registrar ese evento.

La idea es no mezclarlo con `ReservarCurso`. Reservar un curso es solo inscripcion; completar el curso es el momento en que se acreditan puntos.

### 8.4 Logica de puntos segun avance del curso
Para que el sistema realmente recompense el progreso y no solo el cierre final, se propone manejar una regla de acumulacion por etapas del curso.

#### Regla base
- Cada curso debe tener un valor base de puntos, por ejemplo `puntos_base`.
- El usuario gana puntos de forma proporcional al avance alcanzado.
- El avance debe calcularse con un porcentaje de progreso del curso, por ejemplo `progreso_pct`.
- Los puntos acumulados para una inscripcion se calculan como:

`puntos_ganados = puntos_base * factor_de_avance`

#### Factores de avance propuestos
| Progreso del curso | Factor de puntos | Interpretacion |
| --- | --- | --- |
| 0% - 24% | 0% | Solo inscripcion, aun no acredita puntos |
| 25% - 49% | 25% | Primer avance real en el contenido |
| 50% - 74% | 50% | El usuario ya avanzo la mitad del curso |
| 75% - 99% | 75% | Esta cerca de completarlo |
| 100% | 100% | Curso completado, se acreditan todos los puntos |

#### Ejemplo
Si un curso otorga `100` puntos base:

- al `30%` de avance se acreditan `25` puntos,
- al `60%` de avance se acreditan `50` puntos,
- al `90%` de avance se acreditan `75` puntos,
- al `100%` se acreditan `100` puntos.

#### Reglas de control
- Los puntos no deben duplicarse si el usuario vuelve a abrir el curso o refresca la pantalla.
- La acreditacion debe quedar registrada por curso e inscripcion para poder auditarla.
- Si el avance retrocede o el curso se cancela, los puntos no deben sumar automaticamente hacia arriba.
- Si el proyecto aun no tiene un sistema real de seguimiento de avance, el primer corte puede arrancar con una sola marca de `completado` y dejar preparado el modelo para etapas futuras.

### 8.5 Estructura de datos por etapas del curso
Para que la logica de puntos sea escalable, cada curso deberia modelarse con una estructura que permita saber cuanto vale, en que etapa va el usuario, cuantos puntos se liberan y cuando se considera completado.

#### Tabla: estructura base del curso
| Campo | Tipo sugerido | Descripcion |
| --- | --- | --- |
| `id` | string | Identificador unico del curso |
| `titulo` | string | Nombre visible del curso |
| `descripcion` | string | Resumen del contenido |
| `estado` | string | Estado del curso: planificado, activo o finalizado |
| `fecha_inicio` | string/date | Fecha de inicio |
| `fecha_fin` | string/date | Fecha de cierre |
| `categoria` | string | Categoria o nivel del curso |
| `imagen` | string | Imagen asociada al curso |
| `puntos_base` | number | Total de puntos que otorga el curso |
| `progreso_total` | number | Progreso objetivo, normalmente 100 |

#### Tabla: estructura de etapas del curso
| Campo | Tipo sugerido | Descripcion |
| --- | --- | --- |
| `orden` | number | Posicion de la etapa dentro del curso |
| `nombre` | string | Nombre visible de la etapa |
| `porcentaje_minimo` | number | Progreso minimo para entrar en la etapa |
| `porcentaje_maximo` | number | Progreso maximo para permanecer en la etapa |
| `puntos_otorgados` | number | Puntos que libera esa etapa |
| `es_final` | boolean | Indica si la etapa completa el curso |

#### Tabla: ejemplo de curso con etapas
| Orden | Etapa | Rango de progreso | Puntos otorgados | Final |
| --- | --- | --- | --- | --- |
| 1 | Inscripcion y bienvenida | 0% - 24% | 0 | No |
| 2 | Modulo inicial | 25% - 49% | 25 | No |
| 3 | Modulo intermedio | 50% - 74% | 50 | No |
| 4 | Modulo avanzado | 75% - 99% | 75 | No |
| 5 | Curso completado | 100% | 100 | Si |

#### Tabla: progreso del usuario en el curso
| Campo | Tipo sugerido | Descripcion |
| --- | --- | --- |
| `usuario_id` | string | Usuario autenticado que avanza en el curso |
| `curso_id` | string | Curso al que pertenece el progreso |
| `inscripcion_id` | string | Relacion con la inscripcion activa |
| `progreso_pct` | number | Porcentaje actual de avance |
| `etapa_actual` | string o number | Etapa alcanzada por el usuario |
| `puntos_acreditados` | number | Total de puntos ya liberados para ese curso |
| `completado` | boolean | Indica si el curso fue finalizado |
| `fecha_ultima_actualizacion` | date/time | Ultima vez que se recalculo el progreso |

#### Tabla: regla de calculo por etapa
| Regla | Comportamiento |
| --- | --- |
| Entrada a una nueva etapa | Se libera el puntaje asociado solo una vez |
| Avance dentro de la misma etapa | No se vuelve a sumar el mismo puntaje |
| Completar la ultima etapa | El curso se marca como completado y se libera el `puntos_base` total |
| Validacion backend | Se compara el puntaje ya acreditado con el que corresponde a la etapa actual para evitar duplicados |

#### Tabla: ejemplo de flujo de puntos
| Progreso | Etapa alcanzada | Puntos acumulados |
| --- | --- | --- |
| 30% | Etapa 2 | 25 puntos |
| 60% | Etapa 3 | 50 puntos |
| 80% | Etapa 4 | 75 puntos |
| 100% | Etapa 5 | 100 puntos |

#### Recomendacion tecnica
| Paso | Accion |
| --- | --- |
| 1 | Leer el progreso guardado del usuario |
| 2 | Determinar la etapa alcanzada |
| 3 | Comparar contra el ultimo puntaje registrado |
| 4 | Generar un movimiento de puntos solo si hay un salto real de etapa |

## 9. Flujo esperado
1. El usuario inicia sesion.
2. Entra al panel principal.
3. Selecciona `Mis Puntos`.
4. El frontend llama al endpoint autenticado.
5. El backend calcula o recupera:
   - total de puntos,
   - nivel,
   - progreso,
   - descuento.
6. El frontend renderiza la informacion y la barra de progreso.

## 10. Cambios por modulo
### Frontend
- Agregar la nueva vista `MisPuntos`.
- Agregar la opcion de navegacion en el panel.
- Mostrar tarjetas resumidas y barra de progreso.
- Manejar loading/error/empty states.
- Agregar pruebas del componente y de la navegacion.

### Backend
- Definir modelo Prisma para puntos.
- Crear repositorio o extender uno existente.
- Crear servicio para calcular nivel y descuento.
- Crear handler y ruta nueva.
- Asegurar autenticacion con el mismo sistema JWT.

### Cursos
- Agregar la marca de curso completado o el flujo equivalente.
- Disparar la acreditacion de puntos al completar un curso.

## 11. Criterios de aceptacion
La implementacion se considerara correcta si:

- el usuario autenticado ve una pestaña o seccion `Mis Puntos`,
- la pantalla muestra el total acumulado de puntos,
- la pantalla muestra el nivel actual,
- la pantalla muestra una barra de progreso hacia el siguiente nivel,
- la pantalla muestra el descuento aplicable al impuesto de basura,
- la informacion proviene del backend,
- la UI maneja carga, error y estado vacio,
- el acceso queda limitado a usuarios autenticados,
- no se rompen los paneles actuales de persona o empresa.

## 12. Casos de prueba
### Casos felices
- Usuario sin puntos.
- Usuario con puntos en nivel intermedio.
- Usuario en nivel maximo.

### Casos de error
- Token ausente o expirado.
- Endpoint no disponible.
- Usuario sin datos persistidos de puntos.

### Casos de UI
- La barra de progreso representa el porcentaje correcto.
- El texto del nivel coincide con el umbral.
- El descuento mostrado coincide con la regla del backend.

## 13. Riesgos y dependencias
- No existe aun un flujo de curso completado.
- No existe aun un modelo persistido de puntos.
- El descuento podria requerir validacion de negocio adicional si luego se quiere aplicar automaticamente al calculo de deuda.
- Si se deja el historial fuera, se pierde trazabilidad de como se sumaron los puntos.

## 14. Orden sugerido de implementacion
1. Definir modelo y endpoint backend.
2. Implementar calculo de nivel, progreso y descuento.
3. Conectar el evento de curso completado.
4. Crear la vista frontend y su navegacion.
5. Agregar pruebas.
6. Validar integracion completa con usuario autenticado.

## 15. Resultado esperado
Al terminar, el sistema debe permitir que un usuario autenticado entre a `Mis Puntos` y vea un resumen confiable de su avance, su nivel actual y el descuento que obtiene por su actividad de capacitacion.
