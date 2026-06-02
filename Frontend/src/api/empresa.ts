import { apiRequest } from './client';

export type EmpresaDeudaResponse = {
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

export async function getDeudaActualEmpresa(): Promise<EmpresaDeudaResponse> {
  return apiRequest<EmpresaDeudaResponse>('/api/empresa/deuda', {
    method: 'GET',
    auth: true,
  });
}

export async function getEstadosEmpresa(): Promise<EstadoResponse[]> {
  return apiRequest<EstadoResponse[]>('/api/empresa/estados', {
    method: 'GET',
    auth: true,
  });
}

export async function updateEstadoEmpresa(payload: UpdateEstadoPayload): Promise<void> {
  await apiRequest('/api/empresa/estado', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function realizarPagoEmpresa(): Promise<PagoResponse> {
  // backend marca toda la deuda como pagada; mantenemos firma para paridad con persona
  return apiRequest<PagoResponse>('/api/empresa/pagar', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({}),
  });
}

