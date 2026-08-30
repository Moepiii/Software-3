package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
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
	inscripcion, err := r.client.Inscripcion.FindUnique(
		db.Inscripcion.UsuarioIDCursoID(
			db.Inscripcion.UsuarioID.Equals(usuarioID),
			db.Inscripcion.CursoID.Equals(cursoID),
		),
	).Exec(ctx)
	if err != nil {
		return 0, err
	}

	if progreso <= inscripcion.ProgresoPct {
		return 0, nil
	}

	curso, err := r.client.Curso.FindUnique(db.Curso.ID.Equals(cursoID)).Exec(ctx)
	if err != nil {
		return 0, err
	}

	factor := factorDeAvance(progreso)
	totalObjetivo := curso.PuntosBase * factor / 100
	puntosGanados := totalObjetivo - inscripcion.PuntosAcreditados
	estado := inscripcion.Estado
	if progreso == 100 {
		estado = "completada"
	}

	actualizacion := r.client.Inscripcion.FindUnique(
		db.Inscripcion.ID.Equals(inscripcion.ID),
	).Update(
		db.Inscripcion.ProgresoPct.Set(progreso),
		db.Inscripcion.PuntosAcreditados.Set(totalObjetivo),
		db.Inscripcion.Estado.Set(estado),
	)

	if puntosGanados <= 0 {
		_, err = actualizacion.Exec(ctx)
		return 0, err
	}

	movimiento := r.client.HistorialPuntos.CreateOne(
		db.HistorialPuntos.ProgresoPct.Set(factor),
		db.HistorialPuntos.PuntosGanados.Set(puntosGanados),
		db.HistorialPuntos.TotalAcreditado.Set(totalObjetivo),
		db.HistorialPuntos.Usuario.Link(db.Usuarios.ID.Equals(usuarioID)),
		db.HistorialPuntos.Curso.Link(db.Curso.ID.Equals(cursoID)),
		db.HistorialPuntos.Inscripcion.Link(db.Inscripcion.ID.Equals(inscripcion.ID)),
	)

	if err := r.client.Prisma.Transaction(actualizacion.Tx(), movimiento.Tx()).Exec(ctx); err != nil {
		return 0, err
	}
	return puntosGanados, nil
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
