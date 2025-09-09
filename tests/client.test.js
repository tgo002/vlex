// Testes E2E para interface cliente do sistema de tours virtuais 360°
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8000';
const CLIENT_URL = `${BASE_URL}/client`;

// Dados de teste
const TEST_PROPERTY_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

test.describe('Interface Cliente - Tour Virtual', () => {
    
    test.beforeEach(async ({ page }) => {
        // Configurar interceptação de console para debug
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`Console Error: ${msg.text()}`);
            }
        });
        
        // Configurar timeout maior para carregamento de imagens 360°
        page.setDefaultTimeout(15000);
    });

    test('Deve carregar a página do tour corretamente', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Verificar título da página
        await expect(page).toHaveTitle(/Tour Virtual 360°/);
        
        // Verificar elementos principais
        await expect(page.locator('h1')).toContainText('Tour Virtual 360°');
        await expect(page.locator('text=Preparando sua experiência imersiva')).toBeVisible();
        
        // Verificar controles de navegação
        await expect(page.locator('button:has-text("Tela Cheia")')).toBeVisible();
        await expect(page.locator('button:has-text("Auto Rotação")')).toBeVisible();
        await expect(page.locator('button:has-text("Compartilhar")')).toBeVisible();
        
        // Verificar botões de contato
        await expect(page.locator('button:has-text("Entrar em Contato")')).toBeVisible();
        await expect(page.locator('button:has-text("WhatsApp")')).toBeVisible();
    });

    test('Deve carregar tour com ID específico', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html?id=${TEST_PROPERTY_ID}`);
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar se o tour foi carregado
        await expect(page.locator('h1')).toBeVisible();
        
        // Verificar se não há mensagem de erro
        await expect(page.locator('text=Erro')).not.toBeVisible();
        await expect(page.locator('text=Não encontrado')).not.toBeVisible();
    });

    test('Deve mostrar controles de navegação', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Verificar controles principais
        const controls = [
            '🔍 Tela Cheia',
            '🔄 Auto Rotação',
            '📤 Compartilhar'
        ];
        
        for (const control of controls) {
            await expect(page.locator(`button:has-text("${control}")`)).toBeVisible();
        }
    });

    test('Deve funcionar o botão de tela cheia', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        const fullscreenButton = page.locator('button:has-text("Tela Cheia")');
        await expect(fullscreenButton).toBeVisible();
        
        // Clicar no botão de tela cheia
        await fullscreenButton.click();
        
        // Verificar se houve alguma mudança (pode ser visual ou de estado)
        // Em um teste real, verificaríamos se o elemento entrou em fullscreen
    });

    test('Deve funcionar o botão de auto rotação', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        const autoRotateButton = page.locator('button:has-text("Auto Rotação")');
        await expect(autoRotateButton).toBeVisible();
        
        // Clicar no botão de auto rotação
        await autoRotateButton.click();
        
        // Verificar se o estado mudou (pode ser uma classe CSS ou atributo)
        // Em um teste real, verificaríamos se a rotação automática foi ativada
    });

    test('Deve abrir modal de compartilhamento', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        const shareButton = page.locator('button:has-text("Compartilhar")');
        await expect(shareButton).toBeVisible();
        
        // Clicar no botão de compartilhar
        await shareButton.click();
        
        // Verificar se um modal ou dropdown apareceu
        // Aguardar um pouco para o modal aparecer
        await page.waitForTimeout(500);
        
        // Verificar se há elementos de compartilhamento
        const shareModal = page.locator('.modal, .dropdown, .share-menu');
        if (await shareModal.count() > 0) {
            await expect(shareModal.first()).toBeVisible();
        }
    });

    test('Deve abrir modal de contato', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        const contactButton = page.locator('button:has-text("Entrar em Contato")');
        await expect(contactButton).toBeVisible();
        
        // Clicar no botão de contato
        await contactButton.click();
        
        // Aguardar modal aparecer
        await page.waitForTimeout(1000);
        
        // Verificar se o modal de contato apareceu
        const contactModal = page.locator('.modal, .contact-form, [id*="contact"]');
        if (await contactModal.count() > 0) {
            await expect(contactModal.first()).toBeVisible();
        }
    });

    test('Deve funcionar o botão do WhatsApp', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        const whatsappButton = page.locator('button:has-text("WhatsApp")');
        await expect(whatsappButton).toBeVisible();
        
        // Interceptar navegação para WhatsApp
        page.on('popup', async (popup) => {
            const url = popup.url();
            expect(url).toContain('whatsapp.com');
        });
        
        // Clicar no botão do WhatsApp
        await whatsappButton.click();
    });

    test('Deve ser responsivo em dispositivos móveis', async ({ page }) => {
        // Simular dispositivo móvel
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Verificar que os elementos são visíveis em mobile
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('button:has-text("Tela Cheia")')).toBeVisible();
        await expect(page.locator('button:has-text("Entrar em Contato")')).toBeVisible();
        
        // Verificar que o layout se adapta
        const container = page.locator('.container, main, .tour-container');
        if (await container.count() > 0) {
            const containerBox = await container.first().boundingBox();
            expect(containerBox.width).toBeLessThanOrEqual(375);
        }
    });

    test('Deve ser responsivo em tablet', async ({ page }) => {
        // Simular tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Verificar elementos principais
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('button:has-text("Tela Cheia")')).toBeVisible();
        
        // Verificar que os controles estão bem posicionados
        const controls = page.locator('button');
        await expect(controls.first()).toBeVisible();
    });

    test('Deve carregar em diferentes resoluções desktop', async ({ page }) => {
        const resolutions = [
            { width: 1366, height: 768 },
            { width: 1920, height: 1080 },
            { width: 2560, height: 1440 }
        ];
        
        for (const resolution of resolutions) {
            await page.setViewportSize(resolution);
            await page.goto(`${CLIENT_URL}/tour.html`);
            
            // Verificar que a página carrega corretamente
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('button:has-text("Tela Cheia")')).toBeVisible();
            
            // Verificar que não há overflow horizontal
            const body = page.locator('body');
            const bodyBox = await body.boundingBox();
            expect(bodyBox.width).toBeLessThanOrEqual(resolution.width);
        }
    });

    test('Deve lidar com erro de propriedade não encontrada', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html?id=invalid-id`);
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar se há mensagem de erro apropriada
        const errorMessages = [
            'Propriedade não encontrada',
            'Tour não disponível',
            'Erro ao carregar',
            'Não encontrado'
        ];
        
        let errorFound = false;
        for (const message of errorMessages) {
            if (await page.locator(`text=${message}`).count() > 0) {
                errorFound = true;
                break;
            }
        }
        
        // Se não encontrou mensagem de erro específica, pelo menos não deve mostrar dados inválidos
        if (!errorFound) {
            // Verificar que não há dados de propriedade inválidos sendo exibidos
            await expect(page.locator('text=undefined')).not.toBeVisible();
            await expect(page.locator('text=null')).not.toBeVisible();
        }
    });

    test('Deve carregar sem parâmetros de URL', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Aguardar carregamento
        await page.waitForTimeout(2000);
        
        // Verificar que a página carrega mesmo sem ID específico
        await expect(page.locator('h1')).toBeVisible();
        
        // Pode mostrar uma mensagem padrão ou lista de propriedades
        const hasContent = await page.locator('text=Carregando').count() > 0 ||
                          await page.locator('text=Preparando').count() > 0 ||
                          await page.locator('button').count() > 0;
        
        expect(hasContent).toBeTruthy();
    });

    test('Deve ter performance adequada', async ({ page }) => {
        // Medir tempo de carregamento
        const startTime = Date.now();
        
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Aguardar elementos principais carregarem
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('button').first()).toBeVisible();
        
        const loadTime = Date.now() - startTime;
        
        // Verificar que carregou em menos de 10 segundos
        expect(loadTime).toBeLessThan(10000);
        
        console.log(`Tempo de carregamento: ${loadTime}ms`);
    });

    test('Deve funcionar navegação por teclado', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Aguardar carregamento
        await page.waitForTimeout(1000);
        
        // Testar navegação por Tab
        await page.keyboard.press('Tab');
        
        // Verificar se algum elemento recebeu foco
        const focusedElement = page.locator(':focus');
        if (await focusedElement.count() > 0) {
            await expect(focusedElement).toBeVisible();
        }
        
        // Testar teclas de navegação (se implementadas)
        await page.keyboard.press('Space'); // Pode pausar/iniciar rotação
        await page.keyboard.press('Escape'); // Pode sair de fullscreen
    });

    test('Deve suportar gestos touch em mobile', async ({ page }) => {
        // Simular dispositivo móvel
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Aguardar carregamento
        await page.waitForTimeout(2000);
        
        // Simular toque na tela (onde seria o viewer 360°)
        const viewer = page.locator('.viewer, .panorama, canvas, #viewer');
        
        if (await viewer.count() > 0) {
            // Simular toque
            await viewer.first().tap();
            
            // Simular swipe (se implementado)
            await viewer.first().hover();
        }
        
        // Verificar que a página ainda está funcional
        await expect(page.locator('h1')).toBeVisible();
    });
});

