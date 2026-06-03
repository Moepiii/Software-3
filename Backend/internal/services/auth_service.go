/*
Autor: Baudilio Velasquez

Este archivo contiene el servicio de autenticacion y usuarios. Coordina reglas
de negocio como registro, login, roles de administrador y eliminacion sin
conocer detalles HTTP ni consultas Prisma concretas.

# UPDATE - Leonardo Dolande

Se agregaron funciones updatePersona y updateEmpresa para permitir a
los usuarios actualizar su informacion basica.
*/
package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"Backend/internal/utils"
	"context"
	"strings"
)

const (
	UserTypePersona = "persona"
	UserTypeEmpresa = "empresa"
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
	Cedula    string `json:"cedula"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Nombres   string `json:"nombres"`
	Apellidos string `json:"apellidos"`
}

type CreateAdminRequest struct {
	Cedula    string `json:"cedula"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Nombres   string `json:"nombres"`
	Apellidos string `json:"apellidos"`
}

func (s *AuthService) RegisterPersona(ctx context.Context, req RegisterPersonaRequest) error {
	req.Cedula = strings.TrimSpace(req.Cedula)
	req.Email = normalizeEmail(req.Email)
	req.Password = strings.TrimSpace(req.Password)
	req.Nombres = strings.TrimSpace(req.Nombres)
	req.Apellidos = strings.TrimSpace(req.Apellidos)
	if req.Cedula == "" || req.Email == "" || req.Password == "" || req.Nombres == "" || req.Apellidos == "" {
		return domain.ErrInvalidInput
	}

	existsPersona, err := s.personaRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	existsEmpresa, err := s.empresaRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	if existsPersona || existsEmpresa {
		return domain.ErrEmailAlreadyExists
	}

	cedulaExists, err := s.personaRepo.CedulaExists(ctx, req.Cedula)
	if err != nil {
		return err
	}
	if cedulaExists {
		return domain.ErrCedulaAlreadyExists
	}

	hashed, err := utils.HashPassword(req.Password)
	if err != nil {
		return err
	}

	return s.personaRepo.Create(ctx, domain.Persona{
		Cedula:       req.Cedula,
		Email:        req.Email,
		PasswordHash: hashed,
		Nombres:      req.Nombres,
		Apellidos:    req.Apellidos,
		Role:         domain.RoleUser,
	})
}

func (s *AuthService) CreateAdmin(ctx context.Context, req CreateAdminRequest) error {
	req.Cedula = strings.TrimSpace(req.Cedula)
	req.Email = normalizeEmail(req.Email)
	req.Password = strings.TrimSpace(req.Password)
	req.Nombres = strings.TrimSpace(req.Nombres)
	req.Apellidos = strings.TrimSpace(req.Apellidos)
	if req.Cedula == "" || req.Email == "" || req.Password == "" || req.Nombres == "" || req.Apellidos == "" {
		return domain.ErrInvalidInput
	}

	existsPersona, err := s.personaRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	existsEmpresa, err := s.empresaRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	if existsPersona || existsEmpresa {
		return domain.ErrEmailAlreadyExists
	}

	cedulaExists, err := s.personaRepo.CedulaExists(ctx, req.Cedula)
	if err != nil {
		return err
	}
	if cedulaExists {
		return domain.ErrCedulaAlreadyExists
	}

	hashed, err := utils.HashPassword(req.Password)
	if err != nil {
		return err
	}

	return s.personaRepo.Create(ctx, domain.Persona{
		Cedula:       req.Cedula,
		Email:        req.Email,
		PasswordHash: hashed,
		Nombres:      req.Nombres,
		Apellidos:    req.Apellidos,
		Role:         domain.RoleAdmin,
	})
}

type RegisterEmpresaRequest struct {
	Rif           string `json:"rif"`
	Email         string `json:"email"`
	Password      string `json:"password"`
	NombreEmpresa string `json:"nombre_empresa"`
}

func (s *AuthService) RegisterEmpresa(ctx context.Context, req RegisterEmpresaRequest) error {
	req.Rif = strings.TrimSpace(req.Rif)
	req.Email = normalizeEmail(req.Email)
	req.Password = strings.TrimSpace(req.Password)
	req.NombreEmpresa = strings.TrimSpace(req.NombreEmpresa)
	if req.Rif == "" || req.Email == "" || req.Password == "" || req.NombreEmpresa == "" {
		return domain.ErrInvalidInput
	}

	existsPersona, err := s.personaRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	existsEmpresa, err := s.empresaRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	if existsPersona || existsEmpresa {
		return domain.ErrEmailAlreadyExists
	}

	rifExists, err := s.empresaRepo.RifExists(ctx, req.Rif)
	if err != nil {
		return err
	}
	if rifExists {
		return domain.ErrRifAlreadyExists
	}

	hashed, err := utils.HashPassword(req.Password)
	if err != nil {
		return err
	}

	return s.empresaRepo.Create(ctx, domain.Empresa{
		Rif:           req.Rif,
		Email:         req.Email,
		PasswordHash:  hashed,
		NombreEmpresa: req.NombreEmpresa,
	})
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
	ID            string  `json:"id"`
	Email         string  `json:"email"`
	UserType      string  `json:"userType"`
	Nombres       string  `json:"nombres,omitempty"`
	Apellidos     string  `json:"apellidos,omitempty"`
	NombreEmpresa string  `json:"nombre_empresa,omitempty"`
	EstadoID      *string `json:"estado_id,omitempty"`
	EstadoNombre  *string `json:"estado_nombre,omitempty"`
}

