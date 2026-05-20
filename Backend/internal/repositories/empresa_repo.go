package repositories

import (
    "context"
    "Backend/internal/domain"
    "Backend/internal/database"
)

type EmpresaRepository interface {
    Create(ctx context.Context, e domain.Empresa) error
    FindByEmail(ctx context.Context, email string) (*domain.Empresa, error)
    FindByRif(ctx context.Context, rif string) (*domain.Empresa, error)
    EmailExists(ctx context.Context, email string) (bool, error)
    RifExists(ctx context.Context, rif string) (bool, error)
}

type empresaRepo struct{}

func NewEmpresaRepository() EmpresaRepository {
    return &empresaRepo{}
}

func (r *empresaRepo) Create(ctx context.Context, e domain.Empresa) error {
    _, err := database.Client.Empresas.CreateOne(
        database.Empresas.Rif.Set(e.Rif),
        database.Empresas.Email.Set(e.Email),
        database.Empresas.PasswordHash.Set(e.PasswordHash),
        database.Empresas.NombreEmpresa.Set(e.NombreEmpresa),
    ).Exec(ctx)
    return err
}

func (r *empresaRepo) FindByEmail(ctx context.Context, email string) (*domain.Empresa, error) {
    model, err := database.Client.Empresas.FindUnique(
        database.Empresas.Email.Equals(email),
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
    return &domain.Empresa{
        Rif:           model.Rif,
        Email:         model.Email,
        PasswordHash:  model.PasswordHash,
        NombreEmpresa: model.NombreEmpresa,
        CreatedAt:     model.CreatedAt.String(),
        UpdatedAt:     model.UpdatedAt.String(),
    }, nil
}

func (r *empresaRepo) FindByRif(ctx context.Context, rif string) (*domain.Empresa, error) {
    model, err := database.Client.Empresas.FindUnique(
        database.Empresas.Rif.Equals(rif),
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
    return &domain.Empresa{
        Rif:           model.Rif,
        Email:         model.Email,
        PasswordHash:  model.PasswordHash,
        NombreEmpresa: model.NombreEmpresa,
        CreatedAt:     model.CreatedAt.String(),
        UpdatedAt:     model.UpdatedAt.String(),
    }, nil
}

func (r *empresaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
    model, err := database.Client.Empresas.FindUnique(
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
    model, err := database.Client.Empresas.FindUnique(
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
