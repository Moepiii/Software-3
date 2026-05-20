package utils

import (
	"errors"
	"strings" // <-- Agregado
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Email    string `json:"email"`
	UserType string `json:"user_type"`
	ID       string `json:"id"`
	jwt.RegisteredClaims
}

func GenerateJWT(email, userType, id, secret string) (string, error) {
	claims := Claims{
		Email:    email,
		UserType: userType,
		ID:       id,
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

// Función para validar admins en el backend
func IsAdmin(email string) bool {
	return strings.HasSuffix(email, "@admin.com")
}
