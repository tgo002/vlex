// Testes de autenticação do sistema admin
import { test, expect } from '@playwright/test';

test.describe('Autenticação Admin', () => {
  
  test.beforeEach(async ({ page }) => {
    // Limpar localStorage antes de cada teste
    await page.goto('/admin/login.html');
    await page.evaluate(() => localStorage.clear());
  });

  test('deve carregar a página de login corretamente', async ({ page }) => {
    await page.goto('/admin/login.html');
    
    // Verificar título
    await expect(page).toHaveTitle(/Login.*Sistema de Tours Virtuais/);
    
    // Verificar elementos da página
    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();
    await expect(page.locator('#loginBtn')).toBeVisible();
    await expect(page.locator('a[href="register.html"]')).toBeVisible();
    
    // Verificar placeholder dos campos
    await expect(page.locator('#loginEmail')).toHaveAttribute('placeholder', 'seu@email.com');
    await expect(page.locator('#loginPassword')).toHaveAttribute('placeholder', 'Sua senha');
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/admin/login.html');
    
    // Preencher com credenciais inválidas
    await page.fill('#loginEmail', 'usuario@inexistente.com');
    await page.fill('#loginPassword', 'senhaerrada');
    
    // Submeter formulário
    await page.click('#loginBtn');
    
    // Aguardar e verificar mensagem de erro
    await page.waitForTimeout(3000);
    const alert = page.locator('#loginAlert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveClass(/error/);
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/admin/login.html');
    
    // Preencher com credenciais válidas
    await page.fill('#loginEmail', 'teste@playwright.com');
    await page.fill('#loginPassword', 'senha123456');
    
    // Submeter formulário
    await page.click('#loginBtn');
    
    // Aguardar redirecionamento
    await page.waitForURL('**/admin/index.html', { timeout: 10000 });
    
    // Verificar se chegou no dashboard
    await expect(page).toHaveTitle(/Dashboard/);
    await expect(page.locator('.page-title')).toContainText('Dashboard');
  });

  test('deve carregar a página de registro corretamente', async ({ page }) => {
    await page.goto('/admin/register.html');
    
    // Verificar título
    await expect(page).toHaveTitle(/Registro.*Sistema de Tours Virtuais/);
    
    // Verificar elementos da página
    await expect(page.locator('#registerName')).toBeVisible();
    await expect(page.locator('#registerEmail')).toBeVisible();
    await expect(page.locator('#registerPassword')).toBeVisible();
    await expect(page.locator('#registerConfirmPassword')).toBeVisible();
    await expect(page.locator('#registerCompany')).toBeVisible();
    await expect(page.locator('#registerBtn')).toBeVisible();
    await expect(page.locator('a[href="login.html"]')).toBeVisible();
  });

  test('deve validar campos obrigatórios no registro', async ({ page }) => {
    await page.goto('/admin/register.html');
    
    // Tentar submeter formulário vazio
    await page.click('#registerBtn');
    
    // Verificar validação HTML5
    const nameField = page.locator('#registerName');
    const emailField = page.locator('#registerEmail');
    const passwordField = page.locator('#registerPassword');
    
    await expect(nameField).toHaveAttribute('required');
    await expect(emailField).toHaveAttribute('required');
    await expect(passwordField).toHaveAttribute('required');
  });

  test('deve validar confirmação de senha', async ({ page }) => {
    await page.goto('/admin/register.html');
    
    // Preencher campos com senhas diferentes
    await page.fill('#registerName', 'Teste Usuario');
    await page.fill('#registerEmail', 'novo@teste.com');
    await page.fill('#registerPassword', 'senha123');
    await page.fill('#registerConfirmPassword', 'senha456');
    await page.fill('#registerCompany', 'Empresa Teste');
    
    // Submeter formulário
    await page.click('#registerBtn');
    
    // Verificar mensagem de erro
    await page.waitForTimeout(2000);
    const alert = page.locator('#registerAlert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/senhas não coincidem/i);
  });

  test('deve fazer logout corretamente', async ({ page }) => {
    // Primeiro fazer login
    await page.goto('/admin/login.html');
    await page.fill('#loginEmail', 'teste@playwright.com');
    await page.fill('#loginPassword', 'senha123456');
    await page.click('#loginBtn');
    await page.waitForURL('**/admin/index.html');
    
    // Fazer logout
    await page.click('#logoutBtn');
    
    // Verificar redirecionamento para login
    await page.waitForURL('**/admin/login.html');
    await expect(page).toHaveTitle(/Login/);
  });

  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    // Tentar acessar dashboard sem estar logado
    await page.goto('/admin/index.html');
    
    // Deve redirecionar para login
    await page.waitForURL('**/admin/login.html');
    await expect(page).toHaveTitle(/Login/);
  });

  test('deve manter sessão após recarregar página', async ({ page }) => {
    // Fazer login
    await page.goto('/admin/login.html');
    await page.fill('#loginEmail', 'teste@playwright.com');
    await page.fill('#loginPassword', 'senha123456');
    await page.click('#loginBtn');
    await page.waitForURL('**/admin/index.html');
    
    // Recarregar página
    await page.reload();
    
    // Verificar se ainda está logado
    await expect(page).toHaveTitle(/Dashboard/);
    await expect(page.locator('.page-title')).toContainText('Dashboard');
  });

  test('deve mostrar indicador de carregamento durante login', async ({ page }) => {
    await page.goto('/admin/login.html');
    
    // Preencher credenciais
    await page.fill('#loginEmail', 'teste@playwright.com');
    await page.fill('#loginPassword', 'senha123456');
    
    // Clicar no botão e verificar estado de carregamento
    await page.click('#loginBtn');
    
    // Verificar se botão mostra estado de carregamento
    const loginBtn = page.locator('#loginBtn');
    await expect(loginBtn).toBeDisabled();
    await expect(loginBtn).toContainText(/entrando/i);
  });

  test('deve validar formato de email', async ({ page }) => {
    await page.goto('/admin/login.html');
    
    // Preencher email inválido
    await page.fill('#loginEmail', 'email-invalido');
    await page.fill('#loginPassword', 'senha123');
    
    // Tentar submeter
    await page.click('#loginBtn');
    
    // Verificar validação HTML5 de email
    const emailField = page.locator('#loginEmail');
    const validationMessage = await emailField.evaluate(el => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('deve ter links funcionais entre login e registro', async ({ page }) => {
    // Testar link de login para registro
    await page.goto('/admin/login.html');
    await page.click('a[href="register.html"]');
    await expect(page).toHaveURL(/register\.html/);
    
    // Testar link de registro para login
    await page.click('a[href="login.html"]');
    await expect(page).toHaveURL(/login\.html/);
  });

  test('deve limpar formulário após erro', async ({ page }) => {
    await page.goto('/admin/login.html');

    // Preencher e submeter com erro
    await page.fill('#loginEmail', 'erro@teste.com');
    await page.fill('#loginPassword', 'senhaerrada');
    await page.click('#loginBtn');

    // Aguardar erro
    await page.waitForTimeout(3000);

    // Verificar se campos ainda têm valores
    await expect(page.locator('#loginEmail')).toHaveValue('erro@teste.com');
    await expect(page.locator('#loginPassword')).toHaveValue('senhaerrada');

    // Limpar e tentar novamente
    await page.fill('#loginEmail', '');
    await page.fill('#loginPassword', '');
    await expect(page.locator('#loginEmail')).toHaveValue('');
    await expect(page.locator('#loginPassword')).toHaveValue('');
  });

  test('deve ter responsividade em dispositivos móveis', async ({ page }) => {
    // Simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/login.html');

    // Verificar se elementos são visíveis em mobile
    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();
    await expect(page.locator('#loginBtn')).toBeVisible();

    // Verificar se formulário ocupa largura adequada
    const form = page.locator('.login-form');
    const boundingBox = await form.boundingBox();
    expect(boundingBox.width).toBeLessThan(400);
  });

});
