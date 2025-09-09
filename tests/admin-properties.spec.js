// Testes de gerenciamento de propriedades
import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Propriedades', () => {
  
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/admin/login.html');
    await page.fill('#loginEmail', 'teste@playwright.com');
    await page.fill('#loginPassword', 'senha123456');
    await page.click('#loginBtn');
    await page.waitForURL('**/admin/index.html');
  });

  test('deve carregar o dashboard corretamente', async ({ page }) => {
    await page.goto('/admin/index.html');
    
    // Verificar título
    await expect(page).toHaveTitle(/Dashboard.*Sistema de Tours Virtuais/);
    
    // Verificar elementos principais
    await expect(page.locator('.page-title')).toContainText('Dashboard');
    await expect(page.locator('.stats-grid')).toBeVisible();
    await expect(page.locator('.quick-actions')).toBeVisible();
    
    // Verificar cards de estatísticas
    await expect(page.locator('.stat-card')).toHaveCount(4);
    
    // Verificar ações rápidas
    await expect(page.locator('a[href="property-editor.html"]')).toBeVisible();
    await expect(page.locator('a[href="scene-manager.html"]')).toBeVisible();
    await expect(page.locator('a[href="hotspot-editor.html"]')).toBeVisible();
    await expect(page.locator('a[href="publication-manager.html"]')).toBeVisible();
    await expect(page.locator('a[href="leads-manager.html"]')).toBeVisible();
  });

  test('deve navegar para o editor de propriedades', async ({ page }) => {
    await page.goto('/admin/index.html');
    
    // Clicar na ação rápida
    await page.click('a[href="property-editor.html"]');
    
    // Verificar navegação
    await expect(page).toHaveURL(/property-editor\.html/);
    await expect(page).toHaveTitle(/Editor de Propriedades/);
    await expect(page.locator('.page-title')).toContainText('Editor de Propriedades');
  });

  test('deve carregar o editor de propriedades corretamente', async ({ page }) => {
    await page.goto('/admin/property-editor.html');
    
    // Verificar elementos da página
    await expect(page.locator('#propertyTitle')).toBeVisible();
    await expect(page.locator('#propertyDescription')).toBeVisible();
    await expect(page.locator('#propertyLocation')).toBeVisible();
    await expect(page.locator('#propertyPrice')).toBeVisible();
    await expect(page.locator('#propertyType')).toBeVisible();
    await expect(page.locator('#propertyStatus')).toBeVisible();
    await expect(page.locator('#savePropertyBtn')).toBeVisible();
    
    // Verificar lista de propriedades
    await expect(page.locator('.properties-list')).toBeVisible();
  });

  test('deve criar uma nova propriedade', async ({ page }) => {
    await page.goto('/admin/property-editor.html');
    
    // Clicar em nova propriedade
    await page.click('text=Nova Propriedade');
    
    // Preencher formulário
    await page.fill('#propertyTitle', 'Casa Teste Playwright');
    await page.fill('#propertyDescription', 'Uma bela casa para testes automatizados');
    await page.fill('#propertyLocation', 'São Paulo, SP');
    await page.fill('#propertyPrice', '750000');
    await page.selectOption('#propertyType', 'casa');
    await page.selectOption('#propertyStatus', 'draft');
    
    // Salvar propriedade
    await page.click('#savePropertyBtn');
    
    // Aguardar confirmação
    await page.waitForTimeout(3000);
    
    // Verificar se apareceu na lista
    await expect(page.locator('text=Casa Teste Playwright')).toBeVisible();
    
    // Verificar mensagem de sucesso
    const alert = page.locator('#propertyAlert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveClass(/success/);
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/admin/property-editor.html');
    
    // Clicar em nova propriedade
    await page.click('text=Nova Propriedade');
    
    // Tentar salvar sem preencher
    await page.click('#savePropertyBtn');
    
    // Verificar validação
    const titleField = page.locator('#propertyTitle');
    await expect(titleField).toHaveAttribute('required');
    
    // Verificar se não salvou
    await page.waitForTimeout(2000);
    const alert = page.locator('#propertyAlert');
    if (await alert.isVisible()) {
      await expect(alert).toHaveClass(/error/);
    }
  });

  test('deve editar uma propriedade existente', async ({ page }) => {
    await page.goto('/admin/property-editor.html');
    
    // Procurar propriedade de teste
    const testProperty = page.locator('text=Casa Teste Playwright').first();
    if (await testProperty.isVisible()) {
      await testProperty.click();
      
      // Aguardar carregamento dos dados
      await page.waitForTimeout(2000);
      
      // Modificar título
      await page.fill('#propertyTitle', 'Casa Teste Playwright Editada');
      
      // Salvar
      await page.click('#savePropertyBtn');
      
      // Aguardar confirmação
      await page.waitForTimeout(3000);
      
      // Verificar se foi atualizada
      await expect(page.locator('text=Casa Teste Playwright Editada')).toBeVisible();
    }
  });

  test('deve filtrar propriedades por status', async ({ page }) => {
    await page.goto('/admin/property-editor.html');
    
    // Aguardar carregamento
    await page.waitForTimeout(2000);
    
    // Filtrar por rascunhos
    await page.selectOption('#statusFilter', 'draft');
    
    // Aguardar filtro
    await page.waitForTimeout(1000);
    
    // Verificar se mostra apenas rascunhos
    const properties = page.locator('.property-item');
    const count = await properties.count();
    
    if (count > 0) {
      // Verificar se todas são rascunhos
      for (let i = 0; i < count; i++) {
        const property = properties.nth(i);
        const status = property.locator('.property-status');
        await expect(status).toContainText(/rascunho/i);
      }
    }
  });

  test('deve buscar propriedades por título', async ({ page }) => {
    await page.goto('/admin/property-editor.html');
    
    // Aguardar carregamento
    await page.waitForTimeout(2000);
    
    // Buscar por "Teste"
    await page.fill('#searchFilter', 'Teste');
    
    // Aguardar busca
    await page.waitForTimeout(1000);
    
    // Verificar resultados
    const properties = page.locator('.property-item');
    const count = await properties.count();
    
    if (count > 0) {
      // Verificar se todas contêm "Teste" no título
      for (let i = 0; i < count; i++) {
        const property = properties.nth(i);
        const title = property.locator('.property-title');
        await expect(title).toContainText(/teste/i);
      }
    }
  });

  test('deve navegar para o gerenciador de cenas', async ({ page }) => {
    await page.goto('/admin/property-editor.html');
    
    // Procurar propriedade e clicar em gerenciar cenas
    const manageScenes = page.locator('text=Gerenciar Cenas').first();
    if (await manageScenes.isVisible()) {
      await manageScenes.click();
      
      // Verificar navegação
      await expect(page).toHaveURL(/scene-manager\.html/);
      await expect(page).toHaveTitle(/Gerenciador de Cenas/);
    }
  });

  test('deve carregar o gerenciador de cenas', async ({ page }) => {
    await page.goto('/admin/scene-manager.html');
    
    // Verificar elementos da página
    await expect(page.locator('.page-title')).toContainText('Gerenciador de Cenas');
    await expect(page.locator('#propertySelect')).toBeVisible();
    await expect(page.locator('.upload-area')).toBeVisible();
    await expect(page.locator('.scenes-grid')).toBeVisible();
  });

  test('deve validar upload de imagem 360°', async ({ page }) => {
    await page.goto('/admin/scene-manager.html');
    
    // Selecionar propriedade se houver
    const propertySelect = page.locator('#propertySelect');
    const options = await propertySelect.locator('option').count();
    
    if (options > 1) {
      await propertySelect.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      
      // Verificar se área de upload está ativa
      await expect(page.locator('.upload-area')).not.toHaveClass(/disabled/);
      
      // Verificar mensagens de validação
      await expect(page.locator('text=2:1')).toBeVisible(); // Aspect ratio
      await expect(page.locator('text=360°')).toBeVisible(); // Formato
    }
  });

  test('deve carregar o editor de hotspots', async ({ page }) => {
    await page.goto('/admin/hotspot-editor.html');
    
    // Verificar elementos da página
    await expect(page.locator('.page-title')).toContainText('Editor de Hotspots');
    await expect(page.locator('#propertySelect')).toBeVisible();
    await expect(page.locator('#sceneSelect')).toBeVisible();
    await expect(page.locator('#hotspotType')).toBeVisible();
    await expect(page.locator('#hotspotTitle')).toBeVisible();
    await expect(page.locator('#hotspotDescription')).toBeVisible();
  });

  test('deve carregar o gerenciador de publicações', async ({ page }) => {
    await page.goto('/admin/publication-manager.html');
    
    // Verificar elementos da página
    await expect(page.locator('.page-title')).toContainText('Gerenciador de Publicações');
    await expect(page.locator('.stats-grid')).toBeVisible();
    await expect(page.locator('#statusFilter')).toBeVisible();
    await expect(page.locator('#searchFilter')).toBeVisible();
    await expect(page.locator('.properties-table')).toBeVisible();
  });

  test('deve carregar o gerenciador de leads', async ({ page }) => {
    await page.goto('/admin/leads-manager.html');
    
    // Verificar elementos da página
    await expect(page.locator('.page-title')).toContainText('Gerenciador de Leads');
    await expect(page.locator('.stats-grid')).toBeVisible();
    await expect(page.locator('#statusFilter')).toBeVisible();
    await expect(page.locator('#interestFilter')).toBeVisible();
    await expect(page.locator('#searchFilter')).toBeVisible();
  });

  test('deve ter navegação consistente entre páginas', async ({ page }) => {
    const pages = [
      '/admin/index.html',
      '/admin/property-editor.html',
      '/admin/scene-manager.html',
      '/admin/hotspot-editor.html',
      '/admin/publication-manager.html',
      '/admin/leads-manager.html'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Verificar header
      await expect(page.locator('.header')).toBeVisible();
      
      // Verificar botão de voltar (exceto no dashboard)
      if (pagePath !== '/admin/index.html') {
        await expect(page.locator('.back-btn')).toBeVisible();
      }
      
      // Verificar botão de logout
      await expect(page.locator('#logoutBtn')).toBeVisible();
    }
  });

  test('deve ter responsividade em todas as páginas', async ({ page }) => {
    // Simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    const pages = [
      '/admin/index.html',
      '/admin/property-editor.html',
      '/admin/scene-manager.html',
      '/admin/hotspot-editor.html',
      '/admin/publication-manager.html',
      '/admin/leads-manager.html'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Verificar se header é responsivo
      const header = page.locator('.header');
      await expect(header).toBeVisible();
      
      // Verificar se conteúdo não transborda
      const container = page.locator('.container');
      if (await container.isVisible()) {
        const boundingBox = await container.boundingBox();
        expect(boundingBox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('deve manter estado de autenticação entre páginas', async ({ page }) => {
    const pages = [
      '/admin/property-editor.html',
      '/admin/scene-manager.html',
      '/admin/hotspot-editor.html',
      '/admin/publication-manager.html',
      '/admin/leads-manager.html'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Verificar se não foi redirecionado para login
      await expect(page).not.toHaveURL(/login\.html/);
      
      // Verificar se página carregou corretamente
      await expect(page.locator('.page-title')).toBeVisible();
    }
  });

});
