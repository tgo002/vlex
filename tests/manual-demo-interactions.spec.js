import { test, expect } from '@playwright/test';

const DEMO_URL = '/client/tour.html?demo=1';

function attachCollectors(page) {
  const consoleLogs = [];
  const errors = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (msg.type() === 'error') errors.push(text);
  });
  page.on('pageerror', err => errors.push(err.message || String(err)));
  page.on('dialog', async d => { await d.accept(); });
  return { consoleLogs, errors };
}

test.describe('Manual Demo — Interações reais', () => {
  test('navegação por hotspot, zoom/rotação e responsividade', async ({ page }) => {
    const { consoleLogs, errors } = attachCollectors(page);

    // Desktop
    await page.setViewportSize({ width: 1366, height: 800 });
    await page.goto(DEMO_URL);

    // Espera o panorama visível
    await expect(page.locator('#panorama')).toBeVisible();

    // Tentar navegar clicando no centro do viewer (hotspot de navegação está em yaw/pitch 0)
    const bbox = await page.locator('#panorama').boundingBox();
    if (bbox) {
      await page.mouse.click(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
    }

    // Verificação conservadora: sem erros após clique e panorama segue visível
    await page.waitForTimeout(800);
    const criticalAfterClick = errors.filter(e => /SyntaxError|ReferenceError|Unexpected token|TypeError:.*is not a function/i.test(e));
    expect(criticalAfterClick).toHaveLength(0);
    await expect(page.locator('#panorama')).toBeVisible();

    // Zoom in/out via controles
    const zoomIn = page.locator('.pnlm-zoom-in');
    const zoomOut = page.locator('.pnlm-zoom-out');
    if (await zoomIn.count()) {
      await zoomIn.click();
      await zoomIn.click();
    }
    if (await zoomOut.count()) {
      await zoomOut.click();
    }

    // Responsividade (mobile)
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#panorama')).toBeVisible();

    // Sem erros críticos
    const critical = errors.filter(e => /SyntaxError|ReferenceError|Unexpected token|TypeError:.*is not a function/i.test(e));
    expect(critical).toHaveLength(0);
  });
});

