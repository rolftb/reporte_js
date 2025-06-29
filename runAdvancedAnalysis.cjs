#!/usr/bin/env node

const path = require('path');
const { DocumentImageExtractor } = require('./src/DocumentImageExtractor.cjs');

/**
 * Script para ejecutar el análisis avanzado de imágenes
 */
async function runAdvancedAnalysis() {
  console.log('🚀 Iniciando análisis avanzado de imágenes del documento PUMA...\n');
  
  try {
    // Configurar paths
    const inputPath = './input/PUMA MES 6 2025.docx';
    const outputDir = './extracted_images';
    
    // Verificar que el archivo existe
    const fs = require('fs-extra');
    if (!await fs.pathExists(inputPath)) {
      console.error(`❌ No se encontró el archivo: ${inputPath}`);
      console.log('📁 Verifica que el archivo esté en la carpeta input/');
      return;
    }
    
    // Crear extractor avanzado
    const extractor = new DocumentImageExtractor(outputDir);
    
    // Ejecutar análisis completo
    console.log('📋 Ejecutando análisis avanzado...');
    const report = await extractor.analyzeAndExtractImages(inputPath);
    
    // Mostrar resumen
    console.log('\n✅ ANÁLISIS COMPLETADO');
    console.log('====================');
    console.log(`📄 Documento: ${inputPath}`);
    console.log(`🖼️ Imágenes procesadas: ${report.extractedImages}`);
    console.log(`📊 Versión del registro: ${report.registryVersion}`);
    console.log(`📁 Directorio de salida: ${outputDir}`);
    console.log('\n📋 Capacidades capturadas:');
    report.capabilities.forEach(cap => console.log(`   ✓ ${cap}`));
    
    console.log('\n📈 Estadísticas del documento:');
    console.log(`   • Secciones: ${report.summary.documentStructure.sections}`);
    console.log(`   • Tablas: ${report.summary.documentStructure.tables}`);
    console.log(`   • Párrafos: ${report.summary.documentStructure.paragraphs}`);
    console.log(`   • Páginas con imágenes: ${report.summary.pageDistribution}`);
    
    console.log('\n🔍 Archivos generados:');
    console.log(`   📋 ${outputDir}/image_registry.json - Registro avanzado de imágenes`);
    console.log(`   📁 ${outputDir}/ - Imágenes extraídas`);
    console.log(`   📊 ./output/complete_analysis_with_images_*.json - Reporte detallado`);
    
    console.log('\n🎯 El registro ahora incluye:');
    console.log('   • Posicionamiento exacto (absoluto/relativo)');
    console.log('   • Información de recorte y transformaciones');
    console.log('   • Contexto detallado (header/footer/tabla/párrafo)');
    console.log('   • Propiedades de formato y wrap');
    console.log('   • Distribución por página');
    console.log('   • Relaciones XML y IDs de embedding');
    
  } catch (error) {
    console.error('\n❌ Error durante el análisis:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAdvancedAnalysis();
}

module.exports = { runAdvancedAnalysis };
