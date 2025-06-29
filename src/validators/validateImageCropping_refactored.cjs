/**
 * Validador de Recortes de Imágenes (Refactorizado)
 * 
 * Verifica que los recortes extraídos del análisis XML se apliquen
 * correctamente usando la biblioteca consolidada de validadores.
 */

const { ConsolidatedValidator } = require('../lib/consolidatedValidator.js');

// Validar información de recortes usando la biblioteca consolidada
function validateCroppingData(analysis) {
    const validator = new ConsolidatedValidator();
    return validator.validateImageCropping(analysis);
}

// Ejecutar validación
function main() {
    console.log('🎯 VALIDADOR DE RECORTES DE IMÁGENES');
    console.log('============================================================');
    
    const validator = new ConsolidatedValidator();
    const analysis = validator.loadLatestAnalysis('image_formatting_');
    
    if (!analysis) {
        console.log('❌ No se encontraron archivos de análisis de formato de imágenes');
        console.log('💡 Ejecuta primero: node src/analyzers/analyzeImageFormatting.cjs');
        return;
    }
    
    console.log(`📅 Análisis realizado: ${analysis.fecha}`);
    console.log(`📄 Documento analizado: ${analysis.archivo}`);
    console.log(`🔢 Headers analizados: ${analysis.headers.length}`);
    
    const croppingResults = validator.validateImageCropping(analysis);
    
    // Mostrar resumen de validación
    validator.showValidationSummary();
    
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Implementar los recortes extraídos en el generador');
    console.log('   2. Generar documento: node src/tests/testExactReplicator.js');
    console.log('   3. Verificar visualmente el resultado en Word');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = {
    validateCroppingData,
    main
};
