package repositories

import (
	"Backend/internal/domain"
	"Backend/prisma/db"
	"context"
	"fmt"
	"os"
	"sync"
	"testing"
	"time"
)

func puntosFixture(t *testing.T, base int) (*db.PrismaClient, PuntosRepository, string, string) {
	t.Helper()
	url := os.Getenv("MIS_PUNTOS_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("requiere MIS_PUNTOS_TEST_DATABASE_URL")
	}
	t.Setenv("DATABASE_URL", url)
	client := db.NewClient(db.WithDatasourceURL(url))
	if err := client.Prisma.Connect(); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = client.Prisma.Disconnect() })
	ctx := context.Background()
	user, err := client.Usuarios.CreateOne(db.Usuarios.Email.Set(fmt.Sprintf("puntos-%d@test.local", time.Now().UnixNano())), db.Usuarios.PasswordHash.Set("test"), db.Usuarios.Tipo.Set(db.TipoUsuarioNatural), db.Usuarios.Nombre.Set("Prueba puntos")).Exec(ctx)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _, _ = client.Usuarios.FindUnique(db.Usuarios.ID.Equals(user.ID)).Delete().Exec(ctx) })
	cursos := NewCursoRepository(client)
	curso, err := cursos.CreateCurso(ctx, domain.CreateCursoRequest{Titulo: "Prueba límites", Descripcion: "Prueba", FechaInicio: "2026-09-01", FechaFin: "2026-09-30", PuntosBase: base})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = cursos.DeleteCurso(ctx, curso.ID) })
	if err := cursos.ReservarCurso(ctx, user.ID, curso.ID); err != nil {
		t.Fatal(err)
	}
	return client, NewPuntosRepository(client), user.ID, curso.ID
}

func TestPuntosHitosYRetrocesos(t *testing.T) {
	_, repo, user, curso := puntosFixture(t, 101)
	ctx := context.Background()
	for _, tt := range []struct{ avance, ganados, total int }{{0, 0, 0}, {24, 0, 0}, {25, 25, 25}, {26, 0, 25}, {49, 0, 25}, {50, 25, 50}, {75, 25, 75}, {100, 26, 101}, {25, 0, 101}, {100, 0, 101}} {
		ganados, err := repo.AcreditarProgreso(ctx, user, curso, tt.avance)
		if err != nil || ganados != tt.ganados {
			t.Fatalf("avance %d: %d, %v", tt.avance, ganados, err)
		}
		total, err := repo.TotalByUsuario(ctx, user)
		if err != nil || total != tt.total {
			t.Fatalf("total tras %d: %d, %v", tt.avance, total, err)
		}
	}
}

func TestPuntosAvancesConcurrentes(t *testing.T) {
	_, repo, user, curso := puntosFixture(t, 100)
	ctx := context.Background()
	start := make(chan struct{})
	errs := make(chan error, 24)
	var wg sync.WaitGroup
	for i := 0; i < 24; i++ {
		wg.Add(1)
		go func(avance int) {
			defer wg.Done()
			<-start
			_, err := repo.AcreditarProgreso(ctx, user, curso, avance)
			errs <- err
		}((i%4 + 1) * 25)
	}
	close(start)
	wg.Wait()
	close(errs)
	for err := range errs {
		if err != nil {
			t.Errorf("avance concurrente: %v", err)
		}
	}
	total, err := repo.TotalByUsuario(ctx, user)
	if err != nil || total != 100 {
		t.Errorf("historial inconsistente: %d, %v", total, err)
	}
	resumen, err := repo.CursosByUsuario(ctx, user)
	if err != nil || len(resumen) != 1 || resumen[0].ProgresoPct != 100 || resumen[0].PuntosAcreditados != 100 {
		t.Errorf("progreso inconsistente: %+v, %v", resumen, err)
	}
}

func TestPuntosCanceladosInexistentesYFueraDeRango(t *testing.T) {
	client, repo, user, curso := puntosFixture(t, 100)
	ctx := context.Background()
	for _, avance := range []int{-1, 101} {
		if _, err := repo.AcreditarProgreso(ctx, user, curso, avance); err == nil {
			t.Errorf("aceptó progreso inválido %d", avance)
		}
	}
	if _, err := repo.AcreditarProgreso(ctx, "otro-usuario", curso, 50); err == nil {
		t.Error("aceptó usuario no inscrito")
	}
	_, err := client.Inscripcion.FindMany(db.Inscripcion.UsuarioID.Equals(user)).Update(db.Inscripcion.Estado.Set("cancelada")).Exec(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := repo.AcreditarProgreso(ctx, user, curso, 100); err == nil {
		t.Error("aceptó inscripción cancelada")
	}
}

func TestPuntosCambioDeBaseNoReacreditaNiResta(t *testing.T) {
	client, repo, user, curso := puntosFixture(t, 100)
	ctx := context.Background()
	if _, err := repo.AcreditarProgreso(ctx, user, curso, 25); err != nil {
		t.Fatal(err)
	}
	_, err := client.Curso.FindUnique(db.Curso.ID.Equals(curso)).Update(db.Curso.PuntosBase.Set(200)).Exec(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if n, err := repo.AcreditarProgreso(ctx, user, curso, 26); err != nil || n != 0 {
		t.Fatalf("reacreditó el mismo hito: %d %v", n, err)
	}
	if n, err := repo.AcreditarProgreso(ctx, user, curso, 50); err != nil || n != 75 {
		t.Fatalf("nuevo hito: %d %v", n, err)
	}
	_, err = client.Curso.FindUnique(db.Curso.ID.Equals(curso)).Update(db.Curso.PuntosBase.Set(50)).Exec(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if n, err := repo.AcreditarProgreso(ctx, user, curso, 75); err != nil || n != 0 {
		t.Fatalf("restó puntos: %d %v", n, err)
	}
	resumen, err := repo.CursosByUsuario(ctx, user)
	if err != nil || resumen[0].PuntosAcreditados != 100 {
		t.Fatalf("perdió puntos previos: %+v %v", resumen, err)
	}
	total, err := repo.TotalByUsuario(ctx, user)
	if err != nil || total != 100 {
		t.Fatalf("historial: %d %v", total, err)
	}
}

func TestPuntosRevierteAvanceSiFallaHistorial(t *testing.T) {
	client, repo, user, curso := puntosFixture(t, 100)
	ctx := context.Background()
	// Provocar un fallo de unicidad al escribir el historial debe revertir
	// también la actualización de la inscripción, sin dejar avance parcial.
	_, err := client.Prisma.ExecuteRaw(`INSERT INTO historial_puntos
 (id, usuario_id, curso_id, inscripcion_id, progreso_pct, puntos_ganados, total_acreditado)
 SELECT gen_random_uuid()::text, usuario_id, curso_id, id, 25, 25, 25
 FROM inscripciones WHERE usuario_id = $1 AND curso_id = $2`, user, curso).Exec(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := repo.AcreditarProgreso(ctx, user, curso, 25); err == nil {
		t.Fatal("se esperaba conflicto de historial")
	}
	resumen, err := repo.CursosByUsuario(ctx, user)
	if err != nil || resumen[0].ProgresoPct != 0 || resumen[0].PuntosAcreditados != 0 {
		t.Fatalf("actualización parcial tras fallo: %+v %v", resumen, err)
	}
	if total, err := repo.TotalByUsuario(ctx, "otro-usuario"); err != nil || total != 0 {
		t.Fatalf("se filtraron puntos ajenos: %d %v", total, err)
	}
}
