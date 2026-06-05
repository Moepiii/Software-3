package tests

import (
	"Backend/internal/domain"
	"Backend/internal/utils"
	"context"
	"fmt"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"
)

type backendFakes struct {
	store            *memoryStore
	personaRepo      *fakePersonaRepo
	empresaRepo      *fakeEmpresaRepo
	deudaRepo        *fakeDeudaRepo
	deudaEmpresaRepo *fakeDeudaEmpresaRepo
	estadoRepo       *fakeEstadoRepo
}

type memoryStore struct {
	mu            sync.Mutex
	personas      map[string]*domain.Persona
	empresas      map[string]*domain.Empresa
	deudas        []domain.Deuda
	deudasEmpresa []domain.DeudaEmpresa
	estados       []domain.EstadoConTasa
	nextDeudaID   int
	nextEmpresaID int
	nextEstadoID  int
}

type fakePersonaRepo struct {
	store *memoryStore
}

type fakeEmpresaRepo struct {
	store *memoryStore
}

type fakeDeudaRepo struct {
	store *memoryStore
}

type fakeDeudaEmpresaRepo struct {
	store *memoryStore
}

type fakeEstadoRepo struct {
	store *memoryStore
}

func newBackendFakes(t testing.TB) *backendFakes {
	t.Helper()

	estadoID := "est-1"
	estadoNombre := "caracas"
	empresaEstadoID := "est-1"
	empresaEstadoNombre := "caracas"

	store := &memoryStore{
		personas: map[string]*domain.Persona{
			"ADM-1": {
				Cedula:       "ADM-1",
				Email:        "admin@mail.com",
				PasswordHash: testPasswordHash(t, "123456"),
				Nombres:      "Admin",
				Apellidos:    "Sistema",
				Role:         domain.RoleAdmin,
				CreatedAt:    testTimestamp,
				UpdatedAt:    testTimestamp,
			},
			"V123": {
				Cedula:       "V123",
				Email:        "persona@mail.com",
				PasswordHash: testPasswordHash(t, "123456"),
				Nombres:      "Juan",
				Apellidos:    "Perez",
				Role:         domain.RoleUser,
				EstadoID:     &estadoID,
				EstadoNombre: &estadoNombre,
				CreatedAt:    testTimestamp,
				UpdatedAt:    testTimestamp,
			},
		},
		empresas: map[string]*domain.Empresa{
			"J123": {
				Rif:           "J123",
				Email:         "empresa@mail.com",
				PasswordHash:  testPasswordHash(t, "123456"),
				NombreEmpresa: "EcoCorp",
				EstadoID:      &empresaEstadoID,
				EstadoNombre:  &empresaEstadoNombre,
				CreatedAt:     testTimestamp,
				UpdatedAt:     testTimestamp,
			},
		},
		deudas: []domain.Deuda{
			{ID: "deuda-persona-1", PersonaCedula: "V123", Monto: 4000.0, Vigente: true, CreatedAt: testTimestamp, UpdatedAt: testTimestamp},
			{ID: "deuda-persona-2", PersonaCedula: "V123", Monto: 6000.0, Vigente: true, CreatedAt: testTimestamp, UpdatedAt: testTimestamp},
			{ID: "deuda-persona-pagada", PersonaCedula: "V123", Monto: 5000.0, Vigente: false, CreatedAt: testTimestamp, UpdatedAt: testTimestamp},
		},
		deudasEmpresa: []domain.DeudaEmpresa{
			{ID: "deuda-empresa-1", EmpresaRif: "J123", Monto: 25000.0, Vigente: true, CreatedAt: testTimestamp, UpdatedAt: testTimestamp},
		},
		estados: []domain.EstadoConTasa{
			{ID: "est-1", Nombre: "caracas", TasaActual: 5.0},
			{ID: "est-2", Nombre: "miranda", TasaActual: 8.0},
		},
		nextDeudaID:   3,
		nextEmpresaID: 2,
		nextEstadoID:  3,
	}

	return &backendFakes{
		store:            store,
		personaRepo:      &fakePersonaRepo{store: store},
		empresaRepo:      &fakeEmpresaRepo{store: store},
		deudaRepo:        &fakeDeudaRepo{store: store},
		deudaEmpresaRepo: &fakeDeudaEmpresaRepo{store: store},
		estadoRepo:       &fakeEstadoRepo{store: store},
	}
}

