/**
 * Prueba simple del generador con imágenes reales
 * Para verificar que las imágenes se incluyen correctamente en el documento
 */

import { PumaDocumentGenerator } from './generators/PumaDocumentGenerator.js';
import fs from 'fs-extra';

async function testSimpleGeneration() {
    console.log('🧪 PRUEBA SIMPLE: Generador con imágenes reales');
    console.log('=' .repeat(50));
    
    try {
        // Generar documento con imágenes reales
        console.log('📄 Generando documento con imágenes reales...');
        const generator = new PumaDocumentGenerator(true); // useRealImages = true
        const docBuffer = await generator.generateDocument();
        
        // Guardar documento
        const outputPath = `./output/puma_test_simple_${Date.now()}.docx`;
        await fs.writeFile(outputPath, docBuffer);
        
        console.log('✅ Documento generado exitosamente');
        console.log(`📁 Ubicación: ${outputPath}`);
        console.log('');
        console.log('🔍 VERIFICAR MANUALMENTE:');
        console.log('   1. Abrir el documento generado');
        console.log('   2. Verificar que el header contiene los logos');
        console.log('   3. Verificar que las páginas de actividades contienen fotos reales');
        console.log('   4. Confirmar que no hay solo texto sin imágenes');
        
    } catch (error) {
        console.error('❌ Error generando documento:', error);
        console.error('Stack:', error.stack);
    }
}

testSimpleGeneration();
