package handlers

import (
	"Backend/internal/domain"
	"Backend/internal/middleware"
	"Backend/internal/services"
	"Backend/internal/utils"
	"encoding/json"
	"net/http"
	"strings"
)

type CursoHandler struct {
	cursoService *services.CursoService
}

func NewCursoHandler(cursoService *services.CursoService) *CursoHandler {
	return &CursoHandler{cursoService: cursoService}
}

func (h *CursoHandler) CreateCurso(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateCursoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	curso, err := h.cursoService.CreateCurso(r.Context(), req)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SendJSONResponse(w, http.StatusCreated, curso)
}

func (h *CursoHandler) GetCursos(w http.ResponseWriter, r *http.Request) {
	cursos, err := h.cursoService.GetCursos(r.Context())
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, "Error obteniendo cursos")
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, cursos)
}

func (h *CursoHandler) UpdateCurso(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		// Fallback for older Go routers or if PathValue fails, though PathValue is in Go 1.22+
		parts := strings.Split(r.URL.Path, "/")
		id = parts[len(parts)-1]
	}

	var req domain.UpdateCursoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendJSONError(w, http.StatusBadRequest, "Petición inválida")
		return
	}

	curso, err := h.cursoService.UpdateCurso(r.Context(), id, req)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, "Error actualizando curso")
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, curso)
}

func (h *CursoHandler) DeleteCurso(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		parts := strings.Split(r.URL.Path, "/")
		id = parts[len(parts)-1]
	}

	err := h.cursoService.DeleteCurso(r.Context(), id)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, "Error eliminando curso")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *CursoHandler) ReservarCurso(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		parts := strings.Split(r.URL.Path, "/")
		id = parts[len(parts)-1]
	}

	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok || claims.ID == "" {
		utils.SendJSONError(w, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	err := h.cursoService.ReservarCurso(r.Context(), claims.ID, id)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, "Error reservando curso")
		return
	}

	utils.SendJSONResponse(w, http.StatusOK, map[string]string{"message": "Curso reservado exitosamente"})
}

func (h *CursoHandler) GetMisReservas(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.ClaimsFromContext(r.Context())
	if !ok || claims.ID == "" {
		utils.SendJSONError(w, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	reservas, err := h.cursoService.GetMisReservas(r.Context(), claims.ID)
	if err != nil {
		utils.SendJSONError(w, http.StatusInternalServerError, "Error obteniendo reservas")
		return
	}

	if reservas == nil {
		reservas = []string{}
	}

	utils.SendJSONResponse(w, http.StatusOK, reservas)
}
