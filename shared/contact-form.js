// Componente de formulário de contato para leads
import { leadManager } from './supabase-client.js';

export class ContactForm {
    constructor(propertyId, options = {}) {
        this.propertyId = propertyId;
        this.options = {
            title: 'Tenho Interesse!',
            subtitle: 'Deixe seus dados e entraremos em contato',
            showWhatsApp: true,
            showEmail: true,
            showPhone: true,
            showMessage: true,
            onSuccess: null,
            onError: null,
            ...options
        };
        
        this.isVisible = false;
        this.modal = null;
        
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        // Criar modal se não existir
        if (document.getElementById('contactModal')) {
            this.modal = document.getElementById('contactModal');
            return;
        }

        const modalHTML = `
            <div class="contact-modal-overlay" id="contactModal" style="display: none;">
                <div class="contact-modal">
                    <div class="contact-modal-header">
                        <h2 class="contact-modal-title">${this.options.title}</h2>
                        <p class="contact-modal-subtitle">${this.options.subtitle}</p>
                        <button class="contact-modal-close" onclick="window.contactForm.hide()">×</button>
                    </div>
                    
                    <form class="contact-form" id="contactForm">
                        <div class="contact-alert" id="contactAlert" style="display: none;"></div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactName">Nome Completo *</label>
                                <input type="text" id="contactName" name="name" required 
                                       placeholder="Seu nome completo">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactEmail">E-mail *</label>
                                <input type="email" id="contactEmail" name="email" required 
                                       placeholder="seu@email.com">
                            </div>
                            <div class="form-group">
                                <label for="contactPhone">Telefone *</label>
                                <input type="tel" id="contactPhone" name="phone" required 
                                       placeholder="(11) 99999-9999">
                            </div>
                        </div>

                        ${this.options.showWhatsApp ? `
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactWhatsApp">WhatsApp</label>
                                <input type="tel" id="contactWhatsApp" name="whatsapp" 
                                       placeholder="(11) 99999-9999 (opcional)">
                            </div>
                        </div>
                        ` : ''}

                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactInterest">Interesse</label>
                                <select id="contactInterest" name="interest">
                                    <option value="compra">Compra</option>
                                    <option value="aluguel">Aluguel</option>
                                    <option value="informacoes">Mais Informações</option>
                                    <option value="visita">Agendar Visita</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                        </div>

                        ${this.options.showMessage ? `
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactMessage">Mensagem</label>
                                <textarea id="contactMessage" name="message" rows="4" 
                                          placeholder="Deixe sua mensagem ou dúvida (opcional)"></textarea>
                            </div>
                        </div>
                        ` : ''}

                        <div class="form-row">
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="contactConsent" name="consent" required>
                                    <span class="checkbox-custom"></span>
                                    Concordo em receber contato sobre este imóvel
                                </label>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="window.contactForm.hide()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary" id="submitContactBtn">
                                📞 Enviar Contato
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('contactModal');
        
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('contactFormStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'contactFormStyles';
        styles.textContent = `
            .contact-modal-overlay {
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

            .contact-modal {
                background: white;
                border-radius: 20px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
            }

            .contact-modal-header {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                padding: 30px;
                border-radius: 20px 20px 0 0;
                text-align: center;
                position: relative;
            }

            .contact-modal-title {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .contact-modal-subtitle {
                font-size: 16px;
                opacity: 0.9;
                margin: 0;
            }

            .contact-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                color: white;
                font-size: 30px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .contact-modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .contact-form {
                padding: 30px;
            }

            .contact-alert {
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 14px;
            }

            .contact-alert.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }

            .contact-alert.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }

            .form-row {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
            }

            .form-group {
                flex: 1;
                display: flex;
                flex-direction: column;
            }

            .form-group label {
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
                font-size: 14px;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                padding: 12px 16px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-size: 16px;
                transition: all 0.3s ease;
                font-family: inherit;
            }

            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
            }

            .form-group textarea {
                resize: vertical;
                min-height: 100px;
            }

