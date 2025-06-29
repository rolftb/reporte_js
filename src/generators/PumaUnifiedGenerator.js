/**
 * Generador PUMA Actualizado - Usando Librerías Unificadas
 * 
 * Este generador ahora utiliza las librerías unificadas para
 * mayor consistencia y reutilización de código.
 */

import { 
    PumaDocxSystem, 
    DocxGenerator, 
    DocxAnalyzer,
    GenerationUtils,
    LogUtils 
} from '../lib/index.js';

class PumaUnifiedGenerator {
    constructor(options = {}) {
        this.options = {
            useRealImages: options.useRealImages !== false,
            extractedImagesPath: options.extractedImagesPath || './extracted_images',
            outputPath: options.outputPath || './output',
            ...options
        };
        
        this.logger = LogUtils.createLogger('PUMA-UNIFIED');
        this.system = new PumaDocxSystem(this.options);
        
        // Datos por defecto del documento PUMA
        this.defaultDocumentData = {
            empresa: "PUMA ENERGY CHILE S.A.",
            actividad: "Programa de Calidad de Vida",
            fechaPeriodo: "Desde el 21 de mayo al 20 de junio",
            lugar: "Av. Pdte. Kennedy 5454",
            profesional: "Profesional área Calidad de Vida - Mutual Asesorías.",
            sesiones: [
                {
                    fecha: "27-05-2025",
                    cantidadPausas: "1",
                    participantes: "16"
                },
                {
                    fecha: "03-06-2025", 
                    cantidadPausas: "1",
                    participantes: "12"
                },
                {
                    fecha: "10-06-2025",
                    cantidadPausas: "1", 
                    participantes: "18"
                },
                {
                    fecha: "17-06-2025",
                    cantidadPausas: "1",
                    participantes: "16"
                }
            ]
        };
    }

    /**
     * Genera documento PUMA usando el sistema unificado
     */
    async generatePumaDocument(customData = {}, outputFileName = 'puma_unified_document.docx') {
        try {
            this.logger.info('🚀 Iniciando generación PUMA con librerías unificadas');
            
            // Combinar datos por defecto con datos personalizados
            const documentData = { ...this.defaultDocumentData, ...customData };
            
            // Validar datos del documento
            const validation = GenerationUtils.validateDocumentData(documentData);
            if (!validation.valid) {
                this.logger.error('❌ Datos del documento inválidos:');
                validation.errors.forEach(error => this.logger.error(`  - ${error}`));
                throw new Error('Datos del documento inválidos');
            }
            
            if (validation.warnings.length > 0) {
                this.logger.warning('⚠️ Advertencias en datos del documento:');
                validation.warnings.forEach(warning => this.logger.warning(`  - ${warning}`));
            }
            
            // Intentar usar documento original como referencia
            const originalDocxPath = await this.findOriginalDocument();
            
            if (originalDocxPath) {
                this.logger.info(`📄 Usando documento original como referencia: ${originalDocxPath}`);
                return await this.system.processComplete(originalDocxPath, documentData, outputFileName);
            } else {
                this.logger.warning('⚠️ No se encontró documento original, generando sin referencia');
                return await this.system.generateOnly(documentData, null, outputFileName);
            }
            
        } catch (error) {
            this.logger.error(`❌ Error en generación PUMA: ${error.message}`);
            throw error;
        }
    }

    /**
     * Genera documento con análisis personalizado
     */
    async generateWithCustomAnalysis(analysisFile, documentData, outputFileName = 'puma_custom_document.docx') {
        try {
            this.logger.info('🔧 Generando documento con análisis personalizado');
            
            return await this.system.generateOnly(documentData, analysisFile, outputFileName);
            
        } catch (error) {
            this.logger.error(`❌ Error en generación personalizada: ${error.message}`);
            throw error;
        }
    }

    /**
     * Busca el documento original PUMA
     */
    async findOriginalDocument() {
        const possiblePaths = [
            '../reporte_py/template-word/PUMA MES 6 2025.docx',
            './uploads/PUMA MES 6 2025.docx',
            './template-word/PUMA MES 6 2025.docx',
            './PUMA MES 6 2025.docx'
        ];

        for (const docxPath of possiblePaths) {
            try {
                const { DocxUtils } = await import('../lib/docxUtils.js');
                if (await DocxUtils.isValidDocx(docxPath)) {
                    return docxPath;
                }
            } catch (error) {
                // Continuar buscando
            }
        }

        return null;
    }

