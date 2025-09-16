// Playwright test: Admin Scene Manager - edit scene name via prompt
// BASE_URL and PROPERTY_ID can be overridden via env
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PROPERTY_ID = process.env.PROPERTY_ID || '2817c143-4287-4eeb-b89d-96bbd441aecf';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tours360.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Tours360!2024';

async function adminLogin(page) {
  await page.goto(`${BASE_URL}/admin/login-fixed.html`);
  await page.fill('#email', ADMIN_EMAIL);
  await page.fill('#password', ADMIN_PASSWORD);
  await Promise.all([
    page.waitForURL(/\/admin(\/index\.html)?\/?$/),
    page.click('button[type="submit"]'),
  ]);
  await expect(page).toHaveURL(new RegExp(`${BASE_URL.replace(/\//g,'\\/')}\/admin(\/index\\.html)?\/?$`));
}

test.describe('Admin Scene Manager - Edit Scene', () => {
  test('should rename a scene via prompt and persist', async ({ page }) => {
    // Bypass auth for tests using the test flag handled in the page
    await page.addInitScript(() => {
      localStorage.setItem('test_admin_logged_in', 'true');
      localStorage.setItem('test_admin_email', 'admin@tours360.com');
    });

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
    await page.waitForTimeout(700); // small debounce for reload
    await expect(page.locator(`.scene-title:has-text("${newTitle}")`)).toHaveCount(1);
  });
});

