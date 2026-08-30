package handlers

import (
	"Backend/internal/middleware"
	"Backend/internal/services"
	"Backend/internal/utils"
	"encoding/json"
	"net/http"
)

type UsuarioHandler struct {
	usuarioService *services.UsuarioService
}

type AcreditarProgresoRequest struct {
	UsuarioID string `json:"usuario_id"`
	CursoID   string `json:"curso_id"`
	Progreso  int    `json:"progreso_pct"`
}

func NewUsuarioHandler(usuarioService *services.UsuarioService) *UsuarioHandler {
	return &UsuarioHandler{usuarioService: usuarioService}
}

// GetDeudaActual - Obtener la deuda vigente del usuario autenticado
func (h *UsuarioHandler) GetDeudaActual(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok || claims.ID == "" {
		utils.SendJSONError(w, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	deuda, err := h.usuarioService.GetDeudaActual(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, deuda)
}

// PayDeuda - Realizar un pago de la deuda
func (h *UsuarioHandler) PayDeuda(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok || claims.ID == "" {
		utils.SendJSONError(w, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	var req struct {
		Monto float64 `json:"monto"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	if req.Monto <= 0 {
		utils.SendJSONError(w, http.StatusBadRequest, "El monto debe ser mayor a 0")
		return
	}

	deuda, err := h.usuarioService.PayDeuda(r.Context(), claims.ID, req.Monto)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, deuda)
}

// GetEstados - Obtener todos los estados con sus tasas actuales
func (h *UsuarioHandler) GetEstados(w http.ResponseWriter, r *http.Request) {
	estados, err := h.usuarioService.GetEstados(r.Context())
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, estados)
}

// UpdateEstadoUsuario - Actualizar el estado del usuario autenticado
func (h *UsuarioHandler) UpdateEstadoUsuario(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok || claims.ID == "" {
		utils.SendJSONError(w, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	var req struct {
		EstadoID string `json:"estado_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	if req.EstadoID == "" {
		utils.SendJSONError(w, http.StatusBadRequest, "El estado_id es requerido")
		return
	}

	err := h.usuarioService.UpdateEstadoUsuario(r.Context(), claims.ID, req.EstadoID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Estado actualizado correctamente"})
}

// GetEstadisticas - Obtener estadísticas del usuario
func (h *UsuarioHandler) GetEstadisticas(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok || claims.ID == "" {
		utils.SendJSONError(w, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	stats, err := h.usuarioService.GetEstadisticas(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, stats)
}

// 🆕 GetExperiencia - Obtener experiencia y nivel del usuario
func (h *UsuarioHandler) GetExperiencia(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok || claims.ID == "" {
		utils.SendJSONError(w, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	usuario, err := h.usuarioService.GetUsuarioByID(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, "Error obteniendo usuario")
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]int{
		"nivel":       usuario.Nivel,
		"experiencia": usuario.Experiencia,
		"maximoNivel": 1000,
	})
}

// GetUsuariosConDeuda - Listar todos los usuarios con su deuda correspondiente (solo admin)
func (h *UsuarioHandler) GetUsuariosConDeuda(w http.ResponseWriter, r *http.Request) {
	usuarios, err := h.usuarioService.GetUsuariosConDeuda(r.Context())
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SendJSONResponse(w, http.StatusOK, usuarios)
}

// UpdateUserDebt - Establecer o modificar la deuda de un usuario (solo admin)
func (h *UsuarioHandler) UpdateUserDebt(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UsuarioID string  `json:"usuario_id"`
		Monto     float64 `json:"monto"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	if req.UsuarioID == "" {
		utils.SendJSONError(w, http.StatusBadRequest, "El usuario_id es requerido")
		return
	}

	if req.Monto < 0 {
		utils.SendJSONError(w, http.StatusBadRequest, "El monto no puede ser negativo")
		return
	}

	deuda, err := h.usuarioService.UpdateUserDebt(r.Context(), req.UsuarioID, req.Monto)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, deuda)
}

func (h *UsuarioHandler) GetPuntos(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok || claims.ID == "" {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	resumen, err := h.usuarioService.GetResumenPuntos(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, "Error obteniendo los puntos")
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, resumen)
}

func (h *UsuarioHandler) AcreditarProgresoCurso(w http.ResponseWriter, r *http.Request) {
	var req AcreditarProgresoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Payload inválido")
		return
	}

	puntosGanados, err := h.usuarioService.AcreditarProgresoCurso(
		r.Context(), req.UsuarioID, req.CursoID, req.Progreso,
	)
	if err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]interface{}{
		"message":        "Progreso actualizado correctamente",
		"puntos_ganados": puntosGanados,
	})
}
