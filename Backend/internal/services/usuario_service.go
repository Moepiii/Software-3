/*
Ya se la saben xD

Este archivo unifica los servicios para los usuarios persona y empresa
*/
package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"context"
	"errors"
)

type UsuarioService struct {
	usuarioRepo repositories.UsuarioRepository
	deudaRepo   repositories.DeudaRepository
	estadoRepo  repositories.EstadoRepository
}

type DeudaResponse struct {
	Monto    float64 `json:"monto"`
	HasDeuda bool    `json:"has_deuda"`
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

// GetDeudaVigente ahora calcula: Monto Original - Total Abonado
func (s *UsuarioService) GetDeudaVigente(ctx context.Context, usuarioID string) (*DeudaResponse, error) {
	deudas, err := s.deudaRepo.FindVigentesByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	totalDeuda := 0.0
	for _, d := range deudas {
		totalDeuda += d.Monto
	}

	// Restamos lo que ya se ha abonado (necesitas implementar esta lógica en el repo)
	abonos, _ := s.deudaRepo.GetAllAbonosByUsuario(ctx, usuarioID)
	totalAbonado := 0.0
	for _, a := range abonos {
		totalAbonado += a.Monto
	}

	return &DeudaResponse{
		Monto:    totalDeuda - totalAbonado,
		HasDeuda: (totalDeuda - totalAbonado) > 0,
	}, nil
}

// RegistrarAbono es la nueva lógica de pago
func (s *UsuarioService) RegistrarAbono(ctx context.Context, usuarioID string, monto float64) error {
	deudas, err := s.deudaRepo.FindVigentesByUsuario(ctx, usuarioID)
	if err != nil || len(deudas) == 0 {
		return errors.New("no hay deudas vigentes para abonar")
	}

	// Tomamos la primera deuda vigente (o implementa lógica de prioridad FIFO)
	deuda := deudas[0]
	return s.deudaRepo.CreateAbono(ctx, deuda.ID, monto)
}

// GetEstadisticasUsuario calcula los 4 KPIs solicitados
func (s *UsuarioService) GetEstadisticasUsuario(ctx context.Context, usuarioID string) (map[string]interface{}, error) {
	abonos, err := s.deudaRepo.GetAllAbonosByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	totalAbonado := 0.0
	maxAbono := 0.0
	for _, a := range abonos {
		totalAbonado += a.Monto
		if a.Monto > maxAbono {
			maxAbono = a.Monto
		}
	}

	deuda, _ := s.GetDeudaVigente(ctx, usuarioID)

	return map[string]interface{}{
		"total_abonado":   totalAbonado,
		"maximo_abono":    maxAbono,
		"deuda_pendiente": deuda.Monto,
		"historial":       abonos,
	}, nil
}

// Métodos anteriores se mantienen igual...
func (s *UsuarioService) ListEstadosConTasa(ctx context.Context) ([]domain.EstadoConTasa, error) {
	return s.estadoRepo.ListAll(ctx)
}

func (s *UsuarioService) UpdateEstado(ctx context.Context, usuarioID string, estadoID string) error {
	return s.usuarioRepo.UpdateEstado(ctx, usuarioID, estadoID)
}