func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
	req.Email = normalizeEmail(req.Email)
	req.Password = strings.TrimSpace(req.Password)
	if req.Email == "" || req.Password == "" {
		return nil, domain.ErrInvalidCredentials
	}

	persona, err := s.personaRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if persona != nil {
		if !utils.CheckPasswordHash(req.Password, persona.PasswordHash) {
			return nil, domain.ErrInvalidCredentials
		}
		role := persona.Role
		if role == "" {
			role = domain.RoleUser
		}
		token, err := utils.GenerateJWT(persona.Email, UserTypePersona, persona.Cedula, role, s.jwtSecret)
		if err != nil {
			return nil, err
		}
		return &LoginResponse{
			Token: token,
			User: LoginUser{
				ID:           persona.Cedula,
				Email:        persona.Email,
				UserType:     UserTypePersona,
				Nombres:      persona.Nombres,
				Apellidos:    persona.Apellidos,
				EstadoID:     persona.EstadoID,
				EstadoNombre: persona.EstadoNombre,
			},
		}, nil
	}

	empresa, err := s.empresaRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if empresa != nil {
		if !utils.CheckPasswordHash(req.Password, empresa.PasswordHash) {
			return nil, domain.ErrInvalidCredentials
		}
		token, err := utils.GenerateJWT(empresa.Email, UserTypeEmpresa, empresa.Rif, domain.RoleUser, s.jwtSecret)
		if err != nil {
			return nil, err
		}
		return &LoginResponse{
			Token: token,
			User: LoginUser{
				ID:            empresa.Rif,
				Email:         empresa.Email,
				UserType:      UserTypeEmpresa,
				NombreEmpresa: empresa.NombreEmpresa,
				EstadoID:      empresa.EstadoID,
				EstadoNombre:  empresa.EstadoNombre,
			},
		}, nil
	}

	return nil, domain.ErrInvalidCredentials
}

func (s *AuthService) ListAllAdmins(ctx context.Context) ([]LoginUser, error) {
	personas, err := s.personaRepo.ListAdmins(ctx)
	if err != nil {
		return nil, err
	}

	admins := make([]LoginUser, 0, len(personas))
	for _, p := range personas {
		admins = append(admins, LoginUser{
			ID:        p.Cedula,
			Email:     p.Email,
			UserType:  UserTypePersona,
			Nombres:   p.Nombres,
			Apellidos: p.Apellidos,
		})
	}
	return admins, nil
}

func (s *AuthService) DeleteUserByID(ctx context.Context, id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return domain.ErrInvalidInput
	}
	return s.personaRepo.Delete(ctx, id)
}

type UpdatePersonaRequest struct {
	Nombres   string `json:"nombres"`
	Apellidos string `json:"apellidos"`
	Email     string `json:"email"`
}

func (s *AuthService) UpdatePersona(ctx context.Context, cedula string, req UpdatePersonaRequest) error {
	req.Nombres = strings.TrimSpace(req.Nombres)
	req.Apellidos = strings.TrimSpace(req.Apellidos)
	req.Email = normalizeEmail(req.Email)
	if req.Nombres == "" || req.Apellidos == "" || req.Email == "" {
		return domain.ErrInvalidInput
	}

	// Verificar si el nuevo email ya esta en uso por OTRO usuario
	persona, err := s.personaRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return err
	}
	if persona != nil && persona.Cedula != cedula {
		return domain.ErrEmailAlreadyExists
	}

	empresa, err := s.empresaRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return err
	}
	if empresa != nil {
		return domain.ErrEmailAlreadyExists
	}

	return s.personaRepo.Update(ctx, cedula, req.Nombres, req.Apellidos, req.Email)
}

type UpdateEmpresaRequest struct {
	NombreEmpresa string `json:"nombre_empresa"`
	Email         string `json:"email"`
}

func (s *AuthService) UpdateEmpresa(ctx context.Context, rif string, req UpdateEmpresaRequest) error {
	req.NombreEmpresa = strings.TrimSpace(req.NombreEmpresa)
	req.Email = normalizeEmail(req.Email)
	if req.NombreEmpresa == "" || req.Email == "" {
		return domain.ErrInvalidInput
	}

	// Verificar si el nuevo email ya esta en uso por OTRO usuario
	empresa, err := s.empresaRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return err
	}
	if empresa != nil && empresa.Rif != rif {
		return domain.ErrEmailAlreadyExists
	}

	persona, err := s.personaRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return err
	}
	if persona != nil {
		return domain.ErrEmailAlreadyExists
	}

	return s.empresaRepo.Update(ctx, rif, req.NombreEmpresa, req.Email)
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
