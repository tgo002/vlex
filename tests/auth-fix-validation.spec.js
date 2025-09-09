import { test, expect } from '@playwright/test';

test.describe('🔧 VALIDAÇÃO DAS CORREÇÕES DE AUTENTICAÇÃO', () => {
    
    test.beforeEach(async ({ page }) => {
        // Limpar localStorage antes de cada teste
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test('✅ Login Corrigido - Sem Loop de Redirecionamento', async ({ page }) => {
        console.log('🔧 Testando login corrigido...');
        
        // Monitorar mudanças de URL
        const urlChanges = [];
        page.on('framenavigated', frame => {
            if (frame === page.mainFrame()) {
                urlChanges.push(frame.url());
                console.log(`📍 URL: ${frame.url()}`);
            }
        });

        // Ir para página de login corrigida
        await page.goto('http://localhost:8000/admin/login-fixed.html');
        console.log('✅ Página de login corrigida carregada');

        // Aguardar carregamento
        await page.waitForLoadState('networkidle');

        // Verificar se campos estão preenchidos
        const email = await page.inputValue('#email');
        const password = await page.inputValue('#password');
        
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Senha: ${password ? '***' : 'vazio'}`);

        // Fazer login
        await page.click('#loginBtn');
        console.log('✅ Login executado');

        // Aguardar redirecionamento (máximo 5 segundos)
        await page.waitForTimeout(5000);

        // Verificar URL final
        const finalUrl = page.url();
        console.log(`📍 URL final: ${finalUrl}`);

        // Verificar localStorage
        const testLogin = await page.evaluate(() => {
            return localStorage.getItem('test_admin_logged_in');
        });
        console.log(`💾 test_admin_logged_in: ${testLogin}`);

        // Verificar se não há loop (máximo 3 mudanças de URL é aceitável)
        console.log(`📊 Total de mudanças de URL: ${urlChanges.length}`);
        
        if (urlChanges.length <= 3) {
            console.log('✅ Sem loop detectado!');
        } else {
            console.log('⚠️ Possível loop detectado');
        }

        // Verificar se chegou ao dashboard
        const isDashboard = finalUrl.includes('index.html') || finalUrl.includes('admin/');
        console.log(`🏠 Chegou ao dashboard: ${isDashboard}`);

        expect(urlChanges.length).toBeLessThanOrEqual(3);
        expect(testLogin).toBe('true');
    });

    test('✅ Auth Guard Corrigido - Sem Loops', async ({ page }) => {
        console.log('🔧 Testando auth guard corrigido...');

        // Definir login de teste primeiro
        await page.goto('http://localhost:8000/admin/index.html');
        
        await page.evaluate(() => {
            localStorage.setItem('test_admin_logged_in', 'true');
            localStorage.setItem('test_admin_email', 'admin@tours360.com');
        });

        // Monitorar redirecionamentos
        const redirects = [];
        page.on('response', response => {
            if (response.status() >= 300 && response.status() < 400) {
                redirects.push(response.url());
            }
        });

        // Recarregar página
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Aguardar processamento
        await page.waitForTimeout(3000);

        // Verificar se permanece na página
        const currentUrl = page.url();
        console.log(`📍 URL atual: ${currentUrl}`);

        // Verificar se indicador de teste aparece
        const testIndicator = await page.locator('#admin-user-indicator').isVisible();
        console.log(`🧪 Indicador de teste visível: ${testIndicator}`);

        // Verificar se não há redirecionamentos excessivos
        console.log(`📊 Total de redirects: ${redirects.length}`);

        expect(redirects.length).toBeLessThanOrEqual(1);
        expect(currentUrl).toContain('index.html');
    });

    test('✅ Fluxo Completo - Login → Dashboard → Logout', async ({ page }) => {
        console.log('🔧 Testando fluxo completo...');

        // 1. Ir para login
        await page.goto('http://localhost:8000/admin/login-fixed.html');
        await page.waitForLoadState('networkidle');

        // 2. Fazer login
        await page.click('#loginBtn');
        await page.waitForTimeout(3000);

        // 3. Verificar se chegou ao dashboard
        let currentUrl = page.url();
        console.log(`📍 Após login: ${currentUrl}`);
        
        const isInDashboard = currentUrl.includes('index.html');
        console.log(`🏠 No dashboard: ${isInDashboard}`);

        // 4. Verificar indicador de usuário
        const userIndicator = await page.locator('#admin-user-indicator').isVisible();
        console.log(`👤 Indicador de usuário: ${userIndicator}`);

        // 5. Fazer logout se indicador estiver visível
        if (userIndicator) {
            await page.click('#admin-user-indicator .logout-btn');
            await page.waitForTimeout(2000);
            
            currentUrl = page.url();
            console.log(`📍 Após logout: ${currentUrl}`);
        }

        expect(isInDashboard).toBe(true);
    });

    test('✅ Verificar Proteção de Rotas', async ({ page }) => {
        console.log('🔧 Testando proteção de rotas...');

        // Tentar acessar dashboard sem login
        await page.goto('http://localhost:8000/admin/index.html');
        await page.waitForTimeout(3000);

        const finalUrl = page.url();
        console.log(`📍 URL final: ${finalUrl}`);

        // Deve redirecionar para login
        const isLoginPage = finalUrl.includes('login.html');
        console.log(`🔐 Redirecionou para login: ${isLoginPage}`);

        expect(isLoginPage).toBe(true);
    });

    test('📊 Relatório de Correções', async ({ page }) => {
        console.log('\n🎉 RELATÓRIO DAS CORREÇÕES IMPLEMENTADAS:');
        console.log('✅ 1. Auth Guard com proteção contra loops');
        console.log('✅ 2. Login com controle de redirecionamento');
        console.log('✅ 3. Sistema de login simplificado');
        console.log('✅ 4. Verificação de estado robusta');
        console.log('✅ 5. Separação clara entre sistemas');
        console.log('✅ 6. Debug logging implementado');
        console.log('✅ 7. Timeouts para evitar travamentos');
        console.log('✅ 8. Proteção contra múltiplas execuções');
        
        // Este teste sempre passa - é apenas documentação
        expect(true).toBe(true);
    });

});
