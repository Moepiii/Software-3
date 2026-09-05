package services

import (
	"Backend/internal/domain"
	"context"
	"errors"
	"testing"
)

type puntosRepoPrueba struct {
	errTotal  error
	errCursos error
	total     int
	cursos    []domain.CursoPuntosResumen
}

func (r *puntosRepoPrueba) TotalByUsuario(context.Context, string) (int, error) {
	return r.total, r.errTotal
}

func (r *puntosRepoPrueba) CursosByUsuario(context.Context, string) ([]domain.CursoPuntosResumen, error) {
	return r.cursos, r.errCursos
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
		{"negativos", -1, "Eco-Iniciado", 0, 0, 100, false},
		{"antes del primer nivel", 99, "Eco-Iniciado", 0, 99, 1, false},
		{"primer nivel", 100, "Eco-Héroe", 5, 0, 150, false},
		{"antes del segundo nivel", 249, "Eco-Héroe", 5, 99, 1, false},
		{"antes del máximo", 499, "Guardián Verde", 10, 99, 1, false},
		{"sobre el máximo", 900, "Embajador Circular", 15, 100, 0, true},
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
			{CursoID: "cancelado-al-100", Estado: "cancelada", ProgresoPct: 100},
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

func TestPuntosErroresYValidacion(t *testing.T) {
	esperado := errors.New("base no disponible")
	for _, repo := range []*puntosRepoPrueba{{errTotal: esperado}, {errCursos: esperado}} {
		if _, err := NewUsuarioService(nil, nil, nil, repo).GetResumenPuntos(context.Background(), "usuario"); !errors.Is(err, esperado) {
			t.Errorf("no propagó el error: %v", err)
		}
	}
	servicio := NewUsuarioService(nil, nil, nil, &puntosRepoPrueba{})
	for _, tt := range []struct {
		usuario, curso string
		progreso       int
	}{{"", "curso", 25}, {"usuario", "", 25}, {"usuario", "curso", -1}, {"usuario", "curso", 101}} {
		if _, err := servicio.AcreditarProgresoCurso(context.Background(), tt.usuario, tt.curso, tt.progreso); err == nil {
			t.Errorf("aceptó entrada inválida: %+v", tt)
		}
	}
	if _, err := NewUsuarioService(nil, nil, nil).AcreditarProgresoCurso(context.Background(), "u", "c", 50); err == nil {
		t.Error("aceptó repositorio ausente")
	}
}

func FuzzResumenPuntos(f *testing.F) {
	for _, puntos := range []int{-1, 0, 99, 100, 249, 250, 499, 500, 10000} {
		f.Add(puntos)
	}
	f.Fuzz(func(t *testing.T, puntos int) {
		resumen := CalcularResumenPuntos(puntos)
		if resumen.PuntosTotales < 0 || resumen.ProgresoPorcentaje < 0 || resumen.ProgresoPorcentaje > 100 || resumen.PuntosFaltantes < 0 {
			t.Fatalf("resumen fuera de rango: %+v", resumen)
		}
		if resumen.NivelMaximo != (puntos >= 500) {
			t.Fatalf("máximo incorrecto para %d", puntos)
		}
		if !resumen.NivelMaximo && resumen.SiguienteNivel == "" {
			t.Fatal("falta siguiente nivel")
		}
	})
}
