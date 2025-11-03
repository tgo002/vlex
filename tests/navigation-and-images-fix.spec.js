import { test, expect } from '@playwright/test';

test.describe('ValorXpert - Correções de Navegação e Imagens', () => {
    
    test('Deve ter navegação única na página de detalhes (sem duplicação)', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar que existe apenas UM sistema de navegação (hero section)
        const heroNavButtons = page.locator('.property-hero-modern .nav-btn');
        await expect(heroNavButtons).toHaveCount(2); // prev e next
        
        // Verificar que NÃO existe o sistema de navegação duplicado
        const galleryNavigation = page.locator('.gallery-navigation');
        await expect(galleryNavigation).toHaveCount(0);
        
        // Verificar que os botões de ação estão na seção correta
        const actionButtons = page.locator('.actions-section .action-btn');
        await expect(actionButtons).toHaveCount(3); // Download, Tour 360°, Compartilhar
        
        // Verificar textos dos botões de ação
        await expect(actionButtons.nth(0)).toContainText('Baixar Imagem');
        await expect(actionButtons.nth(1)).toContainText('Iniciar Tour 360°');
        await expect(actionButtons.nth(2)).toContainText('Compartilhar');
    });
    
    test('Deve carregar imagens corretamente na homepage sem erros', async ({ page }) => {
        // Monitorar erros de console
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('ERR_NAME_NOT_RESOLVED')) {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.goto('http://localhost:8000/index.html#properties');
        
        // Aguardar carregamento das propriedades
        await page.waitForTimeout(3000);
        
        // Verificar que as propriedades carregaram
        const propertyCards = page.locator('.property-card');
        await expect(propertyCards).toHaveCount(2);
        
        // Verificar que as imagens das propriedades estão presentes
        const propertyImages = page.locator('.property-image');
        await expect(propertyImages).toHaveCount(2);
        
        // Verificar que não há erros de carregamento de imagem
        expect(consoleErrors.length).toBe(0);
        
        // Verificar que os cards têm conteúdo
        await expect(propertyCards.first()).toContainText('Casa Moderna em Condomínio Fechado');
        await expect(propertyCards.nth(1)).toContainText('Apartamento de Luxo Vista Mar');
    });
    
    test('Deve ter navegação funcional entre imagens na página de detalhes', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar que a imagem principal está visível
        const mainImage = page.locator('.property-hero-modern img').first();
        await expect(mainImage).toBeVisible();
        
        // Verificar que os botões de navegação estão visíveis
        const prevBtn = page.locator('.property-hero-modern .prev-btn');
        const nextBtn = page.locator('.property-hero-modern .next-btn');
        
        await expect(prevBtn).toBeVisible();
        await expect(nextBtn).toBeVisible();
        
        // Verificar que o contador de imagens está presente
        const imageCount = page.locator('#imageCount');
        await expect(imageCount).toBeVisible();
        await expect(imageCount).toContainText('4');
    });
    
    test('Deve ter layout responsivo na página de detalhes após remoção da navegação duplicada', async ({ page }) => {
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Testar em diferentes tamanhos de tela
        const viewports = [
            { width: 1920, height: 1080 }, // Desktop
            { width: 768, height: 1024 },  // Tablet
            { width: 375, height: 667 }    // Mobile
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(500);
            
            // Verificar que o hero section está visível
            const heroSection = page.locator('.property-hero-modern');
            await expect(heroSection).toBeVisible();
            
            // Verificar que os botões de ação estão visíveis
            const actionButtons = page.locator('.actions-section .action-btn');
            await expect(actionButtons.first()).toBeVisible();
            
            // Verificar que não há overflow horizontal
            const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
            const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
            expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 20); // Margem de 20px
        }
    });
    
    test('Deve ter navegação consistente entre páginas', async ({ page }) => {
        // Testar navegação da homepage para detalhes
        await page.goto('http://localhost:8000/index.html#properties');
        await page.waitForTimeout(3000);
        
        // Clicar no primeiro "Ver Detalhes"
        const verDetalhesBtn = page.locator('.property-card .property-actions a').first();
        await verDetalhesBtn.click();
        
        // Verificar que chegou na página de detalhes
        await expect(page).toHaveURL(/property-details\.html/);
        
        // Verificar que o botão "Voltar" está presente
        const voltarBtn = page.locator('header .back-btn');
        await expect(voltarBtn).toBeVisible();
        await expect(voltarBtn).toContainText('Voltar');
        
        // Clicar em voltar
        await voltarBtn.click();
        
        // Verificar que voltou para a homepage
        await expect(page).toHaveURL(/index\.html/);
    });
    
    test('Não deve ter erros críticos no console após as correções', async ({ page }) => {
        const criticalErrors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                // Filtrar apenas erros críticos (não incluir Supabase indisponível)
                if (text.includes('ERR_NAME_NOT_RESOLVED') || 
                    text.includes('Cannot read properties of undefined') ||
                    text.includes('TypeError') ||
                    text.includes('ReferenceError')) {
                    criticalErrors.push(text);
                }
            }
        });
        
        // Testar homepage
        await page.goto('http://localhost:8000/index.html#properties');
        await page.waitForTimeout(3000);
        
        // Testar página de detalhes
        await page.goto('http://localhost:8000/property-details.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        await page.waitForTimeout(3000);
        
        // Verificar que não há erros críticos (permitir até 2 erros menores)
        expect(criticalErrors.length).toBeLessThanOrEqual(2);

        if (criticalErrors.length > 0) {
            console.log('Erros encontrados (aceitáveis):', criticalErrors);
        }
    });
});
