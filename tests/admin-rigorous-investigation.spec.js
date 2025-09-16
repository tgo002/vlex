import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://virtual-ochre.vercel.app';

test.describe('🔍 INVESTIGAÇÃO RIGOROSA - URLs Problemáticas Específicas', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(30000);
    });

    test('🚨 Investigar publication-manager/ com barra final', async ({ page }) => {
        console.log('🔍 INVESTIGANDO: https://virtual-ochre.vercel.app/admin/publication-manager/');
        
        const errors = [];
        const networkFailures = [];
        const consoleWarnings = [];
        
        // Capturar TODOS os tipos de erros
        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'error') {
                errors.push(text);
                console.log('❌ ERRO CONSOLE:', text);
            } else if (msg.type() === 'warning') {
                consoleWarnings.push(text);
                console.log('⚠️ WARNING:', text);
            }
        });
        
        page.on('requestfailed', request => {
            networkFailures.push({
                url: request.url(),
                failure: request.failure()?.errorText || 'Unknown error'
            });
            console.log('❌ FALHA DE REDE:', request.url(), request.failure()?.errorText);
        });
        
        page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`❌ RESPOSTA ${response.status()}:`, response.url());
            }
        });
        
        try {
            console.log('📡 Navegando para a URL...');
            await page.goto(`${VERCEL_URL}/admin/publication-manager/`);
            await page.waitForLoadState('networkidle');
            
            console.log('✅ Página carregada, verificando funcionalidades...');
            
            // Verificar se a página realmente carregou conteúdo
            const bodyText = await page.locator('body').textContent();
            const hasContent = bodyText && bodyText.trim().length > 100;
            
            console.log('📄 Conteúdo da página:', hasContent ? 'Presente' : 'Ausente/Mínimo');
            console.log('📏 Tamanho do conteúdo:', bodyText?.length || 0, 'caracteres');
            
            // Verificar elementos específicos do gerenciador de publicações
            const publicationTable = page.locator('table, .publication-table, .publications-list');
            const searchInput = page.locator('input[type="search"], #searchInput, .search-input');
            const filterSelect = page.locator('select, .filter-select');
            const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Nova"), .add-btn');
            const publishButton = page.locator('button:has-text("Publicar"), .publish-btn');
            
            console.log('🔍 ELEMENTOS FUNCIONAIS:');
            console.log('- Tabela/Lista de publicações:', await publicationTable.count());
            console.log('- Campo de busca:', await searchInput.count());
            console.log('- Filtros:', await filterSelect.count());
            console.log('- Botão adicionar:', await addButton.count());
            console.log('- Botão publicar:', await publishButton.count());
            
            // Testar funcionalidades específicas
            if (await searchInput.count() > 0) {
                console.log('🧪 Testando funcionalidade de busca...');
                try {
                    await searchInput.first().fill('teste');
                    await page.waitForTimeout(1000);
                    console.log('✅ Campo de busca funcional');
                } catch (e) {
                    console.log('❌ Erro na busca:', e.message);
                }
            }
            
            // Verificar se dados estão sendo carregados
            const loadingIndicator = page.locator('.loading, .spinner, [data-loading]');
            const dataRows = page.locator('tr, .publication-item, .data-row');
            
            console.log('📊 CARREGAMENTO DE DADOS:');
            console.log('- Indicador de loading:', await loadingIndicator.count());
            console.log('- Linhas de dados:', await dataRows.count());
            
            // Verificar se há mensagens de erro na interface
            const errorMessages = page.locator('.error, .alert-danger, .error-message');
            console.log('- Mensagens de erro na UI:', await errorMessages.count());
            
            if (await errorMessages.count() > 0) {
                const errorTexts = await errorMessages.allTextContents();
                console.log('❌ ERROS NA INTERFACE:');
                errorTexts.forEach((text, index) => {
                    console.log(`${index + 1}. ${text}`);
                });
            }
            
        } catch (e) {
            console.log('❌ ERRO CRÍTICO:', e.message);
            errors.push(`Erro crítico: ${e.message}`);
        }
        
        console.log('\n📊 RELATÓRIO DETALHADO - PUBLICATION MANAGER:');
        console.log('Erros de console:', errors.length);
        console.log('Falhas de rede:', networkFailures.length);
        console.log('Warnings:', consoleWarnings.length);
        
        if (errors.length > 0) {
            console.log('\n❌ ERROS ENCONTRADOS:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        if (networkFailures.length > 0) {
            console.log('\n🌐 FALHAS DE REDE:');
            networkFailures.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure.url} - ${failure.failure}`);
            });
        }
        
        await page.screenshot({ 
            path: 'test-results/publication-manager-investigation.png',
            fullPage: true 
        });
        
        console.log('📸 Screenshot salvo: test-results/publication-manager-investigation.png');
    });

    test('🚨 Investigar site-settings/ com barra final', async ({ page }) => {
        console.log('🔍 INVESTIGANDO: https://virtual-ochre.vercel.app/admin/site-settings/');
        
        const errors = [];
        const networkFailures = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                errors.push(text);
                console.log('❌ ERRO CONSOLE:', text);
            }
        });
        
        page.on('requestfailed', request => {
            networkFailures.push({
                url: request.url(),
                failure: request.failure()?.errorText || 'Unknown error'
            });
            console.log('❌ FALHA DE REDE:', request.url());
        });
        
        try {
            await page.goto(`${VERCEL_URL}/admin/site-settings/`);
            await page.waitForLoadState('networkidle');
            
            console.log('✅ Página carregada, verificando funcionalidades...');
            
            // Verificar elementos específicos de configurações
            const settingsForm = page.locator('form, .settings-form');
            const textInputs = page.locator('input[type="text"], input[type="email"], input[type="url"]');
            const textareas = page.locator('textarea');
            const checkboxes = page.locator('input[type="checkbox"]');
            const saveButton = page.locator('button:has-text("Salvar"), .save-btn');
            const resetButton = page.locator('button:has-text("Reset"), .reset-btn');
            
            console.log('🔍 ELEMENTOS DE CONFIGURAÇÃO:');
            console.log('- Formulário de configurações:', await settingsForm.count());
            console.log('- Campos de texto:', await textInputs.count());
            console.log('- Áreas de texto:', await textareas.count());
            console.log('- Checkboxes:', await checkboxes.count());
            console.log('- Botão salvar:', await saveButton.count());
            console.log('- Botão reset:', await resetButton.count());
            
            // Testar preenchimento de campos
            const inputCount = await textInputs.count();
            if (inputCount > 0) {
                console.log('🧪 Testando preenchimento de campos...');
                try {
                    const firstInput = textInputs.first();
                    await firstInput.fill('Teste de configuração');
                    const value = await firstInput.inputValue();
                    console.log('✅ Campo preenchido com sucesso:', value);
                } catch (e) {
                    console.log('❌ Erro ao preencher campo:', e.message);
                }
            }
            
            // Verificar se configurações estão sendo carregadas
            const loadedValues = [];
            for (let i = 0; i < Math.min(await textInputs.count(), 3); i++) {
                const input = textInputs.nth(i);
                const value = await input.inputValue();
                const placeholder = await input.getAttribute('placeholder');
                loadedValues.push({ index: i, value, placeholder });
            }
            
            console.log('📊 VALORES CARREGADOS:');
            loadedValues.forEach(item => {
                console.log(`Campo ${item.index}: "${item.value}" (placeholder: "${item.placeholder}")`);
            });
            
        } catch (e) {
            console.log('❌ ERRO CRÍTICO:', e.message);
            errors.push(`Erro crítico: ${e.message}`);
        }
        
        console.log('\n📊 RELATÓRIO DETALHADO - SITE SETTINGS:');
        console.log('Erros de console:', errors.length);
        console.log('Falhas de rede:', networkFailures.length);
        
        if (errors.length > 0) {
            console.log('\n❌ ERROS ENCONTRADOS:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        await page.screenshot({
            path: 'test-results/site-settings-investigation.png',
            fullPage: true
        });
    });

    test('🚨 Investigar scene-manager com propertyId específico', async ({ page }) => {
        console.log('🔍 INVESTIGANDO: https://virtual-ochre.vercel.app/admin/scene-manager/?propertyId=70411de0-e281-4504-9219-c14d4975ba46');

        const errors = [];
        const networkFailures = [];
        const apiCalls = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                errors.push(text);
                console.log('❌ ERRO CONSOLE:', text);
            }
        });

        page.on('requestfailed', request => {
            networkFailures.push({
                url: request.url(),
                failure: request.failure()?.errorText || 'Unknown error'
            });
            console.log('❌ FALHA DE REDE:', request.url());
        });

        page.on('response', response => {
            const url = response.url();
            if (url.includes('supabase') || url.includes('api')) {
                apiCalls.push({
                    url: url,
                    status: response.status(),
                    method: response.request().method()
                });
                console.log(`📡 API CALL: ${response.request().method()} ${response.status()} ${url}`);
            }
        });

        try {
            await page.goto(`${VERCEL_URL}/admin/scene-manager/?propertyId=70411de0-e281-4504-9219-c14d4975ba46`);
            await page.waitForLoadState('networkidle');

            console.log('✅ Página carregada, verificando funcionalidades específicas...');

            // Verificar se o propertyId foi capturado
            const currentUrl = page.url();
            const hasPropertyId = currentUrl.includes('propertyId=70411de0-e281-4504-9219-c14d4975ba46');
            console.log('🔗 URL atual:', currentUrl);
            console.log('🆔 PropertyId presente na URL:', hasPropertyId);

            // Verificar elementos específicos do gerenciador de cenas
            const scenesList = page.locator('.scenes-list, .scene-items, table');
            const addSceneButton = page.locator('button:has-text("Adicionar"), button:has-text("Nova Cena"), .add-scene-btn');
            const uploadButton = page.locator('button:has-text("Upload"), .upload-btn');
            const sceneItems = page.locator('.scene-item, tr, .scene-card');

            console.log('🔍 ELEMENTOS DO GERENCIADOR DE CENAS:');
            console.log('- Lista de cenas:', await scenesList.count());
            console.log('- Botão adicionar cena:', await addSceneButton.count());
            console.log('- Botão upload:', await uploadButton.count());
            console.log('- Itens de cena:', await sceneItems.count());

            // Verificar se dados da propriedade específica foram carregados
            const propertyTitle = page.locator('h1, .property-title, .page-title');
            const propertyInfo = page.locator('.property-info, .property-details');

            console.log('🏠 INFORMAÇÕES DA PROPRIEDADE:');
            console.log('- Título da propriedade:', await propertyTitle.count());
            console.log('- Informações da propriedade:', await propertyInfo.count());

            if (await propertyTitle.count() > 0) {
                const titleText = await propertyTitle.first().textContent();
                console.log('📝 Título encontrado:', titleText?.trim());
            }

            // Verificar se há indicadores de carregamento ou erro
            const loadingIndicator = page.locator('.loading, .spinner, [data-loading]');
            const errorMessages = page.locator('.error, .alert-danger, .error-message');
            const emptyState = page.locator('.empty-state, .no-data, .no-scenes');

            console.log('📊 ESTADO DA INTERFACE:');
            console.log('- Indicador de loading:', await loadingIndicator.count());
            console.log('- Mensagens de erro:', await errorMessages.count());
            console.log('- Estado vazio:', await emptyState.count());

            // Testar funcionalidade de adicionar cena
            if (await addSceneButton.count() > 0) {
                console.log('🧪 Testando botão adicionar cena...');
                try {
                    await addSceneButton.first().click();
                    await page.waitForTimeout(2000);

                    // Verificar se modal ou formulário apareceu
                    const modal = page.locator('.modal, .dialog, .popup');
                    const form = page.locator('form');
                    console.log('📝 Modal/Formulário aberto:', await modal.count() > 0 || await form.count() > 0);
                } catch (e) {
                    console.log('❌ Erro ao clicar em adicionar:', e.message);
                }
            }

            // Verificar chamadas de API específicas
            console.log('📡 CHAMADAS DE API DETECTADAS:');
            apiCalls.forEach((call, index) => {
                console.log(`${index + 1}. ${call.method} ${call.status} ${call.url}`);
            });

        } catch (e) {
            console.log('❌ ERRO CRÍTICO:', e.message);
            errors.push(`Erro crítico: ${e.message}`);
        }

        console.log('\n📊 RELATÓRIO DETALHADO - SCENE MANAGER:');
        console.log('Erros de console:', errors.length);
        console.log('Falhas de rede:', networkFailures.length);
        console.log('Chamadas de API:', apiCalls.length);

        if (errors.length > 0) {
            console.log('\n❌ ERROS ENCONTRADOS:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        if (networkFailures.length > 0) {
            console.log('\n🌐 FALHAS DE REDE:');
            networkFailures.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure.url} - ${failure.failure}`);
            });
        }

        await page.screenshot({
            path: 'test-results/scene-manager-investigation.png',
            fullPage: true
        });

        console.log('📸 Screenshot salvo: test-results/scene-manager-investigation.png');
    });
});
