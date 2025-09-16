// Playwright test: Admin Scene Manager - delete scene with cascade (remove related hotspots first)
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
}

test.describe('Admin Scene Manager - Delete with cascade', () => {
  test('should delete a temp scene without FK errors', async ({ page, browserName }) => {
    // Bypass auth for tests using the test flag handled in the page
    await page.addInitScript(() => {
      localStorage.setItem('test_admin_logged_in', 'true');
      localStorage.setItem('test_admin_email', 'admin@tours360.com');
    });
    await page.goto(`${BASE_URL}/admin/scene-manager.html?propertyId=${PROPERTY_ID}`);
    await page.waitForSelector('#scenesContainer');

    // Create a temporary scene via module import in-page
    const temp = await page.evaluate(async (propertyId) => {
      const { sceneManager, hotspotManager } = await import('/shared/supabase-client.js');
      const title = `temp-scene-${Date.now()}`;
      const create = await sceneManager.createScene({
        property_id: propertyId,
        title,
        image_url: 'https://pannellum.org/images/alma.jpg',
        image_width: 6000,
        image_height: 3000,
        initial_pitch: 0,
        initial_yaw: 0,
        initial_hfov: 110,
        is_default: false,
        order_index: 9999
      });
      if (!create.success) throw new Error(create.error || 'failed to create temp scene');
      const scene = create.data;

      // Create hotspots that belong to and point to the temp scene
      await hotspotManager.createHotspot({
        scene_id: scene.id,
        type: 'info',
        title: 'tmp-info',
        description: 'tmp',
        pitch: 0,
        yaw: 0
      });
      await hotspotManager.createHotspot({
        scene_id: scene.id,
        type: 'navigation',
        title: 'tmp-nav',
        pitch: 10,
        yaw: 10,
        target_scene_id: scene.id,
        target_pitch: 0,
        target_yaw: 0
      });
      return { sceneId: scene.id, title };
    }, PROPERTY_ID);

    // Refresh scenes list to include the new card
    await page.reload();
    await page.waitForSelector(`[data-scene-id="${temp.sceneId}"]`);

    // Delete it via UI
    const card = page.locator(`[data-scene-id="${temp.sceneId}"]`);
    page.once('dialog', async (dialog) => { await dialog.accept(); });
    await card.locator('button:has-text("🗑️ Excluir")').click();

    // Ensure card disappears without error
    await expect(page.locator(`[data-scene-id="${temp.sceneId}"]`)).toHaveCount(0, { timeout: 15000 });
  });
});

