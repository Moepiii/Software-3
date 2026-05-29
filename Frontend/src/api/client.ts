import { getToken } from './token';

type ApiErrorResponse = {
  error?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T = unknown>(
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
