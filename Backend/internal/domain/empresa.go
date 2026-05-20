package domain

type Empresa struct {
    Rif           string `json:"rif"`
    Email         string `json:"email"`
    PasswordHash  string `json:"-"`
    NombreEmpresa string `json:"nombre_empresa"`
    CreatedAt     string `json:"created_at"`
    UpdatedAt     string `json:"updated_at"`
}