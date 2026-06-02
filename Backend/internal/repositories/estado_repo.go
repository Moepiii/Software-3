package repositories

import (
	"Backend/internal/database"
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
	"time"
)

type EstadoRepository interface {
	ListAll(ctx context.Context) ([]domain.EstadoConTasa, error)
	GetByName(ctx context.Context, nombre string) (*domain.Estado, error)
	GetRateByEstadoID(ctx context.Context, estadoID string, refTime time.Time) (float64, error)
	CreateEstado(ctx context.Context, nombre string) (*domain.Estado, error)
	CreateTasa(ctx context.Context, estadoID string, porcentaje float64, validoDesde time.Time, validoHasta *time.Time) error
}

type estadoRepo struct {
	client *db.PrismaClient
}

func NewEstadoRepository(client *db.PrismaClient) EstadoRepository {
	return &estadoRepo{client: client}
}

func (r *estadoRepo) ListAll(ctx context.Context) ([]domain.EstadoConTasa, error) {
	now := time.Now()
	models, err := r.client.Estado.FindMany().With(
		db.Estado.Tasas.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]domain.EstadoConTasa, 0, len(models))
	for _, m := range models {
		var currentRate float64 = 0.0
		for _, t := range m.Tasas() {
			if t.ValidoDesde.Before(now) || t.ValidoDesde.Equal(now) {
				validoHasta, hasValidoHasta := t.ValidoHasta()
				if !hasValidoHasta || validoHasta.After(now) {
					currentRate = t.Porcentaje
					break
				}
			}
		}

		result = append(result, domain.EstadoConTasa{
			ID:         m.ID,
			Nombre:     m.Nombre,
			TasaActual: currentRate,
		})
	}
	return result, nil
}

func (r *estadoRepo) GetByName(ctx context.Context, nombre string) (*domain.Estado, error) {
	m, err := r.client.Estado.FindUnique(
		db.Estado.Nombre.Equals(nombre),
	).Exec(ctx)
	if err != nil {
		if err == database.ErrNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &domain.Estado{
		ID:     m.ID,
		Nombre: m.Nombre,
	}, nil
}

func (r *estadoRepo) GetRateByEstadoID(ctx context.Context, estadoID string, refTime time.Time) (float64, error) {
	tasas, err := r.client.TasaEstado.FindMany(
		db.TasaEstado.EstadoID.Equals(estadoID),
		db.TasaEstado.ValidoDesde.Lte(refTime),
	).OrderBy(
		db.TasaEstado.ValidoDesde.Order(db.SortOrderDesc),
	).Exec(ctx)
	if err != nil {
		return 0.0, err
	}

	for _, t := range tasas {
		validoHasta, hasValidoHasta := t.ValidoHasta()
		if !hasValidoHasta || validoHasta.After(refTime) {
			return t.Porcentaje, nil
		}
	}
	return 0.0, nil
}

func (r *estadoRepo) CreateEstado(ctx context.Context, nombre string) (*domain.Estado, error) {
	m, err := r.client.Estado.CreateOne(
		db.Estado.Nombre.Set(nombre),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}
	return &domain.Estado{
		ID:     m.ID,
		Nombre: m.Nombre,
	}, nil
}

func (r *estadoRepo) CreateTasa(ctx context.Context, estadoID string, porcentaje float64, validoDesde time.Time, validoHasta *time.Time) error {
	options := []db.TasaEstadoSetParam{
		db.TasaEstado.ValidoDesde.Set(validoDesde),
	}
	if validoHasta != nil {
		options = append(options, db.TasaEstado.ValidoHasta.Set(*validoHasta))
	}
	_, err := r.client.TasaEstado.CreateOne(
		db.TasaEstado.Porcentaje.Set(porcentaje),
		db.TasaEstado.Estado.Link(
			db.Estado.ID.Equals(estadoID),
		),
		options...,
	).Exec(ctx)
	return err
}
