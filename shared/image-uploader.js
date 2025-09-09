// Componente de upload de imagens 360° com validação e preview
import { imageValidator, imageUtils } from './image-validator.js';
import { imageManager, authManager } from './supabase-client.js';

export class ImageUploader {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            multiple: false,
            maxFiles: 5,
            showPreview: true,
            showValidation: true,
            autoUpload: false,
            compressionEnabled: true,
            onUploadStart: null,
            onUploadProgress: null,
            onUploadComplete: null,
            onUploadError: null,
            onValidationResult: null,
            ...options
        };
        
        this.files = [];
        this.uploadedFiles = [];
        this.currentPropertyId = null;
        
        this.init();
    }

    init() {
        this.createUploadInterface();
        this.setupEventListeners();
    }

    createUploadInterface() {
        this.container.innerHTML = `
            <div class="image-uploader">
                <div class="upload-area" id="uploadArea">
                    <div class="upload-content">
                        <div class="upload-icon">📸</div>
                        <h3>Upload de Imagens 360°</h3>
                        <p>Arraste e solte suas imagens aqui ou clique para selecionar</p>
                        <div class="upload-requirements">
                            <small>
                                • Proporção obrigatória: 2:1 (ex: 4096x2048)<br>
                                • Formatos: JPG, PNG<br>
                                • Tamanho máximo: 50MB por arquivo
                            </small>
                        </div>
                        <button type="button" class="upload-btn" id="uploadBtn">
                            Selecionar Imagens
                        </button>
                    </div>
                </div>
                
                <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
                
                <div class="files-container" id="filesContainer" style="display: none;">
                    <h4>Imagens Selecionadas</h4>
                    <div class="files-list" id="filesList"></div>
                    
                    <div class="upload-actions" id="uploadActions">
                        <button type="button" class="btn btn-secondary" onclick="this.clearFiles()">
                            Limpar Tudo
                        </button>
                        <button type="button" class="btn btn-primary" id="startUploadBtn">
                            📤 Fazer Upload
                        </button>
                    </div>
                </div>
                
                <div class="uploaded-files" id="uploadedFiles" style="display: none;">
                    <h4>Imagens Enviadas</h4>
                    <div class="uploaded-list" id="uploadedList"></div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('imageUploaderStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'imageUploaderStyles';
        styles.textContent = `
            .image-uploader {
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
            }

            .upload-area {
                border: 3px dashed #007bff;
                border-radius: 15px;
                padding: 40px 20px;
                text-align: center;
                background: #f8f9ff;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .upload-area:hover {
                border-color: #0056b3;
                background: #e6f3ff;
            }

            .upload-area.dragover {
                border-color: #28a745;
                background: #e8f5e8;
                transform: scale(1.02);
            }

            .upload-icon {
                font-size: 48px;
                margin-bottom: 15px;
            }

            .upload-area h3 {
                color: #333;
                margin-bottom: 10px;
                font-size: 24px;
            }

            .upload-area p {
                color: #6c757d;
                margin-bottom: 20px;
                font-size: 16px;
            }

            .upload-requirements {
                background: white;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #007bff;
            }

            .upload-requirements small {
                color: #495057;
                line-height: 1.6;
            }

            .upload-btn {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .upload-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
            }

            .files-container {
                margin-top: 30px;
                background: white;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            }

            .files-container h4 {
                color: #333;
                margin-bottom: 20px;
                font-size: 18px;
            }

            .file-item {
                display: flex;
                align-items: center;
                padding: 15px;
                border: 1px solid #e9ecef;
                border-radius: 10px;
                margin-bottom: 15px;
                background: #f8f9fa;
                transition: all 0.3s ease;
            }

            .file-item:hover {
                border-color: #007bff;
                background: #f8f9ff;
            }

            .file-preview {
                width: 80px;
                height: 40px;
                border-radius: 6px;
                object-fit: cover;
                margin-right: 15px;
                border: 1px solid #dee2e6;
            }

            .file-info {
                flex: 1;
            }

            .file-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 5px;
            }

            .file-details {
                font-size: 12px;
                color: #6c757d;
                display: flex;
                gap: 15px;
            }

            .file-validation {
                margin-top: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
            }

            .file-validation.valid {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }

            .file-validation.invalid {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }

            .file-validation.warning {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }

            .file-actions {
                display: flex;
                gap: 8px;
                margin-left: 15px;
            }

            .file-actions button {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn-remove {
                background: #dc3545;
                color: white;
            }

            .btn-remove:hover {
                background: #c82333;
            }

            .btn-compress {
                background: #ffc107;
                color: #212529;
            }

            .btn-compress:hover {
                background: #e0a800;
            }

            .upload-progress {
                width: 100%;
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
                margin-top: 10px;
            }

            .upload-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #007bff, #28a745);
                width: 0%;
                transition: width 0.3s ease;
            }

            .upload-actions {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn-primary {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-secondary:hover {
                background: #5a6268;
            }

            .uploaded-files {
                margin-top: 30px;
                background: white;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            }

            .uploaded-item {
                display: flex;
                align-items: center;
                padding: 15px;
                border: 1px solid #28a745;
                border-radius: 10px;
                margin-bottom: 15px;
                background: #d4edda;
            }

            .uploaded-item .file-preview {
                border-color: #28a745;
            }

            .upload-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
            }

            .upload-status.success {
                background: #28a745;
                color: white;
            }

            .upload-status.error {
                background: #dc3545;
                color: white;
            }

            .upload-status.uploading {
                background: #007bff;
                color: white;
            }

            @media (max-width: 768px) {
                .upload-area {
                    padding: 30px 15px;
                }

                .file-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .file-actions {
                    margin-left: 0;
                    width: 100%;
                    justify-content: flex-end;
                }

                .upload-actions {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const startUploadBtn = document.getElementById('startUploadBtn');

        // Click to select files
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type.startsWith('image/')
            );
            
            this.handleFiles(files);
        });

        // Start upload
        startUploadBtn.addEventListener('click', () => {
            this.startUpload();
        });
    }

    async handleFiles(newFiles) {
        // Verificar limite de arquivos
        if (!this.options.multiple && newFiles.length > 1) {
            this.showAlert('Apenas um arquivo é permitido.', 'warning');
            newFiles = [newFiles[0]];
        }

        if (this.files.length + newFiles.length > this.options.maxFiles) {
            this.showAlert(`Máximo de ${this.options.maxFiles} arquivos permitido.`, 'warning');
            return;
        }

        // Processar cada arquivo
        for (const file of newFiles) {
            await this.processFile(file);
        }

        this.updateUI();
    }

    async processFile(file) {
        const fileData = {
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            validation: null,
            preview: null,
            compressed: null,
            uploadStatus: 'pending'
        };

        // Validar arquivo
        if (this.options.showValidation) {
            fileData.validation = await imageValidator.validateImage(file);
            
            if (this.options.onValidationResult) {
                this.options.onValidationResult(fileData.validation);
            }
        }

        // Gerar preview
        if (this.options.showPreview) {
            const previewResult = await imageValidator.generatePreview(file);
            if (previewResult.success) {
                fileData.preview = previewResult.dataUrl;
            }
        }

        this.files.push(fileData);
    }

    updateUI() {
        const filesContainer = document.getElementById('filesContainer');
        const filesList = document.getElementById('filesList');

        if (this.files.length === 0) {
            filesContainer.style.display = 'none';
            return;
        }

        filesContainer.style.display = 'block';
        filesList.innerHTML = this.files.map(fileData => this.renderFileItem(fileData)).join('');

        // Atualizar uploaded files se houver
        this.updateUploadedFilesUI();
    }

    renderFileItem(fileData) {
        const validation = fileData.validation;
        const isValid = validation ? validation.valid : true;
        const hasWarnings = validation ? validation.warnings.length > 0 : false;

        let validationHTML = '';
        if (validation) {
            if (!isValid) {
                validationHTML = `
                    <div class="file-validation invalid">
                        ❌ ${validation.errors.join(', ')}
                    </div>
                `;
            } else if (hasWarnings) {
                validationHTML = `
                    <div class="file-validation warning">
                        ⚠️ ${validation.warnings.join(', ')}
                    </div>
                `;
            } else {
                validationHTML = `
                    <div class="file-validation valid">
                        ✅ Imagem válida para tour 360°
                    </div>
                `;
            }
        }

        const canCompress = imageValidator.canAutoCompress(fileData.file);
        const progressHTML = fileData.uploadStatus === 'uploading' ? `
            <div class="upload-progress">
                <div class="upload-progress-bar" style="width: ${fileData.progress || 0}%"></div>
            </div>
        ` : '';

        return `
            <div class="file-item" data-file-id="${fileData.id}">
                ${fileData.preview ? `<img src="${fileData.preview}" class="file-preview" alt="Preview">` : '<div class="file-preview" style="background: #e9ecef; display: flex; align-items: center; justify-content: center;">📷</div>'}
                
                <div class="file-info">
                    <div class="file-name">${fileData.name}</div>
                    <div class="file-details">
                        <span>📏 ${validation?.info?.width || '?'}x${validation?.info?.height || '?'}</span>
                        <span>💾 ${imageUtils.formatBytes(fileData.size)}</span>
                        <span>📊 ${validation?.info?.aspectRatio || '?'}:1</span>
                        ${validation?.info?.qualityScore ? `<span>⭐ ${validation.info.qualityScore}%</span>` : ''}
                    </div>
                    ${validationHTML}
                    ${progressHTML}
                </div>

                <div class="file-actions">
                    ${fileData.uploadStatus === 'success' ? '<span class="upload-status success">Enviado</span>' : ''}
                    ${fileData.uploadStatus === 'error' ? '<span class="upload-status error">Erro</span>' : ''}
                    ${fileData.uploadStatus === 'uploading' ? '<span class="upload-status uploading">Enviando</span>' : ''}
                    
                    ${canCompress && !fileData.compressed ? `
                        <button type="button" class="btn-compress" onclick="window.imageUploader.compressFile('${fileData.id}')">
                            🗜️ Comprimir
                        </button>
                    ` : ''}
                    
                    <button type="button" class="btn-remove" onclick="window.imageUploader.removeFile('${fileData.id}')">
                        🗑️ Remover
                    </button>
                </div>
            </div>
        `;
    }

    async compressFile(fileId) {
        const fileData = this.files.find(f => f.id == fileId);
        if (!fileData) return;

        try {
            const compressionResult = await imageValidator.compressImage(fileData.file);
            
            if (compressionResult.success) {
                fileData.compressed = compressionResult;
                fileData.file = compressionResult.file;
                
                // Re-validar arquivo comprimido
                fileData.validation = await imageValidator.validateImage(fileData.file);
                
                this.updateUI();
                this.showAlert(`Imagem comprimida! Redução de ${compressionResult.compressionRatio}%`, 'success');
            } else {
                this.showAlert('Erro ao comprimir imagem.', 'error');
            }
        } catch (error) {
            console.error('Erro na compressão:', error);
            this.showAlert('Erro ao comprimir imagem.', 'error');
        }
    }

    removeFile(fileId) {
        this.files = this.files.filter(f => f.id != fileId);
        this.updateUI();
    }

    clearFiles() {
        this.files = [];
        this.updateUI();
        document.getElementById('fileInput').value = '';
    }

    async startUpload() {
        if (!this.currentPropertyId) {
            this.showAlert('ID da propriedade não definido.', 'error');
            return;
        }

        const validFiles = this.files.filter(f => f.validation?.valid !== false);
        
        if (validFiles.length === 0) {
            this.showAlert('Nenhum arquivo válido para upload.', 'warning');
            return;
        }

        const currentUser = authManager.getCurrentUser();
        if (!currentUser) {
            this.showAlert('Usuário não autenticado.', 'error');
            return;
        }

        if (this.options.onUploadStart) {
            this.options.onUploadStart(validFiles.length);
        }

        for (const fileData of validFiles) {
            await this.uploadFile(fileData, currentUser.id);
        }

        this.updateUploadedFilesUI();
    }

    async uploadFile(fileData, userId) {
        fileData.uploadStatus = 'uploading';
        fileData.progress = 0;
        this.updateFileItem(fileData);

        try {
            // Simular progresso (Supabase não fornece progresso real)
            const progressInterval = setInterval(() => {
                if (fileData.progress < 90) {
                    fileData.progress += Math.random() * 20;
                    this.updateFileItem(fileData);
                }
            }, 200);

            const result = await imageManager.uploadImage(
                fileData.file, 
                userId, 
                this.currentPropertyId
            );

            clearInterval(progressInterval);

            if (result.success) {
                fileData.uploadStatus = 'success';
                fileData.progress = 100;
                fileData.uploadedUrl = result.data.url;
                fileData.uploadedPath = result.data.path;
                
                this.uploadedFiles.push(fileData);
                
                if (this.options.onUploadComplete) {
                    this.options.onUploadComplete(fileData, result.data);
                }
            } else {
                fileData.uploadStatus = 'error';
                fileData.error = result.error;
                
                if (this.options.onUploadError) {
                    this.options.onUploadError(fileData, result.error);
                }
            }
        } catch (error) {
            fileData.uploadStatus = 'error';
            fileData.error = error.message;
            
            if (this.options.onUploadError) {
                this.options.onUploadError(fileData, error.message);
            }
        }

        this.updateFileItem(fileData);
    }

    updateFileItem(fileData) {
        const fileItem = document.querySelector(`[data-file-id="${fileData.id}"]`);
        if (fileItem) {
            const newHTML = this.renderFileItem(fileData);
            fileItem.outerHTML = newHTML;
        }
    }

    updateUploadedFilesUI() {
        const uploadedFiles = document.getElementById('uploadedFiles');
        const uploadedList = document.getElementById('uploadedList');

        if (this.uploadedFiles.length === 0) {
            uploadedFiles.style.display = 'none';
            return;
        }

        uploadedFiles.style.display = 'block';
        uploadedList.innerHTML = this.uploadedFiles.map(fileData => `
            <div class="uploaded-item">
                <img src="${fileData.preview || fileData.uploadedUrl}" class="file-preview" alt="Uploaded">
                <div class="file-info">
                    <div class="file-name">${fileData.name}</div>
                    <div class="file-details">
                        <span>✅ Upload concluído</span>
                        <span>🔗 <a href="${fileData.uploadedUrl}" target="_blank">Ver imagem</a></span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setPropertyId(propertyId) {
        this.currentPropertyId = propertyId;
    }

    getUploadedFiles() {
        return this.uploadedFiles;
    }

    getValidFiles() {
        return this.files.filter(f => f.validation?.valid !== false);
    }

    showAlert(message, type = 'info') {
        // Implementar sistema de alertas ou usar o existente
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Se houver um sistema de alertas global, usar aqui
        if (window.showAlert) {
            window.showAlert(message, type);
        }
    }
}

// Expor classe globalmente para uso em onclick handlers
window.ImageUploader = ImageUploader;
