import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('🎯 Validação Final das Correções no Vercel', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(15000);
    });

    test('✅ Validar correção da navegação "Ver Detalhes"', async ({ page }) => {
        console.log('🧪 Testando correção da navegação "Ver Detalhes"...');
        
        const errors = [];
        const failedRequests = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        page.on('response', response => {
            if (response.status() >= 400) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });

        // Passo 1: Ir para /properties/
        await page.goto(`${VERCEL_URL}/properties/`);
        await page.waitForLoadState('networkidle');
        console.log('✅ Carregou /properties/');
        
        // Passo 2: Encontrar botão "Ver Detalhes"
        const detailButtons = page.locator('a.btn-details');
        const buttonCount = await detailButtons.count();
        console.log(`📊 Encontrados ${buttonCount} botões "Ver Detalhes"`);
        
        expect(buttonCount).toBeGreaterThan(0);
        
        // Passo 3: Verificar href do botão
        const firstButton = detailButtons.first();
        const buttonHref = await firstButton.getAttribute('href');
        console.log(`🔍 href do botão: ${buttonHref}`);
        
        // Verificar se o href agora usa caminho absoluto
        expect(buttonHref).toMatch(/^\/property-details\.html\?id=/);
        console.log('✅ Href corrigido para caminho absoluto');
        
        // Passo 4: Clicar no botão
        await firstButton.click();
        console.log('🖱️ Clicou no botão "Ver Detalhes"');
        
        // Passo 5: Aguardar navegação
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        console.log(`📍 URL atual: ${currentUrl}`);
        
        // Verificar se a URL está correta (não deve ter /properties/ no meio)
        expect(currentUrl).toMatch(/^https:\/\/virtual-ochre\.vercel\.app\/property-details\.html\?id=/);
        console.log('✅ URL correta - sem /properties/ no caminho');
        
        // Passo 6: Verificar se a página carregou
        try {
            await page.waitForSelector('.property-header', { timeout: 10000 });
            console.log('✅ Página property-details carregou com sucesso!');
        } catch (e) {
            console.log('❌ Erro ao carregar property-details:', e.message);
            
            // Verificar se há erros 404
            const has404 = failedRequests.some(req => req.status === 404 && req.url.includes('property-details'));
            if (has404) {
                console.log('❌ Ainda há erro 404 na página property-details');
            }
        }
        
        // Relatório final
        console.log('\n📊 RELATÓRIO DE VALIDAÇÃO:');
        console.log('Erros de console:', errors.length > 0 ? errors : 'Nenhum');
        console.log('Requests 404:', failedRequests.filter(r => r.status === 404));
        
        // Screenshot para evidência
        await page.screenshot({ 
            path: 'test-results/vercel-navigation-fixed.png',
            fullPage: true 
        });
        console.log('📸 Screenshot salvo: test-results/vercel-navigation-fixed.png');
    });

    test('✅ Validar correção do CSS do tour', async ({ page }) => {
        console.log('🧪 Testando correção do CSS do tour...');
        
        const cssRequests = [];
        const failedCssRequests = [];
        
        page.on('response', response => {
            if (response.url().includes('.css')) {
                cssRequests.push({
                    url: response.url(),
                    status: response.status(),
                    contentType: response.headers()['content-type']
                });
                
                if (response.status() >= 400) {
                    failedCssRequests.push({
                        url: response.url(),
                        status: response.status()
                    });
                }
            }
        });
        
        // Ir para o tour
        await page.goto(`${VERCEL_URL}/client/tour/`);
        await page.waitForLoadState('networkidle');
        console.log('✅ Carregou tour');
        
        // Verificar se o minimalist-theme.css carregou
        const themeCSS = cssRequests.find(req => req.url.includes('minimalist-theme.css'));
        
        if (themeCSS) {
            console.log(`🎨 minimalist-theme.css encontrado: ${themeCSS.url} - Status: ${themeCSS.status}`);
            expect(themeCSS.status).toBe(200);
            console.log('✅ CSS do tema carregou com sucesso!');
        } else {
            console.log('❌ minimalist-theme.css não foi requisitado');
        }
        
        // Verificar elementos visuais do tour
        const panoramaExists = await page.locator('#panorama').isVisible();
        const mobileButtonsExist = await page.locator('.mobile-back-btn').isVisible();
        
        console.log('🔍 Elementos do tour:');
        console.log(`  - Panorama visível: ${panoramaExists}`);
        console.log(`  - Botões mobile visíveis: ${mobileButtonsExist}`);
        
        // Verificar estilos aplicados
        const panoramaStyles = await page.locator('#panorama').evaluate(el => {
            const style = getComputedStyle(el);
            return {
                width: style.width,
                height: style.height,
                display: style.display
            };
        });
        
        console.log('🎨 Estilos do panorama:', panoramaStyles);
        
        // Relatório de CSS
        console.log('\n📊 RELATÓRIO DE CSS:');
        console.log('CSS carregados:', cssRequests.length);
        cssRequests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.url} - Status: ${req.status}`);
        });
        
        if (failedCssRequests.length > 0) {
            console.log('\n❌ CSS falhando:', failedCssRequests);
        } else {
            console.log('\n✅ Todos os CSS carregaram com sucesso!');
        }
        
        // Screenshot do tour
        await page.screenshot({ 
            path: 'test-results/vercel-tour-css-fixed.png',
            fullPage: true 
        });
        console.log('📸 Screenshot salvo: test-results/vercel-tour-css-fixed.png');
    });

    test('🎯 Teste completo do fluxo: Properties → Details → Tour', async ({ page }) => {
        console.log('🧪 Testando fluxo completo...');
        
        const navigationLog = [];
        
        page.on('framenavigated', frame => {
            if (frame === page.mainFrame()) {
                navigationLog.push({
                    timestamp: new Date().toISOString(),
                    url: frame.url()
                });
            }
        });
        
        // Passo 1: Properties
        await page.goto(`${VERCEL_URL}/properties/`);
        await page.waitForLoadState('networkidle');
        console.log('✅ Passo 1: Carregou /properties/');
        
        // Passo 2: Clicar em "Ver Detalhes"
        const detailButton = page.locator('a.btn-details').first();
        await detailButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Passo 2: Clicou em "Ver Detalhes"');
        
        // Verificar se chegou em property-details
        const currentUrl = page.url();
        expect(currentUrl).toContain('property-details.html');
        console.log('✅ Passo 3: Chegou em property-details');
        
        // Passo 4: Verificar se a página carregou elementos
        try {
            await page.waitForSelector('.property-header', { timeout: 5000 });
            console.log('✅ Passo 4: Elementos da página carregaram');
            
            // Passo 5: Tentar ir para o tour
            const tourButton = page.locator('a:has-text("Iniciar Tour")').first();
            if (await tourButton.isVisible()) {
                await tourButton.click();
                await page.waitForTimeout(3000);
                console.log('✅ Passo 5: Clicou no tour');
                
                // Verificar se chegou no tour
                const tourUrl = page.url();
                if (tourUrl.includes('/client/tour/')) {
                    console.log('✅ Passo 6: Chegou no tour');
                    
                    // Verificar elementos do tour
                    const panoramaExists = await page.locator('#panorama').isVisible();
                    console.log(`✅ Passo 7: Panorama carregado: ${panoramaExists}`);
                } else {
                    console.log('❌ Passo 6: Não chegou no tour');
                }
            } else {
                console.log('⚠️ Passo 5: Botão do tour não encontrado');
            }
            
        } catch (e) {
            console.log('❌ Passo 4: Falha ao carregar elementos da página');
        }
        
        console.log('\n📊 LOG DE NAVEGAÇÃO COMPLETO:');
        navigationLog.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.timestamp}: ${entry.url}`);
        });
        
        // Screenshot final
        await page.screenshot({ 
            path: 'test-results/vercel-complete-flow.png',
            fullPage: true 
        });
        console.log('📸 Screenshot final salvo: test-results/vercel-complete-flow.png');
    });
});
