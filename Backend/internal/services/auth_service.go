package services

import (
	"Backend/internal/domain"
	"Backend/internal/utils"
	"context"
	"errors"
)


type AuthService struct {
	usuarioRepo UsuarioRepository
	jwtSecret   string
}

func NewAuthService(usuarioRepo UsuarioRepository, jwtSecret string) *AuthService {
	return &AuthService{
		usuarioRepo: usuarioRepo,
		jwtSecret:   jwtSecret,
	}
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	Nombre         string `json:"nombre"`
	Identificacion string `json:"identificacion"`
	Tipo           string `json:"tipo"` // NATURAL, JURIDICO
}

type LoginResponse struct {
	Token string         `json:"token"`
	User  domain.Usuario `json:"user"`
}

func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
	// Validar email
	if req.Email == "" {
		return nil, errors.New("email es requerido")
	}

	// Buscar usuario por email (con password hash)
	usuario, passwordHash, err := s.usuarioRepo.GetUsuarioByEmailWithPassword(ctx, req.Email)
	if err != nil {
		if err == domain.ErrNotFound {
			return nil, errors.New("credenciales inválidas")
		}
		return nil, err
	}

	// Verificar contraseña
	if !utils.CheckPasswordHash(req.Password, passwordHash) {
		return nil, errors.New("credenciales inválidas")
	}

	// Generar token
	token, err := utils.GenerateJWT(usuario.ID, usuario.Email, usuario.Role, usuario.Tipo, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token: token,
		User:  *usuario,
	}, nil
}

func (s *AuthService) Register(ctx context.Context, req RegisterRequest) (*LoginResponse, error) {
	// Validar email
	if req.Email == "" {
		return nil, errors.New("email es requerido")
	}

	// Validar contraseña
	if len(req.Password) < 6 {
		return nil, errors.New("la contraseña debe tener al menos 6 caracteres")
	}

	// Validar tipo
	if req.Tipo != domain.TipoNatural && req.Tipo != domain.TipoJuridico {
		return nil, errors.New("tipo de usuario inválido")
	}

	// Verificar si el email ya existe
	_, err := s.usuarioRepo.GetUsuarioByEmail(ctx, req.Email)
	if err == nil {
		return nil, errors.New("el email ya está registrado")
	} else if err != domain.ErrNotFound {
		return nil, err
	}

	// Hash de la contraseña
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Crear usuario
	identificacion := req.Identificacion
	usuario := &domain.Usuario{
		Email:          req.Email,
		Nombre:         req.Nombre,
		Tipo:           req.Tipo,
		Role:           domain.RoleUser,
		Identificacion: &identificacion,
		Nivel:          0,
		Experiencia:    0,
	}

	created, err := s.usuarioRepo.CreateUsuario(ctx, usuario, hashedPassword)
	if err != nil {
		return nil, err
	}

	// Generar token
	token, err := utils.GenerateJWT(created.ID, created.Email, created.Role, created.Tipo, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token: token,
		User:  *created,
	}, nil
}

// UpdateProfile - Actualizar perfil de usuario
func (s *AuthService) UpdateProfile(ctx context.Context, userID string, updates map[string]interface{}) (*domain.Usuario, error) {
	usuario, err := s.usuarioRepo.GetUsuarioByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if nombre, ok := updates["nombre"].(string); ok && nombre != "" {
		usuario.Nombre = nombre
	}
	if email, ok := updates["email"].(string); ok && email != "" {
		usuario.Email = email
	}
	if identificacion, ok := updates["identificacion"].(string); ok && identificacion != "" {
		usuario.Identificacion = &identificacion
	}
	if estadoID, ok := updates["estado_id"].(string); ok && estadoID != "" {
		usuario.EstadoID = &estadoID
	}

	return s.usuarioRepo.UpdateUsuario(ctx, userID, usuario)
}
