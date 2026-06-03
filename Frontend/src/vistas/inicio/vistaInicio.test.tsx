/** @jest-environment jsdom */

//Autor Leonardo Dolande
// Se agregan pruebas para el landing pagde la pagina

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VistaInicio } from './VistaInicio';

describe('Componente VistaInicio', () => {

  test('debe renderizar todos los elementos principales en modo claro por defecto', async () => {
    render(<VistaInicio />);

    // En lugar de getByText, usamos findByText (que es asíncrono y lleva un `act` implícito)
    // Esto le da tiempo al estado interno de inicializarse.
    const badgeElement = await screen.findByText(/PROGRAMA FISCAL VENEZUELA 2026/i);
    expect(badgeElement).toBeInTheDocument();

    // Si tienes un título principal (Hero Title), búscalo también de forma asíncrona o usando get normales después del primer find
    const titleElement = screen.getByText(/Menos residuos/i); 
    expect(titleElement).toBeInTheDocument();
  });

  test('debe aplicar los colores de fondo del Modo Claro correctamente', async () => {
    const { container } = render(<VistaInicio isDarkMode={false} />);

    // Esperamos a que el contenedor deje de estar vacío y React 19 pinte el componente
    await waitFor(() => {
      expect(container.firstChild).not.toBeNull();
    });

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveStyle({ backgroundColor: '#f8fafc' });
  });

  test('debe aplicar los colores de fondo del Modo Oscuro correctamente', async () => {
    const { container } = render(<VistaInicio isDarkMode={true} />);

    // Esperamos a que React termine de procesar el estado oscuro inicial
    await waitFor(() => {
      expect(container.firstChild).not.toBeNull();
    });

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveStyle({ backgroundColor: '#0f172a' });

    const titleElement = screen.getByText(/Menos residuos/i);
    expect(titleElement).toBeInTheDocument();
  });

});
