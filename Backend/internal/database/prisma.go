package database

import (
	"Backend/internal/utils"
	"Backend/prisma/db"
	"context"
	"log"
)

var Client *db.PrismaClient

var Personas = db.Personas
var Empresas = db.Empresas
var ErrNotFound = db.ErrNotFound

func Connect() error {
	Client = db.NewClient()
	if err := Client.Prisma.Connect(); err != nil {
		return err
	}
	return nil
}

func Close() {
	if Client != nil {
		_ = Client.Prisma.Disconnect()
	}
}

// Función para crear el admin automáticamente
func SeedAdmin() {
	adminEmail := "admin@admin.com"

	// Verificar si existe
	exists, err := Client.Personas.FindUnique(
		db.Personas.Email.Equals(adminEmail),
	).Exec(context.Background())

	if err == nil && exists != nil {
		return // Ya existe
	}

	// Crear admin
	hashed, _ := utils.HashPassword("123456")

	_, err = Client.Personas.CreateOne(
		db.Personas.Cedula.Set("ADMIN001"),
		db.Personas.Email.Set(adminEmail),
		db.Personas.PasswordHash.Set(hashed),
		db.Personas.Nombres.Set("Admin"),
		db.Personas.Apellidos.Set("Sistema"),
	).Exec(context.Background())

	if err != nil {
		log.Printf("Error creando admin automático: %v", err)
	} else {
		log.Println("Administrador por defecto (admin@admin.com / 123456) creado.")
	}
}
