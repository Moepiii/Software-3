/*
Autor: Baudilio Velasquez

Este archivo registra las rutas HTTP del backend. Centraliza el mapa de
endpoints para que main.go solo se encargue de iniciar dependencias y arrancar
el servidor.
*/
package routes

import (
	"Backend/internal/handlers"
	"Backend/internal/middleware"
	"net/http"
)

func NewRouter(
	authHandler *handlers.AuthHandler,
	personaHandler *handlers.PersonaHandler,
	empresaHandler *handlers.EmpresaHandler,
	authMiddleware *middleware.AuthMiddleware,
) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/register/persona", authHandler.RegisterPersona)
	mux.HandleFunc("POST /api/register/empresa", authHandler.RegisterEmpresa)
	mux.HandleFunc("POST /api/login", authHandler.Login)
	mux.HandleFunc("GET /api/admins", authMiddleware.RequireAdmin(authHandler.ListAdmins))
	mux.HandleFunc("POST /api/admins", authMiddleware.RequireAdmin(authHandler.CreateAdmin))
	mux.HandleFunc("DELETE /api/users/{id}", authMiddleware.RequireAdmin(authHandler.DeleteUser))
	mux.HandleFunc("PUT /api/me/persona", authMiddleware.RequireAuth(authHandler.UpdatePersona))
	mux.HandleFunc("PUT /api/me/empresa", authMiddleware.RequireAuth(authHandler.UpdateEmpresa))

	// Persona specific routes
	mux.HandleFunc("GET /api/persona/deuda", authMiddleware.RequireAuth(personaHandler.GetDeudaActual))
	mux.HandleFunc("GET /api/estados", authMiddleware.RequireAuth(personaHandler.GetEstados))
	mux.HandleFunc("PUT /api/persona/estado", authMiddleware.RequireAuth(personaHandler.UpdateEstadoPersona))
	mux.HandleFunc("POST /api/persona/pagar", authMiddleware.RequireAuth(personaHandler.PayDeuda))

	// Empresa specific routes (paridad con persona)
	mux.HandleFunc("GET /api/empresa/deuda", authMiddleware.RequireAuth(empresaHandler.GetDeudaActual))
	mux.HandleFunc("GET /api/empresa/estados", authMiddleware.RequireAuth(empresaHandler.GetEstados))
	mux.HandleFunc("PUT /api/empresa/estado", authMiddleware.RequireAuth(empresaHandler.UpdateEstadoEmpresa))
	mux.HandleFunc("POST /api/empresa/pagar", authMiddleware.RequireAuth(empresaHandler.PayDeuda))

	return mux
}
