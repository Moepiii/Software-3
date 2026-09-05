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

const vacio = {
  puntos_totales: 0, nivel_actual: 'Eco-Iniciado', descuento_porcentaje: 0,
  progreso_actual: 0, progreso_objetivo: 100, progreso_porcentaje: 0,
  puntos_faltantes: 100, siguiente_nivel: 'Eco-Héroe', nivel_maximo: false,
  beneficio: 'Descuento aplicable al impuesto de basura', cursos_activos: [], cursos_completados: [],
};

beforeEach(() => getResumenPuntosMock.mockReset());

test('indica la carga sin mostrar datos inventados', () => {
  getResumenPuntosMock.mockReturnValue(new Promise(() => {}));
  render(<MisPuntos />);
  expect(screen.getByText('Cargando tu progreso ambiental…').closest('section')).toHaveAttribute('aria-busy', 'true');
  expect(screen.queryByText('Eco-Iniciado')).not.toBeInTheDocument();
});

test('muestra el estado vacío y el siguiente nivel', async () => {
  getResumenPuntosMock.mockResolvedValue(vacio);
  render(<MisPuntos />);
  expect(await screen.findByText('Eco-Iniciado')).toBeInTheDocument();
  expect(screen.getByText('No tienes cursos activos actualmente.')).toBeInTheDocument();
  expect(screen.getByText('Cuando completes un curso aparecerá aquí.')).toBeInTheDocument();
  expect(screen.getByText(/Te faltan 100 puntos/)).toBeInTheDocument();
});

test('permite recuperarse de un error con Reintentar', async () => {
  getResumenPuntosMock.mockRejectedValueOnce(new Error('Servicio temporalmente no disponible')).mockResolvedValueOnce(vacio);
  render(<MisPuntos />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Servicio temporalmente no disponible');
  const { fireEvent } = await import('@testing-library/react');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByText('Eco-Iniciado')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(getResumenPuntosMock).toHaveBeenCalledTimes(2);
});

test('el nivel máximo no anuncia un nivel siguiente inexistente', async () => {
  getResumenPuntosMock.mockResolvedValue({ ...vacio, puntos_totales: 700, nivel_actual: 'Embajador Circular', descuento_porcentaje: 15, progreso_porcentaje: 100, puntos_faltantes: 0, nivel_maximo: true, siguiente_nivel: undefined });
  render(<MisPuntos isDarkMode />);
  expect(await screen.findByText('Beneficio máximo')).toBeInTheDocument();
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '100');
  expect(screen.queryByText(/Te faltan/)).not.toBeInTheDocument();
  expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
});
