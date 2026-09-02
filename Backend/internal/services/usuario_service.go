package services

import (
	"Backend/internal/domain"
	"context"
	"sort"
)

type UsuarioRepository interface {
	GetUsuarioByID(ctx context.Context, id string) (*domain.Usuario, error)
	GetUsuarioByEmail(ctx context.Context, email string) (*domain.Usuario, error)
	GetUsuarioByEmailWithPassword(ctx context.Context, email string) (*domain.Usuario, string, error)
	CreateUsuario(ctx context.Context, usuario *domain.Usuario, passwordHash string) (*domain.Usuario, error)
	UpdateUsuario(ctx context.Context, id string, usuario *domain.Usuario) (*domain.Usuario, error)
	DeleteUsuario(ctx context.Context, id string) error
	GetUsuarios(ctx context.Context) ([]domain.Usuario, error)
}

type DeudaRepository interface {
	GetDeudaActual(ctx context.Context, usuarioID string) (*domain.Deuda, error)
	PayDeuda(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error)
	UpdateUserDebt(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error)
	GetAllAbonosByUsuario(ctx context.Context, usuarioID string) ([]domain.Abono, error)
}

type EstadoRepository interface {
	GetEstadosWithTasa(ctx context.Context) ([]domain.Estado, error)
}

type UsuarioService struct {
	usuarioRepo UsuarioRepository
	deudaRepo   DeudaRepository
	estadoRepo  EstadoRepository
}

func NewUsuarioService(
	usuarioRepo UsuarioRepository,
	deudaRepo DeudaRepository,
	estadoRepo EstadoRepository,
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
	deuda, err := s.deudaRepo.GetDeudaActual(ctx, usuarioID)
	if err != nil {
		return nil, err
	}
	abonos, err := s.deudaRepo.GetAllAbonosByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}
	if abonos == nil {
		abonos = []domain.Abono{}
	}
	sort.SliceStable(abonos, func(i, j int) bool { return abonos[i].Fecha < abonos[j].Fecha })

	totalAbonado := 0.0
	maximoAbono := 0.0
	historial := make([]map[string]interface{}, 0, len(abonos))
	for _, abono := range abonos {
		totalAbonado += abono.Monto
		if abono.Monto > maximoAbono {
			maximoAbono = abono.Monto
		}
		historial = append(historial, map[string]interface{}{
			"fecha": abono.Fecha,
			"monto": abono.Monto,
		})
	}

	stats := map[string]interface{}{
		"total_abonado":   totalAbonado,
		"maximo_abono":    maximoAbono,
		"deuda_pendiente": deuda.Monto,
		"historial":       historial,
	}
	return stats, nil
}

func (s *UsuarioService) GetUsuariosConDeuda(ctx context.Context) ([]map[string]interface{}, error) {
	usuarios, err := s.usuarioRepo.GetUsuarios(ctx)
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for _, u := range usuarios {
		if u.Role == "admin" || u.Tipo == "ADMIN" {
			continue
		}

		deuda, err := s.deudaRepo.GetDeudaActual(ctx, u.ID)
		if err != nil {
			return nil, err
		}

		result = append(result, map[string]interface{}{
			"id":             u.ID,
			"nombre":         u.Nombre,
			"email":          u.Email,
			"identificacion": u.Identificacion,
			"tipo":           u.Tipo,
			"deuda_monto":    deuda.Monto,
			"deuda_vigente":  deuda.Vigente,
		})
	}
	return result, nil
}

func (s *UsuarioService) UpdateUserDebt(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error) {
	return s.deudaRepo.UpdateUserDebt(ctx, usuarioID, monto)
}
