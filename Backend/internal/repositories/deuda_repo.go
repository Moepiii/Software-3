package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type DeudaRepository struct {
	client *db.PrismaClient
}

func NewDeudaRepository(client *db.PrismaClient) *DeudaRepository {
	return &DeudaRepository{client: client}
}

func (r *DeudaRepository) GetDeudaActual(ctx context.Context, usuarioID string) (*domain.Deuda, error) {
	deuda, err := r.client.Deuda.FindFirst(
		db.Deuda.UsuarioID.Equals(usuarioID),
		db.Deuda.Vigente.Equals(true),
	).Exec(ctx)
	if err != nil {
		if err == db.ErrNotFound {
			return &domain.Deuda{
				Monto:   0,
				Vigente: false,
			}, nil
		}
		return nil, err
	}

	return &domain.Deuda{
		ID:        deuda.ID,
		UsuarioID: deuda.UsuarioID,
		Monto:     deuda.Monto,
		Vigente:   deuda.Vigente,
	}, nil
}

func (r *DeudaRepository) PayDeuda(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error) {
	// Obtener deuda actual
	deuda, err := r.GetDeudaActual(ctx, usuarioID)
	if err != nil {
		return nil, err
	}
	if deuda.ID == "" {
		return nil, domain.ErrNotFound
	}

	// Crear abono
	_, err = r.client.Abono.CreateOne(
		db.Abono.Monto.Set(monto),
		db.Abono.Deuda.Link(
			db.Deuda.ID.Equals(deuda.ID),
		),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	// Calcular nuevo monto de deuda
	nuevoMonto := deuda.Monto - monto
	if nuevoMonto < 0 {
		nuevoMonto = 0
	}

	// Actualizar deuda
	updated, err := r.client.Deuda.FindUnique(
		db.Deuda.ID.Equals(deuda.ID),
	).Update(
		db.Deuda.Monto.Set(nuevoMonto),
		db.Deuda.Vigente.Set(nuevoMonto > 0),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	return &domain.Deuda{
		ID:        updated.ID,
		UsuarioID: updated.UsuarioID,
		Monto:     updated.Monto,
		Vigente:   updated.Vigente,
	}, nil
}

func (r *DeudaRepository) UpdateUserDebt(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error) {
	deuda, err := r.client.Deuda.FindFirst(
		db.Deuda.UsuarioID.Equals(usuarioID),
		db.Deuda.Vigente.Equals(true),
	).Exec(ctx)

	if err != nil {
		if err == db.ErrNotFound {
			if monto <= 0 {
				return &domain.Deuda{Monto: 0, Vigente: false}, nil
			}
			nuevaDeuda, err := r.client.Deuda.CreateOne(
				db.Deuda.Monto.Set(monto),
				db.Deuda.Usuario.Link(
					db.Usuarios.ID.Equals(usuarioID),
				),
				db.Deuda.Vigente.Set(true),
			).Exec(ctx)
			if err != nil {
				return nil, err
			}
			return &domain.Deuda{
				ID:        nuevaDeuda.ID,
				UsuarioID: nuevaDeuda.UsuarioID,
				Monto:     nuevaDeuda.Monto,
				Vigente:   nuevaDeuda.Vigente,
			}, nil
		}
		return nil, err
	}

	if monto <= 0 {
		updated, err := r.client.Deuda.FindUnique(
			db.Deuda.ID.Equals(deuda.ID),
		).Update(
			db.Deuda.Monto.Set(0),
			db.Deuda.Vigente.Set(false),
		).Exec(ctx)
		if err != nil {
			return nil, err
		}
		return &domain.Deuda{
			ID:        updated.ID,
			UsuarioID: updated.UsuarioID,
			Monto:     updated.Monto,
			Vigente:   updated.Vigente,
		}, nil
	}

	updated, err := r.client.Deuda.FindUnique(
		db.Deuda.ID.Equals(deuda.ID),
	).Update(
		db.Deuda.Monto.Set(monto),
		db.Deuda.Vigente.Set(true),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	return &domain.Deuda{
		ID:        updated.ID,
		UsuarioID: updated.UsuarioID,
		Monto:     updated.Monto,
		Vigente:   updated.Vigente,
	}, nil
}

