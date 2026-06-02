package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"context"
)

type EmpresaService struct {
	empresaRepo repositories.EmpresaRepository
	deudaRepo   repositories.DeudaEmpresaRepository
	estadoRepo  repositories.EstadoRepository
}

func NewEmpresaService(
	empresaRepo repositories.EmpresaRepository,
	deudaRepo repositories.DeudaEmpresaRepository,
	estadoRepo repositories.EstadoRepository,
) *EmpresaService {
	return &EmpresaService{
		empresaRepo: empresaRepo,
		deudaRepo:   deudaRepo,
		estadoRepo:  estadoRepo,
	}
}

type EmpresaDeudaResponse struct {
	Monto    float64 `json:"monto"`
	HasDeuda bool    `json:"has_deuda"`
}

func (s *EmpresaService) GetDeudaVigente(ctx context.Context, rif string) (*EmpresaDeudaResponse, error) {
	deudas, err := s.deudaRepo.FindVigentesByEmpresa(ctx, rif)
	if err != nil {
		return nil, err
	}

	var total float64
	for _, d := range deudas {
		total += d.Monto
	}

	return &EmpresaDeudaResponse{
		Monto:    total,
		HasDeuda: len(deudas) > 0,
	}, nil
}

func (s *EmpresaService) ListEstadosConTasa(ctx context.Context) ([]domain.EstadoConTasa, error) {
	return s.estadoRepo.ListAll(ctx)
}

func (s *EmpresaService) UpdateEstado(ctx context.Context, rif string, estadoID string) error {
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
	return s.empresaRepo.UpdateEstado(ctx, rif, estadoID)
}

func (s *EmpresaService) PayDeuda(ctx context.Context, rif string) error {
	return s.deudaRepo.MarkAllAsPaid(ctx, rif)
}

