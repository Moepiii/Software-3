/*
Autor: Baudilio Velasquez

Este archivo es el punto de entrada del servidor. Carga configuracion, conecta
Prisma, arma las dependencias principales y arranca el servidor HTTP.
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

	personaRepo := repositories.NewPersonaRepository(client)
	empresaRepo := repositories.NewEmpresaRepository(client)
	deudaRepo := repositories.NewDeudaRepository(client)
	deudaEmpresaRepo := repositories.NewDeudaEmpresaRepository(client)
	estadoRepo := repositories.NewEstadoRepository(client)

	authService := services.NewAuthService(personaRepo, empresaRepo, cfg.JWTSecret)
	personaService := services.NewPersonaService(personaRepo, deudaRepo, estadoRepo)
	empresaService := services.NewEmpresaService(empresaRepo, deudaEmpresaRepo, estadoRepo)

	authHandler := handlers.NewAuthHandler(authService)
	personaHandler := handlers.NewPersonaHandler(personaService)
	empresaHandler := handlers.NewEmpresaHandler(empresaService)

	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTSecret)
	router := routes.NewRouter(authHandler, personaHandler, empresaHandler, authMiddleware)

	log.Printf("Servidor corriendo en el puerto :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		log.Fatal(err)
	}
}
