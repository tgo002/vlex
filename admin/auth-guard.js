/**
 * Proteção de Rotas Administrativas
 * 
 * Este script deve ser incluído em todas as páginas administrativas
 * para garantir que apenas administradores autenticados tenham acesso.
 */

import { AuthManager } from '../shared/supabase-client.js';

class AdminAuthGuard {
    constructor() {
        this.authManager = new AuthManager();
        this.isInitialized = false;
        this.isRedirecting = false;
        this.init();
    }

    async init() {
        try {
            // Evitar múltiplas inicializações
            if (this.isInitialized) return;

            console.log('🔐 Inicializando AdminAuthGuard...');

            // Verificar se estamos na página de login (não aplicar guard)
            if (window.location.pathname.includes('login.html') ||
                window.location.pathname.includes('test-login.html')) {
                console.log('📄 Página de login detectada - pulando auth guard');
                return;
            }

            // Aguardar inicialização do AuthManager com timeout
            await this.waitForAuthManager();

            // Verificar autenticação uma única vez
            const isAuthenticated = await this.checkAuthentication();

            if (isAuthenticated) {
                // Escutar mudanças de autenticação apenas se autenticado
                this.authManager.onAuthChange((event, session) => {
                    if (event === 'SIGNED_OUT' || !session) {
                        this.redirectToLogin();
                    }
                });
            }

            this.isInitialized = true;
            console.log('✅ AdminAuthGuard inicializado com sucesso');

        } catch (error) {
            console.error('❌ Erro na inicialização do AdminAuthGuard:', error);
        }
    }

    async waitForAuthManager() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 segundos máximo

            const checkAuth = () => {
                attempts++;
                if (this.authManager.currentUser !== undefined || attempts >= maxAttempts) {
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    async checkAuthentication() {
        // Evitar verificações múltiplas simultâneas
        if (this.isRedirecting) {
            console.log('⏳ Redirecionamento já em andamento...');
            return false;
        }

        console.log('🔍 Verificando autenticação...');

        // Verificar se está em modo de teste PRIMEIRO
        const testLogin = localStorage.getItem('test_admin_logged_in');
        if (testLogin === 'true') {
            console.log('🧪 Modo de teste detectado');
            // Removido: indicador visual de usuário logado (overlay)
            return true;
        }

        // Verificar autenticação normal
        const isAuth = this.authManager.isAuthenticated();
        console.log(`🔐 Autenticação normal: ${isAuth}`);

        if (!isAuth) {
            this.redirectToLogin();
            return false;
        }

        // Indicador visual removido do UI (não exibir overlay no ambiente admin/cliente)
        return true;
    }

    redirectToLogin() {
        // Evitar redirecionamentos múltiplos
        if (this.isRedirecting) {
            console.log('⏳ Redirecionamento já em andamento...');
            return;
        }

        this.isRedirecting = true;
        console.log('🔄 Redirecionando para login...');

        // Salvar URL atual para redirecionamento após login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);

        // Usar setTimeout para evitar loops
        setTimeout(() => {
            window.location.href = '/admin/login.html';
        }, 100);
    }

    addUserIndicator() {
        // Criar indicador de usuário logado
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
            <span>Admin: ${this.authManager.currentUser.email}</span>
            <button class="logout-btn" onclick="adminAuthGuard.logout()">Sair</button>
        `;
        
        document.body.appendChild(userIndicator);
    }

    addTestUserIndicator() {
        const testEmail = localStorage.getItem('test_admin_email') || 'admin@tours360.com';

        // Criar indicador de usuário de teste
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
            <button class="logout-btn" onclick="adminAuthGuard.testLogout()">Sair</button>
        `;

        document.body.appendChild(userIndicator);
    }

    testLogout() {
        if (confirm('Tem certeza que deseja sair do modo de teste?')) {
            localStorage.removeItem('test_admin_logged_in');
            localStorage.removeItem('test_admin_email');
            window.location.href = '/admin/test-login.html';
        }
    }

    async logout() {
        if (confirm('Tem certeza que deseja sair do sistema administrativo?')) {
            const result = await this.authManager.signOut();
            if (result.success) {
                window.location.href = '/admin/login.html';
            } else {
                alert('Erro ao fazer logout: ' + result.error);
            }
        }
    }

    // Método para verificar permissões específicas
    hasPermission(permission) {
        // Por enquanto, todos os administradores têm todas as permissões
        return this.authManager.isAuthenticated();
    }

    // Método para mostrar informações de acesso
    showAccessInfo() {
        const credentials = this.authManager.getAdminCredentials();
        console.log('🔐 Credenciais Administrativas:', credentials);
        return credentials;
    }
}

// Instância global do guard
let adminAuthGuard;

// Inicializar proteção quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    adminAuthGuard = new AdminAuthGuard();
});

// Exportar para uso global
window.adminAuthGuard = adminAuthGuard;

export default AdminAuthGuard;
