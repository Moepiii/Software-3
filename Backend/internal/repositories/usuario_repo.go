/*
Parte de la refactorizacion

Este archivo contiene el repositorio unificado de los usuarios de tipo persona y empresa.

Tambien unifica a los usuarios con rol admin

*/

package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type UsuarioRepository interface {
	Create(ctx context.Context, u domain.Usuario) error
	FindByEmail(ctx context.Context, email string) (*domain.Usuario, error)
	FindByIdentificacion(ctx context.Context, identificacion string) (*domain.Usuario, error)
	EmailExists(ctx context.Context, email string) (bool, error)
	IdentificacionExists(ctx context.Context, identificacion string) (bool, error)
	ListAdmins(ctx context.Context) ([]domain.Usuario, error)
	Delete(ctx context.Context, id string) error
	UpdateEstado(ctx context.Context, id string, estadoID string) error
	Update(ctx context.Context, id string, nombre, email string) error
}

type usuarioRepo struct {
	client *db.PrismaClient
}

func NewUsuarioRepository(client *db.PrismaClient) UsuarioRepository {
	return &usuarioRepo{client: client}
}

func (r *usuarioRepo) Create(ctx context.Context, u domain.Usuario) error {
	role := u.Role
	if role == "" {
		role = domain.RoleUser
	}

	// Opciones dinamicas (Identificacion es opcional para Admins, y el Estado puede ser nulo)
	options := []db.UsuariosSetParam{
		db.Usuarios.Role.Set(role),
	}

	if u.Identificacion != "" {
		options = append(options, db.Usuarios.Identificacion.Set(u.Identificacion))
	}

	if u.EstadoID != nil && *u.EstadoID != "" {
		options = append(options, db.Usuarios.Estado.Link(
			db.Estado.ID.Equals(*u.EstadoID),
		))
	}

	_, err := r.client.Usuarios.CreateOne(
		db.Usuarios.Email.Set(u.Email),
		db.Usuarios.PasswordHash.Set(u.PasswordHash),
		db.Usuarios.Tipo.Set(db.TipoUsuario(u.Tipo)), // NATURAL, JURIDICO, o ADMIN
		db.Usuarios.Nombre.Set(u.Nombre),
		options...,
	).Exec(ctx)

	return err
}

func (r *usuarioRepo) FindByEmail(ctx context.Context, email string) (*domain.Usuario, error) {
	m, err := r.client.Usuarios.FindUnique(
		db.Usuarios.Email.Equals(email),
	).With(
		db.Usuarios.Estado.Fetch(),
	).Exec(ctx)

	if err != nil {
		if err == db.ErrNotFound {
			return nil, nil
		}
		return nil, err
	}
	return usuarioFromModel(m), nil
}

func (r *usuarioRepo) FindByIdentificacion(ctx context.Context, identificacion string) (*domain.Usuario, error) {
	m, err := r.client.Usuarios.FindUnique(
		db.Usuarios.Identificacion.Equals(identificacion),
	).With(
		db.Usuarios.Estado.Fetch(),
	).Exec(ctx)

	if err != nil {
		if err == db.ErrNotFound {
			return nil, nil
		}
		return nil, err
	}
	return usuarioFromModel(m), nil
}

func (r *usuarioRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	_, err := r.client.Usuarios.FindUnique(
		db.Usuarios.Email.Equals(email),
	).Exec(ctx)

	if err != nil {
		if err == db.ErrNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *usuarioRepo) IdentificacionExists(ctx context.Context, identificacion string) (bool, error) {
	_, err := r.client.Usuarios.FindUnique(
		db.Usuarios.Identificacion.Equals(identificacion),
	).Exec(ctx)

	if err != nil {
		if err == db.ErrNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *usuarioRepo) ListAdmins(ctx context.Context) ([]domain.Usuario, error) {
	models, err := r.client.Usuarios.FindMany(
		db.Usuarios.Role.Equals(domain.RoleAdmin),
	).With(
		db.Usuarios.Estado.Fetch(),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	usuarios := make([]domain.Usuario, 0, len(models))
	for _, m := range models {
		usuarios = append(usuarios, *usuarioFromModel(&m))
	}
	return usuarios, nil
}

func (r *usuarioRepo) Delete(ctx context.Context, id string) error {
	_, err := r.client.Usuarios.FindUnique(
		db.Usuarios.ID.Equals(id),
	).Delete().Exec(ctx)

	if err != nil && err == db.ErrNotFound {
		return domain.ErrUserNotFound
	}
	return err
}

func (r *usuarioRepo) UpdateEstado(ctx context.Context, id string, estadoID string) error {
	var err error
	if estadoID == "" {
		_, err = r.client.Usuarios.FindUnique(
			db.Usuarios.ID.Equals(id),
		).Update(
			db.Usuarios.Estado.Unlink(),
		).Exec(ctx)
	} else {
		_, err = r.client.Usuarios.FindUnique(
			db.Usuarios.ID.Equals(id),
		).Update(
			db.Usuarios.Estado.Link(
				db.Estado.ID.Equals(estadoID),
			),
		).Exec(ctx)
	}
	return err
}

func (r *usuarioRepo) Update(ctx context.Context, id string, nombre, email string) error {
	_, err := r.client.Usuarios.FindUnique(
		db.Usuarios.ID.Equals(id),
	).Update(
		db.Usuarios.Nombre.Set(nombre),
		db.Usuarios.Email.Set(email),
	).Exec(ctx)

	if err != nil && err == db.ErrNotFound {
		return domain.ErrUserNotFound
	}
	return err
}

// Helper para mapear el modelo de Prisma al struct de Dominio
func usuarioFromModel(m *db.UsuariosModel) *domain.Usuario {
	u := &domain.Usuario{
		ID:           m.ID,
		Email:        m.Email,
		PasswordHash: m.PasswordHash,
		Tipo:         string(m.Tipo),
		Nombre:       m.Nombre,
		Role:         m.Role,
		CreatedAt:    m.CreatedAt.String(),
		UpdatedAt:    m.UpdatedAt.String(),
	}

	if val, ok := m.Identificacion(); ok {
		u.Identificacion = val
	}
	if val, ok := m.EstadoID(); ok {
		u.EstadoID = &val
	}
	if est, ok := m.Estado(); ok && est != nil {
		u.EstadoNombre = &est.Nombre
	}

	return u
}
