import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';
const LOCALHOST_URL = 'http://localhost:8000';

test.describe('Investigação de Problemas Críticos no Vercel', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(15000);
    });

    test('🔍 Investigar erro de navegação "Ver Detalhes" no Vercel', async ({ page }) => {
        const errors = [];
        const networkRequests = [];
        const failedRequests = [];
        
        // Capturar todos os erros e requests
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        page.on('request', request => {
            networkRequests.push({
                url: request.url(),
                method: request.method()
            });
        });
        
        page.on('response', response => {
            if (response.status() >= 400) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });

        console.log('🧪 Navegando para /properties/ no Vercel...');
        await page.goto(`${VERCEL_URL}/properties/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se a página carregou
        await expect(page.locator('h1')).toContainText('Imóveis');
        console.log('✅ Página /properties/ carregou com sucesso');
        
        // Procurar botões "Ver Detalhes"
        const detailButtons = page.locator('button:has-text("Ver Detalhes"), a:has-text("Ver Detalhes")');
        const buttonCount = await detailButtons.count();
        
        console.log(`📊 Encontrados ${buttonCount} botões "Ver Detalhes"`);
        
        if (buttonCount > 0) {
            // Capturar informações do primeiro botão antes de clicar
            const firstButton = detailButtons.first();
            const buttonText = await firstButton.textContent();
            const buttonHref = await firstButton.getAttribute('href');
            const buttonOnClick = await firstButton.getAttribute('onclick');
            
            console.log('🔍 Informações do botão:');
            console.log(`  - Texto: ${buttonText}`);
            console.log(`  - href: ${buttonHref}`);
            console.log(`  - onclick: ${buttonOnClick}`);
            
            // Tentar clicar no botão
            console.log('🖱️ Clicando no botão "Ver Detalhes"...');
            
            try {
                await firstButton.click();
                
                // Aguardar navegação ou mudança de URL
                await page.waitForTimeout(3000);
                
                const currentUrl = page.url();
                console.log(`📍 URL atual após clique: ${currentUrl}`);
                
                // Verificar se houve navegação
                if (currentUrl.includes('property-details')) {
                    console.log('✅ Navegação para property-details detectada');
                    
                    // Verificar se a página carregou corretamente
                    try {
                        await page.waitForSelector('.property-header', { timeout: 5000 });
                        console.log('✅ Página property-details carregou com sucesso');
                    } catch (e) {
                        console.log('❌ Erro ao carregar property-details:', e.message);
                    }
                } else {
                    console.log('❌ Navegação não ocorreu - URL não mudou');
                }
                
            } catch (clickError) {
                console.log('❌ Erro ao clicar no botão:', clickError.message);
            }
        } else {
            console.log('❌ Nenhum botão "Ver Detalhes" encontrado');
        }
        
        // Relatório de erros
        console.log('\n📊 RELATÓRIO DE ERROS:');
        console.log('Erros de console:', errors);
        console.log('Requests falhando:', failedRequests);
        
        // Capturar screenshot para análise
        await page.screenshot({ 
            path: 'test-results/vercel-properties-page.png',
            fullPage: true 
        });
        
        console.log('📸 Screenshot salvo: test-results/vercel-properties-page.png');
    });

    test('🔍 Comparar layout do tour: Localhost vs Vercel', async ({ page }) => {
        console.log('🧪 Testando tour no Vercel...');
        
        // Primeiro testar no Vercel
        await page.goto(`${VERCEL_URL}/client/tour/`);
        await page.waitForLoadState('networkidle');
        
        // Capturar screenshot do Vercel
        await page.screenshot({ 
            path: 'test-results/vercel-tour-layout.png',
            fullPage: true 
        });
        
        console.log('📸 Screenshot Vercel salvo: test-results/vercel-tour-layout.png');
        
        // Verificar elementos principais do tour
        const panoramaExists = await page.locator('#panorama').isVisible();
        const controlsExist = await page.locator('.tour-controls').isVisible();
        const mobileButtonsExist = await page.locator('.mobile-back-btn').isVisible();
        
        console.log('🔍 Elementos do tour no Vercel:');
        console.log(`  - Panorama: ${panoramaExists}`);
        console.log(`  - Controles: ${controlsExist}`);
        console.log(`  - Botões mobile: ${mobileButtonsExist}`);
        
        // Verificar CSS carregado
        const computedStyle = await page.locator('#panorama').evaluate(el => {
            const style = getComputedStyle(el);
            return {
                width: style.width,
                height: style.height,
                position: style.position,
                backgroundColor: style.backgroundColor
            };
        });
        
        console.log('🎨 Estilos CSS do panorama:', computedStyle);
    });

    test('🔍 Testar fluxo completo de navegação no Vercel', async ({ page }) => {
        const navigationLog = [];
        
        // Monitorar mudanças de URL
        page.on('framenavigated', frame => {
            if (frame === page.mainFrame()) {
                navigationLog.push({
                    timestamp: new Date().toISOString(),
                    url: frame.url()
                });
            }
        });
        
        console.log('🧪 Iniciando teste de fluxo completo...');
        
        // Passo 1: Ir para properties
        await page.goto(`${VERCEL_URL}/properties/`);
        await page.waitForLoadState('networkidle');
        console.log('✅ Passo 1: Carregou /properties/');
        
        // Passo 2: Procurar e clicar em "Ver Detalhes"
        const detailButtons = page.locator('button:has-text("Ver Detalhes"), a:has-text("Ver Detalhes")');
        const buttonCount = await detailButtons.count();
        
        if (buttonCount > 0) {
            console.log(`✅ Passo 2: Encontrados ${buttonCount} botões "Ver Detalhes"`);
            
            // Clicar no primeiro botão
            await detailButtons.first().click();
            console.log('✅ Passo 3: Clicou no botão "Ver Detalhes"');
            
            // Aguardar navegação
            await page.waitForTimeout(3000);
            
            // Verificar URL final
            const finalUrl = page.url();
            console.log(`📍 URL final: ${finalUrl}`);
            
            // Verificar se chegou na página correta
            if (finalUrl.includes('property-details')) {
                console.log('✅ Passo 4: Navegação bem-sucedida para property-details');
                
                // Verificar se a página carregou elementos esperados
                try {
                    await page.waitForSelector('.property-header', { timeout: 5000 });
                    console.log('✅ Passo 5: Elementos da página carregaram');
                } catch (e) {
                    console.log('❌ Passo 5: Falha ao carregar elementos da página');
                }
            } else {
                console.log('❌ Passo 4: Navegação falhou - não chegou em property-details');
            }
        } else {
            console.log('❌ Passo 2: Nenhum botão "Ver Detalhes" encontrado');
        }
        
        console.log('\n📊 LOG DE NAVEGAÇÃO:');
        navigationLog.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.timestamp}: ${entry.url}`);
        });
    });

    test('🔍 Verificar recursos CSS no tour', async ({ page }) => {
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
        
        console.log('🧪 Verificando recursos CSS no tour...');
        
        await page.goto(`${VERCEL_URL}/client/tour/`);
        await page.waitForLoadState('networkidle');
        
        console.log('\n📊 RECURSOS CSS CARREGADOS:');
        cssRequests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.url} - Status: ${req.status} - Type: ${req.contentType}`);
        });
        
        if (failedCssRequests.length > 0) {
            console.log('\n❌ RECURSOS CSS FALHANDO:');
            failedCssRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.url} - Status: ${req.status}`);
            });
        } else {
            console.log('\n✅ Todos os recursos CSS carregaram com sucesso');
        }
    });
});
