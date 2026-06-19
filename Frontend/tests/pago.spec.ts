import { test, expect } from '@playwright/test';

const TEST_USER = {
    email: 'persona@persona.com',
    password: '123456'
};

test.describe('Flujo de Pago - Pago Móvil', () => {

    test('debe iniciar sesión, hacer clic en Pagar deuda, seleccionar Pago Móvil, completar datos, confirmar pago y volver al panel', async ({ page }) => {

        // ============================================
        // PASO 1: Iniciar sesión
        // ============================================
        await page.goto('http://localhost:5173/');  await page.goto('/'); 
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
        // PASO 2: Hacer clic en "Pagar deuda"
        // ============================================
        const pagarBtn = page.getByRole('button', { name: 'Pagar deuda' });
        await expect(pagarBtn).toBeVisible();
        await pagarBtn.click();
        await page.waitForTimeout(500);

        await expect(page.getByText('PORTAL DE PAGO SEGURO')).toBeVisible();
        console.log('✅ Paso 2: Portal de pago abierto');

        // ============================================
        // PASO 3: Seleccionar "Pago Móvil"
        // ============================================
        await page.getByText('Pago Móvil').click();
        console.log('✅ Paso 3: Método Pago Móvil seleccionado');

        // ============================================
        // PASO 4: Hacer clic en "Continuar →"
        // ============================================
        await page.getByRole('button', { name: 'Continuar →' }).click();
        await page.waitForTimeout(500);
        console.log('✅ Paso 4: Clic en Continuar');

        // ============================================
        // PASO 5: Llenar el campo "Tu número de teléfono"
        // ============================================
        const telefonoInput = page.locator('input[placeholder*="teléfono"], input[placeholder*="Teléfono"], input[type="tel"]').first();
        await telefonoInput.fill('04121234567');
        console.log('✅ Paso 5: Número de teléfono ingresado: 04121234567');

        // ============================================
        // PASO 6: Hacer clic en "Revisar pago →"
        // ============================================
        await page.getByRole('button', { name: 'Revisar pago →' }).click();
        await page.waitForTimeout(500);
        console.log('✅ Paso 6: Clic en Revisar pago');

        // ============================================
        // PASO 7: Verificar pantalla de confirmación
        // ============================================
        await expect(page.getByText('Resumen de pago')).toBeVisible();
        console.log('✅ Paso 7: Pantalla de confirmación alcanzada');

        // ============================================
        // PASO 8: Hacer clic en "Confirmar pago"
        // ============================================
        await page.getByRole('button', { name: 'Confirmar pago' }).click();
        await page.waitForTimeout(1000);
        console.log('✅ Paso 8: Clic en Confirmar pago');

        // ============================================
        // PASO 9: Esperar a que se procese y se cierre el portal
        // ============================================
        // Esperar a que el portal desaparezca (el overlay se cierra)
        await page.waitForTimeout(2000);

        // Verificar que el portal de pago ya no está visible
        const portalVisible = await page.getByText('PORTAL DE PAGO SEGURO').isVisible().catch(() => false);
        expect(portalVisible).toBe(false);
        console.log('✅ Paso 9: Portal de pago cerrado');

        // ============================================
        // PASO 10: Verificar que volvimos al panel de persona
        // ============================================
        await expect(page.getByText('Panel de Persona')).toBeVisible();
        console.log('✅ Paso 10: Retornó al Panel de Persona correctamente');

        // ============================================
        // PRUEBA COMPLETADA EXITOSAMENTE
        // ============================================
        console.log('🎉 Flujo de pago completado exitosamente - Retorno al panel verificado');

        // Tomar screenshot al final
        await page.screenshot({ path: 'test-pago-final.png' });
    });
});
