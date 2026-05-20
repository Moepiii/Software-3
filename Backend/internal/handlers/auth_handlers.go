package handlers

import (
    "encoding/json"
    "net/http"
    "Backend/internal/domain"
    "Backend/internal/services"
    "Backend/internal/utils"
)

type AuthHandler struct {
    authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
    return &AuthHandler{authService: authService}
}

func (h *AuthHandler) RegisterPersona(w http.ResponseWriter, r *http.Request) {
    var req services.RegisterPersonaRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        utils.SendJSONError(w, http.StatusBadRequest, "Invalid request body")
        return
    }
    err := h.authService.RegisterPersona(r.Context(), req)
    if err != nil {
        switch err {
        case domain.ErrEmailAlreadyExists:
            utils.SendJSONError(w, http.StatusConflict, "Email already registered")
        case domain.ErrCedulaAlreadyExists:
            utils.SendJSONError(w, http.StatusConflict, "Cedula already exists")
        default:
            utils.SendJSONError(w, http.StatusInternalServerError, "Internal error")
        }
        return
    }
    utils.SendJSONResponse(w, http.StatusCreated, map[string]string{"message": "Persona registered successfully"})
}

func (h *AuthHandler) RegisterEmpresa(w http.ResponseWriter, r *http.Request) {
    var req services.RegisterEmpresaRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        utils.SendJSONError(w, http.StatusBadRequest, "Invalid request body")
        return
    }
    err := h.authService.RegisterEmpresa(r.Context(), req)
    if err != nil {
        switch err {
        case domain.ErrEmailAlreadyExists:
            utils.SendJSONError(w, http.StatusConflict, "Email already registered")
        case domain.ErrRifAlreadyExists:
            utils.SendJSONError(w, http.StatusConflict, "RIF already exists")
        default:
            utils.SendJSONError(w, http.StatusInternalServerError, "Internal error")
        }
        return
    }
    utils.SendJSONResponse(w, http.StatusCreated, map[string]string{"message": "Empresa registered successfully"})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
    var req services.LoginRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        utils.SendJSONError(w, http.StatusBadRequest, "Invalid request body")
        return
    }
    res, err := h.authService.Login(r.Context(), req)
    if err != nil {
        switch err {
        case domain.ErrInvalidCredentials:
            utils.SendJSONError(w, http.StatusUnauthorized, "Invalid email or password")
        default:
            utils.SendJSONError(w, http.StatusInternalServerError, "Internal error")
        }
        return
    }
    utils.SendJSONResponse(w, http.StatusOK, res)
}