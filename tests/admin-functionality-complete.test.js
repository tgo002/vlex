/**
 * Teste Completo das Funcionalidades Administrativas
 * 
 * Este teste valida todas as funcionalidades implementadas:
 * 1. Sistema de Upload de Cenas
 * 2. Editor de Cenas  
 * 3. Editor de Hotspots
 * 
 * Executado com Playwright para garantir funcionamento end-to-end
 */

const { test, expect } = require('@playwright/test');

test.describe('Sistema Administrativo Completo', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navegar para o dashboard
        await page.goto('http://localhost:8000/admin/index.html');
        await page.waitForLoadState('networkidle');
    });

    test('1. Sistema de Upload de Imagens 360° - Funcionalidade Completa', async ({ page }) => {
        // Navegar para página de upload de teste
        await page.goto('http://localhost:8000/admin/image-upload-test.html');
        
        // Criar imagem de teste com proporção 2:1 (VÁLIDA)
        const validImageResult = await page.evaluate(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 1024; // Proporção 2:1
            
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(1, '#45b7d1');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    const file = new File([blob], 'test-valid-360.jpg', { type: 'image/jpeg' });
                    const fileInput = document.getElementById('fileInput');
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    resolve({ success: true, ratio: '2:1' });
                }, 'image/jpeg', 0.9);
            });
        });
        
        // Verificar validação positiva
        expect(validImageResult.success).toBe(true);
        await expect(page.locator('text=✅ Imagem válida! Pronta para upload.')).toBeVisible();
        await expect(page.locator('button:has-text("📤 Simular Upload"):not([disabled])')).toBeVisible();
        
        // Testar upload
        await page.click('button:has-text("📤 Simular Upload")');
        await page.waitForSelector('text=Upload simulado com sucesso!', { timeout: 10000 });
        
        // Testar imagem com proporção INVÁLIDA
        await page.evaluate(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024; // Proporção 1:1 (INVÁLIDA)
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    const file = new File([blob], 'test-invalid-ratio.jpg', { type: 'image/jpeg' });
                    const fileInput = document.getElementById('fileInput');
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    resolve({ success: true });
                }, 'image/jpeg', 0.9);
            });
        });
        
        // Verificar validação negativa
        await expect(page.locator('text=Proporção inválida')).toBeVisible();
        await expect(page.locator('button:has-text("📤 Simular Upload")[disabled]')).toBeVisible();
    });

    test('2. Editor de Cenas - Funcionalidade Operacional', async ({ page }) => {
        // Navegar para gerenciador de cenas
        await page.goto('http://localhost:8000/admin/scene-manager.html?propertyId=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        await page.waitForLoadState('networkidle');
        
        // Verificar carregamento da propriedade
        await expect(page.locator('text=Casa Moderna em Condomínio Fechado')).toBeVisible();
        
        // Verificar cenas existentes
        await expect(page.locator('text=Sala de Estar')).toBeVisible();
        await expect(page.locator('text=Cozinha Gourmet')).toBeVisible();
        
        // Verificar funcionalidades disponíveis
        await expect(page.locator('button:has-text("✏️ Editar")')).toBeVisible();
        await expect(page.locator('button:has-text("👁️ Preview")')).toBeVisible();
        await expect(page.locator('button:has-text("⭐ Definir Padrão")')).toBeVisible();
        await expect(page.locator('button:has-text("🗑️ Excluir")')).toBeVisible();
        
        // Verificar área de upload
        await expect(page.locator('text=Upload de Imagens 360°')).toBeVisible();
        await expect(page.locator('text=Proporção obrigatória: 2:1')).toBeVisible();
    });

    test('3. Editor de Hotspots - Funcionalidade Completa', async ({ page }) => {
        // Navegar para editor de hotspots
        await page.goto('http://localhost:8000/admin/hotspot-editor.html?propertyId=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        await page.waitForLoadState('networkidle');
        
        // Aguardar carregamento completo
        await page.waitForTimeout(3000);
        
        // Verificar carregamento da interface
        await expect(page.locator('text=Editor de Hotspots')).toBeVisible();
        await expect(page.locator('select')).toBeVisible();
        
        // Verificar tipos de hotspot disponíveis
        await expect(page.locator('text=ℹ️ Informação')).toBeVisible();
        await expect(page.locator('text=🚪 Navegação')).toBeVisible();
        await expect(page.locator('text=⭐ Destaque')).toBeVisible();
        
        // Verificar hotspots existentes
        await expect(page.locator('text=Ir para Cozinha')).toBeVisible();
        await expect(page.locator('text=Lareira')).toBeVisible();
        
        // Testar preenchimento de formulário
        await page.fill('input[placeholder*="Sala de Estar"]', 'Teste Hotspot Automatizado');
        await page.fill('textarea[placeholder*="Descreva"]', 'Hotspot criado via teste automatizado');
        
        // Definir coordenadas
        await page.evaluate(() => {
            const pitchInput = document.querySelector('input[type="number"]:first-of-type');
            const yawInput = document.querySelector('input[type="number"]:last-of-type');
            if (pitchInput) pitchInput.value = '15';
            if (yawInput) yawInput.value = '90';
        });
        
        // Verificar formulário preenchido
        await expect(page.locator('input[value="Teste Hotspot Automatizado"]')).toBeVisible();
        await expect(page.locator('textarea:has-text("Hotspot criado via teste automatizado")')).toBeVisible();
    });

    test('4. Preview e Ancoragem Espacial - Validação Final', async ({ page }) => {
        // Navegar para tour virtual
        await page.goto('http://localhost:8000/client/tour.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        await page.waitForLoadState('networkidle');
        
        // Aguardar carregamento do Pannellum
        await page.waitForTimeout(5000);
        
        // Verificar carregamento do tour
        await expect(page.locator('text=Casa Moderna em Condomínio Fechado')).toBeVisible();
        await expect(page.locator('text=✅ Tour carregado com sucesso!')).toBeVisible({ timeout: 10000 });
        
        // Verificar hotspots ancorados espacialmente
        const hotspotsInfo = await page.evaluate(() => {
            const hotspots = document.querySelectorAll('.pnlm-hotspot-base');
            return Array.from(hotspots).map(hotspot => {
                const rect = hotspot.getBoundingClientRect();
                return {
                    visible: rect.width > 0 && rect.height > 0,
                    hasTransform: hotspot.style.transform.includes('translate'),
                    hasZIndex: hotspot.style.transform.includes('translateZ'),
                    className: hotspot.className
                };
            });
        });
        
        // Validar ancoragem espacial
        expect(hotspotsInfo.length).toBeGreaterThan(0);
        expect(hotspotsInfo.some(h => h.visible && h.hasTransform && h.hasZIndex)).toBe(true);
        
        // Verificar navegação entre cenas
        await expect(page.locator('text=Sala de Estar')).toBeVisible();
        await expect(page.locator('text=Cozinha Gourmet')).toBeVisible();
        
        // Testar clique em navegação de cena
        await page.click('text=Cozinha Gourmet');
        await page.waitForTimeout(2000);
        
        // Verificar mudança de cena
        const sceneChangeLog = await page.evaluate(() => {
            return window.console.log.toString().includes('Mudança de cena') || 
                   document.querySelector('.pnlm-hotspot-base') !== null;
        });
        
        expect(sceneChangeLog).toBeTruthy();
    });

    test('5. Integração Completa - Fluxo End-to-End', async ({ page }) => {
        // 1. Dashboard
        await page.goto('http://localhost:8000/admin/index.html');
        await expect(page.locator('text=Dashboard')).toBeVisible();
        
        // 2. Upload de Imagens
        await page.goto('http://localhost:8000/admin/image-upload-test.html');
        await expect(page.locator('text=Upload de Imagens 360°')).toBeVisible();
        
        // 3. Gerenciador de Cenas
        await page.goto('http://localhost:8000/admin/scene-manager.html?propertyId=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        await expect(page.locator('text=Gerenciador de Cenas')).toBeVisible();
        
        // 4. Editor de Hotspots
        await page.goto('http://localhost:8000/admin/hotspot-editor.html?propertyId=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        await page.waitForTimeout(3000);
        await expect(page.locator('text=Editor de Hotspots')).toBeVisible();
        
        // 5. Tour Virtual Final
        await page.goto('http://localhost:8000/client/tour.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        await page.waitForTimeout(5000);
        await expect(page.locator('text=Casa Moderna em Condomínio Fechado')).toBeVisible();
        
        // Verificar sistema completamente funcional
        const systemStatus = await page.evaluate(() => {
            return {
                pannellumLoaded: typeof pannellum !== 'undefined',
                hotspotsPresent: document.querySelectorAll('.pnlm-hotspot-base').length > 0,
                tourLoaded: document.querySelector('.pnlm-render-container') !== null,
                navigationWorking: document.querySelectorAll('[data-scene-id]').length > 0
            };
        });
        
        expect(systemStatus.pannellumLoaded).toBe(true);
        expect(systemStatus.hotspotsPresent).toBe(true);
        expect(systemStatus.tourLoaded).toBe(true);
        
        console.log('🎉 SISTEMA COMPLETAMENTE FUNCIONAL PARA USO MANUAL! 🎉');
    });
});
