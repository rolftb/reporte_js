/**
 * Analizador de Formato de Imágenes (Refactorizado)
 * 
 * Analiza el formato y posicionamiento de imágenes en headers
 * usando la biblioteca consolidada de analizadores.
 */

const { ConsolidatedAnalyzer } = require('../lib/consolidatedAnalyzer.js');

// Analizar formato de imágenes usando la biblioteca consolidada
async function analyzeImageFormatting(docxPath) {
    const analyzer = new ConsolidatedAnalyzer(docxPath);
    return await analyzer.analyzeImageFormatting();
}

// Ejecutar análisis
async function main() {
    console.log('🔍 ANALIZADOR DE FORMATO DE IMÁGENES EN HEADERS');
    console.log('============================================================');
    
    const docxPath = process.argv[2] || './input/PUMA MES 6 2025.docx';
    
    try {
        const analyzer = new ConsolidatedAnalyzer(docxPath);
        const results = await analyzer.analyzeImageFormatting();
        
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
    analyzeImageFormatting,
    main
};
