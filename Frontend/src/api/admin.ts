import { apiRequest } from './client';
import type { LoginUser } from './auth';

export type AdminUser = {
  id: string;
  nombre: string;
  email: string;
};

export type CreateAdminPayload = {
  cedula: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
};

export async function listAdmins(): Promise<AdminUser[]> {
  const data = await apiRequest<LoginUser[]>('/api/admins', {
    method: 'GET',
    auth: true,
  });

  return data.map((user) => ({
    id: user.id,
    nombre: user.nombre || 'Admin',
    email: user.email,
  }));
}

export async function createAdmin(payload: CreateAdminPayload): Promise<void> {
  await apiRequest('/api/admin/create', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequest(`/api/admin/delete/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  });
}

export type UsuarioConDeuda = {
  id: string;
  nombre: string;
  email: string;
  identificacion?: string;
  tipo: string;
  deuda_monto: number;
  deuda_vigente: boolean;
};

export async function listUsuariosConDeuda(): Promise<UsuarioConDeuda[]> {
  return apiRequest<UsuarioConDeuda[]>('/api/admin/usuarios', {
    method: 'GET',
    auth: true,
  });
}

export async function updateUserDebt(usuarioID: string, monto: number): Promise<void> {
  await apiRequest('/api/admin/deuda', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ usuario_id: usuarioID, monto }),
  });
}

