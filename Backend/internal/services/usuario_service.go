package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"context"
	"errors"
	"sort"
)

type UsuarioRepository interface {
	GetUsuarioByID(ctx context.Context, id string) (*domain.Usuario, error)
	GetUsuarioByEmail(ctx context.Context, email string) (*domain.Usuario, error)
	GetUsuarioByEmailWithPassword(ctx context.Context, email string) (*domain.Usuario, string, error)
	CreateUsuario(ctx context.Context, usuario *domain.Usuario, passwordHash string) (*domain.Usuario, error)
	UpdateUsuario(ctx context.Context, id string, usuario *domain.Usuario) (*domain.Usuario, error)
	DeleteUsuario(ctx context.Context, id string) error
	GetUsuarios(ctx context.Context) ([]domain.Usuario, error)
}

type DeudaRepository interface {
	GetDeudaActual(ctx context.Context, usuarioID string) (*domain.Deuda, error)
	PayDeuda(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error)
	UpdateUserDebt(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error)
	GetAllAbonosByUsuario(ctx context.Context, usuarioID string) ([]domain.Abono, error)
}

type EstadoRepository interface {
	GetEstadosWithTasa(ctx context.Context) ([]domain.Estado, error)
}

type UsuarioService struct {
	usuarioRepo UsuarioRepository
	deudaRepo   DeudaRepository
	estadoRepo  EstadoRepository
	puntosRepo  repositories.PuntosRepository
}

func NewUsuarioService(
	usuarioRepo UsuarioRepository,
	deudaRepo DeudaRepository,
	estadoRepo EstadoRepository,
	puntosRepos ...repositories.PuntosRepository,
) *UsuarioService {
	var puntosRepo repositories.PuntosRepository
	if len(puntosRepos) > 0 {
		puntosRepo = puntosRepos[0]
	}
	return &UsuarioService{
		usuarioRepo: usuarioRepo,
		deudaRepo:   deudaRepo,
		estadoRepo:  estadoRepo,
		puntosRepo:  puntosRepo,
	}
}

func (s *UsuarioService) GetUsuarioByID(ctx context.Context, id string) (*domain.Usuario, error) {
	return s.usuarioRepo.GetUsuarioByID(ctx, id)
}

func (s *UsuarioService) GetDeudaActual(ctx context.Context, usuarioID string) (*domain.Deuda, error) {
	return s.deudaRepo.GetDeudaActual(ctx, usuarioID)
}

func (s *UsuarioService) PayDeuda(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error) {
	return s.deudaRepo.PayDeuda(ctx, usuarioID, monto)
}

func (s *UsuarioService) GetEstados(ctx context.Context) ([]domain.Estado, error) {
	return s.estadoRepo.GetEstadosWithTasa(ctx)
}

func (s *UsuarioService) UpdateEstadoUsuario(ctx context.Context, usuarioID, estadoID string) error {
	usuario, err := s.usuarioRepo.GetUsuarioByID(ctx, usuarioID)
	if err != nil {
		return err
	}
	usuario.EstadoID = &estadoID
	_, err = s.usuarioRepo.UpdateUsuario(ctx, usuarioID, usuario)
	return err
}

func (s *UsuarioService) GetEstadisticas(ctx context.Context, usuarioID string) (map[string]interface{}, error) {
	deuda, err := s.deudaRepo.GetDeudaActual(ctx, usuarioID)
	if err != nil {
		return nil, err
	}
	abonos, err := s.deudaRepo.GetAllAbonosByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}
	if abonos == nil {
		abonos = []domain.Abono{}
	}
	sort.SliceStable(abonos, func(i, j int) bool { return abonos[i].Fecha < abonos[j].Fecha })

	totalAbonado := 0.0
	maximoAbono := 0.0
	historial := make([]map[string]interface{}, 0, len(abonos))
	for _, abono := range abonos {
		totalAbonado += abono.Monto
		if abono.Monto > maximoAbono {
			maximoAbono = abono.Monto
		}
		historial = append(historial, map[string]interface{}{
			"fecha": abono.Fecha,
			"monto": abono.Monto,
		})
	}

	stats := map[string]interface{}{
		"total_abonado":   totalAbonado,
		"maximo_abono":    maximoAbono,
		"deuda_pendiente": deuda.Monto,
		"historial":       historial,
	}
	return stats, nil
}

