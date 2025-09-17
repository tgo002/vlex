import { test, expect } from '@playwright/test';

// Sanidade do tour em modo demo (sem backend)
// Requisitos verificados:
// - Sem SyntaxError/ReferenceError ao carregar
// - Panorama visível e loading oculto
// - Responsividade básica em mobile

const DEMO_URL = '/client/tour.html?demo=1';

function collectErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message || String(err)));
  return errors;
}

test.describe('Tour Sanity (Demo Mode)', () => {
  test('carrega sem erros críticos e exibe panorama', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(DEMO_URL);

    // Espera elementos principais
    await expect(page.locator('#panorama')).toBeVisible();
    // Loading deve sumir ou ficar oculto
    const loading = page.locator('#loadingScreen');
    await loading.waitFor({ state: 'detached', timeout: 10000 }).catch(async () => {
      // se não for removido do DOM, espera ficar invisível
      await expect(loading).toHaveCSS('display', 'none');
    });

    // Não pode haver erros de sintaxe ou referência
    const critical = errors.filter(e => /SyntaxError|ReferenceError|TypeError:.*is not a function/.test(e));
    expect(critical).toHaveLength(0);
  });

  test('responsivo em mobile (panorama visível)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(DEMO_URL);
    await expect(page.locator('#panorama')).toBeVisible();
  });
});

