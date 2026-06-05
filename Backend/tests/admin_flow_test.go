package tests

import (
	"Backend/internal/services"
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

	admins := decodeJSONResponse[[]services.LoginUser](t, res)
	if !containsUser(admins, "ADM-1") {
		t.Fatalf("expected default admin in list, got %+v", admins)
	}

	res = app.request(t, http.MethodPost, "/api/admins", map[string]string{
		"cedula":    "ADM-2",
		"email":     "admin2@mail.com",
		"password":  "123456",
		"nombres":   "Admin",
		"apellidos": "Dos",
	}, adminToken)
	assertStatus(t, res, http.StatusCreated)

	res = app.request(t, http.MethodGet, "/api/admins", nil, adminToken)
	assertStatus(t, res, http.StatusOK)

	admins = decodeJSONResponse[[]services.LoginUser](t, res)
	if !containsUser(admins, "ADM-2") {
		t.Fatalf("expected created admin in list, got %+v", admins)
	}

	res = app.request(t, http.MethodDelete, "/api/users/V123", nil, adminToken)
	assertStatus(t, res, http.StatusOK)

	if persona := app.fakes.store.personaByID("V123"); persona != nil {
		t.Fatalf("expected persona V123 to be deleted, got %+v", persona)
	}

	res = app.request(t, http.MethodDelete, "/api/users/V123", nil, adminToken)
	assertStatus(t, res, http.StatusNotFound)
}
