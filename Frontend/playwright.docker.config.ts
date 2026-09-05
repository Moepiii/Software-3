import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/docker',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:15173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
