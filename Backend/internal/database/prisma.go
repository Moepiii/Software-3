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

func SeedData(ctx context.Context, client *db.PrismaClient) {
	// 1. Seed Admin
	SeedAdmin(ctx, client)

	// 2. Seed Estados and default Rates
	estadosVenezuela := []struct {
		nombre string
		tasa   float64
	}{
		{"amazonas", 3.5},
		{"anzóategui", 4.0},
		{"apure", 2.5},
		{"aragua", 5.0},
		{"barinas", 3.0},
		{"bolívar", 6.0},
		{"carabobo", 7.5},
		{"cojedes", 2.0},
		{"delta amacuro", 1.5},
		{"distrito capital", 10.0},
		{"falcón", 4.5},
		{"guárico", 3.0},
		{"lara", 5.5},
		{"mérida", 4.0},
		{"miranda", 8.0},
		{"monagas", 4.5},
		{"nueva esparta", 9.0},
		{"portuguesa", 3.5},
		{"sucre", 3.0},
		{"táchira", 5.0},
		{"trujillo", 3.5},
		{"la guaira", 6.5},
		{"yaracuy", 4.0},
		{"zulia", 8.5},
		{"caracas", 5.0},
	}

	log.Println("Sembrando estados y tasas...")
	for _, est := range estadosVenezuela {
		exists, err := client.Estado.FindUnique(
			db.Estado.Nombre.Equals(est.nombre),
		).Exec(ctx)
		var stateID string
		if err != nil || exists == nil {
			created, err := client.Estado.CreateOne(
				db.Estado.Nombre.Set(est.nombre),
			).Exec(ctx)
			if err != nil {
				log.Printf("Error sembrando estado %s: %v", est.nombre, err)
				continue
			}
			stateID = created.ID
		} else {
			stateID = exists.ID
		}

		ratesCount, err := client.TasaEstado.FindMany(
			db.TasaEstado.EstadoID.Equals(stateID),
		).Exec(ctx)
		if err == nil && len(ratesCount) == 0 {
			_, err = client.TasaEstado.CreateOne(
				db.TasaEstado.Porcentaje.Set(est.tasa),
				db.TasaEstado.Estado.Link(
					db.Estado.ID.Equals(stateID),
				),
			).Exec(ctx)
			if err != nil {
				log.Printf("Error sembrando tasa para %s: %v", est.nombre, err)
			}
		}
	}

	// 3. Seed default persona user
	personaEmail := "persona@persona.com"
	existsPersona, err := client.Personas.FindUnique(
		db.Personas.Email.Equals(personaEmail),
	).Exec(ctx)

	var pCedula string = "V20202020"
	if err != nil || existsPersona == nil {
		hashed, err := utils.HashPassword("123456")
		if err != nil {
			log.Printf("Error generando clave de persona de prueba: %v", err)
			return
		}

		caracasState, err := client.Estado.FindUnique(
			db.Estado.Nombre.Equals("caracas"),
		).Exec(ctx)

		var options []db.PersonasSetParam
		if err == nil && caracasState != nil {
			options = append(options, db.Personas.Estado.Link(
				db.Estado.ID.Equals(caracasState.ID),
			))
		}

		_, err = client.Personas.CreateOne(
			db.Personas.Cedula.Set(pCedula),
			db.Personas.Email.Set(personaEmail),
			db.Personas.PasswordHash.Set(hashed),
			db.Personas.Nombres.Set("Juan"),
			db.Personas.Apellidos.Set("Perez"),
			options...,
		).Exec(ctx)
		if err != nil {
			log.Printf("Error creando persona de prueba: %v", err)
			return
		}
		log.Println("Persona de prueba creada: persona@persona.com / 123456")
	} else {
		pCedula = existsPersona.Cedula
	}

	// 4. Seed initial debt for persona user
	activeDebts, err := client.Deuda.FindMany(
		db.Deuda.PersonaCedula.Equals(pCedula),
		db.Deuda.Vigente.Equals(true),
	).Exec(ctx)
	if err == nil && len(activeDebts) == 0 {
		_, err = client.Deuda.CreateOne(
			db.Deuda.Monto.Set(10000.0),
			db.Deuda.Persona.Link(
				db.Personas.Cedula.Equals(pCedula),
			),
			db.Deuda.Vigente.Set(true),
		).Exec(ctx)
		if err != nil {
			log.Printf("Error sembrando deuda de prueba: %v", err)
		} else {
			log.Println("Deuda de prueba de 10000.0 bs sembrada para persona@persona.com")
		}
	}
}
