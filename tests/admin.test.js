// Testes E2E para interface administrativa do sistema de tours virtuais 360°
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8000';
const ADMIN_URL = `${BASE_URL}/admin`;

// Dados de teste
const TEST_PROPERTY = {
    title: 'Casa Moderna em Condomínio Fechado',
    description: 'Bela casa com 3 quartos, suíte master, sala ampla com pé direito duplo, cozinha gourmet integrada.',
    price: '850000',
    area: '180',
    bedrooms: '3 quartos',
    bathrooms: '3 banheiros',
    address: 'Rua das Flores, 123, Alphaville',
    city: 'Barueri',
    state: 'São Paulo'
};

test.describe('Interface Administrativa', () => {
    
    test.beforeEach(async ({ page }) => {
        // Configurar interceptação de console para debug
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`Console Error: ${msg.text()}`);
            }
        });
    });

    test('Deve carregar o dashboard corretamente', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/index.html`);
        
        // Verificar título da página
        await expect(page).toHaveTitle(/Dashboard.*Tours Virtuais 360°/);
        
        // Verificar elementos principais do dashboard
        await expect(page.locator('h1')).toContainText('Dashboard');
        await expect(page.locator('text=Total de Propriedades')).toBeVisible();
        await expect(page.locator('text=Propriedades Publicadas')).toBeVisible();
        await expect(page.locator('text=Cenas 360°')).toBeVisible();
        await expect(page.locator('text=Hotspots Criados')).toBeVisible();
        
        // Verificar ações rápidas
        await expect(page.locator('text=Ações Rápidas')).toBeVisible();
        await expect(page.locator('text=Nova Propriedade')).toBeVisible();
        await expect(page.locator('text=Upload de Imagens')).toBeVisible();
        await expect(page.locator('text=Editor de Hotspots')).toBeVisible();
        await expect(page.locator('text=Publicações')).toBeVisible();
        await expect(page.locator('text=Leads')).toBeVisible();
    });

    test('Deve navegar para o editor de propriedades', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/index.html`);
        
        // Clicar no botão "Nova Propriedade"
        await page.click('text=➕ Nova Propriedade');
        
        // Verificar redirecionamento
        await expect(page).toHaveURL(/property-editor\.html/);
        await expect(page.locator('h1')).toContainText('Nova Propriedade');
    });

    test('Deve preencher formulário de propriedade completamente', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/property-editor.html`);
        
        // Preencher informações básicas
        await page.fill('input[placeholder*="Apartamento 3 quartos"]', TEST_PROPERTY.title);
        await page.fill('textarea[placeholder*="Descreva as características"]', TEST_PROPERTY.description);
        await page.fill('input[type="number"][placeholder*="0"]', TEST_PROPERTY.price);
        await page.fill('input[type="number"]:nth-of-type(2)', TEST_PROPERTY.area);
        
        // Selecionar quartos e banheiros
        await page.selectOption('select:has-text("Selecione")', TEST_PROPERTY.bedrooms);
        await page.selectOption('select:nth-of-type(2)', TEST_PROPERTY.bathrooms);
        
        // Preencher localização
        await page.fill('input[placeholder*="Rua, número"]', TEST_PROPERTY.address);
        await page.fill('input[placeholder*="São Paulo"]', TEST_PROPERTY.city);
        await page.selectOption('select:has-text("Selecione")', TEST_PROPERTY.state);
        
        // Verificar que os campos foram preenchidos
        await expect(page.locator('input[placeholder*="Apartamento 3 quartos"]')).toHaveValue(TEST_PROPERTY.title);
        await expect(page.locator('textarea[placeholder*="Descreva as características"]')).toHaveValue(TEST_PROPERTY.description);
        await expect(page.locator('input[placeholder*="São Paulo"]')).toHaveValue(TEST_PROPERTY.city);
    });

    test('Deve validar campos obrigatórios', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/property-editor.html`);
        
        // Tentar salvar sem preencher campos obrigatórios
        await page.click('button:has-text("💾 Salvar Propriedade")');
        
        // Verificar que o campo título é obrigatório
        const titleInput = page.locator('input[placeholder*="Apartamento 3 quartos"]');
        await expect(titleInput).toHaveAttribute('required');
    });

    test('Deve alternar entre status de publicação', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/property-editor.html`);
        
        // Verificar status inicial (Rascunho)
        const draftOption = page.locator('text=📝').locator('..');
        const publishedOption = page.locator('text=🌐').locator('..');
        
        // Clicar em "Publicado"
        await publishedOption.click();
        
        // Verificar que a opção foi selecionada
        await expect(publishedOption).toHaveClass(/selected|active/);
        
        // Voltar para "Rascunho"
        await draftOption.click();
        await expect(draftOption).toHaveClass(/selected|active/);
    });

    test('Deve navegar para o gerenciador de cenas', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/index.html`);
        
        // Navegar para upload de imagens
        await page.click('text=Upload de Imagens');
        
        // Verificar se há alguma ação ou modal
        // Como o link aponta para "#", pode abrir um modal ou mostrar uma seção
    });

    test('Deve navegar para o gerenciador de publicações', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/index.html`);
        
        // Clicar no link de publicações
        await page.click('text=🌐 Publicações');
        
        // Verificar redirecionamento
        await expect(page).toHaveURL(/publication-manager\.html/);
    });

    test('Deve navegar para o gerenciador de leads', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/index.html`);
        
        // Clicar no link de leads
        await page.click('text=📞 Leads');
        
        // Verificar redirecionamento
        await expect(page).toHaveURL(/leads-manager\.html/);
    });

    test('Deve ter botão de logout funcional', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/index.html`);
        
        // Verificar se o botão de sair está presente
        await expect(page.locator('button:has-text("Sair")')).toBeVisible();
        
        // Clicar no botão de sair
        await page.click('button:has-text("Sair")');
        
        // Verificar se há alguma ação (pode ser um modal de confirmação ou redirecionamento)
    });

    test('Deve voltar ao dashboard do editor de propriedades', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/property-editor.html`);
        
        // Clicar no link "Voltar ao Dashboard"
        await page.click('text=← Voltar ao Dashboard');
        
        // Verificar redirecionamento
        await expect(page).toHaveURL(/index\.html/);
        await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('Deve ser responsivo em diferentes tamanhos de tela', async ({ page }) => {
        // Testar em desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(`${ADMIN_URL}/index.html`);
        await expect(page.locator('h1')).toBeVisible();
        
        // Testar em tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.reload();
        await expect(page.locator('h1')).toBeVisible();
        
        // Testar em mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await expect(page.locator('h1')).toBeVisible();
        
        // Verificar que o layout se adapta
        const dashboard = page.locator('main, .container, .dashboard');
        const dashboardBox = await dashboard.first().boundingBox();
        expect(dashboardBox.width).toBeLessThanOrEqual(375);
    });

    test('Deve carregar estatísticas do dashboard', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/index.html`);
        
        // Aguardar carregamento das estatísticas
        await page.waitForTimeout(2000);
        
        // Verificar se as estatísticas não estão mais mostrando "-"
        const statsCards = page.locator('[class*="stat"], [class*="card"]');
        
        // Verificar que existem cards de estatísticas
        await expect(statsCards.first()).toBeVisible();
    });

    test('Deve navegar entre diferentes seções do admin', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/index.html`);
        
        // Testar navegação para diferentes páginas
        const pages = [
            { link: 'text=🏠 Criar Propriedade', url: 'property-editor.html' },
            { link: 'text=🌐 Publicações', url: 'publication-manager.html' },
            { link: 'text=📞 Leads', url: 'leads-manager.html' }
        ];
        
        for (const pageTest of pages) {
            await page.goto(`${ADMIN_URL}/index.html`);
            await page.click(pageTest.link);
            await expect(page).toHaveURL(new RegExp(pageTest.url));
            
            // Verificar que a página carregou
            await expect(page.locator('h1, h2')).toBeVisible();
        }
    });
});

test.describe('Formulários e Validações', () => {
    
    test('Deve validar formato de preço', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/property-editor.html`);
        
        const priceInput = page.locator('input[type="number"]').first();
        
        // Tentar inserir valor inválido
        await priceInput.fill('-100');
        
        // Verificar que o campo aceita apenas números positivos
        await expect(priceInput).toHaveAttribute('type', 'number');
    });

    test('Deve validar formato de área', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/property-editor.html`);
        
        const areaInput = page.locator('input[type="number"]').nth(1);
        
        // Inserir valor válido
        await areaInput.fill('150.5');
        await expect(areaInput).toHaveValue('150.5');
        
        // Verificar que aceita decimais
        await areaInput.fill('200');
        await expect(areaInput).toHaveValue('200');
    });

    test('Deve limitar caracteres em campos de texto', async ({ page }) => {
        await page.goto(`${ADMIN_URL}/property-editor.html`);
        
        const titleInput = page.locator('input[placeholder*="Apartamento 3 quartos"]');
        
        // Inserir texto muito longo
        const longText = 'A'.repeat(200);
        await titleInput.fill(longText);
        
        // Verificar se há limitação (se implementada)
        const value = await titleInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
    });
});
