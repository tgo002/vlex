# 🏠 Sistema de Tours Virtuais 360° - Completo

Um sistema completo de administração e visualização de tours virtuais 360° para o mercado imobiliário, desenvolvido com **Supabase MCP** e **Playwright MCP** para testes automatizados.

## 🚀 Deploy no Vercel

Este projeto está configurado para deploy automático no Vercel. Os arquivos estão organizados na pasta `public/` para compatibilidade com hospedagem estática.

### Estrutura do Projeto

```
public/
├── index.html              # Página principal
├── admin/                  # Sistema administrativo
│   ├── index.html         # Dashboard admin
│   ├── login.html         # Login administrativo
│   ├── property-editor.html
│   └── ...
├── client/                 # Interface do cliente
│   └── tour.html          # Visualizador de tours
├── shared/                 # Recursos compartilhados
│   ├── supabase-client.js
│   ├── image-uploader.js
│   └── ...
└── tour-config.json       # Configurações dos tours
```

### URLs de Acesso
- **Página Principal**: `/`
- **Admin Login**: `/admin/login.html`
- **Dashboard Admin**: `/admin/index.html`
- **Visualizador de Tours**: `/client/tour.html`

## ✨ Características Principais

### 🎯 **Hotspots Espacialmente Ancorados**
- **Coordenadas esféricas (yaw/pitch)** garantem que hotspots permaneçam fixos durante navegação
- **Posicionamento preciso** em qualquer ponto da imagem 360°
- **Tipos de hotspot**: navegação, informação, destaque, vídeo, áudio

### 🔐 **Sistema de Autenticação Robusto**
- **Login/Registro** com Supabase Auth
- **Row Level Security (RLS)** para isolamento multi-tenant
- **Proteção de rotas** administrativas
- **Recuperação de senha** integrada

### 📊 **Interface Administrativa Completa**
- **Dashboard** com estatísticas em tempo real
- **Editor de propriedades** com validação completa
- **Gerenciador de cenas** com upload drag-and-drop
- **Editor visual de hotspots** com posicionamento preciso
- **Sistema de publicação** com workflow completo
- **Gerenciador de leads** para captura de interessados

### 🌐 **Interface Cliente Otimizada**
- **Visualizador 360°** com Pannellum
- **Navegação fluida** entre cenas
- **Controles intuitivos** para desktop e mobile
- **Formulário de contato** integrado
- **Compartilhamento social** com meta tags Open Graph

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **360° Engine**: Pannellum
- **Testes**: Playwright
- **Validação**: Sistema próprio para imagens 360°
- **Responsividade**: Bootstrap 5

## 📁 Estrutura do Projeto

```
360/
├── admin/                      # Interface administrativa
│   ├── index.html             # Dashboard principal
│   ├── login.html             # Página de login
│   ├── register.html          # Página de registro
│   ├── property-editor.html   # Editor de propriedades
│   ├── scene-manager.html     # Gerenciador de cenas
│   ├── hotspot-editor.html    # Editor de hotspots
│   ├── publication-manager.html # Gerenciador de publicações
│   ├── leads-manager.html     # Gerenciador de leads
│   └── tour-preview.html      # Preview do tour
├── client/                    # Interface cliente
│   └── tour.html             # Visualizador de tours
├── shared/                    # Código compartilhado
│   ├── supabase-client.js    # Cliente Supabase
│   ├── image-validator.js    # Validador de imagens 360°
│   └── image-uploader.js     # Sistema de upload
├── tests/                     # Testes automatizados
│   ├── auth.test.js          # Testes de autenticação
│   ├── admin.test.js         # Testes da interface admin
│   ├── client.test.js        # Testes da interface cliente
│   ├── integration.test.js   # Testes de integração
│   ├── global-setup.js       # Setup global dos testes
│   └── global-teardown.js    # Limpeza global dos testes
├── playwright.config.js       # Configuração do Playwright
├── server.py                  # Servidor de desenvolvimento
└── README.md                  # Esta documentação
```

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

- **`properties`**: Propriedades imobiliárias
- **`scenes`**: Cenas 360° por propriedade
- **`hotspots`**: Pontos interativos nas cenas
- **`leads`**: Contatos e interessados
- **`tour_analytics`**: Análise de uso dos tours

### Políticas RLS Implementadas

- Usuários só acessam suas próprias propriedades
- Tours publicados são visíveis publicamente
- Leads são associados aos proprietários corretos
- Analytics respeitam a propriedade dos dados

## 🛠️ Instalação e Configuração

### 1. Configuração do Supabase

