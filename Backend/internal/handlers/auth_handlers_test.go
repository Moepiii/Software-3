/*
Autor: Baudilio Velasquez

Este archivo prueba los handlers HTTP de autenticacion usando servicios con
repositorios falsos. Valida codigos HTTP y respuestas sin levantar servidor.
*/
package handlers

import (
	"Backend/internal/domain"
	"Backend/internal/services"
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

type handlerEmpresaRepo struct{}

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

func TestListAdminsHandler(t *testing.T) {
	handler := newTestHandler()

	req := httptest.NewRequest(http.MethodGet, "/api/admins", nil)
	res := httptest.NewRecorder()
	handler.ListAdmins(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected ok, got %d", res.Code)
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

func newTestHandler() *AuthHandler {
	service := services.NewAuthService(&handlerPersonaRepo{}, &handlerEmpresaRepo{}, "secret")
	return NewAuthHandler(service)
}
