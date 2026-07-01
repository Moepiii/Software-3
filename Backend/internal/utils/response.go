package utils

import (
	"encoding/json"
	"net/http"
)

func SendJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Error al codificar respuesta", http.StatusInternalServerError)
	}
}

func SendJSONError(w http.ResponseWriter, status int, message string) {
	SendJSONResponse(w, status, map[string]string{"error": message})
}
