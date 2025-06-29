/**
 * Validador de Posicionamiento del Body (Refactorizado)
 * 
 * Valida que el posicionamiento de elementos del body (imágenes y tablas) 
 * se esté aplicando correctamente usando la biblioteca consolidada.
 */

const { ConsolidatedValidator } = require('../lib/consolidatedValidator.js');

// Validar posicionamiento del body usando la biblioteca consolidada
function validateBodyPositioning(analysis) {
    const validator = new ConsolidatedValidator();
    return validator.validateBodyPositioning(analysis);
}

// Ejecutar validación
async function main() {
    console.log('🎯 VALIDADOR DE POSICIONAMIENTO DEL BODY');
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
    
    const isValid = validator.validateBodyPositioning(analysis);
    
    // Mostrar resumen de validación
    validator.showValidationSummary();
    
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Verificar implementación en el generador');
    console.log('   2. Generar documento: node src/tests/testExactReplicator.js');
    console.log('   3. Comparar posicionamiento con documento original');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = {
    validateBodyPositioning,
    main
};