            .checkbox-group {
                flex-direction: row;
                align-items: center;
                gap: 12px;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                font-size: 14px;
                line-height: 1.5;
            }

            .checkbox-label input[type="checkbox"] {
                display: none;
            }

            .checkbox-custom {
                width: 20px;
                height: 20px;
                border: 2px solid #007bff;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }

            .checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
                background: #007bff;
            }

            .checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
                content: '✓';
                color: white;
                font-weight: bold;
                font-size: 14px;
            }

            .form-actions {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
            }

            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .btn-primary {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
            }

            .btn-primary:disabled {
                background: #6c757d;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-secondary:hover {
                background: #5a6268;
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
                .contact-modal {
                    width: 95%;
                    margin: 20px;
                }

                .contact-modal-header {
                    padding: 20px;
                }

                .contact-modal-title {
                    font-size: 24px;
                }

                .contact-form {
                    padding: 20px;
                }

                .form-row {
                    flex-direction: column;
                    gap: 15px;
                }

                .form-actions {
                    flex-direction: column;
                }

                .btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    setupEventListeners() {
        // Submissão do formulário
        const form = document.getElementById('contactForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

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

        // Máscara para telefone
        const phoneInputs = document.querySelectorAll('#contactPhone, #contactWhatsApp');
        phoneInputs.forEach(input => {
            input.addEventListener('input', this.formatPhone);
        });
    }

    formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            if (value.length < 14) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
        }
        
        e.target.value = value;
    }

    async submitForm() {
        const submitBtn = document.getElementById('submitContactBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Desabilitar botão
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ Enviando...';
            
            // Coletar dados do formulário
            const formData = new FormData(document.getElementById('contactForm'));
            const leadData = {
                property_id: this.propertyId,
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                whatsapp: formData.get('whatsapp') || null,
                interest: formData.get('interest'),
                message: formData.get('message') || null,
                consent: formData.get('consent') === 'on',
                source: 'tour_virtual',
                status: 'new'
            };

            // Validar dados
            if (!leadData.name || !leadData.email || !leadData.phone) {
                throw new Error('Por favor, preencha todos os campos obrigatórios.');
            }

            if (!leadData.consent) {
                throw new Error('É necessário concordar em receber contato.');
            }

            // Enviar para Supabase
            const result = await leadManager.createLead(leadData);
            
            if (!result.success) {
                throw new Error(result.error || 'Erro ao enviar contato.');
            }

            // Sucesso
            this.showAlert('Contato enviado com sucesso! Entraremos em contato em breve.', 'success');
            
            // Limpar formulário
            document.getElementById('contactForm').reset();
            
            // Callback de sucesso
            if (this.options.onSuccess) {
                this.options.onSuccess(result.data);
            }
            
            // Fechar modal após 3 segundos
            setTimeout(() => {
                this.hide();
            }, 3000);

        } catch (error) {
            console.error('Erro ao enviar contato:', error);
            this.showAlert(error.message, 'error');
            
            // Callback de erro
            if (this.options.onError) {
                this.options.onError(error.message);
            }
        } finally {
            // Reabilitar botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    showAlert(message, type) {
        const alert = document.getElementById('contactAlert');
        alert.textContent = message;
        alert.className = `contact-alert ${type}`;
        alert.style.display = 'block';
        
        // Auto-hide após 5 segundos para erros
        if (type === 'error') {
            setTimeout(() => {
                alert.style.display = 'none';
            }, 5000);
        }
    }

    show() {
        this.modal.style.display = 'flex';
        this.isVisible = true;
        
        // Focar no primeiro campo
        setTimeout(() => {
            document.getElementById('contactName').focus();
        }, 300);
    }

    hide() {
        this.modal.style.display = 'none';
        this.isVisible = false;
        
        // Limpar alertas
        document.getElementById('contactAlert').style.display = 'none';
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// Função global para facilitar uso
window.showContactForm = function(propertyId, options = {}) {
    if (!window.contactForm) {
        window.contactForm = new ContactForm(propertyId, options);
    }
    window.contactForm.show();
};
