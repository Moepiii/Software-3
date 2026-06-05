package tests

import (
	"Backend/internal/domain"
	"net/http"
	"testing"
)

func TestPersonaFlow(t *testing.T) {
	app := newTestApp(t)

	res := app.request(t, http.MethodGet, "/api/persona/deuda", nil, "")
	assertStatus(t, res, http.StatusUnauthorized)

	token := app.personaToken(t)
	res = app.request(t, http.MethodGet, "/api/persona/deuda", nil, token)
	assertStatus(t, res, http.StatusOK)

	deuda := decodeJSONResponse[struct {
		Monto    float64 `json:"monto"`
		HasDeuda bool    `json:"has_deuda"`
	}](t, res)
	if !deuda.HasDeuda || deuda.Monto != 10000.0 {
		t.Fatalf("unexpected persona debt response: %+v", deuda)
	}

	res = app.request(t, http.MethodGet, "/api/estados", nil, token)
	assertStatus(t, res, http.StatusOK)

	estados := decodeJSONResponse[[]domain.EstadoConTasa](t, res)
	if len(estados) != 2 {
		t.Fatalf("expected 2 estados, got %d", len(estados))
	}

	res = app.request(t, http.MethodPut, "/api/persona/estado", map[string]string{
		"estado_id": "est-2",
	}, token)
	assertStatus(t, res, http.StatusOK)

	persona := app.fakes.store.personaByID("V123")
	if persona == nil || persona.EstadoID == nil || *persona.EstadoID != "est-2" {
		t.Fatalf("expected persona state est-2, got %+v", persona)
	}

	res = app.request(t, http.MethodPut, "/api/persona/estado", map[string]string{
		"estado_id": "no-existe",
	}, token)
	assertStatus(t, res, http.StatusBadRequest)

	res = app.request(t, http.MethodPost, "/api/persona/pagar", map[string]string{}, token)
	assertStatus(t, res, http.StatusOK)

	res = app.request(t, http.MethodGet, "/api/persona/deuda", nil, token)
	assertStatus(t, res, http.StatusOK)

	deuda = decodeJSONResponse[struct {
		Monto    float64 `json:"monto"`
		HasDeuda bool    `json:"has_deuda"`
	}](t, res)
	if deuda.HasDeuda || deuda.Monto != 0 {
		t.Fatalf("expected persona debt paid, got %+v", deuda)
	}
}
