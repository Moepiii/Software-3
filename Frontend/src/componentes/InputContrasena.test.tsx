
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PasswordInput } from './InputContrasena';

describe('Componente PasswordInput', () => {
  it('muestra el campo en modo password y dispara eventos', () => {
    const handleChange = jest.fn();
    const handleToggle = jest.fn();

    render(
      <PasswordInput
        value="secreto"
        onChange={handleChange}
        placeholder="Contraseña"
        show={false}
        onToggle={handleToggle}
      />
    );

    const input = screen.getByPlaceholderText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.change(input, { target: { value: 'nueva' } });
    expect(handleChange).toHaveBeenCalledWith('nueva');

    fireEvent.click(screen.getByRole('button', { name: /Mostrar contraseña/i }));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('muestra el campo en modo texto cuando show es true', () => {
    render(
      <PasswordInput
        value=""
        onChange={() => {}}
        placeholder="Clave"
        show={true}
        onToggle={() => {}}
      />
    );

    const input = screen.getByPlaceholderText('Clave');
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /Ocultar contraseña/i })).toBeInTheDocument();
  });
});