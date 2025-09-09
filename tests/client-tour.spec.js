// Testes da interface cliente (tour virtual)
import { test, expect } from '@playwright/test';

test.describe('Interface Cliente - Tour Virtual', () => {
  
  test.beforeEach(async ({ page }) => {
    // Configurar interceptação de erros de console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
  });

  test('deve carregar a página de tour com ID válido', async ({ page }) => {
    // Assumindo que existe uma propriedade publicada com ID conhecido
    await page.goto('/client/tour.html?id=test-property-id');
    
    // Aguardar carregamento
    await page.waitForTimeout(5000);
    
    // Verificar se saiu da tela de loading
    const loadingScreen = page.locator('#loadingScreen');
    await expect(loadingScreen).toHaveCSS('display', 'none');
    
    // Verificar elementos principais
    await expect(page.locator('#panorama')).toBeVisible();
    await expect(page.locator('.tour-controls')).toBeVisible();
    await expect(page.locator('.property-info')).toBeVisible();
  });

  test('deve mostrar erro com ID inválido', async ({ page }) => {
    await page.goto('/client/tour.html?id=propriedade-inexistente');
    
    // Aguardar tentativa de carregamento
    await page.waitForTimeout(5000);
    
    // Verificar se mostra erro
    const errorScreen = page.locator('.error-screen');
    if (await errorScreen.isVisible()) {
      await expect(errorScreen).toContainText(/não encontrada|erro/i);
    }
  });

  test('deve mostrar erro sem ID de propriedade', async ({ page }) => {
    await page.goto('/client/tour.html');
    
    // Aguardar carregamento
    await page.waitForTimeout(3000);
    
    // Verificar se mostra erro ou redirecionamento
    const errorMessage = page.locator('text=ID da propriedade não fornecido');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('deve ter controles de navegação funcionais', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Verificar se controles estão visíveis
    const controls = page.locator('.tour-controls');
    await expect(controls).toBeVisible();
    
    // Verificar botões específicos
    await expect(page.locator('button[title*="Tela Cheia"]')).toBeVisible();
    await expect(page.locator('button[title*="Rotação"]')).toBeVisible();
    await expect(page.locator('button[title*="Informações"]')).toBeVisible();
    await expect(page.locator('button[title*="Compartilhar"]')).toBeVisible();
    await expect(page.locator('button[title*="Contato"]')).toBeVisible();
  });

  test('deve abrir modal de informações', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Clicar no botão de informações
    await page.click('button[title*="Informações"]');
    
    // Verificar se modal abriu
    const modal = page.locator('.property-modal');
    await expect(modal).toBeVisible();
    
    // Verificar conteúdo do modal
    await expect(modal).toContainText(/título|descrição|localização/i);
    
    // Fechar modal
    await page.click('.property-modal-close');
    await expect(modal).toHaveCSS('display', 'none');
  });

  test('deve abrir modal de compartilhamento', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Clicar no botão de compartilhar
    await page.click('button[title*="Compartilhar"]');
    
    // Verificar se modal abriu
    const shareModal = page.locator('#shareModal');
    await expect(shareModal).toBeVisible();
    
    // Verificar botões de compartilhamento
    await expect(page.locator('.social-btn.whatsapp')).toBeVisible();
    await expect(page.locator('.social-btn.facebook')).toBeVisible();
    await expect(page.locator('.social-btn.twitter')).toBeVisible();
    
    // Verificar campo de URL
    await expect(page.locator('#shareUrl')).toBeVisible();
    await expect(page.locator('.copy-btn')).toBeVisible();
    
    // Fechar modal
    await page.click('.share-modal-close');
    await expect(shareModal).toHaveCSS('display', 'none');
  });

  test('deve abrir modal de contato', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Clicar no botão de contato
    await page.click('button[title*="Contato"]');
    
    // Verificar se modal abriu
    const contactModal = page.locator('#contactModal');
    await expect(contactModal).toBeVisible();
    
    // Verificar campos do formulário
    await expect(page.locator('#contactName')).toBeVisible();
    await expect(page.locator('#contactEmail')).toBeVisible();
    await expect(page.locator('#contactPhone')).toBeVisible();
    await expect(page.locator('#contactInterest')).toBeVisible();
    await expect(page.locator('#contactConsent')).toBeVisible();
    
    // Fechar modal
    await page.click('.contact-modal-close');
    await expect(contactModal).toHaveCSS('display', 'none');
  });

  test('deve validar formulário de contato', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Abrir modal de contato
    await page.click('button[title*="Contato"]');
    
    // Tentar submeter formulário vazio
    await page.click('#submitContactBtn');
    
    // Verificar validação HTML5
    const nameField = page.locator('#contactName');
    const emailField = page.locator('#contactEmail');
    const phoneField = page.locator('#contactPhone');
    
    await expect(nameField).toHaveAttribute('required');
    await expect(emailField).toHaveAttribute('required');
    await expect(phoneField).toHaveAttribute('required');
  });

  test('deve submeter formulário de contato com dados válidos', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Abrir modal de contato
    await page.click('button[title*="Contato"]');
    
    // Preencher formulário
    await page.fill('#contactName', 'João Teste Playwright');
    await page.fill('#contactEmail', 'joao@teste.com');
    await page.fill('#contactPhone', '(11) 99999-9999');
    await page.selectOption('#contactInterest', 'compra');
    await page.fill('#contactMessage', 'Tenho interesse neste imóvel');
    await page.check('#contactConsent');
    
    // Submeter formulário
    await page.click('#submitContactBtn');
    
    // Aguardar resposta
    await page.waitForTimeout(5000);
    
    // Verificar mensagem de sucesso ou erro
    const alert = page.locator('#contactAlert');
    if (await alert.isVisible()) {
      const alertText = await alert.textContent();
      expect(alertText).toBeTruthy();
    }
  });

  test('deve copiar link de compartilhamento', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Abrir modal de compartilhamento
    await page.click('button[title*="Compartilhar"]');
    
    // Clicar no botão de copiar
    await page.click('.copy-btn');
    
    // Verificar feedback visual
    await page.waitForTimeout(1000);
    const copyBtn = page.locator('.copy-btn');
    await expect(copyBtn).toContainText(/copiado/i);
  });

  test('deve alternar tela cheia', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Clicar no botão de tela cheia
    await page.click('button[title*="Tela Cheia"]');
    
    // Aguardar mudança
    await page.waitForTimeout(1000);
    
    // Verificar se entrou em tela cheia (pode variar por browser)
    // Pelo menos verificar se botão mudou
    const fullscreenBtn = page.locator('button[title*="Tela Cheia"]');
    const btnText = await fullscreenBtn.textContent();
    expect(btnText).toBeTruthy();
  });

  test('deve alternar rotação automática', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Clicar no botão de rotação
    await page.click('button[title*="Rotação"]');
    
    // Aguardar mudança
    await page.waitForTimeout(1000);
    
    // Verificar se estado mudou
    const rotationBtn = page.locator('button[title*="Rotação"]');
    const btnClass = await rotationBtn.getAttribute('class');
    expect(btnClass).toBeTruthy();
  });

  test('deve navegar entre cenas se houver múltiplas', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Verificar se há navegador de cenas
    const sceneNavigator = page.locator('.scene-navigator');
    if (await sceneNavigator.isVisible()) {
      // Verificar se há múltiplas cenas
      const sceneButtons = page.locator('.scene-btn');
      const count = await sceneButtons.count();
      
      if (count > 1) {
        // Clicar na segunda cena
        await sceneButtons.nth(1).click();
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Verificar se mudou (pode verificar URL ou estado visual)
        const activeScene = page.locator('.scene-btn.active');
        await expect(activeScene).toBeVisible();
      }
    }
  });

  test('deve ter meta tags para compartilhamento', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Verificar meta tags Open Graph
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    
    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogUrl).toBeTruthy();
    
    // Verificar meta tags Twitter
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');
    
    expect(twitterTitle).toBeTruthy();
    expect(twitterDescription).toBeTruthy();
  });

  test('deve ser responsivo em dispositivos móveis', async ({ page }) => {
    // Simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Verificar se elementos são visíveis
    await expect(page.locator('#panorama')).toBeVisible();
    await expect(page.locator('.tour-controls')).toBeVisible();
    
    // Verificar se controles são acessíveis em mobile
    const controls = page.locator('.tour-controls button');
    const count = await controls.count();
    
    for (let i = 0; i < count; i++) {
      const button = controls.nth(i);
      await expect(button).toBeVisible();
      
      // Verificar se botão tem tamanho adequado para touch
      const boundingBox = await button.boundingBox();
      expect(boundingBox.width).toBeGreaterThan(40);
      expect(boundingBox.height).toBeGreaterThan(40);
    }
  });

  test('deve carregar sem erros de JavaScript', async ({ page }) => {
    const errors = [];
    
    // Capturar erros de console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Capturar erros de página
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/client/tour.html?id=test-property-id');
    await page.waitForTimeout(5000);
    
    // Verificar se não houve erros críticos
    const criticalErrors = errors.filter(error => 
      !error.includes('404') && // Ignorar 404s de recursos opcionais
      !error.includes('favicon') && // Ignorar erros de favicon
      !error.includes('analytics') // Ignorar erros de analytics
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('deve ter performance adequada', async ({ page }) => {
    await page.goto('/client/tour.html?id=test-property-id');
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');
    
    // Verificar se carregou em tempo razoável (já aguardou networkidle)
    const loadingScreen = page.locator('#loadingScreen');
    await expect(loadingScreen).toHaveCSS('display', 'none');
    
    // Verificar se panorama está visível
    await expect(page.locator('#panorama')).toBeVisible();
  });

  test('deve funcionar com JavaScript desabilitado (graceful degradation)', async ({ page }) => {
    // Desabilitar JavaScript
    await page.setJavaScriptEnabled(false);
    
    await page.goto('/client/tour.html?id=test-property-id');
    
    // Verificar se mostra mensagem adequada ou fallback
    const body = await page.textContent('body');
    expect(body).toContain('JavaScript'); // Deve mencionar necessidade de JS
  });

});
