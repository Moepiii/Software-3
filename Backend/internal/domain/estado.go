package domain

type Estado struct {
	ID         string  `json:"id"`
	Nombre     string  `json:"nombre"`
	TasaActual float64 `json:"tasa_actual"`
}
