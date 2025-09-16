import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('🔍 INVESTIGAÇÃO COMPLETA DO ADMIN - FASE 2: TESTES FUNCIONAIS', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(20000);
    });

    test('📋 Mapear estrutura de navegação do admin', async ({ page }) => {
        console.log('🧪 Mapeando estrutura completa do admin...');
        
        const errors = [];
        const navigationStructure = {};
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Acessar página principal do admin
        await page.goto(`${VERCEL_URL}/admin/`);
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Acessou página principal do admin');
        
        // Mapear menus e navegação principal
        try {
            const mainNavigation = await page.locator('nav, .navigation, .menu, .sidebar').all();
            console.log(`📊 Encontrados ${mainNavigation.length} elementos de navegação`);
            
            // Mapear links de navegação
            const navLinks = await page.locator('a[href*="admin"], button[onclick*="admin"]').all();
            const navigationItems = [];
            
            for (let i = 0; i < navLinks.length && i < 20; i++) {
                try {
                    const link = navLinks[i];
                    const text = await link.textContent();
                    const href = await link.getAttribute('href');
                    const onclick = await link.getAttribute('onclick');
                    
                    if (text && text.trim()) {
                        navigationItems.push({
                            text: text.trim(),
                            href: href,
                            onclick: onclick
                        });
                    }
                } catch (e) {
                    console.log(`⚠️ Erro ao processar link ${i}:`, e.message);
                }
            }
            
            navigationStructure.mainNavigation = navigationItems;
            console.log('📋 Itens de navegação encontrados:', navigationItems.length);
            
        } catch (e) {
            console.log('⚠️ Erro ao mapear navegação:', e.message);
        }
        
        // Mapear botões e ações principais
        try {
            const actionButtons = await page.locator('button, .btn, input[type="button"]').all();
            const buttons = [];
            
            for (let i = 0; i < actionButtons.length && i < 15; i++) {
                try {
                    const button = actionButtons[i];
                    const text = await button.textContent();
                    const type = await button.getAttribute('type');
                    const className = await button.getAttribute('class');
                    
                    if (text && text.trim()) {
                        buttons.push({
                            text: text.trim(),
                            type: type,
                            className: className
                        });
                    }
                } catch (e) {
                    console.log(`⚠️ Erro ao processar botão ${i}:`, e.message);
                }
            }
            
            navigationStructure.actionButtons = buttons;
            console.log('🔘 Botões de ação encontrados:', buttons.length);
            
        } catch (e) {
            console.log('⚠️ Erro ao mapear botões:', e.message);
        }
        
        // Mapear seções principais da página
        try {
            const sections = await page.locator('section, .section, .card, .panel').all();
            const sectionInfo = [];
            
            for (let i = 0; i < sections.length && i < 10; i++) {
                try {
                    const section = sections[i];
                    const heading = await section.locator('h1, h2, h3, h4, .title').first().textContent();
                    const className = await section.getAttribute('class');
                    
                    if (heading && heading.trim()) {
                        sectionInfo.push({
                            heading: heading.trim(),
                            className: className
                        });
                    }
                } catch (e) {
                    console.log(`⚠️ Erro ao processar seção ${i}:`, e.message);
                }
            }
            
            navigationStructure.sections = sectionInfo;
            console.log('📑 Seções encontradas:', sectionInfo.length);
            
        } catch (e) {
            console.log('⚠️ Erro ao mapear seções:', e.message);
        }
        
        // Relatório do mapeamento
        console.log('\n📊 ESTRUTURA DE NAVEGAÇÃO MAPEADA:');
        console.log('Itens de navegação:', navigationStructure.mainNavigation?.length || 0);
        console.log('Botões de ação:', navigationStructure.actionButtons?.length || 0);
        console.log('Seções principais:', navigationStructure.sections?.length || 0);
        console.log('Erros encontrados:', errors.length);
        
        // Salvar screenshot
        await page.screenshot({ 
            path: 'test-results/admin-navigation-map.png',
            fullPage: true 
        });
        console.log('📸 Screenshot salvo: test-results/admin-navigation-map.png');
        
        // Salvar estrutura mapeada
        console.log('\n📋 DETALHES DA NAVEGAÇÃO:');
        if (navigationStructure.mainNavigation) {
            navigationStructure.mainNavigation.forEach((item, index) => {
                console.log(`${index + 1}. "${item.text}" -> ${item.href || item.onclick || 'N/A'}`);
            });
        }
    });

    test('🧪 Testar funcionalidade de Upload de Imagens', async ({ page }) => {
        console.log('🧪 Testando Upload de Imagens em detalhes...');

        const errors = [];
        const networkRequests = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ Erro:', msg.text());
            }
        });

        page.on('request', request => {
            networkRequests.push({
                url: request.url(),
                method: request.method()
            });
        });

        await page.goto(`${VERCEL_URL}/admin/image-upload.html`);
        await page.waitForLoadState('networkidle');

        console.log('✅ Página Upload de Imagens carregada');

        // Testar elementos da interface
        const fileInput = page.locator('input[type="file"]');
        const uploadButton = page.locator('button:has-text("Upload"), .upload-btn');
        const progressBar = page.locator('.progress, .progress-bar');

        console.log('🔍 Elementos encontrados:');
        console.log('- Input de arquivo:', await fileInput.count());
        console.log('- Botão de upload:', await uploadButton.count());
        console.log('- Barra de progresso:', await progressBar.count());

        // Testar funcionalidade de upload (simulação)
        if (await fileInput.count() > 0) {
            console.log('📁 Testando seleção de arquivo...');
            // Simular seleção de arquivo
            try {
                await fileInput.setInputFiles([]);
                console.log('✅ Input de arquivo funcional');
            } catch (e) {
                console.log('❌ Erro no input de arquivo:', e.message);
            }
        }

        // Verificar se há preview de imagens
        const imagePreview = page.locator('.preview, .image-preview, img');
        console.log('🖼️ Elementos de preview:', await imagePreview.count());

        console.log('\n📊 RELATÓRIO UPLOAD DE IMAGENS:');
        console.log('Erros encontrados:', errors.length);
        console.log('Requests de rede:', networkRequests.length);

        await page.screenshot({
            path: 'test-results/admin-upload-test.png',
            fullPage: true
        });
    });

    test('🧪 Testar funcionalidade de Configurações do Site', async ({ page }) => {
        console.log('🧪 Testando Configurações do Site em detalhes...');

        const errors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ Erro:', msg.text());
            }
        });

        await page.goto(`${VERCEL_URL}/admin/site-settings.html`);
        await page.waitForLoadState('networkidle');

        console.log('✅ Página Configurações carregada');

        // Mapear todos os campos de configuração
        const textInputs = page.locator('input[type="text"], input[type="email"], input[type="url"]');
        const textareas = page.locator('textarea');
        const selects = page.locator('select');
        const checkboxes = page.locator('input[type="checkbox"]');
        const saveButton = page.locator('button:has-text("Salvar"), .save-btn');

        console.log('🔍 Campos de configuração:');
        console.log('- Inputs de texto:', await textInputs.count());
        console.log('- Textareas:', await textareas.count());
        console.log('- Selects:', await selects.count());
        console.log('- Checkboxes:', await checkboxes.count());
        console.log('- Botão salvar:', await saveButton.count());

        // Testar preenchimento de campos
        const inputCount = await textInputs.count();
        if (inputCount > 0) {
            console.log('📝 Testando preenchimento de campos...');
            for (let i = 0; i < Math.min(inputCount, 3); i++) {
                try {
                    const input = textInputs.nth(i);
                    const placeholder = await input.getAttribute('placeholder');
                    await input.fill('Teste de configuração');
                    console.log(`✅ Campo ${i + 1} preenchido (${placeholder})`);
                } catch (e) {
                    console.log(`❌ Erro no campo ${i + 1}:`, e.message);
                }
            }
        }

        console.log('\n📊 RELATÓRIO CONFIGURAÇÕES:');
        console.log('Erros encontrados:', errors.length);
        console.log('Total de campos:', await textInputs.count() + await textareas.count());

        await page.screenshot({
            path: 'test-results/admin-settings-test.png',
            fullPage: true
        });
    });

    test('🧪 Testar funcionalidade de Criação de Propriedades', async ({ page }) => {
        console.log('🧪 Testando Criação de Propriedades em detalhes...');

        const errors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ Erro:', msg.text());
            }
        });

        await page.goto(`${VERCEL_URL}/admin/property-editor.html`);
        await page.waitForLoadState('networkidle');

        console.log('✅ Página Editor de Propriedades carregada');

        // Verificar formulário de criação
        const form = page.locator('form');
        const titleInput = page.locator('input[name="title"], #title, #propertyTitle');
        const descriptionInput = page.locator('textarea[name="description"], #description');
        const priceInput = page.locator('input[name="price"], #price');
        const addressInput = page.locator('input[name="address"], #address');
        const submitButton = page.locator('button[type="submit"], .submit-btn, button:has-text("Salvar")');

        console.log('🔍 Elementos do formulário:');
        console.log('- Formulário:', await form.count());
        console.log('- Campo título:', await titleInput.count());
        console.log('- Campo descrição:', await descriptionInput.count());
        console.log('- Campo preço:', await priceInput.count());
        console.log('- Campo endereço:', await addressInput.count());
        console.log('- Botão submit:', await submitButton.count());

        // Testar preenchimento do formulário
        if (await titleInput.count() > 0) {
            console.log('📝 Testando preenchimento do formulário...');
            try {
                await titleInput.fill('Propriedade Teste');
                console.log('✅ Título preenchido');

                if (await descriptionInput.count() > 0) {
                    await descriptionInput.fill('Descrição de teste para a propriedade');
                    console.log('✅ Descrição preenchida');
                }

                if (await priceInput.count() > 0) {
                    await priceInput.fill('500000');
                    console.log('✅ Preço preenchido');
                }

                if (await addressInput.count() > 0) {
                    await addressInput.fill('Rua Teste, 123');
                    console.log('✅ Endereço preenchido');
                }

            } catch (e) {
                console.log('❌ Erro ao preencher formulário:', e.message);
            }
        }

        console.log('\n📊 RELATÓRIO CRIAÇÃO DE PROPRIEDADES:');
        console.log('Erros encontrados:', errors.length);
        console.log('Formulário funcional:', await form.count() > 0);

        await page.screenshot({
            path: 'test-results/admin-property-editor-test.png',
            fullPage: true
        });
    });
        
        const pageResults = [];
        
        for (const adminPage of adminPages) {
            console.log(`\n--- Testando: ${adminPage.name} ---`);
            
            const errors = [];
            page.removeAllListeners('console');
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });
            
            try {
                await page.goto(`${VERCEL_URL}${adminPage.url}`);
                await page.waitForLoadState('networkidle');
                
                // Verificar se a página carregou
                const title = await page.title();
                const hasContent = await page.locator('body').isVisible();
                
                // Verificar se há formulários
                const forms = await page.locator('form').count();
                
                // Verificar se há campos de input
                const inputs = await page.locator('input, textarea, select').count();
                
                // Verificar se há botões
                const buttons = await page.locator('button, .btn').count();
                
                const result = {
                    name: adminPage.name,
                    url: adminPage.url,
                    accessible: true,
                    title: title,
                    hasContent: hasContent,
                    forms: forms,
                    inputs: inputs,
                    buttons: buttons,
                    errors: errors.length,
                    errorMessages: errors
                };
                
                pageResults.push(result);
                
                console.log(`✅ ${adminPage.name}:`);
                console.log(`  - Acessível: ${result.accessible}`);
                console.log(`  - Título: ${result.title}`);
                console.log(`  - Formulários: ${result.forms}`);
                console.log(`  - Campos: ${result.inputs}`);
                console.log(`  - Botões: ${result.buttons}`);
                console.log(`  - Erros: ${result.errors}`);
                
            } catch (e) {
                const result = {
                    name: adminPage.name,
                    url: adminPage.url,
                    accessible: false,
                    error: e.message,
                    errors: errors.length,
                    errorMessages: errors
                };
                
                pageResults.push(result);
                console.log(`❌ ${adminPage.name}: ${e.message}`);
            }
        }
        
        // Relatório final
        console.log('\n📊 RELATÓRIO DE ACESSO ÀS PÁGINAS ADMIN:');
        const accessible = pageResults.filter(p => p.accessible).length;
        const total = pageResults.length;
        
        console.log(`Páginas acessíveis: ${accessible}/${total}`);
        console.log(`Taxa de sucesso: ${((accessible/total) * 100).toFixed(1)}%`);
        
        // Páginas com problemas
        const problematic = pageResults.filter(p => !p.accessible || p.errors > 0);
        if (problematic.length > 0) {
            console.log('\n⚠️ PÁGINAS COM PROBLEMAS:');
            problematic.forEach(page => {
                console.log(`- ${page.name}: ${page.accessible ? `${page.errors} erros` : 'Inacessível'}`);
            });
        }
    });
});
