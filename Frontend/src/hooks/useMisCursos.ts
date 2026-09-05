import { useState, useEffect, useCallback } from 'react';
import { listarMisCursos, type Curso } from '../api/cursos';

export function useMisCursos() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            const data = await listarMisCursos();
            setCursos(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error al obtener cursos:', err);
            setError('No se pudieron cargar tus cursos');
            setCursos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => void refetch(), 0);
        return () => window.clearTimeout(timeoutId);
    }, [refetch]);

    return { cursos, loading, error, refetch };
}
