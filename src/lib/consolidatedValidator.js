/**
 * Librería Consolidada de Validadores
 * 
 * Unifica todas las funciones de validación en una sola librería reutilizable.
 * Incluye validación de imágenes, estructura, formato y posicionamiento.
 */

import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { DOMParser } from 'xmldom';

export class ConsolidatedValidator {
    constructor(options = {}) {
        this.options = {
            outputDir: options.outputDir || './output',
            logLevel: options.logLevel || 'info',
            ...options
        };
        this.parser = new DOMParser();
        this.validationResults = [];
    }

    /**
     * Carga el análisis más reciente de un tipo específico
     */
    async loadLatestAnalysis(analysisType) {
        try {
            const files = await fs.readdir(this.options.outputDir);
            const analysisFiles = files.filter(f => f.startsWith(analysisType));
            
            if (analysisFiles.length === 0) {
                this.log('warning', `No se encontraron archivos de análisis tipo: ${analysisType}`);
                return null;
            }
            
            const latestFile = analysisFiles.sort().pop();
            const analysisPath = path.join(this.options.outputDir, latestFile);
            
            this.log('info', `Cargando análisis: ${analysisPath}`);
            const analysis = await fs.readJson(analysisPath);
            
            return analysis;
        } catch (error) {
            this.log('error', `Error cargando análisis ${analysisType}: ${error.message}`);
            return null;
        }
    }

    /**
     * Validación de formato de imágenes
     */
    async validateImageFormatting() {
        this.log('info', '🔍 Validando formato de imágenes...');
        
        const analysis = await this.loadLatestAnalysis('image_formatting_');
        if (!analysis) return { valid: false, error: 'No se encontró análisis de formato' };

        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            details: {
                totalHeaders: 0,
                totalImages: 0,
                validConfigurations: 0
            }
        };

        analysis.headers.forEach((header, headerIndex) => {
            validation.details.totalHeaders++;
            
            header.imagenes.forEach((imagen, imgIndex) => {
                validation.details.totalImages++;
                
                // Validar dimensiones
                if (!imagen.dimensiones || !imagen.dimensiones.cx_pixels || !imagen.dimensiones.cy_pixels) {
                    validation.errors.push(`Header ${headerIndex}: Imagen ${imgIndex} - Dimensiones faltantes`);
                    validation.valid = false;
                } else {
                    validation.details.validConfigurations++;
                }

                // Validar posicionamiento
                if (!imagen.posicionamiento || !imagen.posicionamiento.horizontal) {
                    validation.warnings.push(`Header ${headerIndex}: Imagen ${imgIndex} - Posicionamiento incompleto`);
                }

                // Validar wrapping
                if (!imagen.wrapping || !imagen.wrapping.tipo) {
                    validation.warnings.push(`Header ${headerIndex}: Imagen ${imgIndex} - Configuración de wrapping faltante`);
                }
            });
        });

        this.validationResults.push({
            type: 'imageFormatting',
            timestamp: new Date().toISOString(),
            result: validation
        });

