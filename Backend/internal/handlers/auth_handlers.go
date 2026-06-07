/*
Este archivo contiene los handlers HTTP de autenticación y administración de
usuarios. Su responsabilidad es recibir requests (HTTP/JSON), mapear los payloads
a los DTOs genéricos del servicio, y responder con códigos HTTP claros.
*/
package handlers

import (
	"Backend/internal/domain"
	"Backend/internal/middleware"
	"Backend/internal/services"
	"Backend/internal/utils"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// HANDLERS UNIFICADOS DE USUARIOS (Contribuyentes)

// Register maneja tanto el registro de Personas Naturales como de Empresas (Juridicos)
// dependiendo del campo "tipo" enviado en el JSON payload.
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var raw map[string]string
	if !decodeJSON(w, r, &raw) {
		return
	}

	req := services.RegisterRequest{
		Identificacion: raw["identificacion"],
		Email:          raw["email"],
		Password:       raw["password"],
		Nombre:         raw["nombre"],
	}

	if req.Identificacion == "" {
		req.Identificacion = raw["cedula"]
	}
	if req.Identificacion == "" {
		req.Identificacion = raw["rif"]
	}

	if req.Nombre == "" {
		req.Nombre = strings.TrimSpace(raw["nombres"] + " " + raw["apellidos"])
	}
	if req.Nombre == "" {
		req.Nombre = raw["nombre_empresa"]
	}

	if strings.Contains(r.URL.Path, "empresa") {
		req.Tipo = domain.TipoJuridico
	} else {
		req.Tipo = domain.TipoNatural
	}

	if err := h.authService.Register(r.Context(), req); err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusCreated, map[string]string{
		"message": "Usuario registrado exitosamente",
	})
}

// Login autentica a cualquier usuario (Natural, Jurídico o Admin) usando su Email y Password
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req services.LoginRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	resp, err := h.authService.Login(r.Context(), req)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, resp)
}

// UpdateProfile unifica la actualización de datos comunes (Nombre/Razón Social y Email)
func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	var raw map[string]string
	if !decodeJSON(w, r, &raw) {
		return
	}

	nombre := raw["nombre"]
	if nombre == "" {
		nombre = strings.TrimSpace(raw["nombres"] + " " + raw["apellidos"])
	}
	if nombre == "" {
		nombre = raw["nombre_empresa"]
	}

	req := services.UpdateUsuarioRequest{
		Nombre: nombre,
		Email:  raw["email"],
	}

	if err := h.authService.UpdateUsuario(r.Context(), claims.ID, req); err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{
		"message": "Perfil actualizado exitosamente",
	})
}

// HANDLERS DE GESTION ADMINISTRATIVA (Admins)
func (h *AuthHandler) ListAdmins(w http.ResponseWriter, r *http.Request) {
	admins, err := h.authService.ListAdmins(r.Context())
	if err != nil {
		writeServiceError(w, err)
		return
	}
	utils.SendJSONResponse(w, http.StatusOK, admins)
}

func (h *AuthHandler) CreateAdmin(w http.ResponseWriter, r *http.Request) {
	var req services.CreateAdminRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	if err := h.authService.CreateAdmin(r.Context(), req); err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusCreated, map[string]string{
		"message": "Administrador creado exitosamente",
	})
}

func (h *AuthHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		utils.SendJSONError(w, http.StatusBadRequest, "ID de usuario requerido")
		return
	}

	if err := h.authService.DeleteUser(r.Context(), id); err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{
		"message": "Usuario eliminado exitosamente",
	})
}

// HELPERS REUTILIZABLES INTERNOS
func decodeJSON(w http.ResponseWriter, r *http.Request, target interface{}) bool {
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Payload inválido")
		return false
	}
	return true
}

func writeServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrEmailAlreadyExists),
		errors.Is(err, domain.ErrIdentificacionAlreadyExists):
		utils.SendJSONError(w, http.StatusConflict, err.Error())
	case errors.Is(err, domain.ErrInvalidCredentials),
		errors.Is(err, domain.ErrUnauthorized):
		utils.SendJSONError(w, http.StatusUnauthorized, err.Error())
	case errors.Is(err, domain.ErrInvalidInput):
		utils.SendJSONError(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, domain.ErrUserNotFound):
		utils.SendJSONError(w, http.StatusNotFound, err.Error())
	default:
		utils.SendJSONError(w, http.StatusInternalServerError, "Error interno del servidor")
	}
}
