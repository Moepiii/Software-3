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
