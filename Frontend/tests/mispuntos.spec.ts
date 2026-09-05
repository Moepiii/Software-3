import { test, expect } from '@playwright/test';

for (const tipo of ['NATURAL', 'JURIDICO'] as const) {
  test(`Mis puntos conserva el panel y la experiencia de ${tipo}`, async ({ page }, testInfo) => {
    const errores: string[] = [];
    let fallarPuntos = true;
    page.on('pageerror', error => errores.push(error.message));
    await page.route(url => url.pathname.startsWith('/api/'), async route => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith('/puntos') && fallarPuntos) {
        fallarPuntos = false;
        await route.fulfill({ status: 503, json: { error: 'Puntos temporalmente no disponibles' } });
        return;
      }
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
    await expect(page.getByRole('alert')).toContainText('Puntos temporalmente no disponibles');
    const reintentar = page.getByRole('button', { name: 'Reintentar' });
    await reintentar.focus();
    await expect(reintentar).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Eco-Héroe', { exact: true })).toBeVisible();
    const titulo = page.getByRole('heading', { name: 'Mis Puntos', exact: true });
    await expect(titulo).toHaveCSS('font-family', /Qontra/);
    await expect(page.locator('body')).toHaveCSS('font-family', /Inter/);
    await page.screenshot({ path: testInfo.outputPath('mispuntos-claro.png'), fullPage: true });
    const superficie = titulo.locator('xpath=ancestor::section[1]');
    const claro = await superficie.evaluate(el => getComputedStyle(el).backgroundColor);
    await page.getByTitle('Modo oscuro', { exact: true }).click();
    await expect.poll(() => superficie.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(claro);
    const descuento = page.getByText('5%', { exact: true });
    const contraste = await descuento.evaluate(el => {
      const luminancia = (color: string) => {
        const rgb = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map(c => {
          const canal = c / 255;
          return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
        });
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      };
      const texto = luminancia(getComputedStyle(el).color);
      const fondo = luminancia(getComputedStyle(el.closest('article')!).backgroundColor);
      return (Math.max(texto, fondo) + 0.05) / (Math.min(texto, fondo) + 0.05);
    });
    expect(contraste).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({ path: testInfo.outputPath('mispuntos-oscuro.png'), fullPage: true });
    for (const width of [768, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const desbordes = await page.locator('main article, main section').evaluateAll(elements => elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.left < 0 || rect.right > window.innerWidth;
      }).length);
      expect(desbordes, `Tarjetas fuera de pantalla a ${width}px`).toBe(0);
    }
    await page.screenshot({ path: testInfo.outputPath('mispuntos-movil.png'), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.getByRole('progressbar', { name: 'Progreso hacia el siguiente nivel' })).toHaveAttribute('value', '50');
    await page.locator('header').getByRole('link', { name: 'Inicio', exact: true }).click();
    await expect(page.getByRole('heading', { name: panel })).toBeVisible();
    await expect(page.getByText('1050 EXP', { exact: true })).toBeVisible();
    expect(errores).toEqual([]);
  });
}