const testTimestamp = "2026-06-05T00:00:00Z"

func testPasswordHash(t testing.TB, password string) string {
	t.Helper()

	hash, err := utils.HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword returned error: %v", err)
	}
	return hash
}

func (s *memoryStore) personaByID(id string) *domain.Persona {
	s.mu.Lock()
	defer s.mu.Unlock()

	return clonePersona(s.personas[id])
}

func (s *memoryStore) empresaByRif(rif string) *domain.Empresa {
	s.mu.Lock()
	defer s.mu.Unlock()

	return cloneEmpresa(s.empresas[rif])
}

func (r *fakePersonaRepo) Create(ctx context.Context, p domain.Persona) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	if _, ok := r.store.personas[p.Cedula]; ok {
		return domain.ErrCedulaAlreadyExists
	}
	if personaEmailExistsLocked(r.store, p.Email) {
		return domain.ErrEmailAlreadyExists
	}
	if p.Role == "" {
		p.Role = domain.RoleUser
	}
	r.store.applyPersonaStateLocked(&p)
	r.store.personas[p.Cedula] = clonePersona(&p)
	return nil
}

func (r *fakePersonaRepo) FindByEmail(ctx context.Context, email string) (*domain.Persona, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, p := range r.store.personas {
		if sameEmail(p.Email, email) {
			return clonePersona(p), nil
		}
	}
	return nil, nil
}

func (r *fakePersonaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	return personaEmailExistsLocked(r.store, email), nil
}

func (r *fakePersonaRepo) CedulaExists(ctx context.Context, cedula string) (bool, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	_, ok := r.store.personas[cedula]
	return ok, nil
}

func (r *fakePersonaRepo) ListAdmins(ctx context.Context) ([]domain.Persona, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	admins := make([]domain.Persona, 0)
	for _, p := range r.store.personas {
		if p.Role == domain.RoleAdmin {
			admins = append(admins, *clonePersona(p))
		}
	}
	sort.Slice(admins, func(i, j int) bool {
		return admins[i].Cedula < admins[j].Cedula
	})
	return admins, nil
}

func (r *fakePersonaRepo) Delete(ctx context.Context, cedula string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	if _, ok := r.store.personas[cedula]; !ok {
		return domain.ErrUserNotFound
	}
	delete(r.store.personas, cedula)
	return nil
}

func (r *fakePersonaRepo) UpdateEstado(ctx context.Context, cedula string, estadoID string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	p, ok := r.store.personas[cedula]
	if !ok {
		return domain.ErrUserNotFound
	}
	if estadoID == "" {
		p.EstadoID = nil
		p.EstadoNombre = nil
		return nil
	}
	nombre, ok := r.store.stateNameByIDLocked(estadoID)
	if !ok {
		return domain.ErrInvalidInput
	}
	p.EstadoID = stringPtr(estadoID)
	p.EstadoNombre = stringPtr(nombre)
	return nil
}

func (r *fakePersonaRepo) Update(ctx context.Context, cedula string, nombres string, apellidos string, email string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	p, ok := r.store.personas[cedula]
	if !ok {
		return domain.ErrUserNotFound
	}
	p.Nombres = nombres
	p.Apellidos = apellidos
	p.Email = email
	p.UpdatedAt = testTimestamp
	return nil
}

func (r *fakeEmpresaRepo) Create(ctx context.Context, e domain.Empresa) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	if _, ok := r.store.empresas[e.Rif]; ok {
		return domain.ErrRifAlreadyExists
	}
	if empresaEmailExistsLocked(r.store, e.Email) {
		return domain.ErrEmailAlreadyExists
	}
	r.store.applyEmpresaStateLocked(&e)
	r.store.empresas[e.Rif] = cloneEmpresa(&e)
	return nil
}

