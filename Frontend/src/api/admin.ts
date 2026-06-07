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
  await apiRequest('/api/admins', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequest(`/api/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  });
}
