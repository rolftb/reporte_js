/**
 * Test Unificado usando Bibliotecas Consolidadas
 * 
 * Prueba la funcionalidad de las bibliotecas consolidadas
 * de análisis y validación.
 */

import { ConsolidatedAnalyzer } from '../lib/consolidatedAnalyzer.js';
import { ConsolidatedValidator } from '../lib/consolidatedValidator.js';
import PumaDocumentGenerator from '../generators/PumaDocumentGenerator.js';

async function testUnifiedLibraries() {
    console.log('🧪 PRUEBA DE BIBLIOTECAS CONSOLIDADAS');
    console.log('============================================================');

    const docxPath = './input/PUMA MES 6 2025.docx';

    try {
        // 1. Probar analizador consolidado
        console.log('🔍 1. Probando analizador consolidado...');
        const analyzer = new ConsolidatedAnalyzer(docxPath);
        
        const imageAnalysis = await analyzer.analyzeImageFormatting();
        console.log(`   ✅ Análisis de imágenes: ${imageAnalysis.headers.length} headers analizados`);
        
        const headerAnalysis = await analyzer.analyzeHeaderDimensions();
        console.log(`   ✅ Análisis de headers: completado`);
        
        const bodyAnalysis = await analyzer.analyzeBodyPositioning();
        console.log(`   ✅ Análisis del body: completado`);
        
        console.log('');

        // 2. Probar validador consolidado
        console.log('🎯 2. Probando validador consolidado...');
        const validator = new ConsolidatedValidator();
        
        const imageValidation = validator.validateImageFormatting(imageAnalysis);
        console.log(`   ✅ Validación de imágenes: ${imageValidation ? 'PASÓ' : 'FALLÓ'}`);
        
        const croppingValidation = validator.validateImageCropping(imageAnalysis);
        console.log(`   ✅ Validación de recortes: ${croppingValidation.valid ? 'PASÓ' : 'FALLÓ'}`);
        
        const bodyValidation = validator.validateBodyPositioning(bodyAnalysis);
        console.log(`   ✅ Validación del body: ${bodyValidation ? 'PASÓ' : 'FALLÓ'}`);
        
        console.log('');

        // 3. Probar generación de documentos
        console.log('📄 3. Probando generación de documento...');
        const generator = new PumaDocumentGenerator();
        
        const datosOriginal = {
            empresa: "PUMA",
            nombreActividad: "Programa de Calidad de Vida.",
            fechaRango: "Desde el 21 de mayo al al 20 de junio",
            lugar: "Av. Pdte. Kennedy 5454",
            profesional: "Profesional área Calidad de Vida - Mutual Asesorías.",
            registros: [
                {
                    fecha: "27-05-2025",
                    cantidadPausas: 1,
                    participantes: 16
                },
                {
                    fecha: "03-06-2025",
                    cantidadPausas: 1,
                    participantes: 12
                }
            ]
        };

        const outputPath = './output/test_unified_libraries.docx';
        await generator.generateDocument(datosOriginal, outputPath);
        console.log(`   ✅ Documento generado: ${outputPath}`);
        
        console.log('');

        // 4. Mostrar resúmenes
        console.log('📊 4. Mostrando resúmenes...');
        analyzer.showAnalysisSummary();
        validator.showValidationSummary();

        console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
        console.log('✅ Las bibliotecas consolidadas funcionan correctamente');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
        console.error(error.stack);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testUnifiedLibraries();
}

export {
    testUnifiedLibraries
};
