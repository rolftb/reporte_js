/**
 * Script de prueba para el PumaExactReplicatorGenerator
 * 
 * Este script genera una replicación exacta del documento:
 * "PUMA MES 6 2025.docx" con todos los datos específicos extraídos.
 */

import { PumaExactReplicatorGenerator } from '../generators/PumaExactReplicator.js';
import { Packer } from 'docx';
import fs from 'fs-extra';

async function testExactReplicator() {
    console.log('🎯 GENERANDO REPLICACIÓN EXACTA DEL DOCUMENTO PUMA');
    console.log('=' .repeat(60));
    console.log('');
    console.log('📋 DATOS EXTRAÍDOS DEL DOCUMENTO ORIGINAL:');
    console.log('   ✅ Empresa: PUMA ENERGY CHILE S.A.');
    console.log('   ✅ Actividad: Programa de Calidad de Vida');
    console.log('   ✅ Período: 21 de mayo al 20 de junio');
    console.log('   ✅ Lugar: Av. Pdte. Kennedy 5454');
    console.log('   ✅ 4 sesiones con fechas y participantes exactos');
    console.log('   ✅ 16 imágenes reales de las actividades');
    console.log('');
    
    try {
        console.log('🏗️ Inicializando generador...');
        const generator = new PumaExactReplicatorGenerator(true); // usar imágenes reales
        
        console.log('📄 Generando documento...');
        const doc = await generator.generateDocument();
        
        console.log('📦 Empaquetando documento...');
        const buffer = await Packer.toBuffer(doc);
        
        const outputPath = `./output/puma_replicacion_exacta_${Date.now()}.docx`;
        await fs.writeFile(outputPath, buffer);
        
        console.log('');
        console.log('✅ REPLICACIÓN EXACTA COMPLETADA');
        console.log(`📁 Archivo generado: ${outputPath}`);
        console.log('');
        console.log('🔍 CONTENIDO REPLICADO:');
        console.log('   📋 Tabla de aspectos técnicos con datos exactos');
        console.log('   📅 4 tablas de sesiones:');
        console.log('      • 27-05-2025: 16 participantes');
        console.log('      • 03-06-2025: 12 participantes'); 
        console.log('      • 10-06-2025: 18 participantes');
        console.log('      • 17-06-2025: 16 participantes');
        console.log('   🖼️ Imágenes reales de las actividades (si están extraídas)');
        console.log('   📰 Header con logos corporativos de PUMA');
        console.log('');
        console.log('💡 COMPARACIÓN:');
        console.log('   - Compara este documento con: uploads/PUMA MES 6 2025.docx');
        console.log('   - Debe tener la misma estructura y datos');
        console.log('');
        console.log('📝 NOTA IMPORTANTE:');
        console.log('   Si las imágenes aparecen como [imageX.jpeg], ejecuta primero:');
        console.log('   node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"');
        
        return outputPath;
        
    } catch (error) {
        console.error('❌ ERROR:', error);
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Ejecutar prueba
testExactReplicator()
    .then(outputPath => {
        console.log('\\n🎉 REPLICACIÓN EXACTA COMPLETADA EXITOSAMENTE');
        console.log('🔄 El documento generado debe ser idéntico en estructura y contenido al original');
    })
    .catch(error => {
        console.error('\\n💥 ERROR EN LA REPLICACIÓN:', error.message);
        process.exit(1);
    });
