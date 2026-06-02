import { apiRequest } from './client';

export type LoginUser = {
  id: string;
  email: string;
  userType: 'persona' | 'empresa';
  nombres?: string;
  apellidos?: string;
  nombre_empresa?: string;
};

export type LoginResponse = {
  token: string;
  user: LoginUser;
};

export type RegisterPersonaPayload = {
  cedula: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
};

export type RegisterEmpresaPayload = {
  rif: string;
  email: string;
  password: string;
  nombre_empresa: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function registerPersona(payload: RegisterPersonaPayload): Promise<void> {
  await apiRequest('/api/register/persona', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerEmpresa(payload: RegisterEmpresaPayload): Promise<void> {
  await apiRequest('/api/register/empresa', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type UpdatePersonaPayload = {
  nombres: string;
  apellidos: string;
  email: string;
};

export type UpdateEmpresaPayload = {
  nombre_empresa: string;
  email: string;
};

export async function updatePersona(payload: UpdatePersonaPayload): Promise<void> {
  await apiRequest('/api/me/persona', {
    method: 'PUT',
    body: JSON.stringify(payload),
    auth: true,
  });
}

export async function updateEmpresa(payload: UpdateEmpresaPayload): Promise<void> {
  await apiRequest('/api/me/empresa', {
    method: 'PUT',
    body: JSON.stringify(payload),
    auth: true,
  });
}
