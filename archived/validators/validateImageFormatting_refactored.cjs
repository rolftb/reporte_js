/**
 * Validador de Formato de Imágenes en Headers (Refactorizado)
 * 
 * Verifica que las imágenes del header tengan las configuraciones correctas
 * usando la biblioteca consolidada de validadores.
 */

const { ConsolidatedValidator } = require('../lib/consolidatedValidator.js');

// Validar configuraciones de formato usando la biblioteca consolidada
function validateImageFormatting(analysis) {
    const validator = new ConsolidatedValidator();
    return validator.validateImageFormatting(analysis);
}

// Ejecutar validación
function main() {
    console.log('🎯 VALIDADOR DE FORMATO DE IMÁGENES DEL HEADER');
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
    
    const isValid = validator.validateImageFormatting(analysis);
    
    // Mostrar implementación del generador
    validator.showGeneratorImplementation();
    
    // Mostrar resumen de validación
    validator.showValidationSummary();
    
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Generar documento: node src/tests/testExactReplicator.js');
    console.log('   2. Verificar visualmente el resultado en Word');
    console.log('   3. Comparar con documento original para confirmar alineación');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = {
    validateImageFormatting,
    main
};
