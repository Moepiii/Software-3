/*
Autor: Baudilio Velasquez

Este archivo prueba los handlers HTTP de autenticacion usando servicios con
repositorios falsos. Valida codigos HTTP y respuestas sin levantar servidor.

---

Modificacion
Autor: Franco Murillo

Agregadas pruebas para crear un usuario de tipo Empresa, hacer login y eliminar un usuario
*/
package handlers

import (
	"Backend/internal/domain"
	"Backend/internal/services"
	"Backend/internal/utils"
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

type handlerPersonaRepo struct {
	created *domain.Persona
}

func (r *handlerPersonaRepo) Create(ctx context.Context, p domain.Persona) error {
	r.created = &p
	return nil
}

func (r *handlerPersonaRepo) FindByEmail(ctx context.Context, email string) (*domain.Persona, error) {
	// creamos un usuario dummy, simulando que login@email.com existe en la db
	if email == "login@email.com" {
		hash, _ := utils.HashPassword("123456") // para probar el login necesitamos un hash valido
		return &domain.Persona{
			Cedula:       "V123456",
			Email:        "login@email.com",
			PasswordHash: hash,
			Role:         domain.RoleUser,
		}, nil
	}

	return nil, nil
}

func (r *handlerPersonaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	return false, nil
}

func (r *handlerPersonaRepo) CedulaExists(ctx context.Context, cedula string) (bool, error) {
	return false, nil
}

func (r *handlerPersonaRepo) ListAdmins(ctx context.Context) ([]domain.Persona, error) {
	return []domain.Persona{{Cedula: "A1", Email: "admin@mail.com", Role: domain.RoleAdmin}}, nil
}

func (r *handlerPersonaRepo) Delete(ctx context.Context, cedula string) error {
	if cedula == "" {
		return domain.ErrInvalidInput
	}
	return nil
}

type handlerEmpresaRepo struct {
	created *domain.Empresa
}

func (r *handlerEmpresaRepo) Create(ctx context.Context, e domain.Empresa) error { return nil }
func (r *handlerEmpresaRepo) FindByEmail(ctx context.Context, email string) (*domain.Empresa, error) {
	return nil, nil
}
func (r *handlerEmpresaRepo) FindByRif(ctx context.Context, rif string) (*domain.Empresa, error) {
	return nil, nil
}
func (r *handlerEmpresaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	return false, nil
}
func (r *handlerEmpresaRepo) RifExists(ctx context.Context, rif string) (bool, error) {
	return false, nil
}

func newTestHandler() *AuthHandler {
	service := services.NewAuthService(&handlerPersonaRepo{}, &handlerEmpresaRepo{}, "secret")
	return NewAuthHandler(service)
}

func TestRegisterPersonaHandler(t *testing.T) {
	handler := newTestHandler()

	req := httptest.NewRequest(http.MethodPost, "/api/register/persona", bytes.NewBufferString("{bad"))
	res := httptest.NewRecorder()
	handler.RegisterPersona(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected bad request for invalid JSON, got %d", res.Code)
	}

	body := `{"cedula":"V1","email":"u@mail.com","password":"123456","nombres":"Uno","apellidos":"Dos"}`
	req = httptest.NewRequest(http.MethodPost, "/api/register/persona", bytes.NewBufferString(body))
	res = httptest.NewRecorder()
	handler.RegisterPersona(res, req)
	if res.Code != http.StatusCreated {
		t.Fatalf("expected created, got %d body %s", res.Code, res.Body.String())
	}
}

func TestRegisterEmpresaHandler(t *testing.T) {
	handler := newTestHandler()

	req := httptest.NewRequest(http.MethodPost, "/api/register/empresa", bytes.NewBufferString("{bad"))
	res := httptest.NewRecorder()
	handler.RegisterEmpresa(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected bad request for invalid JSON, got %d", res.Code)
	}

	body := `{"rif":"V1","email":"u@mail.com","password":"123456","nombre_empresa":"Uno"}`
	req = httptest.NewRequest(http.MethodPost, "/api/register/empresa", bytes.NewBufferString(body))
	res = httptest.NewRecorder()
	handler.RegisterEmpresa(res, req)
	if res.Code != http.StatusCreated {
		t.Fatalf("expected created, got %d body %s", res.Code, res.Body.String())
	}
}

func TestCreateAdminHandler(t *testing.T) {
	handler := newTestHandler()

	body := `{"cedula":"ADM-1","email":"admin@mail.com","password":"123456","nombres":"Admin","apellidos":"Sistema"}`
	req := httptest.NewRequest(http.MethodPost, "/api/admins", bytes.NewBufferString(body))
	res := httptest.NewRecorder()
	handler.CreateAdmin(res, req)
	if res.Code != http.StatusCreated {
		t.Fatalf("expected created, got %d body %s", res.Code, res.Body.String())
	}
}

func TestListAdminsHandler(t *testing.T) {
	handler := newTestHandler()

	req := httptest.NewRequest(http.MethodGet, "/api/admins", nil)
	res := httptest.NewRecorder()
	handler.ListAdmins(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected ok, got %d", res.Code)
	}
}

func TestLoginHandler(t *testing.T) {
	handler := newTestHandler()

	// JSON invalido
	req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString("{bad"))
	res := httptest.NewRecorder()
	handler.Login(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected bad request from invalid JSON, got %d", res.Code)
	}

	// Clave invalida
	bodyFail := `{"email": "login@email.com", "password": "malo"}`
	req = httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString(bodyFail))
	res = httptest.NewRecorder()
	handler.Login(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized from wrong password, got %d body %s", res.Code, res.Body.String())
	}

	// Correo equivocado
	bodyFail = `{"email": "malo@email.com", "password": "123456"}`
	req = httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString(bodyFail))
	res = httptest.NewRecorder()
	handler.Login(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized from wrong email, got %d body %s", res.Code, res.Body.String())
	}

	// Login exitoso
	bodySuccess := `{"email": "login@email.com", "password": "123456"}`
	req = httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString(bodySuccess))
	res = httptest.NewRecorder()
	handler.Login(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected ok, got %d", res.Code)
	}
}

func TestDeleteUserHandler(t *testing.T) {
	handler := newTestHandler()

	// Peticion sin ID (deberia dar bad request)
	req := httptest.NewRequest(http.MethodDelete, "/api/users", nil)
	res := httptest.NewRecorder()
	handler.DeleteUser(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("excpected 400 bad request, got %d", res.Code)
	}

	// Eliminacion exitosa
	// estoy aprovechando el hecho de que la funcion Delete (linea 63 pal curioso) retorna nil para cualquier cedula que pongamos xd
	req = httptest.NewRequest(http.MethodDelete, "/api/users/V-123", nil)
	res = httptest.NewRecorder()
	handler.DeleteUser(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("excpected ok, got %d", res.Code)
	}
}
