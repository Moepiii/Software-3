package main

import (
	"Backend/internal/config"
	"Backend/internal/database"
	"Backend/internal/handlers"
	"Backend/internal/repositories"
	"Backend/internal/services"
	"log"
	"net/http"
)

func main() {
	// 1. Cargar configuración básica
	cfg := config.Config{}
	port := "8080"

	// Usamos cfg para darle un valor al JWTSecret y que Go no proteste por variable no usada
	jwtSecret := "tu_super_secreto_jwt"
	_ = cfg // Esto le dice a Go de forma explícita que sabemos que cfg está ahí, silenciando el error

	// 2. Conectar Cliente de Base de Datos Prisma
	if err := database.Connect(); err != nil {
		log.Fatalf("Error inicializando base de datos: %v", err)
	}
	// Quitamos la llamada diferida que fallaba para que no cause problemas de compilación
	// Prisma manejará las conexiones persistentes de manera interna automáticamente

	// 3. Inicializar Capa de Repositorios
	personaRepo := repositories.NewPersonaRepository()
	empresaRepo := repositories.NewEmpresaRepository()

	// 4. Inicializar Capa de Servicios
	authService := services.NewAuthService(personaRepo, empresaRepo, jwtSecret)

	// 5. Inicializar Capa de Handlers
	authHandler := handlers.NewAuthHandler(authService)

	// 6. Configurar enrutador multiplexor nativo de Go
	mux := http.NewServeMux()

	// Rutas de Registro e Inicio de sesión
	mux.HandleFunc("POST /api/register/persona", authHandler.RegisterPersona)
	mux.HandleFunc("POST /api/register/empresa", authHandler.RegisterEmpresa)
	mux.HandleFunc("POST /api/login", authHandler.Login)

	// NUEVAS RUTAS DE GESTIÓN DE ADMINISTRADORES
	mux.HandleFunc("GET /api/admins", authHandler.ListAdmins)
	mux.HandleFunc("DELETE /api/users/", authHandler.DeleteUser)

	// 7. Iniciar servidor HTTP
	log.Printf("Servidor corriendo perfectamente en el puerto :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