func (r *fakeEmpresaRepo) FindByEmail(ctx context.Context, email string) (*domain.Empresa, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, e := range r.store.empresas {
		if sameEmail(e.Email, email) {
			return cloneEmpresa(e), nil
		}
	}
	return nil, nil
}

func (r *fakeEmpresaRepo) FindByRif(ctx context.Context, rif string) (*domain.Empresa, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	return cloneEmpresa(r.store.empresas[rif]), nil
}

func (r *fakeEmpresaRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	return empresaEmailExistsLocked(r.store, email), nil
}

func (r *fakeEmpresaRepo) RifExists(ctx context.Context, rif string) (bool, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	_, ok := r.store.empresas[rif]
	return ok, nil
}

func (r *fakeEmpresaRepo) UpdateEstado(ctx context.Context, rif string, estadoID string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	e, ok := r.store.empresas[rif]
	if !ok {
		return domain.ErrUserNotFound
	}
	if estadoID == "" {
		e.EstadoID = nil
		e.EstadoNombre = nil
		return nil
	}
	nombre, ok := r.store.stateNameByIDLocked(estadoID)
	if !ok {
		return domain.ErrInvalidInput
	}
	e.EstadoID = stringPtr(estadoID)
	e.EstadoNombre = stringPtr(nombre)
	return nil
}

func (r *fakeEmpresaRepo) Update(ctx context.Context, rif string, nombreEmpresa string, email string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	e, ok := r.store.empresas[rif]
	if !ok {
		return domain.ErrUserNotFound
	}
	e.NombreEmpresa = nombreEmpresa
	e.Email = email
	e.UpdatedAt = testTimestamp
	return nil
}

func (r *fakeDeudaRepo) FindVigentesByPersona(ctx context.Context, cedula string) ([]domain.Deuda, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	result := make([]domain.Deuda, 0)
	for _, d := range r.store.deudas {
		if d.PersonaCedula == cedula && d.Vigente {
			result = append(result, d)
		}
	}
	return result, nil
}

func (r *fakeDeudaRepo) Create(ctx context.Context, d domain.Deuda) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	if d.ID == "" {
		d.ID = fmt.Sprintf("deuda-persona-%d", r.store.nextDeudaID)
		r.store.nextDeudaID++
	}
	r.store.deudas = append(r.store.deudas, d)
	return nil
}

func (r *fakeDeudaRepo) MarkAllAsPaid(ctx context.Context, cedula string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i := range r.store.deudas {
		if r.store.deudas[i].PersonaCedula == cedula {
			r.store.deudas[i].Vigente = false
			r.store.deudas[i].UpdatedAt = testTimestamp
		}
	}
	return nil
}

func (r *fakeDeudaEmpresaRepo) FindVigentesByEmpresa(ctx context.Context, rif string) ([]domain.DeudaEmpresa, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	result := make([]domain.DeudaEmpresa, 0)
	for _, d := range r.store.deudasEmpresa {
		if d.EmpresaRif == rif && d.Vigente {
			result = append(result, d)
		}
	}
	return result, nil
}

func (r *fakeDeudaEmpresaRepo) Create(ctx context.Context, d domain.DeudaEmpresa) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	if d.ID == "" {
		d.ID = fmt.Sprintf("deuda-empresa-%d", r.store.nextEmpresaID)
		r.store.nextEmpresaID++
	}
	r.store.deudasEmpresa = append(r.store.deudasEmpresa, d)
	return nil
}

func (r *fakeDeudaEmpresaRepo) MarkAllAsPaid(ctx context.Context, rif string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i := range r.store.deudasEmpresa {
		if r.store.deudasEmpresa[i].EmpresaRif == rif {
			r.store.deudasEmpresa[i].Vigente = false
			r.store.deudasEmpresa[i].UpdatedAt = testTimestamp
		}
	}
	return nil
}