O sistema já está configurado com:
- **URL**: `https://ewivsujoqdnltdktkyvh.supabase.co`
- **Schema completo** criado via Supabase MCP
- **Storage bucket** configurado para imagens 360°
- **Políticas RLS** implementadas

### 2. Servidor Local

```bash
# Iniciar servidor de desenvolvimento
python -m http.server 8000

# Ou usar o servidor customizado
python server.py
```

### 3. Acessar o Sistema

- **Admin**: http://localhost:8000/admin/
- **Cliente**: http://localhost:8000/client/
- **Testes**: http://localhost:8000/tests/

## 🧪 Testes Automatizados

### Executar Testes

```bash
# Instalar Playwright (se necessário)
npm install @playwright/test

# Executar todos os testes
npx playwright test

# Executar testes específicos
npx playwright test auth.test.js
npx playwright test admin.test.js
npx playwright test client.test.js
npx playwright test integration.test.js

# Executar com interface gráfica
npx playwright test --ui

# Gerar relatório
npx playwright show-report
```

### Cobertura de Testes

- ✅ **Autenticação**: Login, registro, recuperação de senha
- ✅ **Interface Admin**: Dashboard, CRUD, navegação
- ✅ **Interface Cliente**: Tour virtual, responsividade
- ✅ **Integração E2E**: Fluxo completo admin → cliente
- ✅ **Performance**: Tempo de carregamento < 5s
- ✅ **Responsividade**: Mobile, tablet, desktop
- ✅ **Acessibilidade**: Estrutura semântica, navegação por teclado

## 🎯 Funcionalidades Implementadas

### ✅ Concluído

1. **Configuração Supabase MCP** - Schema, RLS, Storage
2. **Sistema de Autenticação** - Login, registro, proteção
3. **Interface Admin - Dashboard** - Estatísticas, navegação
4. **CRUD de Propriedades** - Editor completo com validação
5. **Sistema de Upload 360°** - Validação, compressão, preview
6. **Gerenciador de Cenas** - Múltiplas cenas, ordenação
7. **Editor Visual de Hotspots** - Drag-and-drop, coordenadas esféricas
8. **Sistema de Publicação** - Workflow, validações, URLs
9. **Interface Cliente - Tour Virtual** - Pannellum, navegação
10. **Formulário de Contato e Leads** - Captura, gerenciamento
11. **Compartilhamento Social** - Meta tags, botões
12. **Testes Playwright - Configuração** - Setup completo
13. **Testes Playwright - Admin** - Cobertura completa
14. **Testes Playwright - Cliente** - Responsividade, performance
15. **Validação e Integração Final** - Testes E2E, documentação

## 🔧 Configurações Técnicas

### Validação de Imagens 360°

- **Proporção**: 2:1 (equirectangular)
- **Formatos**: JPG, PNG
- **Tamanho mínimo**: 2048x1024px
- **Tamanho máximo**: 8192x4096px
- **Compressão automática** se necessário

### Coordenadas de Hotspots

- **Yaw**: -180° a 360° (rotação horizontal)
- **Pitch**: -90° a 90° (rotação vertical)
- **Sistema esférico** garante posicionamento fixo

### Performance

- **Carregamento**: < 3 segundos
- **Imagens otimizadas** automaticamente
- **Lazy loading** para melhor UX
- **Cache inteligente** via Supabase

## 📱 Responsividade

- **Mobile**: 375px+ (iPhone, Android)
- **Tablet**: 768px+ (iPad, tablets)
- **Desktop**: 1024px+ (notebooks, desktops)
- **4K**: 2560px+ (monitores grandes)

## 🔒 Segurança

- **Row Level Security** no Supabase
- **Validação client-side e server-side**
- **Sanitização de uploads**
- **Proteção contra XSS e CSRF**
- **HTTPS obrigatório em produção**

## 🚀 Deploy em Produção

### 1. Configurar Domínio

```javascript
// Atualizar URLs em shared/supabase-client.js
const SUPABASE_URL = 'sua-url-supabase';
const SUPABASE_ANON_KEY = 'sua-chave-anonima';
```

### 2. Configurar CORS

```sql
-- No Supabase, configurar CORS para seu domínio
```

### 3. Otimizações

- Minificar CSS/JS
- Comprimir imagens
- Configurar CDN
- Habilitar cache do browser

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs do console do browser
2. Verificar logs do Supabase
3. Executar testes automatizados
4. Consultar documentação do Playwright

## 📄 Licença

Sistema desenvolvido para uso comercial no mercado imobiliário.

---

**🎉 Sistema Completo e Testado!**

Todas as 15 tarefas foram concluídas com sucesso, incluindo testes automatizados abrangentes usando Playwright MCP e integração completa com Supabase MCP.
