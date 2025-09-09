// Sistema de validação de imagens 360° para tours virtuais
// Garante que as imagens atendam aos requisitos técnicos para projeção equiretangular

export class ImageValidator {
    constructor() {
        this.requirements = {
            // Proporção obrigatória para imagens 360° equiretangulares
            aspectRatio: {
                target: 2.0,
                tolerance: 0.05 // 5% de tolerância
            },
            
            // Dimensões mínimas e máximas
            dimensions: {
                minWidth: 2048,
                minHeight: 1024,
                maxWidth: 8192,
                maxHeight: 4096
            },
            
            // Tamanho do arquivo
            fileSize: {
                min: 100 * 1024, // 100KB mínimo
                max: 50 * 1024 * 1024 // 50MB máximo
            },
            
            // Formatos suportados
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
            allowedExtensions: ['.jpg', '.jpeg', '.png']
        };
    }

    // Validação completa de uma imagem
    async validateImage(file) {
        const results = {
            valid: true,
            errors: [],
            warnings: [],
            info: {},
            recommendations: []
        };

        try {
            // 1. Validar tipo de arquivo
            const typeValidation = this.validateFileType(file);
            if (!typeValidation.valid) {
                results.valid = false;
                results.errors.push(typeValidation.error);
            }

            // 2. Validar tamanho do arquivo
            const sizeValidation = this.validateFileSize(file);
            if (!sizeValidation.valid) {
                results.valid = false;
                results.errors.push(sizeValidation.error);
            } else if (sizeValidation.warning) {
                results.warnings.push(sizeValidation.warning);
            }

            // 3. Validar dimensões e proporção da imagem
            const dimensionsValidation = await this.validateImageDimensions(file);
            if (!dimensionsValidation.valid) {
                results.valid = false;
                results.errors.push(dimensionsValidation.error);
            } else if (dimensionsValidation.warning) {
                results.warnings.push(dimensionsValidation.warning);
            }

            // Adicionar informações da imagem
            results.info = {
                name: file.name,
                size: file.size,
                type: file.type,
                ...dimensionsValidation.info
            };

            // 4. Gerar recomendações
            results.recommendations = this.generateRecommendations(results.info);

            // 5. Verificar qualidade geral
            const qualityScore = this.calculateQualityScore(results.info);
            results.info.qualityScore = qualityScore;

            if (qualityScore < 70) {
                results.warnings.push(`Qualidade da imagem: ${qualityScore}%. Considere usar uma imagem de maior resolução.`);
            }

        } catch (error) {
            results.valid = false;
            results.errors.push(`Erro ao processar imagem: ${error.message}`);
        }

        return results;
    }

    // Validar tipo de arquivo
    validateFileType(file) {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

        if (!this.requirements.allowedTypes.includes(fileType)) {
            return {
                valid: false,
                error: `Formato de arquivo não suportado: ${fileType}. Use JPG ou PNG.`
            };
        }

        if (!this.requirements.allowedExtensions.includes(fileExtension)) {
            return {
                valid: false,
                error: `Extensão de arquivo não suportada: ${fileExtension}. Use .jpg, .jpeg ou .png.`
            };
        }

        return { valid: true };
    }

    // Validar tamanho do arquivo
    validateFileSize(file) {
        const size = file.size;
        const { min, max } = this.requirements.fileSize;

        if (size < min) {
            return {
                valid: false,
                error: `Arquivo muito pequeno (${this.formatFileSize(size)}). Mínimo: ${this.formatFileSize(min)}.`
            };
        }

        if (size > max) {
            return {
                valid: false,
                error: `Arquivo muito grande (${this.formatFileSize(size)}). Máximo: ${this.formatFileSize(max)}.`
            };
        }

        // Avisar se o arquivo é muito grande (acima de 20MB)
        if (size > 20 * 1024 * 1024) {
            return {
                valid: true,
                warning: `Arquivo grande (${this.formatFileSize(size)}). Pode afetar o tempo de carregamento.`
            };
        }

        return { valid: true };
    }

    // Validar dimensões e proporção da imagem
    async validateImageDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                const aspectRatio = width / height;
                
                const { target, tolerance } = this.requirements.aspectRatio;
                const { minWidth, minHeight, maxWidth, maxHeight } = this.requirements.dimensions;

                const result = {
                    valid: true,
                    info: {
                        width,
                        height,
                        aspectRatio: Math.round(aspectRatio * 100) / 100,
                        megapixels: Math.round((width * height) / 1000000 * 10) / 10
                    }
                };

                // Verificar proporção (crítico para 360°)
                const ratioDiff = Math.abs(aspectRatio - target);
                if (ratioDiff > tolerance) {
                    result.valid = false;
                    result.error = `Proporção inválida: ${result.info.aspectRatio}:1. Imagens 360° devem ter proporção 2:1 (±${tolerance * 100}%).`;
                    resolve(result);
                    return;
                }

                // Verificar dimensões mínimas
                if (width < minWidth || height < minHeight) {
                    result.valid = false;
                    result.error = `Resolução muito baixa: ${width}x${height}. Mínimo: ${minWidth}x${minHeight}.`;
                    resolve(result);
                    return;
                }

                // Verificar dimensões máximas
                if (width > maxWidth || height > maxHeight) {
                    result.valid = false;
                    result.error = `Resolução muito alta: ${width}x${height}. Máximo: ${maxWidth}x${maxHeight}.`;
                    resolve(result);
                    return;
                }

                // Avisos para resoluções não ideais
                if (width < 4096 || height < 2048) {
                    result.warning = `Resolução baixa (${width}x${height}). Para melhor qualidade, use pelo menos 4096x2048.`;
                }

