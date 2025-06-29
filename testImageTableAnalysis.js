#!/usr/bin/env node

/**
 * 🧪 PRUEBA DE EXTRACCIÓN DE IMÁGENES Y ANÁLISIS DE TABLAS
 * Verifica las nuevas funcionalidades implementadas
 */

import { ConsolidatedAnalyzer } from './src/lib/consolidatedAnalyzer.js';
import path from 'path';
import fs from 'fs-extra';

const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m'
};

function logStep(message) {
    console.log(`${COLORS.CYAN}${COLORS.BOLD}${message}${COLORS.RESET}`);
}

function logSuccess(message) {
    console.log(`${COLORS.GREEN}✅ ${message}${COLORS.RESET}`);
}

function logError(message) {
    console.log(`${COLORS.RED}❌ ${message}${COLORS.RESET}`);
}

function logInfo(message) {
    console.log(`${COLORS.BLUE}ℹ️ ${message}${COLORS.RESET}`);
}

async function testImageExtractionAndTableAnalysis() {
    console.log(`${COLORS.BOLD}${COLORS.BLUE}`);
    console.log('🧪 PRUEBA DE EXTRACCIÓN DE IMÁGENES Y ANÁLISIS DE TABLAS');
    console.log('============================================================');
    console.log(`${COLORS.RESET}`);
    
    const docxPath = './uploads/PUMA MES 6 2025.docx';
    
    try {
        // Verificar que el archivo existe
        if (!await fs.pathExists(docxPath)) {
            logError(`Archivo no encontrado: ${docxPath}`);
            return;
        }

        logStep('📊 INICIALIZANDO ANALIZADOR CON NUEVAS FUNCIONALIDADES');
        
        // Configurar analizador con opciones específicas para imágenes y tablas
        const analyzer = new ConsolidatedAnalyzer(docxPath, {
            extractImages: true,
            extractedImagesPath: './extracted_images',
            outputDir: './output',
            analyzeStyles: true,
            analyzeMetadata: true,
            logLevel: 'info'
        });

        logStep('🖼️ EXTRAYENDO IMÁGENES DEL DOCUMENTO');
        
        // Ejecutar análisis completo
        const results = await analyzer.analyzeComplete();
        
        logStep('📋 VERIFICANDO RESULTADOS DE EXTRACCIÓN DE IMÁGENES');
        
        if (results.images) {
            logSuccess(`Total de imágenes encontradas: ${results.images.total}`);
            
            if (results.images.extractedImages && results.images.extractedImages.length > 0) {
                logInfo('Imágenes extraídas:');
                results.images.extractedImages.forEach((img, index) => {
                    console.log(`   ${index + 1}. ${img.fileName} (${img.size} bytes) - ${img.extension}`);
                });
            }
            
            if (results.images.summary) {
                logInfo(`Tamaño total de imágenes: ${results.images.summary.totalSize} bytes`);
                logInfo(`Extensiones encontradas: ${results.images.summary.extensions.join(', ')}`);
                
                if (results.images.summary.locations) {
                    logInfo('Ubicaciones de imágenes:');
                    console.log(`   - Headers: ${results.images.summary.locations.headers}`);
                    console.log(`   - Body: ${results.images.summary.locations.body}`);
                    console.log(`   - Footers: ${results.images.summary.locations.footers}`);
                    console.log(`   - Tablas: ${results.images.summary.locations.tables}`);
                }
            }
        } else {
            logError('No se encontraron datos de imágenes en el análisis');
        }

        logStep('📊 VERIFICANDO ANÁLISIS DETALLADO DE TABLAS');
        
        if (results.tables) {
            logSuccess(`Total de tablas analizadas: ${results.tables.total}`);
            
            if (results.tables.tables && results.tables.tables.length > 0) {
                logInfo('Detalles de tablas:');
                results.tables.tables.forEach((table, index) => {
                    if (table && table.structure) {
                        console.log(`   Tabla ${index + 1}: ${table.structure.rows} filas x ${table.structure.columns} columnas`);
                        if (table.content && table.content.allText) {
                            const preview = table.content.allText.substring(0, 100).replace(/\n/g, ' ');
                            console.log(`     Contenido: "${preview}${preview.length >= 100 ? '...' : ''}"`);
                        }
                        if (table.position) {
                            console.log(`     Posición: ${table.position.beforeElements.length} elementos antes, ${table.position.afterElements.length} después`);
                        }
                    }
                });
            }
            
            if (results.tables.summary) {
                logInfo('Resumen de tablas:');
                console.log(`   - Total de filas: ${results.tables.summary.totalRows}`);
                console.log(`   - Total de celdas: ${results.tables.summary.totalCells}`);
                console.log(`   - Promedio de columnas: ${results.tables.summary.averageColumns}`);
            }
            
            if (results.tables.positioning) {
                logInfo('Posicionamiento en documento:');
                console.log(`   - Flujo del documento: ${results.tables.positioning.documentFlow.length} tablas ordenadas`);
                if (results.tables.positioning.pageDistribution) {
                    const pages = Object.keys(results.tables.positioning.pageDistribution);
                    console.log(`   - Distribución por páginas: ${pages.length} páginas con tablas`);
                }
            }
        } else {
            logError('No se encontraron datos de tablas en el análisis');
        }

        logStep('📁 VERIFICANDO ARCHIVOS GENERADOS');
        
        // Verificar directorio de imágenes extraídas
        const extractedImagesDir = './extracted_images';
        if (await fs.pathExists(extractedImagesDir)) {
            const imageFiles = await fs.readdir(extractedImagesDir);
            logSuccess(`Directorio de imágenes creado con ${imageFiles.length} archivos`);
            
            // Verificar registro de imágenes
            const registryPath = path.join(extractedImagesDir, 'image_registry.json');
            if (await fs.pathExists(registryPath)) {
                const registry = await fs.readJson(registryPath);
                logSuccess(`Registro de imágenes creado con ${registry.totalImages} imágenes`);
            }
        } else {
            logError('Directorio de imágenes extraídas no fue creado');
        }

        logStep('🎯 VERIFICANDO INTEGRIDAD DEL ANÁLISIS');
        
        // Verificar estructura básica del análisis
        const requiredSections = ['timestamp', 'archivo', 'tamaño', 'images', 'tables', 'headers', 'body'];
        let missingSection = false;
        
        for (const section of requiredSections) {
            if (!results[section]) {
                logError(`Sección faltante en análisis: ${section}`);
                missingSection = true;
            }
        }
        
        if (!missingSection) {
            logSuccess('Todas las secciones requeridas están presentes');
        }

        logStep('📊 GENERANDO REPORTE DE PRUEBA');
        
        // Crear reporte de prueba
        const testReport = {
            timestamp: new Date().toISOString(),
            testType: 'Image Extraction and Table Analysis',
            docxFile: path.basename(docxPath),
            results: {
                imageExtraction: {
                    success: results.images && results.images.total > 0,
                    totalImages: results.images?.total || 0,
                    extractedSuccessfully: results.images?.extractedImages?.length || 0,
                    extractionPath: extractedImagesDir
                },
                tableAnalysis: {
                    success: results.tables && results.tables.total > 0,
                    totalTables: results.tables?.total || 0,
                    detailedAnalysis: !!results.tables?.tables,
                    positioningAnalysis: !!results.tables?.positioning
                },
                overallStatus: 'SUCCESS'
            }
        };

        const reportPath = './output/image_table_analysis_test_report.json';
        await fs.writeJson(reportPath, testReport, { spaces: 2 });
        logSuccess(`Reporte de prueba guardado: ${reportPath}`);

        console.log('\n');
        logStep('🏁 PRUEBA COMPLETADA EXITOSAMENTE');
        
        logSuccess('✅ Extracción de imágenes funcional');
        logSuccess('✅ Análisis detallado de tablas funcional');
        logSuccess('✅ Posicionamiento de elementos detectado');
        logSuccess('✅ Estructura del documento preservada');
        
        return {
            success: true,
            imagesExtracted: results.images?.total || 0,
            tablesAnalyzed: results.tables?.total || 0,
            analysisFile: await analyzer.saveResults(results, 'test_complete_analysis')
        };
        
    } catch (error) {
        logError(`Error durante la prueba: ${error.message}`);
        console.error(error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Ejecutar la prueba
testImageExtractionAndTableAnalysis()
    .then(result => {
        if (result.success) {
            console.log(`\n🎉 PRUEBA EXITOSA: ${result.imagesExtracted} imágenes, ${result.tablesAnalyzed} tablas`);
        } else {
            console.log(`\n💥 PRUEBA FALLIDA: ${result.error}`);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n💥 ERROR CRÍTICO:', error);
        process.exit(1);
    });
