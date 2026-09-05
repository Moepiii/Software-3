package tests

import (
	"net/http"
	"testing"
)

func TestUsuarioFlow(t *testing.T) {
	app := newTestApp(t)

	// 1. Probamos con token de Persona (Natural)
	tokenPersona := app.personaToken(t)
	res := app.request(t, http.MethodGet, "/api/persona/deuda", nil, tokenPersona)
	assertStatus(t, res, http.StatusOK)

	deudaPersona := decodeJSONResponse[struct {
		Monto   float64 `json:"monto"`
		Vigente bool    `json:"vigente"`
	}](t, res)
	if !deudaPersona.Vigente || deudaPersona.Monto != 4000.0 {
		t.Fatalf("unexpected persona debt response: %+v", deudaPersona)
	}

	// Probamos con token de Empresa (Juridico)
	tokenEmpresa := app.empresaToken(t)
	res = app.request(t, http.MethodGet, "/api/empresa/deuda", nil, tokenEmpresa)
	assertStatus(t, res, http.StatusOK)

	deudaEmpresa := decodeJSONResponse[struct {
		Monto   float64 `json:"monto"`
		Vigente bool    `json:"vigente"`
	}](t, res)
	if !deudaEmpresa.Vigente || deudaEmpresa.Monto != 25000.0 {
		t.Fatalf("unexpected empresa debt response: %+v", deudaEmpresa)
	}

	// Probar actualización de estado
	res = app.request(t, http.MethodPut, "/api/persona/estado", map[string]string{
		"estado_id": "est-2",
	}, tokenPersona)
	assertStatus(t, res, http.StatusOK)

	// Probar pago de deuda
	res = app.request(t, http.MethodPost, "/api/empresa/pagar", map[string]interface{}{
		"monto": 25000.0,
	}, tokenEmpresa)
	assertStatus(t, res, http.StatusOK)

	// Verificar que la deuda quedo en 0
	res = app.request(t, http.MethodGet, "/api/empresa/deuda", nil, tokenEmpresa)
	assertStatus(t, res, http.StatusOK)
	deudaPagada := decodeJSONResponse[struct {
		Monto   float64 `json:"monto"`
		Vigente bool    `json:"vigente"`
	}](t, res)
	if deudaPagada.Vigente || deudaPagada.Monto != 0 {
		t.Fatalf("expected empresa debt paid, got %+v", deudaPagada)
	}
}