                resolve(result);
            };

            img.onerror = () => {
                resolve({
                    valid: false,
                    error: 'Não foi possível carregar a imagem. Arquivo pode estar corrompido.'
                });
            };

            img.src = URL.createObjectURL(file);
        });
    }

    // Calcular score de qualidade da imagem
    calculateQualityScore(info) {
        let score = 100;

        // Penalizar por resolução baixa
        const totalPixels = info.width * info.height;
        const idealPixels = 4096 * 2048; // 8.4MP
        
        if (totalPixels < idealPixels) {
            const pixelRatio = totalPixels / idealPixels;
            score -= (1 - pixelRatio) * 30; // Até -30 pontos
        }

        // Penalizar por proporção não exata
        const aspectRatioDiff = Math.abs(info.aspectRatio - 2.0);
        score -= aspectRatioDiff * 200; // -20 pontos por 0.1 de diferença

        // Bonificar por alta resolução
        if (totalPixels >= idealPixels * 1.5) {
            score += 10;
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // Gerar recomendações baseadas na análise
    generateRecommendations(info) {
        const recommendations = [];

        // Recomendações de resolução
        if (info.width < 4096) {
            recommendations.push('Para melhor qualidade, use imagens com pelo menos 4096x2048 pixels.');
        }

        // Recomendações de proporção
        if (Math.abs(info.aspectRatio - 2.0) > 0.01) {
            recommendations.push('Certifique-se de que a imagem tenha exatamente proporção 2:1 para melhor compatibilidade.');
        }

        // Recomendações de tamanho
        if (info.megapixels > 20) {
            recommendations.push('Considere comprimir a imagem para reduzir o tempo de carregamento.');
        }

        // Recomendações gerais
        recommendations.push('Use formato JPG para melhor compressão ou PNG para máxima qualidade.');
        recommendations.push('Certifique-se de que a imagem foi capturada com uma câmera 360° adequada.');

        return recommendations;
    }

    // Formatar tamanho de arquivo para exibição
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Verificar se uma imagem pode ser comprimida automaticamente
    canAutoCompress(file, targetSizeKB = 5000) {
        const currentSizeKB = file.size / 1024;
        return currentSizeKB > targetSizeKB && file.type.includes('jpeg');
    }

    // Comprimir imagem automaticamente
    async compressImage(file, quality = 0.8, maxWidth = 6144) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calcular novas dimensões mantendo proporção 2:1
                let { width, height } = img;
                
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = Math.round(height * ratio);
                }

                // Garantir proporção 2:1
                if (width / height !== 2) {
                    height = width / 2;
                }

                canvas.width = width;
                canvas.height = height;

                // Desenhar imagem redimensionada
                ctx.drawImage(img, 0, 0, width, height);

                // Converter para blob comprimido
                canvas.toBlob((blob) => {
                    // Criar novo arquivo com nome modificado
                    const compressedFile = new File(
                        [blob], 
                        file.name.replace(/\.(jpg|jpeg|png)$/i, '_compressed.jpg'),
                        { type: 'image/jpeg' }
                    );

                    resolve({
                        success: true,
                        originalSize: file.size,
                        compressedSize: compressedFile.size,
                        compressionRatio: Math.round((1 - compressedFile.size / file.size) * 100),
                        file: compressedFile
                    });
                }, 'image/jpeg', quality);
            };

            img.onerror = () => {
                resolve({
                    success: false,
                    error: 'Erro ao comprimir imagem'
                });
            };

            img.src = URL.createObjectURL(file);
        });
    }

    // Gerar preview da imagem para validação visual
    generatePreview(file, maxWidth = 400) {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calcular dimensões do preview mantendo proporção
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                resolve({
                    success: true,
                    dataUrl: canvas.toDataURL('image/jpeg', 0.8),
                    width: canvas.width,
                    height: canvas.height
                });
            };

            img.onerror = () => {
                resolve({
                    success: false,
                    error: 'Erro ao gerar preview'
                });
            };

            img.src = URL.createObjectURL(file);
        });
    }

    // Validação rápida apenas de proporção (para uso em tempo real)
    async quickValidateAspectRatio(file) {
        try {
            const dimensionsValidation = await this.validateImageDimensions(file);
            return {
                valid: dimensionsValidation.valid,
                aspectRatio: dimensionsValidation.info?.aspectRatio,
                error: dimensionsValidation.error
            };
        } catch (error) {
            return {
                valid: false,
                error: 'Erro ao validar proporção da imagem'
            };
        }
    }

    // Obter informações detalhadas da imagem sem validação
    async getImageInfo(file) {
        try {
            const dimensionsValidation = await this.validateImageDimensions(file);
            return {
                success: true,
                info: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    formattedSize: this.formatFileSize(file.size),
                    ...dimensionsValidation.info
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Instância global do validador
export const imageValidator = new ImageValidator();

// Utilitários para validação de imagens
export const imageUtils = {
    // Verificar se um arquivo é uma imagem
    isImageFile(file) {
        return file && file.type && file.type.startsWith('image/');
    },

    // Verificar se uma imagem tem proporção 360°
    async is360Image(file) {
        if (!imageUtils.isImageFile(file)) return false;
        
        const validation = await imageValidator.quickValidateAspectRatio(file);
        return validation.valid;
    },

    // Obter extensão do arquivo
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    },

    // Gerar nome único para arquivo
    generateUniqueFileName(originalName, prefix = '') {
        const extension = imageUtils.getFileExtension(originalName);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}${timestamp}_${random}.${extension}`;
    },

    // Converter bytes para formato legível
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};
