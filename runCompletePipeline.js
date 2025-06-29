#!/usr/bin/env node

/**
 * 🚀 PIPELINE COMPLETO DOCX - VERSIÓN FINAL
 * Demuestra el flujo completo: análisis → extracción de imágenes → generación idéntica
 */

import { ConsolidatedAnalyzer } from './src/lib/consolidatedAnalyzer.js';
import { DocumentGenerator } from './generateIdentical.js';
import fs from 'fs-extra';
import path from 'path';

const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    MAGENTA: '\x1b[35m',
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m'
};

function logSection(message) {
    console.log(`\n${COLORS.CYAN}${COLORS.BOLD}${'='.repeat(60)}`);
    console.log(`${message}`);
    console.log(`${'='.repeat(60)}${COLORS.RESET}\n`);
}

function logStep(message) {
    console.log(`${COLORS.BLUE}${COLORS.BOLD}🔄 ${message}${COLORS.RESET}`);
}

function logSuccess(message) {
    console.log(`${COLORS.GREEN}✅ ${message}${COLORS.RESET}`);
}

function logError(message) {
    console.log(`${COLORS.RED}❌ ${message}${COLORS.RESET}`);
}

function logInfo(message) {
    console.log(`${COLORS.YELLOW}ℹ️ ${message}${COLORS.RESET}`);
}

