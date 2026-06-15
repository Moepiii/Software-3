/*
Refactorizacion

Este archivo concentra la conexión con Prisma. Expone el cliente conectado para
inyectarlo en repositorios y contiene la semilla inicial del administrador del
sistema y los datos de prueba unificados.
*/
package database

import (
	"Backend/internal/domain"
	"Backend/internal/utils"
	"Backend/prisma/db"
	"context"
	"log"
)

// Aliases globales de Prisma adaptados al nuevo modelo unificado
var Usuarios = db.Usuarios
var Deudas = db.Deuda
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

	// Buscamos en la tabla unica de Usuarios
	exists, err := client.Usuarios.FindUnique(
		db.Usuarios.Email.Equals(adminEmail),
	).Exec(ctx)
	if err == nil && exists != nil {
		return
	}

	hashed, err := utils.HashPassword("123456")
	if err != nil {
		log.Printf("Error generando clave del administrador automatico: %v", err)
		return
	}

	// Creamos el Administrador bajo el nuevo esquema unificado respetando el orden estricto de Prisma
	_, err = client.Usuarios.CreateOne(
		db.Usuarios.Email.Set(adminEmail),                      // 1. Requerido
		db.Usuarios.PasswordHash.Set(hashed),                   // 2. Requerido
		db.Usuarios.Tipo.Set(db.TipoUsuario(domain.TipoAdmin)), // 3. Requerido (Casteado al Enum de Prisma)
		db.Usuarios.Nombre.Set("Admin Sistema"),                // 4. Requerido

		// Todos los campos opcionales van estrictamente al final:
		db.Usuarios.Identificacion.Set("ADMIN001"),
		db.Usuarios.Role.Set(domain.RoleAdmin),
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

	// 2. Seed Estados
	estadosVenezuela := []struct {
		nombre string
		tasa   float64
	}{
		{"amazonas", 3.5}, {"anzóategui", 4.0}, {"apure", 2.5}, {"aragua", 5.0},
		{"barinas", 3.0}, {"bolívar", 6.0}, {"carabobo", 7.5}, {"cojedes", 2.0},
		{"delta amacuro", 1.5}, {"distrito capital", 10.0}, {"falcón", 4.5},
		{"guárico", 3.0}, {"lara", 5.5}, {"mérida", 4.0}, {"miranda", 8.0},
		{"monagas", 4.5}, {"nueva esparta", 9.0}, {"portuguesa", 3.5},
		{"sucre", 3.0}, {"táchira", 5.0}, {"trujillo", 3.5}, {"la guaira", 6.5},
		{"yaracuy", 4.0}, {"zulia", 8.5}, {"caracas", 5.0},
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

	// Obtener estado Caracas para asignar a los usuarios de prueba
	caracasState, err := client.Estado.FindUnique(
		db.Estado.Nombre.Equals("caracas"),
	).Exec(ctx)
	if err != nil || caracasState == nil {
		log.Printf("Advertencia: No se pudo obtener el estado 'caracas' para los usuarios: %v", err)
	}

	// 3. Seed default persona user
	personaEmail := "persona@persona.com"
	existsPersona, err := client.Usuarios.FindUnique(
		db.Usuarios.Email.Equals(personaEmail),
	).Exec(ctx)

	var pID string
	if err == nil && existsPersona != nil {
		pID = existsPersona.ID
	} else {
		hashed, err := utils.HashPassword("123456")
		if err != nil {
			log.Printf("Error generando clave de persona de prueba: %v", err)
		} else {
			optionalParams := []db.UsuariosSetParam{
				db.Usuarios.Identificacion.Set("V20202020"),
				db.Usuarios.Role.Set(domain.RoleUser),
			}
			if caracasState != nil {
				optionalParams = append(optionalParams, db.Usuarios.Estado.Link(
					db.Estado.ID.Equals(caracasState.ID),
				))
			}

			createdPersona, err := client.Usuarios.CreateOne(
				db.Usuarios.Email.Set(personaEmail),
				db.Usuarios.PasswordHash.Set(hashed),
				db.Usuarios.Tipo.Set(db.TipoUsuario(domain.TipoNatural)),
				db.Usuarios.Nombre.Set("Juan Perez"),
				optionalParams...,
			).Exec(ctx)
			if err != nil {
				log.Printf("Error creando persona de prueba: %v", err)
			} else {
				pID = createdPersona.ID
				log.Println("Persona de prueba creada: persona@persona.com / 123456")
			}
		}
	}

	// 4. Seed deudas para el usuario Natural (Independiente del flujo de arriba)
	if pID != "" {
		// Buscamos si ya tiene alguna deuda
		activeDebts, err := client.Deuda.FindMany(
			db.Deuda.UsuarioID.Equals(pID),
			db.Deuda.Vigente.Equals(true),
		).Exec(ctx)

		if err == nil && len(activeDebts) == 0 {
			// Crear la deuda inicial
			nuevaDeuda, err := client.Deuda.CreateOne(
				db.Deuda.Monto.Set(10000.0), // Monto total
				db.Deuda.Usuario.Link(
					db.Usuarios.ID.Equals(pID),
				),
				db.Deuda.Vigente.Set(true),
			).Exec(ctx)

			if err != nil {
				log.Printf("Error sembrando deuda de prueba: %v", err)
			} else {
				// Esto es importante para que tu historial no esté vacío
				_, err = client.Abono.CreateOne(
					db.Abono.Monto.Set(2000.0), // Un abono de prueba
					db.Abono.Deuda.Link(
						db.Deuda.ID.Equals(nuevaDeuda.ID),
					),
				).Exec(ctx)

				log.Println("Deuda de 10000.0 y abono de 2000.0 sembrados para persona@persona.com")
			}
		}
	}

	// 5. Seed default empresa user
	empresaEmail := "empresa@empresa.com"
	existsEmpresa, err := client.Usuarios.FindUnique(
		db.Usuarios.Email.Equals(empresaEmail),
	).Exec(ctx)

	var eID string
	if err == nil && existsEmpresa != nil {
		eID = existsEmpresa.ID
	} else {
		hashed, err := utils.HashPassword("123456")
		if err != nil {
			log.Printf("Error generando clave de empresa de prueba: %v", err)
		} else {
			optionalParams := []db.UsuariosSetParam{
				db.Usuarios.Identificacion.Set("J123456789"),
				db.Usuarios.Role.Set(domain.RoleUser),
			}
			if caracasState != nil {
				optionalParams = append(optionalParams, db.Usuarios.Estado.Link(
					db.Estado.ID.Equals(caracasState.ID),
				))
			}

			createdEmpresa, err := client.Usuarios.CreateOne(
				db.Usuarios.Email.Set(empresaEmail),
				db.Usuarios.PasswordHash.Set(hashed),
				db.Usuarios.Tipo.Set(db.TipoUsuario(domain.TipoJuridico)),
				db.Usuarios.Nombre.Set("EcoCorp"),
				optionalParams...,
			).Exec(ctx)
			if err != nil {
				log.Printf("Error creando empresa de prueba: %v", err)
			} else {
				eID = createdEmpresa.ID
				log.Println("Empresa de prueba creada: empresa@empresa.com / 123456")
			}
		}
	}

	// 6. Seed deudas para el usuario Juridico
	if eID != "" {
		activeDebtsEmpresa, err := client.Deuda.FindMany(
			db.Deuda.UsuarioID.Equals(eID),
			db.Deuda.Vigente.Equals(true),
		).Exec(ctx)
		if err == nil && len(activeDebtsEmpresa) == 0 {
			_, err = client.Deuda.CreateOne(
				db.Deuda.Monto.Set(25000.0),
				db.Deuda.Usuario.Link(
					db.Usuarios.ID.Equals(eID),
				),
				db.Deuda.Vigente.Set(true),
			).Exec(ctx)
			if err != nil {
				log.Printf("Error sembrando deuda de empresa de prueba: %v", err)
			} else {
				log.Println("Deuda de empresa de 25000.0 bs sembrada para empresa@empresa.com")
			}
		}
	}
}
