// Setup global para testes Playwright
import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log('🚀 Iniciando setup global dos testes...');
  
  // Criar browser para setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Verificar se o servidor está rodando
    console.log('📡 Verificando servidor...');
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    
    // Criar usuário de teste se necessário
    console.log('👤 Configurando usuário de teste...');
    await setupTestUser(page);
    
    // Criar dados de teste
    console.log('📊 Criando dados de teste...');
    await setupTestData(page);
    
    console.log('✅ Setup global concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no setup global:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestUser(page) {
  try {
    // Navegar para página de registro
    await page.goto('http://localhost:8000/admin/register.html');
    
    // Verificar se já existe usuário de teste logado
    const currentUrl = page.url();
    if (currentUrl.includes('index.html')) {
      console.log('👤 Usuário de teste já está logado');
      return;
    }
    
    // Preencher formulário de registro
    await page.fill('#registerName', 'Usuário Teste');
    await page.fill('#registerEmail', 'teste@playwright.com');
    await page.fill('#registerPassword', 'senha123456');
    await page.fill('#registerConfirmPassword', 'senha123456');
    await page.fill('#registerCompany', 'Empresa Teste Playwright');
    
    // Submeter formulário
    await page.click('#registerBtn');
    
    // Aguardar redirecionamento ou erro
    await page.waitForTimeout(3000);
    
    // Se deu erro, tentar fazer login
    if (page.url().includes('register.html')) {
      console.log('👤 Tentando fazer login com usuário existente...');
      await page.goto('http://localhost:8000/admin/login.html');
      await page.fill('#loginEmail', 'teste@playwright.com');
      await page.fill('#loginPassword', 'senha123456');
      await page.click('#loginBtn');
      await page.waitForTimeout(3000);
    }
    
    console.log('👤 Usuário de teste configurado');
    
  } catch (error) {
    console.log('⚠️ Erro ao configurar usuário de teste (pode já existir):', error.message);
  }
}

async function setupTestData(page) {
  try {
    // Navegar para dashboard
    await page.goto('http://localhost:8000/admin/index.html');
    
    // Verificar se está logado
    const title = await page.title();
    if (!title.includes('Dashboard')) {
      console.log('⚠️ Usuário não está logado, pulando criação de dados de teste');
      return;
    }
    
    // Criar propriedade de teste se não existir
    await page.goto('http://localhost:8000/admin/property-editor.html');
    
    // Verificar se já existe propriedade de teste
    const existingProperty = await page.locator('text=Propriedade Teste Playwright').first();
    if (await existingProperty.isVisible()) {
      console.log('📊 Dados de teste já existem');
      return;
    }
    
    // Criar nova propriedade
    await page.click('text=Nova Propriedade');
    await page.fill('#propertyTitle', 'Propriedade Teste Playwright');
    await page.fill('#propertyDescription', 'Propriedade criada automaticamente para testes Playwright');
    await page.fill('#propertyLocation', 'São Paulo, SP');
    await page.fill('#propertyPrice', '500000');
    await page.selectOption('#propertyType', 'casa');
    await page.selectOption('#propertyStatus', 'draft');
    
    // Salvar propriedade
    await page.click('#savePropertyBtn');
    await page.waitForTimeout(2000);
    
    console.log('📊 Dados de teste criados');
    
  } catch (error) {
    console.log('⚠️ Erro ao criar dados de teste:', error.message);
  }
}

export default globalSetup;
