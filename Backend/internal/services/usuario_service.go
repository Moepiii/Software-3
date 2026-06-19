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

// GetDeudaVigente ahora calcula de forma precisa la suma pendiente real
func (s *UsuarioService) GetDeudaVigente(ctx context.Context, usuarioID string) (*DeudaResponse, error) {
	deudas, err := s.deudaRepo.FindVigentesByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	totalDeuda := 0.0
	for _, d := range deudas {
		totalDeuda += d.Monto
	}

	abonos, err := s.deudaRepo.GetAllAbonosByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	totalAbonado := 0.0
	for _, a := range abonos {
		totalAbonado += a.Monto
	}

	montoPendiente := totalDeuda - totalAbonado
	if montoPendiente < 0 {
		montoPendiente = 0
	}

	return &DeudaResponse{
		Monto:    montoPendiente,
		HasDeuda: montoPendiente > 0,
	}, nil
}

// RegistrarAbono ahora cierra la deuda automáticamente si se salda por completo
func (s *UsuarioService) RegistrarAbono(ctx context.Context, usuarioID string, monto float64) error {
	if monto <= 0 {
		return errors.New("el monto del abono debe ser mayor a cero")
	}

	deudas, err := s.deudaRepo.FindVigentesByUsuario(ctx, usuarioID)
	if err != nil {
		return err
	}
	if len(deudas) == 0 {
		return errors.New("no hay deudas vigentes para abonar")
	}

	// Estrategia FIFO: Abonamos a la deuda más antigua que esté vigente
	deuda := deudas[0]

	// Buscamos cuánto se ha abonado específicamente a ESTA deuda anteriormente
	// Nota: Para sistemas multi-deuda es ideal filtrar abonos por deuda.ID en el futuro
	abonos, err := s.deudaRepo.GetAllAbonosByUsuario(ctx, usuarioID)
	if err != nil {
		return err
	}

	totalAbonadoAnterior := 0.0
	for _, a := range abonos {
		if a.DeudaID == deuda.ID {
			totalAbonadoAnterior += a.Monto
		}
	}

	saldoPendienteDeuda := deuda.Monto - totalAbonadoAnterior

	if monto > saldoPendienteDeuda {
		return errors.New("el monto del abono supera el saldo pendiente de la deuda")
	}

	// 1. Registramos el abono real en la tabla de Abonos
	err = s.deudaRepo.CreateAbono(ctx, deuda.ID, monto)
	if err != nil {
		return err
	}

	// 2. Si el nuevo abono liquida la deuda, la desactivamos (Vigente = false)
	if (totalAbonadoAnterior + monto) >= deuda.Monto {
		err = s.deudaRepo.UpdateEstadoDeuda(ctx, deuda.ID, false)
		if err != nil {
			return err
		}
	}

	return nil
}

// GetEstadisticasUsuario expone de manera limpia la data calculada para los KPIs
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

	deudaResp, err := s.GetDeudaVigente(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_abonado":   totalAbonado,
		"maximo_abono":    maxAbono,
		"deuda_pendiente": deudaResp.Monto,
		"historial":       abonos,
	}, nil
}

func (s *UsuarioService) ListEstadosConTasa(ctx context.Context) ([]domain.EstadoConTasa, error) {
	return s.estadoRepo.ListAll(ctx)
}

func (s *UsuarioService) UpdateEstado(ctx context.Context, usuarioID string, estadoID string) error {
	return s.usuarioRepo.UpdateEstado(ctx, usuarioID, estadoID)
}
