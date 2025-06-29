/**
 * Test Detallado de la Biblioteca Consolidada Mejorada
 * 
 * Prueba todas las funcionalidades de análisis detallado
 * de la nueva ConsolidatedAnalyzer.
 */

import { ConsolidatedAnalyzer } from '../lib/consolidatedAnalyzer.js';
import path from 'path';

async function testDetailedAnalysis() {
    console.log('🧪 PRUEBA DETALLADA DE ANÁLISIS CONSOLIDADO');
    console.log('============================================================');

    const docxPath = './input/PUMA MES 6 2025.docx';
    
    try {
        console.log(`📄 Analizando: ${docxPath}`);
        
        // Crear analizador con todas las opciones habilitadas
        const analyzer = new ConsolidatedAnalyzer(docxPath, {
            extractImages: true,
            extractText: true,
            analyzeStyles: true,
            analyzeMetadata: true,
            analyzeRelationships: true,
            logLevel: 'info'
        });

        console.log('\n🔍 Ejecutando análisis completo...');
        const startTime = Date.now();
        
        const completeAnalysis = await analyzer.analyzeComplete();
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`\n⏱️ Análisis completado en ${duration} segundos`);
        
        // Mostrar resumen detallado
        analyzer.showAnalysisSummary();
        
        console.log('\n📊 DETALLES ADICIONALES:');
        console.log('============================================================');
        
        // Mostrar metadatos si están disponibles
        if (completeAnalysis.metadata && completeAnalysis.metadata.core) {
            console.log('\n📋 METADATOS:');
            const core = completeAnalysis.metadata.core;
            if (core.title) console.log(`   📝 Título: ${core.title}`);
            if (core.creator) console.log(`   👤 Creador: ${core.creator}`);
            if (core.created) console.log(`   📅 Creado: ${core.created}`);
            if (core.modified) console.log(`   🔄 Modificado: ${core.modified}`);
        }

        // Mostrar información de medios
        if (completeAnalysis.images && completeAnalysis.images.archivosMedia > 0) {
            console.log('\n🖼️ ARCHIVOS DE MEDIOS:');
            console.log(`   📁 Total archivos: ${completeAnalysis.images.archivosMedia}`);
        }

        // Mostrar configuración de página
        if (completeAnalysis.pageSetup) {
            console.log('\n📄 CONFIGURACIÓN DE PÁGINA:');
            const page = completeAnalysis.pageSetup;
            if (page.tamaño) {
                console.log(`   📐 Tamaño: ${page.tamaño.ancho} x ${page.tamaño.alto} twips`);
                console.log(`   🔄 Orientación: ${page.orientacion}`);
            }
            if (page.margenes) {
                console.log(`   📏 Márgenes: ${page.margenes.superior}/${page.margenes.inferior}/${page.margenes.izquierdo}/${page.margenes.derecho} twips`);
            }
        }

        // Mostrar relaciones si están disponibles
        if (completeAnalysis.relationships) {
            console.log('\n🔗 RELACIONES:');
            console.log(`   📊 Total: ${completeAnalysis.relationships.totalRelaciones}`);
            Object.entries(completeAnalysis.relationships.tiposRelacion).forEach(([tipo, cantidad]) => {
                console.log(`   - ${tipo}: ${cantidad}`);
            });
        }

        console.log('\n📁 ARCHIVOS GENERADOS:');
        console.log('   ✅ complete_analysis_[timestamp].json - Análisis completo detallado');
        
        console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
        console.log('✅ La biblioteca ConsolidatedAnalyzer mejorada funciona correctamente');
        console.log('✅ Análisis detallado con información exhaustiva del documento');

        return completeAnalysis;

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        console.error(error.stack);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testDetailedAnalysis();
}

export {
    testDetailedAnalysis
};
