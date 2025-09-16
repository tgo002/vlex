/**
 * Proteção de Rotas Administrativas - Versão Corrigida
 * 
 * Este script deve ser incluído em todas as páginas administrativas
 * para garantir que apenas administradores autenticados tenham acesso.
 */

// Sistema de autenticação simplificado e robusto
class SimpleAuthGuard {
    constructor() {
        this.isInitialized = false;
        this.isRedirecting = false;
        this.debugMode = true;
        this.init();
    }

    log(message) {
        if (this.debugMode) {
            console.log(`🔐 AuthGuard: ${message}`);
        }
    }

    init() {
        this.log('Inicializando SimpleAuthGuard...');
        
        // Verificar se estamos na página de login (não aplicar guard)
        if (this.isLoginPage()) {
            this.log('Página de login detectada - pulando auth guard');
            return;
        }

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkAuth());
        } else {
            this.checkAuth();
        }
    }

    isLoginPage() {
        const path = window.location.pathname;
        return path.includes('login.html') || 
               path.includes('test-login.html') ||
               path.includes('login-fixed.html');
    }

    checkAuth() {
        this.log('Verificando autenticação...');
        
        // Evitar verificações múltiplas
        if (this.isRedirecting) {
            this.log('Redirecionamento já em andamento...');
            return;
        }

        try {
            // Verificar modo de teste (somente ambiente local)
            const testLogin = localStorage.getItem('test_admin_logged_in') === 'true';
            const isLocal = (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
            this.log(`Modo de teste: ${testLogin} | isLocal: ${isLocal}`);

            if (testLogin && isLocal) {
                this.log('✅ Autenticação de teste válida (ambiente local)');
                this.showTestUserIndicator();
                this.isInitialized = true;
                return true;
            } else if (testLogin && !isLocal) {
                this.log('⚠️ Modo de teste desativado em produção');
            }

            // Verificar token do Supabase como fallback
            const authToken = localStorage.getItem('sb-ewivsujoqdnltdktkyvh-auth-token');
            if (authToken) {
                try {
                    const tokenData = JSON.parse(authToken);
                    if (tokenData.access_token) {
                        this.log('✅ Token Supabase válido');
                        this.showUserIndicator();
                        this.isInitialized = true;
                        return true;
                    }
                } catch (e) {
                    this.log('❌ Token Supabase inválido');
                }
            }

            // Nenhuma autenticação encontrada
            this.log('❌ Nenhuma autenticação válida encontrada');
            this.redirectToLogin();
            return false;

        } catch (error) {
            this.log(`❌ Erro na verificação: ${error.message}`);
            this.redirectToLogin();
            return false;
        }
    }

    redirectToLogin() {
        if (this.isRedirecting) {
            this.log('Redirecionamento já em andamento...');
            return;
        }

        this.isRedirecting = true;
        this.log('🔄 Redirecionando para login...');

        // Salvar URL atual para redirecionamento após login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
        
        // Usar setTimeout para evitar loops
        setTimeout(() => {
            window.location.href = '/admin/login-fixed.html';
        }, 100);
    }

    showTestUserIndicator() {
        // Remover indicador existente
        const existing = document.getElementById('admin-user-indicator');
        if (existing) existing.remove();

        const testEmail = localStorage.getItem('test_admin_email') || 'admin@tours360.com';

        const userIndicator = document.createElement('div');
        userIndicator.id = 'admin-user-indicator';
        userIndicator.innerHTML = `
            <style>
                #admin-user-indicator {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #ff6b35, #f7931e);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                #admin-user-indicator:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                }

                #admin-user-indicator .logout-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    cursor: pointer;
                    margin-left: 8px;
                }

                #admin-user-indicator .logout-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            </style>
            <span>🧪</span>
            <span>Teste: ${testEmail}</span>
            <button class="logout-btn" onclick="simpleAuthGuard.logout()">Sair</button>
        `;

        document.body.appendChild(userIndicator);
        this.log('✅ Indicador de teste adicionado');
    }

    showUserIndicator() {
        // Remover indicador existente
        const existing = document.getElementById('admin-user-indicator');
        if (existing) existing.remove();

        const userIndicator = document.createElement('div');
        userIndicator.id = 'admin-user-indicator';
        userIndicator.innerHTML = `
            <style>
                #admin-user-indicator {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                #admin-user-indicator:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                }

                #admin-user-indicator .logout-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    cursor: pointer;
                    margin-left: 8px;
                }

                #admin-user-indicator .logout-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            </style>
            <span>🔐</span>
            <span>Admin Logado</span>
            <button class="logout-btn" onclick="simpleAuthGuard.logout()">Sair</button>
        `;

        document.body.appendChild(userIndicator);
        this.log('✅ Indicador de usuário adicionado');
    }

    logout() {
        if (confirm('Tem certeza que deseja sair do sistema administrativo?')) {
            this.log('🚪 Fazendo logout...');
            
            // Limpar localStorage
            localStorage.removeItem('test_admin_logged_in');
            localStorage.removeItem('test_admin_email');
            
            // Limpar token do Supabase se existir
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.includes('supabase') || key.includes('sb-')) {
                    localStorage.removeItem(key);
                }
            });
            
            // Redirecionar para login
            window.location.href = '/admin/login-fixed.html';
        }
    }

    // Método para debug
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isRedirecting: this.isRedirecting,
            testLogin: localStorage.getItem('test_admin_logged_in'),
            currentUrl: window.location.href
        };
    }
}

// Instância global
let simpleAuthGuard;

// Inicializar imediatamente
simpleAuthGuard = new SimpleAuthGuard();

// Exportar para uso global
window.simpleAuthGuard = simpleAuthGuard;
