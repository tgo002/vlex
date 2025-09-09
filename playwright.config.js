// Configuração do Playwright para testes do sistema de tours virtuais 360°
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Diretório dos testes
  testDir: './tests',
  
  // Executar testes em paralelo
  fullyParallel: true,
  
  // Falhar build se houver testes sem retry
  forbidOnly: !!process.env.CI,
  
  // Retry em caso de falha
  retries: process.env.CI ? 2 : 0,
  
  // Número de workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter para resultados
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Configurações globais
  use: {
    // URL base para testes
    baseURL: 'http://localhost:8000',
    
    // Trace em caso de falha
    trace: 'on-first-retry',
    
    // Screenshot em caso de falha
    screenshot: 'only-on-failure',
    
    // Vídeo em caso de falha
    video: 'retain-on-failure',
    
    // Timeout para ações
    actionTimeout: 10000,
    
    // Timeout para navegação
    navigationTimeout: 30000,
    
    // Headers padrão
    extraHTTPHeaders: {
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
    }
  },

  // Configuração de projetos (browsers)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Configurações específicas do Chrome
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--allow-running-insecure-content'
          ]
        }
      },
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

    // Testes em diferentes resoluções
    {
      name: 'Desktop Large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: 'Desktop Small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 }
      }
    },
    {
      name: 'Tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 }
      }
    }
  ],

  // Servidor de desenvolvimento
  webServer: {
    command: 'python -m http.server 8000',
    port: 8000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    cwd: '.',
  },

  // Configurações de timeout
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // Diretórios de saída
  outputDir: 'test-results/artifacts',
  
  // Configurações globais de setup
  globalSetup: './tests/global-setup.js',
  globalTeardown: './tests/global-teardown.js',
});
