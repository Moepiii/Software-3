/*
Autor: Baudilio Velasquez

Este archivo encapsula la carga del archivo .env. Mantiene el detalle de la
libreria godotenv fuera de la logica principal de configuracion.
*/
package config

import "github.com/joho/godotenv"

func godotenvLoad() error {
	return godotenv.Load()
}
