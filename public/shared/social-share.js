// Componente de compartilhamento social
export class SocialShare {
    constructor(options = {}) {
        this.options = {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content || '',
            url: window.location.href,
            image: document.querySelector('meta[property="og:image"]')?.content || '',
            hashtags: ['TourVirtual', 'Imovel', 'RealidadeVirtual'],
            showModal: true,
            showCopyLink: true,
            showWhatsApp: true,
            showFacebook: true,
            showTwitter: true,
            showLinkedIn: true,
            showTelegram: true,
            showEmail: true,
            onShare: null,
            ...options
        };
        
        this.isVisible = false;
        this.modal = null;
        
        this.init();
    }

    init() {
        if (this.options.showModal) {
            this.createModal();
            this.setupEventListeners();
        }
    }

    createModal() {
        // Criar modal se não existir
        if (document.getElementById('shareModal')) {
            this.modal = document.getElementById('shareModal');
            return;
        }

        const modalHTML = `
            <div class="share-modal-overlay" id="shareModal" style="display: none;">
                <div class="share-modal">
                    <div class="share-modal-header">
                        <h2 class="share-modal-title">📤 Compartilhar Tour</h2>
                        <p class="share-modal-subtitle">Compartilhe este tour virtual com seus amigos</p>
                        <button class="share-modal-close" onclick="window.socialShare.hide()">×</button>
                    </div>
                    
                    <div class="share-modal-content">
                        ${this.options.showCopyLink ? `
                        <div class="share-section">
                            <h3>🔗 Link Direto</h3>
                            <div class="copy-link-container">
                                <input type="text" id="shareUrl" value="${this.options.url}" readonly>
                                <button class="copy-btn" onclick="window.socialShare.copyLink()">
                                    📋 Copiar
                                </button>
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="share-section">
                            <h3>🌐 Redes Sociais</h3>
                            <div class="social-buttons">
                                ${this.options.showWhatsApp ? `
                                <button class="social-btn whatsapp" onclick="window.socialShare.shareWhatsApp()">
                                    <span class="social-icon">💬</span>
                                    <span class="social-label">WhatsApp</span>
                                </button>
                                ` : ''}
                                
                                ${this.options.showFacebook ? `
                                <button class="social-btn facebook" onclick="window.socialShare.shareFacebook()">
                                    <span class="social-icon">📘</span>
                                    <span class="social-label">Facebook</span>
                                </button>
                                ` : ''}
                                
                                ${this.options.showTwitter ? `
                                <button class="social-btn twitter" onclick="window.socialShare.shareTwitter()">
                                    <span class="social-icon">🐦</span>
                                    <span class="social-label">Twitter</span>
                                </button>
                                ` : ''}
                                
                                ${this.options.showLinkedIn ? `
                                <button class="social-btn linkedin" onclick="window.socialShare.shareLinkedIn()">
                                    <span class="social-icon">💼</span>
                                    <span class="social-label">LinkedIn</span>
                                </button>
                                ` : ''}
                                
                                ${this.options.showTelegram ? `
                                <button class="social-btn telegram" onclick="window.socialShare.shareTelegram()">
                                    <span class="social-icon">✈️</span>
                                    <span class="social-label">Telegram</span>
                                </button>
                                ` : ''}
                                
                                ${this.options.showEmail ? `
                                <button class="social-btn email" onclick="window.socialShare.shareEmail()">
                                    <span class="social-icon">📧</span>
                                    <span class="social-label">E-mail</span>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="share-section">
                            <h3>📱 Compartilhamento Nativo</h3>
                            <button class="native-share-btn" onclick="window.socialShare.shareNative()">
                                <span>📤</span> Usar Compartilhamento do Sistema
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('shareModal');
        
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('socialShareStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'socialShareStyles';
        styles.textContent = `
            .share-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 5000;
                backdrop-filter: blur(5px);
                animation: fadeIn 0.3s ease;
            }

            .share-modal {
                background: white;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
            }

            .share-modal-header {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                padding: 30px;
                border-radius: 20px 20px 0 0;
                text-align: center;
                position: relative;
            }

            .share-modal-title {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .share-modal-subtitle {
                font-size: 14px;
                opacity: 0.9;
                margin: 0;
            }

            .share-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .share-modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .share-modal-content {
                padding: 30px;
            }

            .share-section {
                margin-bottom: 30px;
            }

            .share-section:last-child {
                margin-bottom: 0;
            }

            .share-section h3 {
                font-size: 16px;
                color: #333;
                margin-bottom: 15px;
                font-weight: 600;
            }

            .copy-link-container {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }

            .copy-link-container input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-size: 14px;
                background: #f8f9fa;
                color: #6c757d;
            }

            .copy-btn {
                padding: 12px 20px;
                background: linear-gradient(135deg, #28a745, #218838);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }

            .copy-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
            }

            .copy-btn.copied {
                background: linear-gradient(135deg, #007bff, #0056b3);
            }

            .social-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 12px;
            }

            .social-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px;
                border: none;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                color: white;
            }

            .social-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }

