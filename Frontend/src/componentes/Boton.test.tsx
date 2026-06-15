
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Boton';

describe('Componente Button', () => {
  it('renderiza el contenido con estilo primario por defecto', () => {
    render(<Button>Guardar</Button>);

    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ backgroundColor: 'var(--primary-500)', color: '#052e1c' });
  });

  it('aplica estilos de ancho completo y variante outline', () => {
    render(
      <Button variant="outline" fullWidth>
        Cancelar
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Cancelar' });
    expect(button.style.width).toBe('100%');
    expect(button.style.backgroundColor).toBe('transparent');
    expect(button.style.border).toBe('1px solid var(--border-color)');
  });
});
