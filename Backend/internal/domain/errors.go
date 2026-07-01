package domain

import "errors"

// Errores comunes
var (
	ErrNotFound        = errors.New("recurso no encontrado")
	ErrUnauthorized    = errors.New("no autorizado")
	ErrForbidden       = errors.New("acceso denegado")
	ErrInvalidEmail    = errors.New("email inválido")
	ErrInvalidPassword = errors.New("contraseña inválida")
	ErrUserExists      = errors.New("el usuario ya existe")
	ErrUserNotFound    = errors.New("usuario no encontrado")
)

// Roles
const (
	RoleAdmin = "admin"
	RoleUser  = "user"
)

// Tipos de usuario
const (
	TipoNatural  = "NATURAL"
	TipoJuridico = "JURIDICO"
	TipoAdmin    = "ADMIN"
)
