/*
Autor: Baudilio Velasquez

Este archivo prueba el servicio de autenticacion con repositorios falsos. Valida
reglas de negocio sin depender de Prisma ni de una base de datos real.

# UPDATE - Leonardo Dolande

Se agregan pruebas paras las funciones TestUpdatePersonaSuccessAndValidation,
TestUpdatePersonaDetectsEmailDuplicates, TestUpdateEmpresaSuccessAndValidation
y TestUpdateEmpresaDetectsEmailDuplicates
*/
package services

import (
	"Backend/internal/domain"
	"context"
	"testing"
)

type fakePersonaRepo struct {
	byEmail map[string]*domain.Persona
	byID    map[string]*domain.Persona
	admins  []domain.Persona
	created *domain.Persona
}

func newFakePersonaRepo() *fakePersonaRepo {
	return &fakePersonaRepo{
		byEmail: map[string]*domain.Persona{},
		byID:    map[string]*domain.Persona{},
	}
}

func (r *fakePersonaRepo) Create(ctx context.Context, p domain.Persona) error {
	r.created = &p
	r.byEmail[p.Email] = &p
	r.byID[p.Cedula] = &p
	return nil
}

func (r *fakePersonaRepo) FindByEmail(ctx context.Context, email string) (*domain.Persona, error) {
	return r.byEmail[email], nil
}

func (r *fakePersonaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	_, ok := r.byEmail[email]
	return ok, nil
}

func (r *fakePersonaRepo) CedulaExists(ctx context.Context, cedula string) (bool, error) {
	_, ok := r.byID[cedula]
	return ok, nil
}

func (r *fakePersonaRepo) ListAdmins(ctx context.Context) ([]domain.Persona, error) {
	return r.admins, nil
}

func (r *fakePersonaRepo) Delete(ctx context.Context, cedula string) error {
	if _, ok := r.byID[cedula]; !ok {
		return domain.ErrUserNotFound
	}
	delete(r.byID, cedula)
	return nil
}

func (r *fakePersonaRepo) UpdateEstado(ctx context.Context, cedula string, estadoID string) error {
	if p, ok := r.byID[cedula]; ok {
		p.EstadoID = &estadoID
	}
	return nil
}

func (r *fakePersonaRepo) Update(ctx context.Context, cedula string, nombres string, apellidos string, email string) error {
	if cedula == "" {
		return domain.ErrInvalidInput
	}
	// Si necesitas simular que se guardan los datos en el mapa de pruebas:
	if p, ok := r.byID[cedula]; ok {
		p.Nombres = nombres
		p.Apellidos = apellidos
		p.Email = email
	}
	return nil
}

type fakeEmpresaRepo struct {
	byEmail map[string]*domain.Empresa
	byRif   map[string]*domain.Empresa
	created *domain.Empresa
}

func newFakeEmpresaRepo() *fakeEmpresaRepo {
	return &fakeEmpresaRepo{
		byEmail: map[string]*domain.Empresa{},
		byRif:   map[string]*domain.Empresa{},
	}
}

func (r *fakeEmpresaRepo) Create(ctx context.Context, e domain.Empresa) error {
	r.created = &e
	r.byEmail[e.Email] = &e
	r.byRif[e.Rif] = &e
	return nil
}

func (r *fakeEmpresaRepo) FindByEmail(ctx context.Context, email string) (*domain.Empresa, error) {
	return r.byEmail[email], nil
}

func (r *fakeEmpresaRepo) FindByRif(ctx context.Context, rif string) (*domain.Empresa, error) {
	return r.byRif[rif], nil
}

func (r *fakeEmpresaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	_, ok := r.byEmail[email]
	return ok, nil
}

func (r *fakeEmpresaRepo) RifExists(ctx context.Context, rif string) (bool, error) {
	_, ok := r.byRif[rif]
	return ok, nil
}
func (r *fakeEmpresaRepo) UpdateEstado(ctx context.Context, rif string, estadoID string) error {
	if e, ok := r.byRif[rif]; ok {
		e.EstadoID = &estadoID
	}
	return nil
}

