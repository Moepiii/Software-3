/*
Autor: Baudilio Velasquez

Este archivo contiene los handlers HTTP de autenticacion y administracion de
usuarios. Su responsabilidad es recibir requests, delegar en servicios y
responder JSON con codigos HTTP claros.
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

func (h *AuthHandler) RegisterPersona(w http.ResponseWriter, r *http.Request) {
	var req services.RegisterPersonaRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	if err := h.authService.RegisterPersona(r.Context(), req); err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusCreated, map[string]string{"message": "Persona registrada exitosamente"})
}

func (h *AuthHandler) RegisterEmpresa(w http.ResponseWriter, r *http.Request) {
	var req services.RegisterEmpresaRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	if err := h.authService.RegisterEmpresa(r.Context(), req); err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusCreated, map[string]string{"message": "Empresa registrada exitosamente"})
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

	utils.SendJSONResponse(w, http.StatusCreated, map[string]string{"message": "Administrador registrado exitosamente"})
}

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

func (h *AuthHandler) ListAdmins(w http.ResponseWriter, r *http.Request) {
	admins, err := h.authService.ListAllAdmins(r.Context())
	if err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, admins)
}

func (h *AuthHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		id = strings.TrimPrefix(r.URL.Path, "/api/users/")
	}
	if id == "" || id == r.URL.Path {
		utils.SendJSONError(w, http.StatusBadRequest, "ID de usuario requerido")
		return
	}

	if err := h.authService.DeleteUserByID(r.Context(), id); err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Eliminado con éxito"})
}

func (h *AuthHandler) UpdatePersona(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	var req services.UpdatePersonaRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	if err := h.authService.UpdatePersona(r.Context(), claims.ID, req); err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Perfil actualizado exitosamente"})
}

func (h *AuthHandler) UpdateEmpresa(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	var req services.UpdateEmpresaRequest
	if !decodeJSON(w, r, &req) {
		return
	}

	if err := h.authService.UpdateEmpresa(r.Context(), claims.ID, req); err != nil {
		writeServiceError(w, err)
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Perfil de empresa actualizado exitosamente"})
}

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
		errors.Is(err, domain.ErrCedulaAlreadyExists),
		errors.Is(err, domain.ErrRifAlreadyExists):
		utils.SendJSONError(w, http.StatusConflict, err.Error())
	case errors.Is(err, domain.ErrInvalidCredentials),
		errors.Is(err, domain.ErrUnauthorized):
		utils.SendJSONError(w, http.StatusUnauthorized, err.Error())
	case errors.Is(err, domain.ErrInvalidInput):
		utils.SendJSONError(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, domain.ErrForbidden):
		utils.SendJSONError(w, http.StatusForbidden, err.Error())
	case errors.Is(err, domain.ErrUserNotFound):
		utils.SendJSONError(w, http.StatusNotFound, err.Error())
	default:
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
	}
}
