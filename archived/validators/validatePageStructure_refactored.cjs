/**
 * Validador de Estructura por Páginas (Refactorizado)
 * 
 * Valida que la estructura del documento sea correcta usando la biblioteca consolidada:
 * - Tabla principal inicial
 * - 4 páginas, cada una con: 1 tabla + 4 imágenes
 */

const { ConsolidatedValidator } = require('../lib/consolidatedValidator.js');

// Validar estructura de páginas usando la biblioteca consolidada
function validatePageStructure(analysis) {
    const validator = new ConsolidatedValidator();
    return validator.validatePageStructure(analysis);
}

// Ejecutar validación
async function main() {
    console.log('🎯 VALIDADOR DE ESTRUCTURA POR PÁGINAS');
    console.log('============================================================');
    
    const validator = new ConsolidatedValidator();
    const analysis = validator.loadLatestAnalysis('body_positioning_');
    
    if (!analysis) {
        console.log('❌ No se encontraron archivos de análisis del body');
        console.log('💡 Ejecuta primero: node src/analyzers/analyzeBodyPositioning.cjs');
        return;
    }
    
    console.log(`📅 Análisis realizado: ${analysis.fecha}`);
    console.log(`📄 Documento analizado: ${analysis.archivo}`);
    
    const isValid = validator.validatePageStructure(analysis);
    
    // Mostrar resumen de validación
    validator.showValidationSummary();
    
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Verificar implementación en el generador');
    console.log('   2. Generar documento: node src/tests/testExactReplicator.js');
    console.log('   3. Revisar estructura por páginas en Word');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = {
    validatePageStructure,
    main
};
