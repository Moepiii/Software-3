/*
Autor: Baudilio Velasquez

Este archivo implementa el repositorio de empresas. Convierte las operaciones
solicitadas por los servicios en consultas Prisma y evita que la logica de
negocio conozca detalles de la base de datos.
*/
package repositories

import (
	"Backend/internal/database"
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type EmpresaRepository interface {
	Create(ctx context.Context, e domain.Empresa) error
	FindByEmail(ctx context.Context, email string) (*domain.Empresa, error)
	FindByRif(ctx context.Context, rif string) (*domain.Empresa, error)
	EmailExists(ctx context.Context, email string) (bool, error)
	RifExists(ctx context.Context, rif string) (bool, error)
	UpdateEstado(ctx context.Context, rif string, estadoID string) error
	Update(ctx context.Context, rif string, nombreEmpresa, email string) error
}

type empresaRepo struct {
	client *db.PrismaClient
}

func NewEmpresaRepository(client *db.PrismaClient) EmpresaRepository {
	return &empresaRepo{client: client}
}

func (r *empresaRepo) Create(ctx context.Context, e domain.Empresa) error {
	_, err := r.client.Empresas.CreateOne(
		database.Empresas.Rif.Set(e.Rif),
		database.Empresas.Email.Set(e.Email),
		database.Empresas.PasswordHash.Set(e.PasswordHash),
		database.Empresas.NombreEmpresa.Set(e.NombreEmpresa),
	).Exec(ctx)
	return err
}

func (r *empresaRepo) FindByEmail(ctx context.Context, email string) (*domain.Empresa, error) {
	model, err := r.client.Empresas.FindUnique(
		database.Empresas.Email.Equals(email),
	).With(
		db.Empresas.Estado.Fetch(),
	).Exec(ctx)
	if err != nil {
		if err == database.ErrNotFound {
			return nil, nil
		}
		return nil, err
	}
	if model == nil {
		return nil, nil
	}
	return empresaFromModel(model), nil
}

func (r *empresaRepo) FindByRif(ctx context.Context, rif string) (*domain.Empresa, error) {
	model, err := r.client.Empresas.FindUnique(
		database.Empresas.Rif.Equals(rif),
	).With(
		db.Empresas.Estado.Fetch(),
	).Exec(ctx)
	if err != nil {
		if err == database.ErrNotFound {
			return nil, nil
		}
		return nil, err
	}
	if model == nil {
		return nil, nil
	}
	return empresaFromModel(model), nil
}

func (r *empresaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	model, err := r.client.Empresas.FindUnique(
		database.Empresas.Email.Equals(email),
	).Exec(ctx)
	if err != nil {
		if err == database.ErrNotFound {
			return false, nil
		}
		return false, err
	}
	return model != nil, nil
}

func (r *empresaRepo) RifExists(ctx context.Context, rif string) (bool, error) {
	model, err := r.client.Empresas.FindUnique(
		database.Empresas.Rif.Equals(rif),
	).Exec(ctx)
	if err != nil {
		if err == database.ErrNotFound {
			return false, nil
		}
		return false, err
	}
	return model != nil, nil
}

func (r *empresaRepo) UpdateEstado(ctx context.Context, rif string, estadoID string) error {
	var err error
	if estadoID == "" {
		_, err = r.client.Empresas.FindUnique(
			database.Empresas.Rif.Equals(rif),
		).Update(
			db.Empresas.Estado.Unlink(),
		).Exec(ctx)
	} else {
		_, err = r.client.Empresas.FindUnique(
			database.Empresas.Rif.Equals(rif),
		).Update(
			db.Empresas.Estado.Link(
				db.Estado.ID.Equals(estadoID),
			),
		).Exec(ctx)
	}
	return err
}

func (r *empresaRepo) Update(ctx context.Context, rif string, nombreEmpresa, email string) error {
	_, err := r.client.Empresas.FindUnique(
		database.Empresas.Rif.Equals(rif),
	).Update(
		database.Empresas.NombreEmpresa.Set(nombreEmpresa),
		database.Empresas.Email.Set(email),
	).Exec(ctx)
	if err != nil && err == database.ErrNotFound {
		return domain.ErrUserNotFound
	}
	return err
}

func empresaFromModel(model *db.EmpresasModel) *domain.Empresa {
	e := &domain.Empresa{
		Rif:           model.Rif,
		Email:         model.Email,
		PasswordHash:  model.PasswordHash,
		NombreEmpresa: model.NombreEmpresa,
		CreatedAt:     model.CreatedAt.String(),
		UpdatedAt:     model.UpdatedAt.String(),
	}

	if val, ok := model.EstadoID(); ok {
		e.EstadoID = &val
	}
	if est, ok := model.Estado(); ok && est != nil {
		e.EstadoNombre = &est.Nombre
	}
	return e
}
