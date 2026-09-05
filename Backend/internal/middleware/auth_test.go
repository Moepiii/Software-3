/*
Autor: Baudilio Velasquez

Este archivo prueba el middleware de autorizacion administrativa. Comprueba que
solo tokens validos con rol admin puedan entrar a rutas protegidas.
*/
package middleware

import (
	"Backend/internal/domain"
	"Backend/internal/utils"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequireAdmin(t *testing.T) {
	mw := NewAuthMiddleware("secret")
	nextCalled := false
	next := mw.RequireAdmin(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusNoContent)
	})

	req := httptest.NewRequest(http.MethodGet, "/api/admins", nil)
	res := httptest.NewRecorder()
	next(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized without token, got %d", res.Code)
	}

	userToken, err := utils.GenerateJWT("V1", "user@mail.com", domain.RoleUser, domain.TipoNatural, "secret")
	if err != nil {
		t.Fatalf("GenerateJWT returned error: %v", err)
	}
	req = httptest.NewRequest(http.MethodGet, "/api/admins", nil)
	req.Header.Set("Authorization", "Bearer "+userToken)
	res = httptest.NewRecorder()
	next(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("expected forbidden for user role, got %d", res.Code)
	}

	adminToken, err := utils.GenerateJWT("A1", "admin@mail.com", domain.RoleAdmin, domain.TipoAdmin, "secret")
	if err != nil {
		t.Fatalf("GenerateJWT returned error: %v", err)
	}
	req = httptest.NewRequest(http.MethodGet, "/api/admins", nil)
	req.Header.Set("Authorization", "Bearer "+adminToken)
	res = httptest.NewRecorder()
	next(res, req)
	if res.Code != http.StatusNoContent || !nextCalled {
		t.Fatalf("expected admin request to pass, got code %d called %v", res.Code, nextCalled)
	}
}
