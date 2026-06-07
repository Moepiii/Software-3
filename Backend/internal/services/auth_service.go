/*
Este archivo contiene el servicio de autenticación y gestión de cuentas de usuarios.
Coordina las reglas de negocio globales como el registro de contribuyentes (Naturales/Jurídicos),
el inicio de sesión, la actualización de perfiles y la administración del sistema, operando
sobre el repositorio unificado de Usuarios.
*/
package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"Backend/internal/utils"
	"context"
	"strings"
)

type AuthService struct {
	usuarioRepo repositories.UsuarioRepository
	jwtSecret   string
}

func NewAuthService(usuarioRepo repositories.UsuarioRepository, jwtSecret string) *AuthService {
	return &AuthService{
		usuarioRepo: usuarioRepo,
		jwtSecret:   jwtSecret,
	}
}

// STRUCTURES & DTOS (Garantizan compatibilidad limpia con el transporte)
type RegisterRequest struct {
	Identificacion string `json:"identificacion"`
	Email          string `json:"email"`
	Password       string `json:"password"`
	Nombre         string `json:"nombre"`
	Tipo           string // domain.TipoNatural o domain.TipoJuridico
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string         `json:"token"`
	User  domain.Usuario `json:"user"`
}

type UpdateUsuarioRequest struct {
	Nombre string `json:"nombre"`
	Email  string `json:"email"`
}

type CreateAdminRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Nombre   string `json:"nombre"`
}

// METODOS DE CONTRIBUYENTES

// Register centraliza la logica de negocio de creacion de cuentas de personas y empresas
func (s *AuthService) Register(ctx context.Context, req RegisterRequest) error {
	req.Email = normalizeEmail(req.Email)
	req.Identificacion = strings.TrimSpace(req.Identificacion)
	req.Nombre = strings.TrimSpace(req.Nombre)

	if req.Email == "" || req.Identificacion == "" || req.Nombre == "" || req.Password == "" {
		return domain.ErrInvalidInput
	}

	// 1. Validar unicidad del Email
	existsEmail, err := s.usuarioRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	if existsEmail {
		return domain.ErrEmailAlreadyExists
	}

	// 2. Validar unicidad de la Identificacion (Cedula o RIF)
	existsIdent, err := s.usuarioRepo.IdentificacionExists(ctx, req.Identificacion)
	if err != nil {
		return err
	}
	if existsIdent {
		return domain.ErrIdentificacionAlreadyExists
	}

	// 3. Hashear clave de forma segura
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return err
	}

	// 4. Mapear al modelo de dominio unico (Corregido a PasswordHash y Nombre como valor)
	nuevoUsuario := domain.Usuario{
		Identificacion: req.Identificacion,
		Email:          req.Email,
		PasswordHash:   hashedPassword,
		Nombre:         req.Nombre,
		Tipo:           req.Tipo,
		Role:           domain.RoleUser,
	}

	return s.usuarioRepo.Create(ctx, nuevoUsuario)
}

// Login autentica credenciales sin importar el tipo o rol del usuario
func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
	req.Email = normalizeEmail(req.Email)
	if req.Email == "" || req.Password == "" {
		return nil, domain.ErrInvalidInput
	}

	usuario, err := s.usuarioRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if usuario == nil {
		return nil, domain.ErrInvalidCredentials
	}

	// Corregido: se compara contra usuario.PasswordHash (corrigiendo bugcito)
	if !utils.CheckPasswordHash(req.Password, usuario.PasswordHash) {
		return nil, domain.ErrInvalidCredentials
	}

	// Generar JWT usando los campos unificados de la tabla unica
	token, err := utils.GenerateJWT(usuario.Email, usuario.Tipo, usuario.ID, usuario.Role, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token: token,
		User:  *usuario,
	}, nil
}

// UpdateUsuario gestiona la actualizacion de datos compartidos por el perfil
func (s *AuthService) UpdateUsuario(ctx context.Context, id string, req UpdateUsuarioRequest) error {
	req.Email = normalizeEmail(req.Email)
	req.Nombre = strings.TrimSpace(req.Nombre)
	id = strings.TrimSpace(id)

	if req.Nombre == "" || req.Email == "" || id == "" {
		return domain.ErrInvalidInput
	}

	// Validar si el nuevo correo ya pertenece a otro usuario del sistema
	usuarioExistente, err := s.usuarioRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return err
	}
	if usuarioExistente != nil && usuarioExistente.ID != id {
		return domain.ErrEmailAlreadyExists
	}

	return s.usuarioRepo.Update(ctx, id, req.Nombre, req.Email)
}

// METODOS DE ADMINISTRACIÓN

// ListAdmins obtiene la lista de todos los administradores del sistema
func (s *AuthService) ListAdmins(ctx context.Context) ([]domain.Usuario, error) {
	// Corregido: Llamada directa al método definido en tu interfaz
	return s.usuarioRepo.ListAdmins(ctx)
}

// CreateAdmin registra un nuevo usuario de gestion interna con rol administrativo
func (s *AuthService) CreateAdmin(ctx context.Context, req CreateAdminRequest) error {
	req.Email = normalizeEmail(req.Email)
	req.Nombre = strings.TrimSpace(req.Nombre)

	if req.Email == "" || req.Nombre == "" || req.Password == "" {
		return domain.ErrInvalidInput
	}

	exists, err := s.usuarioRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	if exists {
		return domain.ErrEmailAlreadyExists
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return err
	}

	// Corregido a PasswordHash y Nombre como valor (corrigiendo bugcito)
	admin := domain.Usuario{
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Nombre:       req.Nombre,
		Tipo:         domain.TipoAdmin,
		Role:         domain.RoleAdmin,
	}

	return s.usuarioRepo.Create(ctx, admin)
}

// DeleteUser da de baja una cuenta del sistema por su identificador unico
func (s *AuthService) DeleteUser(ctx context.Context, id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return domain.ErrInvalidInput
	}
	return s.usuarioRepo.Delete(ctx, id)
}

// HELPERS INTERNOS
func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
