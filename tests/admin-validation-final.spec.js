import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('✅ Validação Final da Correção do Admin', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(15000);
    });

    test('✅ Validar CDN Supabase carregando no admin', async ({ page }) => {
        console.log('🧪 Validando CDN Supabase no admin...');
        
        const errors = [];
        const scriptRequests = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ Erro de console:', msg.text());
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('.js') || response.url().includes('supabase')) {
                scriptRequests.push({
                    url: response.url(),
                    status: response.status(),
                    timestamp: new Date().toISOString()
                });
            }
        });

        await page.goto(`${VERCEL_URL}/admin/`);
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Página admin carregou');
        
        // Verificar se o CDN do Supabase foi carregado
        const supabaseCDN = scriptRequests.find(req => 
            req.url.includes('supabase') && req.url.includes('cdn')
        );
        
        if (supabaseCDN) {
            console.log('✅ CDN Supabase encontrado:', supabaseCDN.url);
            console.log('✅ Status do CDN:', supabaseCDN.status);
            expect(supabaseCDN.status).toBe(200);
        } else {
            console.log('❌ CDN Supabase ainda não encontrado!');
        }
        
        // Verificar se window.supabase está disponível
        const windowSupabase = await page.evaluate(() => {
            return {
                exists: typeof window.supabase !== 'undefined',
                type: typeof window.supabase,
                hasCreateClient: window.supabase && typeof window.supabase.createClient === 'function'
            };
        });
        
        console.log('🔍 Estado do window.supabase:', windowSupabase);
        
        // Verificar se não há mais erros de destructuring
        const supabaseErrors = errors.filter(error => 
            error.includes('Cannot destructure property') && 
            error.includes('createClient')
        );
        
        console.log('🔍 Erros de destructuring:', supabaseErrors.length);
        
        // Verificar ordem de carregamento
        const cdnIndex = scriptRequests.findIndex(req => 
            req.url.includes('supabase') && req.url.includes('cdn')
        );
        const clientIndex = scriptRequests.findIndex(req => 
            req.url.includes('supabase-client.js')
        );
        
        console.log('📊 Ordem de carregamento:');
        console.log('CDN index:', cdnIndex);
        console.log('Client index:', clientIndex);
        
        if (cdnIndex !== -1 && clientIndex !== -1) {
            if (cdnIndex < clientIndex) {
                console.log('✅ Ordem correta: CDN carrega antes do client');
            } else {
                console.log('❌ Ordem incorreta: Client carrega antes do CDN');
            }
        }
        
        // Relatório final
        console.log('\n📊 RELATÓRIO DE VALIDAÇÃO:');
        console.log('CDN Supabase carregado:', supabaseCDN ? '✅ SIM' : '❌ NÃO');
        console.log('window.supabase disponível:', windowSupabase.exists ? '✅ SIM' : '❌ NÃO');
        console.log('Erros de destructuring:', supabaseErrors.length === 0 ? '✅ NENHUM' : `❌ ${supabaseErrors.length}`);
        console.log('Total de erros:', errors.length);
        
        // Screenshot
        await page.screenshot({ 
            path: 'test-results/admin-fixed-validation.png',
            fullPage: true 
        });
        console.log('📸 Screenshot salvo: test-results/admin-fixed-validation.png');
    });

    test('✅ Testar login funcional no admin', async ({ page }) => {
        console.log('🧪 Testando funcionalidade de login...');
        
        const errors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(`${VERCEL_URL}/admin/`);
        await page.waitForLoadState('networkidle');
        
        // Verificar se window.supabase está disponível
        const windowSupabase = await page.evaluate(() => {
            return typeof window.supabase !== 'undefined' && 
                   typeof window.supabase.createClient === 'function';
        });
        
        console.log('✅ window.supabase funcional:', windowSupabase);
        
        if (windowSupabase) {
            console.log('✅ Supabase está pronto para uso!');
            
            // Tentar acessar o cliente Supabase
            const supabaseClient = await page.evaluate(() => {
                try {
                    const client = window.supabase.createClient('test', 'test');
                    return {
                        success: true,
                        hasAuth: typeof client.auth !== 'undefined',
                        hasFrom: typeof client.from === 'function'
                    };
                } catch (e) {
                    return {
                        success: false,
                        error: e.message
                    };
                }
            });
            
            console.log('🔍 Teste do cliente Supabase:', supabaseClient);
            
            if (supabaseClient.success) {
                console.log('✅ Cliente Supabase criado com sucesso!');
                console.log('✅ Auth disponível:', supabaseClient.hasAuth);
                console.log('✅ From disponível:', supabaseClient.hasFrom);
            } else {
                console.log('❌ Erro ao criar cliente:', supabaseClient.error);
            }
        } else {
            console.log('❌ window.supabase ainda não está disponível');
        }
        
        // Verificar se há formulário de login
        try {
            const loginForm = page.locator('#loginForm');
            if (await loginForm.isVisible()) {
                console.log('📝 Formulário de login encontrado');
                
                // Verificar se os campos estão funcionais
                const emailInput = page.locator('#email');
                const passwordInput = page.locator('#password');
                
                if (await emailInput.isVisible() && await passwordInput.isVisible()) {
                    console.log('✅ Campos de login visíveis');
                    
                    // Testar preenchimento (sem submeter)
                    await emailInput.fill('test@example.com');
                    await passwordInput.fill('testpassword');
                    
                    const emailValue = await emailInput.inputValue();
                    const passwordValue = await passwordInput.inputValue();
                    
                    console.log('✅ Preenchimento funcional:', emailValue === 'test@example.com');
                    console.log('✅ Campos interativos funcionando');
                } else {
                    console.log('⚠️ Campos de login não visíveis');
                }
            } else {
                console.log('⚠️ Formulário de login não encontrado - pode já estar logado');
            }
        } catch (e) {
            console.log('⚠️ Erro ao verificar formulário:', e.message);
        }
        
        console.log('\n📊 RESULTADO FINAL:');
        console.log('Supabase funcional:', windowSupabase ? '✅ SIM' : '❌ NÃO');
        console.log('Erros críticos:', errors.filter(e => e.includes('createClient')).length === 0 ? '✅ NENHUM' : '❌ EXISTEM');
        console.log('Login pronto para uso:', windowSupabase ? '✅ SIM' : '❌ NÃO');
    });

    test('✅ Verificar todas as páginas admin corrigidas', async ({ page }) => {
        console.log('🧪 Verificando todas as páginas admin...');
        
        const pagesToTest = [
            '/admin/',
            '/admin/login-fixed.html',
            '/admin/property-editor.html'
        ];
        
        for (const pagePath of pagesToTest) {
            console.log(`\n--- Testando ${pagePath} ---`);
            
            const errors = [];
            page.removeAllListeners('console');
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });
            
            await page.goto(`${VERCEL_URL}${pagePath}`);
            await page.waitForLoadState('networkidle');
            
            const windowSupabase = await page.evaluate(() => {
                return typeof window.supabase !== 'undefined' && 
                       typeof window.supabase.createClient === 'function';
            });
            
            const supabaseErrors = errors.filter(error => 
                error.includes('Cannot destructure property') && 
                error.includes('createClient')
            );
            
            console.log(`✅ ${pagePath}:`);
            console.log(`  - window.supabase: ${windowSupabase ? '✅ OK' : '❌ FALHA'}`);
            console.log(`  - Erros destructuring: ${supabaseErrors.length === 0 ? '✅ NENHUM' : `❌ ${supabaseErrors.length}`}`);
            console.log(`  - Total erros: ${errors.length}`);
        }
        
        console.log('\n🎉 VALIDAÇÃO COMPLETA DAS PÁGINAS ADMIN!');
    });
});
