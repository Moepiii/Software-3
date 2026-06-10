/*
Autor: Baudilio Velasquez
Modificación: Arquitectura Unificada

Este archivo es el punto de entrada del servidor. Carga configuración, conecta
Prisma, arma las dependencias principales unificadas y arranca el servidor HTTP.

Refactorizado: se inicializan los repositorios, servicios y handlers unificados
*/
package main

import (
	"Backend/internal/config"
	"Backend/internal/database"
	"Backend/internal/handlers"
	"Backend/internal/middleware"
	"Backend/internal/repositories"
	"Backend/internal/routes"
	"Backend/internal/services"
	"context"
	"log"
	"net/http"
)

func main() {
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Configuracion invalida: %v", err)
	}

	client, err := database.Connect()
	if err != nil {
		log.Fatalf("Error inicializando base de datos: %v", err)
	}
	defer database.Close(client)

	database.SeedData(context.Background(), client)

	// Repositorios
	usuarioRepo := repositories.NewUsuarioRepository(client)
	deudaRepo := repositories.NewDeudaRepository(client)
	estadoRepo := repositories.NewEstadoRepository(client)
	cursoRepo := repositories.NewCursoRepository(client)

	// Servicios
	authService := services.NewAuthService(usuarioRepo, cfg.JWTSecret)
	usuarioService := services.NewUsuarioService(usuarioRepo, deudaRepo, estadoRepo)
	cursoService := services.NewCursoService(cursoRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	usuarioHandler := handlers.NewUsuarioHandler(usuarioService)
	cursoHandler := handlers.NewCursoHandler(cursoService)

	// Middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTSecret)

	// Inicializacion del Router
	router := routes.NewRouter(authHandler, usuarioHandler, cursoHandler, authMiddleware)

	// Arranque del servidor HTTP
	log.Printf("Servidor corriendo en puerto %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}
