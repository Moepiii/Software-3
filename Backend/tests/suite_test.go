package tests

import (
	"Backend/internal/domain"
	"Backend/internal/handlers"
	"Backend/internal/middleware"
	"Backend/internal/routes"
	"Backend/internal/services"
	"Backend/internal/utils"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

const testJWTSecret = "backend-tests-secret"

type testApp struct {
	router http.Handler
	fakes  *backendFakes
}

func newTestApp(t testing.TB) *testApp {
	t.Helper()

	fakes := newBackendFakes(t)

	// Inicializamos los servicios unificados
	authService := services.NewAuthService(fakes.usuarioRepo, testJWTSecret)
	usuarioService := services.NewUsuarioService(fakes.usuarioRepo, fakes.deudaRepo, fakes.estadoRepo)

	// Inicializamos los handlers unificados
	authHandler := handlers.NewAuthHandler(authService)
	usuarioHandler := handlers.NewUsuarioHandler(usuarioService)
	authMiddleware := middleware.NewAuthMiddleware(testJWTSecret)

	return &testApp{
		router: routes.NewRouter(authHandler, usuarioHandler, authMiddleware),
		fakes:  fakes,
	}
}

func (a *testApp) request(t testing.TB, method string, path string, body any, token string) *httptest.ResponseRecorder {
	t.Helper()

	var payload []byte
	if body != nil {
		switch v := body.(type) {
		case string:
			payload = []byte(v)
		case []byte:
			payload = v
		default:
			var err error
			payload, err = json.Marshal(body)
			if err != nil {
				t.Fatalf("json.Marshal returned error: %v", err)
			}
		}
	}

	req := httptest.NewRequest(method, path, bytes.NewReader(payload))
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	res := httptest.NewRecorder()
	a.router.ServeHTTP(res, req)
	return res
}

func assertStatus(t testing.TB, res *httptest.ResponseRecorder, want int) {
	t.Helper()
	if res.Code != want {
		t.Fatalf("expected HTTP %d, got %d body %s", want, res.Code, res.Body.String())
	}
}

func decodeJSONResponse[T any](t testing.TB, res *httptest.ResponseRecorder) T {
	t.Helper()
	var value T
	if err := json.NewDecoder(res.Body).Decode(&value); err != nil {
		t.Fatalf("failed to decode JSON response: %v body %s", err, res.Body.String())
	}
	return value
}

func (a *testApp) tokenFor(t testing.TB, email string, tipo string, id string, role string) string {
	t.Helper()
	token, err := utils.GenerateJWT(email, tipo, id, role, testJWTSecret)
	if err != nil {
		t.Fatalf("GenerateJWT returned error: %v", err)
	}
	return token
}

func (a *testApp) personaToken(t testing.TB) string {
	t.Helper()
	return a.tokenFor(t, "persona@mail.com", domain.TipoNatural, "V123", domain.RoleUser)
}

func (a *testApp) empresaToken(t testing.TB) string {
	t.Helper()
	return a.tokenFor(t, "empresa@mail.com", domain.TipoJuridico, "J123", domain.RoleUser)
}

func (a *testApp) adminToken(t testing.TB) string {
	t.Helper()
	return a.tokenFor(t, "admin@mail.com", domain.TipoAdmin, "ADM-1", domain.RoleAdmin)
}

func containsUser(users []domain.Usuario, id string) bool {
	for _, user := range users {
		if user.Identificacion == id {
			return true
		}
	}
	return false
}
