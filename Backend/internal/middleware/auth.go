/*
Autor: Baudilio Velasquez

Este archivo define middlewares de autenticacion y autorizacion. Protege rutas
sensibles validando tokens JWT y verificando que el rol del usuario sea admin.
*/
package middleware

import (
	"Backend/internal/domain"
	"Backend/internal/utils"
	"context"
	"net/http"
)

type contextKey string

const claimsContextKey contextKey = "claims"

type AuthMiddleware struct {
	jwtSecret string
}

func NewAuthMiddleware(jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{jwtSecret: jwtSecret}
}

func (m *AuthMiddleware) RequireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString, ok := utils.TokenFromBearerHeader(r.Header.Get("Authorization"))
		if !ok {
			utils.SendJSONError(w, http.StatusUnauthorized, domain.ErrUnauthorized.Error())
			return
		}

		claims, err := utils.ValidateJWT(tokenString, m.jwtSecret)
		if err != nil {
			utils.SendJSONError(w, http.StatusUnauthorized, domain.ErrUnauthorized.Error())
			return
		}
		if !utils.IsAdminRole(claims.Role) {
			utils.SendJSONError(w, http.StatusForbidden, domain.ErrForbidden.Error())
			return
		}

		ctx := context.WithValue(r.Context(), claimsContextKey, claims)
		next(w, r.WithContext(ctx))
	}
}

// RequireAuth valida que el request tenga un JWT valido (cualquier rol).
func (m *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString, ok := utils.TokenFromBearerHeader(r.Header.Get("Authorization"))
		if !ok {
			utils.SendJSONError(w, http.StatusUnauthorized, domain.ErrUnauthorized.Error())
			return
		}

		claims, err := utils.ValidateJWT(tokenString, m.jwtSecret)
		if err != nil {
			utils.SendJSONError(w, http.StatusUnauthorized, domain.ErrUnauthorized.Error())
			return
		}

		ctx := context.WithValue(r.Context(), claimsContextKey, claims)
		next(w, r.WithContext(ctx))
	}
}

func ClaimsFromContext(ctx context.Context) (*utils.Claims, bool) {
	claims, ok := ctx.Value(claimsContextKey).(*utils.Claims)
	return claims, ok
}
