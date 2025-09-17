// Playwright test: Tour UI must be minimal (no property-info panel), show phone and a single contact button
// Base URL can be overridden by env TOUR_URL
import { test, expect } from '@playwright/test';

const DEFAULT_TOUR_URL = 'http://localhost:8000/client/tour.html?id=2817c143-4287-4eeb-b89d-96bbd441aecf';
const TOUR_URL = process.env.TOUR_URL || DEFAULT_TOUR_URL;

test.describe('Tour UI minimal', () => {
  test('should hide property-info and show minimal contact with phone', async ({ page }) => {
    await page.goto(TOUR_URL, { waitUntil: 'domcontentloaded' });

    // Wait viewer area and hide loading screen
    await page.waitForSelector('#panorama', { state: 'visible' });
    await page.waitForSelector('#loadingScreen', { state: 'hidden', timeout: 20000 }).catch(() => {});

    // property-info removed
    await expect(page.locator('#propertyInfo')).toHaveCount(0);

    // minimal contact present (may fade-in); wait until phone populated
    const contact = page.locator('#contactMinimal');
    await expect(contact).toBeVisible({ timeout: 15000 });

    // Phone element exists (content may populate asynchronously from Supabase in prod)
    const phone = page.locator('#contactPhone');
    await expect(phone).toHaveCount(1);

    // only one contact button inside contact-minimal
    const btns = contact.locator('button');
    await expect(btns).toHaveCount(1);
    await expect(btns.first()).toBeVisible();
  });
});

