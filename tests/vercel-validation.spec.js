import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('Validação do deploy no Vercel', () => {
    test.beforeEach(async ({ page }) => {
        // Configurar timeout maior para carregamento no Vercel
        page.setDefaultTimeout(15000);
    });

    test('Página inicial deve carregar corretamente no Vercel', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(VERCEL_URL);
        
        // Verificar se a página carregou
        await expect(page).toHaveTitle(/ValorExpert/);
        
        // Aguardar carregamento completo
        await page.waitForLoadState('networkidle');
        
        // Verificar se elementos principais estão presentes
        await expect(page.locator('.hero')).toBeVisible();
        await expect(page.locator('.about')).toBeVisible();
        await expect(page.locator('.footer')).toBeVisible();
        
        // Verificar se não há erros críticos do Supabase
        const criticalErrors = errors.filter(error => 
            error.includes('Cannot destructure property') || 
            error.includes('404') ||
            error.includes('supabase-client.js')
        );
        
        console.log('Erros encontrados:', errors);
        expect(criticalErrors).toHaveLength(0);
    });

    test('Página /properties/ deve carregar sem erro 404', async ({ page }) => {
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

        await page.goto(`${VERCEL_URL}/properties/`);
        
        // Verificar se a página carregou (não deve ser 404)
        await expect(page.locator('h1')).toContainText('Imóveis');
        
        // Aguardar carregamento completo
        await page.waitForLoadState('networkidle');
        
        // Verificar se o footer está presente
        await expect(page.locator('.footer')).toBeVisible();
        
        // Verificar se não há erro 404 no supabase-client.js
        const supabaseErrors = failedRequests.filter(req => 
            req.url.includes('supabase-client.js')
        );
        
        console.log('Requests falhando:', failedRequests);
        console.log('Erros de console:', errors);
        
        expect(supabaseErrors).toHaveLength(0);
    });

    test('Arquivo supabase-client.js deve carregar corretamente', async ({ page }) => {
        const failedRequests = [];
        
        page.on('response', response => {
            if (response.status() >= 400) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });

        await page.goto(`${VERCEL_URL}/properties/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se o arquivo supabase-client.js carregou
        const supabaseClientErrors = failedRequests.filter(req => 
            req.url.includes('shared/supabase-client.js')
        );
        
        expect(supabaseClientErrors).toHaveLength(0);
    });

    test('Página property-details deve carregar sem erros', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(`${VERCEL_URL}/property-details/`);
        
        // Aguardar carregamento completo
        await page.waitForLoadState('networkidle');
        
        // Verificar se elementos principais estão presentes
        await expect(page.locator('.property-header')).toBeVisible();
        await expect(page.locator('.footer')).toBeVisible();
        
        // Verificar se não há erros do Supabase
        const supabaseErrors = errors.filter(error => 
            error.includes('Cannot destructure property') || 
            error.includes('supabase-client.js')
        );
        
        console.log('Erros encontrados:', errors);
        expect(supabaseErrors).toHaveLength(0);
    });

    test('Tour client/tour deve carregar sem erros', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(`${VERCEL_URL}/client/tour/`);
        
        // Aguardar carregamento completo
        await page.waitForLoadState('networkidle');
        
        // Verificar se elementos do tour estão presentes
        await expect(page.locator('#panorama')).toBeVisible();
        
        // Verificar se não há erros do Supabase
        const supabaseErrors = errors.filter(error => 
            error.includes('Cannot destructure property') || 
            error.includes('supabase-client.js')
        );
        
        console.log('Erros encontrados:', errors);
        expect(supabaseErrors).toHaveLength(0);
    });

    test('Verificar responsividade mobile no Vercel', async ({ page }) => {
        // Simular dispositivo mobile
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.goto(VERCEL_URL);
        
        // Verificar se elementos se adaptam ao mobile
        await expect(page.locator('.hero')).toBeVisible();
        await expect(page.locator('.footer')).toBeVisible();
        
        // Testar tour mobile
        await page.goto(`${VERCEL_URL}/client/tour/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se botões mobile aparecem
        await expect(page.locator('.mobile-back-btn')).toBeVisible();
        await expect(page.locator('.mobile-whatsapp-btn')).toBeVisible();
    });

    test('Verificar se estilos CSS carregam corretamente', async ({ page }) => {
        const failedRequests = [];
        
        page.on('response', response => {
            if (response.status() >= 400) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });

        await page.goto(`${VERCEL_URL}/properties/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se não há CSS falhando
        const cssFailures = failedRequests.filter(req => 
            req.url.includes('.css')
        );
        
        console.log('Requests CSS falhando:', cssFailures);
        expect(cssFailures).toHaveLength(0);
        
        // Verificar se estilos estão sendo aplicados
        const heroElement = page.locator('.hero');
        if (await heroElement.count() > 0) {
            const backgroundColor = await heroElement.evaluate(el => 
                getComputedStyle(el).backgroundColor
            );
            expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)'); // Não deve ser transparente
        }
    });
});
