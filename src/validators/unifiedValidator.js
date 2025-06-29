/**
 * Validador Unificado
 * 
 * Punto de entrada único para todas las validaciones de análisis DOCX
 * usando las bibliotecas consolidadas.
 */

import { ConsolidatedValidator } from '../lib/consolidatedValidator.js';

class UnifiedValidator {
    constructor() {
        this.validator = new ConsolidatedValidator();
    }

    async validateAll() {
        console.log('🎯 VALIDACIÓN COMPLETA DE TODOS LOS ANÁLISIS');
        console.log('============================================================');

        const results = {
            successful: [],
            failed: [],
            warnings: []
        };

        try {
            // 1. Validar formato de imágenes
            console.log('🎯 1. Validando formato de imágenes...');
            const imageAnalysis = this.validator.loadLatestAnalysis('image_formatting_');
            if (imageAnalysis) {
                const isValid = this.validator.validateImageFormatting(imageAnalysis);
                if (isValid) {
                    results.successful.push('Formato de imágenes');
                } else {
                    results.failed.push('Formato de imágenes');
                }
            } else {
                results.warnings.push('No se encontró análisis de formato de imágenes');
            }
            console.log('');

            // 2. Validar recortes de imágenes
            console.log('🎯 2. Validando recortes de imágenes...');
            if (imageAnalysis) {
                const croppingResults = this.validator.validateImageCropping(imageAnalysis);
                if (croppingResults.valid) {
                    results.successful.push('Recortes de imágenes');
                } else {
                    results.failed.push('Recortes de imágenes');
                }
            } else {
                results.warnings.push('No se encontró análisis para validar recortes');
            }
            console.log('');

            // 3. Validar posicionamiento del body
            console.log('🎯 3. Validando posicionamiento del body...');
            const bodyAnalysis = this.validator.loadLatestAnalysis('body_positioning_');
            if (bodyAnalysis) {
                const isValid = this.validator.validateBodyPositioning(bodyAnalysis);
                if (isValid) {
                    results.successful.push('Posicionamiento del body');
                } else {
                    results.failed.push('Posicionamiento del body');
                }
            } else {
                results.warnings.push('No se encontró análisis de posicionamiento del body');
            }
            console.log('');

            // 4. Validar estructura de páginas
            console.log('🎯 4. Validando estructura de páginas...');
            if (bodyAnalysis) {
                const isValid = this.validator.validatePageStructure(bodyAnalysis);
                if (isValid) {
                    results.successful.push('Estructura de páginas');
                } else {
                    results.failed.push('Estructura de páginas');
                }
            } else {
                results.warnings.push('No se encontró análisis para validar estructura de páginas');
            }
            console.log('');

            // Mostrar resumen final
            this.showFinalSummary(results);

            return results;

        } catch (error) {
            console.error('❌ Error durante la validación:', error.message);
            throw error;
        }
    }

    showFinalSummary(results) {
        console.log('📊 RESUMEN FINAL DE VALIDACIONES');
        console.log('============================================================');
        
        if (results.successful.length > 0) {
            console.log('✅ VALIDACIONES EXITOSAS:');
            results.successful.forEach(item => {
                console.log(`   ✓ ${item}`);
            });
            console.log('');
        }

        if (results.failed.length > 0) {
            console.log('❌ VALIDACIONES FALLIDAS:');
            results.failed.forEach(item => {
                console.log(`   ✗ ${item}`);
            });
            console.log('');
        }

        if (results.warnings.length > 0) {
            console.log('⚠️ ADVERTENCIAS:');
            results.warnings.forEach(item => {
                console.log(`   ! ${item}`);
            });
            console.log('');
        }

        // Mostrar estadísticas
        const total = results.successful.length + results.failed.length;
        if (total > 0) {
            const successRate = ((results.successful.length / total) * 100).toFixed(1);
            console.log(`📈 TASA DE ÉXITO: ${successRate}% (${results.successful.length}/${total})`);
        }

        // Mostrar resumen de validación consolidado
        this.validator.showValidationSummary();
    }

    async quickValidation() {
        console.log('⚡ VALIDACIÓN RÁPIDA');
        console.log('============================================================');

        const checks = [
            { name: 'Análisis de imágenes', pattern: 'image_formatting_' },
            { name: 'Análisis del body', pattern: 'body_positioning_' },
            { name: 'Análisis de headers', pattern: 'header_dimensions_' }
        ];

        console.log('🔍 Verificando análisis disponibles...');
        checks.forEach(check => {
            const analysis = this.validator.loadLatestAnalysis(check.pattern);
            if (analysis) {
                console.log(`   ✅ ${check.name} - ${analysis.fecha}`);
            } else {
                console.log(`   ❌ ${check.name} - No encontrado`);
            }
        });

        console.log('\n💡 Para validación completa, usa: node src/validators/unifiedValidator.js full');
    }
}

// Ejecutar validación
async function main() {
    const mode = process.argv[2] || 'full'; // full, quick

    const unifiedValidator = new UnifiedValidator();

    try {
        switch (mode) {
            case 'quick':
                await unifiedValidator.quickValidation();
                break;
            case 'full':
            default:
                await unifiedValidator.validateAll();
                break;
        }

        console.log('\n🎉 VALIDACIÓN COMPLETADA');

    } catch (error) {
        console.error('❌ Error en la validación:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    UnifiedValidator,
    main
};
