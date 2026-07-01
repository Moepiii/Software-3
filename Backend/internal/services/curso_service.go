package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"context"
)

type CursoService struct {
	cursoRepo *repositories.CursoRepository
}

func NewCursoService(cursoRepo *repositories.CursoRepository) *CursoService {
	return &CursoService{cursoRepo: cursoRepo}
}

func (s *CursoService) CreateCurso(ctx context.Context, req domain.CreateCursoRequest) (*domain.Curso, error) {
	return s.cursoRepo.CreateCurso(ctx, req)
}

func (s *CursoService) GetCursos(ctx context.Context) ([]domain.Curso, error) {
	return s.cursoRepo.GetCursos(ctx)
}

func (s *CursoService) UpdateCurso(ctx context.Context, id string, req domain.UpdateCursoRequest) (*domain.Curso, error) {
	return s.cursoRepo.UpdateCurso(ctx, id, req)
}

func (s *CursoService) DeleteCurso(ctx context.Context, id string) error {
	return s.cursoRepo.DeleteCurso(ctx, id)
}

func (s *CursoService) ReservarCurso(ctx context.Context, usuarioID, cursoID string) error {
	return s.cursoRepo.ReservarCurso(ctx, usuarioID, cursoID)
}

func (s *CursoService) GetMisReservas(ctx context.Context, usuarioID string) ([]string, error) {
	return s.cursoRepo.GetMisReservas(ctx, usuarioID)
}

func (s *CursoService) GetMisCursos(ctx context.Context, usuarioID string) ([]domain.Curso, error) {
	return s.cursoRepo.GetMisCursos(ctx, usuarioID)
}

// 🆕 FinalizarCurso - Finalizar un curso y dar experiencia a los inscritos
func (s *CursoService) FinalizarCurso(ctx context.Context, cursoID string) (int, error) {
	return s.cursoRepo.FinalizarCurso(ctx, cursoID)
}
