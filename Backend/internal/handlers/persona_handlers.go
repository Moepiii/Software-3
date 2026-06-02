package handlers

import (
	"Backend/internal/middleware"
	"Backend/internal/services"
	"Backend/internal/utils"
	"encoding/json"
	"net/http"
)

type PersonaHandler struct {
	personaService *services.PersonaService
}

func NewPersonaHandler(personaService *services.PersonaService) *PersonaHandler {
	return &PersonaHandler{
		personaService: personaService,
	}
}

func (h *PersonaHandler) GetDeudaActual(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	resp, err := h.personaService.GetDeudaVigente(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, resp)
}

func (h *PersonaHandler) GetEstados(w http.ResponseWriter, r *http.Request) {
	estados, err := h.personaService.ListEstadosConTasa(r.Context())
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, estados)
}

type UpdatePersonaEstadoRequest struct {
	EstadoID string `json:"estado_id"`
}

func (h *PersonaHandler) UpdateEstadoPersona(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	var req UpdatePersonaEstadoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Payload inválido")
		return
	}

	err := h.personaService.UpdateEstado(r.Context(), claims.ID, req.EstadoID)
	if err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Estado actualizado correctamente"})
}

func (h *PersonaHandler) PayDeuda(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok {
		utils.SendJSONError(w, http.StatusUnauthorized, "No autorizado")
		return
	}

	err := h.personaService.PayDeuda(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Deuda pagada exitosamente"})
}