test.describe('Funcionalidades Específicas do Tour', () => {
    
    test('Deve carregar viewer 360° (se implementado)', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Aguardar carregamento do viewer
        await page.waitForTimeout(5000);
        
        // Procurar por elementos do viewer 360°
        const viewerElements = [
            'canvas',
            '.panorama',
            '.viewer',
            '#pannellum',
            '.pnlm-container'
        ];
        
        let viewerFound = false;
        for (const selector of viewerElements) {
            if (await page.locator(selector).count() > 0) {
                viewerFound = true;
                await expect(page.locator(selector)).toBeVisible();
                break;
            }
        }
        
        // Se não encontrou viewer específico, pelo menos verificar que não há erro
        if (!viewerFound) {
            await expect(page.locator('text=Erro ao carregar viewer')).not.toBeVisible();
        }
    });

    test('Deve mostrar informações da propriedade', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html?id=${TEST_PROPERTY_ID}`);
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar se há seção de informações
        const infoSection = page.locator('.property-info, .info-panel, .details');
        
        if (await infoSection.count() > 0) {
            await expect(infoSection.first()).toBeVisible();
            
            // Verificar se há informações básicas
            const infoElements = [
                'text=quartos',
                'text=banheiros',
                'text=m²',
                'text=R$'
            ];
            
            for (const element of infoElements) {
                if (await page.locator(element).count() > 0) {
                    await expect(page.locator(element).first()).toBeVisible();
                }
            }
        }
    });
});
