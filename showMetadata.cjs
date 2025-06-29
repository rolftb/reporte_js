#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

/**
 * Script para mostrar la información detallada capturada por el extractor v3.0
 */
async function showImageMetadata() {
    console.log('🔍 ANÁLISIS DE METADATA DE IMÁGENES v3.0');
    console.log('================================================\n');
    
    try {
        const registryPath = './extracted_images/image_registry.json';
        
        if (!await fs.pathExists(registryPath)) {
            console.error('❌ No se encontró el archivo image_registry.json');
            console.log('💡 Ejecuta primero: node runAdvancedAnalysis.cjs');
            return;
        }
        
        const registry = await fs.readJson(registryPath);
        
        if (!registry.metadata || registry.metadata.version !== "3.0") {
            console.error('❌ El registro no es versión 3.0');
            console.log('💡 Ejecuta: node runAdvancedAnalysis.cjs para actualizar');
            return;
        }
        
        // Mostrar información general
        console.log('📊 INFORMACIÓN GENERAL');
        console.log(`   • Versión: ${registry.metadata.version}`);
        console.log(`   • Total de imágenes: ${registry.metadata.totalImages}`);
        console.log(`   • Nivel de análisis: ${registry.metadata.analysisLevel}`);
        console.log(`   • Características: ${registry.metadata.features.length}`);
        
        // Mostrar estructura del documento
        console.log('\n📋 ESTRUCTURA DEL DOCUMENTO');
        console.log(`   • Páginas estimadas: ${registry.documentStructure.totalPages}`);
        console.log(`   • Secciones: ${registry.documentStructure.sections}`);
        console.log(`   • Tablas: ${registry.documentStructure.tables}`);
        console.log(`   • Párrafos: ${registry.documentStructure.paragraphs}`);
        
        // Mostrar estadísticas
        console.log('\n📈 ESTADÍSTICAS DE IMÁGENES');
        const stats = registry.statistics;
        console.log(`   • Total: ${stats.totalImages}`);
        console.log(`   • Con recorte: ${stats.withCropping}/${stats.totalImages} (${Math.round(stats.withCropping/stats.totalImages*100)}%)`);
        console.log(`   • Flotantes: ${stats.byPosition.floating}/${stats.totalImages} (${Math.round(stats.byPosition.floating/stats.totalImages*100)}%)`);
        console.log(`   • En línea: ${stats.byPosition.inline}/${stats.totalImages}`);
        console.log(`   • Dimensiones promedio: ${stats.avgDimensions.width}x${stats.avgDimensions.height} px`);
        
        // Mostrar distribución por contexto
        console.log('\n🎯 DISTRIBUCIÓN POR CONTEXTO');
        console.log(`   • Header: ${stats.byContext.header}`);
        console.log(`   • Footer: ${stats.byContext.footer}`);
        console.log(`   • Tabla: ${stats.byContext.table}`);
        console.log(`   • Párrafo: ${stats.byContext.paragraph}`);
        console.log(`   • Flotante: ${stats.byContext.floating}`);
        
        // Mostrar ejemplos de metadata detallada
        console.log('\n🔍 EJEMPLOS DE METADATA DETALLADA');
        console.log('===================================');
        
        let count = 0;
        for (const [hash, imageInfo] of Object.entries(registry.images)) {
            if (count >= 3) break; // Mostrar solo 3 ejemplos
            
            console.log(`\n📸 ${imageInfo.fileName}`);
            console.log(`   Hash: ${hash.substring(0, 12)}...`);
            console.log(`   Formato: ${imageInfo.format || 'N/A'}`);
            console.log(`   Tamaño: ${Math.round(imageInfo.size / 1024)} KB`);
            
            // Posición
            if (imageInfo.position) {
                const pos = imageInfo.position;
                console.log(`   📍 Posición:`);
                console.log(`      • Página: ${pos.page || 'N/A'}`);
                console.log(`      • Párrafo: ${pos.paragraphId || 'N/A'}`);
                
                if (pos.absolutePosition) {
                    console.log(`      • X: ${pos.absolutePosition.x} (${pos.absolutePosition.xRelativeFrom})`);
                    console.log(`      • Y: ${pos.absolutePosition.y} (${pos.absolutePosition.yRelativeFrom})`);
                }
            }
            
            // Formato
            if (imageInfo.formatting) {
                const fmt = imageInfo.formatting;
                console.log(`   🎨 Formato:`);
                console.log(`      • Dimensiones: ${fmt.width || 'N/A'}x${fmt.height || 'N/A'} px`);
                
                if (fmt.cropLeft > 0 || fmt.cropTop > 0 || fmt.cropRight > 0 || fmt.cropBottom > 0) {
                    console.log(`      • Recorte: L:${fmt.cropLeft}% T:${fmt.cropTop}% R:${fmt.cropRight}% B:${fmt.cropBottom}%`);
                }
                
                if (fmt.rotation !== 0) {
                    console.log(`      • Rotación: ${fmt.rotation}°`);
                }
            }
            
            // Contexto
            if (imageInfo.context) {
                const ctx = imageInfo.context;
                console.log(`   🏷️ Contexto:`);
                console.log(`      • Flotante: ${ctx.isFloating ? 'Sí' : 'No'}`);
                console.log(`      • En línea: ${ctx.isInline ? 'Sí' : 'No'}`);
                console.log(`      • Wrap: ${ctx.wrapType || 'N/A'}`);
                console.log(`      • Header: ${ctx.isInHeader ? 'Sí' : 'No'}`);
                console.log(`      • Tabla: ${ctx.isInTable ? 'Sí' : 'No'}`);
            }
            
            count++;
        }
        
        // Mostrar distribución por páginas
        console.log('\n📄 DISTRIBUCIÓN POR PÁGINAS');
        console.log('=============================');
        
        if (registry.pageDistribution) {
            for (const [page, images] of Object.entries(registry.pageDistribution)) {
                console.log(`\n📄 Página ${page}: ${images.length} imágenes`);
                images.forEach(img => {
                    console.log(`   • ${img.fileName} (${img.context?.isFloating ? 'flotante' : 'en línea'})`);
                });
            }
        }
        
        console.log('\n✅ ANÁLISIS COMPLETADO');
        console.log('=======================');
        console.log('💡 Esta información permite replicar exactamente el posicionamiento,');
        console.log('   recorte y contexto de cada imagen en el documento generado.');
        
    } catch (error) {
        console.error('❌ Error analizando metadata:', error.message);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    showImageMetadata();
}

module.exports = { showImageMetadata };
