package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
	"os"
	"strconv"
	"testing"
)

// Ejecutar con MIS_PUNTOS_TEST_DATABASE_URL apuntando a una BD de pruebas
// con el esquema y la migración de puntos aplicados.
func TestPuntosConviveConFinalizacionGamificacion(t *testing.T) {
	url := os.Getenv("MIS_PUNTOS_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("requiere MIS_PUNTOS_TEST_DATABASE_URL")
	}
	t.Setenv("DATABASE_URL", url)
	client := db.NewClient(db.WithDatasourceURL(url))
	if err := client.Prisma.Connect(); err != nil {
		t.Fatal(err)
	}
	defer client.Prisma.Disconnect()
	ctx := context.Background()
	for _, progreso := range []int{0, 50, 100} {
		t.Run(strconv.Itoa(progreso), func(t *testing.T) {
			user, err := client.Usuarios.CreateOne(db.Usuarios.Email.Set("puntos-"+t.Name()+"@test.local"), db.Usuarios.PasswordHash.Set("test"), db.Usuarios.Tipo.Set(db.TipoUsuarioNatural), db.Usuarios.Nombre.Set("Prueba puntos"), db.Usuarios.Experiencia.Set(950)).Exec(ctx)
			if err != nil {
				t.Fatal(err)
			}
			defer client.Usuarios.FindUnique(db.Usuarios.ID.Equals(user.ID)).Delete().Exec(ctx)
			cursos := NewCursoRepository(client)
			curso, err := cursos.CreateCurso(ctx, domain.CreateCursoRequest{Titulo: "Curso de prueba", Descripcion: "Compatibilidad puntos y EXP", FechaInicio: "2026-09-01", FechaFin: "2026-09-30", PuntosBase: 200})
			if err != nil {
				t.Fatal(err)
			}
			defer cursos.DeleteCurso(ctx, curso.ID)
			if curso.PuntosBase != 200 {
				t.Fatalf("puntos base: %d", curso.PuntosBase)
			}
			if err := cursos.ReservarCurso(ctx, user.ID, curso.ID); err != nil {
				t.Fatal(err)
			}
			puntos := NewPuntosRepository(client)
			if progreso > 0 {
				if _, err := puntos.AcreditarProgreso(ctx, user.ID, curso.ID, progreso); err != nil {
					t.Fatal(err)
				}
				// Repetir el avance no debe volver a acreditar puntos.
				if ganados, err := puntos.AcreditarProgreso(ctx, user.ID, curso.ID, progreso); err != nil || ganados != 0 {
					t.Fatalf("avance repetido: %d, %v", ganados, err)
				}
			}
			activos, err := cursos.GetMisCursos(ctx, user.ID)
			if err != nil || len(activos) != 1 {
				t.Fatalf("la inscripción debe seguir disponible para finalizar: %v %v", activos, err)
			}
			afectados, err := cursos.FinalizarCurso(ctx, curso.ID)
			if err != nil || afectados != 1 {
				t.Fatalf("finalización: %d, %v", afectados, err)
			}
			total, err := puntos.TotalByUsuario(ctx, user.ID)
			if err != nil || total != 200 {
				t.Fatalf("puntos finales: %d, %v", total, err)
			}
			actualizado, err := client.Usuarios.FindUnique(db.Usuarios.ID.Equals(user.ID)).Exec(ctx)
			if err != nil {
				t.Fatal(err)
			}
			if actualizado.Experiencia != 1050 || actualizado.Nivel != 1 {
				t.Fatalf("se alteró EXP/nivel: %+v", actualizado)
			}
			resumen, err := puntos.CursosByUsuario(ctx, user.ID)
			if err != nil || len(resumen) != 1 || resumen[0].Estado != "completada" || resumen[0].ProgresoPct != 100 || resumen[0].PuntosAcreditados != 200 {
				t.Fatalf("resumen: %+v, %v", resumen, err)
			}
			if afectados, err := cursos.FinalizarCurso(ctx, curso.ID); err != nil || afectados != 0 {
				t.Fatalf("finalización repetida: %d, %v", afectados, err)
			}
			actualizado, err = client.Usuarios.FindUnique(db.Usuarios.ID.Equals(user.ID)).Exec(ctx)
			if err != nil || actualizado.Experiencia != 1050 {
				t.Fatalf("EXP duplicada: %+v, %v", actualizado, err)
			}
			total, err = puntos.TotalByUsuario(ctx, user.ID)
			if err != nil || total != 200 {
				t.Fatalf("puntos duplicados: %d, %v", total, err)
			}
		})
	}
}