        return validation;
    }

    /**
     * Validación de recortes de imágenes
     */
    async validateImageCropping() {
        this.log('info', '🎯 Validando recortes de imágenes...');
        
        const analysis = await this.loadLatestAnalysis('image_formatting_');
        if (!analysis) return { valid: false, error: 'No se encontró análisis de formato' };

        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            details: {
                totalImages: 0,
                imagesWithCropping: 0,
                croppingDetails: []
            }
        };

        analysis.headers.forEach((header, headerIndex) => {
            header.imagenes.forEach((imagen, imgIndex) => {
                validation.details.totalImages++;
                
                // Verificar datos de recorte
                if (imagen.recorte) {
                    validation.details.imagesWithCropping++;
                    
                    const croppingInfo = {
                        headerId: headerIndex,
                        imageId: imgIndex,
                        relationId: imagen.relacionId,
                        cropData: imagen.recorte
                    };
                    
                    // Validar integridad del recorte
                    if (!imagen.recorte.l || !imagen.recorte.t || !imagen.recorte.r || !imagen.recorte.b) {
                        validation.errors.push(`Recorte incompleto en imagen ${imagen.relacionId}`);
                        validation.valid = false;
                    } else {
                        // Validar que los valores sean numéricos y válidos
                        const cropValues = [imagen.recorte.l, imagen.recorte.t, imagen.recorte.r, imagen.recorte.b];
                        const invalidValues = cropValues.filter(val => isNaN(parseInt(val)) || parseInt(val) < 0);
                        
                        if (invalidValues.length > 0) {
                            validation.errors.push(`Valores de recorte inválidos en imagen ${imagen.relacionId}`);
                            validation.valid = false;
                        }
                    }
                    
                    validation.details.croppingDetails.push(croppingInfo);
                } else {
                    validation.warnings.push(`Imagen ${imagen.relacionId} sin datos de recorte`);
                }
            });
        });

        this.validationResults.push({
            type: 'imageCropping',
            timestamp: new Date().toISOString(),
            result: validation
        });

        return validation;
    }

    /**
     * Validación de posicionamiento del body
     */
    async validateBodyPositioning() {
        this.log('info', '📐 Validando posicionamiento del body...');
        
        const analysis = await this.loadLatestAnalysis('body_positioning_');
        if (!analysis) return { valid: false, error: 'No se encontró análisis de posicionamiento' };

        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            details: {
                totalTables: analysis.tablas?.length || 0,
                totalImages: analysis.imagenes?.length || 0,
                totalParagraphs: analysis.parrafos?.length || 0
            }
        };

        // Validar tablas
        if (analysis.tablas) {
            analysis.tablas.forEach((tabla, index) => {
                if (!tabla.filas || tabla.filas.length === 0) {
                    validation.errors.push(`Tabla ${index}: Sin filas definidas`);
                    validation.valid = false;
                }
                
                if (!tabla.propiedades || !tabla.propiedades.ancho) {
                    validation.warnings.push(`Tabla ${index}: Propiedades de ancho faltantes`);
                }
            });
        }

        // Validar imágenes del body
        if (analysis.imagenes) {
            analysis.imagenes.forEach((imagen, index) => {
                if (!imagen.posicionamiento || !imagen.posicionamiento.tipo) {
                    validation.errors.push(`Imagen del body ${index}: Tipo de posicionamiento faltante`);
                    validation.valid = false;
                }
                
                if (!imagen.relacionId) {
                    validation.errors.push(`Imagen del body ${index}: ID de relación faltante`);
                    validation.valid = false;
                }
            });
        }

        this.validationResults.push({
            type: 'bodyPositioning',
            timestamp: new Date().toISOString(),
            result: validation
        });

        return validation;
    }

    /**
     * Validación de estructura de páginas
     */
    async validatePageStructure(docxPath) {
        this.log('info', '📄 Validando estructura de páginas...');
        
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            details: {
                totalPages: 0,
                pageStructure: [],
                expectedStructure: {
                    mainTable: 1,
                    sessionPages: 4,
                    tablesPerSession: 1,
                    imagesPerSession: 4
                }
            }
        };

        try {
            const zip = new AdmZip(docxPath);
            const documentEntry = zip.getEntry('word/document.xml');
            
            if (!documentEntry) {
                validation.errors.push('No se encontró document.xml');
                validation.valid = false;
                return validation;
            }

            const documentXml = documentEntry.getData().toString('utf8');
            const documentDoc = this.parser.parseFromString(documentXml, 'text/xml');

            // Contar tablas
            const tables = documentDoc.getElementsByTagName('w:tbl');
            const totalTables = tables.length;

            // Contar imágenes
            const drawings = documentDoc.getElementsByTagName('w:drawing');
            const totalImages = drawings.length;

            // Contar saltos de página
            const pageBreaks = documentDoc.getElementsByTagName('w:br');
            let pageBreakCount = 0;
            for (let i = 0; i < pageBreaks.length; i++) {
                const br = pageBreaks[i];
                if (br.getAttribute('w:type') === 'page') {
                    pageBreakCount++;
                }
            }

            validation.details.pageStructure = {
                totalTables,
                totalImages,
                pageBreaks: pageBreakCount,
                estimatedPages: pageBreakCount + 1
            };

            // Validar estructura esperada
            const expected = validation.details.expectedStructure;
            const expectedTables = expected.mainTable + (expected.sessionPages * expected.tablesPerSession);
            const expectedImages = expected.sessionPages * expected.imagesPerSession;

            if (totalTables !== expectedTables) {
                validation.errors.push(`Número de tablas incorrecto: esperado ${expectedTables}, encontrado ${totalTables}`);
                validation.valid = false;
            }

            if (totalImages !== expectedImages) {
                validation.warnings.push(`Número de imágenes diferente: esperado ${expectedImages}, encontrado ${totalImages}`);
            }

        } catch (error) {
            validation.errors.push(`Error al validar estructura: ${error.message}`);
            validation.valid = false;
        }

        this.validationResults.push({
            type: 'pageStructure',
            timestamp: new Date().toISOString(),
            result: validation
        });

        return validation;
    }

    /**
     * Validación completa
     */
    async validateComplete(docxPath = null) {
        this.log('info', '🔍 Iniciando validación completa...');
        
        const results = {
            timestamp: new Date().toISOString(),
            overallValid: true,
            validations: {}
        };

        // Ejecutar todas las validaciones
        results.validations.imageFormatting = await this.validateImageFormatting();
        results.validations.imageCropping = await this.validateImageCropping();
        results.validations.bodyPositioning = await this.validateBodyPositioning();
        
        if (docxPath) {
            results.validations.pageStructure = await this.validatePageStructure(docxPath);
        }

        // Determinar resultado general
        results.overallValid = Object.values(results.validations).every(v => v.valid);

        // Generar resumen
        results.summary = this.generateValidationSummary(results.validations);

        this.log('info', `Validación completa: ${results.overallValid ? 'VÁLIDA' : 'INVÁLIDA'}`);

        return results;
    }

    /**
     * Genera resumen de validación
     */
    generateValidationSummary(validations) {
        const summary = {
            totalValidations: Object.keys(validations).length,
            passedValidations: 0,
            totalErrors: 0,
            totalWarnings: 0,
            details: {}
        };

        Object.entries(validations).forEach(([type, validation]) => {
            if (validation.valid) {
                summary.passedValidations++;
            }
            
            summary.totalErrors += validation.errors?.length || 0;
            summary.totalWarnings += validation.warnings?.length || 0;
            
            summary.details[type] = {
                valid: validation.valid,
                errors: validation.errors?.length || 0,
                warnings: validation.warnings?.length || 0
            };
        });

        return summary;
    }

    /**
     * Guarda resultados de validación
     */
    async saveValidationResults(outputFileName = null) {
        try {
            await fs.ensureDir(this.options.outputDir);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = outputFileName || `consolidated_validation_${timestamp}.json`;
            const filePath = path.join(this.options.outputDir, fileName);
            
            const results = {
                timestamp: new Date().toISOString(),
                validations: this.validationResults,
                summary: this.generateValidationSummary(
                    this.validationResults.reduce((acc, v) => {
                        acc[v.type] = v.result;
                        return acc;
                    }, {})
                )
            };
            
            await fs.writeJson(filePath, results, { spaces: 2 });
            this.log('info', `Resultados guardados en: ${filePath}`);
            
            return filePath;
        } catch (error) {
            this.log('error', `Error al guardar resultados: ${error.message}`);
            throw error;
        }
    }

    /**
     * Muestra resumen en consola
     */
    showValidationSummary() {
        console.log('\n📊 RESUMEN DE VALIDACIÓN CONSOLIDADA');
        console.log('='.repeat(60));
        
        if (this.validationResults.length === 0) {
            console.log('⚠️ No hay resultados de validación disponibles');
            return;
        }

        const summary = this.generateValidationSummary(
            this.validationResults.reduce((acc, v) => {
                acc[v.type] = v.result;
                return acc;
            }, {})
        );

        console.log(`📈 Validaciones completadas: ${summary.totalValidations}`);
        console.log(`✅ Validaciones exitosas: ${summary.passedValidations}`);
        console.log(`❌ Total errores: ${summary.totalErrors}`);
        console.log(`⚠️ Total advertencias: ${summary.totalWarnings}`);
        
        console.log('\n📋 Detalles por tipo:');
        Object.entries(summary.details).forEach(([type, details]) => {
            const status = details.valid ? '✅' : '❌';
            console.log(`  ${status} ${type}: ${details.errors} errores, ${details.warnings} advertencias`);
        });
    }

    /**
     * Sistema de logging
     */
    log(level, message) {
        const emoji = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            success: '✅'
        };

        if (this.options.logLevel === 'info' || level !== 'info') {
            console.log(`${emoji[level] || 'ℹ️'} [VALIDATOR] ${message}`);
        }
    }
}

export default ConsolidatedValidator;
