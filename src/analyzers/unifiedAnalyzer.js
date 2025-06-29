/**
 * Analizador Unificado
 * 
 * Punto de entrada único para todos los análisis de documentos DOCX
 * usando las bibliotecas consolidadas.
 */

import { ConsolidatedAnalyzer } from '../lib/consolidatedAnalyzer.js';
import { ConsolidatedValidator } from '../lib/consolidatedValidator.js';

class UnifiedAnalyzer {
    constructor(docxPath) {
        this.docxPath = docxPath;
        this.analyzer = new ConsolidatedAnalyzer(docxPath, {
            extractImages: true,
            extractText: true,
            analyzeStyles: true,
            analyzeMetadata: true,
            analyzeRelationships: true,
            logLevel: 'info'
        });
        this.validator = new ConsolidatedValidator();
    }

    async runFullAnalysis() {
        console.log('🚀 ANÁLISIS COMPLETO Y DETALLADO DE DOCUMENTO DOCX');
        console.log('============================================================');
        console.log(`📄 Documento: ${this.docxPath}`);
        console.log('');

        try {
            // Ejecutar análisis completo con todas las opciones habilitadas
            console.log('🔍 Ejecutando análisis exhaustivo...');
            const results = await this.analyzer.analyzeComplete();
            
            console.log('✅ Análisis completo exitoso\n');

            // Mostrar resumen consolidado
            this.analyzer.showAnalysisSummary();

            return results;

        } catch (error) {
            console.error('❌ Error durante el análisis:', error.message);
            throw error;
        }
    }

    async runFullValidation() {
        console.log('🎯 VALIDACIÓN COMPLETA DE ANÁLISIS');
        console.log('============================================================');

        try {
            // Cargar análisis más recientes
            const imageAnalysis = this.validator.loadLatestAnalysis('image_formatting_');
            const bodyAnalysis = this.validator.loadLatestAnalysis('body_positioning_');
            const headerAnalysis = this.validator.loadLatestAnalysis('header_dimensions_');

            const validationResults = {};

            // 1. Validar formato de imágenes
            if (imageAnalysis) {
                console.log('🎯 1. Validando formato de imágenes...');
                validationResults.imageFormatting = this.validator.validateImageFormatting(imageAnalysis);
                console.log('✅ Validación de formato de imágenes completada\n');
            }

            // 2. Validar recortes de imágenes
            if (imageAnalysis) {
                console.log('🎯 2. Validando recortes de imágenes...');
                validationResults.imageCropping = this.validator.validateImageCropping(imageAnalysis);
                console.log('✅ Validación de recortes completada\n');
            }

            // 3. Validar posicionamiento del body
            if (bodyAnalysis) {
                console.log('🎯 3. Validando posicionamiento del body...');
                validationResults.bodyPositioning = this.validator.validateBodyPositioning(bodyAnalysis);
                console.log('✅ Validación de posicionamiento completada\n');
            }

            // 4. Validar estructura de páginas
            if (bodyAnalysis) {
                console.log('🎯 4. Validando estructura de páginas...');
                validationResults.pageStructure = this.validator.validatePageStructure(bodyAnalysis);
                console.log('✅ Validación de estructura completada\n');
            }

            // Mostrar resumen de validación
            this.validator.showValidationSummary();

            return validationResults;

        } catch (error) {
            console.error('❌ Error durante la validación:', error.message);
            throw error;
        }
    }

    async runComplete() {
        console.log('🌟 PROCESO COMPLETO: ANÁLISIS + VALIDACIÓN');
        console.log('============================================================');

        const analysisResults = await this.runFullAnalysis();
        console.log('\n' + '='.repeat(60) + '\n');
        const validationResults = await this.runFullValidation();

        return {
            analysis: analysisResults,
            validation: validationResults
        };
    }
}

// Ejecutar análisis
async function main() {
    console.log('📋 Función main iniciada');
    const docxPath = process.argv[2] || './templates/documento-ejemplo-analisis.docx';
    const mode = process.argv[3] || 'complete'; // complete, analysis, validation
    
    console.log(`📄 Archivo: ${docxPath}`);
    console.log(`🎯 Modo: ${mode}`);

    const unifiedAnalyzer = new UnifiedAnalyzer(docxPath);

    try {
        switch (mode) {
            case 'analysis':
                await unifiedAnalyzer.runFullAnalysis();
                break;
            case 'validation':
                await unifiedAnalyzer.runFullValidation();
                break;
            case 'complete':
            default:
                await unifiedAnalyzer.runComplete();
                break;
        }

        console.log('\n🎉 PROCESO COMPLETADO EXITOSAMENTE');
        console.log('📁 Todos los resultados guardados en: ./output/');

    } catch (error) {
        console.error('❌ Error en el proceso:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url.startsWith('file://') && process.argv[1].includes('unifiedAnalyzer.js')) {
    console.log('🚀 Iniciando analizador unificado...');
    main().catch(error => {
        console.error('❌ Error crítico:', error);
        process.exit(1);
    });
}

export {
    UnifiedAnalyzer,
    main
};