func (r *fakeEmpresaRepo) Update(ctx context.Context, rif string, nombreEmpresa string, email string) error {
	if rif == "" {
		return domain.ErrInvalidInput
	}
	// Si tus pruebas necesitan verificar que el mapa simule la actualización de datos:
	if e, ok := r.byRif[rif]; ok {
		e.NombreEmpresa = nombreEmpresa
		e.Email = email
	}
	return nil
}
func TestRegisterPersonaCreatesUserRoleAndHash(t *testing.T) {
	personas := newFakePersonaRepo()
	empresas := newFakeEmpresaRepo()
	service := NewAuthService(personas, empresas, "secret")

	err := service.RegisterPersona(context.Background(), RegisterPersonaRequest{
		Cedula:    "V123",
		Email:     "USER@MAIL.COM",
		Password:  "123456",
		Nombres:   "Baudilio",
		Apellidos: "Velasquez",
	})
	if err != nil {
		t.Fatalf("RegisterPersona returned error: %v", err)
	}
	if personas.created == nil {
		t.Fatal("expected created persona")
	}
	if personas.created.Email != "user@mail.com" {
		t.Fatalf("expected normalized email, got %q", personas.created.Email)
	}
	if personas.created.Role != domain.RoleUser {
		t.Fatalf("expected role user, got %q", personas.created.Role)
	}
	if personas.created.PasswordHash == "123456" || personas.created.PasswordHash == "" {
		t.Fatal("expected password to be hashed")
	}
}

func TestCreateAdminCreatesAdminRole(t *testing.T) {
	personas := newFakePersonaRepo()
	empresas := newFakeEmpresaRepo()
	service := NewAuthService(personas, empresas, "secret")

	err := service.CreateAdmin(context.Background(), CreateAdminRequest{
		Cedula:    "ADM-1",
		Email:     "admin@mail.com",
		Password:  "123456",
		Nombres:   "Admin",
		Apellidos: "Sistema",
	})
	if err != nil {
		t.Fatalf("CreateAdmin returned error: %v", err)
	}
	if personas.created == nil {
		t.Fatal("expected created admin")
	}
	if personas.created.Role != domain.RoleAdmin {
		t.Fatalf("expected role admin, got %q", personas.created.Role)
	}
}

func TestRegisterPersonaDetectsDuplicates(t *testing.T) {
	personas := newFakePersonaRepo()
	empresas := newFakeEmpresaRepo()
	personas.byEmail["used@mail.com"] = &domain.Persona{Email: "used@mail.com"}
	personas.byID["V123"] = &domain.Persona{Cedula: "V123"}
	service := NewAuthService(personas, empresas, "secret")

	err := service.RegisterPersona(context.Background(), RegisterPersonaRequest{
		Cedula:    "V999",
		Email:     "used@mail.com",
		Password:  "123456",
		Nombres:   "Uno",
		Apellidos: "Dos",
	})
	if err != domain.ErrEmailAlreadyExists {
		t.Fatalf("expected email duplicate, got %v", err)
	}

	err = service.RegisterPersona(context.Background(), RegisterPersonaRequest{
		Cedula:    "V123",
		Email:     "new@mail.com",
		Password:  "123456",
		Nombres:   "Uno",
		Apellidos: "Dos",
	})
	if err != domain.ErrCedulaAlreadyExists {
		t.Fatalf("expected cedula duplicate, got %v", err)
	}
}

func TestRegisterEmpresaDetectsDuplicates(t *testing.T) {
	personas := newFakePersonaRepo()
	empresas := newFakeEmpresaRepo()
	empresas.byEmail["empresa@mail.com"] = &domain.Empresa{Email: "empresa@mail.com"}
	empresas.byRif["J123"] = &domain.Empresa{Rif: "J123"}
	service := NewAuthService(personas, empresas, "secret")

	err := service.RegisterEmpresa(context.Background(), RegisterEmpresaRequest{
		Rif:           "J999",
		Email:         "empresa@mail.com",
		Password:      "123456",
		NombreEmpresa: "Empresa",
	})
	if err != domain.ErrEmailAlreadyExists {
		t.Fatalf("expected email duplicate, got %v", err)
	}

	err = service.RegisterEmpresa(context.Background(), RegisterEmpresaRequest{
		Rif:           "J123",
		Email:         "otra@mail.com",
		Password:      "123456",
		NombreEmpresa: "Empresa",
	})
	if err != domain.ErrRifAlreadyExists {
		t.Fatalf("expected rif duplicate, got %v", err)
	}
}

