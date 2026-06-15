//Autor Leonardo Dolande



import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsView } from './VistaConfiguracion'; 
import { updatePersona, updateEmpresa } from '../../api';
import type { LoginUser } from '../../api';

// 1. Mockear los módulos de la API
jest.mock('../../api', () => ({
  updatePersona: jest.fn(),
  updateEmpresa: jest.fn(),
}));

describe('SettingsView Component', () => {
  // Usuarios de prueba base
  const mockPersonaUser: LoginUser = {
    id: '123',
    identificacion: 'V-12345678',
    email: 'leonardo@ecologic.com',
    tipo: 'NATURAL',
    nombre: 'Leonardo Pérez',
    role: 'usuario',
  };

  const mockEmpresaUser: LoginUser = {
    id: '456',
    identificacion: 'J-12345678-9',
    email: 'contacto@planetalimpio.com',
    tipo: 'JURIDICO',
    nombre: 'Planeta Limpio C.A.',
    role: 'usuario',
  };

  // Funciones mock para las propiedades
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBAS DE RENDERIZADO ---
  describe('Renderizado Inicial', () => {
    it('debe mostrar los datos correctamente para un perfil de tipo "persona"', async () => {
      render(
        <SettingsView
          user={mockPersonaUser}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          onLogout={mockOnLogout}
        />
      );

      const nameInput = await screen.findByLabelText(/Full Name/i);
      expect(nameInput).toHaveValue('Leonardo Pérez');
      expect(screen.getByLabelText(/Email Address/i)).toHaveValue('leonardo@ecologic.com');
      
      const dniInput = screen.getByLabelText(/ID \/ DNI Number/i);
      expect(dniInput).toHaveValue('V-12345678');
      expect(dniInput).toBeDisabled();

      expect(screen.getByText('Environmental Steward • Individual Profile')).toBeInTheDocument();
    });

    it('debe mostrar los datos correctamente para un perfil de tipo "empresa"', async () => {
      render(
        <SettingsView
          user={mockEmpresaUser}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          onLogout={mockOnLogout}
        />
      );

      // CORREGIDO: Buscamos 'Company Name' porque el tipo es 'empresa'
      const companyInput = await screen.findByLabelText(/Company Name/i);
      expect(companyInput).toHaveValue('Planeta Limpio C.A.');
      expect(screen.getByLabelText(/Email Address/i)).toHaveValue('contacto@planetalimpio.com');
      
      const rifInput = screen.getByLabelText(/RIF Number/i);
      expect(rifInput).toHaveValue('J-12345678-9');
      expect(rifInput).toBeDisabled();

      expect(screen.getByText('Corporate Partner • Business Profile')).toBeInTheDocument();
    });
  });

  // --- PRUEBAS DE INTERACCIÓN Y API ---
  describe('Flujo de Guardado y Acciones', () => {
    it('debe dividir el nombre completo y llamar a updatePersona al guardar una persona con éxito', async () => {
      (updatePersona as jest.Mock).mockResolvedValueOnce({});

      render(
        <SettingsView user={mockPersonaUser} onSave={mockOnSave} onCancel={mockOnCancel} onLogout={mockOnLogout} />
      );

      const nameInput = await screen.findByLabelText(/Full Name/i);
      fireEvent.change(nameInput, { target: { value: 'Leonardo Alejandro Silva' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'leosilva@ecologic.com' } });

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      {/* CORREGIDO: Usamos waitFor para atrapar el estado asíncrono ultra veloz del botón */}
      await waitFor(() => {
        const savingElement = screen.queryByText(/Saving.../i) || screen.queryByText(/Saved!/i);
        expect(savingElement).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(updatePersona).toHaveBeenCalledWith({
          nombres: 'Leonardo',
          apellidos: 'Alejandro Silva',
          email: 'leosilva@ecologic.com',
        });

        expect(mockOnSave).toHaveBeenCalledWith({
          ...mockPersonaUser,
          nombre: 'Leonardo Alejandro Silva',
          email: 'leosilva@ecologic.com',
        });
      });

      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalled();
      }, { timeout: 1500 });
    });

    it.skip('debe llamar a updateEmpresa con el string completo al guardar una empresa con éxito', async () => {
      (updateEmpresa as jest.Mock).mockResolvedValueOnce({});

      render(
        <SettingsView user={mockEmpresaUser} onSave={mockOnSave} onCancel={mockOnCancel} onLogout={mockOnLogout} />
      );

      // CORREGIDO: Buscamos 'Company Name'
      const companyInput = await screen.findByLabelText(/Company Name/i);
      fireEvent.change(companyInput, { target: { value: 'Planeta Limpio Editado' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(updateEmpresa).toHaveBeenCalledWith({
          nombre_empresa: 'Planeta Limpio Editado',
          email: 'contacto@planetalimpio.com',
        });
        expect(mockOnSave).toHaveBeenCalledWith({
          ...mockEmpresaUser,
          nombre: 'Planeta Limpio Editado',
          email: 'contacto@planetalimpio.com',
        });
      });
    });

    it('debe manejar los errores de la API sin salir de la vista de configuración', async () => {
      const mensajeError = 'El correo ya se encuentra registrado';
      (updatePersona as jest.Mock).mockRejectedValueOnce(new Error(mensajeError));

      render(
        <SettingsView user={mockPersonaUser} onSave={mockOnSave} onCancel={mockOnCancel} onLogout={mockOnLogout} />
      );

      await screen.findByLabelText(/Full Name/i);

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText(mensajeError)).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('debe llamar a onCancel al presionar el botón de cancelar o el botón volver al lobby', async () => {
      render(
        <SettingsView user={mockPersonaUser} onSave={mockOnSave} onCancel={mockOnCancel} onLogout={mockOnLogout} />
      );

      await screen.findByLabelText(/Full Name/i);

      fireEvent.click(screen.getByRole('button', { name: /Cancel Changes/i }));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /Volver al Lobby/i }));
      expect(mockOnCancel).toHaveBeenCalledTimes(2);
    });

    it('debe disparar la función onLogout al hacer click en Log Out', async () => {
      render(
        <SettingsView user={mockPersonaUser} onSave={mockOnSave} onCancel={mockOnCancel} onLogout={mockOnLogout} />
      );

      await screen.findByLabelText(/Full Name/i);

      fireEvent.click(screen.getByRole('button', { name: /Log Out/i }));
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });
});
