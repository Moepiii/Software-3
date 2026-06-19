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

func (r *CursoRepository) Create(ctx context.Context, curso domain.Curso) (*domain.Curso, error) {
	var categoria *string
	var imagen *string

	if curso.Categoria != nil && *curso.Categoria != "" {
		categoria = curso.Categoria
	}
	if curso.Imagen != nil && *curso.Imagen != "" {
		imagen = curso.Imagen
	}

	options := []db.CursoSetParam{
		db.Curso.Estado.Set(curso.Estado),
	}

	if categoria != nil {
		options = append(options, db.Curso.Categoria.Set(*categoria))
	}
	if imagen != nil {
		options = append(options, db.Curso.Imagen.Set(*imagen))
	}

	created, err := r.client.Curso.CreateOne(
		db.Curso.Titulo.Set(curso.Titulo),
		db.Curso.Descripcion.Set(curso.Descripcion),
		db.Curso.FechaInicio.Set(curso.FechaInicio),
		db.Curso.FechaFin.Set(curso.FechaFin),
		options...,
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	cat, _ := created.Categoria()
	img, _ := created.Imagen()

	return &domain.Curso{
		ID:          created.ID,
		Titulo:      created.Titulo,
		Descripcion: created.Descripcion,
		FechaInicio: created.FechaInicio,
		FechaFin:    created.FechaFin,
		Estado:      created.Estado,
		Categoria:   &cat,
		Imagen:      &img,
		CreatedAt:   created.CreatedAt,
		UpdatedAt:   created.UpdatedAt,
	}, nil
}

func (r *CursoRepository) GetAll(ctx context.Context) ([]domain.Curso, error) {
	cursos, err := r.client.Curso.FindMany().Exec(ctx)
	if err != nil {
		return nil, err
	}

	var result []domain.Curso
	for _, c := range cursos {
		cat, _ := c.Categoria()
		img, _ := c.Imagen()

		result = append(result, domain.Curso{
			ID:          c.ID,
			Titulo:      c.Titulo,
			Descripcion: c.Descripcion,
			FechaInicio: c.FechaInicio,
			FechaFin:    c.FechaFin,
			Estado:      c.Estado,
			Categoria:   &cat,
			Imagen:      &img,
			CreatedAt:   c.CreatedAt,
			UpdatedAt:   c.UpdatedAt,
		})
	}
	return result, nil
}

func (r *CursoRepository) GetByID(ctx context.Context, id string) (*domain.Curso, error) {
	c, err := r.client.Curso.FindUnique(
		db.Curso.ID.Equals(id),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	cat, _ := c.Categoria()
	img, _ := c.Imagen()

	return &domain.Curso{
		ID:          c.ID,
		Titulo:      c.Titulo,
		Descripcion: c.Descripcion,
		FechaInicio: c.FechaInicio,
		FechaFin:    c.FechaFin,
		Estado:      c.Estado,
		Categoria:   &cat,
		Imagen:      &img,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}, nil
}


func (r *CursoRepository) Update(ctx context.Context, id string, updates domain.UpdateCursoRequest) (*domain.Curso, error) {
	var setParams []db.CursoSetParam

	if updates.Titulo != nil {
		setParams = append(setParams, db.Curso.Titulo.Set(*updates.Titulo))
	}
	if updates.Descripcion != nil {
		setParams = append(setParams, db.Curso.Descripcion.Set(*updates.Descripcion))
	}
	if updates.FechaInicio != nil {
		setParams = append(setParams, db.Curso.FechaInicio.Set(*updates.FechaInicio))
	}
	if updates.FechaFin != nil {
		setParams = append(setParams, db.Curso.FechaFin.Set(*updates.FechaFin))
	}
	if updates.Estado != nil {
		setParams = append(setParams, db.Curso.Estado.Set(*updates.Estado))
	}
	if updates.Categoria != nil {
		setParams = append(setParams, db.Curso.Categoria.Set(*updates.Categoria))
	}
	if updates.Imagen != nil {
		setParams = append(setParams, db.Curso.Imagen.Set(*updates.Imagen))
	}

	updated, err := r.client.Curso.FindUnique(
		db.Curso.ID.Equals(id),
	).Update(setParams...).Exec(ctx)

	if err != nil {
		return nil, err
	}

	cat, _ := updated.Categoria()
	img, _ := updated.Imagen()

	return &domain.Curso{
		ID:          updated.ID,
		Titulo:      updated.Titulo,
		Descripcion: updated.Descripcion,
		FechaInicio: updated.FechaInicio,
		FechaFin:    updated.FechaFin,
		Estado:      updated.Estado,
		Categoria:   &cat,
		Imagen:      &img,
		CreatedAt:   updated.CreatedAt,
		UpdatedAt:   updated.UpdatedAt,
	}, nil
}

func (r *CursoRepository) Delete(ctx context.Context, id string) error {
	_, err := r.client.Curso.FindUnique(
		db.Curso.ID.Equals(id),
	).Delete().Exec(ctx)
	return err
}

func (r *CursoRepository) InscribirUsuario(ctx context.Context, usuarioID string, cursoID string) error {
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

func (r *CursoRepository) GetInscripcionesUsuario(ctx context.Context, usuarioID string) ([]string, error) {
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

func (r *CursoRepository) EstaInscrito(ctx context.Context, usuarioID, cursoID string) (bool, error) {
	inscripciones, err := r.client.Inscripcion.FindMany(
		db.Inscripcion.UsuarioID.Equals(usuarioID),
		db.Inscripcion.CursoID.Equals(cursoID),
	).Exec(ctx)
	if err != nil {
		return false, err
	}
	return len(inscripciones) > 0, nil
}

