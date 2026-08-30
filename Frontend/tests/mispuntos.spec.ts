import { test, expect } from '@playwright/test';

for (const tipo of ['NATURAL', 'JURIDICO'] as const) {
  test(`Mis puntos conserva el panel y la experiencia de ${tipo}`, async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', error => errores.push(error.message));
    await page.route(url => url.pathname.startsWith('/api/'), async route => {
      const path = new URL(route.request().url()).pathname;
      let data: unknown = [];
      if (path === '/api/login') data = {
        token: 'test.' + Buffer.from(JSON.stringify({ id: 'u1', role: 'user' })).toString('base64') + '.test',
        user: { id: 'u1', nombre: 'Usuario Prueba', email: 'prueba@test.local', tipo, role: 'user' },
      };
      else if (path.endsWith('/deuda')) data = { id: 'd1', monto: 100, vigente: true, usuario_id: 'u1' };
      else if (path.endsWith('/experiencia')) data = { nivel: 1, experiencia: 1050, maximoNivel: 1000 };
      else if (path.endsWith('/puntos')) data = {
        puntos_totales: 175, nivel_actual: 'Eco-Héroe', descuento_porcentaje: 5,
        progreso_actual: 75, progreso_objetivo: 150, progreso_porcentaje: 50,
        puntos_faltantes: 75, siguiente_nivel: 'Guardián Verde', nivel_maximo: false,
        beneficio: 'Descuento aplicable al impuesto de basura', cursos_activos: [], cursos_completados: [],
      };
      await route.fulfill({ json: data });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.getByPlaceholder('Correo Electrónico').fill('prueba@test.local');
    await page.getByPlaceholder('Contraseña').fill('password123');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    const panel = tipo === 'NATURAL' ? 'Panel de Persona' : 'Panel de Empresa';
    await expect(page.getByRole('heading', { name: panel })).toBeVisible();
    await expect(page.getByText('1050 EXP', { exact: true })).toBeVisible();
    await page.locator('#user-menu-button').click();
    await page.getByRole('button', { name: /Mis Puntos/ }).click();
    await expect(page.getByText('Eco-Héroe', { exact: true })).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Progreso hacia el siguiente nivel' })).toHaveAttribute('value', '50');
    await page.locator('header').getByRole('link', { name: 'Inicio', exact: true }).click();
    await expect(page.getByRole('heading', { name: panel })).toBeVisible();
    await expect(page.getByText('1050 EXP', { exact: true })).toBeVisible();
    expect(errores).toEqual([]);
  });
}
