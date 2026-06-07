/*
Autor: Baudilio Velasquez

Este archivo centraliza los errores de negocio del backend. Permite que los
servicios expresen fallos conocidos y que los handlers los traduzcan a codigos
HTTP consistentes.

*Agregado error unificado de identificacion (cedula o rif) que ya existe*
*/
package domain

import "errors"

var (
	ErrEmailAlreadyExists          = errors.New("email already registered")
	ErrIdentificacionAlreadyExists = errors.New("identificacion already exists") // Unificando ErrCedula y ErrRif
	ErrInvalidCredentials          = errors.New("invalid email or password")
	ErrUserNotFound                = errors.New("user not found")
	ErrInvalidInput                = errors.New("invalid input")
	ErrUnauthorized                = errors.New("unauthorized")
	ErrForbidden                   = errors.New("forbidden")
)