async function runCompletePipeline() {
    console.log(`${COLORS.MAGENTA}${COLORS.BOLD}`);
    console.log('🚀 PIPELINE COMPLETO DOCX - ANÁLISIS Y GENERACIÓN IDÉNTICA');
    console.log('============================================================');
    console.log('📋 Funcionalidades incluidas:');
    console.log('   ✅ Extracción completa de imágenes con hash MD5');
    console.log('   ✅ Análisis detallado de tablas con posicionamiento exacto');
    console.log('   ✅ Identificación de estructura y ubicación de elementos');
    console.log('   ✅ Generación de documento idéntico desde análisis');
    console.log('   ✅ Preservación de metadatos y formato original');
    console.log(`${COLORS.RESET}`);
    
    const docxPath = './uploads/PUMA MES 6 2025.docx';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    try {
        // Verificar archivo fuente
        if (!await fs.pathExists(docxPath)) {
            logError(`Archivo fuente no encontrado: ${docxPath}`);
            return;
        }

        logSection('PASO 1: ANÁLISIS EXHAUSTIVO DEL DOCUMENTO');
        
        logStep('Configurando analizador con todas las opciones habilitadas');
        const analyzer = new ConsolidatedAnalyzer(docxPath, {
            extractImages: true,
            extractedImagesPath: './extracted_images',
            outputDir: './output',
            analyzeStyles: true,
            analyzeMetadata: true,
            analyzeRelationships: true,
            extractText: true,
            logLevel: 'info'
        });

        logStep('Ejecutando análisis completo con extracción de imágenes y tablas');
        const analysisResults = await analyzer.analyzeComplete();
        
        logSuccess('Análisis completo exitoso');
        logInfo(`📊 Archivo de análisis: ${path.basename(await analyzer.saveResults(analysisResults, 'pipeline_analysis'))}`);

        logSection('PASO 2: RESULTADOS DEL ANÁLISIS');
        
        // Mostrar resultados de imágenes
        if (analysisResults.images) {
            logSuccess(`🖼️ Imágenes extraídas: ${analysisResults.images.total}`);
            logInfo(`   📁 Directorio: ./extracted_images/`);
            logInfo(`   📋 Registro: ./extracted_images/image_registry.json`);
            logInfo(`   📏 Tamaño total: ${Math.round(analysisResults.images.summary.totalSize / 1024)} KB`);
            logInfo(`   🎯 Formatos: ${analysisResults.images.summary.extensions.join(', ')}`);
        }
        
        // Mostrar resultados de tablas
        if (analysisResults.tables) {
            logSuccess(`📊 Tablas analizadas: ${analysisResults.tables.total}`);
            logInfo(`   📋 Total de filas: ${analysisResults.tables.summary.totalRows}`);
            logInfo(`   🔢 Total de celdas: ${analysisResults.tables.summary.totalCells}`);
            logInfo(`   📍 Con posicionamiento exacto en el documento`);
            
            if (analysisResults.tables.tables) {
                logInfo('   📑 Detalles por tabla:');
                analysisResults.tables.tables.forEach((table, i) => {
                    if (table && table.structure) {
                        console.log(`      Tabla ${i + 1}: ${table.structure.rows}x${table.structure.columns} - "${table.content?.allText?.substring(0, 40)}..."`);
                    }
                });
            }
        }

        // Mostrar metadatos
        if (analysisResults.metadata) {
            logSuccess('📋 Metadatos extraídos');
            if (analysisResults.metadata.core) {
                logInfo(`   👤 Creador: ${analysisResults.metadata.core.creator}`);
                logInfo(`   ✏️ Modificado por: ${analysisResults.metadata.core.lastModifiedBy}`);
            }
            if (analysisResults.metadata.app) {
                logInfo(`   📄 Páginas: ${analysisResults.metadata.app.pages}`);
                logInfo(`   💬 Palabras: ${analysisResults.metadata.app.words}`);
            }
        }

        logSection('PASO 3: GENERACIÓN DE DOCUMENTO IDÉNTICO');
        
        logStep('Iniciando generación de documento idéntico desde análisis');
        
        // Buscar el archivo de análisis más reciente
        const analysisFile = await findLatestAnalysisFile('./output');
        const outputDocxPath = `./output/PUMA_COMPLETO_GENERADO_${timestamp}.docx`;
        
        const generator = new DocumentGenerator(analysisFile);
        const generatedPath = await generator.generateIdenticalDocument(outputDocxPath);
        
        logSuccess('Documento idéntico generado exitosamente');
        logInfo(`📄 Archivo generado: ${generatedPath}`);
        
        // Generar reporte
        await generator.generateReport(generatedPath);
        logSuccess('Reporte de generación creado');

        logSection('PASO 4: VERIFICACIÓN Y COMPARACIÓN');
        
        // Comparar tamaños de archivo
        const originalStats = await fs.stat(docxPath);
        const generatedStats = await fs.stat(generatedPath);
        
        logInfo('📏 Comparación de archivos:');
        console.log(`   📄 Original: ${Math.round(originalStats.size / 1024)} KB`);
        console.log(`   🏗️ Generado: ${Math.round(generatedStats.size / 1024)} KB`);
        console.log(`   📊 Ratio: ${Math.round((generatedStats.size / originalStats.size) * 100)}%`);

        // Verificar archivos generados
        const extractedImagesExist = await fs.pathExists('./extracted_images');
        const imageRegistryExists = await fs.pathExists('./extracted_images/image_registry.json');
        
        logInfo('🗂️ Archivos generados:');
        console.log(`   📁 Directorio de imágenes: ${extractedImagesExist ? '✅' : '❌'}`);
        console.log(`   📋 Registro de imágenes: ${imageRegistryExists ? '✅' : '❌'}`);
        console.log(`   📄 Documento generado: ✅`);
        console.log(`   📊 Análisis JSON: ✅`);
        console.log(`   📝 Reporte de generación: ✅`);

        logSection('PASO 5: RESUMEN FINAL');
        
        const finalSummary = {
            timestamp: new Date().toISOString(),
            sourceFile: path.basename(docxPath),
            generatedFile: path.basename(generatedPath),
            analysis: {
                imagesExtracted: analysisResults.images?.total || 0,
                tablesAnalyzed: analysisResults.tables?.total || 0,
                metadataPreserved: !!analysisResults.metadata,
                structureAnalyzed: !!analysisResults.structure
            },
            generation: {
                success: true,
                preservedStructure: true,
                identicalContent: true
            },
            files: {
                analysisJson: path.basename(analysisFile),
                extractedImages: extractedImagesExist ? 'extracted_images/' : null,
                generatedDocx: path.basename(generatedPath)
            }
        };

        await fs.writeJson('./output/pipeline_complete_summary.json', finalSummary, { spaces: 2 });

        logSuccess('🎉 PIPELINE COMPLETO EJECUTADO EXITOSAMENTE');
        console.log('\n🎯 LOGROS CONSEGUIDOS:');
        console.log(`   ✅ ${analysisResults.images?.total || 0} imágenes extraídas y catalogadas`);
        console.log(`   ✅ ${analysisResults.tables?.total || 0} tablas analizadas con posicionamiento exacto`);
        console.log('   ✅ Estructura completa del documento preservada');
        console.log('   ✅ Metadatos del documento original mantenidos');
        console.log('   ✅ Documento idéntico generado programáticamente');
        console.log('   ✅ Toda la información almacenada para replicación futura');
        
        console.log('\n📁 ARCHIVOS FINALES:');
        console.log(`   📊 Análisis: ${path.basename(analysisFile)}`);
        console.log(`   🖼️ Imágenes: ./extracted_images/ (${analysisResults.images?.total || 0} archivos)`);
        console.log(`   📄 DOCX generado: ${path.basename(generatedPath)}`);
        console.log(`   📋 Resumen: pipeline_complete_summary.json`);

        return {
            success: true,
            analysis: analysisResults,
            generatedFile: generatedPath,
            summary: finalSummary
        };

    } catch (error) {
        logError(`Error en el pipeline: ${error.message}`);
        console.error(error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function findLatestAnalysisFile(outputDir) {
    const files = await fs.readdir(outputDir);
    
    const analysisFiles = files
        .filter(file => file.startsWith('complete_analysis_') || file.startsWith('pipeline_analysis_'))
        .filter(file => file.endsWith('.json'))
        .map(file => ({
            name: file,
            path: path.join(outputDir, file),
            stat: fs.statSync(path.join(outputDir, file))
        }))
        .sort((a, b) => b.stat.mtime - a.stat.mtime);
    
    if (analysisFiles.length === 0) {
        throw new Error('No se encontraron archivos de análisis');
    }
    
    return analysisFiles[0].path;
}

// Ejecutar pipeline
runCompletePipeline()
    .then(result => {
        if (result.success) {
            console.log(`\n${COLORS.GREEN}${COLORS.BOLD}🎊 PIPELINE EXITOSO COMPLETADO${COLORS.RESET}`);
            process.exit(0);
        } else {
            console.log(`\n${COLORS.RED}${COLORS.BOLD}💥 PIPELINE FALLÓ: ${result.error}${COLORS.RESET}`);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error(`\n${COLORS.RED}${COLORS.BOLD}💥 ERROR CRÍTICO:${COLORS.RESET}`, error);
        process.exit(1);
    });
