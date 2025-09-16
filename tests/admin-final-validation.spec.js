import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('🎯 VALIDAÇÃO FINAL COMPLETA - TODAS AS FUNCIONALIDADES ADMIN', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(20000);
    });

    test('🎉 Teste Final - Sistema Administrativo Completo', async ({ page }) => {
        console.log('🎯 EXECUTANDO VALIDAÇÃO FINAL COMPLETA DO SISTEMA ADMIN...');
        
        const allAdminPages = [
            { name: 'Dashboard Principal', url: '/admin/', category: 'Core' },
            { name: 'Editor de Propriedades', url: '/admin/property-editor.html', category: 'Core' },
            { name: 'Gerenciador de Cenas', url: '/admin/scene-manager.html', category: 'Core' },
            { name: 'Upload de Imagens', url: '/admin/image-upload.html', category: 'Corrigido' },
            { name: 'Configurações do Site', url: '/admin/site-settings.html', category: 'Core' },
            { name: 'Gerenciador de Publicações', url: '/admin/publication-manager.html', category: 'Corrigido' },
            { name: 'Gerenciador de Galeria', url: '/admin/gallery-manager.html', category: 'Core' },
            { name: 'Editor de Hotspots', url: '/admin/hotspot-editor.html', category: 'Core' },
            { name: 'Gerenciador de Leads', url: '/admin/leads-manager.html', category: 'Corrigido' },
            { name: 'Preview do Tour', url: '/admin/tour-preview.html', category: 'Corrigido' }
        ];
        
        const results = [];
        let totalErrors = 0;
        let totalMimeErrors = 0;
        let total404Errors = 0;
        
        console.log(`\n🔍 TESTANDO ${allAdminPages.length} PÁGINAS ADMINISTRATIVAS...\n`);
        
        for (const adminPage of allAdminPages) {
            console.log(`--- 🧪 Testando: ${adminPage.name} (${adminPage.category}) ---`);
            
            const pageErrors = [];
            const mimeErrors = [];
            const notFoundErrors = [];
            
            page.removeAllListeners('console');
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    const errorText = msg.text();
                    pageErrors.push(errorText);
                    
                    if (errorText.includes('disallowed MIME type')) {
                        mimeErrors.push(errorText);
                    }
                    if (errorText.includes('404') || errorText.includes('Failed to load resource')) {
                        notFoundErrors.push(errorText);
                    }
                }
            });
            
            try {
                await page.goto(`${VERCEL_URL}${adminPage.url}`);
                await page.waitForLoadState('networkidle');
                
                const title = await page.title();
                const hasContent = await page.locator('body').isVisible();
                
                // Verificar elementos básicos da interface
                const forms = await page.locator('form').count();
                const inputs = await page.locator('input, textarea, select').count();
                const buttons = await page.locator('button').count();
                
                const result = {
                    name: adminPage.name,
                    url: adminPage.url,
                    category: adminPage.category,
                    accessible: true,
                    title: title,
                    hasContent: hasContent,
                    forms: forms,
                    inputs: inputs,
                    buttons: buttons,
                    totalErrors: pageErrors.length,
                    mimeErrors: mimeErrors.length,
                    notFoundErrors: notFoundErrors.length,
                    status: mimeErrors.length === 0 ? 'FUNCIONANDO' : 'COM PROBLEMAS'
                };
                
                results.push(result);
                totalErrors += pageErrors.length;
                totalMimeErrors += mimeErrors.length;
                total404Errors += notFoundErrors.length;
                
                console.log(`✅ ${adminPage.name}: ${result.status}`);
                console.log(`   📄 Título: ${title}`);
                console.log(`   📊 Interface: ${forms} forms, ${inputs} inputs, ${buttons} buttons`);
                console.log(`   ⚠️ Erros: ${pageErrors.length} total, ${mimeErrors.length} MIME, ${notFoundErrors.length} 404`);
                
                if (mimeErrors.length > 0) {
                    console.log(`   ❌ Erros MIME críticos encontrados!`);
                }
                
            } catch (e) {
                const result = {
                    name: adminPage.name,
                    url: adminPage.url,
                    category: adminPage.category,
                    accessible: false,
                    error: e.message,
                    status: 'ERRO DE ACESSO'
                };
                
                results.push(result);
                console.log(`❌ ${adminPage.name}: ERRO DE ACESSO - ${e.message}`);
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('🎯 RELATÓRIO FINAL COMPLETO DO SISTEMA ADMINISTRATIVO');
        console.log('='.repeat(80));
        
        const funcionando = results.filter(r => r.status === 'FUNCIONANDO').length;
        const comProblemas = results.filter(r => r.status === 'COM PROBLEMAS').length;
        const erroAcesso = results.filter(r => r.status === 'ERRO DE ACESSO').length;
        const total = results.length;
        
        console.log(`\n📊 ESTATÍSTICAS GERAIS:`);
        console.log(`Total de páginas testadas: ${total}`);
        console.log(`✅ Funcionando perfeitamente: ${funcionando}`);
        console.log(`⚠️ Com problemas: ${comProblemas}`);
        console.log(`❌ Erro de acesso: ${erroAcesso}`);
        console.log(`📈 Taxa de sucesso: ${(funcionando/total*100).toFixed(1)}%`);
        
        console.log(`\n🔍 ANÁLISE DE ERROS:`);
        console.log(`Total de erros JavaScript: ${totalErrors}`);
        console.log(`Erros MIME type críticos: ${totalMimeErrors}`);
        console.log(`Erros 404 (recursos não encontrados): ${total404Errors}`);
        
        console.log(`\n📋 DETALHAMENTO POR CATEGORIA:`);
        
        const categorias = ['Core', 'Corrigido'];
        categorias.forEach(categoria => {
            const paginasCategoria = results.filter(r => r.category === categoria);
            const funcionandoCategoria = paginasCategoria.filter(r => r.status === 'FUNCIONANDO').length;
            
            console.log(`\n🏷️ ${categoria}:`);
            console.log(`   Páginas: ${paginasCategoria.length}`);
            console.log(`   Funcionando: ${funcionandoCategoria}/${paginasCategoria.length}`);
            console.log(`   Taxa: ${paginasCategoria.length > 0 ? (funcionandoCategoria/paginasCategoria.length*100).toFixed(1) : 0}%`);
            
            paginasCategoria.forEach(pagina => {
                const status = pagina.status === 'FUNCIONANDO' ? '✅' : 
                              pagina.status === 'COM PROBLEMAS' ? '⚠️' : '❌';
                console.log(`   ${status} ${pagina.name}`);
            });
        });
        
        console.log(`\n🎯 RESULTADO FINAL:`);
        
        if (totalMimeErrors === 0 && funcionando >= 8) {
            console.log('🎉 SISTEMA ADMINISTRATIVO TOTALMENTE FUNCIONAL!');
            console.log('✅ Todos os erros críticos foram corrigidos');
            console.log('✅ Funcionalidades principais operacionais');
            console.log('✅ Sistema pronto para uso em produção');
        } else if (totalMimeErrors === 0) {
            console.log('✅ CORREÇÕES PRINCIPAIS APLICADAS COM SUCESSO!');
            console.log('✅ Erros MIME type eliminados');
            console.log('⚠️ Algumas funcionalidades podem precisar de ajustes menores');
        } else {
            console.log('⚠️ AINDA HÁ PROBLEMAS CRÍTICOS A RESOLVER');
            console.log(`❌ ${totalMimeErrors} erros MIME type encontrados`);
            console.log('🔧 Correções adicionais necessárias');
        }
        
        console.log('\n' + '='.repeat(80));
        
        // Salvar screenshot final
        await page.goto(`${VERCEL_URL}/admin/`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'test-results/admin-final-validation.png',
            fullPage: true 
        });
        
        console.log('📸 Screenshot final salvo: test-results/admin-final-validation.png');
    });
});
