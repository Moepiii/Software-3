/*
Ya se la saben xD

Este archivo unifica los servicios para los usuarios persona y empresa
*/
package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"context"
)

type UsuarioService struct {
	usuarioRepo repositories.UsuarioRepository
	deudaRepo   repositories.DeudaRepository
	estadoRepo  repositories.EstadoRepository
}

func NewUsuarioService(
	usuarioRepo repositories.UsuarioRepository,
	deudaRepo repositories.DeudaRepository,
	estadoRepo repositories.EstadoRepository,
) *UsuarioService {
	return &UsuarioService{
		usuarioRepo: usuarioRepo,
		deudaRepo:   deudaRepo,
		estadoRepo:  estadoRepo,
	}
}

type DeudaResponse struct {
	Monto    float64 `json:"monto"`
	HasDeuda bool    `json:"has_deuda"`
}

func (s *UsuarioService) GetDeudaVigente(ctx context.Context, usuarioID string) (*DeudaResponse, error) {
	deudas, err := s.deudaRepo.FindVigentesByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	var total float64 = 0.0
	for _, d := range deudas {
		total += d.Monto
	}

	return &DeudaResponse{
		Monto:    total,
		HasDeuda: len(deudas) > 0,
	}, nil
}

func (s *UsuarioService) ListEstadosConTasa(ctx context.Context) ([]domain.EstadoConTasa, error) {
	return s.estadoRepo.ListAll(ctx)
}

func (s *UsuarioService) UpdateEstado(ctx context.Context, usuarioID string, estadoID string) error {
	if estadoID != "" {
		states, err := s.estadoRepo.ListAll(ctx)
		if err != nil {
			return err
		}
		found := false
		for _, state := range states {
			if state.ID == estadoID {
				found = true
				break
			}
		}
		if !found {
			return domain.ErrInvalidInput
		}
	}
	return s.usuarioRepo.UpdateEstado(ctx, usuarioID, estadoID)
}

func (s *UsuarioService) PayDeuda(ctx context.Context, usuarioID string) error {
	return s.deudaRepo.MarkAllAsPaid(ctx, usuarioID)
}
