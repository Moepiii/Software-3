import { apiRequest } from './client';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type DeudaResponse = {
  deuda_id: string;
  monto: number;
  descripcion: string;
  fecha_creacion: string;
  estado_id: string;
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
  monto_pagado: number;
  deuda_restante: number;
};

// ─── Funciones de API ─────────────────────────────────────────────────────────

/** Obtiene la deuda vigente del usuario autenticado */
export async function getDeudaActual(): Promise<DeudaResponse> {
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

/** Actualiza el estado de la persona autenticada */
export async function updateEstado(payload: UpdateEstadoPayload): Promise<void> {
  await apiRequest('/api/persona/estado', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
  });
}

/** Registra un pago parcial o total de la deuda */
export async function realizarPago(payload: PagarPayload): Promise<PagoResponse> {
  return apiRequest<PagoResponse>('/api/persona/pagar', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
}
