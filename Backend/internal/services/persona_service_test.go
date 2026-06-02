package services

import (
	"Backend/internal/domain"
	"context"
	"testing"
	"time"
)

type mockDeudaRepo struct {
	deudas []domain.Deuda
	paid   bool
}

func (m *mockDeudaRepo) FindVigentesByPersona(ctx context.Context, cedula string) ([]domain.Deuda, error) {
	var result []domain.Deuda
	for _, d := range m.deudas {
		if d.PersonaCedula == cedula && d.Vigente {
			result = append(result, d)
		}
	}
	return result, nil
}

func (m *mockDeudaRepo) Create(ctx context.Context, d domain.Deuda) error {
	m.deudas = append(m.deudas, d)
	return nil
}

func (m *mockDeudaRepo) MarkAllAsPaid(ctx context.Context, cedula string) error {
	m.paid = true
	for i, d := range m.deudas {
		if d.PersonaCedula == cedula {
			m.deudas[i].Vigente = false
		}
	}
	return nil
}

type mockEstadoRepo struct {
	estados []domain.EstadoConTasa
}

func (m *mockEstadoRepo) ListAll(ctx context.Context) ([]domain.EstadoConTasa, error) {
	return m.estados, nil
}

func (m *mockEstadoRepo) GetByName(ctx context.Context, nombre string) (*domain.Estado, error) {
	for _, e := range m.estados {
		if e.Nombre == nombre {
			return &domain.Estado{ID: e.ID, Nombre: e.Nombre}, nil
		}
	}
	return nil, nil
}

func (m *mockEstadoRepo) GetRateByEstadoID(ctx context.Context, estadoID string, refTime time.Time) (float64, error) {
	for _, e := range m.estados {
		if e.ID == estadoID {
			return e.TasaActual, nil
		}
	}
	return 0.0, nil
}

func (m *mockEstadoRepo) CreateEstado(ctx context.Context, nombre string) (*domain.Estado, error) {
	return nil, nil
}

func (m *mockEstadoRepo) CreateTasa(ctx context.Context, estadoID string, porcentaje float64, validoDesde time.Time, validoHasta *time.Time) error {
	return nil
}

func TestPersonaService_GetDeudaVigente(t *testing.T) {
	personaRepo := newFakePersonaRepo()
	deudaRepo := &mockDeudaRepo{
		deudas: []domain.Deuda{
			{PersonaCedula: "V123", Monto: 4000.0, Vigente: true},
			{PersonaCedula: "V123", Monto: 6000.0, Vigente: true},
			{PersonaCedula: "V123", Monto: 5000.0, Vigente: false},
		},
	}
	estadoRepo := &mockEstadoRepo{}
	srv := NewPersonaService(personaRepo, deudaRepo, estadoRepo)

	res, err := srv.GetDeudaVigente(context.Background(), "V123")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !res.HasDeuda {
		t.Fatal("expected user to have debt")
	}
	if res.Monto != 10000.0 {
		t.Fatalf("expected debt to be 10000.0, got %f", res.Monto)
	}
}

func TestPersonaService_PayDeuda(t *testing.T) {
	personaRepo := newFakePersonaRepo()
	deudaRepo := &mockDeudaRepo{
		deudas: []domain.Deuda{
			{PersonaCedula: "V123", Monto: 4000.0, Vigente: true},
		},
	}
	estadoRepo := &mockEstadoRepo{}
	srv := NewPersonaService(personaRepo, deudaRepo, estadoRepo)

	err := srv.PayDeuda(context.Background(), "V123")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !deudaRepo.paid {
		t.Fatal("expected paid flag to be set")
	}

	res, err := srv.GetDeudaVigente(context.Background(), "V123")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.HasDeuda || res.Monto != 0 {
		t.Fatalf("expected 0 debt, got %f (hasDeuda: %t)", res.Monto, res.HasDeuda)
	}
}
