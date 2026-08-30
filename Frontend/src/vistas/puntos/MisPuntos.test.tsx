import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MisPuntos from './MisPuntos';
import { getResumenPuntos } from '../../api/usuario';

jest.mock('../../api/usuario', () => ({
  getResumenPuntos: jest.fn(),
}));

const getResumenPuntosMock = getResumenPuntos as jest.MockedFunction<typeof getResumenPuntos>;

test('muestra el resumen y el progreso recibido del backend', async () => {
  getResumenPuntosMock.mockResolvedValue({
    puntos_totales: 175,
    nivel_actual: 'Eco-Héroe',
    descuento_porcentaje: 5,
    progreso_actual: 75,
    progreso_objetivo: 150,
    progreso_porcentaje: 50,
    puntos_faltantes: 75,
    siguiente_nivel: 'Guardián Verde',
    nivel_maximo: false,
    beneficio: 'Descuento aplicable al impuesto de basura',
    cursos_activos: [{
      curso_id: 'curso-1',
      titulo: 'Reciclaje básico',
      estado: 'activa',
      progreso_pct: 50,
      puntos_acreditados: 50,
      puntos_base: 100,
    }],
    cursos_completados: [{
      curso_id: 'curso-2',
      titulo: 'Economía circular',
      estado: 'completada',
      progreso_pct: 100,
      puntos_acreditados: 100,
      puntos_base: 100,
    }],
  });

  render(<MisPuntos />);

  expect(await screen.findByText('Eco-Héroe')).toBeInTheDocument();
  expect(screen.getByText('5%')).toBeInTheDocument();
  expect(screen.getByRole('progressbar', { name: 'Progreso hacia el siguiente nivel' })).toHaveAttribute('value', '50');
  expect(screen.getByText(/Te faltan 75 puntos/)).toBeInTheDocument();
  expect(screen.getByText('Reciclaje básico')).toBeInTheDocument();
  expect(screen.getByText('Economía circular')).toBeInTheDocument();
  expect(screen.getByText('Completado')).toBeInTheDocument();
});
