import { apiRequest } from './client';

export interface Curso {
    id: string;
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
    categoria?: string;
    imagen?: string;
    puntos_base: number;
}

export interface CreateCursoRequest {
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
    categoria?: string;
    imagen?: string;
    puntos_base?: number;
}

export interface UpdateCursoRequest {
    titulo?: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
    categoria?: string;
    imagen?: string;
    puntos_base?: number;
}

export async function listarCursos(): Promise<Curso[]> {
    return apiRequest<Curso[]>('/api/cursos', { auth: true });
}

export async function listarMisReservas(): Promise<string[]> {
    return apiRequest<string[]>('/api/cursos/mis-reservas', { auth: true });
}

export async function listarMisCursos(): Promise<Curso[]> {
    return apiRequest<Curso[]>('/api/cursos/mis-cursos', { auth: true });
}

export async function reservarCurso(cursoId: string): Promise<void> {
    await apiRequest(`/api/cursos/${cursoId}/reservar`, {
        method: 'POST',
        auth: true
    });
}

export async function crearCurso(data: CreateCursoRequest): Promise<Curso> {
    return apiRequest<Curso>('/api/cursos', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(data),
    });
}

export async function actualizarCurso(id: string, data: UpdateCursoRequest): Promise<Curso> {
    return apiRequest<Curso>(`/api/cursos/${id}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(data),
    });
}

export async function eliminarCurso(id: string): Promise<void> {
    await apiRequest(`/api/cursos/${id}`, {
        method: 'DELETE',
        auth: true,
    });
}

// 🆕 Finalizar curso (solo admin)
export async function finalizarCurso(cursoId: string): Promise<{
    message: string;
    usuarios_afectados: number;
    experiencia_ganada: number
}> {
    return apiRequest(`/api/cursos/${cursoId}/finalizar`, {
        method: 'POST',
        auth: true,
    });
}