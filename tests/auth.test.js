// Testes de autenticação para o sistema de tours virtuais 360°
import { test, expect } from '@playwright/test';

// Configurações de teste
const BASE_URL = 'http://localhost:8000';
const ADMIN_URL = `${BASE_URL}/admin`;

// Dados de teste
const TEST_USER = {
    email: 'teste@exemplo.com',
    password: 'senha123456',
    firstName: 'João',
    lastName: 'Silva',
    company: 'Imobiliária Teste'
};

test.describe('Sistema de Autenticação', () => {
    
    test.beforeEach(async ({ page }) => {
        // Configurar interceptação de console para debug
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`Console Error: ${msg.text()}`);
            }
        });
    });

    test('Deve carregar a página de login corretamente', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/login.html`);
        
        // Verificar título da página
        await expect(page).toHaveTitle(/Login.*Tours Virtuais 360°/);
        
        // Verificar elementos principais
        await expect(page.locator('h2')).toContainText('Tours Virtuais 360°');
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        
        // Verificar links
        await expect(page.locator('a[href="register.html"]')).toBeVisible();
    });

    test('Deve mostrar erro para campos vazios', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/login.html`);
        
        // Tentar submeter formulário vazio
        await page.click('button[type="submit"]');
        
        // Verificar validação HTML5
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        
        await expect(emailInput).toHaveAttribute('required');
        await expect(passwordInput).toHaveAttribute('required');
    });

    test('Deve validar formato de email', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/login.html`);
        
        // Inserir email inválido
        await page.fill('input[type="email"]', 'email-invalido');
        await page.fill('input[type="password"]', 'senha123');
        await page.click('button[type="submit"]');
        
        // Verificar que o formulário não foi submetido devido à validação
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('Deve alternar visibilidade da senha', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/login.html`);
        
        const passwordInput = page.locator('input[type="password"]');
        const toggleButton = page.locator('.password-toggle');
        
        // Verificar que a senha está oculta inicialmente
        await expect(passwordInput).toHaveAttribute('type', 'password');
        
        // Clicar no botão de alternar
        await toggleButton.click();
        
        // Verificar que a senha agora está visível
        await expect(passwordInput).toHaveAttribute('type', 'text');
        
        // Clicar novamente para ocultar
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('Deve carregar a página de registro corretamente', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/register.html`);
        
        // Verificar título da página
        await expect(page).toHaveTitle(/Registro.*Tours Virtuais 360°/);
        
        // Verificar elementos principais
        await expect(page.locator('h2')).toContainText('Criar Conta');
        await expect(page.locator('#firstName')).toBeVisible();
        await expect(page.locator('#lastName')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('#confirmPassword')).toBeVisible();
        await expect(page.locator('#acceptTerms')).toBeVisible();
        
        // Verificar link para login
        await expect(page.locator('a[href="login.html"]')).toBeVisible();
    });

    test('Deve validar força da senha no registro', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/register.html`);
        
        const passwordInput = page.locator('#password');
        const strengthIndicator = page.locator('.password-strength');
        
        // Senha fraca
        await passwordInput.fill('123');
        await expect(strengthIndicator).toHaveClass(/strength-weak/);
        
        // Senha média
        await passwordInput.fill('senha123');
        await expect(strengthIndicator).toHaveClass(/strength-medium/);
        
        // Senha forte
        await passwordInput.fill('MinhaSenh@123!');
        await expect(strengthIndicator).toHaveClass(/strength-strong/);
    });

    test('Deve validar confirmação de senha', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/register.html`);
        
        // Preencher senhas diferentes
        await page.fill('#password', 'senha123456');
        await page.fill('#confirmPassword', 'senha654321');
        
        // Verificar que há erro de validação
        const confirmPasswordInput = page.locator('#confirmPassword');
        await expect(confirmPasswordInput).toHaveJSProperty('validationMessage');
    });

    test('Deve navegar entre login e registro', async ({ page }) => {
        // Começar no login
        await page.goto(`${ADMIN_URL}/login.html`);
        
        // Ir para registro
        await page.click('a[href="register.html"]');
        await expect(page).toHaveURL(/register\.html/);
        await expect(page.locator('h2')).toContainText('Criar Conta');
        
        // Voltar para login
        await page.click('a[href="login.html"]');
        await expect(page).toHaveURL(/login\.html/);
        await expect(page.locator('h2')).toContainText('Tours Virtuais 360°');
    });

    test('Deve mostrar modal de recuperação de senha', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/login.html`);
        
        // Clicar no link "Esqueci minha senha"
        await page.click('text=Esqueceu sua senha?');
        
        // Verificar que o modal apareceu
        const modal = page.locator('#forgotPasswordModal');
        await expect(modal).toBeVisible();
        
        // Verificar elementos do modal
        await expect(page.locator('.modal-title')).toContainText('Recuperar Senha');
        await expect(page.locator('#resetEmail')).toBeVisible();
        
        // Fechar modal
        await page.click('.btn-close');
        await expect(modal).not.toBeVisible();
    });

    test('Deve validar campos obrigatórios no registro', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/register.html`);
        
        // Tentar submeter sem aceitar termos
        await page.fill('#firstName', TEST_USER.firstName);
        await page.fill('#lastName', TEST_USER.lastName);
        await page.fill('#email', TEST_USER.email);
        await page.fill('#password', TEST_USER.password);
        await page.fill('#confirmPassword', TEST_USER.password);
        
        // Não marcar checkbox de termos
        await page.click('button[type="submit"]');
        
        // Verificar que o checkbox é obrigatório
        const termsCheckbox = page.locator('#acceptTerms');
        await expect(termsCheckbox).toHaveAttribute('required');
    });

    test('Deve preencher formulário de registro completamente', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/register.html`);
        
        // Preencher todos os campos
        await page.fill('#firstName', TEST_USER.firstName);
        await page.fill('#lastName', TEST_USER.lastName);
        await page.fill('#email', TEST_USER.email);
        await page.fill('#phone', '(11) 99999-9999');
        await page.fill('#company', TEST_USER.company);
        await page.fill('#password', TEST_USER.password);
        await page.fill('#confirmPassword', TEST_USER.password);
        
        // Aceitar termos
        await page.check('#acceptTerms');
        
        // Verificar que o botão de submit está habilitado
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeEnabled();
        
        // Verificar que todos os campos estão preenchidos
        await expect(page.locator('#firstName')).toHaveValue(TEST_USER.firstName);
        await expect(page.locator('#lastName')).toHaveValue(TEST_USER.lastName);
        await expect(page.locator('#email')).toHaveValue(TEST_USER.email);
        await expect(page.locator('#company')).toHaveValue(TEST_USER.company);
    });

    test('Deve ser responsivo em dispositivos móveis', async ({ page }) => {
        // Simular dispositivo móvel
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.goto(`${ADMIN_URL}/login.html`);
        
        // Verificar que os elementos são visíveis em mobile
        await expect(page.locator('.login-card')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        
        // Verificar que o layout se adapta
        const card = page.locator('.login-card');
        const cardBox = await card.boundingBox();
        expect(cardBox.width).toBeLessThan(375); // Deve caber na tela
    });
});

// Testes de integração com Supabase (quando disponível)
test.describe('Integração com Supabase', () => {
    
    test.skip('Deve fazer login com credenciais válidas', async ({ page }) => {
        // Este teste será executado quando o Supabase estiver configurado
        await page.goto(`${ADMIN_URL}/login.html`);
        
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        
        // Aguardar redirecionamento para dashboard
        await expect(page).toHaveURL(/index\.html/);
    });
    
    test.skip('Deve mostrar erro para credenciais inválidas', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/login.html`);
        
        await page.fill('input[type="email"]', 'usuario@inexistente.com');
        await page.fill('input[type="password"]', 'senhaerrada');
        await page.click('button[type="submit"]');
        
        // Verificar mensagem de erro
        await expect(page.locator('.alert-danger')).toBeVisible();
    });
});
