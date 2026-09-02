package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
)

type UsuarioRepository struct {
	client *db.PrismaClient
}

func NewUsuarioRepository(client *db.PrismaClient) *UsuarioRepository {
	return &UsuarioRepository{client: client}
}

func (r *UsuarioRepository) GetUsuarioByID(ctx context.Context, id string) (*domain.Usuario, error) {
	usuario, err := r.client.Usuarios.FindUnique(
		db.Usuarios.ID.Equals(id),
	).Exec(ctx)
	if err != nil {
		if err == db.ErrNotFound {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}

	var identificacion *string
	if val, ok := usuario.Identificacion(); ok && val != "" {
		identificacion = &val
	}
	var estadoID *string
	if val, ok := usuario.EstadoID(); ok && val != "" {
		estadoID = &val
	}

	return &domain.Usuario{
		ID:             usuario.ID,
		Email:          usuario.Email,
		Tipo:           string(usuario.Tipo),
		Role:           usuario.Role,
		Identificacion: identificacion,
		Nombre:         usuario.Nombre,
		EstadoID:       estadoID,
		Nivel:          usuario.Nivel,
		Experiencia:    usuario.Experiencia,
	}, nil
}

func (r *UsuarioRepository) GetUsuarioByEmail(ctx context.Context, email string) (*domain.Usuario, error) {
	usuario, err := r.client.Usuarios.FindUnique(
		db.Usuarios.Email.Equals(email),
	).Exec(ctx)
	if err != nil {
		if err == db.ErrNotFound {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}

	var identificacion *string
	if val, ok := usuario.Identificacion(); ok && val != "" {
		identificacion = &val
	}
	var estadoID *string
	if val, ok := usuario.EstadoID(); ok && val != "" {
		estadoID = &val
	}

	return &domain.Usuario{
		ID:             usuario.ID,
		Email:          usuario.Email,
		Tipo:           string(usuario.Tipo),
		Role:           usuario.Role,
		Identificacion: identificacion,
		Nombre:         usuario.Nombre,
		EstadoID:       estadoID,
		Nivel:          usuario.Nivel,
		Experiencia:    usuario.Experiencia,
	}, nil
}

// 🆕 GetUsuarioByEmailWithPassword - Obtener usuario por email incluyendo el password hash
func (r *UsuarioRepository) GetUsuarioByEmailWithPassword(ctx context.Context, email string) (*domain.Usuario, string, error) {
	usuario, err := r.client.Usuarios.FindUnique(
		db.Usuarios.Email.Equals(email),
	).Exec(ctx)
	if err != nil {
		if err == db.ErrNotFound {
			return nil, "", domain.ErrNotFound
		}
		return nil, "", err
	}

	var identificacion *string
	if val, ok := usuario.Identificacion(); ok && val != "" {
		identificacion = &val
	}
	var estadoID *string
	if val, ok := usuario.EstadoID(); ok && val != "" {
		estadoID = &val
	}

	return &domain.Usuario{
		ID:             usuario.ID,
		Email:          usuario.Email,
		Tipo:           string(usuario.Tipo),
		Role:           usuario.Role,
		Identificacion: identificacion,
		Nombre:         usuario.Nombre,
		EstadoID:       estadoID,
		Nivel:          usuario.Nivel,
		Experiencia:    usuario.Experiencia,
	}, usuario.PasswordHash, nil
}

func (r *UsuarioRepository) CreateUsuario(ctx context.Context, usuario *domain.Usuario, passwordHash string) (*domain.Usuario, error) {
	params := []db.UsuariosSetParam{db.Usuarios.Role.Set(usuario.Role)}
	if usuario.Identificacion != nil && *usuario.Identificacion != "" {
		params = append(params, db.Usuarios.Identificacion.Set(*usuario.Identificacion))
	}
	created, err := r.client.Usuarios.CreateOne(
		db.Usuarios.Email.Set(usuario.Email),
		db.Usuarios.PasswordHash.Set(passwordHash),
		db.Usuarios.Tipo.Set(db.TipoUsuario(usuario.Tipo)),
		db.Usuarios.Nombre.Set(usuario.Nombre),
		params...,
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var identificacion *string
	if val, ok := created.Identificacion(); ok && val != "" {
		identificacion = &val
	}
	var estadoID *string
	if val, ok := created.EstadoID(); ok && val != "" {
		estadoID = &val
	}

	return &domain.Usuario{
		ID:             created.ID,
		Email:          created.Email,
		Tipo:           string(created.Tipo),
		Role:           created.Role,
		Identificacion: identificacion,
		Nombre:         created.Nombre,
		EstadoID:       estadoID,
		Nivel:          created.Nivel,
		Experiencia:    created.Experiencia,
	}, nil
}

func (r *UsuarioRepository) UpdateUsuario(ctx context.Context, id string, usuario *domain.Usuario) (*domain.Usuario, error) {
	params := []db.UsuariosSetParam{}

	if usuario.Email != "" {
		params = append(params, db.Usuarios.Email.Set(usuario.Email))
	}
	if usuario.Nombre != "" {
		params = append(params, db.Usuarios.Nombre.Set(usuario.Nombre))
	}
	if usuario.Identificacion != nil && *usuario.Identificacion != "" {
		params = append(params, db.Usuarios.Identificacion.Set(*usuario.Identificacion))
	}
	if usuario.EstadoID != nil && *usuario.EstadoID != "" {
		params = append(params, db.Usuarios.Estado.Link(
			db.Estado.ID.Equals(*usuario.EstadoID),
		))
	}

	if len(params) == 0 {
		return r.GetUsuarioByID(ctx, id)
	}

	updated, err := r.client.Usuarios.FindUnique(
		db.Usuarios.ID.Equals(id),
	).Update(params...).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var identificacion *string
	if val, ok := updated.Identificacion(); ok && val != "" {
		identificacion = &val
	}
	var estadoID *string
	if val, ok := updated.EstadoID(); ok && val != "" {
		estadoID = &val
	}

	return &domain.Usuario{
		ID:             updated.ID,
		Email:          updated.Email,
		Tipo:           string(updated.Tipo),
		Role:           updated.Role,
		Identificacion: identificacion,
		Nombre:         updated.Nombre,
		EstadoID:       estadoID,
		Nivel:          updated.Nivel,
		Experiencia:    updated.Experiencia,
	}, nil
}

func (r *UsuarioRepository) DeleteUsuario(ctx context.Context, id string) error {
	_, err := r.client.Usuarios.FindUnique(
		db.Usuarios.ID.Equals(id),
	).Delete().Exec(ctx)
	return err
}

func (r *UsuarioRepository) GetUsuarios(ctx context.Context) ([]domain.Usuario, error) {
	usuarios, err := r.client.Usuarios.FindMany().Exec(ctx)
	if err != nil {
		return nil, err
	}

	var result []domain.Usuario
	for _, u := range usuarios {
		var identificacion *string
		if val, ok := u.Identificacion(); ok && val != "" {
			identificacion = &val
		}
		var estadoID *string
		if val, ok := u.EstadoID(); ok && val != "" {
			estadoID = &val
		}

		result = append(result, domain.Usuario{
			ID:             u.ID,
			Email:          u.Email,
			Tipo:           string(u.Tipo),
			Role:           u.Role,
			Identificacion: identificacion,
			Nombre:         u.Nombre,
			EstadoID:       estadoID,
			Nivel:          u.Nivel,
			Experiencia:    u.Experiencia,
		})
	}
	return result, nil
}