func TestLoginPersona(t *testing.T) {
	personas := newFakePersonaRepo()
	empresas := newFakeEmpresaRepo()
	service := NewAuthService(personas, empresas, "secret")
	if err := service.RegisterPersona(context.Background(), RegisterPersonaRequest{
		Cedula:    "V123",
		Email:     "login@mail.com",
		Password:  "123456",
		Nombres:   "Uno",
		Apellidos: "Dos",
	}); err != nil {
		t.Fatalf("RegisterPersona returned error: %v", err)
	}

	resp, err := service.Login(context.Background(), LoginRequest{Email: "login@mail.com", Password: "123456"})
	if err != nil {
		t.Fatalf("Login returned error: %v", err)
	}
	if resp.Token == "" || resp.User.UserType != UserTypePersona {
		t.Fatalf("unexpected login response: %+v", resp)
	}

	_, err = service.Login(context.Background(), LoginRequest{Email: "login@mail.com", Password: "bad"})
	if err != domain.ErrInvalidCredentials {
		t.Fatalf("expected invalid credentials, got %v", err)
	}

	_, err = service.Login(context.Background(), LoginRequest{Email: "missing@mail.com", Password: "123456"})
	if err != domain.ErrInvalidCredentials {
		t.Fatalf("expected invalid credentials for missing user, got %v", err)
	}
}

func TestUpdatePersonaSuccessAndValidation(t *testing.T) {
	personas := newFakePersonaRepo()
	empresas := newFakeEmpresaRepo()
	service := NewAuthService(personas, empresas, "secret")

	// 1. Registrar una persona inicial para poder editarla
	cedulaOriginal := "V-123456"
	_ = personas.Create(context.Background(), domain.Persona{
		Cedula:    cedulaOriginal,
		Email:     "original@mail.com",
		Nombres:   "Nombre",
		Apellidos: "Original",
	})

	// 2. Caso de Éxito: Modificar los datos correctamente
	err := service.UpdatePersona(context.Background(), cedulaOriginal, UpdatePersonaRequest{
		Nombres:   "  Baudilio Actualizado  ", // Enviamos espacios a propósito
		Apellidos: "Velasquez",
		Email:     "NUEVO@MAIL.COM", // Enviamos mayúsculas a propósito
	})
	if err != nil {
		t.Fatalf("UpdatePersona exitoso falló: %v", err)
	}

	// Verificar que los datos guardados en el repositorio falso se limpiaron y actualizaron
	usuarioEditado := personas.byID[cedulaOriginal]
	if usuarioEditado.Nombres != "Baudilio Actualizado" {
		t.Errorf("Se esperaba el nombre limpio, se obtuvo: %q", usuarioEditado.Nombres)
	}
	if usuarioEditado.Email != "nuevo@mail.com" {
		t.Errorf("Se esperaba el email en minúsculas, se obtuvo: %q", usuarioEditado.Email)
	}

	// 3. Caso de Falla: Campos obligatorios vacíos
	err = service.UpdatePersona(context.Background(), cedulaOriginal, UpdatePersonaRequest{
		Nombres:   "",
		Apellidos: "Velasquez",
		Email:     "nuevo@mail.com",
	})
	if err != domain.ErrInvalidInput {
		t.Errorf("Se esperaba error ErrInvalidInput por nombre vacío, se obtuvo: %v", err)
	}
}

