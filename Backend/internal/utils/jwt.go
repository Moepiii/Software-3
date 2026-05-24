/*
Autor: Baudilio Velasquez

Este archivo maneja la creacion y validacion de tokens JWT. Los claims guardan
la identidad, tipo de usuario y rol para que middlewares y servicios puedan
tomar decisiones de autorizacion.
*/
package utils

import (
	"errors"
	"strings"
	"time"

	"Backend/internal/domain"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Email    string `json:"email"`
	UserType string `json:"user_type"`
	ID       string `json:"id"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateJWT(email, userType, id, role, secret string) (string, error) {
	claims := Claims{
		Email:    email,
		UserType: userType,
		ID:       id,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ValidateJWT(tokenString, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

func TokenFromBearerHeader(header string) (string, bool) {
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
		return "", false
	}
	return strings.TrimSpace(parts[1]), true
}

func IsAdminRole(role string) bool {
	return role == domain.RoleAdmin
}
