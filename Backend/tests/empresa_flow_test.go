package tests

import (
	"Backend/internal/domain"
	"net/http"
	"testing"
)

func TestEmpresaFlow(t *testing.T) {
	app := newTestApp(t)

	res := app.request(t, http.MethodGet, "/api/empresa/deuda", nil, "")
	assertStatus(t, res, http.StatusUnauthorized)

	token := app.empresaToken(t)
	res = app.request(t, http.MethodGet, "/api/empresa/deuda", nil, token)
	assertStatus(t, res, http.StatusOK)

	deuda := decodeJSONResponse[struct {
		Monto    float64 `json:"monto"`
		HasDeuda bool    `json:"has_deuda"`
	}](t, res)
	if !deuda.HasDeuda || deuda.Monto != 25000.0 {
		t.Fatalf("unexpected empresa debt response: %+v", deuda)
	}

	res = app.request(t, http.MethodGet, "/api/empresa/estados", nil, token)
	assertStatus(t, res, http.StatusOK)

	estados := decodeJSONResponse[[]domain.EstadoConTasa](t, res)
	if len(estados) != 2 {
		t.Fatalf("expected 2 estados, got %d", len(estados))
	}

	res = app.request(t, http.MethodPut, "/api/empresa/estado", map[string]string{
		"estado_id": "est-2",
	}, token)
	assertStatus(t, res, http.StatusOK)

	empresa := app.fakes.store.empresaByRif("J123")
	if empresa == nil || empresa.EstadoID == nil || *empresa.EstadoID != "est-2" {
		t.Fatalf("expected empresa state est-2, got %+v", empresa)
	}

	res = app.request(t, http.MethodPut, "/api/empresa/estado", map[string]string{
		"estado_id": "no-existe",
	}, token)
	assertStatus(t, res, http.StatusBadRequest)

	res = app.request(t, http.MethodPost, "/api/empresa/pagar", map[string]string{}, token)
	assertStatus(t, res, http.StatusOK)

	res = app.request(t, http.MethodGet, "/api/empresa/deuda", nil, token)
	assertStatus(t, res, http.StatusOK)

	deuda = decodeJSONResponse[struct {
		Monto    float64 `json:"monto"`
		HasDeuda bool    `json:"has_deuda"`
	}](t, res)
	if deuda.HasDeuda || deuda.Monto != 0 {
		t.Fatalf("expected empresa debt paid, got %+v", deuda)
	}
}
