import { test, expect } from '@playwright/test';

const TEST_USER = {
    email: 'persona@persona.com',
    password: '123456'
};

test.describe('Panel de Persona - LobbyPersona', () => {

    test('debe iniciar sesión, probar modo oscuro, abrir menú y hacer clic en Configuración', async ({ page }) => {

        // ============================================
        // PASO 1: Iniciar sesión
        // ============================================
        await page.goto('/');
        await expect(page.getByText('EcoLogic')).toBeVisible();
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();
        await page.waitForTimeout(1000);

        const emailInput = page.locator('input[type="email"], input[placeholder*="correo"], input[placeholder*="email"], input[name="email"]').first();
        await emailInput.fill(TEST_USER.email);

        const passwordInput = page.locator('input[type="password"]').first();
        await passwordInput.fill(TEST_USER.password);

        await page.getByRole('button', { name: 'Entrar' }).click();
        await page.waitForTimeout(2000);

        await expect(page.getByText('Panel de Persona')).toBeVisible();
        console.log('✅ Paso 1: Inicio de sesión exitoso');

        // ============================================
        // PASO 2: Activar modo oscuro
        // ============================================
        const darkModeBtn = page.locator('button').filter({ hasText: /🌙|☀️/ }).first();
        await expect(darkModeBtn).toBeVisible();

        const initialBg = await page.evaluate(() => {
            return getComputedStyle(document.body).backgroundColor;
        });

        await darkModeBtn.click();
        await page.waitForTimeout(500);

        const newBg = await page.evaluate(() => {
            return getComputedStyle(document.body).backgroundColor;
        });

        expect(newBg).not.toBe(initialBg);
        console.log('✅ Paso 2: Modo oscuro activado');

        // ============================================
        // PASO 3: Desactivar modo oscuro
        // ============================================
        await darkModeBtn.click();
        await page.waitForTimeout(500);

        const finalBg = await page.evaluate(() => {
            return getComputedStyle(document.body).backgroundColor;
        });

        expect(finalBg).toBe(initialBg);
        console.log('✅ Paso 3: Modo oscuro desactivado');

        // ============================================
        // PASO 4: Abrir menú lateral
        // ============================================
        const menuBtn = page.getByRole('button', { name: 'Menu' });
        await expect(menuBtn).toBeVisible();
        await menuBtn.click();
        await page.waitForTimeout(300);

        await expect(page.getByText('Mi Cuenta')).toBeVisible();
        console.log('✅ Paso 4: Menú lateral abierto');

        // ============================================
        // PASO 5: Verificar opciones del menú
        // ============================================
        await expect(page.getByText('Configuración')).toBeVisible();
        await expect(page.getByText('Mis estadísticas')).toBeVisible();
        await expect(page.getByText('Cerrar sesión')).toBeVisible();
        console.log('✅ Paso 5: Opciones del menú visibles');

        // ============================================
        // PASO 6: Hacer clic en Configuración
        // ============================================
        await page.getByText('Configuración').click();
        await page.waitForTimeout(500);

        // La prueba es válida si el clic se ejecutó sin errores
        console.log('✅ Paso 6: Clic en Configuración ejecutado correctamente');

        // ============================================
        // PRUEBA COMPLETADA EXITOSAMENTE
        // ============================================
        console.log('🎉 Todas las pruebas completadas exitosamente');

        // Tomar screenshot al final
        await page.screenshot({ path: 'test-final.png' });
    });
});