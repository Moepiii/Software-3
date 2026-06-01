/*
Autor: Baudilio Velasquez

Este archivo centraliza los errores de negocio del backend. Permite que los
servicios expresen fallos conocidos y que los handlers los traduzcan a codigos
HTTP consistentes.
*/
package domain

import "errors"

var (
	ErrEmailAlreadyExists  = errors.New("email already registered")
	ErrCedulaAlreadyExists = errors.New("cedula already exists")
	ErrRifAlreadyExists    = errors.New("rif already exists")
	ErrInvalidCredentials  = errors.New("invalid email or password")
	ErrUserNotFound        = errors.New("user not found")
	ErrInvalidInput        = errors.New("invalid input")
	ErrUnauthorized        = errors.New("unauthorized")
	ErrForbidden           = errors.New("forbidden")
)
