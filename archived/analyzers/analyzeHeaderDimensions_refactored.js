/**
 * Analizador de Dimensiones de Headers (Refactorizado)
 * 
 * Analiza las dimensiones y estructura de headers
 * usando la biblioteca consolidada de analizadores.
 */

const { ConsolidatedAnalyzer } = require('../lib/consolidatedAnalyzer.js');

// Analizar dimensiones de headers usando la biblioteca consolidada
async function analyzeHeaderDimensions(docxPath) {
    const analyzer = new ConsolidatedAnalyzer(docxPath);
    return await analyzer.analyzeHeaderDimensions();
}

// Ejecutar análisis
async function main() {
    console.log('🔍 ANALIZADOR DE DIMENSIONES DE HEADERS');
    console.log('============================================================');
    
    const docxPath = process.argv[2] || './input/PUMA MES 6 2025.docx';
    
    try {
        const analyzer = new ConsolidatedAnalyzer(docxPath);
        const results = await analyzer.analyzeHeaderDimensions();
        
        // Mostrar resumen del análisis
        analyzer.showAnalysisSummary();
        
        console.log('\n✅ Análisis completado exitosamente');
        console.log('📁 Resultados guardados en: ./output/');
        
        return results;
    } catch (error) {
        console.error('❌ Error en análisis:', error.message);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = {
    analyzeHeaderDimensions,
    main
};
