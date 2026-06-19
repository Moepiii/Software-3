import { test, expect } from '@playwright/test';


test.describe('Flujo de Pago - Pago Móvil', () => {

    test('test', async ({ page }) => {
        await page.goto('http://localhost:5173/');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.getByRole('textbox', { name: 'Correo Electrónico' }).click();
        await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('persona@persona.com');
        await page.getByRole('textbox', { name: 'Contraseña' }).click();
        await page.getByRole('textbox', { name: 'Contraseña' }).fill('123456');
        await page.getByRole('textbox', { name: 'Contraseña' }).press('Enter');
        await page.getByRole('button', { name: 'Entrar' }).click();
        await page.getByRole('button', { name: 'Pagar deuda' }).click();
        await page.locator('#portal-input-monto').click();
        await page.locator('#portal-input-monto').fill('8000');
        await page.getByRole('button', { name: '🏦 Transferencia' }).click();
        await page.getByRole('button', { name: 'Continuar →' }).click();
        await page.getByRole('button', { name: 'Revisar pago →' }).click();
        await page.locator('#portal-transfer-banco').selectOption('Banco de Venezuela');
        await page.getByRole('textbox', { name: 'Ej:' }).click();
        await page.getByRole('textbox', { name: 'Ej:' }).fill('000123456789');
        await page.getByRole('button', { name: 'Revisar pago →' }).click();
        await page.getByRole('button', { name: '✓ Confirmar pago' }).click();
        await expect(page.getByText('Pago exitoso. Deuda restante')).toBeVisible();
    });
});
