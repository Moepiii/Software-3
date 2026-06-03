/*
//Update - Leonardo Dolande

Se agrega el metodo update para arreglar problemas con la actualizacion de perfiles
*/
package handlers

import (
	"Backend/internal/domain"
	"Backend/internal/middleware"
	"Backend/internal/services"
	"Backend/internal/utils"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

type mockPersonaRepo struct {
	cedula   string
	estadoID string
}

func (m *mockPersonaRepo) Create(ctx context.Context, p domain.Persona) error { return nil }
func (m *mockPersonaRepo) FindByEmail(ctx context.Context, email string) (*domain.Persona, error) {
	return nil, nil
}
func (m *mockPersonaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	return false, nil
}
func (m *mockPersonaRepo) CedulaExists(ctx context.Context, cedula string) (bool, error) {
	return false, nil
}
func (m *mockPersonaRepo) ListAdmins(ctx context.Context) ([]domain.Persona, error) { return nil, nil }
func (m *mockPersonaRepo) Delete(ctx context.Context, cedula string) error          { return nil }
func (m *mockPersonaRepo) UpdateEstado(ctx context.Context, cedula string, estadoID string) error {
	m.cedula = cedula
	m.estadoID = estadoID
	return nil
}
func (m *mockPersonaRepo) Update(ctx context.Context, cedula string, nombres string, apellidos string, email string) error {
	return nil
}

type mockDeudaRepo struct {
	cedula string
	paid   bool
}

func (m *mockDeudaRepo) FindVigentesByPersona(ctx context.Context, cedula string) ([]domain.Deuda, error) {
	if cedula == "V123" {
		return []domain.Deuda{
			{PersonaCedula: "V123", Monto: 10000.0, Vigente: true},
		}, nil
	}
	return nil, nil
}

func (m *mockDeudaRepo) Create(ctx context.Context, d domain.Deuda) error { return nil }
func (m *mockDeudaRepo) MarkAllAsPaid(ctx context.Context, cedula string) error {
	m.cedula = cedula
	m.paid = true
	return nil
}

type mockEstadoRepo struct{}

func (m *mockEstadoRepo) ListAll(ctx context.Context) ([]domain.EstadoConTasa, error) {
	return []domain.EstadoConTasa{
		{ID: "est-1", Nombre: "caracas", TasaActual: 5.0},
	}, nil
}

func (m *mockEstadoRepo) GetByName(ctx context.Context, nombre string) (*domain.Estado, error) {
	return nil, nil
}

func (m *mockEstadoRepo) GetRateByEstadoID(ctx context.Context, estadoID string, refTime time.Time) (float64, error) {
	return 5.0, nil
}

func (m *mockEstadoRepo) CreateEstado(ctx context.Context, nombre string) (*domain.Estado, error) {
	return nil, nil
}

func (m *mockEstadoRepo) CreateTasa(ctx context.Context, estadoID string, porcentaje float64, validoDesde time.Time, validoHasta *time.Time) error {
	return nil
}

func TestPersonaHandler_GetDeudaActual(t *testing.T) {
	personaRepo := &mockPersonaRepo{}
	deudaRepo := &mockDeudaRepo{}
	estadoRepo := &mockEstadoRepo{}
	srv := services.NewPersonaService(personaRepo, deudaRepo, estadoRepo)
	handler := NewPersonaHandler(srv)

	req := httptest.NewRequest(http.MethodGet, "/api/persona/deuda", nil)
	claims := &utils.Claims{ID: "V123"}
	ctx := middleware.ContextWithClaims(req.Context(), claims)
	req = req.WithContext(ctx)

	res := httptest.NewRecorder()
	handler.GetDeudaActual(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var resp services.DeudaResponse
	if err := json.NewDecoder(res.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if !resp.HasDeuda || resp.Monto != 10000.0 {
		t.Fatalf("unexpected response: %+v", resp)
	}
}

func TestPersonaHandler_PayDeuda(t *testing.T) {
	personaRepo := &mockPersonaRepo{}
	deudaRepo := &mockDeudaRepo{}
	estadoRepo := &mockEstadoRepo{}
	srv := services.NewPersonaService(personaRepo, deudaRepo, estadoRepo)
	handler := NewPersonaHandler(srv)

	req := httptest.NewRequest(http.MethodPost, "/api/persona/pagar", nil)
	claims := &utils.Claims{ID: "V123"}
	ctx := middleware.ContextWithClaims(req.Context(), claims)
	req = req.WithContext(ctx)

	res := httptest.NewRecorder()
	handler.PayDeuda(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	if deudaRepo.cedula != "V123" || !deudaRepo.paid {
		t.Fatal("expected debt to be paid for V123")
	}
}
