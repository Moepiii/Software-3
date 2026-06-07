import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlujoAutenticacion from './FlujoAutenticacion';
import { login, registerPersona } from '../../api';

jest.mock('../../api', () => ({
  login: jest.fn(),
  registerPersona: jest.fn(),
  registerEmpresa: jest.fn(),
}));

describe('FlujoAutenticacion', () => {
  const loginMock = login as jest.MockedFunction<typeof login>;
  const registerPersonaMock = registerPersona as jest.MockedFunction<typeof registerPersona>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra la vista de elección y navega al formulario de persona', () => {
    render(<FlujoAutenticacion onLoginSuccess={jest.fn()} initialView="register" />);

    expect(screen.getByText('¿Cómo deseas registrarte?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Soy una Persona/i }));

    expect(screen.getByText('Registro de Persona')).toBeInTheDocument();
  });

  it('muestra error cuando las contraseñas no coinciden en registro de persona', () => {
    render(<FlujoAutenticacion onLoginSuccess={jest.fn()} initialView="register" />);

    fireEvent.click(screen.getByRole('button', { name: /Soy una Persona/i }));

    fireEvent.change(screen.getByPlaceholderText('Cédula'), { target: { value: 'V-12345678' } });
    fireEvent.change(screen.getByPlaceholderText('Nombres'), { target: { value: 'Leonardo' } });
    fireEvent.change(screen.getByPlaceholderText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByPlaceholderText('Correo Electrónico'), { target: { value: 'leo@ecologic.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Confirmar Contraseña'), { target: { value: '654321' } });

    fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(registerPersonaMock).not.toHaveBeenCalled();
  });

  it('realiza login y llama a onLoginSuccess', async () => {
    const handleLoginSuccess = jest.fn();
    loginMock.mockResolvedValueOnce({
      token: 'token-123',
      user: { id: 'V-1', identificacion: 'V-1', email: 'user@ecologic.com', tipo: 'NATURAL', nombre: 'Test', role: 'usuario' },
    });

    render(<FlujoAutenticacion onLoginSuccess={handleLoginSuccess} initialView="login" />);

    fireEvent.change(screen.getByPlaceholderText('Correo Electrónico'), { target: { value: 'user@ecologic.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'secreto' } });

    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ email: 'user@ecologic.com', password: 'secreto' });
      expect(handleLoginSuccess).toHaveBeenCalledWith('token-123', {
        id: 'V-1',
        identificacion: 'V-1',
        email: 'user@ecologic.com',
        tipo: 'NATURAL',
        nombre: 'Test',
        role: 'usuario'
      });
    });
  });
});
