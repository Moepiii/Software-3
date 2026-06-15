package tests

import (
	"Backend/internal/domain"
	"context"
	"net/http"
	"testing"
)

func TestAdminFlow(t *testing.T) {
	app := newTestApp(t)

	res := app.request(t, http.MethodGet, "/api/admins", nil, "")
	assertStatus(t, res, http.StatusUnauthorized)

	res = app.request(t, http.MethodGet, "/api/admins", nil, app.personaToken(t))
	assertStatus(t, res, http.StatusForbidden)

	adminToken := app.adminToken(t)
	res = app.request(t, http.MethodGet, "/api/admins", nil, adminToken)
	assertStatus(t, res, http.StatusOK)

	admins := decodeJSONResponse[[]domain.Usuario](t, res)
	if !containsUser(admins, "ADM-1") {
		t.Fatalf("expected default admin in list, got %+v", admins)
	}

	// El payload ahora respeta la estructura unificada (usa 'nombre' genérico)
	res = app.request(t, http.MethodPost, "/api/admin/create", map[string]string{
		"email":    "admin2@mail.com",
		"password": "123456",
		"nombre":   "Admin Dos",
	}, adminToken)
	assertStatus(t, res, http.StatusCreated)

	res = app.request(t, http.MethodGet, "/api/admins", nil, adminToken)
	assertStatus(t, res, http.StatusOK)

	admins = decodeJSONResponse[[]domain.Usuario](t, res)

	// Validamos buscando por correo ya que los Admins pueden no tener Identificación
	foundAdmin2 := false
	for _, a := range admins {
		if a.Email == "admin2@mail.com" {
			foundAdmin2 = true
			break
		}
	}
	if !foundAdmin2 {
		t.Fatalf("expected created admin in list, got %+v", admins)
	}

	res = app.request(t, http.MethodDelete, "/api/admin/delete/V123", nil, adminToken)
	assertStatus(t, res, http.StatusOK)

	// Verificacion unificada
	usuario, _ := app.fakes.usuarioRepo.FindByIdentificacion(context.Background(), "V123")
	if usuario != nil {
		t.Fatalf("expected usuario V123 to be deleted, got %+v", usuario)
	}

	res = app.request(t, http.MethodDelete, "/api/admin/delete/V123", nil, adminToken)
	assertStatus(t, res, http.StatusNotFound)
}
