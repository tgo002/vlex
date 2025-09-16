import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('🔍 FASE 2: TESTES FUNCIONAIS DETALHADOS DO ADMIN', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(20000);
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
        console.log('Funcionalidade básica:', await fileInput.count() > 0 ? 'Presente' : 'Ausente');
        
        if (errors.length > 0) {
            console.log('\n❌ ERROS DETALHADOS:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
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
        console.log('Funcionalidade básica:', inputCount > 0 ? 'Presente' : 'Ausente');
        
        if (errors.length > 0) {
            console.log('\n❌ ERROS DETALHADOS:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
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
        console.log('Campos principais:', await titleInput.count() > 0 ? 'Presentes' : 'Ausentes');
        
        if (errors.length > 0) {
            console.log('\n❌ ERROS DETALHADOS:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        await page.screenshot({ 
            path: 'test-results/admin-property-editor-test.png',
            fullPage: true 
        });
    });
});
