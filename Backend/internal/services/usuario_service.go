package services

import (
	"Backend/internal/domain"
	"Backend/internal/repositories"
	"context"
	"errors"
)

type UsuarioService struct {
	usuarioRepo repositories.UsuarioRepository
	deudaRepo   repositories.DeudaRepository
	estadoRepo  repositories.EstadoRepository
	puntosRepo  repositories.PuntosRepository
}

type DeudaResponse struct {
	Monto    float64 `json:"monto"`
	HasDeuda bool    `json:"has_deuda"`
}

func NewUsuarioService(
	usuarioRepo repositories.UsuarioRepository,
	deudaRepo repositories.DeudaRepository,
	estadoRepo repositories.EstadoRepository,
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

// GetDeudaVigente ahora calcula de forma precisa la suma pendiente real
func (s *UsuarioService) GetDeudaVigente(ctx context.Context, usuarioID string) (*DeudaResponse, error) {
	deudas, err := s.deudaRepo.FindVigentesByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	totalDeuda := 0.0
	for _, d := range deudas {
		totalDeuda += d.Monto
	}

	abonos, err := s.deudaRepo.GetAllAbonosByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	totalAbonado := 0.0
	for _, a := range abonos {
		totalAbonado += a.Monto
	}

	montoPendiente := totalDeuda - totalAbonado
	if montoPendiente < 0 {
		montoPendiente = 0
	}

	return &DeudaResponse{
		Monto:    montoPendiente,
		HasDeuda: montoPendiente > 0,
	}, nil
}

// RegistrarAbono ahora cierra la deuda automáticamente si se salda por completo
func (s *UsuarioService) RegistrarAbono(ctx context.Context, usuarioID string, monto float64) error {
	if monto <= 0 {
		return errors.New("el monto del abono debe ser mayor a cero")
	}

	deudas, err := s.deudaRepo.FindVigentesByUsuario(ctx, usuarioID)
	if err != nil {
		return err
	}
	if len(deudas) == 0 {
		return errors.New("no hay deudas vigentes para abonar")
	}

	// Estrategia FIFO: Abonamos a la deuda más antigua que esté vigente
	deuda := deudas[0]

	// Buscamos cuánto se ha abonado específicamente a ESTA deuda anteriormente
	// Nota: Para sistemas multi-deuda es ideal filtrar abonos por deuda.ID en el futuro
	abonos, err := s.deudaRepo.GetAllAbonosByUsuario(ctx, usuarioID)
	if err != nil {
		return err
	}

	totalAbonadoAnterior := 0.0
	for _, a := range abonos {
		if a.DeudaID == deuda.ID {
			totalAbonadoAnterior += a.Monto
		}
	}

	saldoPendienteDeuda := deuda.Monto - totalAbonadoAnterior

	if monto > saldoPendienteDeuda {
		return errors.New("el monto del abono supera el saldo pendiente de la deuda")
	}

	// 1. Registramos el abono real en la tabla de Abonos
	err = s.deudaRepo.CreateAbono(ctx, deuda.ID, monto)
	if err != nil {
		return err
	}

	// 2. Si el nuevo abono liquida la deuda, la desactivamos (Vigente = false)
	if (totalAbonadoAnterior + monto) >= deuda.Monto {
		err = s.deudaRepo.UpdateEstadoDeuda(ctx, deuda.ID, false)
		if err != nil {
			return err
		}
	}

	return nil
}

// GetEstadisticasUsuario expone de manera limpia la data calculada para los KPIs
func (s *UsuarioService) GetEstadisticasUsuario(ctx context.Context, usuarioID string) (map[string]interface{}, error) {
	abonos, err := s.deudaRepo.GetAllAbonosByUsuario(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	totalAbonado := 0.0
	maxAbono := 0.0
	for _, a := range abonos {
		totalAbonado += a.Monto
		if a.Monto > maxAbono {
			maxAbono = a.Monto
		}
	}

	deudaResp, err := s.GetDeudaVigente(ctx, usuarioID)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_abonado":   totalAbonado,
		"maximo_abono":    maxAbono,
		"deuda_pendiente": deudaResp.Monto,
		"historial":       abonos,
	}, nil
}

func (s *UsuarioService) ListEstadosConTasa(ctx context.Context) ([]domain.EstadoConTasa, error) {
	return s.estadoRepo.ListAll(ctx)
}

func (s *UsuarioService) UpdateEstado(ctx context.Context, usuarioID string, estadoID string) error {
	return s.usuarioRepo.UpdateEstado(ctx, usuarioID, estadoID)
}
