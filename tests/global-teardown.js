// Teardown global para testes Playwright
import { chromium } from '@playwright/test';

async function globalTeardown() {
  console.log('🧹 Iniciando limpeza global dos testes...');
  
  // Criar browser para limpeza
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Fazer login como usuário de teste
    console.log('👤 Fazendo login para limpeza...');
    await page.goto('http://localhost:8000/admin/login.html');
    await page.fill('#loginEmail', 'teste@playwright.com');
    await page.fill('#loginPassword', 'senha123456');
    await page.click('#loginBtn');
    await page.waitForTimeout(3000);
    
    // Limpar dados de teste
    console.log('🗑️ Limpando dados de teste...');
    await cleanupTestData(page);
    
    console.log('✅ Limpeza global concluída!');
    
  } catch (error) {
    console.log('⚠️ Erro na limpeza global:', error.message);
  } finally {
    await browser.close();
  }
}

async function cleanupTestData(page) {
  try {
    // Navegar para gerenciador de propriedades
    await page.goto('http://localhost:8000/admin/property-editor.html');
    
    // Procurar e excluir propriedades de teste
    const testProperties = page.locator('text=Propriedade Teste Playwright');
    const count = await testProperties.count();
    
    for (let i = 0; i < count; i++) {
      try {
        // Clicar na primeira propriedade de teste encontrada
        await testProperties.first().click();
        await page.waitForTimeout(1000);
        
        // Procurar botão de excluir
        const deleteBtn = page.locator('button:has-text("Excluir")');
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
          
          // Confirmar exclusão se houver modal
          const confirmBtn = page.locator('button:has-text("Confirmar")');
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
          }
          
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log('⚠️ Erro ao excluir propriedade de teste:', error.message);
      }
    }
    
    // Limpar leads de teste
    await page.goto('http://localhost:8000/admin/leads-manager.html');
    
    // Procurar leads com email de teste
    const testLeads = page.locator('text=teste@playwright.com');
    const leadsCount = await testLeads.count();
    
    for (let i = 0; i < leadsCount; i++) {
      try {
        // Encontrar linha do lead e botão de excluir
        const leadRow = testLeads.first().locator('xpath=ancestor::tr');
        const deleteBtn = leadRow.locator('button:has-text("Excluir")');
        
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
          await page.waitForTimeout(1000);
          
          // Confirmar exclusão
          page.on('dialog', dialog => dialog.accept());
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log('⚠️ Erro ao excluir lead de teste:', error.message);
      }
    }
    
    console.log('🗑️ Dados de teste limpos');
    
  } catch (error) {
    console.log('⚠️ Erro na limpeza de dados:', error.message);
  }
}

export default globalTeardown;
