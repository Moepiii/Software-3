import { test, expect } from '@playwright/test';

for (const tipo of ['persona', 'empresa'] as const) {
  test(`recorrido real de puntos, permisos y experiencia para ${tipo}`, async ({ page, request }, testInfo) => {
    const adminLogin = await request.post('/api/login', { data: { email: 'admin@admin.com', password: '123456' } });
    expect(adminLogin.ok()).toBeTruthy();
    const admin = await adminLogin.json();
    const adminHeaders = { Authorization: `Bearer ${admin.token}` };
    const unique = `${Date.now()}-${tipo}`;
    const email = `mispuntos-${unique}@test.local`;
    const password = 'TestPuntos123!';
    const registro = await request.post(`/api/register/${tipo}`, { data: {
      email, password, cedula: unique, nombres: 'Prueba', apellidos: 'Mis puntos', rif: unique, nombre_empresa: 'Prueba Mis puntos',
    } });
    expect(registro.status(), await registro.text()).toBe(201);
    const login = await request.post('/api/login', { data: { email, password } });
    const usuario = await login.json();
    const userHeaders = { Authorization: `Bearer ${usuario.token}` };
    const cursoResponse = await request.post('/api/cursos', { headers: adminHeaders, data: {
      titulo: 'Reciclaje y economía circular: prácticas sostenibles para toda la comunidad',
      descripcion: 'Curso de prueba automática', fechaInicio: '2026-09-01', fechaFin: '2026-12-31', estado: 'activo', puntos_base: 200,
    } });
    expect(cursoResponse.status(), await cursoResponse.text()).toBe(201);
    const curso = await cursoResponse.json();
    try {
      expect((await request.get('/api/usuario/puntos')).status()).toBe(401);
      const payload = { usuario_id: usuario.user.id, curso_id: curso.id, progreso_pct: 50 };
      expect((await request.put('/api/admin/cursos/progreso', { headers: userHeaders, data: payload })).status()).toBe(403);
      expect((await request.post(`/api/cursos/${curso.id}/reservar`, { headers: userHeaders })).ok()).toBeTruthy();
      const inicial = await (await request.get('/api/usuario/puntos', { headers: userHeaders })).json();
      expect(inicial.puntos_totales).toBe(0);
      for (const progreso_pct of [-1, 101]) {
        expect((await request.put('/api/admin/cursos/progreso', { headers: adminHeaders, data: { ...payload, progreso_pct } })).status()).toBe(400);
      }
      const avance = await request.put('/api/admin/cursos/progreso', { headers: adminHeaders, data: payload });
      expect(avance.ok(), await avance.text()).toBeTruthy();
      expect((await avance.json()).puntos_ganados).toBe(100);
      const repetido = await request.put('/api/admin/cursos/progreso', { headers: adminHeaders, data: payload });
      expect((await repetido.json()).puntos_ganados).toBe(0);

      await page.goto('/');
      await page.getByRole('button', { name: 'Iniciar sesión' }).click();
      await page.getByPlaceholder('Correo Electrónico').fill(email);
      await page.getByPlaceholder('Contraseña').fill(password);
      await page.getByRole('button', { name: 'Entrar', exact: true }).click();
      await page.locator('#user-menu-button').click();
      await page.getByRole('button', { name: /Mis Puntos/ }).click();
      await expect(page.getByText('Eco-Héroe', { exact: true })).toBeVisible();
      await expect(page.getByText('100 de 200 puntos acreditados')).toBeVisible();
      await page.setViewportSize({ width: 375, height: 900 });
      await page.getByTitle('Modo oscuro', { exact: true }).click();
      const porcentaje = await page.getByText('50%', { exact: true }).boundingBox();
      expect(porcentaje?.height).toBeLessThan(36);
      await page.screenshot({ path: testInfo.outputPath(`${tipo}-real-movil.png`), fullPage: true });
      expect(await page.locator('main section, main article').evaluateAll(els => els.every(el => el.getBoundingClientRect().right <= innerWidth))).toBeTruthy();
      await page.setViewportSize({ width: 1280, height: 900 });
      const finalizar = await request.post(`/api/cursos/${curso.id}/finalizar`, { headers: adminHeaders });
      expect(finalizar.ok(), await finalizar.text()).toBeTruthy();
      expect((await finalizar.json()).usuarios_afectados).toBe(1);
      const resumen = await (await request.get('/api/usuario/puntos', { headers: userHeaders })).json();
      expect(resumen.puntos_totales).toBe(200);
      expect(resumen.cursos_activos).toHaveLength(0);
      expect(resumen.cursos_completados[0]).toMatchObject({ curso_id: curso.id, progreso_pct: 100, puntos_acreditados: 200 });
      const experiencia = await (await request.get('/api/usuario/experiencia', { headers: userHeaders })).json();
      expect(experiencia.experiencia).toBe(100);
      const repetirFin = await request.post(`/api/cursos/${curso.id}/finalizar`, { headers: adminHeaders });
      expect((await repetirFin.json()).usuarios_afectados).toBe(0);
      await page.locator('header').getByRole('link', { name: 'Inicio', exact: true }).click();
      await page.locator('#user-menu-button').click();
      await page.getByRole('button', { name: /Mis Puntos/ }).click();
      await expect(page.getByText('200 de 200 puntos acreditados')).toBeVisible();
      await expect(page.getByText('Completado', { exact: true })).toBeVisible();
    } finally {
      await request.delete(`/api/cursos/${curso.id}`, { headers: adminHeaders });
      await request.delete(`/api/admin/delete/${usuario.user.id}`, { headers: adminHeaders });
    }
  });
}
