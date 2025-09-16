import { test, expect } from '@playwright/test';

test.describe('Validação antes do deploy', () => {
    test.beforeEach(async ({ page }) => {
        // Configurar timeout maior para carregamento
        page.setDefaultTimeout(10000);
    });

    test('Página inicial deve carregar corretamente', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Verificar se a página carregou
        await expect(page).toHaveTitle(/ValorExpert/);
        
        // Verificar se não há erros de console críticos
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        // Aguardar carregamento completo
        await page.waitForLoadState('networkidle');
        
        // Verificar se elementos principais estão presentes
        await expect(page.locator('.hero')).toBeVisible();
        await expect(page.locator('.about')).toBeVisible();
        await expect(page.locator('.footer')).toBeVisible();
        
        // Verificar se não há erros críticos do Supabase
        const criticalErrors = errors.filter(error => 
            error.includes('Cannot destructure property') || 
            error.includes('supabase') ||
            error.includes('404')
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('Página properties.html deve carregar sem erros', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('http://localhost:8000/properties.html');
        
        // Verificar se a página carregou
        await expect(page.locator('h1')).toContainText('Imóveis');
        
        // Aguardar carregamento completo
        await page.waitForLoadState('networkidle');
        
        // Verificar se o footer está presente
        await expect(page.locator('.footer')).toBeVisible();
        
        // Verificar se não há erros do Supabase
        const supabaseErrors = errors.filter(error => 
            error.includes('Cannot destructure property') || 
            error.includes('supabase-client.js')
        );
        expect(supabaseErrors).toHaveLength(0);
    });

    test('Página property-details.html deve carregar sem erros', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('http://localhost:8000/property-details.html');
        
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
        expect(supabaseErrors).toHaveLength(0);
    });

    test('Tour client/tour.html deve carregar sem erros', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('http://localhost:8000/client/tour.html');
        
        // Aguardar carregamento completo
        await page.waitForLoadState('networkidle');
        
        // Verificar se elementos do tour estão presentes
        await expect(page.locator('#panorama')).toBeVisible();
        
        // Verificar se não há erros do Supabase
        const supabaseErrors = errors.filter(error => 
            error.includes('Cannot destructure property') || 
            error.includes('supabase-client.js')
        );
        expect(supabaseErrors).toHaveLength(0);
    });

    test('Verificar responsividade mobile', async ({ page }) => {
        // Simular dispositivo mobile
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.goto('http://localhost:8000');
        
        // Verificar se elementos se adaptam ao mobile
        await expect(page.locator('.hero')).toBeVisible();
        await expect(page.locator('.footer')).toBeVisible();
        
        // Testar tour mobile
        await page.goto('http://localhost:8000/client/tour.html');
        await page.waitForLoadState('networkidle');
        
        // Verificar se botões mobile aparecem
        await expect(page.locator('.mobile-back-btn')).toBeVisible();
        await expect(page.locator('.mobile-whatsapp-btn')).toBeVisible();
    });

    test('Verificar se arquivos CSS e JS carregam corretamente', async ({ page }) => {
        const failedRequests = [];
        
        page.on('response', response => {
            if (response.status() >= 400) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });

        await page.goto('http://localhost:8000/properties.html');
        await page.waitForLoadState('networkidle');
        
        // Verificar se não há requests falhando
        const criticalFailures = failedRequests.filter(req => 
            req.url.includes('.css') || 
            req.url.includes('.js') ||
            req.url.includes('supabase-client.js')
        );
        
        expect(criticalFailures).toHaveLength(0);
    });
});
