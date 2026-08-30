package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type CursoRepository struct {
	client *db.PrismaClient
}

func NewCursoRepository(client *db.PrismaClient) *CursoRepository {
	return &CursoRepository{client: client}
}

func (r *CursoRepository) CreateCurso(ctx context.Context, req domain.CreateCursoRequest) (*domain.Curso, error) {
	estado := req.Estado
	if estado == "" {
		estado = "planificado"
	}

	curso, err := r.client.Curso.CreateOne(
		db.Curso.Titulo.Set(req.Titulo),
		db.Curso.Descripcion.Set(req.Descripcion),
		db.Curso.FechaInicio.Set(req.FechaInicio),
		db.Curso.FechaFin.Set(req.FechaFin),
		db.Curso.Estado.Set(estado),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	if req.PuntosBase > 0 || (req.Categoria != nil && *req.Categoria != "") || (req.Imagen != nil && *req.Imagen != "") {
		updateParams := []db.CursoSetParam{}
		if req.PuntosBase > 0 {
			updateParams = append(updateParams, db.Curso.PuntosBase.Set(req.PuntosBase))
		}
		if req.Categoria != nil && *req.Categoria != "" {
			updateParams = append(updateParams, db.Curso.Categoria.Set(*req.Categoria))
		}
		if req.Imagen != nil && *req.Imagen != "" {
			updateParams = append(updateParams, db.Curso.Imagen.Set(*req.Imagen))
		}

		if len(updateParams) > 0 {
			curso, err = r.client.Curso.FindUnique(
				db.Curso.ID.Equals(curso.ID),
			).Update(updateParams...).Exec(ctx)
			if err != nil {
				return nil, err
			}
		}
	}

	var categoria *string
	if val, ok := curso.Categoria(); ok && val != "" {
		categoria = &val
	}
	var imagen *string
	if val, ok := curso.Imagen(); ok && val != "" {
		imagen = &val
	}

	return &domain.Curso{
		ID:          curso.ID,
		PuntosBase:  curso.PuntosBase,
		Titulo:      curso.Titulo,
		Descripcion: curso.Descripcion,
		FechaInicio: curso.FechaInicio,
		FechaFin:    curso.FechaFin,
		Estado:      curso.Estado,
		Categoria:   categoria,
		Imagen:      imagen,
	}, nil
}

func (r *CursoRepository) GetCursos(ctx context.Context) ([]domain.Curso, error) {
	cursos, err := r.client.Curso.FindMany().Exec(ctx)
	if err != nil {
		return nil, err
	}

	var result []domain.Curso
	for _, c := range cursos {
		var categoria *string
		if val, ok := c.Categoria(); ok && val != "" {
			categoria = &val
		}
		var imagen *string
		if val, ok := c.Imagen(); ok && val != "" {
			imagen = &val
		}

		result = append(result, domain.Curso{
			ID:          c.ID,
			PuntosBase:  c.PuntosBase,
			Titulo:      c.Titulo,
			Descripcion: c.Descripcion,
			FechaInicio: c.FechaInicio,
			FechaFin:    c.FechaFin,
			Estado:      c.Estado,
			Categoria:   categoria,
			Imagen:      imagen,
		})
	}
	return result, nil
}

func (r *CursoRepository) UpdateCurso(ctx context.Context, id string, req domain.UpdateCursoRequest) (*domain.Curso, error) {
	params := []db.CursoSetParam{}
	if req.PuntosBase != nil && *req.PuntosBase > 0 {
		params = append(params, db.Curso.PuntosBase.Set(*req.PuntosBase))
	}
	if req.Titulo != nil {
		params = append(params, db.Curso.Titulo.Set(*req.Titulo))
	}
	if req.Descripcion != nil {
		params = append(params, db.Curso.Descripcion.Set(*req.Descripcion))
	}
	if req.FechaInicio != nil {
		params = append(params, db.Curso.FechaInicio.Set(*req.FechaInicio))
	}
	if req.FechaFin != nil {
		params = append(params, db.Curso.FechaFin.Set(*req.FechaFin))
	}
	if req.Estado != nil {
		params = append(params, db.Curso.Estado.Set(*req.Estado))
	}
	if req.Categoria != nil {
		params = append(params, db.Curso.Categoria.Set(*req.Categoria))
	}
	if req.Imagen != nil {
		params = append(params, db.Curso.Imagen.Set(*req.Imagen))
	}

	curso, err := r.client.Curso.FindUnique(
		db.Curso.ID.Equals(id),
	).Update(params...).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var categoria *string
	if val, ok := curso.Categoria(); ok && val != "" {
		categoria = &val
	}
	var imagen *string
	if val, ok := curso.Imagen(); ok && val != "" {
		imagen = &val
	}

	return &domain.Curso{
		ID:          curso.ID,
		PuntosBase:  curso.PuntosBase,
		Titulo:      curso.Titulo,
		Descripcion: curso.Descripcion,
		FechaInicio: curso.FechaInicio,
		FechaFin:    curso.FechaFin,
		Estado:      curso.Estado,
		Categoria:   categoria,
		Imagen:      imagen,
	}, nil
}

func (r *CursoRepository) DeleteCurso(ctx context.Context, id string) error {
	_, err := r.client.Curso.FindUnique(
		db.Curso.ID.Equals(id),
	).Delete().Exec(ctx)
	return err
}

func (r *CursoRepository) ReservarCurso(ctx context.Context, usuarioID, cursoID string) error {
	_, err := r.client.Inscripcion.CreateOne(
		db.Inscripcion.Usuario.Link(
			db.Usuarios.ID.Equals(usuarioID),
		),
		db.Inscripcion.Curso.Link(
			db.Curso.ID.Equals(cursoID),
		),
		db.Inscripcion.Estado.Set("activa"),
	).Exec(ctx)
	return err
}

func (r *CursoRepository) GetMisReservas(ctx context.Context, usuarioID string) ([]string, error) {
	inscripciones, err := r.client.Inscripcion.FindMany(
		db.Inscripcion.UsuarioID.Equals(usuarioID),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var ids []string
	for _, ins := range inscripciones {
		ids = append(ids, ins.CursoID)
	}
	return ids, nil
}

func (r *CursoRepository) GetMisCursos(ctx context.Context, usuarioID string) ([]domain.Curso, error) {
	inscripciones, err := r.client.Inscripcion.FindMany(
		db.Inscripcion.UsuarioID.Equals(usuarioID),
		db.Inscripcion.Estado.Equals("activa"),
	).With(
		db.Inscripcion.Curso.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var cursos []domain.Curso
	for _, ins := range inscripciones {
		cursoModel := ins.Curso()
		if cursoModel != nil {
			var categoria *string
			if val, ok := cursoModel.Categoria(); ok && val != "" {
				categoria = &val
			}
			var imagen *string
			if val, ok := cursoModel.Imagen(); ok && val != "" {
				imagen = &val
			}

			cursos = append(cursos, domain.Curso{
				ID:          cursoModel.ID,
				PuntosBase:  cursoModel.PuntosBase,
				Titulo:      cursoModel.Titulo,
				Descripcion: cursoModel.Descripcion,
				FechaInicio: cursoModel.FechaInicio,
				FechaFin:    cursoModel.FechaFin,
				Estado:      cursoModel.Estado,
				Categoria:   categoria,
				Imagen:      imagen,
			})
		}
	}
	return cursos, nil
}

// 🆕 FinalizarCurso - Marcar curso como finalizado y dar experiencia a los usuarios inscritos
func (r *CursoRepository) FinalizarCurso(ctx context.Context, cursoID string) (int, error) {
	// 1. Obtener todos los usuarios inscritos en el curso con estado "activa"
	inscripciones, err := r.client.Inscripcion.FindMany(
		db.Inscripcion.CursoID.Equals(cursoID),
		db.Inscripcion.Estado.Equals("activa"),
	).With(
		db.Inscripcion.Usuario.Fetch(),
	).Exec(ctx)
	if err != nil {
		return 0, err
	}

	if len(inscripciones) == 0 {
		// Actualizar el curso a finalizado aunque no tenga inscripciones
		_, err = r.client.Curso.FindUnique(
			db.Curso.ID.Equals(cursoID),
		).Update(
			db.Curso.Estado.Set("finalizado"),
		).Exec(ctx)
		return 0, err
	}

	// 2. Actualizar el estado del curso a "finalizado"
	_, err = r.client.Curso.FindUnique(
		db.Curso.ID.Equals(cursoID),
	).Update(
		db.Curso.Estado.Set("finalizado"),
	).Exec(ctx)
	if err != nil {
		return 0, err
	}

	// 3. Dar 100 EXP a cada usuario inscrito y marcar inscripción como completada
	experienciaGanada := 100
	usuariosAfectados := 0

	for _, ins := range inscripciones {
		usuario := ins.Usuario()
		if usuario == nil {
			continue
		}

		// Completar los puntos pendientes sin alterar la recompensa de gamificación.
		if _, err := NewPuntosRepository(r.client).AcreditarProgreso(ctx, usuario.ID, cursoID, 100); err != nil {
			return usuariosAfectados, err
		}

		// Obtener experiencia actual
		expActual := usuario.Experiencia

		// Sumar experiencia
		nuevaExp := expActual + experienciaGanada

		// Calcular nuevo nivel (1000 EXP por nivel)
		nuevoNivel := nuevaExp / 1000

		// Actualizar usuario
		_, err = r.client.Usuarios.FindUnique(
			db.Usuarios.ID.Equals(usuario.ID),
		).Update(
			db.Usuarios.Experiencia.Set(nuevaExp),
			db.Usuarios.Nivel.Set(nuevoNivel),
		).Exec(ctx)
		if err != nil {
			continue
		}

		// Marcar inscripción como completada
		_, err = r.client.Inscripcion.FindUnique(
			db.Inscripcion.ID.Equals(ins.ID),
		).Update(
			db.Inscripcion.Estado.Set("completada"),
		).Exec(ctx)
		if err != nil {
			continue
		}

		usuariosAfectados++
	}

	return usuariosAfectados, nil
}
