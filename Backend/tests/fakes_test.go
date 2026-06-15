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
	store       *memoryStore
	usuarioRepo *fakeUsuarioRepo
	deudaRepo   *fakeDeudaRepo
	estadoRepo  *fakeEstadoRepo
}

type memoryStore struct {
	mu           sync.Mutex
	usuarios     map[string]*domain.Usuario
	deudas       []domain.Deuda
	abonos       []domain.Abono
	estados      []domain.EstadoConTasa
	nextDeudaID  int
	nextEstadoID int
	nextAbonoID  int
}

type fakeUsuarioRepo struct {
	store *memoryStore
}

type fakeDeudaRepo struct {
	store *memoryStore
}

type fakeEstadoRepo struct {
	store *memoryStore
}

const testTimestamp = "2026-06-05T00:00:00Z"

func newBackendFakes(t testing.TB) *backendFakes {
	t.Helper()

	estadoID := "est-1"
	estadoNombre := "caracas"

	store := &memoryStore{
		usuarios: map[string]*domain.Usuario{
			"ADM-1": {
				ID:             "u1",
				Identificacion: "ADM-1",
				Email:          "admin@mail.com",
				PasswordHash:   testPasswordHash(t, "123456"),
				Nombre:         "Admin Sistema",
				Tipo:           domain.TipoAdmin,
				Role:           domain.RoleAdmin,
				CreatedAt:      testTimestamp,
				UpdatedAt:      testTimestamp,
			},
			"V123": {
				ID:             "u2",
				Identificacion: "V123",
				Email:          "persona@mail.com",
				PasswordHash:   testPasswordHash(t, "123456"),
				Nombre:         "Juan Perez",
				Tipo:           domain.TipoNatural,
				Role:           domain.RoleUser,
				EstadoID:       &estadoID,
				EstadoNombre:   &estadoNombre,
				CreatedAt:      testTimestamp,
				UpdatedAt:      testTimestamp,
			},
			"J123": {
				ID:             "u3",
				Identificacion: "J123",
				Email:          "empresa@mail.com",
				PasswordHash:   testPasswordHash(t, "123456"),
				Nombre:         "EcoCorp",
				Tipo:           domain.TipoJuridico,
				Role:           domain.RoleUser,
				EstadoID:       &estadoID,
				EstadoNombre:   &estadoNombre,
				CreatedAt:      testTimestamp,
				UpdatedAt:      testTimestamp,
			},
		},
		deudas: []domain.Deuda{
			{ID: "deuda-persona-1", UsuarioID: "V123", Monto: 4000.0, Vigente: true, CreatedAt: testTimestamp, UpdatedAt: testTimestamp},
			{ID: "deuda-persona-2", UsuarioID: "V123", Monto: 6000.0, Vigente: true, CreatedAt: testTimestamp, UpdatedAt: testTimestamp},
			{ID: "deuda-persona-pagada", UsuarioID: "V123", Monto: 5000.0, Vigente: false, CreatedAt: testTimestamp, UpdatedAt: testTimestamp},
			{ID: "deuda-empresa-1", UsuarioID: "J123", Monto: 25000.0, Vigente: true, CreatedAt: testTimestamp, UpdatedAt: testTimestamp},
		},
		abonos: []domain.Abono{},
		estados: []domain.EstadoConTasa{
			{ID: "est-1", Nombre: "caracas", TasaActual: 5.0},
			{ID: "est-2", Nombre: "miranda", TasaActual: 8.0},
		},
		nextDeudaID:  5,
		nextEstadoID: 3,
		nextAbonoID:  1,
	}

	return &backendFakes{
		store:       store,
		usuarioRepo: &fakeUsuarioRepo{store: store},
		deudaRepo:   &fakeDeudaRepo{store: store},
		estadoRepo:  &fakeEstadoRepo{store: store},
	}
}

func testPasswordHash(t testing.TB, password string) string {
	t.Helper()

	hash, err := utils.HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword returned error: %v", err)
	}
	return hash
}

func (s *memoryStore) usuarioByIdentificacion(id string) *domain.Usuario {
	s.mu.Lock()
	defer s.mu.Unlock()

	return cloneUsuario(s.usuarios[id])
}

// MOCK: UsuarioRepository

func (r *fakeUsuarioRepo) Create(ctx context.Context, u domain.Usuario) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	if u.Identificacion != "" {
		if _, ok := r.store.usuarios[u.Identificacion]; ok {
			return domain.ErrIdentificacionAlreadyExists
		}
	}
	if usuarioEmailExistsLocked(r.store, u.Email) {
		return domain.ErrEmailAlreadyExists
	}
	if u.Role == "" {
		u.Role = domain.RoleUser
	}
	r.store.applyUsuarioStateLocked(&u)

	// Usamos Identificacion como llave del mapa, si está vacia (ej. un admin raro), usamos email
	key := u.Identificacion
	if key == "" {
		key = u.Email
	}
	r.store.usuarios[key] = cloneUsuario(&u)
	return nil
}

func (r *fakeUsuarioRepo) FindByEmail(ctx context.Context, email string) (*domain.Usuario, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, u := range r.store.usuarios {
		if sameEmail(u.Email, email) {
			return cloneUsuario(u), nil
		}
	}
	return nil, nil
}

