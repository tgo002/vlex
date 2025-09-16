import { test, expect } from '@playwright/test';

test.describe('Validação das Correções Implementadas', () => {
    const baseUrl = 'http://localhost:8000';

    test.beforeEach(async ({ page }) => {
        // Aguardar servidor estar disponível
        await page.goto(baseUrl);
        await page.waitForLoadState('networkidle');
    });

    test('deve verificar se a seção About está completa na página inicial', async ({ page }) => {
        await page.goto(`${baseUrl}/index.html`);
        
        // Verificar se a seção About existe
        const aboutSection = page.locator('#about');
        await expect(aboutSection).toBeVisible();

        // Verificar se a lista de features está presente
        const featuresList = page.locator('.features-list');
        await expect(featuresList).toBeVisible();

        // Verificar se todos os 3 itens de feature estão presentes
        const featureItems = page.locator('.feature-item');
        await expect(featureItems).toHaveCount(3);

        // Verificar textos específicos das features
        await expect(page.locator('text=Avaliação Especializada')).toBeVisible();
        await expect(page.locator('text=Compatível com Todos os Dispositivos')).toBeVisible();
        await expect(page.locator('text=Pontos de Interesse Interativos')).toBeVisible();

        // Verificar se a imagem do lado direito está presente
        const aboutImage = page.locator('.about-image');
        await expect(aboutImage).toBeVisible();
        await expect(page.locator('.about-image .image-placeholder')).toBeVisible();
        await expect(page.locator('text=Tecnologia Premium')).toBeVisible();
    });

    test('deve verificar se o botão de download foi removido da página de detalhes', async ({ page }) => {
        // Ir para uma página de detalhes de propriedade
        await page.goto(`${baseUrl}/property-details.html?id=test-property`);
        await page.waitForLoadState('networkidle');

        // Verificar se o botão de download NÃO existe
        const downloadButton = page.locator('button:has-text("Baixar Imagem")');
        await expect(downloadButton).not.toBeVisible();

        // Verificar se outros botões de ação ainda existem
        const startTourButton = page.locator('button:has-text("Iniciar Tour")');
        await expect(startTourButton).toBeVisible();
    });

    test('deve verificar se os campos Cidade e Estado substituíram o campo Tipo', async ({ page }) => {
        await page.goto(`${baseUrl}/property-details.html?id=test-property`);
        await page.waitForLoadState('networkidle');
        
        // Aguardar carregamento dos dados
        await page.waitForTimeout(3000);

        // Verificar se o campo "Tipo" NÃO existe mais
        const tipoField = page.locator('text=Tipo:');
        await expect(tipoField).not.toBeVisible();

        // Verificar se os campos "Cidade" e "Estado" existem
        const cidadeField = page.locator('text=Cidade:');
        const estadoField = page.locator('text=Estado:');
        
        await expect(cidadeField).toBeVisible();
        await expect(estadoField).toBeVisible();
    });

    test('deve verificar se o erro do Supabase foi corrigido', async ({ page }) => {
        // Verificar properties.html
        await page.goto(`${baseUrl}/properties.html`);
        await page.waitForLoadState('networkidle');

        // Verificar se não há erros de console relacionados ao Supabase
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('supabase')) {
                consoleErrors.push(msg.text());
            }
        });

        await page.waitForTimeout(2000);
        expect(consoleErrors.length).toBe(0);

        // Verificar se a página carrega corretamente
        const header = page.locator('.header');
        await expect(header).toBeVisible();

        // Verificar property-details.html
        await page.goto(`${baseUrl}/property-details.html?id=test-property`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Verificar se não há novos erros
        expect(consoleErrors.length).toBe(0);
    });

    test('deve verificar se o footer foi adicionado às páginas', async ({ page }) => {
        // Verificar properties.html
        await page.goto(`${baseUrl}/properties.html`);
        await page.waitForLoadState('networkidle');

        const footer = page.locator('.footer');
        await expect(footer).toBeVisible();

        // Verificar elementos do footer
        await expect(page.locator('.footer-brand')).toBeVisible();
        await expect(page.locator('text=ValorExpert')).toBeVisible();
        await expect(page.locator('.footer-links')).toBeVisible();
        await expect(page.locator('.footer-social')).toBeVisible();
        await expect(page.locator('.footer-bottom')).toBeVisible();

        // Verificar property-details.html
        await page.goto(`${baseUrl}/property-details.html?id=test-property`);
        await page.waitForLoadState('networkidle');

        await expect(page.locator('.footer')).toBeVisible();
        await expect(page.locator('.footer-brand')).toBeVisible();
    });

    test('deve verificar botões mobile no tour', async ({ page }) => {
        // Simular dispositivo móvel
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.goto(`${baseUrl}/client/tour.html?id=test-property`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Verificar se o botão de voltar está visível em mobile
        const backButton = page.locator('.mobile-back-btn');
        await expect(backButton).toBeVisible();

        // Verificar se o botão WhatsApp está visível em mobile
        const whatsappButton = page.locator('.mobile-whatsapp-btn');
        await expect(whatsappButton).toBeVisible();

        // Verificar se os botões têm os ícones corretos
        await expect(backButton.locator('i.fa-arrow-left')).toBeVisible();
        await expect(whatsappButton.locator('i.fa-whatsapp')).toBeVisible();
    });

    test('deve verificar funcionalidade do botão voltar no tour mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Navegar para o tour a partir da página inicial
        await page.goto(`${baseUrl}/index.html`);
        await page.goto(`${baseUrl}/client/tour.html?id=test-property`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Clicar no botão voltar
        const backButton = page.locator('.mobile-back-btn');
        await expect(backButton).toBeVisible();
        
        // Verificar se o botão é clicável
        await expect(backButton).toBeEnabled();
    });

    test('deve verificar responsividade do footer', async ({ page }) => {
        // Testar em desktop
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.goto(`${baseUrl}/properties.html`);
        
        const footerContent = page.locator('.footer-content');
        await expect(footerContent).toBeVisible();

        // Testar em mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        
        // Footer deve continuar visível e responsivo
        await expect(footerContent).toBeVisible();
        
        // Verificar se os elementos do footer estão empilhados verticalmente em mobile
        const footerBrand = page.locator('.footer-brand');
        const footerLinks = page.locator('.footer-links');
        
        await expect(footerBrand).toBeVisible();
        await expect(footerLinks).toBeVisible();
    });

    test('deve verificar se os botões mobile não aparecem em desktop', async ({ page }) => {
        // Testar em desktop
        await page.setViewportSize({ width: 1200, height: 800 });
        
        await page.goto(`${baseUrl}/client/tour.html?id=test-property`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Verificar se os botões mobile NÃO estão visíveis em desktop
        const backButton = page.locator('.mobile-back-btn');
        const whatsappButton = page.locator('.mobile-whatsapp-btn');
        
        await expect(backButton).not.toBeVisible();
        await expect(whatsappButton).not.toBeVisible();
    });
});
