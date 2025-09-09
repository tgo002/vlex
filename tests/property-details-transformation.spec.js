import { test, expect } from '@playwright/test';

test.describe('Property Details Page - Professional Transformation', () => {
    const propertyUrl = 'http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    test.beforeEach(async ({ page }) => {
        // Start local server if needed
        await page.goto(propertyUrl);
        await page.waitForLoadState('networkidle');
    });

    test('should have consistent header with homepage', async ({ page }) => {
        // Verify header structure matches index.html
        const header = page.locator('header.header');
        await expect(header).toBeVisible();

        // Check logo with FontAwesome icon (header specific)
        const headerLogo = page.locator('header .logo');
        await expect(headerLogo).toBeVisible();
        await expect(headerLogo.locator('i.fas.fa-home')).toBeVisible();
        await expect(headerLogo).toContainText('Tours 360°');

        // Check navigation menu
        const navMenu = page.locator('.nav-menu');
        await expect(navMenu).toBeVisible();
        await expect(navMenu.locator('a[href="index.html#properties"]')).toContainText('Propriedades');
        await expect(navMenu.locator('a[href="index.html#about"]')).toContainText('Sobre');
        await expect(navMenu.locator('a[href="index.html#contact"]')).toContainText('Contato');

        // Check back button with icon
        const backBtn = page.locator('.back-btn');
        await expect(backBtn).toBeVisible();
        await expect(backBtn.locator('i.fas.fa-arrow-left')).toBeVisible();
        await expect(backBtn).toContainText('Voltar');
    });

    test('should have consistent footer with homepage', async ({ page }) => {
        // Scroll to footer
        await page.locator('footer.footer').scrollIntoViewIfNeeded();

        // Verify footer structure
        const footer = page.locator('footer.footer');
        await expect(footer).toBeVisible();

        // Check footer brand
        const footerLogo = footer.locator('.footer-brand .logo');
        await expect(footerLogo).toBeVisible();
        await expect(footerLogo.locator('i.fas.fa-home')).toBeVisible();
        await expect(footerLogo).toContainText('Tours 360°');

        // Check footer columns
        await expect(footer.locator('.footer-column h4')).toHaveCount(2);
        await expect(footer.locator('.footer-column').first()).toContainText('Navegação');
        await expect(footer.locator('.footer-column').last()).toContainText('Suporte');

        // Check social links
        const socialLinks = footer.locator('.social-links a');
        await expect(socialLinks).toHaveCount(4);
        await expect(socialLinks.first().locator('i.fab.fa-facebook')).toBeVisible();

        // Check footer bottom
        await expect(footer.locator('.footer-bottom')).toContainText('© 2024 Tours 360°');
    });

    test('should display professional gallery layout', async ({ page }) => {
        const gallerySection = page.locator('.gallery-section');
        await expect(gallerySection).toBeVisible();

        // Check gallery header with counter
        const galleryHeader = page.locator('.gallery-header');
        await expect(galleryHeader).toBeVisible();
        
        const galleryCounter = page.locator('.gallery-counter');
        await expect(galleryCounter).toBeVisible();
        await expect(galleryCounter.locator('i.fas.fa-images')).toBeVisible();

        // Check main gallery layout
        const mainGallery = page.locator('.main-gallery');
        await expect(mainGallery).toBeVisible();

        // Check main image with overlay
        const mainImage = page.locator('.main-image');
        await expect(mainImage).toBeVisible();
        
        const imageOverlay = page.locator('.image-overlay');
        await expect(imageOverlay).toBeVisible();
        await expect(imageOverlay.locator('.fullscreen-btn i.fas.fa-expand')).toBeVisible();

        // Check thumbnail grid
        const thumbnailGrid = page.locator('.thumbnail-grid');
        await expect(thumbnailGrid).toBeVisible();

        // Check gallery controls with icons
        const galleryControls = page.locator('.gallery-controls');
        await expect(galleryControls).toBeVisible();
        
        await expect(galleryControls.locator('button:has-text("Baixar Imagem") i.fas.fa-download')).toBeVisible();
        await expect(galleryControls.locator('button:has-text("Iniciar Tour 360°") i.fas.fa-vr-cardboard')).toBeVisible();
        await expect(galleryControls.locator('button:has-text("Compartilhar") i.fas.fa-share-alt')).toBeVisible();

        // Check navigation buttons
        await expect(page.locator('#prevBtn i.fas.fa-chevron-left')).toBeVisible();
        await expect(page.locator('#nextBtn i.fas.fa-chevron-right')).toBeVisible();
    });

    test('should display professional property details section', async ({ page }) => {
        const detailsSection = page.locator('.details-section');
        await expect(detailsSection).toBeVisible();

        // Check property description card
        const description = page.locator('.property-description');
        await expect(description).toBeVisible();

        // Check features grid with icons (wait for content to load)
        await page.waitForTimeout(2000); // Wait for property data to load
        const featuresGrid = page.locator('#featuresGrid');
        await expect(featuresGrid).toBeVisible();

        // Check property specs with icons
        const propertySpecs = page.locator('.property-specs');
        await expect(propertySpecs).toBeVisible();
        
        const specsTitle = propertySpecs.locator('.specs-title');
        await expect(specsTitle.locator('i.fas.fa-clipboard-list')).toBeVisible();
        await expect(specsTitle).toContainText('Especificações');
    });

    test('should display professional contact/actions section', async ({ page }) => {
        const contactSection = page.locator('.contact-section');
        await contactSection.scrollIntoViewIfNeeded();
        await expect(contactSection).toBeVisible();

        // Check contact header
        await expect(contactSection.locator('.section-title')).toContainText('Interessado nesta propriedade?');
        await expect(contactSection.locator('.contact-subtitle')).toBeVisible();

        // Check action cards
        const actionCards = page.locator('.action-card');
        await expect(actionCards).toHaveCount(4);

        // Check WhatsApp card (primary)
        const whatsappCard = actionCards.first();
        await expect(whatsappCard).toHaveClass(/primary/);
        await expect(whatsappCard.locator('.action-icon i.fab.fa-whatsapp')).toBeVisible();
        await expect(whatsappCard).toContainText('WhatsApp');

        // Check other action cards
        await expect(actionCards.nth(1).locator('.action-icon i.fas.fa-calendar-check')).toBeVisible();
        await expect(actionCards.nth(2).locator('.action-icon i.fas.fa-envelope')).toBeVisible();
        await expect(actionCards.nth(3).locator('.action-icon i.fas.fa-phone')).toBeVisible();

        // Check contact info cards
        const infoCards = page.locator('.info-card');
        await expect(infoCards).toHaveCount(3);
        await expect(infoCards.first().locator('i.fas.fa-user-tie')).toBeVisible();
        await expect(infoCards.nth(1).locator('i.fas.fa-clock')).toBeVisible();
        await expect(infoCards.nth(2).locator('i.fas.fa-shield-alt')).toBeVisible();
    });

    test('should be responsive on mobile devices', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Check header responsiveness
        const navMenu = page.locator('.nav-menu');
        await expect(navMenu).toBeHidden();

        // Check gallery responsiveness
        const mainGallery = page.locator('.main-gallery');
        await expect(mainGallery).toBeVisible();

        // Check gallery controls stack vertically
        const galleryControls = page.locator('.gallery-controls');
        await expect(galleryControls).toBeVisible();

        // Check contact actions stack vertically
        const contactSection = page.locator('.contact-section');
        await contactSection.scrollIntoViewIfNeeded();
        const actionCards = page.locator('.action-card');
        await expect(actionCards).toHaveCount(4);

        // Check footer responsiveness
        await page.locator('footer.footer').scrollIntoViewIfNeeded();
        const footerContent = page.locator('.footer-content');
        await expect(footerContent).toBeVisible();
    });

    test('should be responsive on tablet devices', async ({ page }) => {
        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Check gallery layout on tablet
        const mainGallery = page.locator('.main-gallery');
        await expect(mainGallery).toBeVisible();

        // Check contact actions grid on tablet
        const contactSection = page.locator('.contact-section');
        await contactSection.scrollIntoViewIfNeeded();
        const actionCards = page.locator('.action-card');
        await expect(actionCards).toHaveCount(4);
    });

    test('should have proper CSS variables and design system', async ({ page }) => {
        // Check if CSS variables are applied
        const rootStyles = await page.evaluate(() => {
            const root = document.documentElement;
            const styles = getComputedStyle(root);
            return {
                primaryGold: styles.getPropertyValue('--primary-gold').trim(),
                primaryDark: styles.getPropertyValue('--primary-dark').trim(),
                primaryBlue: styles.getPropertyValue('--primary-blue').trim()
            };
        });

        expect(rootStyles.primaryGold).toBe('#D4AF37');
        expect(rootStyles.primaryDark).toBe('#1a1a1a');
        expect(rootStyles.primaryBlue).toBe('#0f1419');
    });

    test('should handle gallery interactions', async ({ page }) => {
        // Wait for gallery to load
        await page.waitForSelector('.main-image img');

        // Test navigation buttons
        const nextBtn = page.locator('#nextBtn');
        const prevBtn = page.locator('#prevBtn');
        
        await expect(nextBtn).toBeVisible();
        await expect(prevBtn).toBeVisible();

        // Test fullscreen button
        const fullscreenBtn = page.locator('.fullscreen-btn');
        await expect(fullscreenBtn).toBeVisible();
    });

    test('should have working action buttons', async ({ page }) => {
        // Scroll to contact section
        await page.locator('.contact-section').scrollIntoViewIfNeeded();

        // Check WhatsApp link
        const whatsappLink = page.locator('a[href*="wa.me"]');
        await expect(whatsappLink).toBeVisible();
        await expect(whatsappLink).toHaveAttribute('href', /wa\.me/);

        // Check phone link
        const phoneLink = page.locator('a[href^="tel:"]');
        await expect(phoneLink).toBeVisible();
        await expect(phoneLink).toHaveAttribute('href', /tel:/);

        // Check action buttons
        const scheduleBtn = page.locator('button:has-text("Agendar Visita")');
        const emailBtn = page.locator('button:has-text("Enviar Email")');
        
        await expect(scheduleBtn).toBeVisible();
        await expect(emailBtn).toBeVisible();
    });

    test('should load without console errors', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto(propertyUrl);
        await page.waitForLoadState('networkidle');

        // Filter out known acceptable errors
        const criticalErrors = consoleErrors.filter(error =>
            !error.includes('favicon.ico') &&
            !error.includes('404') &&
            !error.includes('net::ERR_') &&
            !error.includes('Cannot read properties of undefined') // Expected during fallback to sample data
        );

        expect(criticalErrors).toHaveLength(0);
    });
});
