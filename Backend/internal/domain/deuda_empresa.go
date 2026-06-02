package domain

type DeudaEmpresa struct {
	ID         string  `json:"id"`
	EmpresaRif string  `json:"empresa_rif"`
	Monto      float64 `json:"monto"`
	Vigente    bool    `json:"vigente"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

