// Admin auth coverage test: validates auth guard across all admin pages
// Run with: npx playwright test tests/admin-auth-coverage.spec.js --project=chromium --headed

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8000';

// Pages to validate (exclude login pages)
const adminPages = [
  '/admin/index.html',
  '/admin/gallery-manager.html',
  '/admin/hotspot-editor.html',
  '/admin/image-upload.html',
  '/admin/image-upload-test.html',
  '/admin/leads-manager.html',
  '/admin/property-editor.html',
  '/admin/publication-manager.html',
  '/admin/scene-manager.html',
  '/admin/tour-preview.html',
];

async function ensureLoggedIn(page) {
  await page.goto(`${BASE}/admin/login-fixed.html`);
  // Click Entrar (already prefilled)
  const loginBtn = page.getByRole('button', { name: 'Entrar' });
  await expect(loginBtn).toBeVisible();
  await loginBtn.click();
  // Wait localStorage and redirect
  await page.waitForTimeout(500);
  // Validate localStorage flag
  const logged = await page.evaluate(() => localStorage.getItem('test_admin_logged_in'));
  expect(logged).toBe('true');
}

for (const path of adminPages) {
  test.describe(`Auth coverage for ${path}`, () => {
    test(`should not redirect to login and show user indicator`, async ({ page }) => {
      // Ensure we are logged in first
      await ensureLoggedIn(page);

      // Navigate to target page
      await page.goto(`${BASE}${path}`);

      // Allow any guard checks to run
      await page.waitForTimeout(500);

      // Should not be redirected to login.html
      const url = page.url();
      expect(url).toContain(path);

      // Check indicator added by auth-guard-fixed
      const indicator = page.locator('#admin-user-indicator');
      await expect(indicator).toBeVisible();

      // Check localStorage still valid
      const logged = await page.evaluate(() => localStorage.getItem('test_admin_logged_in'));
      expect(logged).toBe('true');

      // No console errors related to addEventListener null (previous symptom)
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.waitForTimeout(200);
      const hasNullAddEvent = errors.some(e => /addEventListener/.test(e) && /null/.test(e));
      expect(hasNullAddEvent).toBeFalsy();
    });
  });
}

