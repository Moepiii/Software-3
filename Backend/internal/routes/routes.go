package routes

import (
	"Backend/internal/handlers"
	"Backend/internal/middleware"
	"net/http"
)

func NewRouter(
	authHandler *handlers.AuthHandler,
	usuarioHandler *handlers.UsuarioHandler,
	authMiddleware *middleware.AuthMiddleware,
) http.Handler {
	mux := http.NewServeMux()

	// Autenticación Base
	mux.HandleFunc("POST /api/login", authHandler.Login)
	mux.HandleFunc("GET /api/admins", authMiddleware.RequireAdmin(authHandler.ListAdmins))
	mux.HandleFunc("POST /api/admins", authMiddleware.RequireAdmin(authHandler.CreateAdmin))
	mux.HandleFunc("DELETE /api/users/{id}", authMiddleware.RequireAdmin(authHandler.DeleteUser))

	// --- COMPATIBILIDAD DE REGISTRO Y PERFIL ---
	// Ambos apuntan al comportamiento unificado internamente
	mux.HandleFunc("POST /api/register/persona", authHandler.Register)
	mux.HandleFunc("POST /api/register/empresa", authHandler.Register)
	mux.HandleFunc("PUT /api/me/persona", authMiddleware.RequireAuth(authHandler.UpdateProfile))
	mux.HandleFunc("PUT /api/me/empresa", authMiddleware.RequireAuth(authHandler.UpdateProfile))

	// --- COMPATIBILIDAD DE DEUDAS Y ESTADOS ---
	// Redirigidos uno a uno al mismo Handler Centralizado
	// Rutas Persona
	mux.HandleFunc("GET /api/persona/deuda", authMiddleware.RequireAuth(usuarioHandler.GetDeudaActual))
	mux.HandleFunc("GET /api/estados", authMiddleware.RequireAuth(usuarioHandler.GetEstados))
	mux.HandleFunc("PUT /api/persona/estado", authMiddleware.RequireAuth(usuarioHandler.UpdateEstadoUsuario))
	mux.HandleFunc("POST /api/persona/pagar", authMiddleware.RequireAuth(usuarioHandler.PayDeuda))

	// Rutas Empresa
	mux.HandleFunc("GET /api/empresa/deuda", authMiddleware.RequireAuth(usuarioHandler.GetDeudaActual))
	mux.HandleFunc("GET /api/empresa/estados", authMiddleware.RequireAuth(usuarioHandler.GetEstados)) // Si el FE llamaba a este endpoint
	mux.HandleFunc("PUT /api/empresa/estado", authMiddleware.RequireAuth(usuarioHandler.UpdateEstadoUsuario))
	mux.HandleFunc("POST /api/empresa/pagar", authMiddleware.RequireAuth(usuarioHandler.PayDeuda))

	return mux
}
