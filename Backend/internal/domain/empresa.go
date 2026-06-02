/*
Autor: Baudilio Velasquez

Este archivo define la entidad Empresa del dominio. Representa a los usuarios
juridicos del sistema y mantiene la estructura limpia que usan los servicios
sin acoplarse al modelo generado por Prisma.
*/
package domain

type Empresa struct {
	Rif           string `json:"rif"`
	Email         string `json:"email"`
	PasswordHash  string `json:"-"`
	NombreEmpresa string `json:"nombre_empresa"`
	EstadoID      *string `json:"estado_id,omitempty"`
	EstadoNombre  *string `json:"estado_nombre,omitempty"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}
