package domain

import "errors"

var (
    ErrEmailAlreadyExists = errors.New("email already registered")
    ErrCedulaAlreadyExists = errors.New("cedula already exists")
    ErrRifAlreadyExists    = errors.New("rif already exists")
    ErrInvalidCredentials  = errors.New("invalid email or password")
    ErrUserNotFound        = errors.New("user not found")
)