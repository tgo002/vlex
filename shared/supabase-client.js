// Configuração do cliente Supabase para o sistema de tours virtuais 360°
// Usando CDN direto para compatibilidade local
const { createClient } = window.supabase;

// Configurações do Supabase
const SUPABASE_URL = 'https://ewivsujoqdnltdktkyvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aXZzdWpvcWRubHRka3RreXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIwMzAsImV4cCI6MjA3MjkzODAzMH0.qcSgD6XCJvVj1UsltzvqXeHEBU0fMHB9e25CID4M9Yo';

// Criar cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Credenciais administrativas (sistema restrito)
const ADMIN_CREDENTIALS = {
    email: 'admin@tours360.com',
    password: 'Admin@Tours360!2024'
};

// Classe para gerenciar autenticação restrita
export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authCallbacks = [];
        this.isAdminAuthenticated = false;
        this.init();
    }

    async init() {
        // Verificar se há usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        this.currentUser = user;
        this.isAdminAuthenticated = this.validateAdminAccess(user);

        // Escutar mudanças de autenticação
        supabase.auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            this.isAdminAuthenticated = this.validateAdminAccess(session?.user);
            this.notifyAuthCallbacks(event, session);
        });
    }

    // Validar se o usuário tem acesso administrativo
    validateAdminAccess(user) {
        if (!user) return false;
        return user.email === ADMIN_CREDENTIALS.email;
    }

    // Registrar callback para mudanças de autenticação
    onAuthChange(callback) {
        this.authCallbacks.push(callback);
    }

    // Notificar callbacks
    notifyAuthCallbacks(event, session) {
        this.authCallbacks.forEach(callback => callback(event, session));
    }

    // Login restrito apenas para administradores
    async signIn(email, password) {
        try {
            // Validar credenciais administrativas
            if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
                throw new Error('Acesso negado. Apenas administradores podem fazer login.');
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Verificar se é administrador
            if (!this.validateAdminAccess(data.user)) {
                await this.signOut();
                throw new Error('Acesso negado. Usuário não autorizado.');
            }

            this.isAdminAuthenticated = true;
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Registro desabilitado - Sistema restrito apenas para administradores
    async signUp(email, password, metadata = {}) {
        throw new Error('Registro público desabilitado. Sistema restrito apenas para administradores.');
    }

    // Logout
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            this.isAdminAuthenticated = false;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Verificar se usuário está autenticado como administrador
    isAuthenticated() {
        return this.currentUser && this.isAdminAuthenticated;
    }

    // Obter credenciais administrativas (para referência)
    getAdminCredentials() {
        return {
            email: ADMIN_CREDENTIALS.email,
            note: 'Use estas credenciais para acesso administrativo'
        };
    }

    // Middleware para proteger rotas administrativas
    requireAdminAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/admin/login.html';
            return false;
        }
        return true;
    }

    // Recuperação de senha
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin/reset-password.html`
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Atualizar senha
    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Obter token de acesso
    async getAccessToken() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    }
}

// Classe para gerenciar dados das propriedades
export class PropertyManager {
    // Listar propriedades do usuário
    async getProperties(status = null) {
        try {
            let query = supabase
                .from('properties')
                .select('*')
                .order('updated_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obter propriedade específica
    async getProperty(id) {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Criar nova propriedade
    async createProperty(propertyData) {
        try {
            const { data, error } = await supabase
                .from('properties')
                .insert([propertyData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Atualizar propriedade
    async updateProperty(id, propertyData) {
        try {
            const { data, error } = await supabase
                .from('properties')
                .update(propertyData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Deletar propriedade
    async deleteProperty(id) {
        try {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obter tour completo (propriedade + cenas + hotspots)
    async getCompleteTour(propertyId) {
        try {
            const { data, error } = await supabase
                .rpc('get_complete_tour', { property_uuid: propertyId });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obter estatísticas do usuário
    async getUserStats() {
        try {
            const { data, error } = await supabase
                .rpc('get_user_stats');

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Classe para gerenciar cenas
export class SceneManager {
    // Listar cenas de uma propriedade
    async getScenes(propertyId) {
        try {
            const { data, error } = await supabase
                .from('scenes')
                .select('*')
                .eq('property_id', propertyId)
                .order('order_index', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Criar nova cena
    async createScene(sceneData) {
        try {
            const { data, error } = await supabase
                .from('scenes')
                .insert([sceneData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Atualizar cena
    async updateScene(id, sceneData) {
        try {
            const { data, error } = await supabase
                .from('scenes')
                .update(sceneData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Deletar cena
    async deleteScene(id) {
        try {
            const { error } = await supabase
                .from('scenes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Definir cena padrão
    async setDefaultScene(sceneId) {
        try {
            const { error } = await supabase
                .rpc('set_default_scene', { scene_uuid: sceneId });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Classe para gerenciar hotspots
export class HotspotManager {
    // Listar hotspots de uma cena
    async getHotspots(sceneId) {
        try {
            const { data, error } = await supabase
                .from('hotspots')
                .select('*')
                .eq('scene_id', sceneId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Criar novo hotspot
    async createHotspot(hotspotData) {
        try {
            const { data, error } = await supabase
                .from('hotspots')
                .insert([hotspotData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Atualizar hotspot
    async updateHotspot(id, hotspotData) {
        try {
            const { data, error } = await supabase
                .from('hotspots')
                .update(hotspotData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Deletar hotspot
    async deleteHotspot(id) {
        try {
            const { error } = await supabase
                .from('hotspots')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Classe para gerenciar upload de imagens
export class ImageManager {
    // Upload de imagem 360°
    async uploadImage(file, userId, propertyId, onProgress = null) {
        try {
            // Validar arquivo básico
            const basicValidation = this.validateImage(file);
            if (!basicValidation.valid) {
                return { success: false, error: basicValidation.error };
            }

            // Validar dimensões e proporção 360°
            const dimensionValidation = await this.validateImageDimensions(file);
            if (!dimensionValidation.valid) {
                return { success: false, error: dimensionValidation.error };
            }

            // Gerar nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const timestamp = Date.now();
            const fileName = `${userId}/${propertyId}/${timestamp}_360.${fileExt}`;

            // Upload para Supabase Storage
            const { data, error } = await supabase.storage
                .from('tour-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('tour-images')
                .getPublicUrl(fileName);

            return {
                success: true,
                data: {
                    path: data.path,
                    url: publicUrl,
                    fileName: fileName,
                    fileSize: file.size,
                    dimensions: {
                        width: dimensionValidation.width,
                        height: dimensionValidation.height,
                        ratio: dimensionValidation.ratio
                    }
                }
            };
        } catch (error) {
            console.error('Erro no upload:', error);
            return { success: false, error: error.message };
        }
    }

    // Validar imagem 360°
    validateImage(file) {
        // Verificar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Formato de arquivo não suportado. Use JPG ou PNG.'
            };
        }

        // Verificar tamanho (máximo 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'Arquivo muito grande. Máximo 50MB.'
            };
        }

        return { valid: true };
    }

    // Validar proporção da imagem (deve ser 2:1)
    async validateImageDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const ratio = this.width / this.height;
                const isValid = Math.abs(ratio - 2.0) < 0.1; // Tolerância de 10%

                resolve({
                    valid: isValid,
                    width: this.width,
                    height: this.height,
                    ratio: ratio,
                    error: isValid ? null : `Proporção inválida (${ratio.toFixed(2)}:1). Imagens 360° devem ter proporção 2:1.`
                });
            };
            img.src = URL.createObjectURL(file);
        });
    }

    // Deletar imagem
    async deleteImage(path) {
        try {
            const { error } = await supabase.storage
                .from('tour-images')
                .remove([path]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Instâncias globais (declaradas apenas uma vez)
// Movidas para o final do arquivo após todas as classes

// Utilitários
export const utils = {
    // Formatar preço
    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    },

    // Alias para formatPrice (compatibilidade)
    formatCurrency(price) {
        return this.formatPrice(price);
    },

    // Formatar área
    formatArea(area) {
        return `${area} m²`;
    },

    // Validar coordenadas de hotspot
    validateCoordinates(pitch, yaw) {
        return pitch >= -90 && pitch <= 90 && yaw >= 0 && yaw <= 360;
    },

    // Converter graus para radianos
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    // Converter radianos para graus
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Lead Manager
export class LeadManager {
    async createLead(leadData) {
        try {
            const { data, error } = await supabase
                .from('leads')
                .insert([leadData])
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Erro ao criar lead:', error);
            return { success: false, error: error.message };
        }
    }

    async getLeads(propertyId = null) {
        try {
            let query = supabase
                .from('leads')
                .select(`
                    *,
                    properties (
                        title
                    )
                `)
                .order('created_at', { ascending: false });

            if (propertyId) {
                query = query.eq('property_id', propertyId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
            return { success: false, error: error.message };
        }
    }

    async updateLeadStatus(leadId, status) {
        try {
            const { data, error } = await supabase
                .from('leads')
                .update({
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', leadId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Erro ao atualizar status do lead:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteLead(leadId) {
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', leadId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Erro ao excluir lead:', error);
            return { success: false, error: error.message };
        }
    }
}

// Garante sessão Supabase em modo de teste (usa ADMIN_CREDENTIALS)
export async function ensureAdminSessionForTest() {
  try {
    // Primeiro, verificar se já temos uma sessão válida
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (session && !sessionError) {
      console.log('✅ Sessão Supabase já existe');
      return { success: true, session };
    }

    console.log('🔐 Criando nova sessão Supabase...');

    // Tentar fazer login com as credenciais admin
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password
    });

    if (error) {
      console.error('❌ Erro no login Supabase:', error);
      throw error;
    }

    console.log('✅ Sessão Supabase criada com sucesso');
    return { success: true, session: data.session };
  } catch (e) {
    console.error('❌ ensureAdminSessionForTest error:', e);
    // Em caso de erro de rede, retornar sucesso para não bloquear o fluxo
    if (e.message?.includes('Failed to fetch') || e.message?.includes('network')) {
      console.warn('⚠️ Erro de rede detectado, continuando sem sessão Supabase');
      return { success: true, session: null, networkError: true };
    }
    return { success: false, error: e.message };
  }
}


// Instâncias dos managers (declaradas após todas as classes)
export const authManager = new AuthManager();
export const propertyManager = new PropertyManager();
export const sceneManager = new SceneManager();
export const hotspotManager = new HotspotManager();
export const imageManager = new ImageManager();
export const leadManager = new LeadManager();
