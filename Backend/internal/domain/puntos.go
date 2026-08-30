package domain

type ResumenPuntos struct {
	PuntosTotales       int                  `json:"puntos_totales"`
	NivelActual         string               `json:"nivel_actual"`
	DescuentoPorcentaje int                  `json:"descuento_porcentaje"`
	ProgresoActual      int                  `json:"progreso_actual"`
	ProgresoObjetivo    int                  `json:"progreso_objetivo"`
	ProgresoPorcentaje  int                  `json:"progreso_porcentaje"`
	PuntosFaltantes     int                  `json:"puntos_faltantes"`
	SiguienteNivel      string               `json:"siguiente_nivel,omitempty"`
	NivelMaximo         bool                 `json:"nivel_maximo"`
	Beneficio           string               `json:"beneficio"`
	CursosActivos       []CursoPuntosResumen `json:"cursos_activos"`
	CursosCompletados   []CursoPuntosResumen `json:"cursos_completados"`
}

type CursoPuntosResumen struct {
	CursoID           string `json:"curso_id"`
	Titulo            string `json:"titulo"`
	Estado            string `json:"estado"`
	ProgresoPct       int    `json:"progreso_pct"`
	PuntosAcreditados int    `json:"puntos_acreditados"`
	PuntosBase        int    `json:"puntos_base"`
}
