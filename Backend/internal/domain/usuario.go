/*
Este archivo define la entidad Usuario del dominio. Representa a todos los
actores del sistema (personas naturales, empresas y administradores) y
mantiene la estructura limpia que usan los servicios sin acoplarse a Prisma
*/
package domain

const (
	RoleUser  = "user"
	RoleAdmin = "admin"

	// Tipos de Usuario para diferenciar la logica de negocio si es necesario
	TipoNatural  = "NATURAL"
	TipoJuridico = "JURIDICO"
	TipoAdmin    = "ADMIN"
)

type Usuario struct {
	ID             string  `json:"id"`
	Identificacion string  `json:"identificacion,omitempty"` // Cedula o RIF
	Tipo           string  `json:"tipo"`                     // NATURAL, JURIDICO o ADMIN
	Email          string  `json:"email"`
	PasswordHash   string  `json:"-"`
	Nombre         string  `json:"nombre"` // Nombres y Apellidos unidos, o Razon Social
	Role           string  `json:"role"`
	EstadoID       *string `json:"estado_id,omitempty"`
	EstadoNombre   *string `json:"estado_nombre,omitempty"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}
