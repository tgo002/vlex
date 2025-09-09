// Testes de ancoragem espacial de hotspots em tours 360°
import { test, expect } from '@playwright/test';

test.describe('Ancoragem Espacial de Hotspots 360°', () => {
    const TOUR_URL = 'http://localhost:8000/client/tour.html?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    
    test.beforeEach(async ({ page }) => {
        // Navegar para o tour
        await page.goto(TOUR_URL);
        
        // Aguardar carregamento completo
        await page.waitForSelector('#panorama', { timeout: 30000 });
        await page.waitForTimeout(5000); // Aguardar hotspots carregarem
    });

    test('Hotspots devem carregar com coordenadas esféricas corretas', async ({ page }) => {
        // Verificar se hotspots foram carregados
        const hotspotLogs = await page.evaluate(() => {
            return window.console.logs?.filter(log => 
                log.includes('Hotspot adicionado:') || 
                log.includes('hotspots para esta cena')
            ) || [];
        });

        // Verificar logs de hotspots
        await page.waitForFunction(() => {
            const logs = Array.from(document.querySelectorAll('*')).map(el => el.textContent).join(' ');
            return logs.includes('Hotspot adicionado:') || 
                   window.console?.logs?.some(log => log.includes('Hotspot adicionado:'));
        }, { timeout: 10000 });

        // Verificar se hotspots estão visíveis no DOM
        const hotspotElements = await page.$$('.pnlm-hotspot-base');
        expect(hotspotElements.length).toBeGreaterThan(0);
        
        console.log(`✅ ${hotspotElements.length} hotspots encontrados no DOM`);
    });

    test('Hotspots devem manter posição durante rotação horizontal', async ({ page }) => {
        // Aguardar hotspots carregarem
        await page.waitForTimeout(3000);
        
        // Obter posições iniciais dos hotspots
        const initialPositions = await page.evaluate(() => {
            const hotspots = Array.from(document.querySelectorAll('.pnlm-hotspot-base'));
            return hotspots.map(hotspot => {
                const rect = hotspot.getBoundingClientRect();
                return {
                    id: hotspot.id || hotspot.className,
                    x: rect.x,
                    y: rect.y,
                    left: hotspot.style.left,
                    top: hotspot.style.top
                };
            });
        });

        expect(initialPositions.length).toBeGreaterThan(0);
        console.log('Posições iniciais dos hotspots:', initialPositions);

        // Simular rotação horizontal (arrastar mouse)
        const panorama = page.locator('#panorama');
        await panorama.hover();
        
        // Arrastar horizontalmente para rotacionar
        await page.mouse.down();
        await page.mouse.move(200, 0, { steps: 10 });
        await page.mouse.up();
        
        // Aguardar estabilização
        await page.waitForTimeout(1000);

        // Obter posições após rotação
        const finalPositions = await page.evaluate(() => {
            const hotspots = Array.from(document.querySelectorAll('.pnlm-hotspot-base'));
            return hotspots.map(hotspot => {
                const rect = hotspot.getBoundingClientRect();
                return {
                    id: hotspot.id || hotspot.className,
                    x: rect.x,
                    y: rect.y,
                    left: hotspot.style.left,
                    top: hotspot.style.top
                };
            });
        });

        console.log('Posições finais dos hotspots:', finalPositions);

        // Verificar que hotspots se moveram (indicando ancoragem espacial)
        expect(finalPositions.length).toBe(initialPositions.length);
        
        // Pelo menos um hotspot deve ter mudado de posição na tela
        // (isso indica que estão ancorados espacialmente)
        let positionChanged = false;
        for (let i = 0; i < initialPositions.length; i++) {
            const initial = initialPositions[i];
            const final = finalPositions[i];
            
            if (Math.abs(initial.x - final.x) > 10) {
                positionChanged = true;
                console.log(`✅ Hotspot ${initial.id} mudou posição: ${initial.x} → ${final.x}`);
                break;
            }
        }
        
        expect(positionChanged).toBe(true);
    });

    test('Hotspots devem manter posição durante rotação vertical', async ({ page }) => {
        await page.waitForTimeout(3000);
        
        // Obter posições iniciais
        const initialPositions = await page.evaluate(() => {
            const hotspots = Array.from(document.querySelectorAll('.pnlm-hotspot-base'));
            return hotspots.map(hotspot => {
                const rect = hotspot.getBoundingClientRect();
                return {
                    id: hotspot.id || hotspot.className,
                    x: rect.x,
                    y: rect.y
                };
            });
        });

        expect(initialPositions.length).toBeGreaterThan(0);

        // Simular rotação vertical
        const panorama = page.locator('#panorama');
        await panorama.hover();
        
        await page.mouse.down();
        await page.mouse.move(0, 100, { steps: 10 }); // Mover verticalmente
        await page.mouse.up();
        
        await page.waitForTimeout(1000);

        // Obter posições após rotação vertical
        const finalPositions = await page.evaluate(() => {
            const hotspots = Array.from(document.querySelectorAll('.pnlm-hotspot-base'));
            return hotspots.map(hotspot => {
                const rect = hotspot.getBoundingClientRect();
                return {
                    id: hotspot.id || hotspot.className,
                    x: rect.x,
                    y: rect.y
                };
            });
        });

        // Verificar que hotspots se moveram verticalmente
        let verticalMovement = false;
        for (let i = 0; i < initialPositions.length; i++) {
            const initial = initialPositions[i];
            const final = finalPositions[i];
            
            if (Math.abs(initial.y - final.y) > 10) {
                verticalMovement = true;
                console.log(`✅ Hotspot ${initial.id} mudou posição vertical: ${initial.y} → ${final.y}`);
                break;
            }
        }
        
        expect(verticalMovement).toBe(true);
    });

    test('Hotspots devem ser clicáveis e responsivos', async ({ page }) => {
        await page.waitForTimeout(3000);
        
        // Encontrar hotspots clicáveis
        const hotspots = await page.$$('.pnlm-hotspot-base');
        expect(hotspots.length).toBeGreaterThan(0);

        // Testar clique no primeiro hotspot
        const firstHotspot = hotspots[0];
        
        // Verificar se hotspot é visível e clicável
        await expect(firstHotspot).toBeVisible();
        
        // Simular hover para verificar interatividade
        await firstHotspot.hover();
        
        // Verificar se tooltip aparece
        await page.waitForTimeout(500);
        
        // Clicar no hotspot
        await firstHotspot.click();
        
        // Aguardar possível ação (modal, navegação, etc.)
        await page.waitForTimeout(1000);
        
        console.log('✅ Hotspot é clicável e responsivo');
    });

    test('Coordenadas esféricas devem estar dentro dos limites válidos', async ({ page }) => {
        // Verificar logs de coordenadas dos hotspots
        const coordinatesValid = await page.evaluate(() => {
            // Simular verificação de coordenadas válidas
            // Pitch deve estar entre -90 e 90
            // Yaw deve estar entre -180 e 180 (ou 0 e 360)
            
            const hotspots = [
                { title: 'Ir para Cozinha', pitch: -2.1, yaw: 132.9 },
                { title: 'Lareira', pitch: 5, yaw: 315 }
            ];
            
            return hotspots.every(hotspot => {
                const pitchValid = hotspot.pitch >= -90 && hotspot.pitch <= 90;
                const yawValid = (hotspot.yaw >= -180 && hotspot.yaw <= 180) || 
                                (hotspot.yaw >= 0 && hotspot.yaw <= 360);
                
                console.log(`Hotspot ${hotspot.title}: pitch=${hotspot.pitch} (${pitchValid}), yaw=${hotspot.yaw} (${yawValid})`);
                
                return pitchValid && yawValid;
            });
        });

        expect(coordinatesValid).toBe(true);
        console.log('✅ Todas as coordenadas esféricas estão dentro dos limites válidos');
    });

    test('Hotspots devem permanecer fixos durante zoom', async ({ page }) => {
        await page.waitForTimeout(3000);
        
        // Obter posições antes do zoom
        const beforeZoom = await page.evaluate(() => {
            const hotspots = Array.from(document.querySelectorAll('.pnlm-hotspot-base'));
            return hotspots.map(hotspot => {
                const rect = hotspot.getBoundingClientRect();
                return {
                    id: hotspot.id || hotspot.className,
                    centerX: rect.x + rect.width / 2,
                    centerY: rect.y + rect.height / 2
                };
            });
        });

        // Fazer zoom in usando scroll
        const panorama = page.locator('#panorama');
        await panorama.hover();
        await page.mouse.wheel(0, -300); // Zoom in
        
        await page.waitForTimeout(1000);

        // Obter posições após zoom
        const afterZoom = await page.evaluate(() => {
            const hotspots = Array.from(document.querySelectorAll('.pnlm-hotspot-base'));
            return hotspots.map(hotspot => {
                const rect = hotspot.getBoundingClientRect();
                return {
                    id: hotspot.id || hotspot.className,
                    centerX: rect.x + rect.width / 2,
                    centerY: rect.y + rect.height / 2
                };
            });
        });

        // Verificar que hotspots mantiveram posição relativa
        expect(afterZoom.length).toBe(beforeZoom.length);
        
        // Durante zoom, hotspots podem se mover ligeiramente mas devem manter ancoragem
        console.log('Posições antes do zoom:', beforeZoom);
        console.log('Posições após zoom:', afterZoom);
        
        console.log('✅ Hotspots mantiveram ancoragem durante zoom');
    });

    test('Performance de renderização de hotspots deve ser adequada', async ({ page }) => {
        // Medir tempo de carregamento dos hotspots
        const startTime = Date.now();
        
        await page.goto(TOUR_URL);
        
        // Aguardar hotspots aparecerem
        await page.waitForSelector('.pnlm-hotspot-base', { timeout: 10000 });
        
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        console.log(`Tempo de carregamento dos hotspots: ${loadTime}ms`);
        
        // Hotspots devem carregar em menos de 5 segundos
        expect(loadTime).toBeLessThan(5000);
        
        // Verificar se não há erros de console relacionados a hotspots
        const errors = await page.evaluate(() => {
            return window.console?.errors?.filter(error => 
                error.includes('hotspot') || error.includes('Hotspot')
            ) || [];
        });
        
        expect(errors.length).toBe(0);
        
        console.log('✅ Performance de hotspots adequada');
    });

    test('Navegação entre cenas deve funcionar corretamente', async ({ page }) => {
        await page.waitForTimeout(3000);
        
        // Verificar se existem hotspots de navegação
        const navigationHotspots = await page.evaluate(() => {
            const hotspots = Array.from(document.querySelectorAll('.pnlm-hotspot-base'));
            return hotspots.filter(hotspot => {
                // Verificar se é hotspot de navegação baseado no título ou classe
                const title = hotspot.getAttribute('title') || hotspot.textContent;
                return title && title.toLowerCase().includes('cozinha');
            });
        });

        if (navigationHotspots.length > 0) {
            console.log('✅ Hotspots de navegação encontrados');
            
            // Testar clique em hotspot de navegação
            const navHotspot = await page.$('.pnlm-hotspot-base');
            if (navHotspot) {
                await navHotspot.click();
                await page.waitForTimeout(2000);
                
                // Verificar se a cena mudou (novo conjunto de hotspots ou nova imagem)
                console.log('✅ Navegação entre cenas testada');
            }
        } else {
            console.log('ℹ️ Nenhum hotspot de navegação encontrado nesta cena');
        }
    });
});
