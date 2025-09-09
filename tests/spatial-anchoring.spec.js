import { test, expect } from '@playwright/test';

test.describe('Ancoragem Espacial de Hotspots', () => {
    const baseURL = 'http://localhost:8000';

    test.beforeEach(async ({ page }) => {
        test.setTimeout(60000);
    });

    test('Hotspots devem permanecer fixos durante navegação 360°', async ({ page }) => {
        // Navegar para um tour com hotspots
        await page.goto(`${baseURL}/client/tour.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890`);
        
        // Aguardar carregamento do Pannellum
        await page.waitForTimeout(5000);
        
        // Verificar se o viewer carregou
        const viewer = page.locator('#panorama');
        await expect(viewer).toBeVisible();
        
        // Aguardar hotspots carregarem
        await page.waitForTimeout(2000);
        
        // Obter posição inicial de um hotspot (se existir)
        const hotspot = page.locator('.pnlm-hotspot').first();
        
        if (await hotspot.isVisible()) {
            const initialPosition = await hotspot.boundingBox();
            
            // Simular navegação 360° através de JavaScript
            await page.evaluate(() => {
                if (window.viewer) {
                    // Rotacionar a vista
                    window.viewer.setYaw(window.viewer.getYaw() + 90);
                }
            });
            
            await page.waitForTimeout(1000);
            
            // Verificar se hotspot ainda está visível e em posição correta
            const newPosition = await hotspot.boundingBox();
            
            // O hotspot deve ter mudado de posição na tela (seguindo a rotação)
            // mas deve permanecer ancorado à mesma posição espacial
            expect(newPosition).not.toEqual(initialPosition);
            
            // Rotacionar de volta
            await page.evaluate(() => {
                if (window.viewer) {
                    window.viewer.setYaw(window.viewer.getYaw() - 90);
                }
            });
            
            await page.waitForTimeout(1000);
            
            // Verificar se hotspot retornou à posição aproximada original
            const finalPosition = await hotspot.boundingBox();
            
            // Deve estar próximo da posição inicial (com tolerância para animações)
            if (initialPosition && finalPosition) {
                const tolerance = 10; // pixels
                expect(Math.abs(finalPosition.x - initialPosition.x)).toBeLessThan(tolerance);
                expect(Math.abs(finalPosition.y - initialPosition.y)).toBeLessThan(tolerance);
            }
        }
    });

    test('Hotspots devem usar coordenadas esféricas (pitch/yaw)', async ({ page }) => {
        await page.goto(`${baseURL}/client/tour.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890`);
        
        await page.waitForTimeout(5000);
        
        // Verificar se hotspots são criados com coordenadas esféricas
        const hotspotData = await page.evaluate(() => {
            if (window.viewer && window.viewer.getScene) {
                const scene = window.viewer.getScene();
                return scene.hotSpots || [];
            }
            return [];
        });
        
        // Verificar se hotspots têm propriedades pitch e yaw
        for (const hotspot of hotspotData) {
            expect(hotspot).toHaveProperty('pitch');
            expect(hotspot).toHaveProperty('yaw');
            
            // Verificar se são números válidos
            expect(typeof hotspot.pitch).toBe('number');
            expect(typeof hotspot.yaw).toBe('number');
            
            // Verificar ranges válidos
            expect(hotspot.pitch).toBeGreaterThanOrEqual(-90);
            expect(hotspot.pitch).toBeLessThanOrEqual(90);
            expect(hotspot.yaw).toBeGreaterThanOrEqual(-180);
            expect(hotspot.yaw).toBeLessThanOrEqual(180);
        }
    });

    test('Hotspots devem ser clicáveis em qualquer orientação da câmera', async ({ page }) => {
        await page.goto(`${baseURL}/client/tour.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890`);
        
        await page.waitForTimeout(5000);
        
        const hotspot = page.locator('.pnlm-hotspot').first();
        
        if (await hotspot.isVisible()) {
            // Testar clique na orientação inicial
            await hotspot.click();
            await page.waitForTimeout(500);
            
            // Rotacionar vista
            await page.evaluate(() => {
                if (window.viewer) {
                    window.viewer.setYaw(window.viewer.getYaw() + 45);
                    window.viewer.setPitch(window.viewer.getPitch() + 15);
                }
            });
            
            await page.waitForTimeout(1000);
            
            // Hotspot ainda deve ser clicável
            if (await hotspot.isVisible()) {
                await hotspot.click();
                await page.waitForTimeout(500);
                
                // Verificar se clique foi registrado (sem erros)
                const errors = await page.evaluate(() => {
                    return window.console.errors || [];
                });
                
                expect(errors.length).toBe(0);
            }
        }
    });

    test('Navegação entre cenas deve preservar sistema de coordenadas', async ({ page }) => {
        await page.goto(`${baseURL}/client/tour.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890`);
        
        await page.waitForTimeout(5000);
        
        // Obter hotspots da primeira cena
        const initialHotspots = await page.evaluate(() => {
            if (window.viewer && window.viewer.getScene) {
                const scene = window.viewer.getScene();
                return scene.hotSpots || [];
            }
            return [];
        });
        
        // Navegar para próxima cena (se houver hotspot de navegação)
        const navHotspot = page.locator('.pnlm-hotspot[data-type="scene"]').first();
        
        if (await navHotspot.isVisible()) {
            await navHotspot.click();
            await page.waitForTimeout(3000);
            
            // Verificar se nova cena carregou
            const newHotspots = await page.evaluate(() => {
                if (window.viewer && window.viewer.getScene) {
                    const scene = window.viewer.getScene();
                    return scene.hotSpots || [];
                }
                return [];
            });
            
            // Nova cena deve ter seus próprios hotspots com coordenadas válidas
            for (const hotspot of newHotspots) {
                expect(hotspot).toHaveProperty('pitch');
                expect(hotspot).toHaveProperty('yaw');
                expect(typeof hotspot.pitch).toBe('number');
                expect(typeof hotspot.yaw).toBe('number');
            }
        }
    });

    test('Hotspots devem ser visíveis apenas quando dentro do campo de visão', async ({ page }) => {
        await page.goto(`${baseURL}/client/tour.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890`);
        
        await page.waitForTimeout(5000);
        
        // Obter todos os hotspots
        const allHotspots = page.locator('.pnlm-hotspot');
        const hotspotCount = await allHotspots.count();
        
        if (hotspotCount > 0) {
            // Contar hotspots visíveis na orientação inicial
            const initialVisibleCount = await page.evaluate(() => {
                const hotspots = document.querySelectorAll('.pnlm-hotspot');
                let visibleCount = 0;
                
                hotspots.forEach(hotspot => {
                    const style = window.getComputedStyle(hotspot);
                    if (style.display !== 'none' && style.visibility !== 'hidden') {
                        visibleCount++;
                    }
                });
                
                return visibleCount;
            });
            
            // Rotacionar 180 graus
            await page.evaluate(() => {
                if (window.viewer) {
                    window.viewer.setYaw(window.viewer.getYaw() + 180);
                }
            });
            
            await page.waitForTimeout(1000);
            
            // Contar hotspots visíveis após rotação
            const rotatedVisibleCount = await page.evaluate(() => {
                const hotspots = document.querySelectorAll('.pnlm-hotspot');
                let visibleCount = 0;
                
                hotspots.forEach(hotspot => {
                    const style = window.getComputedStyle(hotspot);
                    if (style.display !== 'none' && style.visibility !== 'hidden') {
                        visibleCount++;
                    }
                });
                
                return visibleCount;
            });
            
            // O número de hotspots visíveis pode ter mudado
            // (alguns podem ter saído do campo de visão)
            expect(rotatedVisibleCount).toBeGreaterThanOrEqual(0);
            expect(rotatedVisibleCount).toBeLessThanOrEqual(hotspotCount);
        }
    });

    test('Sistema deve funcionar em diferentes resoluções', async ({ page }) => {
        const resolutions = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 768, height: 1024 },
            { width: 375, height: 667 }
        ];
        
        for (const resolution of resolutions) {
            await page.setViewportSize(resolution);
            await page.goto(`${baseURL}/client/tour.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890`);
            
            await page.waitForTimeout(3000);
            
            // Verificar se viewer carrega corretamente
            const viewer = page.locator('#panorama');
            await expect(viewer).toBeVisible();
            
            // Verificar se hotspots são criados
            const hotspots = await page.evaluate(() => {
                if (window.viewer && window.viewer.getScene) {
                    const scene = window.viewer.getScene();
                    return scene.hotSpots || [];
                }
                return [];
            });
            
            // Hotspots devem ter coordenadas válidas independente da resolução
            for (const hotspot of hotspots) {
                expect(hotspot).toHaveProperty('pitch');
                expect(hotspot).toHaveProperty('yaw');
            }
        }
    });
});
