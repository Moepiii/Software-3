/*
Autor: Baudilio Velasquez

Este archivo concentra la conexion con Prisma. Expone el cliente conectado para
inyectarlo en repositorios y contiene la semilla inicial del administrador del
sistema.
*/
package database

import (
	"Backend/internal/domain"
	"Backend/internal/utils"
	"Backend/prisma/db"
	"context"
	"log"
)

var Personas = db.Personas
var Empresas = db.Empresas
var ErrNotFound = db.ErrNotFound

func Connect() (*db.PrismaClient, error) {
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		return nil, err
	}
	return client, nil
}

func Close(client *db.PrismaClient) {
	if client != nil {
		_ = client.Prisma.Disconnect()
	}
}

func SeedAdmin(ctx context.Context, client *db.PrismaClient) {
	adminEmail := "admin@admin.com"

	exists, err := client.Personas.FindUnique(
		db.Personas.Email.Equals(adminEmail),
	).Exec(ctx)
	if err == nil && exists != nil {
		return
	}

	hashed, err := utils.HashPassword("123456")
	if err != nil {
		log.Printf("Error generando clave del administrador automatico: %v", err)
		return
	}

	_, err = client.Personas.CreateOne(
		db.Personas.Cedula.Set("ADMIN001"),
		db.Personas.Email.Set(adminEmail),
		db.Personas.PasswordHash.Set(hashed),
		db.Personas.Nombres.Set("Admin"),
		db.Personas.Apellidos.Set("Sistema"),
		db.Personas.Role.Set(domain.RoleAdmin),
	).Exec(ctx)
	if err != nil {
		log.Printf("Error creando admin automatico: %v", err)
		return
	}

	log.Println("Administrador por defecto creado: admin@admin.com / 123456")
}
