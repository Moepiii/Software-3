type ApiErrorResponse = {
  error?: string;
};

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

export type AdminUser = {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
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

export type CreateAdminPayload = RegisterPersonaPayload;

export type JwtSession = {
  email?: string;
  user_type?: 'persona' | 'empresa';
  id?: string;
  role?: 'user' | 'admin';
  exp?: number;
};

const TOKEN_KEY = 'token';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

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

export async function listAdmins(): Promise<AdminUser[]> {
  const data = await apiRequest<LoginUser[]>('/api/admins', {
    method: 'GET',
    auth: true,
  });

  return data.map((user) => ({
    id: user.id,
    nombres: user.nombres || 'Admin',
    apellidos: user.apellidos || '',
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

export function decodeSession(token: string | null): JwtSession | null {
  if (!token) {
    return null;
  }

  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
    const decoded = JSON.parse(atob(padded)) as JwtSession;
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError('Sesión expirada. Inicia sesión nuevamente.', 401);
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) as T | ApiErrorResponse : null;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;
    throw new ApiError(errorData?.error || 'Error de conexión con el servidor', response.status);
  }

  return data as T;
}
