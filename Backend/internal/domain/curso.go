package domain

type Curso struct {
	ID          string  `json:"id"`
	Titulo      string  `json:"titulo"`
	Descripcion string  `json:"descripcion"`
	FechaInicio string  `json:"fechaInicio"`
	FechaFin    string  `json:"fechaFin"`
	Estado      string  `json:"estado"`
	Categoria   *string `json:"categoria,omitempty"`
	Imagen      *string `json:"imagen,omitempty"`
}

type CreateCursoRequest struct {
	Titulo      string  `json:"titulo"`
	Descripcion string  `json:"descripcion"`
	FechaInicio string  `json:"fechaInicio"`
	FechaFin    string  `json:"fechaFin"`
	Estado      string  `json:"estado"`
	Categoria   *string `json:"categoria,omitempty"`
	Imagen      *string `json:"imagen,omitempty"`
}

type UpdateCursoRequest struct {
	Titulo      *string `json:"titulo,omitempty"`
	Descripcion *string `json:"descripcion,omitempty"`
	FechaInicio *string `json:"fechaInicio,omitempty"`
	FechaFin    *string `json:"fechaFin,omitempty"`
	Estado      *string `json:"estado,omitempty"`
	Categoria   *string `json:"categoria,omitempty"`
	Imagen      *string `json:"imagen,omitempty"`
}

// 🆕 Request para finalizar curso
type FinalizarCursoRequest struct {
	CursoID string `json:"cursoId"`
}

// 🆕 Respuesta con experiencia ganada
type FinalizarCursoResponse struct {
	Message           string `json:"message"`
	UsuariosAfectados int    `json:"usuarios_afectados"`
	ExperienciaGanada int    `json:"experiencia_ganada"`
}
