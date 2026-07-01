package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"context"
)

type UsuarioService struct {
	usuarioRepo *repositories.UsuarioRepository
	deudaRepo   *repositories.DeudaRepository
	estadoRepo  *repositories.EstadoRepository
}

func NewUsuarioService(
	usuarioRepo *repositories.UsuarioRepository,
	deudaRepo *repositories.DeudaRepository,
	estadoRepo *repositories.EstadoRepository,
) *UsuarioService {
	return &UsuarioService{
		usuarioRepo: usuarioRepo,
		deudaRepo:   deudaRepo,
		estadoRepo:  estadoRepo,
	}
}

func (s *UsuarioService) GetUsuarioByID(ctx context.Context, id string) (*domain.Usuario, error) {
	return s.usuarioRepo.GetUsuarioByID(ctx, id)
}

func (s *UsuarioService) GetDeudaActual(ctx context.Context, usuarioID string) (*domain.Deuda, error) {
	return s.deudaRepo.GetDeudaActual(ctx, usuarioID)
}

func (s *UsuarioService) PayDeuda(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error) {
	return s.deudaRepo.PayDeuda(ctx, usuarioID, monto)
}

func (s *UsuarioService) GetEstados(ctx context.Context) ([]domain.Estado, error) {
	return s.estadoRepo.GetEstadosWithTasa(ctx)
}

func (s *UsuarioService) UpdateEstadoUsuario(ctx context.Context, usuarioID, estadoID string) error {
	usuario, err := s.usuarioRepo.GetUsuarioByID(ctx, usuarioID)
	if err != nil {
		return err
	}
	usuario.EstadoID = &estadoID
	_, err = s.usuarioRepo.UpdateUsuario(ctx, usuarioID, usuario)
	return err
}

func (s *UsuarioService) GetEstadisticas(ctx context.Context, usuarioID string) (map[string]interface{}, error) {
	deuda, _ := s.deudaRepo.GetDeudaActual(ctx, usuarioID)
	usuario, _ := s.usuarioRepo.GetUsuarioByID(ctx, usuarioID)

	stats := map[string]interface{}{
		"deuda":   deuda,
		"usuario": usuario,
	}
	return stats, nil
}
