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

export interface EstadisticasResponse {
  total_abonado: number;
  maximo_abono: number;
  deuda_pendiente: number;
  historial: Array<{
    fecha: string;
    monto: number;
  }>;
}

export async function getDeudaActual(): Promise<DeudaResponse> {
  return apiRequest<DeudaResponse>('/api/persona/deuda', { auth: true });
}

export async function getEstados(): Promise<EstadoResponse[]> {
  return apiRequest<EstadoResponse[]>('/api/estados', { auth: true });
}

export async function updateEstado(data: UpdateEstadoRequest): Promise<void> {
  await apiRequest('/api/persona/estado', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function realizarPago(data: PaymentRequest): Promise<DeudaResponse> {
  return apiRequest<DeudaResponse>('/api/persona/pagar', {
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