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

func NewRouter(authHandler *handlers.AuthHandler, authMiddleware *middleware.AuthMiddleware) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/register/persona", authHandler.RegisterPersona)
	mux.HandleFunc("POST /api/register/empresa", authHandler.RegisterEmpresa)
	mux.HandleFunc("POST /api/login", authHandler.Login)
	mux.HandleFunc("GET /api/admins", authMiddleware.RequireAdmin(authHandler.ListAdmins))
	mux.HandleFunc("POST /api/admins", authMiddleware.RequireAdmin(authHandler.CreateAdmin))
	mux.HandleFunc("DELETE /api/users/{id}", authMiddleware.RequireAdmin(authHandler.DeleteUser))
	mux.HandleFunc("PUT /api/me/persona", authMiddleware.RequireAuth(authHandler.UpdatePersona))
	mux.HandleFunc("PUT /api/me/empresa", authMiddleware.RequireAuth(authHandler.UpdateEmpresa))

	return mux
}
