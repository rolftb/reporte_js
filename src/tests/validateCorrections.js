/**
 * Script de validación para las correcciones específicas del PumaExactReplicator
 * 
 * Valida:
 * 1. Header diferente en primera página vs páginas siguientes
 * 2. Color de la primera celda de la tabla
 */

import { PumaExactReplicatorGenerator } from '../generators/PumaExactReplicator.js';
import { Packer } from 'docx';
import fs from 'fs-extra';

async function validateCorrections() {
    console.log('🔍 VALIDANDO CORRECCIONES ESPECÍFICAS DEL GENERADOR PUMA');
    console.log('=' .repeat(65));
    console.log('');
    console.log('📋 CORRECCIONES IMPLEMENTADAS:');
    console.log('   1. ✅ Header primera página: imagen17 + texto PUMA + imagen18');
    console.log('   2. ✅ Header páginas siguientes: solo imagen17');
    console.log('   3. ✅ Primera celda tabla: fondo azul corporativo (#4472C4) + texto blanco');
    console.log('');
    
    try {
        console.log('🏗️ Generando documento con correcciones...');
        const generator = new PumaExactReplicatorGenerator(true);
        const doc = await generator.generateDocument();
        
        console.log('📦 Empaquetando documento...');
        const buffer = await Packer.toBuffer(doc);
        
        const outputPath = `./output/puma_corregido_${Date.now()}.docx`;
        await fs.writeFile(outputPath, buffer);
        
        console.log('');
        console.log('✅ DOCUMENTO CON CORRECCIONES GENERADO');
        console.log(`📁 Ubicación: ${outputPath}`);
        console.log('');
        console.log('🔍 VALIDACIONES A REALIZAR EN EL DOCUMENTO:');
        console.log('');
        console.log('📄 PRIMERA PÁGINA:');
        console.log('   ✅ Header debe mostrar: [imagen17] PUMA ENERGY CHILE S.A. [imagen18]');
        console.log('   ✅ Primera celda de tabla debe tener fondo azul y texto blanco');
        console.log('   ✅ Texto: "ASPECTOS TÉCNICOS DE LA ACTIVIDAD EN TERRENO"');
        console.log('');
        console.log('📄 PÁGINAS SIGUIENTES:');
        console.log('   ✅ Header debe mostrar solo: [imagen17]');
        console.log('   ✅ No debe aparecer texto PUMA ni imagen18');
        console.log('');
        console.log('🎨 COLORES Y FORMATO:');
        console.log('   ✅ Celda de título: Fondo azul corporativo (#4472C4)');
        console.log('   ✅ Texto de título: Color blanco (#FFFFFF)');
        console.log('   ✅ Texto bold y centrado');
        console.log('');
        console.log('💡 COMPARACIÓN CON ORIGINAL:');
        console.log('   - Abre: uploads/PUMA MES 6 2025.docx');
        console.log('   - Compara headers entre páginas');
        console.log('   - Verifica color de primera celda');
        console.log('');
        console.log('🔧 DIFERENCIAS ESPERADAS CON VERSIÓN ANTERIOR:');
        console.log('   ❌ Antes: Mismo header en todas las páginas');
        console.log('   ✅ Ahora: Header diferente en primera página');
        console.log('   ❌ Antes: Primera celda sin color de fondo');
        console.log('   ✅ Ahora: Primera celda con fondo azul corporativo');
        
        return outputPath;
        
    } catch (error) {
        console.error('❌ ERROR EN VALIDACIÓN:', error);
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Ejecutar validación
validateCorrections()
    .then(outputPath => {
        console.log('\\n🎉 VALIDACIÓN DE CORRECCIONES COMPLETADA');
        console.log('📝 Verifica manualmente el documento generado para confirmar las correcciones');
        console.log('🔄 El documento debe mostrar exactamente la estructura del original con headers diferenciados');
    })
    .catch(error => {
        console.error('\\n💥 ERROR EN LA VALIDACIÓN:', error.message);
        process.exit(1);
    });
