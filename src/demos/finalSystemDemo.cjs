/**
 * Script final de demostración: Sistema completo de imágenes DOCX
 * 
 * Este script demuestra todo el flujo de trabajo:
 * 1. Verificar imágenes existentes
 * 2. Extraer si es necesario
 * 3. Generar documentos con imágenes reales
 * 4. Mostrar resumen del sistema
 */

const { extractImagesFromDocx } = require('./documentImageExtractor.cjs');
const fs = require('fs-extra');
const path = require('path');

class CompleteSystemDemo {
    constructor() {
        this.pumaDocument = '../reporte_py/template-word/PUMA MES 6 2025.docx';
        this.extractedDir = './extracted_images';
        this.outputDir = './output';
    }

    async runCompleteDemo() {
        console.log('🚀 DEMOSTRACIÓN COMPLETA DEL SISTEMA DE IMÁGENES DOCX');
        console.log('=' .repeat(60));
        console.log('');

        try {
            // Paso 1: Verificar estado actual
            await this.checkCurrentState();

            // Paso 2: Ejecutar extracción (demostrará no duplicados)
            await this.demonstrateExtraction();

            // Paso 3: Mostrar análisis del sistema
            await this.showSystemAnalysis();

            // Paso 4: Instrucciones para uso del generador
            await this.showGeneratorInstructions();

            console.log('\n🎉 DEMOSTRACIÓN COMPLETADA EXITOSAMENTE');

        } catch (error) {
            console.error('❌ Error durante la demostración:', error.message);
        }
    }

    async checkCurrentState() {
        console.log('📋 PASO 1: VERIFICANDO ESTADO ACTUAL DEL SISTEMA');
        console.log('-' .repeat(50));

        const registryPath = path.join(this.extractedDir, 'image_registry.json');
        
        if (await fs.pathExists(registryPath)) {
            const registry = await fs.readJson(registryPath);
            const imageCount = Object.keys(registry).length;
            
            console.log(`✅ Registro de imágenes encontrado`);
            console.log(`📊 Total de imágenes extraídas: ${imageCount}`);
            console.log(`📁 Directorio: ${this.extractedDir}`);
            
            // Verificar archivos físicos
            const files = await fs.readdir(this.extractedDir);
            const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png|gif|bmp)$/i));
            console.log(`🖼️ Archivos de imagen verificados: ${imageFiles.length}`);
            
        } else {
            console.log('⚠️ No se encontró registro de imágenes');
            console.log('💡 Se procederá con la extracción inicial');
        }
        
        console.log('');
    }

    async demonstrateExtraction() {
        console.log('🔍 PASO 2: DEMOSTRACIÓN DE EXTRACCIÓN');
        console.log('-' .repeat(50));

        console.log(`📄 Documento fuente: ${this.pumaDocument}`);
        console.log(`📁 Directorio de salida: ${this.extractedDir}`);
        console.log('');

        // Usar la función directa en lugar del constructor
        const result = await extractImagesFromDocx(this.pumaDocument, this.extractedDir);

        console.log('📊 RESULTADO DE LA EXTRACCIÓN:');
        console.log(`   ➕ Imágenes nuevas extraídas: ${result.extracted || 0}`);
        console.log(`   ⏭️ Duplicados ignorados: ${result.duplicates || 0}`);
        console.log(`   📋 Total en registro: ${result.registry?.images?.length || 0}`);
        console.log('');

        if (result.duplicates > 0) {
            console.log('✅ SISTEMA DE PREVENCIÓN DE DUPLICADOS FUNCIONANDO');
            console.log('   - Las imágenes ya extraídas se detectaron por hash MD5');
            console.log('   - No se consumió espacio adicional');
            console.log('   - Procesamiento más rápido en ejecuciones posteriores');
        }
        console.log('');
    }

    async showSystemAnalysis() {
        console.log('📊 PASO 3: ANÁLISIS DEL SISTEMA');
        console.log('-' .repeat(50));

        // Verificar último análisis generado
        const outputFiles = await fs.readdir(this.outputDir);
        const analysisFiles = outputFiles.filter(f => f.includes('complete_analysis_with_images'));
        
        if (analysisFiles.length > 0) {
            const latestAnalysis = analysisFiles.sort().pop();
            console.log(`📄 Último análisis generado: ${latestAnalysis}`);
            
            try {
                const analysisPath = path.join(this.outputDir, latestAnalysis);
                const analysis = await fs.readJson(analysisPath);
                
                console.log('🏗️ ESTRUCTURA DETECTADA:');
                console.log(`   - Imágenes en header: ${analysis.estructura_header?.total_imagenes_header || 0}`);
                console.log(`   - Total de imágenes: ${analysis.resumen_extraccion?.total_imagenes_en_registro || 0}`);
                console.log(`   - Directorio: ${analysis.directorio_imagenes}`);
                
            } catch (error) {
                console.log('⚠️ No se pudo leer el análisis detallado');
            }
        }

        // Mostrar estructura del directorio
        console.log('\n📁 ESTRUCTURA DEL DIRECTORIO DE IMÁGENES:');
        const files = await fs.readdir(this.extractedDir);
        const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png|gif|bmp)$/i));
        
        console.log(`   - ${imageFiles.length} archivos de imagen`);
        console.log(`   - 1 archivo de registro (image_registry.json)`);
        console.log(`   - Tamaño total estimado: ${await this.calculateDirectorySize()} MB`);
        console.log('');
    }

    async calculateDirectorySize() {
        try {
            const files = await fs.readdir(this.extractedDir);
            let totalSize = 0;
            
            for (const file of files) {
                if (file.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
                    const stats = await fs.stat(path.join(this.extractedDir, file));
                    totalSize += stats.size;
                }
            }
            
            return (totalSize / 1024 / 1024).toFixed(1);
        } catch (error) {
            return 'N/A';
        }
    }

    async showGeneratorInstructions() {
        console.log('🔧 PASO 4: USO DEL GENERADOR CON IMÁGENES REALES');
        console.log('-' .repeat(50));

        console.log('Ahora puedes generar documentos usando las imágenes extraídas:');
        console.log('');
        console.log('1️⃣ GENERAR CON IMÁGENES REALES:');
        console.log('   node src/testPumaWithImages.js');
        console.log('');
        console.log('2️⃣ VER ESTADO DEL SISTEMA:');
        console.log('   node src/showImageSystem.cjs');
        console.log('');
        console.log('3️⃣ EXTRAER DE OTRO DOCUMENTO:');
        console.log('   node src/documentImageExtractor.cjs "ruta/al/documento.docx"');
        console.log('');

        console.log('✨ CARACTERÍSTICAS DISPONIBLES:');
        console.log('   ✅ Logos reales en el header del documento');
        console.log('   ✅ Fotos reales en las actividades (máx 4 por página)');
        console.log('   ✅ Fallback automático a placeholders');
        console.log('   ✅ Sin duplicación de imágenes');
        console.log('   ✅ Registro persistente para reutilización');
        console.log('');
    }
}

// Ejecutar demostración
async function main() {
    const demo = new CompleteSystemDemo();
    await demo.runCompleteDemo();
}

// Si se ejecuta directamente
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Error fatal:', error.message);
        process.exit(1);
    });
}

module.exports = { CompleteSystemDemo };
