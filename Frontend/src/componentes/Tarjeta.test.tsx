
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from './Tarjeta';

describe('Componente Card', () => {
  it('muestra el titulo y aplica estilos de variante dark', () => {
    const { container } = render(
      <Card title="Resumen" variant="dark">
        Contenido
      </Card>
    );

    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'var(--primary-900)', color: '#ffffff' });
  });

  it('usa el estilo highlight cuando se especifica la variante', () => {
    const { container } = render(<Card variant="highlight">Detalle</Card>);

    expect(screen.getByText('Detalle')).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({ backgroundColor: '#ecfdf5', border: '1px solid #d1fae5' });
  });
});