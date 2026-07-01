package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type EstadoRepository struct {
	client *db.PrismaClient
}

func NewEstadoRepository(client *db.PrismaClient) *EstadoRepository {
	return &EstadoRepository{client: client}
}

func (r *EstadoRepository) GetEstadosWithTasa(ctx context.Context) ([]domain.Estado, error) {
	estados, err := r.client.Estado.FindMany().With(
		db.Estado.Tasas.Fetch().OrderBy(
			db.TasaEstado.ValidoDesde.Order(db.DESC),
		).Take(1),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var result []domain.Estado
	for _, e := range estados {
		tasa := 0.0
		tasas := e.Tasas()
		if len(tasas) > 0 {
			tasa = tasas[0].Porcentaje
		}

		result = append(result, domain.Estado{
			ID:         e.ID,
			Nombre:     e.Nombre,
			TasaActual: tasa,
		})
	}
	return result, nil
}