func (r *fakeUsuarioRepo) FindByIdentificacion(ctx context.Context, id string) (*domain.Usuario, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	return cloneUsuario(r.store.usuarios[id]), nil
}

func (r *fakeUsuarioRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	return usuarioEmailExistsLocked(r.store, email), nil
}

func (r *fakeUsuarioRepo) IdentificacionExists(ctx context.Context, id string) (bool, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	_, ok := r.store.usuarios[id]
	return ok, nil
}

func (r *fakeUsuarioRepo) ListAdmins(ctx context.Context) ([]domain.Usuario, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	admins := make([]domain.Usuario, 0)
	for _, u := range r.store.usuarios {
		if u.Role == domain.RoleAdmin {
			admins = append(admins, *cloneUsuario(u))
		}
	}
	sort.Slice(admins, func(i, j int) bool {
		return admins[i].Identificacion < admins[j].Identificacion
	})
	return admins, nil
}

func (r *fakeUsuarioRepo) Delete(ctx context.Context, id string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	if _, ok := r.store.usuarios[id]; !ok {
		return domain.ErrUserNotFound
	}
	delete(r.store.usuarios, id)
	return nil
}

func (r *fakeUsuarioRepo) UpdateEstado(ctx context.Context, id string, estadoID string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	u, ok := r.store.usuarios[id]
	if !ok {
		return domain.ErrUserNotFound
	}
	if estadoID == "" {
		u.EstadoID = nil
		u.EstadoNombre = nil
		return nil
	}
	nombre, ok := r.store.stateNameByIDLocked(estadoID)
	if !ok {
		return domain.ErrInvalidInput
	}
	u.EstadoID = stringPtr(estadoID)
	u.EstadoNombre = stringPtr(nombre)
	return nil
}

func (r *fakeUsuarioRepo) Update(ctx context.Context, id string, nombre string, email string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	u, ok := r.store.usuarios[id]
	if !ok {
		return domain.ErrUserNotFound
	}
	u.Nombre = nombre
	u.Email = email
	u.UpdatedAt = testTimestamp
	return nil
}

// MOCK: DeudaRepository

func (r *fakeDeudaRepo) FindVigentesByUsuario(ctx context.Context, usuarioID string) ([]domain.Deuda, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	result := make([]domain.Deuda, 0)
	for _, d := range r.store.deudas {
		if d.UsuarioID == usuarioID && d.Vigente {
			result = append(result, d)
		}
	}
	return result, nil
}

func (r *fakeDeudaRepo) Create(ctx context.Context, d domain.Deuda) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	if d.ID == "" {
		d.ID = fmt.Sprintf("deuda-%d", r.store.nextDeudaID)
		r.store.nextDeudaID++
	}
	r.store.deudas = append(r.store.deudas, d)
	return nil
}

func (r *fakeDeudaRepo) CreateAbono(ctx context.Context, deudaID string, monto float64) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	abono := domain.Abono{
		ID:      fmt.Sprintf("abono-%d", r.store.nextAbonoID),
		DeudaID: deudaID,
		Monto:   monto,
		Fecha:   testTimestamp,
	}
	r.store.nextAbonoID++
	r.store.abonos = append(r.store.abonos, abono)
	return nil
}

func (r *fakeDeudaRepo) GetAllAbonosByUsuario(ctx context.Context, usuarioID string) ([]domain.Abono, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	// Build a set of deuda IDs that belong to this user
	deudaIDs := make(map[string]bool)
	for _, d := range r.store.deudas {
		if d.UsuarioID == usuarioID {
			deudaIDs[d.ID] = true
		}
	}

	result := make([]domain.Abono, 0)
	for _, a := range r.store.abonos {
		if deudaIDs[a.DeudaID] {
			result = append(result, a)
		}
	}
	return result, nil
}

func (r *fakeDeudaRepo) UpdateEstadoDeuda(ctx context.Context, deudaID string, vigente bool) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for i := range r.store.deudas {
		if r.store.deudas[i].ID == deudaID {
			r.store.deudas[i].Vigente = vigente
			r.store.deudas[i].UpdatedAt = testTimestamp
			return nil
		}
	}
	return domain.ErrInvalidInput
}

// MOCK: EstadoRepository

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

// HELPERS INTERNOS

func usuarioEmailExistsLocked(store *memoryStore, email string) bool {
	for _, u := range store.usuarios {
		if sameEmail(u.Email, email) {
			return true
		}
	}
	return false
}

func (s *memoryStore) applyUsuarioStateLocked(u *domain.Usuario) {
	if u.EstadoID == nil || *u.EstadoID == "" {
		return
	}
	nombre, ok := s.stateNameByIDLocked(*u.EstadoID)
	if ok {
		u.EstadoNombre = stringPtr(nombre)
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

func cloneUsuario(u *domain.Usuario) *domain.Usuario {
	if u == nil {
		return nil
	}
	cu := *u
	cu.EstadoID = cloneStringPtr(u.EstadoID)
	cu.EstadoNombre = cloneStringPtr(u.EstadoNombre)
	return &cu
}

func cloneStringPtr(value *string) *string {
	if value == nil {
		return nil
	}
	return stringPtr(*value)
}
