package handlers

import (
	"Backend/internal/middleware"
	"Backend/internal/services"
	"Backend/internal/utils"
	"encoding/json"
	"net/http"
)

type EmpresaHandler struct {
	empresaService *services.EmpresaService
}

func NewEmpresaHandler(empresaService *services.EmpresaService) *EmpresaHandler {
	return &EmpresaHandler{
		empresaService: empresaService,
	}
}

func (h *EmpresaHandler) GetDeudaActual(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	resp, err := h.empresaService.GetDeudaVigente(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, resp)
}

func (h *EmpresaHandler) GetEstados(w http.ResponseWriter, r *http.Request) {
	estados, err := h.empresaService.ListEstadosConTasa(r.Context())
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, estados)
}

type UpdateEmpresaEstadoRequest struct {
	EstadoID string `json:"estado_id"`
}

func (h *EmpresaHandler) UpdateEstadoEmpresa(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	var req UpdateEmpresaEstadoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Payload inválido")
		return
	}

	if err := h.empresaService.UpdateEstado(r.Context(), claims.ID, req.EstadoID); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Estado actualizado correctamente"})
}

func (h *EmpresaHandler) PayDeuda(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	if err := h.empresaService.PayDeuda(r.Context(), claims.ID); err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Deuda pagada exitosamente"})
}

