import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';
const LOCALHOST_URL = 'http://localhost:8000';

test.describe('🔧 Investigação e Correção do Admin Login', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(15000);
    });

    test('🔍 Reproduzir erro de login no admin Vercel', async ({ page }) => {
        console.log('🧪 Testando erro de login no admin Vercel...');
        
        const errors = [];
        const networkRequests = [];
        const failedRequests = [];
        
        // Capturar todos os erros e requests
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ Erro de console:', msg.text());
            }
        });
        
        page.on('request', request => {
            networkRequests.push({
                url: request.url(),
                method: request.method()
            });
        });
        
        page.on('response', response => {
            if (response.status() >= 400) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status()
                });
            }
        });

        console.log('🧪 Navegando para /admin no Vercel...');
        await page.goto(`${VERCEL_URL}/admin/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se a página carregou
        console.log('✅ Página /admin carregou');
        
        // Verificar se há erros relacionados ao Supabase
        const supabaseErrors = errors.filter(error => 
            error.includes('supabase') || 
            error.includes('createClient') || 
            error.includes('window.supabase')
        );
        
        console.log('🔍 Erros relacionados ao Supabase:', supabaseErrors);
        
        // Verificar se o CDN do Supabase foi carregado
        const supabaseRequests = networkRequests.filter(req => 
            req.url.includes('supabase') && req.url.includes('cdn')
        );
        
        console.log('📊 Requests do CDN Supabase:', supabaseRequests);
        
        // Verificar se window.supabase está disponível
        const windowSupabase = await page.evaluate(() => {
            return {
                exists: typeof window.supabase !== 'undefined',
                type: typeof window.supabase,
                hasCreateClient: window.supabase && typeof window.supabase.createClient === 'function'
            };
        });
        
        console.log('🔍 Estado do window.supabase:', windowSupabase);
        
        // Tentar fazer login se houver formulário
        try {
            const loginForm = page.locator('form, .login-form');
            if (await loginForm.isVisible()) {
                console.log('📝 Formulário de login encontrado');
                
                // Tentar preencher e submeter
                const emailInput = page.locator('input[type="email"], input[name="email"]');
                const passwordInput = page.locator('input[type="password"], input[name="password"]');
                
                if (await emailInput.isVisible() && await passwordInput.isVisible()) {
                    await emailInput.fill('test@example.com');
                    await passwordInput.fill('testpassword');
                    
                    console.log('🖱️ Tentando fazer login...');
                    await page.keyboard.press('Enter');
                    
                    // Aguardar resposta
                    await page.waitForTimeout(3000);
                    
                    // Verificar novos erros após tentativa de login
                    const newErrors = errors.slice(supabaseErrors.length);
                    console.log('🔍 Novos erros após login:', newErrors);
                }
            } else {
                console.log('⚠️ Formulário de login não encontrado - pode já estar logado');
            }
        } catch (e) {
            console.log('⚠️ Erro ao tentar fazer login:', e.message);
        }
        
        // Relatório final
        console.log('\n📊 RELATÓRIO COMPLETO:');
        console.log('Total de erros:', errors.length);
        console.log('Erros Supabase:', supabaseErrors.length);
        console.log('Requests falhando:', failedRequests.length);
        console.log('CDN Supabase carregado:', supabaseRequests.length > 0);
        console.log('window.supabase disponível:', windowSupabase.exists);
        
        // Screenshot para evidência
        await page.screenshot({ 
            path: 'test-results/admin-error-vercel.png',
            fullPage: true 
        });
        console.log('📸 Screenshot salvo: test-results/admin-error-vercel.png');
    });

    test('🔍 Comparar admin localhost vs Vercel', async ({ page }) => {
        console.log('🧪 Comparando admin localhost vs Vercel...');
        
        // Primeiro testar localhost
        console.log('\n--- TESTANDO LOCALHOST ---');
        const localhostErrors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                localhostErrors.push(msg.text());
            }
        });
        
        try {
            await page.goto(`${LOCALHOST_URL}/admin/`);
            await page.waitForLoadState('networkidle');
            
            const localhostSupabase = await page.evaluate(() => {
                return {
                    exists: typeof window.supabase !== 'undefined',
                    type: typeof window.supabase,
                    hasCreateClient: window.supabase && typeof window.supabase.createClient === 'function'
                };
            });
            
            console.log('✅ Localhost - window.supabase:', localhostSupabase);
            console.log('✅ Localhost - erros:', localhostErrors.length);
            
        } catch (e) {
            console.log('❌ Erro ao acessar localhost:', e.message);
        }
        
        // Agora testar Vercel
        console.log('\n--- TESTANDO VERCEL ---');
        const vercelErrors = [];
        
        page.removeAllListeners('console');
        page.on('console', msg => {
            if (msg.type() === 'error') {
                vercelErrors.push(msg.text());
            }
        });
        
        await page.goto(`${VERCEL_URL}/admin/`);
        await page.waitForLoadState('networkidle');
        
        const vercelSupabase = await page.evaluate(() => {
            return {
                exists: typeof window.supabase !== 'undefined',
                type: typeof window.supabase,
                hasCreateClient: window.supabase && typeof window.supabase.createClient === 'function'
            };
        });
        
        console.log('✅ Vercel - window.supabase:', vercelSupabase);
        console.log('✅ Vercel - erros:', vercelErrors.length);
        
        // Comparação
        console.log('\n📊 COMPARAÇÃO:');
        console.log('Localhost funciona:', localhostSupabase.exists);
        console.log('Vercel funciona:', vercelSupabase.exists);
        console.log('Diferença de erros:', vercelErrors.length - localhostErrors.length);
        
        if (!vercelSupabase.exists && localhostSupabase.exists) {
            console.log('🔍 PROBLEMA IDENTIFICADO: Vercel não tem window.supabase, localhost tem');
        }
    });

    test('🔍 Verificar scripts carregados no admin', async ({ page }) => {
        console.log('🧪 Verificando scripts carregados no admin...');
        
        const scriptRequests = [];
        
        page.on('response', response => {
            if (response.url().includes('.js') || response.url().includes('supabase')) {
                scriptRequests.push({
                    url: response.url(),
                    status: response.status(),
                    contentType: response.headers()['content-type']
                });
            }
        });
        
        await page.goto(`${VERCEL_URL}/admin/`);
        await page.waitForLoadState('networkidle');
        
        console.log('\n📊 SCRIPTS CARREGADOS:');
        scriptRequests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.url}`);
            console.log(`   Status: ${req.status} | Type: ${req.contentType}`);
        });
        
        // Verificar especificamente o CDN do Supabase
        const supabaseCDN = scriptRequests.find(req => 
            req.url.includes('supabase') && req.url.includes('cdn')
        );
        
        if (supabaseCDN) {
            console.log('\n✅ CDN Supabase encontrado:', supabaseCDN.url);
        } else {
            console.log('\n❌ CDN Supabase NÃO encontrado!');
        }
        
        // Verificar supabase-client.js
        const supabaseClient = scriptRequests.find(req => 
            req.url.includes('supabase-client.js')
        );
        
        if (supabaseClient) {
            console.log('✅ supabase-client.js encontrado:', supabaseClient.url);
        } else {
            console.log('❌ supabase-client.js NÃO encontrado!');
        }
    });

    test('🔍 Testar ordem de carregamento dos scripts', async ({ page }) => {
        console.log('🧪 Testando ordem de carregamento dos scripts...');
        
        const loadOrder = [];
        
        page.on('response', response => {
            if (response.url().includes('.js') || response.url().includes('supabase')) {
                loadOrder.push({
                    timestamp: new Date().toISOString(),
                    url: response.url(),
                    status: response.status()
                });
            }
        });
        
        await page.goto(`${VERCEL_URL}/admin/`);
        await page.waitForLoadState('networkidle');
        
        console.log('\n📊 ORDEM DE CARREGAMENTO:');
        loadOrder.forEach((item, index) => {
            console.log(`${index + 1}. ${item.timestamp}: ${item.url} (${item.status})`);
        });
        
        // Verificar se CDN carrega antes do client
        const cdnIndex = loadOrder.findIndex(item => 
            item.url.includes('supabase') && item.url.includes('cdn')
        );
        const clientIndex = loadOrder.findIndex(item => 
            item.url.includes('supabase-client.js')
        );
        
        console.log('\n🔍 ANÁLISE DA ORDEM:');
        console.log('CDN Supabase index:', cdnIndex);
        console.log('supabase-client.js index:', clientIndex);
        
        if (cdnIndex === -1) {
            console.log('❌ PROBLEMA: CDN Supabase não foi carregado!');
        } else if (clientIndex !== -1 && cdnIndex > clientIndex) {
            console.log('❌ PROBLEMA: supabase-client.js carrega antes do CDN!');
        } else {
            console.log('✅ Ordem de carregamento parece correta');
        }
    });
});
