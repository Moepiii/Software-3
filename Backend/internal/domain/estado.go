package domain

type Estado struct {
	ID     string `json:"id"`
	Nombre string `json:"nombre"`
}

type TasaEstado struct {
	ID          string   `json:"id"`
	EstadoID    string   `json:"estado_id"`
	Porcentaje  float64  `json:"porcentaje"`
	ValidoDesde string   `json:"valido_desde"`
	ValidoHasta *string  `json:"valido_hasta,omitempty"`
}

type EstadoConTasa struct {
	ID         string  `json:"id"`
	Nombre     string  `json:"nombre"`
	TasaActual float64 `json:"tasa_actual"`
}
