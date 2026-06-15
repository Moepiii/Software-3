package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type DeudaRepository interface {
	FindVigentesByUsuario(ctx context.Context, usuarioID string) ([]domain.Deuda, error)
	Create(ctx context.Context, d domain.Deuda) error
	// Registrar un abono a una deuda específica
	CreateAbono(ctx context.Context, deudaID string, monto float64) error
	// Obtener todos los abonos de un usuario para las estadísticas
	GetAllAbonosByUsuario(ctx context.Context, usuarioID string) ([]domain.Abono, error)
	// Cambiar estado de vigencia de una deuda
	UpdateEstadoDeuda(ctx context.Context, deudaID string, vigente bool) error
}

type deudaRepo struct {
	client *db.PrismaClient
}

func NewDeudaRepository(client *db.PrismaClient) DeudaRepository {
	return &deudaRepo{client: client}
}

func (r *deudaRepo) FindVigentesByUsuario(ctx context.Context, usuarioID string) ([]domain.Deuda, error) {
	models, err := r.client.Deuda.FindMany(
		db.Deuda.UsuarioID.Equals(usuarioID),
		db.Deuda.Vigente.Equals(true),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	result := make([]domain.Deuda, 0, len(models))
	for _, m := range models {
		result = append(result, domain.Deuda{
			ID:        m.ID,
			UsuarioID: m.UsuarioID,
			Monto:     m.Monto,
			Vigente:   m.Vigente,
			CreatedAt: m.CreatedAt.String(),
		})
	}
	return result, nil
}

func (r *deudaRepo) Create(ctx context.Context, d domain.Deuda) error {
	_, err := r.client.Deuda.CreateOne(
		db.Deuda.Monto.Set(d.Monto),
		db.Deuda.Usuario.Link(db.Usuarios.ID.Equals(d.UsuarioID)),
		db.Deuda.Vigente.Set(true),
	).Exec(ctx)
	return err
}

// Crear un nuevo abono
func (r *deudaRepo) CreateAbono(ctx context.Context, deudaID string, monto float64) error {
	_, err := r.client.Abono.CreateOne(
		db.Abono.Monto.Set(monto),
		db.Abono.Deuda.Link(
			db.Deuda.ID.Equals(deudaID),
		),
	).Exec(ctx)
	return err
}

// Obtener historial de abonos de un usuario (a través de sus deudas)
func (r *deudaRepo) GetAllAbonosByUsuario(ctx context.Context, usuarioID string) ([]domain.Abono, error) {
	models, err := r.client.Abono.FindMany(
		db.Abono.Deuda.Where(db.Deuda.UsuarioID.Equals(usuarioID)),
	).OrderBy(db.Abono.Fecha.Order(db.SortOrderDesc)).Exec(ctx)

	if err != nil {
		return nil, err
	}

	result := make([]domain.Abono, 0, len(models))
	for _, m := range models {
		result = append(result, domain.Abono{
			ID:      m.ID,
			DeudaID: m.DeudaID,
			Monto:   m.Monto,
			Fecha:   m.Fecha.String(),
		})
	}
	return result, nil
}

// Cambiar estado de vigencia de una deuda
func (r *deudaRepo) UpdateEstadoDeuda(ctx context.Context, deudaID string, vigente bool) error {
	_, err := r.client.Deuda.FindUnique(
		db.Deuda.ID.Equals(deudaID),
	).Update(
		db.Deuda.Vigente.Set(vigente),
	).Exec(ctx)
	return err
}
