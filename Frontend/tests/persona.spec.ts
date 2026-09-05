import { test, expect } from '@playwright/test';

test.describe('Flujo de autenticación', () => {
    test('navega a iniciar sesión y permite volver al inicio', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
        await expect(page.getByPlaceholder('Correo Electrónico')).toBeVisible();
        await expect(page.getByPlaceholder('Contraseña')).toBeVisible();

        await page.getByRole('button', { name: /Volver al Inicio/i }).click();
        await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
    });

    test('muestra el formulario de registro para personas', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Crear cuenta' }).click();
        await page.getByRole('button', { name: 'Soy una Persona' }).click();

        await expect(page.getByRole('heading', { name: 'Registro de Persona' })).toBeVisible();
        await expect(page.getByPlaceholder('Cédula')).toBeVisible();
        await expect(page.getByPlaceholder('Nombres')).toBeVisible();
        await expect(page.getByPlaceholder('Apellidos')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Completar Registro' })).toBeVisible();
    });

    
});
