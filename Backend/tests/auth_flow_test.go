package tests

import (
	"Backend/internal/services"
	"net/http"
	"testing"
)

func TestAuthFlow(t *testing.T) {
	app := newTestApp(t)

	personaRegister := map[string]string{
		"cedula":    "V999",
		"email":     "nueva.persona@mail.com",
		"password":  "123456",
		"nombres":   "Nueva",
		"apellidos": "Persona",
	}
	res := app.request(t, http.MethodPost, "/api/register/persona", personaRegister, "")
	assertStatus(t, res, http.StatusCreated)

	res = app.request(t, http.MethodPost, "/api/login", map[string]string{
		"email":    "nueva.persona@mail.com",
		"password": "123456",
	}, "")
	assertStatus(t, res, http.StatusOK)

	personaLogin := decodeJSONResponse[services.LoginResponse](t, res)
	if personaLogin.Token == "" {
		t.Fatal("expected persona login token")
	}
	if personaLogin.User.ID != "V999" || personaLogin.User.UserType != services.UserTypePersona {
		t.Fatalf("unexpected persona login user: %+v", personaLogin.User)
	}

	res = app.request(t, http.MethodPost, "/api/register/empresa", map[string]string{
		"rif":            "J999",
		"email":          "nueva.empresa@mail.com",
		"password":       "123456",
		"nombre_empresa": "Nueva Empresa",
	}, "")
	assertStatus(t, res, http.StatusCreated)

	res = app.request(t, http.MethodPost, "/api/login", map[string]string{
		"email":    "nueva.empresa@mail.com",
		"password": "123456",
	}, "")
	assertStatus(t, res, http.StatusOK)

	empresaLogin := decodeJSONResponse[services.LoginResponse](t, res)
	if empresaLogin.Token == "" {
		t.Fatal("expected empresa login token")
	}
	if empresaLogin.User.ID != "J999" || empresaLogin.User.UserType != services.UserTypeEmpresa {
		t.Fatalf("unexpected empresa login user: %+v", empresaLogin.User)
	}

	res = app.request(t, http.MethodPost, "/api/login", map[string]string{
		"email":    "nueva.persona@mail.com",
		"password": "clave-mala",
	}, "")
	assertStatus(t, res, http.StatusUnauthorized)

	res = app.request(t, http.MethodPost, "/api/register/persona", personaRegister, "")
	assertStatus(t, res, http.StatusConflict)
}
