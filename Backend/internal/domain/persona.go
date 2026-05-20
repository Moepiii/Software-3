package domain

type Persona struct {
    Cedula       string `json:"cedula"`
    Email        string `json:"email"`
    PasswordHash string `json:"-"` // no se envía en JSON
    Nombres      string `json:"nombres"`
    Apellidos    string `json:"apellidos"`
    CreatedAt    string `json:"created_at"`
    UpdatedAt    string `json:"updated_at"`
}