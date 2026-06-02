/*
Autor: Baudilio Velasquez

Este archivo define la entidad Persona del dominio. Representa a los usuarios
naturales del sistema y contiene los campos que las capas de servicio,
repositorio y respuesta usan para trabajar sin depender directamente de Prisma.
*/
package domain

const (
	RoleUser  = "user"
	RoleAdmin = "admin"
)

type Persona struct {
	Cedula       string  `json:"cedula"`
	Email        string  `json:"email"`
	PasswordHash string  `json:"-"`
	Nombres      string  `json:"nombres"`
	Apellidos    string  `json:"apellidos"`
	Role         string  `json:"role,omitempty"`
	EstadoID     *string `json:"estado_id,omitempty"`
	EstadoNombre *string `json:"estado_nombre,omitempty"`
	CreatedAt    string  `json:"created_at"`
	UpdatedAt    string  `json:"updated_at"`
}
