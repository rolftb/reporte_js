/**
 * Punto de Entrada Principal para las Librerías Unificadas DOCX
 * 
 * Este archivo exporta todas las clases y funciones principales
 * de las librerías unificadas para análisis, generación y validación
 * de documentos DOCX.
 * 
 * @version 1.0.0
 * @author PUMA Unified Libraries System
 */

// Exportar clases principales
export { DocxAnalyzer, AnalysisUtils } from './docxAnalyzer.js';
export { DocxGenerator, GenerationUtils } from './docxGenerator.js';
export { DocxValidator, ValidationUtils as ValidatorUtils } from './docxValidator.js';
export { 
    DocxUtils, 
    ImageUtils, 
    FormatUtils, 
    LogUtils, 
    ValidationUtils 
} from './docxUtils.js';

/**
 * Clase principal que unifica todas las funcionalidades
 */
export class PumaDocxSystem {
    constructor(options = {}) {
        this.options = {
            extractedImagesPath: options.extractedImagesPath || './extracted_images',
            outputPath: options.outputPath || './output',
            useRealImages: options.useRealImages !== false,
            logLevel: options.logLevel || 'info',
            ...options
        };
        
        this.logger = this.createLogger('PUMA-DOCX');
        this.analyzer = null;
        this.generator = null;
        this.validator = null;
    }

    /**
     * Crea un logger simple
     */
    createLogger(context) {
        return {
            info: (message) => console.log(`ℹ️ [${context}] ${message}`),
            success: (message) => console.log(`✅ [${context}] ${message}`),
            warning: (message) => console.log(`⚠️ [${context}] ${message}`),
            error: (message) => console.log(`❌ [${context}] ${message}`),
            debug: (message) => console.log(`🔍 [${context}] ${message}`)
        };
    }

    /**
     * Inicializa el sistema con un documento DOCX
     */
    async initialize(docxPath) {
        try {
            this.logger.info('Inicializando sistema DOCX...');
            
            // Validar que el archivo existe y es válido
            const isValid = await DocxUtils.isValidDocx(docxPath);
            if (!isValid) {
                throw new Error(`El archivo no es un DOCX válido: ${docxPath}`);
            }
            
            // Inicializar componentes
            this.analyzer = new DocxAnalyzer(docxPath);
            this.generator = new DocxGenerator(this.options);
            this.validator = new DocxValidator(docxPath);
            
            this.logger.success('Sistema DOCX inicializado correctamente');
            
            return {
                docxPath,
                isValid: true,
                components: {
                    analyzer: !!this.analyzer,
                    generator: !!this.generator,
                    validator: !!this.validator
                }
            };
        } catch (error) {
            this.logger.error(`Error al inicializar sistema: ${error.message}`);
            throw error;
        }
    }

    /**
     * Flujo completo: analizar, generar y validar
     */
    async processComplete(docxPath, documentData, outputFileName = 'generated_puma_document.docx') {
        try {
            this.logger.info('Iniciando procesamiento completo...');
            
            // 1. Inicializar sistema
            await this.initialize(docxPath);
            
            // 2. Analizar documento original
            this.logger.info('🔍 Fase 1: Análisis del documento original');
            const analysisResults = await this.analyzer.analyzeComplete();
            
            // 3. Cargar análisis en el generador
            this.logger.info('📄 Fase 2: Preparación de generación');
            await this.generator.loadAnalysisData(analysisResults);
            
            // 4. Generar nuevo documento
            this.logger.info('🔧 Fase 3: Generación del documento');
            const generatedPath = await this.generator.generateDocument(documentData, outputFileName);
            
            // 5. Validar documento generado
            this.logger.info('✅ Fase 4: Validación del documento generado');
            const generatedValidator = new DocxValidator(generatedPath);
            const validationResults = await generatedValidator.validateComplete();
            
            // 6. Comparar con original
            this.logger.info('🔄 Fase 5: Comparación con documento original');
            const comparisonResults = await generatedValidator.validateAgainstReference(docxPath);
            
            const completeResults = {
                original: {
                    path: docxPath,
                    analysis: analysisResults
                },
                generated: {
                    path: generatedPath,
                    validation: validationResults,
                    comparison: comparisonResults
                },
                success: validationResults.valido,
                summary: this.generateProcessSummary(analysisResults, validationResults, comparisonResults)
            };
            
            this.logger.success('Procesamiento completo finalizado');
            return completeResults;
            
        } catch (error) {
            this.logger.error(`Error en procesamiento completo: ${error.message}`);
            throw error;
        }
    }

    /**
     * Solo análisis de documento
     */
    async analyzeOnly(docxPath) {
        try {
            await this.initialize(docxPath);
            const results = await this.analyzer.analyzeComplete();
            
            // Guardar resultados
            const outputPath = await this.analyzer.saveResults(this.options.outputPath);
            
            return {
                analysis: results,
                outputPath: outputPath
            };
        } catch (error) {
            this.logger.error(`Error en análisis: ${error.message}`);
            throw error;
        }
    }

    /**
     * Solo generación de documento
     */
    async generateOnly(documentData, analysisFile = null, outputFileName = 'generated_document.docx') {
        try {
            this.generator = new DocxGenerator(this.options);
            
            if (analysisFile) {
                await this.generator.loadAnalysisData(analysisFile);
            }
            
            const generatedPath = await this.generator.generateDocument(documentData, outputFileName);
            
            return {
                generated: generatedPath,
                success: true
            };
        } catch (error) {
            this.logger.error(`Error en generación: ${error.message}`);
            throw error;
        }
    }

