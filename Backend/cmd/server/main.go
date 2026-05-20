package main

import (
    "log"
    "net/http"
    "Backend/internal/config"
    "Backend/internal/database"
    "Backend/internal/handlers"
    "Backend/internal/repositories"
    "Backend/internal/services"
)

func main() {
    cfg := config.Load()

    // Conectar a BD
    if err := database.Connect(); err != nil {
        log.Fatal("Failed to connect database:", err)
    }
    defer database.Close()

    // Inicializar repositorios
    personaRepo := repositories.NewPersonaRepository()
    empresaRepo := repositories.NewEmpresaRepository()

    // Inicializar servicios
    authService := services.NewAuthService(personaRepo, empresaRepo, cfg.JWTSecret)

    // Inicializar handlers
    authHandler := handlers.NewAuthHandler(authService)

    // Configurar rutas
    mux := http.NewServeMux()
    mux.HandleFunc("POST /api/register/persona", authHandler.RegisterPersona)
    mux.HandleFunc("POST /api/register/empresa", authHandler.RegisterEmpresa)
    mux.HandleFunc("POST /api/login", authHandler.Login)

    // Iniciar servidor
    log.Printf("Server listening on :%s", cfg.Port)
    if err := http.ListenAndServe(":"+cfg.Port, mux); err != nil {
        log.Fatal(err)
    }
}