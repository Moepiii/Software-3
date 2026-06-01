/*
Autor: Baudilio Velasquez

Este archivo contiene helpers para respuestas HTTP JSON. Su objetivo es evitar
duplicacion en handlers y mantener un formato uniforme para exitos y errores.
*/
package utils

import (
	"encoding/json"
	"net/http"
)

func SendJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func SendJSONError(w http.ResponseWriter, status int, message string) {
	SendJSONResponse(w, status, map[string]string{"error": message})
}
