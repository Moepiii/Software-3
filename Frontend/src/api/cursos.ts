// Frontend/src/api/cursos.ts
import { apiRequest } from './client';

export type Curso = {
    id: string;
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    estado: 'activo' | 'planificado' | 'finalizado';
    imagen?: string;
    categoria?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateCursoPayload = {
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    categoria?: string;
    imagen?: string;
};

export type UpdateCursoPayload = Partial<CreateCursoPayload>;

// Obtener todos los cursos
export async function listarCursos(): Promise<Curso[]> {
    const data = await apiRequest<Curso[]>('/api/cursos', {
        method: 'GET',
        auth: true,
    });
    return data;
}

// Obtener un curso por ID
export async function obtenerCurso(id: string): Promise<Curso> {
    const data = await apiRequest<Curso>(`/api/cursos/${encodeURIComponent(id)}`, {
        method: 'GET',
        auth: true,
    });
    return data;
}

// Crear un nuevo curso
export async function crearCurso(payload: CreateCursoPayload): Promise<Curso> {
    const data = await apiRequest<Curso>('/api/cursos', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(payload),
    });
    return data;
}

// Actualizar un curso existente
export async function actualizarCurso(id: string, payload: UpdateCursoPayload): Promise<Curso> {
    const data = await apiRequest<Curso>(`/api/cursos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(payload),
    });
    return data;
}

// Eliminar un curso
export async function eliminarCurso(id: string): Promise<void> {
    await apiRequest(`/api/cursos/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        auth: true,
    });
}