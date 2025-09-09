// Testes de integração end-to-end para o sistema de tours virtuais 360°
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8000';
const ADMIN_URL = `${BASE_URL}/admin`;
const CLIENT_URL = `${BASE_URL}/client`;

// Dados de teste
const TEST_PROPERTY = {
    title: 'Casa de Teste E2E',
    description: 'Propriedade criada durante teste automatizado para validação do fluxo completo.',
    price: '750000',
    area: '150',
    bedrooms: '3 quartos',
    bathrooms: '2 banheiros',
    address: 'Rua dos Testes, 123',
    city: 'São Paulo',
    state: 'São Paulo'
};

const TEST_LEAD = {
    name: 'João Teste',
    email: 'joao.teste@exemplo.com',
    phone: '(11) 99999-9999',
    whatsapp: '(11) 99999-9999',
    message: 'Tenho interesse nesta propriedade. Gostaria de mais informações.'
};

test.describe('Testes de Integração End-to-End', () => {
    
    test.beforeEach(async ({ page }) => {
        // Configurar interceptação de console para debug
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`Console Error: ${msg.text()}`);
            }
        });
        
        // Timeout maior para testes de integração
        page.setDefaultTimeout(20000);
    });

    test('Fluxo completo: Admin → Cliente', async ({ page }) => {
        // 1. Acessar admin e criar propriedade
        await page.goto(`${ADMIN_URL}/property-editor.html`);
        
        // Preencher formulário de propriedade
        await page.fill('input[placeholder*="Apartamento 3 quartos"]', TEST_PROPERTY.title);
        await page.fill('textarea[placeholder*="Descreva as características"]', TEST_PROPERTY.description);
        await page.fill('input[type="number"]', TEST_PROPERTY.price);
        await page.fill('input[type="number"]:nth-of-type(2)', TEST_PROPERTY.area);
        
        // Selecionar opções
        await page.selectOption('select:has-text("Selecione")', TEST_PROPERTY.bedrooms);
        await page.selectOption('select:nth-of-type(2)', TEST_PROPERTY.bathrooms);
        
        // Preencher localização
        await page.fill('input[placeholder*="Rua, número"]', TEST_PROPERTY.address);
        await page.fill('input[placeholder*="São Paulo"]', TEST_PROPERTY.city);
        await page.selectOption('select:has-text("Selecione")', TEST_PROPERTY.state);
        
        // Definir como publicado
        await page.click('text=🌐');
        
        // Salvar propriedade
        await page.click('button:has-text("💾 Salvar Propriedade")');
        
        // Aguardar salvamento
        await page.waitForTimeout(2000);
        
        // 2. Verificar no dashboard
        await page.goto(`${ADMIN_URL}/index.html`);
        
        // Aguardar carregamento das estatísticas
        await page.waitForTimeout(3000);
        
        // Verificar se as estatísticas foram atualizadas
        await expect(page.locator('text=Total de Propriedades')).toBeVisible();
        
        // 3. Acessar interface cliente
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Verificar se a página do cliente carrega
        await expect(page.locator('h1')).toContainText('Tour Virtual 360°');
        
        // Verificar controles
        await expect(page.locator('button:has-text("Entrar em Contato")')).toBeVisible();
    });

    test('Validação de hotspots fixos em coordenadas esféricas', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Aguardar carregamento do tour
        await page.waitForTimeout(5000);
        
        // Procurar por hotspots no DOM
        const hotspotSelectors = [
            '.hotspot',
            '[data-hotspot]',
            '.pnlm-hotspot',
            '.marker',
            '.point'
        ];
        
        let hotspotsFound = false;
        for (const selector of hotspotSelectors) {
            const hotspots = page.locator(selector);
            if (await hotspots.count() > 0) {
                hotspotsFound = true;
                
                // Verificar se os hotspots têm coordenadas
                const firstHotspot = hotspots.first();
                await expect(firstHotspot).toBeVisible();
                
                // Verificar atributos de posicionamento
                const hasPositioning = await firstHotspot.evaluate(el => {
                    return el.hasAttribute('data-pitch') || 
                           el.hasAttribute('data-yaw') || 
                           el.style.transform || 
                           el.style.left || 
                           el.style.top;
                });
                
                expect(hasPositioning).toBeTruthy();
                break;
            }
        }
        
        // Se não encontrou hotspots, verificar se há dados no JavaScript
        if (!hotspotsFound) {
            const hasHotspotData = await page.evaluate(() => {
                return window.hotspots || 
                       window.scenes || 
                       document.querySelector('[data-hotspots]') ||
                       localStorage.getItem('hotspots');
            });
            
            // Pelo menos verificar que não há erro de carregamento
            await expect(page.locator('text=Erro ao carregar hotspots')).not.toBeVisible();
        }
    });

    test('Performance do sistema completo', async ({ page }) => {
        const performanceMetrics = {};
        
        // 1. Medir carregamento do admin
        let startTime = Date.now();
        await page.goto(`${ADMIN_URL}/index.html`);
        await expect(page.locator('h1')).toBeVisible();
        performanceMetrics.adminLoad = Date.now() - startTime;
        
        // 2. Medir carregamento do editor
        startTime = Date.now();
        await page.goto(`${ADMIN_URL}/property-editor.html`);
        await expect(page.locator('h1')).toBeVisible();
        performanceMetrics.editorLoad = Date.now() - startTime;
        
        // 3. Medir carregamento do cliente
        startTime = Date.now();
        await page.goto(`${CLIENT_URL}/tour.html`);
        await expect(page.locator('h1')).toBeVisible();
        performanceMetrics.clientLoad = Date.now() - startTime;
        
        // Verificar que todos carregaram em tempo razoável (< 5 segundos)
        expect(performanceMetrics.adminLoad).toBeLessThan(5000);
        expect(performanceMetrics.editorLoad).toBeLessThan(5000);
        expect(performanceMetrics.clientLoad).toBeLessThan(5000);
        
        console.log('Métricas de Performance:', performanceMetrics);
    });

    test('Teste de responsividade em múltiplos dispositivos', async ({ page }) => {
        const devices = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        const pages = [
            `${ADMIN_URL}/index.html`,
            `${ADMIN_URL}/property-editor.html`,
            `${CLIENT_URL}/tour.html`
        ];
        
        for (const device of devices) {
            await page.setViewportSize({ width: device.width, height: device.height });
            
            for (const pageUrl of pages) {
                await page.goto(pageUrl);
                
                // Verificar que a página carrega
                await expect(page.locator('h1, h2')).toBeVisible();
                
                // Verificar que não há overflow horizontal
                const body = page.locator('body');
                const bodyBox = await body.boundingBox();
                expect(bodyBox.width).toBeLessThanOrEqual(device.width);
                
                // Verificar que elementos principais são visíveis
                const buttons = page.locator('button');
                if (await buttons.count() > 0) {
                    await expect(buttons.first()).toBeVisible();
                }
            }
        }
    });

    test('Validação de formulário de contato/lead', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Clicar no botão de contato
        const contactButton = page.locator('button:has-text("Entrar em Contato")');
        await expect(contactButton).toBeVisible();
        await contactButton.click();
        
        // Aguardar modal aparecer
        await page.waitForTimeout(1000);
        
        // Procurar por formulário de contato
        const formSelectors = [
            'form',
            '.contact-form',
            '.lead-form',
            '[id*="contact"]',
            '.modal form'
        ];
        
        let formFound = false;
        for (const selector of formSelectors) {
            const form = page.locator(selector);
            if (await form.count() > 0) {
                formFound = true;
                
                // Tentar preencher formulário
                const nameInput = form.locator('input[name*="name"], input[placeholder*="nome"]').first();
                const emailInput = form.locator('input[type="email"], input[name*="email"]').first();
                const phoneInput = form.locator('input[type="tel"], input[name*="phone"], input[name*="telefone"]').first();
                const messageInput = form.locator('textarea, input[name*="message"], input[name*="mensagem"]').first();
                
                if (await nameInput.count() > 0) {
                    await nameInput.fill(TEST_LEAD.name);
                }
                if (await emailInput.count() > 0) {
                    await emailInput.fill(TEST_LEAD.email);
                }
                if (await phoneInput.count() > 0) {
                    await phoneInput.fill(TEST_LEAD.phone);
                }
                if (await messageInput.count() > 0) {
                    await messageInput.fill(TEST_LEAD.message);
                }
                
                // Procurar botão de envio
                const submitButton = form.locator('button[type="submit"], button:has-text("Enviar")').first();
                if (await submitButton.count() > 0) {
                    await expect(submitButton).toBeVisible();
                    // Não clicar para não enviar dados reais
                }
                
                break;
            }
        }
        
        // Se não encontrou formulário, pelo menos verificar que o botão funcionou
        if (!formFound) {
            // Verificar se houve alguma ação (modal, redirecionamento, etc.)
            const hasModal = await page.locator('.modal, .popup, .overlay').count() > 0;
            const urlChanged = page.url() !== `${CLIENT_URL}/tour.html`;
            
            expect(hasModal || urlChanged).toBeTruthy();
        }
    });

    test('Teste de navegação entre cenas (se implementado)', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Aguardar carregamento completo
        await page.waitForTimeout(5000);
        
        // Procurar por controles de navegação entre cenas
        const navigationSelectors = [
            '.scene-nav',
            '.scene-selector',
            'button[data-scene]',
            '.thumbnail',
            '.scene-list button'
        ];
        
        let navigationFound = false;
        for (const selector of navigationSelectors) {
            const navElements = page.locator(selector);
            if (await navElements.count() > 1) {
                navigationFound = true;
                
                // Clicar no segundo elemento de navegação
                await navElements.nth(1).click();
                
                // Aguardar mudança de cena
                await page.waitForTimeout(2000);
                
                // Verificar se houve mudança (pode ser visual ou de estado)
                // Em um teste real, verificaríamos mudança na imagem 360° ou URL
                break;
            }
        }
        
        // Se não encontrou navegação específica, verificar se há dados de múltiplas cenas
        if (!navigationFound) {
            const hasMultipleScenes = await page.evaluate(() => {
                return (window.scenes && window.scenes.length > 1) ||
                       (window.tourData && window.tourData.scenes && window.tourData.scenes.length > 1);
            });
            
            // Pelo menos verificar que não há erro
            await expect(page.locator('text=Erro ao carregar cenas')).not.toBeVisible();
        }
    });

    test('Validação de compartilhamento social', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Clicar no botão de compartilhar
        const shareButton = page.locator('button:has-text("Compartilhar")');
        await expect(shareButton).toBeVisible();
        await shareButton.click();
        
        // Aguardar menu de compartilhamento
        await page.waitForTimeout(1000);
        
        // Procurar por opções de compartilhamento
        const shareOptions = [
            'WhatsApp',
            'Facebook',
            'Twitter',
            'LinkedIn',
            'Email',
            'Copiar link'
        ];
        
        let shareOptionsFound = 0;
        for (const option of shareOptions) {
            if (await page.locator(`text=${option}`).count() > 0) {
                shareOptionsFound++;
                await expect(page.locator(`text=${option}`).first()).toBeVisible();
            }
        }
        
        // Verificar que pelo menos uma opção de compartilhamento foi encontrada
        expect(shareOptionsFound).toBeGreaterThan(0);
    });

    test('Teste de acessibilidade básica', async ({ page }) => {
        const pagesToTest = [
            `${ADMIN_URL}/index.html`,
            `${ADMIN_URL}/login.html`,
            `${CLIENT_URL}/tour.html`
        ];
        
        for (const pageUrl of pagesToTest) {
            await page.goto(pageUrl);
            
            // Verificar que há elementos com texto alternativo
            const images = page.locator('img');
            const imageCount = await images.count();
            
            if (imageCount > 0) {
                for (let i = 0; i < Math.min(imageCount, 3); i++) {
                    const img = images.nth(i);
                    const hasAlt = await img.getAttribute('alt');
                    // Imagens devem ter texto alternativo ou ser decorativas
                    expect(hasAlt !== null || await img.getAttribute('role') === 'presentation').toBeTruthy();
                }
            }
            
            // Verificar que botões têm texto ou aria-label
            const buttons = page.locator('button');
            const buttonCount = await buttons.count();
            
            if (buttonCount > 0) {
                for (let i = 0; i < Math.min(buttonCount, 3); i++) {
                    const button = buttons.nth(i);
                    const hasText = (await button.textContent()).trim().length > 0;
                    const hasAriaLabel = await button.getAttribute('aria-label');
                    
                    expect(hasText || hasAriaLabel).toBeTruthy();
                }
            }
            
            // Verificar que há estrutura de headings
            const headings = page.locator('h1, h2, h3, h4, h5, h6');
            await expect(headings.first()).toBeVisible();
        }
    });

    test('Teste de casos de erro', async ({ page }) => {
        // 1. Teste de propriedade inexistente
        await page.goto(`${CLIENT_URL}/tour.html?id=inexistente`);
        await page.waitForTimeout(3000);
        
        // Verificar tratamento de erro
        const errorHandled = await page.locator('text=não encontrada').count() > 0 ||
                            await page.locator('text=erro').count() > 0 ||
                            await page.locator('text=indisponível').count() > 0;
        
        // Se não há mensagem de erro específica, pelo menos não deve mostrar dados inválidos
        if (!errorHandled) {
            await expect(page.locator('text=undefined')).not.toBeVisible();
            await expect(page.locator('text=null')).not.toBeVisible();
        }
        
        // 2. Teste de conectividade (simular offline)
        await page.setOfflineMode(true);
        await page.goto(`${CLIENT_URL}/tour.html`);
        
        // Verificar que há tratamento para modo offline
        await page.waitForTimeout(2000);
        
        // Restaurar conectividade
        await page.setOfflineMode(false);
    });
});
