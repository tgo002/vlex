import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('🔍 VALIDAÇÃO DAS CORREÇÕES ADMIN - FASE 3', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(20000);
    });

    test('✅ Validar correção do Upload de Imagens', async ({ page }) => {
        console.log('🧪 Validando correções no Upload de Imagens...');
        
        const errors = [];
        const mimeErrors = [];
        const notFoundErrors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const errorText = msg.text();
                errors.push(errorText);
                
                if (errorText.includes('disallowed MIME type')) {
                    mimeErrors.push(errorText);
                }
                if (errorText.includes('404') || errorText.includes('Failed to load resource')) {
                    notFoundErrors.push(errorText);
                }
                
                console.log('❌ Erro:', errorText);
            }
        });
        
        await page.goto(`${VERCEL_URL}/admin/image-upload.html`);
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Página Upload de Imagens carregada');
        
        // Verificar se elementos básicos estão presentes
        const fileInput = page.locator('input[type="file"]');
        const uploadButton = page.locator('button:has-text("Upload"), .upload-btn');
        
        console.log('🔍 Validação de elementos:');
        console.log('- Input de arquivo:', await fileInput.count());
        console.log('- Botão de upload:', await uploadButton.count());
        
        console.log('\n📊 RELATÓRIO DE CORREÇÕES:');
        console.log('Total de erros:', errors.length);
        console.log('Erros MIME type:', mimeErrors.length);
        console.log('Erros 404:', notFoundErrors.length);
        
        if (mimeErrors.length === 0) {
            console.log('✅ SUCESSO: Nenhum erro MIME type encontrado!');
        } else {
            console.log('❌ FALHA: Ainda há erros MIME type:');
            mimeErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        await page.screenshot({ 
            path: 'test-results/admin-upload-fixed.png',
            fullPage: true 
        });
    });

    test('✅ Validar correção do Gerenciador de Publicações', async ({ page }) => {
        console.log('🧪 Validando correções no Gerenciador de Publicações...');
        
        const errors = [];
        const mimeErrors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const errorText = msg.text();
                errors.push(errorText);
                
                if (errorText.includes('disallowed MIME type')) {
                    mimeErrors.push(errorText);
                }
                
                console.log('❌ Erro:', errorText);
            }
        });
        
        await page.goto(`${VERCEL_URL}/admin/publication-manager.html`);
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Página Gerenciador de Publicações carregada');
        
        // Verificar elementos básicos
        const searchInput = page.locator('input[type="search"], #searchInput');
        const filterSelect = page.locator('select, .filter-select');
        
        console.log('🔍 Validação de elementos:');
        console.log('- Campo de busca:', await searchInput.count());
        console.log('- Filtros:', await filterSelect.count());
        
        console.log('\n📊 RELATÓRIO DE CORREÇÕES:');
        console.log('Total de erros:', errors.length);
        console.log('Erros MIME type:', mimeErrors.length);
        
        if (mimeErrors.length === 0) {
            console.log('✅ SUCESSO: Nenhum erro MIME type encontrado!');
        }
        
        await page.screenshot({ 
            path: 'test-results/admin-publication-fixed.png',
            fullPage: true 
        });
    });

    test('✅ Validar correção do Gerenciador de Leads', async ({ page }) => {
        console.log('🧪 Validando correções no Gerenciador de Leads...');
        
        const errors = [];
        const mimeErrors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const errorText = msg.text();
                errors.push(errorText);
                
                if (errorText.includes('disallowed MIME type')) {
                    mimeErrors.push(errorText);
                }
                
                console.log('❌ Erro:', errorText);
            }
        });
        
        await page.goto(`${VERCEL_URL}/admin/leads-manager.html`);
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Página Gerenciador de Leads carregada');
        
        // Verificar elementos básicos
        const leadsTable = page.locator('table, .leads-table');
        const exportButton = page.locator('button:has-text("Export"), .export-btn');
        
        console.log('🔍 Validação de elementos:');
        console.log('- Tabela de leads:', await leadsTable.count());
        console.log('- Botão de export:', await exportButton.count());
        
        console.log('\n📊 RELATÓRIO DE CORREÇÕES:');
        console.log('Total de erros:', errors.length);
        console.log('Erros MIME type:', mimeErrors.length);
        
        if (mimeErrors.length === 0) {
            console.log('✅ SUCESSO: Nenhum erro MIME type encontrado!');
        }
        
        await page.screenshot({ 
            path: 'test-results/admin-leads-fixed.png',
            fullPage: true 
        });
    });

    test('✅ Validar correção do Preview do Tour', async ({ page }) => {
        console.log('🧪 Validando correções no Preview do Tour...');
        
        const errors = [];
        const mimeErrors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const errorText = msg.text();
                errors.push(errorText);
                
                if (errorText.includes('disallowed MIME type')) {
                    mimeErrors.push(errorText);
                }
                
                console.log('❌ Erro:', errorText);
            }
        });
        
        await page.goto(`${VERCEL_URL}/admin/tour-preview.html`);
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Página Preview do Tour carregada');
        
        // Verificar elementos básicos
        const propertySelect = page.locator('select, #propertySelect');
        const previewArea = page.locator('.preview-area, #previewArea');
        
        console.log('🔍 Validação de elementos:');
        console.log('- Seletor de propriedade:', await propertySelect.count());
        console.log('- Área de preview:', await previewArea.count());
        
        console.log('\n📊 RELATÓRIO DE CORREÇÕES:');
        console.log('Total de erros:', errors.length);
        console.log('Erros MIME type:', mimeErrors.length);
        
        if (mimeErrors.length === 0) {
            console.log('✅ SUCESSO: Nenhum erro MIME type encontrado!');
        }
        
        await page.screenshot({ 
            path: 'test-results/admin-tour-preview-fixed.png',
            fullPage: true 
        });
    });

    test('🎯 Teste Geral - Todas as Páginas Admin', async ({ page }) => {
        console.log('🧪 Testando todas as páginas admin após correções...');
        
        const adminPages = [
            { name: 'Upload de Imagens', url: '/admin/image-upload.html' },
            { name: 'Gerenciador de Publicações', url: '/admin/publication-manager.html' },
            { name: 'Gerenciador de Leads', url: '/admin/leads-manager.html' },
            { name: 'Preview do Tour', url: '/admin/tour-preview.html' }
        ];
        
        const results = [];
        
        for (const adminPage of adminPages) {
            console.log(`\n--- Testando: ${adminPage.name} ---`);
            
            const pageErrors = [];
            const mimeErrors = [];
            
            page.removeAllListeners('console');
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    const errorText = msg.text();
                    pageErrors.push(errorText);
                    
                    if (errorText.includes('disallowed MIME type')) {
                        mimeErrors.push(errorText);
                    }
                }
            });
            
            try {
                await page.goto(`${VERCEL_URL}${adminPage.url}`);
                await page.waitForLoadState('networkidle');
                
                const title = await page.title();
                
                results.push({
                    name: adminPage.name,
                    url: adminPage.url,
                    accessible: true,
                    title: title,
                    totalErrors: pageErrors.length,
                    mimeErrors: mimeErrors.length,
                    status: mimeErrors.length === 0 ? 'CORRIGIDO' : 'AINDA COM PROBLEMAS'
                });
                
                console.log(`✅ ${adminPage.name}: ${mimeErrors.length === 0 ? 'CORRIGIDO' : 'AINDA COM PROBLEMAS'}`);
                console.log(`   - Título: ${title}`);
                console.log(`   - Erros totais: ${pageErrors.length}`);
                console.log(`   - Erros MIME: ${mimeErrors.length}`);
                
            } catch (e) {
                results.push({
                    name: adminPage.name,
                    url: adminPage.url,
                    accessible: false,
                    error: e.message,
                    status: 'ERRO DE ACESSO'
                });
                
                console.log(`❌ ${adminPage.name}: ERRO DE ACESSO - ${e.message}`);
            }
        }
        
        console.log('\n📊 RELATÓRIO FINAL DAS CORREÇÕES:');
        const corrigidas = results.filter(r => r.status === 'CORRIGIDO').length;
        const total = results.length;
        
        console.log(`Páginas corrigidas: ${corrigidas}/${total}`);
        console.log(`Taxa de sucesso: ${(corrigidas/total*100).toFixed(1)}%`);
        
        if (corrigidas === total) {
            console.log('🎉 TODAS AS PÁGINAS FORAM CORRIGIDAS COM SUCESSO!');
        } else {
            console.log('⚠️ Algumas páginas ainda precisam de correções:');
            results.filter(r => r.status !== 'CORRIGIDO').forEach(result => {
                console.log(`- ${result.name}: ${result.status}`);
            });
        }
    });
});
