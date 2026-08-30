import { apiRequest } from './client';

export interface DeudaResponse {
  id: string;
  monto: number;
  vigente: boolean;
  usuario_id: string;
}

export interface EstadoResponse {
  id: string;
  nombre: string;
  tasa_actual: number;
}

export interface UpdateEstadoRequest {
  estado_id: string;
}

export interface PaymentRequest {
  monto: number;
}

export type AccountType = 'NATURAL' | 'JURIDICO';

export interface EstadisticasResponse {
  total_abonado: number;
  maximo_abono: number;
  deuda_pendiente: number;
  historial: Array<{
    fecha: string;
    monto: number;
  }>;
}

export async function getDeudaActual(tipo: AccountType = 'NATURAL'): Promise<DeudaResponse> {
  const segmento = tipo === 'JURIDICO' ? 'empresa' : 'persona';
  return apiRequest<DeudaResponse>(`/api/${segmento}/deuda`, { auth: true });
}

export async function getEstados(): Promise<EstadoResponse[]> {
  return apiRequest<EstadoResponse[]>('/api/estados', { auth: true });
}

export async function updateEstado(data: UpdateEstadoRequest, tipo: AccountType = 'NATURAL'): Promise<void> {
  const segmento = tipo === 'JURIDICO' ? 'empresa' : 'persona';
  await apiRequest(`/api/${segmento}/estado`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function realizarPago(data: PaymentRequest, tipo: AccountType = 'NATURAL'): Promise<DeudaResponse> {
  const segmento = tipo === 'JURIDICO' ? 'empresa' : 'persona';
  return apiRequest<DeudaResponse>(`/api/${segmento}/pagar`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(data),
  });
}

// 🆕 Obtener experiencia del usuario
export async function getExperiencia(): Promise<{
  nivel: number;
  experiencia: number;
  maximoNivel: number;
}> {
  return apiRequest('/api/usuario/experiencia', { auth: true });
}

// 🆕 Obtener estadísticas del usuario
export async function getEstadisticas(): Promise<EstadisticasResponse> {
  return apiRequest<EstadisticasResponse>('/api/usuario/estadisticas', { auth: true });
}

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

/** Obtiene el nivel, progreso y beneficio fiscal del usuario autenticado. */
export async function getResumenPuntos(): Promise<ResumenPuntosResponse> {
  return apiRequest<ResumenPuntosResponse>('/api/usuario/puntos', {
    method: 'GET',
    auth: true,
  });
}
