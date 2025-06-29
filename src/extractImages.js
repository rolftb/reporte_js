/**
 * Script simple para extraer imágenes de un documento DOCX
 * Evita duplicados automáticamente usando hash MD5
 * 
 * Uso:
 * node src/extractImages.js [ruta_documento] [directorio_salida]
 * 
 * Ejemplo:
 * node src/extractImages.js "./uploads/template-word/PUMA MES 6 2025.docx" "./extracted_images"
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Importar el extractor CommonJS
const { DocumentImageExtractor } = require('./documentImageExtractor.cjs');

import fs from 'fs-extra';
import path from 'path';

class SimpleImageExtractor {
    constructor() {
        this.defaultOutputDir = './extracted_images';
    }

    async extractFromDocx(docxPath, outputDir = this.defaultOutputDir) {
        console.log('🔍 Extrayendo imágenes del documento DOCX...');
        console.log(`📄 Documento: ${docxPath}`);
        console.log(`📁 Directorio de salida: ${outputDir}\n`);

        try {
            // Verificar que el documento existe
            if (!await fs.pathExists(docxPath)) {
                throw new Error(`El documento no existe: ${docxPath}`);
            }

            // Crear el extractor
            const extractor = new DocumentImageExtractor(outputDir);
            
            // Verificar si ya hay imágenes extraídas
            const registryPath = path.join(outputDir, 'image_registry.json');
            const hasExistingRegistry = await fs.pathExists(registryPath);
            
            if (hasExistingRegistry) {
                console.log('📋 Se encontró un registro existente de imágenes extraídas');
                const registry = await fs.readJson(registryPath);
                const existingCount = Object.keys(registry).length;
                console.log(`   - Imágenes ya extraídas: ${existingCount}`);
                console.log('   - Solo se extraerán imágenes nuevas (sin duplicados)\n');
            }

            // Extraer imágenes
            const result = await extractor.analyzeAndExtractImages(docxPath);

            // Mostrar resumen detallado
            console.log('\n📊 RESUMEN DE EXTRACCIÓN:');
            console.log('=' .repeat(50));
            console.log(`✅ Nuevas imágenes extraídas: ${result.summary.newImages}`);
            console.log(`⏭️  Duplicados evitados: ${result.summary.duplicatesIgnored}`);
            console.log(`📁 Total en el directorio: ${result.summary.totalInRegistry}`);
            console.log(`📍 Ubicación: ${outputDir}`);
            console.log(`📋 Registro: ${path.join(outputDir, 'image_registry.json')}`);
            
            // Listar algunas imágenes si hay
            if (result.summary.totalInRegistry > 0) {
                console.log('\n📸 Imágenes disponibles:');
                const files = await fs.readdir(outputDir);
                const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png|gif|bmp)$/i));
                
                imageFiles.slice(0, 5).forEach((file, index) => {
                    console.log(`   ${index + 1}. ${file}`);
                });
                
                if (imageFiles.length > 5) {
                    console.log(`   ... y ${imageFiles.length - 5} más`);
                }
            }

            console.log('\n🎉 Extracción completada exitosamente!');
            console.log('\n💡 Las imágenes extraídas pueden ser usadas en:');
            console.log('   - Generadores de documentos');
            console.log('   - Análisis de contenido');
            console.log('   - Sistemas de replicación');
            console.log('   - Aplicaciones web');

            return result;

        } catch (error) {
            console.error('\n❌ ERROR durante la extracción:', error.message);
            throw error;
        }
    }

    async showExistingImages(outputDir = this.defaultOutputDir) {
        console.log('📁 Verificando imágenes existentes...\n');

        try {
            const registryPath = path.join(outputDir, 'image_registry.json');
            
            if (!await fs.pathExists(registryPath)) {
                console.log('⚠️ No se encontraron imágenes extraídas previamente');
                console.log(`💡 Ejecuta: node src/extractImages.js <documento.docx>`);
                return;
            }

            const registry = await fs.readJson(registryPath);
            const imageCount = Object.keys(registry).length;
            
            console.log(`📋 Registro encontrado: ${imageCount} imágenes`);
            console.log(`📁 Directorio: ${outputDir}\n`);
            
            // Mostrar detalles de las imágenes
            console.log('🖼️ DETALLES DE IMÁGENES:');
            console.log('=' .repeat(60));
            
            let index = 1;
            for (const [hash, info] of Object.entries(registry)) {
                const sizeKB = Math.round(info.size / 1024);
                console.log(`${index}. ${info.fileName}`);
                console.log(`   Hash: ${hash.substring(0, 16)}...`);
                console.log(`   Tamaño: ${sizeKB} KB`);
                console.log(`   Original: ${info.originalPath}`);
                console.log(`   Extraída: ${new Date(info.extractedAt).toLocaleString()}`);
                console.log('');
                index++;
            }

        } catch (error) {
            console.error('❌ Error al verificar imágenes:', error.message);
        }
    }
}

// Función principal para línea de comandos
async function main() {
    const args = process.argv.slice(2);
    const extractor = new SimpleImageExtractor();

    if (args.length === 0) {
        console.log('📖 USO DEL EXTRACTOR DE IMÁGENES DOCX');
        console.log('=' .repeat(40));
        console.log('');
        console.log('Extraer imágenes:');
        console.log('  node src/extractImages.js <documento.docx> [directorio_salida]');
        console.log('');
        console.log('Ver imágenes existentes:');
        console.log('  node src/extractImages.js --list [directorio]');
        console.log('');
        console.log('Ejemplos:');
        console.log('  node src/extractImages.js "PUMA MES 6 2025.docx"');
        console.log('  node src/extractImages.js "documento.docx" "./mis_imagenes"');
        console.log('  node src/extractImages.js --list');
        return;
    }

    try {
        if (args[0] === '--list') {
            const outputDir = args[1] || './extracted_images';
            await extractor.showExistingImages(outputDir);
        } else {
            const docxPath = args[0];
            const outputDir = args[1] || './extracted_images';
            await extractor.extractFromDocx(docxPath, outputDir);
        }
    } catch (error) {
        console.error('\n💥 Error fatal:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { SimpleImageExtractor };
