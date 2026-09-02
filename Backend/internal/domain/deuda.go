package domain

type Deuda struct {
	ID        string  `json:"id"`
	UsuarioID string  `json:"usuario_id"`
	Monto     float64 `json:"monto"`
	Vigente   bool    `json:"vigente"`
}

type Abono struct {
	ID      string  `json:"id"`
	DeudaID string  `json:"deuda_id"`
	Monto   float64 `json:"monto"`
	Fecha   string  `json:"fecha"`
}
