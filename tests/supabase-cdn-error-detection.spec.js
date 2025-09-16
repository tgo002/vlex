import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('🎯 DETECÇÃO ESPECÍFICA: Erro Supabase CDN', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(30000);
    });

    test('🔍 TESTE 1: publication-manager/ - Detectar erro createClient', async ({ page }) => {
        console.log('🔍 TESTE 1 - INVESTIGANDO: https://virtual-ochre.vercel.app/admin/publication-manager/');

        const supabaseErrors = [];
        const createClientErrors = [];
        const cdnStatus = [];

        // Capturar ESPECIFICAMENTE erros de Supabase
        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'error') {
                console.log('❌ ERRO CONSOLE:', text);

                // Detectar especificamente o erro que o usuário reportou
                if (text.includes('Cannot destructure property') && text.includes('createClient')) {
                    createClientErrors.push(text);
                    console.log('🚨 ERRO ESPECÍFICO DETECTADO:', text);
                }

                if (text.includes('supabase') || text.includes('window.supabase')) {
                    supabaseErrors.push(text);
                    console.log('🚨 ERRO SUPABASE DETECTADO:', text);
                }
            }
        });

        // Monitorar carregamento do CDN
        page.on('response', response => {
            const url = response.url();
            if (url.includes('supabase-js')) {
                cdnStatus.push({
                    url: url,
                    status: response.status()
                });
                console.log(`📡 CDN SUPABASE: ${response.status()} ${url}`);
            }
        });

        try {
            await page.goto(`${VERCEL_URL}/admin/publication-manager/`);
            await page.waitForLoadState('networkidle');

            // Aguardar um pouco para garantir que todos os scripts carregaram
            await page.waitForTimeout(3000);

            console.log('✅ Página carregada, verificando erros...');

            // Verificar se window.supabase está disponível
            const windowSupabase = await page.evaluate(() => {
                return {
                    exists: typeof window.supabase !== 'undefined',
                    type: typeof window.supabase,
                    hasCreateClient: window.supabase && typeof window.supabase.createClient === 'function'
                };
            });

            console.log('🔍 VERIFICAÇÃO window.supabase:');
            console.log('- Existe:', windowSupabase.exists);
            console.log('- Tipo:', windowSupabase.type);
            console.log('- Tem createClient:', windowSupabase.hasCreateClient);

            // Verificar CDN
            console.log('📡 STATUS DO CDN:');
            console.log('- CDNs carregados:', cdnStatus.length);
            cdnStatus.forEach((cdn, index) => {
                console.log(`${index + 1}. ${cdn.status} ${cdn.url}`);
            });

            console.log('\n📊 RELATÓRIO DE ERROS:');
            console.log('- Erros createClient:', createClientErrors.length);
            console.log('- Erros Supabase gerais:', supabaseErrors.length);

            if (createClientErrors.length > 0) {
                console.log('\n🚨 ERROS createClient ENCONTRADOS:');
                createClientErrors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error}`);
                });
            }

            // VALIDAÇÃO: Não deve haver erros de createClient
            expect(createClientErrors.length).toBe(0);
            expect(windowSupabase.exists).toBe(true);
            expect(windowSupabase.hasCreateClient).toBe(true);

            console.log('✅ TESTE 1 PASSOU: Sem erros createClient!');

        } catch (e) {
            console.log('❌ ERRO CRÍTICO NO TESTE:', e.message);
            throw e;
        }

        await page.screenshot({
            path: 'test-results/publication-manager-test1.png',
            fullPage: true
        });
    });

    test('🔍 TESTE 1: scene-manager/ - Detectar erro createClient', async ({ page }) => {
        console.log('🔍 TESTE 1 - INVESTIGANDO: https://virtual-ochre.vercel.app/admin/scene-manager/?propertyId=70411de0-e281-4504-9219-c14d4975ba46');

        const supabaseErrors = [];
        const createClientErrors = [];
        const cdnStatus = [];

        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'error') {
                console.log('❌ ERRO CONSOLE:', text);

                if (text.includes('Cannot destructure property') && text.includes('createClient')) {
                    createClientErrors.push(text);
                    console.log('🚨 ERRO ESPECÍFICO DETECTADO:', text);
                }

                if (text.includes('supabase') || text.includes('window.supabase')) {
                    supabaseErrors.push(text);
                    console.log('🚨 ERRO SUPABASE DETECTADO:', text);
                }
            }
        });

        page.on('response', response => {
            const url = response.url();
            if (url.includes('supabase-js')) {
                cdnStatus.push({
                    url: url,
                    status: response.status()
                });
                console.log(`📡 CDN SUPABASE: ${response.status()} ${url}`);
            }
        });

        try {
            await page.goto(`${VERCEL_URL}/admin/scene-manager/?propertyId=70411de0-e281-4504-9219-c14d4975ba46`);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);

            console.log('✅ Página carregada, verificando erros...');

            const windowSupabase = await page.evaluate(() => {
                return {
                    exists: typeof window.supabase !== 'undefined',
                    type: typeof window.supabase,
                    hasCreateClient: window.supabase && typeof window.supabase.createClient === 'function'
                };
            });

            console.log('🔍 VERIFICAÇÃO window.supabase:');
            console.log('- Existe:', windowSupabase.exists);
            console.log('- Tipo:', windowSupabase.type);
            console.log('- Tem createClient:', windowSupabase.hasCreateClient);

            console.log('\n📊 RELATÓRIO DE ERROS:');
            console.log('- Erros createClient:', createClientErrors.length);
            console.log('- Erros Supabase gerais:', supabaseErrors.length);

            if (createClientErrors.length > 0) {
                console.log('\n🚨 ERROS createClient ENCONTRADOS:');
                createClientErrors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error}`);
                });
            }

            expect(createClientErrors.length).toBe(0);
            expect(windowSupabase.exists).toBe(true);
            expect(windowSupabase.hasCreateClient).toBe(true);

            console.log('✅ TESTE 1 PASSOU: Sem erros createClient!');

        } catch (e) {
            console.log('❌ ERRO CRÍTICO NO TESTE:', e.message);
            throw e;
        }

        await page.screenshot({
            path: 'test-results/scene-manager-test1.png',
            fullPage: true
        });
    });

    test('🔍 TESTE 1: hotspot-editor/ - Detectar erro createClient', async ({ page }) => {
        console.log('🔍 TESTE 1 - INVESTIGANDO: https://virtual-ochre.vercel.app/admin/hotspot-editor/?propertyId=8953a03b-64d1-49ce-bb62-7b6d383ae67b');

        const supabaseErrors = [];
        const createClientErrors = [];
        const cdnStatus = [];

        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'error') {
                console.log('❌ ERRO CONSOLE:', text);
                if (text.includes('Cannot destructure property') && text.includes('createClient')) {
                    createClientErrors.push(text);
                    console.log('🚨 ERRO ESPECÍFICO DETECTADO:', text);
                }
                if (text.includes('supabase') || text.includes('window.supabase')) {
                    supabaseErrors.push(text);
                    console.log('🚨 ERRO SUPABASE DETECTADO:', text);
                }
            }
        });

        page.on('response', response => {
            const url = response.url();
            if (url.includes('supabase-js')) {
                cdnStatus.push({ url, status: response.status() });
                console.log(`📡 CDN SUPABASE: ${response.status()} ${url}`);
            }
        });

        try {
            await page.goto(`${VERCEL_URL}/admin/hotspot-editor/?propertyId=8953a03b-64d1-49ce-bb62-7b6d383ae67b`);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);

            const windowSupabase = await page.evaluate(() => ({
                exists: typeof window.supabase !== 'undefined',
                type: typeof window.supabase,
                hasCreateClient: window.supabase && typeof window.supabase.createClient === 'function'
            }));

            console.log('🔍 VERIFICAÇÃO window.supabase:');
            console.log('- Existe:', windowSupabase.exists);
            console.log('- Tipo:', windowSupabase.type);
            console.log('- Tem createClient:', windowSupabase.hasCreateClient);

            expect(createClientErrors.length).toBe(0);
            expect(windowSupabase.exists).toBe(true);
            expect(windowSupabase.hasCreateClient).toBe(true);
        } catch (e) {
            console.log('❌ ERRO CRÍTICO NO TESTE:', e.message);
            throw e;
        }

        await page.screenshot({
            path: 'test-results/hotspot-editor-test1.png',
            fullPage: true
        });
    });

});
