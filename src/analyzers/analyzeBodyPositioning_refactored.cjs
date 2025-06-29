/**
 * Analizador de Posicionamiento del Body (Refactorizado)
 * 
 * Analiza el posicionamiento de elementos en el cuerpo del documento
 * usando la biblioteca consolidada de analizadores.
 */

const { ConsolidatedAnalyzer } = require('../lib/consolidatedAnalyzer.js');

// Analizar posicionamiento del body usando la biblioteca consolidada
async function analyzeBodyPositioning(docxPath) {
    const analyzer = new ConsolidatedAnalyzer(docxPath);
    return await analyzer.analyzeBodyPositioning();
}

// Ejecutar análisis
async function main() {
    console.log('🔍 ANALIZADOR DE POSICIONAMIENTO DEL BODY');
    console.log('============================================================');
    
    const docxPath = process.argv[2] || './input/PUMA MES 6 2025.docx';
    
    try {
        const analyzer = new ConsolidatedAnalyzer(docxPath);
        const results = await analyzer.analyzeBodyPositioning();
        
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
    analyzeBodyPositioning,
    main
};
