/*
Este archivo tiene la unificacion de los handlers de las personas y empresas en uno solo
*/
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

type PayDeudaRequest struct {
	Monto float64 `json:"monto"`
}

type AcreditarProgresoRequest struct {
	UsuarioID string `json:"usuario_id"`
	CursoID   string `json:"curso_id"`
	Progreso  int    `json:"progreso_pct"`
}

func NewUsuarioHandler(usuarioService *services.UsuarioService) *UsuarioHandler {
	return &UsuarioHandler{
		usuarioService: usuarioService,
	}
}

func (h *UsuarioHandler) GetDeudaActual(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	// El claim.ID contiene la Identificación (Cédula o RIF) o el UUID según como lo guardes en el token
	resp, err := h.usuarioService.GetDeudaVigente(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, resp)
}

func (h *UsuarioHandler) GetEstados(w http.ResponseWriter, r *http.Request) {
	estados, err := h.usuarioService.ListEstadosConTasa(r.Context())
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, estados)
}

type UpdateUsuarioEstadoRequest struct {
	EstadoID string `json:"estado_id"`
}

func (h *UsuarioHandler) UpdateEstadoUsuario(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	var req UpdateUsuarioEstadoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Payload inválido")
		return
	}

	err := h.usuarioService.UpdateEstado(r.Context(), claims.ID, req.EstadoID)
	if err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Estado actualizado correctamente"})
}

func (h *UsuarioHandler) PayDeuda(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	var req PayDeudaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Monto <= 0 {
		utils.SendJSONError(w, http.StatusBadRequest, "Monto inválido")
		return
	}

	// Ahora pasamos el monto al servicio para crear el registro en la tabla 'Abono'
	err := h.usuarioService.RegistrarAbono(r.Context(), claims.ID, req.Monto)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Abono registrado exitosamente"})
}

func (h *UsuarioHandler) GetEstadisticas(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	// El servicio hará las 4 consultas que definimos (Suma, Max, Deuda-Abonos, Historial)
	estadisticas, err := h.usuarioService.GetEstadisticasUsuario(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, estadisticas)
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
