import { useState, useEffect, useCallback } from 'react';
import { getExperiencia } from '../api/usuario';

export function useExperiencia() {
    const [nivel, setNivel] = useState(0);
    const [experiencia, setExperiencia] = useState(0);
    const [maximoNivel, setMaximoNivel] = useState(1000);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getExperiencia();
            setNivel(data.nivel);
            setExperiencia(data.experiencia);
            setMaximoNivel(data.maximoNivel);
            setError(null);
        } catch (err) {
            console.error('Error al obtener experiencia:', err);
            setError('No se pudo cargar la experiencia');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => void refetch(), 0);
        return () => window.clearTimeout(timeoutId);
    }, [refetch]);

    return { nivel, experiencia, maximoNivel, loading, error, refetch };
}