    /**
     * Genera múltiples variantes del documento
     */
    async generateVariants(variants) {
        try {
            this.logger.info(`📦 Generando ${variants.length} variantes del documento`);
            
            const configs = variants.map((variant, index) => ({
                docxPath: variant.originalPath || '',
                documentData: { ...this.defaultDocumentData, ...variant.data },
                outputFileName: variant.outputFileName || `puma_variant_${index + 1}.docx`
            }));

            return await this.system.processBatch(configs);
            
        } catch (error) {
            this.logger.error(`❌ Error en generación de variantes: ${error.message}`);
            throw error;
        }
    }

    /**
     * Valida documento generado contra original
     */
    async validateGenerated(generatedPath, originalPath = null) {
        try {
            if (!originalPath) {
                originalPath = await this.findOriginalDocument();
            }

            if (!originalPath) {
                this.logger.warning('⚠️ No se puede validar sin documento original');
                return await this.system.validateOnly(generatedPath);
            }

            this.logger.info('✅ Validando documento generado contra original');
            return await this.system.validateOnly(generatedPath, originalPath);
            
        } catch (error) {
            this.logger.error(`❌ Error en validación: ${error.message}`);
            throw error;
        }
    }

    /**
     * Analiza documento original
     */
    async analyzeOriginalDocument() {
        try {
            const originalPath = await this.findOriginalDocument();
            
            if (!originalPath) {
                throw new Error('No se encontró documento original para analizar');
            }

            this.logger.info('🔍 Analizando documento original');
            return await this.system.analyzeOnly(originalPath);
            
        } catch (error) {
            this.logger.error(`❌ Error en análisis: ${error.message}`);
            throw error;
        }
    }

    /**
     * Genera reporte completo del proceso
     */
    async generateFullReport(documentData = {}, outputFileName = 'puma_full_report.docx') {
        try {
            this.logger.info('📊 Generando reporte completo con análisis y validación');
            
            const mergedData = { ...this.defaultDocumentData, ...documentData };
            const originalPath = await this.findOriginalDocument();
            
            if (!originalPath) {
                throw new Error('Se requiere documento original para reporte completo');
            }

            const results = await this.system.processComplete(originalPath, mergedData, outputFileName);
            
            // Generar reporte de análisis detallado
            await this.generateAnalysisReport(results);
            
            return results;
            
        } catch (error) {
            this.logger.error(`❌ Error en reporte completo: ${error.message}`);
            throw error;
        }
    }

    /**
     * Genera reporte de análisis detallado
     */
    async generateAnalysisReport(results) {
        try {
            const { LogUtils } = await import('../lib/docxUtils.js');
            
            const reportData = {
                generacion: {
                    fecha: new Date().toISOString(),
                    exitoso: results.success,
                    archivos: {
                        original: results.original.path,
                        generado: results.generated.path
                    }
                },
                analisis: results.original.analysis,
                validacion: results.generated.validation,
                comparacion: results.generated.comparison,
                resumen: results.summary
            };

            const reportPath = await LogUtils.saveLogToFile(reportData, this.options.outputPath);
            this.logger.success(`📋 Reporte de análisis guardado: ${reportPath}`);
            
            return reportPath;
            
        } catch (error) {
            this.logger.error(`❌ Error al generar reporte de análisis: ${error.message}`);
        }
    }

    /**
     * Muestra estadísticas del generador
     */
    showStats() {
        console.log('\\n📊 ESTADÍSTICAS DEL GENERADOR PUMA UNIFICADO');
        console.log('='.repeat(60));
        console.log(`🏢 Empresa por defecto: ${this.defaultDocumentData.empresa}`);
        console.log(`📝 Actividad por defecto: ${this.defaultDocumentData.actividad}`);
        console.log(`📅 Período por defecto: ${this.defaultDocumentData.fechaPeriodo}`);
        console.log(`📍 Lugar por defecto: ${this.defaultDocumentData.lugar}`);
        console.log(`👥 Sesiones configuradas: ${this.defaultDocumentData.sesiones.length}`);
        
        console.log('\\n⚙️ CONFIGURACIÓN:');
        console.log(`🖼️ Usar imágenes reales: ${this.options.useRealImages}`);
        console.log(`📁 Ruta de imágenes: ${this.options.extractedImagesPath}`);
        console.log(`📁 Ruta de salida: ${this.options.outputPath}`);
        
        // Mostrar estado del sistema
        this.system.showSystemStatus();
    }

    /**
     * Limpia recursos del generador
     */
    async cleanup() {
        try {
            await this.system.cleanup(true);
            this.logger.success('🧹 Limpieza del generador completada');
        } catch (error) {
            this.logger.error(`❌ Error en limpieza: ${error.message}`);
        }
    }
}

export default PumaUnifiedGenerator;
