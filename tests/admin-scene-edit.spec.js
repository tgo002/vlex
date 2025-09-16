// Playwright test: Admin Scene Manager - edit scene name via prompt
// BASE_URL and PROPERTY_ID can be overridden via env
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://vlex-mu.vercel.app';
const PROPERTY_ID = process.env.PROPERTY_ID || '2817c143-4287-4eeb-b89d-96bbd441aecf';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tours360.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Tours360!2024';

async function adminLogin(page) {
  await page.goto(`${BASE_URL}/admin/login-fixed.html`);
  await page.fill('#email', ADMIN_EMAIL);
  await page.fill('#password', ADMIN_PASSWORD);
  await Promise.all([
    page.waitForURL(/\/admin\/?$/),
    page.click('button[type="submit"]'),
  ]);
  await expect(page).toHaveURL(new RegExp(`${BASE_URL.replace(/\//g,'\\/')}\/admin\/?$`));
}

test.describe('Admin Scene Manager - Edit Scene', () => {
  test('should rename a scene via prompt and persist', async ({ page }) => {
    await adminLogin(page);

    await page.goto(`${BASE_URL}/admin/scene-manager.html?propertyId=${PROPERTY_ID}`);
    await page.waitForSelector('#scenesContainer');

    // Pick first scene card
    const firstCard = page.locator('.scene-card').first();
    await expect(firstCard).toBeVisible();

    const oldTitle = await firstCard.locator('.scene-title').innerText();
    const newTitle = `${oldTitle} - Edit ${Date.now()}`.slice(0, 80);

    // Accept prompt with new title
    page.once('dialog', async (dialog) => {
      await dialog.accept(newTitle);
    });
    await firstCard.locator('button:has-text("✏️ Editar")').click();

    // Validate list refresh and new title present
    await page.waitForTimeout(500); // small debounce for reload
    const titles = page.locator('.scene-title');
    await expect(titles).toContainText(newTitle);
  });
});

