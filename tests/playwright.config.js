// Configuração do Playwright para testes E2E
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Diretório dos testes (relativo a este config em ./tests)
  testDir: '.',
  // Limitar a suíte aos testes do cliente/tour para este ciclo
  testMatch: [
    'tour-ui-clean.spec.js',
    'tour-sanity.spec.js',
    'manual-*.spec.js'
  ],
  
  // Timeout global para testes
  timeout: 30000,
  
  // Timeout para expect
  expect: {
    timeout: 5000
  },
  
  // Configurações de execução
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  // Configurações globais
  use: {
    // URL base para testes
    baseURL: 'http://localhost:8000',
    
    // Trace on first retry
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Timeout para ações
    actionTimeout: 10000,
    
    // Timeout para navegação
    navigationTimeout: 30000,
    
    // Ignorar erros HTTPS
    ignoreHTTPSErrors: true,
    
    // Configurações de viewport
    viewport: { width: 1280, height: 720 },
    
    // User agent
    userAgent: 'Playwright Test Bot'
  },

  // Projetos de teste (diferentes browsers)
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
    
    // Testes mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Servidor de desenvolvimento
  webServer: {
    // Servir a raiz do repositório (este config vive em ./tests)
    command: 'python -m http.server 8000 -d ..',
    port: 8000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // Configurações de output
  outputDir: 'test-results/',
  
  // Global setup e teardown
  globalSetup: './global-setup.js',
  globalTeardown: './global-teardown.js',
});
