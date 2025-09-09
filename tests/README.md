# Testes Automatizados - Sistema de Tours Virtuais 360°

Este diretório contém os testes automatizados E2E (End-to-End) usando Playwright para o Sistema de Tours Virtuais 360°.

## 📋 Estrutura dos Testes

```
tests/
├── playwright.config.js      # Configuração do Playwright
├── global-setup.js          # Setup global (usuário de teste, dados)
├── global-teardown.js       # Limpeza global após testes
├── admin-auth.spec.js        # Testes de autenticação admin
├── admin-properties.spec.js  # Testes de gerenciamento de propriedades
├── client-tour.spec.js       # Testes da interface cliente
└── README.md                # Este arquivo
```

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
# Instalar Node.js dependencies
npm install

# Instalar browsers do Playwright
npm run test:install
```

### 2. Configurar Ambiente

Antes de executar os testes, certifique-se de que:

1. **Supabase está configurado** com as tabelas necessárias
2. **Servidor local está rodando** na porta 3000
3. **Credenciais de teste** estão configuradas

### 3. Iniciar Servidor Local

```bash
# Iniciar servidor HTTP simples
npm run serve

# Ou em background
npm run serve:bg
```

## 🧪 Executando os Testes

### Todos os Testes

```bash
# Executar todos os testes
npm test

# Executar com interface visual
npm run test:headed

# Executar com modo debug
npm run test:debug

# Executar com UI interativa
npm run test:ui
```

### Testes Específicos

```bash
# Apenas testes de autenticação
npm run test:auth

# Apenas testes de propriedades
npm run test:properties

# Apenas testes da interface cliente
npm run test:client
```

### Testes por Browser

```bash
# Apenas Chrome
npx playwright test --project=chromium

# Apenas Firefox
npx playwright test --project=firefox

# Apenas Safari
npx playwright test --project=webkit

# Apenas Mobile
npx playwright test --project="Mobile Chrome"
```

## 📊 Relatórios

### Visualizar Relatórios

```bash
# Abrir relatório HTML
npm run test:report

# Ou diretamente
npx playwright show-report
```

### Arquivos de Relatório

- `test-results/` - Screenshots, vídeos, traces
- `playwright-report/` - Relatório HTML interativo
- `test-results/results.json` - Resultados em JSON
- `test-results/results.xml` - Resultados em XML (JUnit)

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# Executar em modo CI
CI=true npm test

# Configurar URL base diferente
BASE_URL=http://localhost:8080 npm test

# Configurar timeout personalizado
TIMEOUT=60000 npm test
```

### Configurações do Playwright

Edite `playwright.config.js` para:

- Alterar timeout dos testes
- Configurar diferentes browsers
- Modificar configurações de screenshot/vídeo
- Ajustar paralelização

## 📝 Escrevendo Novos Testes

### Estrutura Básica

```javascript
import { test, expect } from '@playwright/test';

test.describe('Minha Funcionalidade', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup antes de cada teste
    await page.goto('/minha-pagina.html');
  });

  test('deve fazer algo específico', async ({ page }) => {
    // Arrange
    await page.fill('#campo', 'valor');
    
    // Act
    await page.click('#botao');
    
    // Assert
    await expect(page.locator('#resultado')).toBeVisible();
  });

});
```

### Boas Práticas

1. **Use seletores estáveis** (IDs, data-testid)
2. **Aguarde elementos** com `waitFor` quando necessário
3. **Teste cenários de erro** além dos casos de sucesso
4. **Mantenha testes independentes** (não dependam uns dos outros)
5. **Use Page Object Model** para páginas complexas
6. **Teste responsividade** em diferentes viewports

### Seletores Recomendados

```javascript
// ✅ Bom - ID específico
page.locator('#loginBtn')

// ✅ Bom - Data attribute
page.locator('[data-testid="submit-button"]')

// ✅ Bom - Texto específico
page.locator('text=Salvar Propriedade')

// ❌ Evitar - Classes CSS genéricas
page.locator('.btn-primary')

// ❌ Evitar - Seletores frágeis
page.locator('div > span:nth-child(2)')
```

## 🐛 Debugging

### Modo Debug

```bash
# Executar teste específico em debug
npx playwright test admin-auth.spec.js --debug

# Pausar em teste específico
npx playwright test --grep "deve fazer login" --debug
```

### Traces e Screenshots

```bash
# Executar com trace sempre ativo
npx playwright test --trace on

# Executar com screenshot sempre
npx playwright test --screenshot on

# Executar com vídeo sempre
npx playwright test --video on
```

### Console e Logs

```javascript
// Capturar logs do console
page.on('console', msg => console.log(msg.text()));

// Capturar erros de rede
page.on('response', response => {
  if (!response.ok()) {
    console.log(`Failed request: ${response.url()}`);
  }
});
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Timeout nos testes**
   - Aumentar timeout em `playwright.config.js`
   - Usar `waitFor` adequadamente
   - Verificar se servidor está rodando

2. **Elementos não encontrados**
   - Verificar se seletores estão corretos
   - Aguardar carregamento da página
   - Verificar se elemento está visível

3. **Testes flaky (instáveis)**
   - Adicionar waits apropriados
   - Verificar condições de corrida
   - Usar `waitForLoadState('networkidle')`

4. **Problemas de autenticação**
   - Verificar se usuário de teste existe
   - Limpar localStorage entre testes
   - Verificar configuração do Supabase

### Comandos de Limpeza

```bash
# Limpar resultados de testes
npm run clean

# Reinstalar browsers
npx playwright install --force

# Limpar cache do npm
npm cache clean --force
```

## 📈 Métricas e Cobertura

### Executar com Métricas

```bash
# Executar testes com relatório detalhado
npx playwright test --reporter=html,json,junit

# Executar com trace para todos os testes
npx playwright test --trace on
```

### Análise de Performance

Os testes incluem verificações básicas de performance:

- Tempo de carregamento das páginas
- Responsividade da interface
- Ausência de erros JavaScript críticos
- Funcionalidade em diferentes browsers

## 🤝 Contribuindo

Para adicionar novos testes:

1. Crie arquivo `.spec.js` no diretório `tests/`
2. Siga as convenções de nomenclatura
3. Inclua testes para casos de sucesso e erro
4. Teste em múltiplos browsers
5. Documente casos de teste complexos

## 📚 Recursos Adicionais

- [Documentação do Playwright](https://playwright.dev/)
- [Guia de Boas Práticas](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Seletores](https://playwright.dev/docs/selectors)
- [Assertions](https://playwright.dev/docs/test-assertions)

---

**Sistema de Tours Virtuais 360°** - Testes automatizados com Playwright
**Versão**: 1.0.0 | **Cobertura**: Admin + Cliente | **Browsers**: Chrome, Firefox, Safari
