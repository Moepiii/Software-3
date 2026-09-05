package tests

import (
	"Backend/internal/domain"
	"Backend/internal/utils"
	"context"
	"errors"
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
	passwords    map[string]string
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

func strPtr(s string) *string {
	return &s
}

func newBackendFakes(t testing.TB) *backendFakes {
	t.Helper()

	estadoID := "est-1"

	store := &memoryStore{
		usuarios: map[string]*domain.Usuario{
			"ADM-1": {
				ID:             "u1",
				Identificacion: strPtr("ADM-1"),
				Email:          "admin@mail.com",
				Nombre:         "Admin Sistema",
				Tipo:           domain.TipoAdmin,
				Role:           domain.RoleAdmin,
			},
			"V123": {
				ID:             "u2",
				Identificacion: strPtr("V123"),
				Email:          "persona@mail.com",
				Nombre:         "Juan Perez",
				Tipo:           domain.TipoNatural,
				Role:           domain.RoleUser,
				EstadoID:       &estadoID,
			},
			"J123": {
				ID:             "u3",
				Identificacion: strPtr("J123"),
				Email:          "empresa@mail.com",
				Nombre:         "EcoCorp",
				Tipo:           domain.TipoJuridico,
				Role:           domain.RoleUser,
				EstadoID:       &estadoID,
			},
		},
		passwords: map[string]string{
			"u1": testPasswordHash(t, "123456"),
			"u2": testPasswordHash(t, "123456"),
			"u3": testPasswordHash(t, "123456"),
		},
		deudas: []domain.Deuda{
			{ID: "deuda-persona-1", UsuarioID: "u2", Monto: 4000.0, Vigente: true},
			{ID: "deuda-persona-2", UsuarioID: "u2", Monto: 6000.0, Vigente: true},
			{ID: "deuda-persona-pagada", UsuarioID: "u2", Monto: 5000.0, Vigente: false},
			{ID: "deuda-empresa-1", UsuarioID: "u3", Monto: 25000.0, Vigente: true},
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

	if u.Identificacion != nil && *u.Identificacion != "" {
		if _, ok := r.store.usuarios[*u.Identificacion]; ok {
			return errors.New("identificacion already exists")
		}
	}
	for _, existUser := range r.store.usuarios {
		if existUser.Email == u.Email {
			return errors.New("email already exists")
		}
	}
	if u.Role == "" {
		u.Role = domain.RoleUser
	}

	key := ""
	if u.Identificacion != nil {
		key = *u.Identificacion
	}
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

	for _, u := range r.store.usuarios {
		if u.Identificacion != nil && *u.Identificacion == id {
			return cloneUsuario(u), nil
		}
	}
	return nil, nil
}

func (r *fakeUsuarioRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, u := range r.store.usuarios {
		if sameEmail(u.Email, email) {
			return true, nil
		}
	}
	return false, nil
}

func (r *fakeUsuarioRepo) IdentificacionExists(ctx context.Context, id string) (bool, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, u := range r.store.usuarios {
		if u.Identificacion != nil && *u.Identificacion == id {
			return true, nil
		}
	}
	return false, nil
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
		valI := ""
		if admins[i].Identificacion != nil {
			valI = *admins[i].Identificacion
		}
		valJ := ""
		if admins[j].Identificacion != nil {
			valJ = *admins[j].Identificacion
		}
		return valI < valJ
	})
	return admins, nil
}

func (r *fakeUsuarioRepo) Delete(ctx context.Context, id string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	keyToDelete := ""
	for k, u := range r.store.usuarios {
		if u.ID == id || (u.Identificacion != nil && *u.Identificacion == id) {
			keyToDelete = k
			break
		}
	}

	if keyToDelete == "" {
		return domain.ErrNotFound
	}
	delete(r.store.usuarios, keyToDelete)
	return nil
}

func (r *fakeUsuarioRepo) UpdateEstado(ctx context.Context, id string, estadoID string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	var u *domain.Usuario
	for _, user := range r.store.usuarios {
		if user.ID == id || (user.Identificacion != nil && *user.Identificacion == id) {
			u = user
			break
		}
	}
	if u == nil {
		return domain.ErrNotFound
	}
	if estadoID == "" {
		u.EstadoID = nil
		return nil
	}
	u.EstadoID = stringPtr(estadoID)
	return nil
}

func (r *fakeUsuarioRepo) Update(ctx context.Context, id string, nombre string, email string) error {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	var u *domain.Usuario
	for _, user := range r.store.usuarios {
		if user.ID == id || (user.Identificacion != nil && *user.Identificacion == id) {
			u = user
			break
		}
	}
	if u == nil {
		return domain.ErrNotFound
	}
	u.Nombre = nombre
	u.Email = email
	return nil
}

func (r *fakeUsuarioRepo) GetUsuarioByID(ctx context.Context, id string) (*domain.Usuario, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, u := range r.store.usuarios {
		if u.ID == id {
			return cloneUsuario(u), nil
		}
	}
	return nil, domain.ErrNotFound
}

func (r *fakeUsuarioRepo) GetUsuarioByEmail(ctx context.Context, email string) (*domain.Usuario, error) {
	usuario, err := r.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if usuario == nil {
		return nil, domain.ErrNotFound
	}
	return usuario, nil
}

func (r *fakeUsuarioRepo) GetUsuarioByEmailWithPassword(ctx context.Context, email string) (*domain.Usuario, string, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, u := range r.store.usuarios {
		if sameEmail(u.Email, email) {
			hash := r.store.passwords[u.ID]
			return cloneUsuario(u), hash, nil
		}
	}
	return nil, "", domain.ErrNotFound
}

func (r *fakeUsuarioRepo) CreateUsuario(ctx context.Context, u *domain.Usuario, passwordHash string) (*domain.Usuario, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, existUser := range r.store.usuarios {
		if sameEmail(existUser.Email, u.Email) {
			return nil, errors.New("email already exists")
		}
	}

	newID := fmt.Sprintf("u%d", len(r.store.usuarios)+1)
	u.ID = newID

	key := ""
	if u.Identificacion != nil {
		key = *u.Identificacion
	}
	if key == "" {
		key = u.Email
	}
	r.store.usuarios[key] = cloneUsuario(u)
	r.store.passwords[newID] = passwordHash
	return cloneUsuario(u), nil
}

func (r *fakeUsuarioRepo) UpdateUsuario(ctx context.Context, id string, updates *domain.Usuario) (*domain.Usuario, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	var target *domain.Usuario
	for _, u := range r.store.usuarios {
		if u.ID == id || (u.Identificacion != nil && *u.Identificacion == id) {
			target = u
			break
		}
	}

	if target == nil {
		return nil, domain.ErrNotFound
	}

	if updates.Nombre != "" {
		target.Nombre = updates.Nombre
	}
	if updates.Email != "" {
		target.Email = updates.Email
	}
	if updates.Identificacion != nil {
		target.Identificacion = updates.Identificacion
	}
	if updates.EstadoID != nil {
		target.EstadoID = updates.EstadoID
	}
	target.Nivel = updates.Nivel
	target.Experiencia = updates.Experiencia

	return cloneUsuario(target), nil
}

func (r *fakeUsuarioRepo) DeleteUsuario(ctx context.Context, id string) error {
	return r.Delete(ctx, id)
}

func (r *fakeUsuarioRepo) GetUsuarios(ctx context.Context) ([]domain.Usuario, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	var result []domain.Usuario
	for _, u := range r.store.usuarios {
		result = append(result, *cloneUsuario(u))
	}
	return result, nil
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
			return nil
		}
	}
	return domain.ErrInvalidInput
}

