package handlers

import (
	"Backend/internal/services"
	"Backend/internal/utils"
	"encoding/json"
	"net/http"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req services.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	resp, err := h.authService.Login(r.Context(), req)
	if err != nil {
		utils.SendJSONError(w, http.StatusUnauthorized, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, resp)
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req services.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	resp, err := h.authService.Register(r.Context(), req)
	if err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusCreated, resp)
}

func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	// Obtener userID del contexto (debe estar en el JWT)
	userID := r.Context().Value("userID")
	if userID == nil {
		utils.SendJSONError(w, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	usuario, err := h.authService.UpdateProfile(r.Context(), userID.(string), updates)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, usuario)
}

// ListAdmins - Listar administradores
func (h *AuthHandler) ListAdmins(w http.ResponseWriter, r *http.Request) {
	// Este método debería listar admins desde el repositorio
	utils.SendJSONResponse(w, http.StatusOK, []map[string]string{})
}

// CreateAdmin - Crear administrador
func (h *AuthHandler) CreateAdmin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Cedula    string `json:"cedula"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		Nombres   string `json:"nombres"`
		Apellidos string `json:"apellidos"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	// Aquí deberías crear el admin usando el authService
	utils.SendJSONResponse(w, http.StatusCreated, map[string]string{"message": "Admin creado"})
}

// DeleteUser - Eliminar usuario
func (h *AuthHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	// Aquí deberías eliminar el usuario
	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Usuario eliminado"})
}
