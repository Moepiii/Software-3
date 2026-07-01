package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Tipo  string `json:"tipo"`
	jwt.RegisteredClaims
}

func GenerateJWT(id, email, role, tipo, secret string) (string, error) {
	claims := Claims{
		ID:    id,
		Email: email,
		Role:  role,
		Tipo:  tipo,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ValidateJWT(tokenString, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("token inválido")
}

func TokenFromBearerHeader(header string) (string, bool) {
	const prefix = "Bearer "
	if len(header) > len(prefix) && header[:len(prefix)] == prefix {
		return header[len(prefix):], true
	}
	return "", false
}

func IsAdminRole(role string) bool {
	return role == "admin"
}
