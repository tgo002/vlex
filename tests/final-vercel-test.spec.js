import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('Teste final do Vercel - Correção de caminhos', () => {
    test('Verificar se supabase-client.js carrega sem erro 404', async ({ page }) => {
        const failedRequests = [];
        
        page.on('response', response => {
            if (response.status() >= 400) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });

        console.log('🧪 Testando página /properties/...');
        await page.goto(`${VERCEL_URL}/properties/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se não há erro 404 no supabase-client.js
        const supabaseErrors = failedRequests.filter(req => 
            req.url.includes('supabase-client.js')
        );
        
        console.log('📊 Requests falhando:', failedRequests);
        
        if (supabaseErrors.length > 0) {
            console.log('❌ Erro 404 ainda presente:', supabaseErrors);
        } else {
            console.log('✅ supabase-client.js carregou com sucesso!');
        }
        
        expect(supabaseErrors).toHaveLength(0);
    });

    test('Verificar se tour carrega sem erros de import', async ({ page }) => {
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

        console.log('🧪 Testando tour /client/tour/...');
        await page.goto(`${VERCEL_URL}/client/tour/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se não há erros de import
        const importErrors = errors.filter(error => 
            error.includes('Loading module') || 
            error.includes('supabase-client.js') ||
            error.includes('contact-form.js') ||
            error.includes('social-share.js')
        );
        
        const jsErrors = failedRequests.filter(req => 
            req.url.includes('.js') && req.url.includes('shared')
        );
        
        console.log('📊 Erros de console:', errors);
        console.log('📊 Requests JS falhando:', jsErrors);
        
        if (importErrors.length > 0 || jsErrors.length > 0) {
            console.log('❌ Ainda há erros de import');
        } else {
            console.log('✅ Todos os imports funcionando!');
        }
        
        expect(importErrors).toHaveLength(0);
        expect(jsErrors).toHaveLength(0);
    });

    test('Verificar se property-details carrega corretamente', async ({ page }) => {
        const errors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        console.log('🧪 Testando property-details...');
        await page.goto(`${VERCEL_URL}/property-details/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se não há erros do Supabase
        const supabaseErrors = errors.filter(error => 
            error.includes('Cannot destructure property') || 
            error.includes('supabase-client.js')
        );
        
        console.log('📊 Erros encontrados:', errors);
        
        if (supabaseErrors.length > 0) {
            console.log('❌ Ainda há erros do Supabase');
        } else {
            console.log('✅ Property-details funcionando!');
        }
        
        expect(supabaseErrors).toHaveLength(0);
    });

    test('Verificar botões mobile no tour', async ({ page }) => {
        // Simular dispositivo mobile
        await page.setViewportSize({ width: 375, height: 667 });
        
        console.log('🧪 Testando botões mobile...');
        await page.goto(`${VERCEL_URL}/client/tour/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se botões mobile aparecem
        const backBtn = page.locator('.mobile-back-btn');
        const whatsappBtn = page.locator('.mobile-whatsapp-btn');
        
        const backVisible = await backBtn.isVisible();
        const whatsappVisible = await whatsappBtn.isVisible();
        
        console.log('📱 Botão voltar visível:', backVisible);
        console.log('📱 Botão WhatsApp visível:', whatsappVisible);
        
        if (backVisible && whatsappVisible) {
            console.log('✅ Botões mobile funcionando!');
        } else {
            console.log('❌ Problemas com botões mobile');
        }
        
        await expect(backBtn).toBeVisible();
        await expect(whatsappBtn).toBeVisible();
    });

    test('Teste geral de funcionamento', async ({ page }) => {
        console.log('🧪 Teste geral do site...');
        
        // Testar página inicial
        await page.goto(VERCEL_URL);
        await expect(page).toHaveTitle(/ValorExpert/);
        console.log('✅ Página inicial OK');
        
        // Testar properties
        await page.goto(`${VERCEL_URL}/properties/`);
        await expect(page.locator('h1')).toContainText('Imóveis');
        console.log('✅ Página properties OK');
        
        // Testar property-details
        await page.goto(`${VERCEL_URL}/property-details/`);
        await expect(page.locator('.property-header')).toBeVisible();
        console.log('✅ Página property-details OK');
        
        // Testar tour
        await page.goto(`${VERCEL_URL}/client/tour/`);
        await expect(page.locator('#panorama')).toBeVisible();
        console.log('✅ Tour OK');
        
        console.log('🎉 Todos os testes passaram!');
    });
});
