import { test, expect } from '@playwright/test';

test.describe('Página inicial', () => {
  test('muestra la identidad y las acciones principales', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('EcoLogic', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible();
  });

  test('permite cambiar entre modo claro y oscuro', async ({ page }) => {
    await page.goto('/');

    const themeButton = page.locator('header button').first();
    const pageSurface = page.locator('main > div').first();
    const initialColor = await pageSurface.evaluate((element) => getComputedStyle(element).backgroundColor);

    await themeButton.click();
    await expect.poll(async () => pageSurface.evaluate((element) => getComputedStyle(element).backgroundColor))
      .not.toBe(initialColor);

    await themeButton.click();
    await expect.poll(async () => pageSurface.evaluate((element) => getComputedStyle(element).backgroundColor))
      .toBe(initialColor);
  });
});
