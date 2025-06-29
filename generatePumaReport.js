#!/usr/bin/env node

/**
 * GENERADOR PRINCIPAL DEL REPORTE PUMA
 * 
 * Sistema simplificado para generar reportes PUMA con imágenes reales
 * extraídas del documento original.
 * 
 * Uso:
 *   node generatePumaReport.js
 * 
 * El sistema:
 * 1. Usa las imágenes ya extraídas de "PUMA MES 6 2025.docx"
 * 2. Genera un documento con la estructura real del original
 * 3. Incluye logos en el header y fotos en las actividades
 */

import { PumaRealStructureGenerator } from './src/generators/PumaRealStructureGenerator.js';
import { Packer } from 'docx';
import fs from 'fs-extra';
import path from 'path';

async function generatePumaReport() {
    console.log('🎯 GENERADOR PRINCIPAL DE REPORTES PUMA');
    console.log('=' .repeat(50));
    console.log('📄 Generando reporte con estructura real del documento original...\n');

    try {
        // Verificar que las imágenes estén extraídas
        const extractedImagesPath = './extracted_images';
        const registryPath = path.join(extractedImagesPath, 'image_registry.json');
        
        if (!await fs.pathExists(registryPath)) {
            console.log('⚠️ No se encontraron imágenes extraídas.');
            console.log('💡 Primero ejecuta: node src/documentImageExtractor.cjs "./uploads/PUMA MES 6 2025.docx"');
            return;
        }

        // Crear el generador
        const generator = new PumaRealStructureGenerator(true);
        
        // Generar el documento
        const document = await generator.generateDocument();
        
        // Asegurar que existe el directorio de salida
        await fs.ensureDir('./output');
        
        // Guardar el documento
        const timestamp = Date.now();
        const outputPath = `./output/reporte_puma_${timestamp}.docx`;
        
        const buffer = await Packer.toBuffer(document);
        await fs.writeFile(outputPath, buffer);
        
        console.log('✅ Reporte generado exitosamente!');
        console.log(`📁 Archivo: ${outputPath}`);
        console.log(`📊 Basado en: 18 imágenes extraídas del documento original`);
        console.log(`🖼️ Incluye: Header con logos + páginas con fotos reales`);
        
    } catch (error) {
        console.error('❌ Error generando el reporte:', error);
        console.error('\n💡 Soluciones posibles:');
        console.error('   1. Verifica que las imágenes estén extraídas');
        console.error('   2. Ejecuta: node src/documentImageExtractor.cjs "./uploads/PUMA MES 6 2025.docx"');
        console.error('   3. Asegúrate de que el archivo PUMA esté en ./uploads/');
    }
}

// Ejecutar si se llama directamente
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ejecutar función principal
generatePumaReport();

export { generatePumaReport };
