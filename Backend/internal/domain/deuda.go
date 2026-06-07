package domain

type Deuda struct {
	ID        string  `json:"id"`
	UsuarioID string  `json:"usuario_id"`
	Monto     float64 `json:"monto"`
	Vigente   bool    `json:"vigente"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}
