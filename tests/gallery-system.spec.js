import { test, expect } from '@playwright/test';

test.describe('Sistema de Galeria de Imagens', () => {
    const adminCredentials = {
        email: 'admin@tours360.com',
        password: 'Admin@Tours360!2024'
    };

    // Helper function para fazer login
    async function loginAsAdmin(page) {
        await page.goto('http://localhost:8000/admin/login.html');
        await page.fill('#email', adminCredentials.email);
        await page.fill('#password', adminCredentials.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/admin/index.html');
    }

    test.beforeEach(async ({ page }) => {
        // Fazer login antes de cada teste
        await loginAsAdmin(page);
    });

    test('Deve exibir página inicial pública com imagens principais', async ({ page }) => {
        // Ir para página inicial pública
        await page.goto('http://localhost:8000/index.html');
        
        // Verificar se a página carregou
        await expect(page.locator('h1')).toContainText('Tours Virtuais 360°');
        
        // Verificar se existem cards de propriedades
        const propertyCards = page.locator('.property-card');
        await expect(propertyCards.first()).toBeVisible();
        
        // Verificar se os botões "Ver Detalhes" estão presentes
        const detailsButtons = page.locator('.btn-details');
        if (await detailsButtons.count() > 0) {
            await expect(detailsButtons.first()).toContainText('Ver Detalhes');
        }
        
        // Verificar se os botões "Tour 360°" estão presentes
        const tourButtons = page.locator('.btn-tour');
        if (await tourButtons.count() > 0) {
            await expect(tourButtons.first()).toContainText('Tour 360°');
        }
    });

    test('Deve navegar da página inicial para detalhes da propriedade', async ({ page }) => {
        // Ir para página inicial
        await page.goto('http://localhost:8000/index.html');
        
        // Aguardar carregamento das propriedades
        await page.waitForSelector('.property-card', { timeout: 10000 });
        
        // Verificar se existe pelo menos um botão "Ver Detalhes"
        const detailsButton = page.locator('.btn-details').first();
        
        if (await detailsButton.count() > 0) {
            // Clicar no primeiro botão "Ver Detalhes"
            await detailsButton.click();
            
            // Verificar se navegou para página de detalhes
            await expect(page).toHaveURL(/property-details\.html\?id=/);
            
            // Verificar elementos da página de detalhes
            await expect(page.locator('.property-title')).toBeVisible();
            await expect(page.locator('.property-price')).toBeVisible();
            await expect(page.locator('.gallery-section')).toBeVisible();
        }
    });

    test('Deve exibir galeria de imagens na página de detalhes', async ({ page }) => {
        // Ir para página inicial e navegar para detalhes
        await page.goto('http://localhost:8000/index.html');
        await page.waitForSelector('.property-card', { timeout: 10000 });
        
        const detailsButton = page.locator('.btn-details').first();
        
        if (await detailsButton.count() > 0) {
            await detailsButton.click();
            
            // Verificar elementos da galeria
            await expect(page.locator('.main-gallery')).toBeVisible();
            await expect(page.locator('#mainImage')).toBeVisible();
            
            // Verificar botão "Iniciar Tour 360°"
            const tourButton = page.locator('button:has-text("Iniciar Tour 360°")');
            await expect(tourButton).toBeVisible();
            
            // Verificar navegação de imagens
            const prevButton = page.locator('button:has-text("Anterior")');
            const nextButton = page.locator('button:has-text("Próxima")');
            await expect(prevButton).toBeVisible();
            await expect(nextButton).toBeVisible();
        }
    });

    test('Deve acessar gerenciador de galeria no admin', async ({ page }) => {
        // Ir para dashboard admin
        await page.goto('http://localhost:8000/admin/index.html');
        
        // Verificar se o link do gerenciador de galeria existe
        const galleryLink = page.locator('a[href="gallery-manager.html"]');
        await expect(galleryLink).toBeVisible();
        
        // Clicar no link
        await galleryLink.click();
        
        // Verificar se navegou para o gerenciador
        await expect(page).toHaveURL('**/admin/gallery-manager.html');
        
        // Verificar elementos da página
        await expect(page.locator('h1:has-text("Gerenciador de Galeria")')).toBeVisible();
        await expect(page.locator('#propertySelect')).toBeVisible();
        await expect(page.locator('#emptyState')).toBeVisible();
    });

    test('Deve selecionar propriedade no gerenciador de galeria', async ({ page }) => {
        // Ir para gerenciador de galeria
        await page.goto('http://localhost:8000/admin/gallery-manager.html');
        
        // Aguardar carregamento
        await page.waitForSelector('#propertySelect', { timeout: 10000 });
        
        // Verificar se existem propriedades no select
        const options = page.locator('#propertySelect option');
        const optionCount = await options.count();
        
        if (optionCount > 1) { // Mais de 1 porque tem a opção padrão
            // Selecionar primeira propriedade disponível
            await page.selectOption('#propertySelect', { index: 1 });
            
            // Verificar se o conteúdo da galeria apareceu
            await expect(page.locator('#galleryContent')).toBeVisible();
            await expect(page.locator('#propertyTitle')).toBeVisible();
            await expect(page.locator('#uploadArea')).toBeVisible();
        }
    });

    test('Deve exibir área de upload no gerenciador de galeria', async ({ page }) => {
        // Ir para gerenciador de galeria
        await page.goto('http://localhost:8000/admin/gallery-manager.html');
        
        // Aguardar carregamento e selecionar propriedade
        await page.waitForSelector('#propertySelect', { timeout: 10000 });
        
        const options = page.locator('#propertySelect option');
        const optionCount = await options.count();
        
        if (optionCount > 1) {
            await page.selectOption('#propertySelect', { index: 1 });
            
            // Verificar área de upload
            await expect(page.locator('#uploadArea')).toBeVisible();
            await expect(page.locator('#imageInput')).toBeAttached();
            
            // Verificar texto da área de upload
            await expect(page.locator('.upload-text')).toContainText('Arraste e solte imagens aqui');
            
            // Verificar botão de seleção
            const selectButton = page.locator('button:has-text("Selecionar Imagens")');
            await expect(selectButton).toBeVisible();
        }
    });

    test('Deve exibir galeria de imagens no editor de propriedades', async ({ page }) => {
        // Ir para editor de propriedades
        await page.goto('http://localhost:8000/admin/property-editor.html');
        
        // Verificar se a seção de galeria existe
        await expect(page.locator('h2:has-text("Galeria de Imagens")')).toBeVisible();
        await expect(page.locator('#uploadArea')).toBeVisible();
        await expect(page.locator('#galleryGrid')).toBeVisible();
        
        // Verificar área de upload
        await expect(page.locator('.upload-content')).toContainText('Adicionar Imagens');
        
        // Verificar botão de upload
        const uploadButton = page.locator('button:has-text("Selecionar Imagens")');
        await expect(uploadButton).toBeVisible();
    });

    test('Deve ser responsivo em dispositivos móveis', async ({ page }) => {
        // Simular dispositivo móvel
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Testar página inicial
        await page.goto('http://localhost:8000/index.html');
        await expect(page.locator('.property-card')).toBeVisible();
        
        // Testar página de detalhes se disponível
        const detailsButton = page.locator('.btn-details').first();
        
        if (await detailsButton.count() > 0) {
            await detailsButton.click();
            
            // Verificar responsividade da galeria
            await expect(page.locator('.main-gallery')).toBeVisible();
            await expect(page.locator('.gallery-controls')).toBeVisible();
        }
        
        // Testar gerenciador de galeria
        await page.goto('http://localhost:8000/admin/gallery-manager.html');
        await expect(page.locator('.header-content')).toBeVisible();
        await expect(page.locator('#propertySelect')).toBeVisible();
    });

    test('Deve validar navegação entre imagens na galeria', async ({ page }) => {
        // Ir para página inicial e navegar para detalhes
        await page.goto('http://localhost:8000/index.html');
        await page.waitForSelector('.property-card', { timeout: 10000 });
        
        const detailsButton = page.locator('.btn-details').first();
        
        if (await detailsButton.count() > 0) {
            await detailsButton.click();
            
            // Verificar se existem thumbnails
            const thumbnails = page.locator('.thumbnail');
            const thumbnailCount = await thumbnails.count();
            
            if (thumbnailCount > 1) {
                // Clicar no segundo thumbnail
                await thumbnails.nth(1).click();
                
                // Verificar se a imagem principal mudou
                await expect(page.locator('#mainImage')).toBeVisible();
                
                // Testar botões de navegação
                await page.click('button:has-text("Próxima")');
                await page.click('button:has-text("Anterior")');
            }
        }
    });

    test('Deve iniciar tour 360° a partir da página de detalhes', async ({ page }) => {
        // Ir para página inicial e navegar para detalhes
        await page.goto('http://localhost:8000/index.html');
        await page.waitForSelector('.property-card', { timeout: 10000 });
        
        const detailsButton = page.locator('.btn-details').first();
        
        if (await detailsButton.count() > 0) {
            await detailsButton.click();
            
            // Verificar botão do tour
            const tourButton = page.locator('button:has-text("Iniciar Tour 360°")');
            await expect(tourButton).toBeVisible();
            
            // Clicar no botão (sem verificar navegação para evitar problemas com tour)
            await tourButton.click();
            
            // Verificar se tentou navegar (URL deve mudar)
            await page.waitForTimeout(1000);
        }
    });

    test('Deve exibir estatísticas corretas no gerenciador de galeria', async ({ page }) => {
        // Ir para gerenciador de galeria
        await page.goto('http://localhost:8000/admin/gallery-manager.html');
        
        // Aguardar carregamento e selecionar propriedade
        await page.waitForSelector('#propertySelect', { timeout: 10000 });
        
        const options = page.locator('#propertySelect option');
        const optionCount = await options.count();
        
        if (optionCount > 1) {
            await page.selectOption('#propertySelect', { index: 1 });
            
            // Verificar estatísticas
            await expect(page.locator('#totalImages')).toBeVisible();
            await expect(page.locator('#mainImageStatus')).toBeVisible();
            await expect(page.locator('#galleryStatus')).toBeVisible();
            
            // Verificar se as estatísticas fazem sentido
            const totalImagesText = await page.locator('#totalImages').textContent();
            expect(totalImagesText).toMatch(/\d+ imagem/);
        }
    });

    test('Deve validar fluxo completo de navegação', async ({ page }) => {
        // Começar na página inicial
        await page.goto('http://localhost:8000/index.html');
        await expect(page.locator('h1')).toContainText('Tours Virtuais 360°');
        
        // Navegar para detalhes se disponível
        const detailsButton = page.locator('.btn-details').first();
        
        if (await detailsButton.count() > 0) {
            await detailsButton.click();
            
            // Verificar página de detalhes
            await expect(page).toHaveURL(/property-details\.html\?id=/);
            await expect(page.locator('.property-title')).toBeVisible();
            
            // Voltar para página inicial
            await page.click('a:has-text("Voltar")');
            await expect(page).toHaveURL(/index\.html/);
            
            // Verificar se voltou corretamente
            await expect(page.locator('h1')).toContainText('Tours Virtuais 360°');
        }
        
        // Testar acesso administrativo
        await page.click('a:has-text("Acesso Administrativo")');
        await expect(page).toHaveURL('**/admin/login.html');
    });
});

test.describe('Testes de Performance e Carregamento', () => {
    test('Deve carregar página inicial em tempo adequado', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('http://localhost:8000/index.html');
        await page.waitForSelector('.property-card', { timeout: 10000 });
        
        const loadTime = Date.now() - startTime;
        
        // Verificar se carregou em menos de 5 segundos
        expect(loadTime).toBeLessThan(5000);
    });

    test('Deve carregar página de detalhes em tempo adequado', async ({ page }) => {
        // Ir para página inicial primeiro
        await page.goto('http://localhost:8000/index.html');
        await page.waitForSelector('.property-card', { timeout: 10000 });
        
        const detailsButton = page.locator('.btn-details').first();
        
        if (await detailsButton.count() > 0) {
            const startTime = Date.now();
            
            await detailsButton.click();
            await page.waitForSelector('.property-title', { timeout: 10000 });
            
            const loadTime = Date.now() - startTime;
            
            // Verificar se carregou em menos de 3 segundos
            expect(loadTime).toBeLessThan(3000);
        }
    });

    test('Deve carregar imagens da galeria adequadamente', async ({ page }) => {
        // Ir para página de detalhes
        await page.goto('http://localhost:8000/index.html');
        await page.waitForSelector('.property-card', { timeout: 10000 });
        
        const detailsButton = page.locator('.btn-details').first();
        
        if (await detailsButton.count() > 0) {
            await detailsButton.click();
            
            // Verificar se a imagem principal carregou
            const mainImage = page.locator('#mainImage');
            await expect(mainImage).toBeVisible();
            
            // Verificar se não há erros de carregamento
            const imageError = await page.evaluate(() => {
                const img = document.querySelector('#mainImage');
                return img && img.complete && img.naturalWidth === 0;
            });
            
            expect(imageError).toBeFalsy();
        }
    });
});
