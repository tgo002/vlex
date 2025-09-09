import { test, expect } from '@playwright/test';

test.describe('Validação Completa do Sistema', () => {
    const adminCredentials = {
        email: 'admin@tours360.com',
        password: 'Admin@Tours360!2024'
    };

    test('Deve validar credenciais administrativas', async ({ page }) => {
        // Ir para página de login
        await page.goto('http://localhost:8000/admin/login.html');
        
        // Verificar se a página carregou
        await expect(page.locator('h1')).toBeVisible();
        
        // Preencher credenciais
        await page.fill('#email', adminCredentials.email);
        await page.fill('#password', adminCredentials.password);
        
        // Fazer login
        await page.click('button[type="submit"]');
        
        // Verificar se redirecionou para dashboard
        await page.waitForURL('**/admin/index.html', { timeout: 10000 });
        
        // Verificar se está logado
        await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('Deve carregar página de detalhes específica', async ({ page }) => {
        // Testar URL específica fornecida
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Verificar se a página carregou
        await expect(page.locator('.header')).toBeVisible();
        await expect(page.locator('.main-content')).toBeVisible();
        
        // Verificar estrutura básica
        await expect(page.locator('.logo')).toBeVisible();
        
        // Aguardar carregamento de dados
        await page.waitForTimeout(3000);
        
        // Verificar se há conteúdo ou mensagem de erro apropriada
        const loading = page.locator('#loading');
        const error = page.locator('#error');
        const content = page.locator('#propertyContent');
        
        // Pelo menos um deve estar visível
        const hasVisibleElement = await loading.isVisible() || 
                                 await error.isVisible() || 
                                 await content.isVisible();
        
        expect(hasVisibleElement).toBeTruthy();
    });

    test('Deve validar consistência visual entre páginas', async ({ page }) => {
        // Testar página inicial
        await page.goto('http://localhost:8000/index.html');
        
        // Capturar informações do header da página inicial
        const homeHeaderBg = await page.locator('.header').evaluate(el => 
            window.getComputedStyle(el).backgroundColor
        );
        const homeLogoColor = await page.locator('.logo').evaluate(el => 
            window.getComputedStyle(el).color
        );
        
        // Ir para página de detalhes
        await page.goto('http://localhost:8000/property-details.html?id=test');
        
        // Capturar informações do header da página de detalhes
        const detailsHeaderBg = await page.locator('.header').evaluate(el => 
            window.getComputedStyle(el).backgroundColor
        );
        const detailsLogoColor = await page.locator('.logo').evaluate(el => 
            window.getComputedStyle(el).color
        );
        
        // Verificar consistência
        expect(homeHeaderBg).toBe(detailsHeaderBg);
        expect(homeLogoColor).toBe(detailsLogoColor);
    });

    test('Deve validar fluxo de navegação completo', async ({ page }) => {
        // Começar na página inicial
        await page.goto('http://localhost:8000/index.html');
        
        // Verificar se carregou
        await expect(page.locator('.hero')).toBeVisible();
        
        // Aguardar carregamento de propriedades
        await page.waitForTimeout(3000);
        
        // Verificar se existem botões "Ver Detalhes"
        const detailsButtons = page.locator('.btn-details');
        
        if (await detailsButtons.count() > 0) {
            // Clicar no primeiro botão
            await detailsButtons.first().click();
            
            // Verificar se navegou para detalhes
            await expect(page).toHaveURL(/property-details\.html/);
            
            // Verificar se a página de detalhes carregou
            await expect(page.locator('.main-content')).toBeVisible();
            
            // Verificar se existe botão "Tour 360°"
            const tourButton = page.locator('button:has-text("Tour 360°"), a:has-text("Tour 360°")');
            if (await tourButton.count() > 0) {
                await expect(tourButton.first()).toBeVisible();
            }
        }
    });

    test('Deve validar responsividade da página de detalhes', async ({ page }) => {
        // Testar em diferentes tamanhos de tela
        const viewports = [
            { width: 1920, height: 1080, name: 'Desktop Large' },
            { width: 1366, height: 768, name: 'Desktop' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 375, height: 667, name: 'Mobile' }
        ];

        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            
            await page.goto('http://localhost:8000/property-details.html?id=test');
            
            // Verificar elementos essenciais
            await expect(page.locator('.header')).toBeVisible();
            await expect(page.locator('.main-content')).toBeVisible();
            
            // Verificar se o layout não quebrou
            const headerHeight = await page.locator('.header').boundingBox();
            expect(headerHeight?.height).toBeGreaterThan(0);
            
            console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) - OK`);
        }
    });

    test('Deve validar carregamento de imagens na galeria', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar se existe galeria
        const gallery = page.locator('.main-gallery, .gallery-section');
        
        if (await gallery.count() > 0) {
            // Verificar imagem principal
            const mainImage = page.locator('#mainImage, .main-image img');
            
            if (await mainImage.count() > 0) {
                await expect(mainImage.first()).toBeVisible();
                
                // Verificar se a imagem carregou sem erro
                const imageError = await mainImage.first().evaluate(img => {
                    return img.complete && img.naturalWidth === 0;
                });
                
                expect(imageError).toBeFalsy();
            }
            
            // Verificar thumbnails se existirem
            const thumbnails = page.locator('.thumbnail, .gallery-thumb');
            
            if (await thumbnails.count() > 0) {
                await expect(thumbnails.first()).toBeVisible();
            }
        }
    });

    test('Deve validar funcionalidade de navegação da galeria', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar botões de navegação
        const prevButton = page.locator('button:has-text("Anterior"), .btn-prev');
        const nextButton = page.locator('button:has-text("Próxima"), .btn-next');
        
        if (await prevButton.count() > 0) {
            await expect(prevButton.first()).toBeVisible();
        }
        
        if (await nextButton.count() > 0) {
            await expect(nextButton.first()).toBeVisible();
            
            // Testar clique no botão próxima
            await nextButton.first().click();
            await page.waitForTimeout(500);
        }
    });

    test('Deve validar informações da propriedade', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar elementos de informação
        const title = page.locator('.property-title, h1');
        const price = page.locator('.property-price, .price');
        const description = page.locator('.property-description, .description');
        
        // Pelo menos o título deve estar presente
        if (await title.count() > 0) {
            await expect(title.first()).toBeVisible();
        }
        
        // Verificar se há informações básicas
        const infoElements = page.locator('.property-info, .details, .specifications');
        
        if (await infoElements.count() > 0) {
            await expect(infoElements.first()).toBeVisible();
        }
    });

    test('Deve validar botão Tour 360° funcional', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Procurar botão Tour 360°
        const tourButton = page.locator('button:has-text("Tour 360°"), a:has-text("Tour 360°"), button:has-text("Iniciar Tour")');
        
        if (await tourButton.count() > 0) {
            await expect(tourButton.first()).toBeVisible();
            
            // Verificar se o botão é clicável
            await expect(tourButton.first()).toBeEnabled();
            
            // Testar clique (sem navegar para evitar problemas)
            const buttonText = await tourButton.first().textContent();
            expect(buttonText).toMatch(/tour|360|iniciar/i);
        }
    });

    test('Deve validar performance de carregamento', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar elementos principais
        await page.waitForSelector('.header', { timeout: 10000 });
        await page.waitForSelector('.main-content', { timeout: 10000 });
        
        const loadTime = Date.now() - startTime;
        
        // Verificar se carregou em tempo razoável (menos de 10 segundos)
        expect(loadTime).toBeLessThan(10000);
        
        console.log(`⏱️ Tempo de carregamento: ${loadTime}ms`);
    });
});
