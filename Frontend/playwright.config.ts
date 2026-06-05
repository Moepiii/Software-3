import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Carpeta donde estarán tus pruebas
  testDir: './tests',

  // Ejecutar pruebas en paralelo
  fullyParallel: true,

  // No fallar en CI si no hay archivos
  forbidOnly: !!process.env.CI,

  // Reintentos
  retries: process.env.CI ? 2 : 0,

  // Workers en paralelo
  workers: process.env.CI ? 1 : undefined,

  // Reporte
  reporter: 'html',

  // Configuración global
  use: {
    // URL base de tu app (Vite corre en el 5173 por defecto)
    baseURL: 'http://localhost:5173',

    // Capturar traza al fallar
    trace: 'on-first-retry',

    // Capturar screenshot al fallar
    screenshot: 'only-on-failure',

    // Capturar video al fallar
    video: 'retain-on-failure',
  },

  // Navegadores a probar
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Servidor web (opcional - Playwright puede levantar la app automáticamente)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});