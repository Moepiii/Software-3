package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"context"
	"errors"
)

type CursoService struct {
	repo *repositories.CursoRepository
}

func NewCursoService(repo *repositories.CursoRepository) *CursoService {
	return &CursoService{repo: repo}
}

func (s *CursoService) CreateCurso(ctx context.Context, req domain.CreateCursoRequest) (*domain.Curso, error) {
	if req.Titulo == "" || req.Descripcion == "" || req.FechaInicio == "" || req.FechaFin == "" {
		return nil, errors.New("faltan campos obligatorios")
	}

	estado := req.Estado
	if estado == "" {
		estado = "planificado"
	}

	curso := domain.Curso{
		Titulo:      req.Titulo,
		Descripcion: req.Descripcion,
		FechaInicio: req.FechaInicio,
		FechaFin:    req.FechaFin,
		Estado:      estado,
		Categoria:   req.Categoria,
		Imagen:      req.Imagen,
	}

	return s.repo.Create(ctx, curso)
}

func (s *CursoService) GetCursos(ctx context.Context) ([]domain.Curso, error) {
	return s.repo.GetAll(ctx)
}

func (s *CursoService) UpdateCurso(ctx context.Context, id string, updates domain.UpdateCursoRequest) (*domain.Curso, error) {
	if id == "" {
		return nil, errors.New("id del curso es requerido")
	}
	return s.repo.Update(ctx, id, updates)
}

func (s *CursoService) DeleteCurso(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("id del curso es requerido")
	}
	return s.repo.Delete(ctx, id)
}

func (s *CursoService) ReservarCurso(ctx context.Context, usuarioID string, cursoID string) error {
	if usuarioID == "" || cursoID == "" {
		return errors.New("id de usuario y curso son requeridos")
	}

	// Verificar si el curso existe y no está finalizado
	curso, err := s.repo.GetByID(ctx, cursoID)
	if err != nil {
		return errors.New("curso no encontrado")
	}

	if curso.Estado == "finalizado" {
		return errors.New("el curso ya ha finalizado y no se puede reservar")
	}

	// Verificar si ya está inscrito
	inscrito, err := s.repo.EstaInscrito(ctx, usuarioID, cursoID)
	if err != nil {
		return errors.New("error al verificar inscripción")
	}
	if inscrito {
		return errors.New("ya estás inscrito en este curso")
	}

	return s.repo.InscribirUsuario(ctx, usuarioID, cursoID)
}

func (s *CursoService) GetMisReservas(ctx context.Context, usuarioID string) ([]string, error) {
	if usuarioID == "" {
		return nil, errors.New("id de usuario es requerido")
	}
	return s.repo.GetInscripcionesUsuario(ctx, usuarioID)
}
