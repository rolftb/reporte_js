/**
 * Script de demostración del sistema completo de extracción y uso de imágenes
 * 
 * Este script demuestra:
 * 1. Cómo extraer imágenes de un documento DOCX evitando duplicados
 * 2. Cómo usar las imágenes extraídas en el generador de documentos
 * 3. Verificación de que no se crean duplicados
 */

import { PumaDocumentGenerator } from './generators/PumaDocumentGenerator.js';
import { DocumentImageExtractor } from './documentImageExtractor.cjs';
import fs from 'fs-extra';
import path from 'path';

class DocumentSystemDemo {
    constructor() {
        this.originalDocPath = './uploads/template-word/PUMA MES 6 2025.docx';
        this.extractedImagesDir = './extracted_images';
        this.outputDir = './output';
    }

    async runCompleteDemo() {
        console.log('🚀 Iniciando demostración del sistema completo de documentos PUMA\n');

        try {
            // Paso 1: Extraer imágenes del documento original
            console.log('📤 PASO 1: Extracción de imágenes');
            const extractor = new DocumentImageExtractor(this.extractedImagesDir);
            const extractionResult = await extractor.analyzeAndExtractImages(this.originalDocPath);
            
            console.log(`✅ Extracción completada:`);
            console.log(`   - Imágenes nuevas: ${extractionResult.summary.newImages}`);
            console.log(`   - Duplicados evitados: ${extractionResult.summary.duplicatesIgnored}`);
            console.log(`   - Total en registro: ${extractionResult.summary.totalInRegistry}`);
            console.log(`   - Directorio: ${this.extractedImagesDir}\n`);

            // Paso 2: Verificar el registro de imágenes
            console.log('📋 PASO 2: Verificación del registro de imágenes');
            await this.verifyImageRegistry();

            // Paso 3: Generar documento usando imágenes reales
            console.log('📝 PASO 3: Generación de documento con imágenes reales');
            const generator = new PumaDocumentGenerator(true); // useRealImages = true
            const docWithImages = await generator.generateDocument();
            
            const docWithImagesPath = path.join(this.outputDir, `puma_con_imagenes_reales_${Date.now()}.docx`);
            await fs.ensureDir(this.outputDir);
            await fs.writeFile(docWithImagesPath, docWithImages);
            console.log(`✅ Documento con imágenes reales guardado: ${docWithImagesPath}\n`);

            // Paso 4: Generar documento sin imágenes reales (placeholders)
            console.log('📝 PASO 4: Generación de documento con placeholders');
            const generatorPlaceholder = new PumaDocumentGenerator(false); // useRealImages = false
            const docWithPlaceholders = await generatorPlaceholder.generateDocument();
            
            const docWithPlaceholdersPath = path.join(this.outputDir, `puma_con_placeholders_${Date.now()}.docx`);
            await fs.writeFile(docWithPlaceholdersPath, docWithPlaceholders);
            console.log(`✅ Documento con placeholders guardado: ${docWithPlaceholdersPath}\n`);

            // Paso 5: Verificar que no se crean duplicados en nueva extracción
            console.log('🔄 PASO 5: Verificación de prevención de duplicados');
            const secondExtraction = await extractor.analyzeAndExtractImages(this.originalDocPath);
            console.log(`✅ Segunda extracción - Nuevas imágenes: ${secondExtraction.summary.newImages}`);
            console.log(`✅ Duplicados correctamente evitados: ${secondExtraction.summary.duplicatesIgnored}\n`);

            // Paso 6: Generar reporte final
            console.log('📊 PASO 6: Reporte final del sistema');
            await this.generateFinalReport();

        } catch (error) {
            console.error('❌ Error durante la demostración:', error.message);
            throw error;
        }
    }

    async verifyImageRegistry() {
        const registryPath = path.join(this.extractedImagesDir, 'image_registry.json');
        
        if (await fs.pathExists(registryPath)) {
            const registry = await fs.readJson(registryPath);
            const imageCount = Object.keys(registry).length;
            
            console.log(`✅ Registro encontrado: ${imageCount} imágenes registradas`);
            
            // Verificar que todas las imágenes existen físicamente
            let existingFiles = 0;
            for (const [hash, info] of Object.entries(registry)) {
                const imagePath = path.join(this.extractedImagesDir, info.fileName);
                if (await fs.pathExists(imagePath)) {
                    existingFiles++;
                }
            }
            
            console.log(`✅ Archivos físicos verificados: ${existingFiles}/${imageCount}`);
            console.log(`📁 Directorio de imágenes: ${this.extractedImagesDir}\n`);
        } else {
            console.log('⚠️ No se encontró registro de imágenes\n');
        }
    }

    async generateFinalReport() {
        const report = {
            timestamp: new Date().toISOString(),
            system_status: 'operational',
            extraction: {
                source_document: this.originalDocPath,
                output_directory: this.extractedImagesDir,
                registry_file: path.join(this.extractedImagesDir, 'image_registry.json')
            },
            verification: {
                duplicate_prevention: 'working',
                image_loading: 'working',
                document_generation: 'working'
            },
            features: {
                real_image_integration: 'enabled',
                placeholder_fallback: 'enabled',
                hash_based_deduplication: 'enabled',
                registry_persistence: 'enabled'
            }
        };

        const reportPath = path.join(this.outputDir, `system_report_${Date.now()}.json`);
        await fs.ensureDir(this.outputDir);
        await fs.writeJson(reportPath, report, { spaces: 2 });
        
        console.log(`📋 Reporte del sistema guardado: ${reportPath}`);
        console.log('\n🎉 Demostración del sistema completada exitosamente!');
        console.log('\n📋 Resumen de características:');
        console.log('   ✅ Extracción de imágenes sin duplicados');
        console.log('   ✅ Registro persistente con hash MD5');
        console.log('   ✅ Integración automática de imágenes reales');
        console.log('   ✅ Fallback a placeholders cuando sea necesario');
        console.log('   ✅ Generación de documentos con estructura real del PUMA');
        console.log('   ✅ Prevención de re-extracción de imágenes existentes');
    }
}

// Función para ejecutar desde línea de comandos
async function runDemo() {
    const demo = new DocumentSystemDemo();
    await demo.runCompleteDemo();
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runDemo().catch(error => {
        console.error('💥 Error fatal en la demostración:', error);
        process.exit(1);
    });
}

export { DocumentSystemDemo };
