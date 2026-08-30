package tests

import (
	"net/http"
	"testing"
)

func TestPuntosRutasConservanPermisosYExperiencia(t *testing.T) {
	app := newTestApp(t)
	assertStatus(t, app.request(t, http.MethodGet, "/api/usuario/puntos", nil, ""), http.StatusUnauthorized)
	progreso := map[string]any{"usuario_id": "u2", "curso_id": "curso", "progreso_pct": 50}
	for _, token := range []string{app.personaToken(t), app.empresaToken(t)} {
		assertStatus(t, app.request(t, http.MethodGet, "/api/usuario/puntos", nil, token), http.StatusOK)
		assertStatus(t, app.request(t, http.MethodGet, "/api/usuario/experiencia", nil, token), http.StatusOK)
		assertStatus(t, app.request(t, http.MethodPut, "/api/admin/cursos/progreso", progreso, token), http.StatusForbidden)
	}
	// Un administrador llega al handler; el payload inválido debe rechazarse.
	assertStatus(t, app.request(t, http.MethodPut, "/api/admin/cursos/progreso", "{", app.adminToken(t)), http.StatusBadRequest)
}
