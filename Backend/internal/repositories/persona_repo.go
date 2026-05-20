package repositories

import (
    "context"
    "Backend/internal/domain"
    "Backend/internal/database"
)

type PersonaRepository interface {
    Create(ctx context.Context, p domain.Persona) error
    FindByEmail(ctx context.Context, email string) (*domain.Persona, error)
    FindByCedula(ctx context.Context, cedula string) (*domain.Persona, error)
    EmailExists(ctx context.Context, email string) (bool, error)
    CedulaExists(ctx context.Context, cedula string) (bool, error)
}

type personaRepo struct{}

func NewPersonaRepository() PersonaRepository {
    return &personaRepo{}
}

func (r *personaRepo) Create(ctx context.Context, p domain.Persona) error {
    _, err := database.Client.Personas.CreateOne(
        database.Personas.Cedula.Set(p.Cedula),
        database.Personas.Email.Set(p.Email),
        database.Personas.PasswordHash.Set(p.PasswordHash),
        database.Personas.Nombres.Set(p.Nombres),
        database.Personas.Apellidos.Set(p.Apellidos),
    ).Exec(ctx)
    return err
}

func (r *personaRepo) FindByEmail(ctx context.Context, email string) (*domain.Persona, error) {
    model, err := database.Client.Personas.FindUnique(
        database.Personas.Email.Equals(email),
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
    return &domain.Persona{
        Cedula:       model.Cedula,
        Email:        model.Email,
        PasswordHash: model.PasswordHash,
        Nombres:      model.Nombres,
        Apellidos:    model.Apellidos,
        CreatedAt:    model.CreatedAt.String(),
        UpdatedAt:    model.UpdatedAt.String(),
    }, nil
}

func (r *personaRepo) FindByCedula(ctx context.Context, cedula string) (*domain.Persona, error) {
    model, err := database.Client.Personas.FindUnique(
        database.Personas.Cedula.Equals(cedula),
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
    return &domain.Persona{
        Cedula:       model.Cedula,
        Email:        model.Email,
        PasswordHash: model.PasswordHash,
        Nombres:      model.Nombres,
        Apellidos:    model.Apellidos,
        CreatedAt:    model.CreatedAt.String(),
        UpdatedAt:    model.UpdatedAt.String(),
    }, nil
}

func (r *personaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
    model, err := database.Client.Personas.FindUnique(
        database.Personas.Email.Equals(email),
    ).Exec(ctx)
    if err != nil {
        if err == database.ErrNotFound {
            return false, nil
        }
        return false, err
    }
    return model != nil, nil
}

func (r *personaRepo) CedulaExists(ctx context.Context, cedula string) (bool, error) {
    model, err := database.Client.Personas.FindUnique(
        database.Personas.Cedula.Equals(cedula),
    ).Exec(ctx)
    if err != nil {
        if err == database.ErrNotFound {
            return false, nil
        }
        return false, err
    }
    return model != nil, nil
}