    /**
     * Solo validación de documento
     */
    async validateOnly(docxPath, referencePath = null) {
        try {
            this.validator = new DocxValidator(docxPath);
            const results = await this.validator.validateComplete();
            
            let comparison = null;
            if (referencePath) {
                comparison = await this.validator.validateAgainstReference(referencePath);
            }
            
            // Generar reporte
            const reportPath = await this.validator.generateValidationReport(this.options.outputPath);
            
            return {
                validation: results,
                comparison: comparison,
                reportPath: reportPath
            };
        } catch (error) {
            this.logger.error(`Error en validación: ${error.message}`);
            throw error;
        }
    }

    /**
     * Procesa múltiples documentos en lote
     */
    async processBatch(documentConfigs) {
        try {
            this.logger.info(`Procesando ${documentConfigs.length} documentos en lote...`);
            
            const results = [];
            
            for (let i = 0; i < documentConfigs.length; i++) {
                const config = documentConfigs[i];
                
                LogUtils.logProgress(i + 1, documentConfigs.length, 'Procesando lote');
                
                try {
                    const result = await this.processComplete(
                        config.docxPath,
                        config.documentData,
                        config.outputFileName
                    );
                    
                    results.push({
                        index: i,
                        config: config,
                        result: result,
                        success: true
                    });
                } catch (error) {
                    results.push({
                        index: i,
                        config: config,
                        error: error.message,
                        success: false
                    });
                }
            }
            
            this.logger.success(`Lote completado: ${results.filter(r => r.success).length}/${results.length} exitosos`);
            
            return results;
        } catch (error) {
            this.logger.error(`Error en procesamiento por lotes: ${error.message}`);
            throw error;
        }
    }

    /**
     * Genera resumen del proceso
     */
    generateProcessSummary(analysis, validation, comparison) {
        const summary = {
            timestamp: new Date().toISOString(),
            metrics: {
                analysis: {
                    headers: analysis.headerDimensions?.headers?.length || 0,
                    images: analysis.imageFormatting?.headers?.reduce((sum, h) => sum + h.imagenes.length, 0) || 0,
                    tables: analysis.bodyPositioning?.tablas?.length || 0
                },
                validation: {
                    valid: validation.valido,
                    errors: validation.errores.length,
                    warnings: validation.advertencias.length
                },
                comparison: comparison ? {
                    differences: comparison.diferencias?.length || 0,
                    similarities: comparison.similitudes?.length || 0
                } : null
            },
            quality: ValidatorUtils.calculateQualityMetrics(validation),
            recommendations: ValidatorUtils.suggestCorrections(validation)
        };
        
        return summary;
    }

    /**
     * Muestra reporte de estado del sistema
     */
    showSystemStatus() {
        console.log('\n📊 ESTADO DEL SISTEMA PUMA DOCX');
        console.log('='.repeat(50));
        console.log(`Opciones configuradas:`);
        console.log(`  📁 Imágenes extraídas: ${this.options.extractedImagesPath}`);
        console.log(`  📁 Salida: ${this.options.outputPath}`);
        console.log(`  🖼️ Usar imágenes reales: ${this.options.useRealImages}`);
        console.log(`  📝 Nivel de log: ${this.options.logLevel}`);
        
        console.log(`\nComponentes inicializados:`);
        console.log(`  🔍 Analizador: ${this.analyzer ? '✅' : '❌'}`);
        console.log(`  🔧 Generador: ${this.generator ? '✅' : '❌'}`);
        console.log(`  ✅ Validador: ${this.validator ? '✅' : '❌'}`);
    }

    /**
     * Limpia recursos y archivos temporales
     */
    async cleanup(removeTemporaryFiles = false) {
        try {
            this.logger.info('Limpiando recursos...');
            
            if (removeTemporaryFiles) {
                // Limpiar archivos temporales si es necesario
                const tempDirs = ['./temp', './cache'];
                for (const dir of tempDirs) {
                    if (await fs.pathExists(dir)) {
                        await fs.remove(dir);
                        this.logger.info(`Directorio temporal eliminado: ${dir}`);
                    }
                }
            }
            
            // Resetear componentes
            this.analyzer = null;
            this.generator = null;
            this.validator = null;
            
            this.logger.success('Limpieza completada');
        } catch (error) {
            this.logger.error(`Error en limpieza: ${error.message}`);
        }
    }
}

/**
 * Funciones de conveniencia para uso rápido
 */

/**
 * Análisis rápido de un documento DOCX
 */
export async function quickAnalyze(docxPath, outputPath = './output') {
    const system = new PumaDocxSystem({ outputPath });
    return await system.analyzeOnly(docxPath);
}

/**
 * Generación rápida de un documento DOCX
 */
export async function quickGenerate(documentData, outputFileName = 'generated.docx', options = {}) {
    try {
        const { DocxGenerator } = await import('./docxGenerator.js');
        const generator = new DocxGenerator(options);
        const path = await generator.generateDocument(documentData, outputFileName);
        return { success: true, generated: path };
    } catch (error) {
        console.error('❌ Error en generación rápida:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Validación rápida de un documento DOCX
 */
export async function quickValidate(docxPath, referencePath = null, outputPath = './output') {
    const system = new PumaDocxSystem({ outputPath });
    return await system.validateOnly(docxPath, referencePath);
}

/**
 * Proceso completo rápido
 */
export async function quickProcess(originalDocxPath, documentData, outputFileName = 'generated.docx', options = {}) {
    const system = new PumaDocxSystem(options);
    return await system.processComplete(originalDocxPath, documentData, outputFileName);
}

export default PumaDocxSystem;
