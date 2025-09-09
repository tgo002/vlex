import { test, expect } from '@playwright/test';

test.describe('Sistema Administrativo Restrito', () => {
    const baseURL = 'http://localhost:8000';
    const adminCredentials = {
        email: 'admin@tours360.com',
        password: 'Admin@Tours360!2024'
    };

    test.beforeEach(async ({ page }) => {
        // Configurar timeout para testes
        test.setTimeout(60000);
    });

    test('Deve redirecionar páginas administrativas para login quando não autenticado', async ({ page }) => {
        const adminPages = [
            '/admin/index.html',
            '/admin/property-editor.html',
            '/admin/scene-manager.html',
            '/admin/hotspot-editor.html',
            '/admin/image-upload.html',
            '/admin/leads-manager.html',
            '/admin/publication-manager.html'
        ];

        for (const adminPage of adminPages) {
            await page.goto(`${baseURL}${adminPage}`);
            
            // Deve redirecionar para login
            await expect(page).toHaveURL(`${baseURL}/admin/login.html`);
            
            // Deve mostrar página de login restrita
            await expect(page.locator('h1')).toContainText('🔐 Acesso Administrativo');
            await expect(page.locator('text=Sistema Restrito - Apenas Administradores')).toBeVisible();
        }
    });

    test('Deve permitir login com credenciais administrativas válidas', async ({ page }) => {
        await page.goto(`${baseURL}/admin/login.html`);
        
        // Preencher formulário de login
        await page.fill('input[type="email"]', adminCredentials.email);
        await page.fill('input[type="password"]', adminCredentials.password);
        
        // Fazer login
        await page.click('button:has-text("Entrar")');
        
        // Deve redirecionar para dashboard
        await expect(page).toHaveURL(`${baseURL}/admin/index.html`);
        await expect(page.locator('h1')).toContainText('Dashboard');
        
        // Deve mostrar indicador de usuário logado
        await expect(page.locator('text=admin')).toBeVisible();
        await expect(page.locator('button:has-text("Sair")')).toBeVisible();
    });

    test('Deve rejeitar credenciais inválidas', async ({ page }) => {
        await page.goto(`${baseURL}/admin/login.html`);
        
        // Tentar login com credenciais inválidas
        await page.fill('input[type="email"]', 'usuario@invalido.com');
        await page.fill('input[type="password"]', 'senhaerrada');
        
        await page.click('button:has-text("Entrar")');
        
        // Deve permanecer na página de login
        await expect(page).toHaveURL(`${baseURL}/admin/login.html`);
        
        // Deve mostrar erro (se implementado) ou não redirecionar
        await expect(page.locator('h1')).toContainText('🔐 Acesso Administrativo');
    });

    test('Deve permitir logout e redirecionar para login', async ({ page }) => {
        // Fazer login primeiro
        await page.goto(`${baseURL}/admin/login.html`);
        await page.fill('input[type="email"]', adminCredentials.email);
        await page.fill('input[type="password"]', adminCredentials.password);
        await page.click('button:has-text("Entrar")');
        
        // Verificar que está logado
        await expect(page).toHaveURL(`${baseURL}/admin/index.html`);
        
        // Fazer logout
        await page.click('button:has-text("Sair")');
        
        // Confirmar logout se houver dialog
        page.on('dialog', dialog => dialog.accept());
        
        // Deve redirecionar para login
        await expect(page).toHaveURL(`${baseURL}/admin/login.html`);
        await expect(page.locator('h1')).toContainText('🔐 Acesso Administrativo');
    });

    test('Deve proteger todas as páginas administrativas após logout', async ({ page }) => {
        // Fazer login e logout
        await page.goto(`${baseURL}/admin/login.html`);
        await page.fill('input[type="email"]', adminCredentials.email);
        await page.fill('input[type="password"]', adminCredentials.password);
        await page.click('button:has-text("Entrar")');
        
        await expect(page).toHaveURL(`${baseURL}/admin/index.html`);
        
        await page.click('button:has-text("Sair")');
        page.on('dialog', dialog => dialog.accept());
        
        // Tentar acessar páginas administrativas
        const adminPages = [
            '/admin/property-editor.html',
            '/admin/scene-manager.html',
            '/admin/hotspot-editor.html'
        ];

        for (const adminPage of adminPages) {
            await page.goto(`${baseURL}${adminPage}`);
            await expect(page).toHaveURL(`${baseURL}/admin/login.html`);
        }
    });
});

test.describe('Página Inicial Pública', () => {
    const baseURL = 'http://localhost:8000';

    test('Deve carregar página inicial pública sem necessidade de login', async ({ page }) => {
        await page.goto(`${baseURL}/index.html`);
        
        // Verificar elementos principais da página
        await expect(page.locator('h1')).toContainText('Experiência Imobiliária Premium');
        await expect(page.locator('text=Explore propriedades exclusivas')).toBeVisible();
        
        // Verificar seções principais
        await expect(page.locator('text=Propriedades Exclusivas')).toBeVisible();
        await expect(page.locator('text=Tecnologia de Ponta')).toBeVisible();
        await expect(page.locator('text=Entre em Contato')).toBeVisible();
        
        // Verificar botão de acesso administrativo
        await expect(page.locator('text=Acesso Administrativo')).toBeVisible();
    });

    test('Deve exibir propriedades disponíveis', async ({ page }) => {
        await page.goto(`${baseURL}/index.html`);
        
        // Aguardar carregamento das propriedades
        await page.waitForTimeout(3000);
        
        // Verificar se propriedades são exibidas (dados de exemplo ou reais)
        const propertyCards = page.locator('.property-card, [class*="property"]');
        
        // Deve haver pelo menos uma propriedade (dados de exemplo)
        await expect(propertyCards.first()).toBeVisible();
        
        // Verificar elementos dos cards
        await expect(page.locator('text=Casa Moderna, text=Apartamento')).toBeVisible();
        await expect(page.locator('text=Iniciar Tour 360°')).toBeVisible();
    });

    test('Deve permitir navegação para tours virtuais', async ({ page }) => {
        await page.goto(`${baseURL}/index.html`);
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Clicar no primeiro botão "Iniciar Tour 360°"
        const tourButton = page.locator('text=Iniciar Tour 360°').first();
        await expect(tourButton).toBeVisible();
        
        await tourButton.click();
        
        // Deve navegar para página de tour
        await expect(page).toHaveURL(/\/client\/tour\.html\?id=/);
        
        // Verificar que o tour carrega
        await expect(page.locator('text=Tour Virtual 360°')).toBeVisible();
    });

    test('Deve redirecionar botão "Acesso Administrativo" para login', async ({ page }) => {
        await page.goto(`${baseURL}/index.html`);
        
        // Clicar no botão de acesso administrativo
        await page.click('text=Acesso Administrativo');
        
        // Deve redirecionar para login administrativo
        await expect(page).toHaveURL(`${baseURL}/admin/login.html`);
        await expect(page.locator('h1')).toContainText('🔐 Acesso Administrativo');
    });

    test('Deve ser responsiva em diferentes tamanhos de tela', async ({ page }) => {
        await page.goto(`${baseURL}/index.html`);
        
        // Testar desktop
        await page.setViewportSize({ width: 1200, height: 800 });
        await expect(page.locator('h1')).toBeVisible();
        
        // Testar tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(page.locator('h1')).toBeVisible();
        
        // Testar mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('h1')).toBeVisible();
        
        // Verificar que elementos principais ainda são visíveis
        await expect(page.locator('text=Propriedades Exclusivas')).toBeVisible();
    });
});