func (r *fakeEstadoRepo) ListAll(ctx context.Context) ([]domain.EstadoConTasa, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	result := append([]domain.EstadoConTasa(nil), r.store.estados...)
	sort.Slice(result, func(i, j int) bool {
		return result[i].ID < result[j].ID
	})
	return result, nil
}

func (r *fakeEstadoRepo) GetByName(ctx context.Context, nombre string) (*domain.Estado, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, e := range r.store.estados {
		if strings.EqualFold(e.Nombre, nombre) {
			return &domain.Estado{ID: e.ID, Nombre: e.Nombre}, nil
		}
	}
	return nil, nil
}

func (r *fakeEstadoRepo) GetRateByEstadoID(ctx context.Context, estadoID string, refTime time.Time) (float64, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, e := range r.store.estados {
		if e.ID == estadoID {
			return e.TasaActual, nil
		}
	}
	return 0, nil
}

func (r *fakeEstadoRepo) CreateEstado(ctx context.Context, nombre string) (*domain.Estado, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	estado := domain.EstadoConTasa{
		ID:     fmt.Sprintf("est-%d", r.store.nextEstadoID),
		Nombre: nombre,
	}
	r.store.nextEstadoID++
	r.store.estados = append(r.store.estados, estado)
	return &domain.Estado{ID: estado.ID, Nombre: estado.Nombre}, nil
}

func (r *fakeEstadoRepo) CreateTasa(ctx context.Context, estadoID string, porcentaje float64, validoDesde time.Time, validoHasta *time.Time) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i := range r.store.estados {
		if r.store.estados[i].ID == estadoID {
			r.store.estados[i].TasaActual = porcentaje
			return nil
		}
	}
	return domain.ErrInvalidInput
}

func personaEmailExistsLocked(store *memoryStore, email string) bool {
	for _, p := range store.personas {
		if sameEmail(p.Email, email) {
			return true
		}
	}
	return false
}

func empresaEmailExistsLocked(store *memoryStore, email string) bool {
	for _, e := range store.empresas {
		if sameEmail(e.Email, email) {
			return true
		}
	}
	return false
}

func (s *memoryStore) applyPersonaStateLocked(p *domain.Persona) {
	if p.EstadoID == nil || *p.EstadoID == "" {
		return
	}
	nombre, ok := s.stateNameByIDLocked(*p.EstadoID)
	if ok {
		p.EstadoNombre = stringPtr(nombre)
	}
}

func (s *memoryStore) applyEmpresaStateLocked(e *domain.Empresa) {
	if e.EstadoID == nil || *e.EstadoID == "" {
		return
	}
	nombre, ok := s.stateNameByIDLocked(*e.EstadoID)
	if ok {
		e.EstadoNombre = stringPtr(nombre)
	}
}

func (s *memoryStore) stateNameByIDLocked(id string) (string, bool) {
	for _, e := range s.estados {
		if e.ID == id {
			return e.Nombre, true
		}
	}
	return "", false
}

func sameEmail(a string, b string) bool {
	return strings.EqualFold(strings.TrimSpace(a), strings.TrimSpace(b))
}

func stringPtr(value string) *string {
	v := value
	return &v
}

func clonePersona(p *domain.Persona) *domain.Persona {
	if p == nil {
		return nil
	}
	cp := *p
	cp.EstadoID = cloneStringPtr(p.EstadoID)
	cp.EstadoNombre = cloneStringPtr(p.EstadoNombre)
	return &cp
}

func cloneEmpresa(e *domain.Empresa) *domain.Empresa {
	if e == nil {
		return nil
	}
	cp := *e
	cp.EstadoID = cloneStringPtr(e.EstadoID)
	cp.EstadoNombre = cloneStringPtr(e.EstadoNombre)
	return &cp
}

func cloneStringPtr(value *string) *string {
	if value == nil {
		return nil
	}
	return stringPtr(*value)
}
