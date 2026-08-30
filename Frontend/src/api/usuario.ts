import { apiRequest } from './client';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type DeudaResponse = {
  monto: number;
  has_deuda: boolean;
};

export type EstadoResponse = {
  id: string;
  nombre: string;
  tasa_actual: number;
};

export type UpdateEstadoPayload = {
  estado_id: string;
};

export type PagarPayload = {
  monto: number;
};

export type PagoResponse = {
  message: string;
};

export type ResumenPuntosResponse = {
  puntos_totales: number;
  nivel_actual: string;
  descuento_porcentaje: number;
  progreso_actual: number;
  progreso_objetivo: number;
  progreso_porcentaje: number;
  puntos_faltantes: number;
  siguiente_nivel?: string;
  nivel_maximo: boolean;
  beneficio: string;
  cursos_activos: CursoPuntosResumen[];
  cursos_completados: CursoPuntosResumen[];
};

export type CursoPuntosResumen = {
  curso_id: string;
  titulo: string;
  estado: string;
  progreso_pct: number;
  puntos_acreditados: number;
  puntos_base: number;
};

// ─── Funciones de API ─────────────────────────────────────────────────────────

/** Obtiene la deuda vigente del usuario autenticado */
export async function getDeudaActual(): Promise<DeudaResponse> {
  // Nota: El backend redirige internamente ambas rutas (persona/empresa) al mismo handler unificado.
  // Usamos el endpoint de 'persona' por defecto para ambos, ya que funcionalmente son idénticos.
  return apiRequest<DeudaResponse>('/api/persona/deuda', {
    method: 'GET',
    auth: true,
  });
}

/** Lista todos los estados disponibles con su tasa actual */
export async function getEstados(): Promise<EstadoResponse[]> {
  return apiRequest<EstadoResponse[]>('/api/estados', {
    method: 'GET',
    auth: true,
  });
}

/** Actualiza el estado del usuario autenticado */
export async function updateEstado(payload: UpdateEstadoPayload): Promise<void> {
  await apiRequest('/api/persona/estado', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
  });
}

/** Registra un pago parcial o total de la deuda */
export async function realizarPago(payload?: PagarPayload): Promise<PagoResponse> {
  return apiRequest<PagoResponse>('/api/persona/pagar', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload || {}),
  });
}

export type AbonoRecord = {
  id: string;
  deuda_id: string;
  monto: number;
  fecha: string;
};

export type EstadisticasResponse = {
  total_abonado: number;
  maximo_abono: number;
  deuda_pendiente: number;
  historial: AbonoRecord[];
};

/** Obtiene las estadísticas del usuario autenticado */
export async function getEstadisticas(): Promise<EstadisticasResponse> {
  return apiRequest<EstadisticasResponse>('/api/usuario/estadisticas', {
    method: 'GET',
    auth: true,
  });
}

/** Obtiene el nivel, progreso y beneficio fiscal del usuario autenticado. */
export async function getResumenPuntos(): Promise<ResumenPuntosResponse> {
  return apiRequest<ResumenPuntosResponse>('/api/usuario/puntos', {
    method: 'GET',
    auth: true,
  });
}
