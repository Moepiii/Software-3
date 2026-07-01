package domain

type Deuda struct {
	ID        string  `json:"id"`
	UsuarioID string  `json:"usuario_id"`
	Monto     float64 `json:"monto"`
	Vigente   bool    `json:"vigente"`
}
