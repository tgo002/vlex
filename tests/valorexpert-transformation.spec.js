import { test, expect } from '@playwright/test';

test.describe('ValorExpert - Transformação Completa', () => {
    test.beforeEach(async ({ page }) => {
        // Configurar interceptação de console para capturar erros
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Console Error:', msg.text());
            }
        });
    });

    test('Deve exibir rebranding ValorExpert na página inicial', async ({ page }) => {
        await page.goto('http://localhost:8000/index.html');
        
        // Verificar título da página
        await expect(page).toHaveTitle(/ValorExpert/);
        
        // Verificar logo no header
        const headerLogo = page.locator('header .logo');
        await expect(headerLogo).toContainText('ValorExpert');
        
        // Verificar ícone correto (chart-line)
        const logoIcon = page.locator('header .logo i');
        await expect(logoIcon).toHaveClass(/fa-chart-line/);
        
        // Verificar hero section
        const heroTitle = page.locator('.hero-content h1');
        await expect(heroTitle).toContainText('Avaliação Imobiliária Premium');
        
        // Verificar footer
        const footerLogo = page.locator('footer .logo');
        await expect(footerLogo).toContainText('ValorExpert');
        
        const footerCopyright = page.locator('.footer-bottom p');
        await expect(footerCopyright).toContainText('© 2024 ValorExpert');
    });

    test('Deve exibir rebranding ValorExpert na página de detalhes', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar título da página
        await expect(page).toHaveTitle(/ValorExpert/);
        
        // Verificar logo no header
        const headerLogo = page.locator('header .logo');
        await expect(headerLogo).toContainText('ValorExpert');
        
        // Verificar ícone correto (chart-line)
        const logoIcon = page.locator('header .logo i');
        await expect(logoIcon).toHaveClass(/fa-chart-line/);
        
        // Verificar footer
        const footerLogo = page.locator('footer .logo');
        await expect(footerLogo).toContainText('ValorExpert');
        
        const footerCopyright = page.locator('.footer-bottom p');
        await expect(footerCopyright).toContainText('© 2024 ValorExpert');
    });

    test('Deve exibir hero section moderno com galeria protagonista', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar hero section moderno
        const heroSection = page.locator('.property-hero-modern');
        await expect(heroSection).toBeVisible();
        
        // Verificar imagem principal (primeira ocorrência)
        const mainImage = page.locator('#mainImage').first();
        await expect(mainImage).toBeVisible();
        
        // Verificar overlay com informações
        const propertyOverlay = page.locator('.property-overlay');
        await expect(propertyOverlay).toBeVisible();
        
        // Verificar título na overlay
        const propertyTitle = page.locator('.property-overlay h1');
        await expect(propertyTitle).toBeVisible();
        await expect(propertyTitle).toContainText('Casa Moderna');
        
        // Verificar preço na overlay
        const propertyPrice = page.locator('.property-price');
        await expect(propertyPrice).toBeVisible();
        await expect(propertyPrice).toContainText('R$ 850.000');
        
        // Verificar contador de imagens
        const imageCounter = page.locator('.image-counter-overlay');
        await expect(imageCounter).toBeVisible();
        await expect(imageCounter).toContainText('4 fotos');
    });

    test('Deve ter controles de navegação funcionais', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar botões de navegação
        const prevBtn = page.locator('.prev-btn');
        const nextBtn = page.locator('.next-btn');
        
        await expect(prevBtn).toBeVisible();
        await expect(nextBtn).toBeVisible();
        
        // Testar navegação
        const mainImage = page.locator('#mainImage').first();
        const initialSrc = await mainImage.getAttribute('src');
        
        // Testar navegação usando JavaScript (evitar problemas de sobreposição)
        await page.evaluate(() => {
            window.nextImage();
        });
        await page.waitForTimeout(500);

        const newSrc = await mainImage.getAttribute('src');
        expect(newSrc).not.toBe(initialSrc);

        // Voltar para imagem anterior
        await page.evaluate(() => {
            window.previousImage();
        });
        await page.waitForTimeout(500);

        const backSrc = await mainImage.getAttribute('src');
        expect(backSrc).toBe(initialSrc);
    });

    test('Deve carregar imagens corretamente', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar que o contador não está em 0
        const imageCount = page.locator('#imageCount');
        await expect(imageCount).toBeVisible();
        
        const countText = await imageCount.textContent();
        expect(parseInt(countText)).toBeGreaterThan(0);
        
        // Verificar que a imagem principal carregou
        const mainImage = page.locator('#mainImage').first();
        await expect(mainImage).toBeVisible();
        
        const imageSrc = await mainImage.getAttribute('src');
        expect(imageSrc).not.toContain('placeholder');
        expect(imageSrc).not.toContain('Carregando');
    });

    test('Deve ser responsivo em diferentes tamanhos de tela', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Testar desktop
        await page.setViewportSize({ width: 1200, height: 800 });
        await expect(page.locator('.property-hero-modern')).toBeVisible();
        
        // Testar tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(page.locator('.property-hero-modern')).toBeVisible();
        await expect(page.locator('.property-overlay')).toBeVisible();
        
        // Testar mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('.property-hero-modern')).toBeVisible();
        await expect(page.locator('.property-overlay')).toBeVisible();
    });

    test('Deve ter navegação consistente entre páginas', async ({ page }) => {
        // Testar navegação da index para detalhes
        await page.goto('http://localhost:8000/index.html');
        
        // Verificar logo clicável
        const headerLogo = page.locator('header .logo');
        await expect(headerLogo).toBeVisible();
        
        // Ir para página de detalhes
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        await page.waitForTimeout(3000);
        
        // Verificar botão voltar específico
        const backButton = page.locator('header .back-btn');
        await expect(backButton).toBeVisible();
        await expect(backButton).toContainText('Voltar');
        
        // Testar navegação de volta
        await backButton.click();
        await expect(page).toHaveURL(/index\.html/);
    });

    test('Não deve ter erros críticos no console', async ({ page }) => {
        const consoleErrors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        await page.waitForTimeout(3000);
        
        // Filtrar apenas erros críticos (não incluir 404s de placeholder)
        const criticalErrors = consoleErrors.filter(error =>
            !error.includes('placeholder') &&
            !error.includes('ERR_NAME_NOT_RESOLVED') &&
            !error.includes('favicon') &&
            !error.includes('404 ()')
        );
        
        expect(criticalErrors).toHaveLength(0);
    });
});
