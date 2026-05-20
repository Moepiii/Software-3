package repositories

import (
	"Backend/internal/database"
	"Backend/internal/domain"
	"context"
)

type PersonaRepository interface {
	Create(ctx context.Context, p domain.Persona) error
	FindByEmail(ctx context.Context, email string) (*domain.Persona, error)
	EmailExists(ctx context.Context, email string) (bool, error)
	CedulaExists(ctx context.Context, cedula string) (bool, error)
	ListAll(ctx context.Context) ([]domain.Persona, error)
	Delete(ctx context.Context, cedula string) error
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
	m, err := database.Client.Personas.FindUnique(
		database.Personas.Email.Equals(email),
	).Exec(ctx)
	if err != nil {
		return nil, nil
	}
	return &domain.Persona{
		Cedula:       m.Cedula,
		Email:        m.Email,
		PasswordHash: m.PasswordHash,
		Nombres:      m.Nombres,
		Apellidos:    m.Apellidos,
	}, nil
}

func (r *personaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	m, err := database.Client.Personas.FindUnique(
		database.Personas.Email.Equals(email),
	).Exec(ctx)
	if err != nil {
		return false, nil
	}
	return m != nil, nil
}

func (r *personaRepo) CedulaExists(ctx context.Context, cedula string) (bool, error) {
	m, err := database.Client.Personas.FindUnique(
		database.Personas.Cedula.Equals(cedula),
	).Exec(ctx)
	if err != nil {
		return false, nil
	}
	return m != nil, nil
}

// ListAll obtiene todas las personas registradas en Prisma
func (r *personaRepo) ListAll(ctx context.Context) ([]domain.Persona, error) {
	models, err := database.Client.Personas.FindMany().Exec(ctx)
	if err != nil {
		return nil, err
	}

	var personas []domain.Persona
	for _, m := range models {
		personas = append(personas, domain.Persona{
			Cedula:       m.Cedula,
			Email:        m.Email,
			PasswordHash: m.PasswordHash,
			Nombres:      m.Nombres,
			Apellidos:    m.Apellidos,
		})
	}
	return personas, nil
}

// Delete elimina de forma permanente el registro en la base de datos por su cédula
func (r *personaRepo) Delete(ctx context.Context, cedula string) error {
	_, err := database.Client.Personas.FindUnique(
		database.Personas.Cedula.Equals(cedula),
	).Delete().Exec(ctx)
	return err
}
