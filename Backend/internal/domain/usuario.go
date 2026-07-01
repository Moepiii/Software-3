package domain

type Usuario struct {
	ID             string  `json:"id"`
	Email          string  `json:"email"`
	Tipo           string  `json:"tipo"`
	Role           string  `json:"role"`
	Identificacion *string `json:"identificacion,omitempty"`
	Nombre         string  `json:"nombre"`
	EstadoID       *string `json:"estado_id,omitempty"`
	// 🆕 Campos de gamificación
	Nivel       int `json:"nivel"`
	Experiencia int `json:"experiencia"`
}

// 🆕 Respuesta de experiencia actualizada
type ExperienciaResponse struct {
	Nivel       int `json:"nivel"`
	Experiencia int `json:"experiencia"`
	MaximoNivel int `json:"maximoNivel"`
}
