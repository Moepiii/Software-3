package domain

import "time"

type Curso struct {
	ID          string    `json:"id"`
	Titulo      string    `json:"titulo"`
	Descripcion string    `json:"descripcion"`
	FechaInicio string    `json:"fechaInicio"`
	FechaFin    string    `json:"fechaFin"`
	Estado      string    `json:"estado"`
	Categoria   *string   `json:"categoria,omitempty"`
	Imagen      *string   `json:"imagen,omitempty"`
	PuntosBase  int       `json:"puntos_base"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateCursoRequest struct {
	Titulo      string  `json:"titulo" validate:"required"`
	Descripcion string  `json:"descripcion" validate:"required"`
	FechaInicio string  `json:"fechaInicio" validate:"required"`
	FechaFin    string  `json:"fechaFin" validate:"required"`
	Estado      string  `json:"estado" validate:"required"`
	Categoria   *string `json:"categoria,omitempty"`
	Imagen      *string `json:"imagen,omitempty"`
	PuntosBase  int     `json:"puntos_base,omitempty"`
}

type UpdateCursoRequest struct {
	Titulo      *string `json:"titulo,omitempty"`
	Descripcion *string `json:"descripcion,omitempty"`
	FechaInicio *string `json:"fechaInicio,omitempty"`
	FechaFin    *string `json:"fechaFin,omitempty"`
	Estado      *string `json:"estado,omitempty"`
	Categoria   *string `json:"categoria,omitempty"`
	Imagen      *string `json:"imagen,omitempty"`
	PuntosBase  *int    `json:"puntos_base,omitempty"`
}
