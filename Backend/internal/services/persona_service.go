package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"context"
)

type PersonaService struct {
	personaRepo repositories.PersonaRepository
	deudaRepo   repositories.DeudaRepository
	estadoRepo  repositories.EstadoRepository
}

func NewPersonaService(
	personaRepo repositories.PersonaRepository,
	deudaRepo repositories.DeudaRepository,
	estadoRepo repositories.EstadoRepository,
) *PersonaService {
	return &PersonaService{
		personaRepo: personaRepo,
		deudaRepo:   deudaRepo,
		estadoRepo:  estadoRepo,
	}
}

type DeudaResponse struct {
	Monto    float64 `json:"monto"`
	HasDeuda bool    `json:"has_deuda"`
}

func (s *PersonaService) GetDeudaVigente(ctx context.Context, cedula string) (*DeudaResponse, error) {
	deudas, err := s.deudaRepo.FindVigentesByPersona(ctx, cedula)
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

func (s *PersonaService) ListEstadosConTasa(ctx context.Context) ([]domain.EstadoConTasa, error) {
	return s.estadoRepo.ListAll(ctx)
}

func (s *PersonaService) UpdateEstado(ctx context.Context, cedula string, estadoID string) error {
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
	return s.personaRepo.UpdateEstado(ctx, cedula, estadoID)
}

func (s *PersonaService) PayDeuda(ctx context.Context, cedula string) error {
	return s.deudaRepo.MarkAllAsPaid(ctx, cedula)
}
