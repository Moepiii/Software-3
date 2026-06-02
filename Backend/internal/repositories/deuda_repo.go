package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type DeudaRepository interface {
	FindVigentesByPersona(ctx context.Context, cedula string) ([]domain.Deuda, error)
	Create(ctx context.Context, d domain.Deuda) error
	MarkAllAsPaid(ctx context.Context, cedula string) error
}

type deudaRepo struct {
	client *db.PrismaClient
}

func NewDeudaRepository(client *db.PrismaClient) DeudaRepository {
	return &deudaRepo{client: client}
}

func (r *deudaRepo) FindVigentesByPersona(ctx context.Context, cedula string) ([]domain.Deuda, error) {
	models, err := r.client.Deuda.FindMany(
		db.Deuda.PersonaCedula.Equals(cedula),
		db.Deuda.Vigente.Equals(true),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]domain.Deuda, 0, len(models))
	for _, m := range models {
		result = append(result, domain.Deuda{
			ID:            m.ID,
			PersonaCedula: m.PersonaCedula,
			Monto:         m.Monto,
			Vigente:       m.Vigente,
			CreatedAt:     m.CreatedAt.String(),
			UpdatedAt:     m.UpdatedAt.String(),
		})
	}
	return result, nil
}

func (r *deudaRepo) Create(ctx context.Context, d domain.Deuda) error {
	_, err := r.client.Deuda.CreateOne(
		db.Deuda.Monto.Set(d.Monto),
		db.Deuda.Persona.Link(
			db.Personas.Cedula.Equals(d.PersonaCedula),
		),
		db.Deuda.Vigente.Set(d.Vigente),
	).Exec(ctx)
	return err
}

func (r *deudaRepo) MarkAllAsPaid(ctx context.Context, cedula string) error {
	_, err := r.client.Deuda.FindMany(
		db.Deuda.PersonaCedula.Equals(cedula),
		db.Deuda.Vigente.Equals(true),
	).Update(
		db.Deuda.Vigente.Set(false),
	).Exec(ctx)
	return err
}
