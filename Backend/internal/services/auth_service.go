package services

import (
    "context"
    "Backend/internal/domain"
    "Backend/internal/repositories"
    "Backend/internal/utils"
)

type AuthService struct {
    personaRepo repositories.PersonaRepository
    empresaRepo repositories.EmpresaRepository
    jwtSecret   string
}

func NewAuthService(personaRepo repositories.PersonaRepository, empresaRepo repositories.EmpresaRepository, jwtSecret string) *AuthService {
    return &AuthService{
        personaRepo: personaRepo,
        empresaRepo: empresaRepo,
        jwtSecret:   jwtSecret,
    }
}

type RegisterPersonaRequest struct {
    Cedula     string `json:"cedula"`
    Email      string `json:"email"`
    Password   string `json:"password"`
    Nombres    string `json:"nombres"`
    Apellidos  string `json:"apellidos"`
}

func (s *AuthService) RegisterPersona(ctx context.Context, req RegisterPersonaRequest) error {
    // 1. Validar que email no exista en ninguna tabla
    existsPersona, _ := s.personaRepo.EmailExists(ctx, req.Email)
    existsEmpresa, _ := s.empresaRepo.EmailExists(ctx, req.Email)
    if existsPersona || existsEmpresa {
        return domain.ErrEmailAlreadyExists
    }
    // 2. Validar cédula única
    cedulaExists, _ := s.personaRepo.CedulaExists(ctx, req.Cedula)
    if cedulaExists {
        return domain.ErrCedulaAlreadyExists
    }
    // 3. Hashear password
    hashed, err := utils.HashPassword(req.Password)
    if err != nil {
        return err
    }
    // 4. Crear dominio
    p := domain.Persona{
        Cedula:       req.Cedula,
        Email:        req.Email,
        PasswordHash: hashed,
        Nombres:      req.Nombres,
        Apellidos:    req.Apellidos,
    }
    // 5. Guardar
    return s.personaRepo.Create(ctx, p)
}

type RegisterEmpresaRequest struct {
    Rif           string `json:"rif"`
    Email         string `json:"email"`
    Password      string `json:"password"`
    NombreEmpresa string `json:"nombre_empresa"`
}

func (s *AuthService) RegisterEmpresa(ctx context.Context, req RegisterEmpresaRequest) error {
    // 1. Validar que email no exista en ninguna tabla
    existsPersona, _ := s.personaRepo.EmailExists(ctx, req.Email)
    existsEmpresa, _ := s.empresaRepo.EmailExists(ctx, req.Email)
    if existsPersona || existsEmpresa {
        return domain.ErrEmailAlreadyExists
    }
    // 2. Validar RIF único
    rifExists, _ := s.empresaRepo.RifExists(ctx, req.Rif)
    if rifExists {
        return domain.ErrRifAlreadyExists
    }
    // 3. Hashear password
    hashed, err := utils.HashPassword(req.Password)
    if err != nil {
        return err
    }
    // 4. Crear dominio
    e := domain.Empresa{
        Rif:           req.Rif,
        Email:         req.Email,
        PasswordHash:  hashed,
        NombreEmpresa: req.NombreEmpresa,
    }
    // 5. Guardar
    return s.empresaRepo.Create(ctx, e)
}

type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type LoginResponse struct {
    Token string    `json:"token"`
    User  LoginUser `json:"user"`
}

type LoginUser struct {
    ID            string `json:"id"`
    Email         string `json:"email"`
    UserType      string `json:"userType"` // "persona" o "empresa"
    Nombres       string `json:"nombres,omitempty"`
    Apellidos     string `json:"apellidos,omitempty"`
    NombreEmpresa string `json:"nombre_empresa,omitempty"`
}

func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
    // 1. Buscar en personas
    persona, err := s.personaRepo.FindByEmail(ctx, req.Email)
    if err != nil {
        return nil, err
    }
    if persona != nil {
        if !utils.CheckPasswordHash(req.Password, persona.PasswordHash) {
            return nil, domain.ErrInvalidCredentials
        }
        token, err := utils.GenerateJWT(persona.Email, "persona", persona.Cedula, s.jwtSecret)
        if err != nil {
            return nil, err
        }
        return &LoginResponse{
            Token: token,
            User: LoginUser{
                ID:        persona.Cedula,
                Email:     persona.Email,
                UserType:  "persona",
                Nombres:   persona.Nombres,
                Apellidos: persona.Apellidos,
            },
        }, nil
    }

    // 2. Buscar en empresas
    empresa, err := s.empresaRepo.FindByEmail(ctx, req.Email)
    if err != nil {
        return nil, err
    }
    if empresa != nil {
        if !utils.CheckPasswordHash(req.Password, empresa.PasswordHash) {
            return nil, domain.ErrInvalidCredentials
        }
        token, err := utils.GenerateJWT(empresa.Email, "empresa", empresa.Rif, s.jwtSecret)
        if err != nil {
            return nil, err
        }
        return &LoginResponse{
            Token: token,
            User: LoginUser{
                ID:            empresa.Rif,
                Email:         empresa.Email,
                UserType:      "empresa",
                NombreEmpresa: empresa.NombreEmpresa,
            },
        }, nil
    }

    return nil, domain.ErrInvalidCredentials
}