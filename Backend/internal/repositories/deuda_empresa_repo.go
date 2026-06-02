package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type DeudaEmpresaRepository interface {
	FindVigentesByEmpresa(ctx context.Context, rif string) ([]domain.DeudaEmpresa, error)
	Create(ctx context.Context, d domain.DeudaEmpresa) error
	MarkAllAsPaid(ctx context.Context, rif string) error
}

type deudaEmpresaRepo struct {
	client *db.PrismaClient
}

func NewDeudaEmpresaRepository(client *db.PrismaClient) DeudaEmpresaRepository {
	return &deudaEmpresaRepo{client: client}
}

func (r *deudaEmpresaRepo) FindVigentesByEmpresa(ctx context.Context, rif string) ([]domain.DeudaEmpresa, error) {
	models, err := r.client.DeudaEmpresa.FindMany(
		db.DeudaEmpresa.EmpresaRif.Equals(rif),
		db.DeudaEmpresa.Vigente.Equals(true),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]domain.DeudaEmpresa, 0, len(models))
	for _, m := range models {
		result = append(result, domain.DeudaEmpresa{
			ID:         m.ID,
			EmpresaRif: m.EmpresaRif,
			Monto:      m.Monto,
			Vigente:    m.Vigente,
			CreatedAt:  m.CreatedAt.String(),
			UpdatedAt:  m.UpdatedAt.String(),
		})
	}
	return result, nil
}

func (r *deudaEmpresaRepo) Create(ctx context.Context, d domain.DeudaEmpresa) error {
	_, err := r.client.DeudaEmpresa.CreateOne(
		db.DeudaEmpresa.Monto.Set(d.Monto),
		db.DeudaEmpresa.Empresa.Link(
			db.Empresas.Rif.Equals(d.EmpresaRif),
		),
		db.DeudaEmpresa.Vigente.Set(d.Vigente),
	).Exec(ctx)
	return err
}

func (r *deudaEmpresaRepo) MarkAllAsPaid(ctx context.Context, rif string) error {
	_, err := r.client.DeudaEmpresa.FindMany(
		db.DeudaEmpresa.EmpresaRif.Equals(rif),
		db.DeudaEmpresa.Vigente.Equals(true),
	).Update(
		db.DeudaEmpresa.Vigente.Set(false),
	).Exec(ctx)
	return err
}

