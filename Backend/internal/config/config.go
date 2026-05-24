/*
Autor: Baudilio Velasquez

Este archivo carga y valida la configuracion del backend. Su responsabilidad es
leer las variables de entorno necesarias para iniciar el servidor, evitando
secretos escritos directamente en el codigo fuente.
*/
package config

import (
	"errors"
	"log"
	"os"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string
}

func Load() *Config {
	if err := loadDotEnv(); err != nil {
		log.Println("No se encontro archivo .env, se usaran variables del sistema")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
		Port:        port,
	}
}

func (c *Config) Validate() error {
	if c.DatabaseURL == "" {
		return errors.New("DATABASE_URL es requerida")
	}
	if c.JWTSecret == "" {
		return errors.New("JWT_SECRET es requerido")
	}
	return nil
}

func loadDotEnv() error {
	// Se mantiene aislado para que la configuracion sea facil de probar y para
	// que el resto del proyecto no dependa directamente de la libreria externa.
	return godotenvLoad()
}
