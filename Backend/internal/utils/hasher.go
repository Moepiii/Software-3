/*
Autor: Baudilio Velasquez

Este archivo agrupa las funciones de seguridad para contrasenas. Usa bcrypt
para guardar hashes seguros y comparar claves sin exponer texto plano.
*/
package utils

import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
