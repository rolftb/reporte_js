/**
 * Prueba del generador que respeta la estructura REAL del documento PUMA
 * Basado en el análisis que muestra que es principalmente imágenes, no tablas
 */

import { PumaRealStructureGenerator } from '../generators/PumaRealStructureGenerator.js';
import { Packer } from 'docx';
import fs from 'fs-extra';

async function testRealStructureGenerator() {
    console.log('🧪 PRUEBA: Generador con estructura REAL del PUMA');
    console.log('=' .repeat(55));
    console.log('');
    console.log('📋 BASADO EN ANÁLISIS REAL:');
    console.log('   - Header: Completamente de imágenes (logos)');
    console.log('   - Páginas: Principalmente imágenes con mínimo texto');
    console.log('   - No tablas estructuradas como se pensaba inicialmente');
    console.log('   - Documento visual/fotográfico');
    console.log('');
    
    try {
        // Generar documento con estructura real
        console.log('📄 Generando documento con estructura real...');
        const generator = new PumaRealStructureGenerator(true); // usar imágenes reales
        const doc = await generator.generateDocument();
        
        console.log('📦 Empaquetando documento...');
        const buffer = await Packer.toBuffer(doc);
        
        const outputPath = `./output/puma_estructura_real_${Date.now()}.docx`;
        await fs.writeFile(outputPath, buffer);
        
        console.log('');
        console.log('✅ DOCUMENTO GENERADO EXITOSAMENTE');
        console.log(`📁 Ubicación: ${outputPath}`);
        console.log('');
        console.log('🔍 VERIFICAR EN EL DOCUMENTO:');
        console.log('   ✅ Header con logos/imágenes corporativas');
        console.log('   ✅ Páginas con imágenes de actividades (máx 4 por página)');
        console.log('   ✅ Mínimo texto, máximo contenido visual');
        console.log('   ✅ Estructura similar al documento original');
        console.log('');
        console.log('📊 DIFERENCIAS CON VERSIÓN ANTERIOR:');
        console.log('   - No más tablas complejas (no existen en el original)');
        console.log('   - Header completamente visual');
        console.log('   - Enfoque en contenido fotográfico');
        console.log('   - Estructura más fiel al documento real');
        
        return outputPath;
        
    } catch (error) {
        console.error('❌ ERROR:', error);
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Ejecutar prueba
testRealStructureGenerator()
    .then(outputPath => {
        console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
        console.log('💡 Compara este documento con el original para validar la estructura');
    })
    .catch(error => {
        console.error('\n💥 ERROR EN LA PRUEBA:', error.message);
        process.exit(1);
    });
