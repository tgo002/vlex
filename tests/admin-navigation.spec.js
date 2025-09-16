import { test, expect } from '@playwright/test';

const BASE = 'https://virtual-ochre.vercel.app';

async function clickAndWaitNavigation(page, locator) {
  const [nav] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'load' }),
    locator.click()
  ]);
  return nav;
}

test.describe('Admin - Navegação (Voltar e Editar)', () => {
  test('site-settings: botão Voltar deve ir para /admin/index.html', async ({ page }) => {
    await page.goto(`${BASE}/admin/site-settings/`, { waitUntil: 'load' });

    const back = page.locator('a.back-btn');
    await expect(back).toBeVisible();

    const href = await back.getAttribute('href');
    expect(href).toContain('/admin/index.html');

    await clickAndWaitNavigation(page, back);
    expect(page.url()).toContain('/admin/index.html');
  });

  test('publication-manager: botão Voltar deve ir para /admin/index.html', async ({ page }) => {
    await page.goto(`${BASE}/admin/publication-manager/`, { waitUntil: 'load' });

    const back = page.locator('a.back-btn');
    await expect(back).toBeVisible();

    const href = await back.getAttribute('href');
    expect(href).toContain('/admin/index.html');

    await clickAndWaitNavigation(page, back);
    expect(page.url()).toContain('/admin/index.html');
  });

  test('publication-manager: link Editar deve apontar para /admin/property-editor.html?id=... e navegar', async ({ page }) => {
    await page.goto(`${BASE}/admin/publication-manager/`, { waitUntil: 'load' });

    const editLink = page.locator('a.btn.btn-primary:has-text("Editar")').first();

    // Tenta encontrar por até 3s (pode não haver propriedades cadastradas)
    const found = await editLink.isVisible({ timeout: 3000 }).catch(() => false);

    if (!found) {
      console.warn('⚠️ Nenhum link "Editar" visível na publicação. Pulando verificação de clique.');
      // Valida ao menos que, se existir algum link, o href seja absoluto correto
      const hrefs = await page.locator('a.btn.btn-primary').evaluateAll(els => els.map(e => e.getAttribute('href')));
      const anyBad = hrefs.filter(h => h && h.includes('property-editor.html') && !h.startsWith('/admin/')).length > 0;
      expect(anyBad).toBeFalsy();
      return;
    }

    const href = await editLink.getAttribute('href');
    expect(href).toContain('/admin/property-editor.html?id=');

    await clickAndWaitNavigation(page, editLink);
    expect(page.url()).toContain('/admin/property-editor.html?id=');
  });
});

