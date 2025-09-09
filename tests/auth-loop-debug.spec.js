import { test, expect } from '@playwright/test';

test.describe('🐛 DEBUG - Loop de Redirecionamento de Autenticação', () => {
    
    test.beforeEach(async ({ page }) => {
        // Limpar localStorage antes de cada teste
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test('🔍 Reproduzir Loop de Redirecionamento - Login Normal', async ({ page }) => {
        console.log('🔍 Iniciando teste de reprodução do loop...');
        
        // Monitorar redirecionamentos
        const redirects = [];
        page.on('response', response => {
            if (response.status() >= 300 && response.status() < 400) {
                redirects.push({
                    url: response.url(),
                    status: response.status(),
                    location: response.headers()['location']
                });
            }
        });

        // Monitorar mudanças de URL
        const urlChanges = [];
        page.on('framenavigated', frame => {
            if (frame === page.mainFrame()) {
                urlChanges.push(frame.url());
                console.log(`📍 URL mudou para: ${frame.url()}`);
            }
        });

        // Ir para página de login
        await page.goto('http://localhost:8000/admin/login.html');
        console.log('✅ Página de login carregada');

        // Aguardar carregamento completo
        await page.waitForLoadState('networkidle');

        // Verificar se há erros no console
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
                console.log(`❌ Console Error: ${msg.text()}`);
            }
        });

        // Preencher credenciais
        await page.fill('#email', 'admin@tours360.com');
        await page.fill('#password', 'Admin@Tours360!2024');

        console.log('✅ Credenciais preenchidas');

        // Fazer login
        await page.click('#loginBtn');
        console.log('✅ Botão de login clicado');

        // Aguardar por redirecionamentos (máximo 10 segundos)
        await page.waitForTimeout(10000);

        // Verificar estado final
        const finalUrl = page.url();
        console.log(`📍 URL final: ${finalUrl}`);

        // Verificar localStorage
        const localStorage = await page.evaluate(() => {
            return {
                test_admin_logged_in: localStorage.getItem('test_admin_logged_in'),
                supabase_auth_token: localStorage.getItem('sb-ewivsujoqdnltdktkyvh-auth-token')
            };
        });
        console.log('💾 localStorage:', localStorage);

        // Relatório de redirecionamentos
        console.log('\n📊 RELATÓRIO DE REDIRECIONAMENTOS:');
        console.log(`Total de mudanças de URL: ${urlChanges.length}`);
        urlChanges.forEach((url, index) => {
            console.log(`${index + 1}. ${url}`);
        });

        console.log(`\nTotal de redirects HTTP: ${redirects.length}`);
        redirects.forEach((redirect, index) => {
            console.log(`${index + 1}. ${redirect.status} - ${redirect.url} -> ${redirect.location}`);
        });

        console.log(`\nTotal de erros no console: ${consoleErrors.length}`);
        consoleErrors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });

        // Verificar se há loop (mais de 5 mudanças de URL indica problema)
        if (urlChanges.length > 5) {
            console.log('🚨 LOOP DETECTADO! Muitas mudanças de URL.');
        }

        // O teste sempre passa - é apenas para debug
        expect(true).toBe(true);
    });

    test('🔍 Testar Sistema de Login de Teste', async ({ page }) => {
        console.log('🔍 Testando sistema de login de teste...');

        // Ir para página de login de teste
        await page.goto('http://localhost:8000/admin/test-login.html');
        
        // Aguardar carregamento
        await page.waitForLoadState('networkidle');

        // Verificar se campos estão preenchidos
        const email = await page.inputValue('#email');
        const password = await page.inputValue('#password');
        
        console.log(`📧 Email preenchido: ${email}`);
        console.log(`🔑 Senha preenchida: ${password ? '***' : 'vazio'}`);

        // Fazer login de teste
        await page.click('button[type="submit"]');
        console.log('✅ Login de teste executado');

        // Aguardar redirecionamento
        await page.waitForTimeout(3000);

        // Verificar URL final
        const finalUrl = page.url();
        console.log(`📍 URL final: ${finalUrl}`);

        // Verificar localStorage
        const testLogin = await page.evaluate(() => {
            return localStorage.getItem('test_admin_logged_in');
        });
        console.log(`💾 test_admin_logged_in: ${testLogin}`);

        expect(true).toBe(true);
    });

    test('🔍 Verificar Auth Guard Isoladamente', async ({ page }) => {
        console.log('🔍 Testando auth-guard isoladamente...');

        // Definir localStorage manualmente
        await page.goto('http://localhost:8000/admin/index.html');
        
        await page.evaluate(() => {
            localStorage.setItem('test_admin_logged_in', 'true');
            localStorage.setItem('test_admin_email', 'admin@tours360.com');
        });

        // Recarregar página
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verificar se permanece na página
        const currentUrl = page.url();
        console.log(`📍 URL atual: ${currentUrl}`);

        // Verificar se indicador de teste aparece
        const testIndicator = await page.locator('#admin-user-indicator').isVisible();
        console.log(`🧪 Indicador de teste visível: ${testIndicator}`);

        if (testIndicator) {
            const indicatorText = await page.locator('#admin-user-indicator').textContent();
            console.log(`📝 Texto do indicador: ${indicatorText}`);
        }

        expect(true).toBe(true);
    });

});