            .social-btn.whatsapp {
                background: linear-gradient(135deg, #25D366, #128C7E);
            }

            .social-btn.facebook {
                background: linear-gradient(135deg, #1877F2, #166FE5);
            }

            .social-btn.twitter {
                background: linear-gradient(135deg, #1DA1F2, #0D8BD9);
            }

            .social-btn.linkedin {
                background: linear-gradient(135deg, #0077B5, #005885);
            }

            .social-btn.telegram {
                background: linear-gradient(135deg, #0088CC, #006699);
            }

            .social-btn.email {
                background: linear-gradient(135deg, #EA4335, #D33B2C);
            }

            .social-icon {
                font-size: 18px;
            }

            .social-label {
                flex: 1;
                text-align: left;
            }

            .native-share-btn {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #6c757d, #5a6268);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }

            .native-share-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(108, 117, 125, 0.3);
            }

            .native-share-btn:disabled {
                background: #6c757d;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
                opacity: 0.6;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @media (max-width: 768px) {
                .share-modal {
                    width: 95%;
                    margin: 20px;
                }

                .share-modal-header {
                    padding: 20px;
                }

                .share-modal-title {
                    font-size: 20px;
                }

                .share-modal-content {
                    padding: 20px;
                }

                .social-buttons {
                    grid-template-columns: 1fr;
                }

                .copy-link-container {
                    flex-direction: column;
                }

                .copy-btn {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    setupEventListeners() {
        // Fechar modal ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    // Métodos de compartilhamento
    shareWhatsApp() {
        const text = encodeURIComponent(`${this.options.title}\n\n${this.options.description}\n\n${this.options.url}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        this.trackShare('whatsapp');
    }

    shareFacebook() {
        const url = encodeURIComponent(this.options.url);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        this.trackShare('facebook');
    }

    shareTwitter() {
        const text = encodeURIComponent(this.options.title);
        const url = encodeURIComponent(this.options.url);
        const hashtags = this.options.hashtags.join(',');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`, '_blank');
        this.trackShare('twitter');
    }

    shareLinkedIn() {
        const url = encodeURIComponent(this.options.url);
        const title = encodeURIComponent(this.options.title);
        const summary = encodeURIComponent(this.options.description);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
        this.trackShare('linkedin');
    }

    shareTelegram() {
        const text = encodeURIComponent(`${this.options.title}\n\n${this.options.description}`);
        const url = encodeURIComponent(this.options.url);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
        this.trackShare('telegram');
    }

    shareEmail() {
        const subject = encodeURIComponent(this.options.title);
        const body = encodeURIComponent(`${this.options.description}\n\nConfira este tour virtual: ${this.options.url}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        this.trackShare('email');
    }

    async shareNative() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: this.options.title,
                    text: this.options.description,
                    url: this.options.url
                });
                this.trackShare('native');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erro no compartilhamento nativo:', error);
                    this.copyLink(); // Fallback
                }
            }
        } else {
            this.copyLink(); // Fallback
        }
    }

    async copyLink() {
        try {
            await navigator.clipboard.writeText(this.options.url);
            
            // Feedback visual
            const copyBtn = document.querySelector('.copy-btn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ Copiado!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
            
            this.trackShare('copy');
        } catch (error) {
            console.error('Erro ao copiar link:', error);
            
            // Fallback: selecionar texto
            const urlInput = document.getElementById('shareUrl');
            urlInput.select();
            urlInput.setSelectionRange(0, 99999);
            
            try {
                document.execCommand('copy');
                alert('Link copiado para a área de transferência!');
                this.trackShare('copy');
            } catch (fallbackError) {
                console.error('Erro no fallback de cópia:', fallbackError);
                alert('Não foi possível copiar automaticamente. Selecione e copie o link manualmente.');
            }
        }
    }

    trackShare(platform) {
        console.log(`Compartilhamento via ${platform}:`, this.options.url);
        
        if (this.options.onShare) {
            this.options.onShare(platform, this.options.url);
        }
        
        // Opcional: enviar para analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', {
                method: platform,
                content_type: 'tour_virtual',
                item_id: this.options.url
            });
        }
    }

    show() {
        if (!this.modal) {
            this.createModal();
        }
        
        this.modal.style.display = 'flex';
        this.isVisible = true;
        
        // Verificar suporte ao compartilhamento nativo
        const nativeBtn = document.querySelector('.native-share-btn');
        if (nativeBtn) {
            nativeBtn.disabled = !navigator.share;
            if (!navigator.share) {
                nativeBtn.innerHTML = '<span>📋</span> Copiar Link';
                nativeBtn.onclick = () => this.copyLink();
            }
        }
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    // Métodos estáticos para uso direto
    static shareWhatsApp(title, url, description = '') {
        const text = encodeURIComponent(`${title}\n\n${description}\n\n${url}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }

    static shareFacebook(url) {
        const encodedUrl = encodeURIComponent(url);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
    }

    static shareTwitter(title, url, hashtags = []) {
        const text = encodeURIComponent(title);
        const encodedUrl = encodeURIComponent(url);
        const hashtagsStr = hashtags.join(',');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}&hashtags=${hashtagsStr}`, '_blank');
    }

    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Erro ao copiar:', error);
            return false;
        }
    }
}

// Função global para facilitar uso
window.showShareModal = function(options = {}) {
    if (!window.socialShare) {
        window.socialShare = new SocialShare(options);
    }
    window.socialShare.show();
};