func (s *UsuarioService) GetUsuariosConDeuda(ctx context.Context) ([]map[string]interface{}, error) {
	usuarios, err := s.usuarioRepo.GetUsuarios(ctx)
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for _, u := range usuarios {
		if u.Role == "admin" || u.Tipo == "ADMIN" {
			continue
		}

		deuda, err := s.deudaRepo.GetDeudaActual(ctx, u.ID)
		if err != nil {
			return nil, err
		}

		result = append(result, map[string]interface{}{
			"id":             u.ID,
			"nombre":         u.Nombre,
			"email":          u.Email,
			"identificacion": u.Identificacion,
			"tipo":           u.Tipo,
			"deuda_monto":    deuda.Monto,
			"deuda_vigente":  deuda.Vigente,
		})
	}
	return result, nil
}

func (s *UsuarioService) UpdateUserDebt(ctx context.Context, usuarioID string, monto float64) (*domain.Deuda, error) {
	return s.deudaRepo.UpdateUserDebt(ctx, usuarioID, monto)
}

type nivelPuntos struct {
	minimo    int
	nombre    string
	descuento int
}

var nivelesPuntos = []nivelPuntos{
	{minimo: 0, nombre: "Eco-Iniciado", descuento: 0},
	{minimo: 100, nombre: "Eco-Héroe", descuento: 5},
	{minimo: 250, nombre: "Guardián Verde", descuento: 10},
	{minimo: 500, nombre: "Embajador Circular", descuento: 15},
}

func (s *UsuarioService) GetResumenPuntos(ctx context.Context, usuarioID string) (*domain.ResumenPuntos, error) {
	total := 0
	cursos := make([]domain.CursoPuntosResumen, 0)
	if s.puntosRepo != nil {
		var err error
		total, err = s.puntosRepo.TotalByUsuario(ctx, usuarioID)
		if err != nil {
			return nil, err
		}
		cursos, err = s.puntosRepo.CursosByUsuario(ctx, usuarioID)
		if err != nil {
			return nil, err
		}
	}

	resumen := CalcularResumenPuntos(total)
	resumen.CursosActivos = make([]domain.CursoPuntosResumen, 0)
	resumen.CursosCompletados = make([]domain.CursoPuntosResumen, 0)
	for _, curso := range cursos {
		if curso.Estado == "cancelada" {
			continue
		}
		if curso.Estado == "completada" || curso.ProgresoPct >= 100 {
			resumen.CursosCompletados = append(resumen.CursosCompletados, curso)
			continue
		}
		if curso.Estado != "cancelada" {
			resumen.CursosActivos = append(resumen.CursosActivos, curso)
		}
	}
	return resumen, nil
}

func (s *UsuarioService) AcreditarProgresoCurso(ctx context.Context, usuarioID, cursoID string, progreso int) (int, error) {
	if s.puntosRepo == nil {
		return 0, errors.New("repositorio de puntos no configurado")
	}
	if usuarioID == "" || cursoID == "" || progreso < 0 || progreso > 100 {
		return 0, errors.New("usuario, curso y progreso entre 0 y 100 son requeridos")
	}
	return s.puntosRepo.AcreditarProgreso(ctx, usuarioID, cursoID, progreso)
}

func CalcularResumenPuntos(total int) *domain.ResumenPuntos {
	if total < 0 {
		total = 0
	}

	indice := 0
	for i := len(nivelesPuntos) - 1; i >= 0; i-- {
		if total >= nivelesPuntos[i].minimo {
			indice = i
			break
		}
	}

	actual := nivelesPuntos[indice]
	resumen := &domain.ResumenPuntos{
		PuntosTotales:       total,
		NivelActual:         actual.nombre,
		DescuentoPorcentaje: actual.descuento,
		Beneficio:           "Descuento aplicable al impuesto de basura",
		CursosActivos:       make([]domain.CursoPuntosResumen, 0),
		CursosCompletados:   make([]domain.CursoPuntosResumen, 0),
	}

	if indice == len(nivelesPuntos)-1 {
		resumen.ProgresoActual = total
		resumen.ProgresoObjetivo = total
		resumen.ProgresoPorcentaje = 100
		resumen.NivelMaximo = true
		resumen.Beneficio = "Alcanzaste el máximo descuento disponible para el impuesto de basura"
		return resumen
	}

	siguiente := nivelesPuntos[indice+1]
	tramo := siguiente.minimo - actual.minimo
	avance := total - actual.minimo
	resumen.ProgresoActual = avance
	resumen.ProgresoObjetivo = tramo
	resumen.ProgresoPorcentaje = avance * 100 / tramo
	resumen.PuntosFaltantes = siguiente.minimo - total
	resumen.SiguienteNivel = siguiente.nombre
	return resumen
}
