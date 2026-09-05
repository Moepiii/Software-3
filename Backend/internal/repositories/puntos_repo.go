package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
	"errors"
)

type PuntosRepository interface {
	TotalByUsuario(ctx context.Context, usuarioID string) (int, error)
	CursosByUsuario(ctx context.Context, usuarioID string) ([]domain.CursoPuntosResumen, error)
	AcreditarProgreso(ctx context.Context, usuarioID, cursoID string, progreso int) (int, error)
}

func (r *puntosRepo) CursosByUsuario(ctx context.Context, usuarioID string) ([]domain.CursoPuntosResumen, error) {
	inscripciones, err := r.client.Inscripcion.FindMany(
		db.Inscripcion.UsuarioID.Equals(usuarioID),
	).With(
		db.Inscripcion.Curso.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	cursos := make([]domain.CursoPuntosResumen, 0, len(inscripciones))
	for _, inscripcion := range inscripciones {
		curso := inscripcion.Curso()
		cursos = append(cursos, domain.CursoPuntosResumen{
			CursoID:           curso.ID,
			Titulo:            curso.Titulo,
			Estado:            inscripcion.Estado,
			ProgresoPct:       inscripcion.ProgresoPct,
			PuntosAcreditados: inscripcion.PuntosAcreditados,
			PuntosBase:        curso.PuntosBase,
		})
	}
	return cursos, nil
}

func (r *puntosRepo) AcreditarProgreso(ctx context.Context, usuarioID, cursoID string, progreso int) (int, error) {
	if usuarioID == "" || cursoID == "" || progreso < 0 || progreso > 100 {
		return 0, errors.New("usuario, curso y progreso entre 0 y 100 son requeridos")
	}
	// Bloquear la inscripción antes de calcular el delta serializa solicitudes
	// concurrentes, incluso entre distintas instancias del backend. Actualización
	// e historial forman una sola sentencia: ambas se confirman o se revierten.
	// Los hitos ya acreditados no se recalculan si cambia el valor del curso.
	var resultado []struct {
		Estado  string `json:"estado"`
		Ganados int    `json:"ganados"`
	}
	err := r.client.Prisma.QueryRaw(`
 WITH bloqueada AS MATERIALIZED (
  SELECT i.id, i.estado, i.progreso_pct, i.puntos_acreditados, c.puntos_base
  FROM inscripciones i JOIN cursos c ON c.id = i.curso_id
  WHERE i.usuario_id = $1 AND i.curso_id = $2
  FOR UPDATE OF i
 ), objetivo AS (
  SELECT *, CASE WHEN $4::int > (progreso_pct / 25) * 25
   THEN GREATEST(puntos_acreditados, (puntos_base::bigint * $4::int / 100)::int)
   ELSE puntos_acreditados END AS total
  FROM bloqueada
 ), actualizada AS (
  UPDATE inscripciones i
  SET progreso_pct = $3::int, puntos_acreditados = o.total, updated_at = CURRENT_TIMESTAMP
  FROM objetivo o
  WHERE i.id = o.id AND o.estado <> 'cancelada' AND $3::int > o.progreso_pct
  RETURNING i.id, o.total, o.total - o.puntos_acreditados AS ganados
 ), movimiento AS (
  INSERT INTO historial_puntos
   (id, usuario_id, curso_id, inscripcion_id, progreso_pct, puntos_ganados, total_acreditado)
  SELECT gen_random_uuid()::text, $1, $2, id, $4::int, ganados, total
  FROM actualizada WHERE ganados > 0
  RETURNING puntos_ganados
 )
 SELECT estado, COALESCE((SELECT SUM(puntos_ganados)::int FROM movimiento), 0) AS ganados
 FROM bloqueada`, usuarioID, cursoID, progreso, factorDeAvance(progreso)).Exec(ctx, &resultado)
	if err != nil {
		return 0, err
	}
	if len(resultado) == 0 {
		return 0, db.ErrNotFound
	}
	if resultado[0].Estado == "cancelada" {
		return 0, errors.New("no se puede acreditar progreso a una inscripción cancelada")
	}
	// La finalización existente conserva el control del estado y de la EXP.
	return resultado[0].Ganados, nil
}

func factorDeAvance(progreso int) int {
	switch {
	case progreso >= 100:
		return 100
	case progreso >= 75:
		return 75
	case progreso >= 50:
		return 50
	case progreso >= 25:
		return 25
	default:
		return 0
	}
}

type puntosRepo struct {
	client *db.PrismaClient
}

func NewPuntosRepository(client *db.PrismaClient) PuntosRepository {
	return &puntosRepo{client: client}
}

func (r *puntosRepo) TotalByUsuario(ctx context.Context, usuarioID string) (int, error) {
	movimientos, err := r.client.HistorialPuntos.FindMany(
		db.HistorialPuntos.UsuarioID.Equals(usuarioID),
	).Exec(ctx)
	if err != nil {
		return 0, err
	}

	total := 0
	for _, movimiento := range movimientos {
		total += movimiento.PuntosGanados
	}
	return total, nil
}
