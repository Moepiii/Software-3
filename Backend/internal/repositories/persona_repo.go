/*
Autor: Baudilio Velasquez

Este archivo implementa el repositorio de personas. Su responsabilidad es
traducir operaciones de negocio sobre personas a consultas Prisma, manteniendo
la base de datos aislada de los servicios.
*/
package repositories

import (
	"Backend/internal/database"
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type PersonaRepository interface {
	Create(ctx context.Context, p domain.Persona) error
	FindByEmail(ctx context.Context, email string) (*domain.Persona, error)
	EmailExists(ctx context.Context, email string) (bool, error)
	CedulaExists(ctx context.Context, cedula string) (bool, error)
	ListAdmins(ctx context.Context) ([]domain.Persona, error)
	Delete(ctx context.Context, cedula string) error
	UpdateEstado(ctx context.Context, cedula string, estadoID string) error
	Update(ctx context.Context, cedula string, nombres, apellidos, email string) error
}

type personaRepo struct {
	client *db.PrismaClient
}

func NewPersonaRepository(client *db.PrismaClient) PersonaRepository {
	return &personaRepo{client: client}
}

func (r *personaRepo) Create(ctx context.Context, p domain.Persona) error {
	role := p.Role
	if role == "" {
		role = domain.RoleUser
	}

	options := []db.PersonasSetParam{
		database.Personas.Role.Set(role),
	}
	if p.EstadoID != nil && *p.EstadoID != "" {
		options = append(options, db.Personas.Estado.Link(
			db.Estado.ID.Equals(*p.EstadoID),
		))
	}

	_, err := r.client.Personas.CreateOne(
		database.Personas.Cedula.Set(p.Cedula),
		database.Personas.Email.Set(p.Email),
		database.Personas.PasswordHash.Set(p.PasswordHash),
		database.Personas.Nombres.Set(p.Nombres),
		database.Personas.Apellidos.Set(p.Apellidos),
		options...,
	).Exec(ctx)
	return err
}

func (r *personaRepo) FindByEmail(ctx context.Context, email string) (*domain.Persona, error) {
	m, err := r.client.Personas.FindUnique(
		database.Personas.Email.Equals(email),
	).With(
		db.Personas.Estado.Fetch(),
	).Exec(ctx)
	if err != nil {
		if err == database.ErrNotFound {
			return nil, nil
		}
		return nil, err
	}
	if m == nil {
		return nil, nil
	}
	return personaFromModel(m), nil
}

func (r *personaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	m, err := r.client.Personas.FindUnique(
		database.Personas.Email.Equals(email),
	).Exec(ctx)
	if err != nil {
		if err == database.ErrNotFound {
			return false, nil
		}
		return false, err
	}
	return m != nil, nil
}

func (r *personaRepo) CedulaExists(ctx context.Context, cedula string) (bool, error) {
	m, err := r.client.Personas.FindUnique(
		database.Personas.Cedula.Equals(cedula),
	).Exec(ctx)
	if err != nil {
		if err == database.ErrNotFound {
			return false, nil
		}
		return false, err
	}
	return m != nil, nil
}

func (r *personaRepo) ListAdmins(ctx context.Context) ([]domain.Persona, error) {
	models, err := r.client.Personas.FindMany(
		database.Personas.Role.Equals(domain.RoleAdmin),
	).With(
		db.Personas.Estado.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	personas := make([]domain.Persona, 0, len(models))
	for _, m := range models {
		personas = append(personas, *personaFromModel(&m))
	}
	return personas, nil
}

func (r *personaRepo) Delete(ctx context.Context, cedula string) error {
	_, err := r.client.Personas.FindUnique(
		database.Personas.Cedula.Equals(cedula),
	).Delete().Exec(ctx)
	if err != nil && err == database.ErrNotFound {
		return domain.ErrUserNotFound
	}
	return err
}

func (r *personaRepo) UpdateEstado(ctx context.Context, cedula string, estadoID string) error {
	var err error
	if estadoID == "" {
		_, err = r.client.Personas.FindUnique(
			database.Personas.Cedula.Equals(cedula),
		).Update(
			db.Personas.Estado.Unlink(),
		).Exec(ctx)
	} else {
		_, err = r.client.Personas.FindUnique(
			database.Personas.Cedula.Equals(cedula),
		).Update(
			db.Personas.Estado.Link(
				db.Estado.ID.Equals(estadoID),
			),
		).Exec(ctx)
	}
	return err
}

func (r *personaRepo) Update(ctx context.Context, cedula string, nombres, apellidos, email string) error {
	_, err := r.client.Personas.FindUnique(
		database.Personas.Cedula.Equals(cedula),
	).Update(
		database.Personas.Nombres.Set(nombres),
		database.Personas.Apellidos.Set(apellidos),
		database.Personas.Email.Set(email),
	).Exec(ctx)
	if err != nil && err == database.ErrNotFound {
		return domain.ErrUserNotFound
	}
	return err
}

func personaFromModel(m *db.PersonasModel) *domain.Persona {
	p := &domain.Persona{
		Cedula:       m.Cedula,
		Email:        m.Email,
		PasswordHash: m.PasswordHash,
		Nombres:      m.Nombres,
		Apellidos:    m.Apellidos,
		Role:         m.Role,
		CreatedAt:    m.CreatedAt.String(),
		UpdatedAt:    m.UpdatedAt.String(),
	}

	if val, ok := m.EstadoID(); ok {
		p.EstadoID = &val
	}

	if est, ok := m.Estado(); ok && est != nil {
		p.EstadoNombre = &est.Nombre
	}

	return p
}
