package handlers

import (
	"Backend/internal/domain"
	"Backend/internal/services"
	"Backend/internal/utils"
	"encoding/json"
	"net/http"
	"strings"
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
	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	var req services.RegisterRequest
	if email, ok := payload["email"].(string); ok {
		req.Email = email
	}
	if password, ok := payload["password"].(string); ok {
		req.Password = password
	}

	if strings.Contains(r.URL.Path, "/persona") {
		req.Tipo = domain.TipoNatural
		if cedula, ok := payload["cedula"].(string); ok {
			req.Identificacion = cedula
		}

		nombres, _ := payload["nombres"].(string)
		apellidos, _ := payload["apellidos"].(string)
		req.Nombre = strings.TrimSpace(nombres + " " + apellidos)
	} else if strings.Contains(r.URL.Path, "/empresa") {
		req.Tipo = domain.TipoJuridico
		if rif, ok := payload["rif"].(string); ok {
			req.Identificacion = rif
		}
		if nombreEmpresa, ok := payload["nombre_empresa"].(string); ok {
			req.Nombre = nombreEmpresa
		}
	} else {
		if tipo, ok := payload["tipo"].(string); ok {
			req.Tipo = tipo
		}
		if nombre, ok := payload["nombre"].(string); ok {
			req.Nombre = nombre
		}
		if id, ok := payload["identificacion"].(string); ok {
			req.Identificacion = id
		}
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
	admins, err := h.authService.ListAdmins(r.Context())
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SendJSONResponse(w, http.StatusOK, admins)
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

	admin, err := h.authService.CreateAdmin(r.Context(), req.Email, req.Password, strings.TrimSpace(req.Nombres+" "+req.Apellidos), req.Cedula)
	if err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, err.Error())
		return
	}
	utils.SendJSONResponse(w, http.StatusCreated, admin)
}

// DeleteUser - Eliminar usuario
func (h *AuthHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		utils.SendJSONError(w, http.StatusBadRequest, "id requerido")
		return
	}
	if err := h.authService.DeleteUser(r.Context(), id); err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Usuario eliminado"})
}
