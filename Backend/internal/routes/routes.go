/*
Este archivo define el enrutador principal de la aplicación. Configura todas
las rutas HTTP, aplica middlewares de autenticación/autorización y habilita
CORS para las peticiones del frontend.
*/
package routes

import (
	"Backend/internal/handlers"
	"Backend/internal/middleware"
	"net/http"
)

func NewRouter(
	authHandler *handlers.AuthHandler,
	usuarioHandler *handlers.UsuarioHandler,
	cursoHandler *handlers.CursoHandler,
	authMiddleware *middleware.AuthMiddleware,
) http.Handler {
	mux := http.NewServeMux()

	// === Rutas Públicas (sin autenticación) ===
	mux.HandleFunc("POST /api/login", authHandler.Login)
	mux.HandleFunc("POST /api/register/persona", authHandler.Register)
	mux.HandleFunc("POST /api/register/empresa", authHandler.Register)

	// === Rutas protegidas (requieren JWT válido) ===

	// Perfil del usuario autenticado
	mux.HandleFunc("PUT /api/me/persona", authMiddleware.RequireAuth(authHandler.UpdateProfile))
	mux.HandleFunc("PUT /api/me/empresa", authMiddleware.RequireAuth(authHandler.UpdateProfile))

	// Deuda y pagos del usuario autenticado
	mux.HandleFunc("GET /api/persona/deuda", authMiddleware.RequireAuth(usuarioHandler.GetDeudaActual))
	mux.HandleFunc("GET /api/empresa/deuda", authMiddleware.RequireAuth(usuarioHandler.GetDeudaActual))
	mux.HandleFunc("POST /api/persona/pagar", authMiddleware.RequireAuth(usuarioHandler.PayDeuda))
	mux.HandleFunc("POST /api/empresa/pagar", authMiddleware.RequireAuth(usuarioHandler.PayDeuda))

	// Estado del usuario
	mux.HandleFunc("GET /api/estados", authMiddleware.RequireAuth(usuarioHandler.GetEstados))
	mux.HandleFunc("PUT /api/persona/estado", authMiddleware.RequireAuth(usuarioHandler.UpdateEstadoUsuario))
	mux.HandleFunc("PUT /api/empresa/estado", authMiddleware.RequireAuth(usuarioHandler.UpdateEstadoUsuario))

	// Estadísticas del usuario autenticado (nuevo módulo)
	mux.HandleFunc("GET /api/usuario/estadisticas", authMiddleware.RequireAuth(usuarioHandler.GetEstadisticas))

	// === Rutas de cursos ===
	mux.HandleFunc("GET /api/cursos", authMiddleware.RequireAuth(cursoHandler.GetCursos))
	mux.HandleFunc("POST /api/cursos/{id}/reservar", authMiddleware.RequireAuth(cursoHandler.ReservarCurso))
	mux.HandleFunc("POST /api/cursos", authMiddleware.RequireAdmin(cursoHandler.CreateCurso))
	mux.HandleFunc("PUT /api/cursos/{id}", authMiddleware.RequireAdmin(cursoHandler.UpdateCurso))
	mux.HandleFunc("DELETE /api/cursos/{id}", authMiddleware.RequireAdmin(cursoHandler.DeleteCurso))

	// === Rutas de Administración (requieren rol admin) ===
	mux.HandleFunc("GET /api/admins", authMiddleware.RequireAdmin(authHandler.ListAdmins))
	mux.HandleFunc("POST /api/admin/create", authMiddleware.RequireAdmin(authHandler.CreateAdmin))
	mux.HandleFunc("DELETE /api/admin/delete/{id}", authMiddleware.RequireAdmin(authHandler.DeleteUser))

	// Envolver con middleware CORS
	return corsMiddleware(mux)
}

// corsMiddleware permite peticiones cross-origin del frontend en desarrollo
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