func TestUpdatePersonaDetectsEmailDuplicates(t *testing.T) {
	personas := newFakePersonaRepo()
	empresas := newFakeEmpresaRepo()
	service := NewAuthService(personas, empresas, "secret")

	// Registrar dos personas diferentes
	_ = personas.Create(context.Background(), domain.Persona{Cedula: "V-1", Email: "juan@mail.com"})
	_ = personas.Create(context.Background(), domain.Persona{Cedula: "V-2", Email: "pedro@mail.com"})

	// Registrar una empresa con otro correo
	_ = empresas.Create(context.Background(), domain.Empresa{Rif: "J-1", Email: "empresa@mail.com"})

	// 1. Intentar cambiar el correo de Juan (V-1) al correo que ya usa Pedro (pedro@mail.com)
	err := service.UpdatePersona(context.Background(), "V-1", UpdatePersonaRequest{
		Nombres:   "Juan",
		Apellidos: "Perez",
		Email:     "pedro@mail.com",
	})
	if err != domain.ErrEmailAlreadyExists {
		t.Errorf("Se esperaba error de correo duplicado por otra Persona, se obtuvo: %v", err)
	}

	// 2. Intentar cambiar el correo de Juan (V-1) al correo que ya usa la Empresa (empresa@mail.com)
	err = service.UpdatePersona(context.Background(), "V-1", UpdatePersonaRequest{
		Nombres:   "Juan",
		Apellidos: "Perez",
		Email:     "empresa@mail.com",
	})
	if err != domain.ErrEmailAlreadyExists {
		t.Errorf("Se esperaba error de correo duplicado por una Empresa, se obtuvo: %v", err)
	}

	// 3. Modificar tus datos manteniendo TU propio correo actual (No debería dar duplicado)
	err = service.UpdatePersona(context.Background(), "V-1", UpdatePersonaRequest{
		Nombres:   "Juan Modificado",
		Apellidos: "Perez",
		Email:     "juan@mail.com", // Es su propio correo original
	})
	if err != nil {
		t.Errorf("Modificar el perfil con su propio correo no debería dar error, se obtuvo: %v", err)
	}
}

func TestUpdateEmpresaSuccessAndValidation(t *testing.T) {
	personas := newFakePersonaRepo()
	empresas := newFakeEmpresaRepo()
	service := NewAuthService(personas, empresas, "secret")

	// Registrar una empresa inicial
	rifOriginal := "J-123456789"
	_ = empresas.Create(context.Background(), domain.Empresa{
		Rif:           rifOriginal,
		Email:         "corporativo@mail.com",
		NombreEmpresa: "EcoTax",
	})

	// Caso de Éxito: Cambiar el nombre de la marca a EcoLogic
	err := service.UpdateEmpresa(context.Background(), rifOriginal, UpdateEmpresaRequest{
		NombreEmpresa: "  EcoLogic  ",
		Email:         "contacto@ecologic.com",
	})
	if err != nil {
		t.Fatalf("UpdateEmpresa falló: %v", err)
	}

	// Validar cambios guardados en el mapa
	empresaEditada := empresas.byRif[rifOriginal]
	if empresaEditada.NombreEmpresa != "EcoLogic" {
		t.Errorf("Se esperaba la marca limpia 'EcoLogic', se obtuvo: %q", empresaEditada.NombreEmpresa)
	}
}

func TestUpdateEmpresaDetectsEmailDuplicates(t *testing.T) {
	personas := newFakePersonaRepo()
	empresas := newFakeEmpresaRepo()
	service := NewAuthService(personas, empresas, "secret")

	// Registrar una persona y una empresa
	_ = personas.Create(context.Background(), domain.Persona{Cedula: "V-1", Email: "persona@mail.com"})
	_ = empresas.Create(context.Background(), domain.Empresa{Rif: "J-1", Email: "empresa1@mail.com"})
	_ = empresas.Create(context.Background(), domain.Empresa{Rif: "J-2", Email: "empresa2@mail.com"})

	// Intentar cambiar el correo de Empresa 1 al de una Persona existente
	err := service.UpdateEmpresa(context.Background(), "J-1", UpdateEmpresaRequest{
		NombreEmpresa: "EcoCorp",
		Email:         "persona@mail.com",
	})
	if err != domain.ErrEmailAlreadyExists {
		t.Errorf("Se esperaba duplicado contra tabla Personas, se obtuvo: %v", err)
	}

	// Intentar cambiar el correo de Empresa 1 al de Empresa 2
	err = service.UpdateEmpresa(context.Background(), "J-1", UpdateEmpresaRequest{
		NombreEmpresa: "EcoCorp",
		Email:         "empresa2@mail.com",
	})
	if err != domain.ErrEmailAlreadyExists {
		t.Errorf("Se esperaba duplicado contra tabla Empresas, se obtuvo: %v", err)
	}
}