func (r *fakeDeudaRepo) GetDeudaActual(ctx context.Context, usuarioID string) (*domain.Deuda, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	for _, d := range r.store.deudas {
		if d.UsuarioID == usuarioID && d.Vigente {
			return &domain.Deuda{
				ID:        d.ID,
				UsuarioID: d.UsuarioID,
				Monto:     d.Monto,
				Vigente:   d.Vigente,
			}, nil
		}
	}

	return &domain.Deuda{
		Monto:   0,
		Vigente: false,
	}, nil
}

func (r *fakeDeudaRepo) PayDeuda(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	var targetDeuda *domain.Deuda
	for i := range r.store.deudas {
		if r.store.deudas[i].UsuarioID == usuarioID && r.store.deudas[i].Vigente {
			targetDeuda = &r.store.deudas[i]
			break
		}
	}

	if targetDeuda == nil {
		return nil, domain.ErrNotFound
	}

	abono := domain.Abono{
		ID:      fmt.Sprintf("abono-%d", r.store.nextAbonoID),
		DeudaID: targetDeuda.ID,
		Monto:   monto,
		Fecha:   testTimestamp,
	}
	r.store.nextAbonoID++
	r.store.abonos = append(r.store.abonos, abono)

	targetDeuda.Monto -= monto
	if targetDeuda.Monto <= 0 {
		targetDeuda.Monto = 0
		targetDeuda.Vigente = false
	}

	return &domain.Deuda{
		ID:        targetDeuda.ID,
		UsuarioID: targetDeuda.UsuarioID,
		Monto:     targetDeuda.Monto,
		Vigente:   targetDeuda.Vigente,
	}, nil
}

func (r *fakeDeudaRepo) UpdateUserDebt(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	var targetDeuda *domain.Deuda
	for i := range r.store.deudas {
		if r.store.deudas[i].UsuarioID == usuarioID && r.store.deudas[i].Vigente {
			targetDeuda = &r.store.deudas[i]
			break
		}
	}

	if targetDeuda == nil {
		if monto <= 0 {
			return &domain.Deuda{Monto: 0, Vigente: false}, nil
		}
		newID := fmt.Sprintf("deuda-%d", r.store.nextDeudaID)
		r.store.nextDeudaID++
		newD := domain.Deuda{
			ID:        newID,
			UsuarioID: usuarioID,
			Monto:     monto,
			Vigente:   true,
		}
		r.store.deudas = append(r.store.deudas, newD)
		return &newD, nil
	}

	if monto <= 0 {
		targetDeuda.Monto = 0
		targetDeuda.Vigente = false
	} else {
		targetDeuda.Monto = monto
		targetDeuda.Vigente = true
	}

	return &domain.Deuda{
		ID:        targetDeuda.ID,
		UsuarioID: targetDeuda.UsuarioID,
		Monto:     targetDeuda.Monto,
		Vigente:   targetDeuda.Vigente,
	}, nil
}

// MOCK: EstadoRepository

func (r *fakeEstadoRepo) GetEstadosWithTasa(ctx context.Context) ([]domain.Estado, error) {
	r.store.mu.Lock()
	defer r.store.mu.Unlock()

	var result []domain.Estado
	for _, e := range r.store.estados {
		result = append(result, domain.Estado{
			ID:         e.ID,
			Nombre:     e.Nombre,
			TasaActual: e.TasaActual,
		})
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].ID < result[j].ID
	})
	return result, nil
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

// HELPERS INTERNOS

func usuarioEmailExistsLocked(store *memoryStore, email string) bool {
	for _, u := range store.usuarios {
		if sameEmail(u.Email, email) {
			return true
		}
	}
	return false
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
	return &cu
}

func cloneStringPtr(value *string) *string {
	if value == nil {
		return nil
	}
	return stringPtr(*value)
}
