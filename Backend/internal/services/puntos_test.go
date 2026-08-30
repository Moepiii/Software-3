package services

import (
	"Backend/internal/domain"
	"context"
	"testing"
)

type puntosRepoPrueba struct {
	total  int
	cursos []domain.CursoPuntosResumen
}

func (r *puntosRepoPrueba) TotalByUsuario(context.Context, string) (int, error) {
	return r.total, nil
}

func (r *puntosRepoPrueba) CursosByUsuario(context.Context, string) ([]domain.CursoPuntosResumen, error) {
	return r.cursos, nil
}

func (r *puntosRepoPrueba) AcreditarProgreso(context.Context, string, string, int) (int, error) {
	return 0, nil
}

func TestCalcularResumenPuntos(t *testing.T) {
	tests := []struct {
		nombre      string
		puntos      int
		nivel       string
		descuento   int
		porcentaje  int
		faltantes   int
		nivelMaximo bool
	}{
		{"sin puntos", 0, "Eco-Iniciado", 0, 0, 100, false},
		{"nivel intermedio", 175, "Eco-Héroe", 5, 50, 75, false},
		{"límite de guardián", 250, "Guardián Verde", 10, 0, 250, false},
		{"nivel máximo", 500, "Embajador Circular", 15, 100, 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.nombre, func(t *testing.T) {
			got := CalcularResumenPuntos(tt.puntos)
			if got.NivelActual != tt.nivel || got.DescuentoPorcentaje != tt.descuento ||
				got.ProgresoPorcentaje != tt.porcentaje || got.PuntosFaltantes != tt.faltantes ||
				got.NivelMaximo != tt.nivelMaximo {
				t.Fatalf("resumen inesperado para %d puntos: %+v", tt.puntos, got)
			}
		})
	}
}

func TestGetResumenPuntosClasificaCursos(t *testing.T) {
	repo := &puntosRepoPrueba{
		total: 150,
		cursos: []domain.CursoPuntosResumen{
			{CursoID: "activo", Estado: "activa", ProgresoPct: 50},
			{CursoID: "completado", Estado: "completada", ProgresoPct: 100},
			{CursoID: "completado-por-progreso", Estado: "activa", ProgresoPct: 100},
			{CursoID: "cancelado", Estado: "cancelada", ProgresoPct: 25},
		},
	}
	servicio := NewUsuarioService(nil, nil, nil, repo)

	resumen, err := servicio.GetResumenPuntos(context.Background(), "usuario")
	if err != nil {
		t.Fatalf("GetResumenPuntos devolvió error: %v", err)
	}
	if len(resumen.CursosActivos) != 1 || resumen.CursosActivos[0].CursoID != "activo" {
		t.Fatalf("cursos activos inesperados: %+v", resumen.CursosActivos)
	}
	if len(resumen.CursosCompletados) != 2 {
		t.Fatalf("cursos completados inesperados: %+v", resumen.CursosCompletados)
	}
}
