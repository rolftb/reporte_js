/**
 * Librería Unificada de Validación de Documentos DOCX
 * 
 * Esta librería contiene todas las funciones necesarias para validar
 * documentos DOCX generados, verificar integridad estructural,
 * posicionamiento, formato e imágenes.
 * 
 * @version 1.0.0
 * @author PUMA Validation System
 */

import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { DOMParser } from 'xmldom';

/**
 * Clase principal para validación de documentos DOCX
 */
export class DocxValidator {
    constructor(docxPath) {
        this.docxPath = docxPath;
        this.zip = null;
        this.parser = new DOMParser();
        this.validationResults = {
            fecha: new Date().toISOString(),
            archivo: path.basename(docxPath),
            valido: true,
            errores: [],
            advertencias: [],
            validaciones: {}
        };
    }

    /**
     * Inicializa el validador cargando el archivo DOCX
     */
    async initialize() {
        try {
            if (!await fs.pathExists(this.docxPath)) {
                throw new Error(`Archivo no encontrado: ${this.docxPath}`);
            }
            this.zip = new AdmZip(this.docxPath);
            console.log(`✅ Archivo DOCX cargado para validación: ${path.basename(this.docxPath)}`);
        } catch (error) {
            console.error('❌ Error al cargar archivo DOCX para validación:', error);
            throw error;
        }
    }

    /**
     * Validación completa del documento
     */
    async validateComplete() {
        await this.initialize();
        
        console.log('🔍 Iniciando validación completa del documento...');
        
        const validations = {
            estructura: await this.validateStructure(),
            headers: await this.validateHeaders(),
            imagenes: await this.validateImages(),
            tablas: await this.validateTables(),
            posicionamiento: await this.validatePositioning(),
            integridad: await this.validateIntegrity()
        };

        this.validationResults.validaciones = validations;
        
        // Determinar resultado general
        this.validationResults.valido = this.validationResults.errores.length === 0;
        
        return this.validationResults;
    }

    /**
     * Valida la estructura general del documento
     */
    async validateStructure() {
        console.log('📋 Validando estructura del documento...');
        
        const structureValidation = {
            valido: true,
            errores: [],
            detalles: {}
        };

        try {
            // Verificar archivos principales
            const requiredFiles = [
                'word/document.xml',
                '_rels/.rels',
                '[Content_Types].xml'
            ];

            for (const file of requiredFiles) {
                const entry = this.zip.getEntry(file);
                if (!entry) {
                    structureValidation.errores.push(`Archivo requerido faltante: ${file}`);
                    structureValidation.valido = false;
                }
            }

            // Analizar document.xml
            const documentEntry = this.zip.getEntry('word/document.xml');
            if (documentEntry) {
                const documentXml = documentEntry.getData().toString('utf8');
                const documentDoc = this.parser.parseFromString(documentXml, 'text/xml');
                
                const body = documentDoc.getElementsByTagName('w:body')[0];
                if (!body) {
                    structureValidation.errores.push('No se encontró elemento body en document.xml');
                    structureValidation.valido = false;
                } else {
                    structureValidation.detalles.elementosBody = body.childNodes.length;
                }
            }

        } catch (error) {
            structureValidation.errores.push(`Error en validación de estructura: ${error.message}`);
            structureValidation.valido = false;
        }

        if (!structureValidation.valido) {
            this.validationResults.errores.push(...structureValidation.errores);
        }

        return structureValidation;
    }

    /**
     * Valida los headers del documento
     */
    async validateHeaders() {
        console.log('📋 Validando headers...');
        
        const headerValidation = {
            valido: true,
            errores: [],
            detalles: {
                headersEncontrados: [],
                imagenesHeader: 0
            }
        };

        try {
            const headerFiles = ['word/header1.xml', 'word/header2.xml'];
            
            for (const headerFile of headerFiles) {
                const headerEntry = this.zip.getEntry(headerFile);
                if (headerEntry) {
                    headerValidation.detalles.headersEncontrados.push(headerFile);
                    
                    const headerXml = headerEntry.getData().toString('utf8');
                    const headerDoc = this.parser.parseFromString(headerXml, 'text/xml');
                    
                    // Contar imágenes en header
                    const drawings = headerDoc.getElementsByTagName('w:drawing');
                    headerValidation.detalles.imagenesHeader += drawings.length;
                }
            }

            if (headerValidation.detalles.headersEncontrados.length === 0) {
                headerValidation.errores.push('No se encontraron headers en el documento');
                headerValidation.valido = false;
            }

        } catch (error) {
            headerValidation.errores.push(`Error en validación de headers: ${error.message}`);
            headerValidation.valido = false;
        }

        if (!headerValidation.valido) {
            this.validationResults.errores.push(...headerValidation.errores);
        }

        return headerValidation;
    }

    /**
     * Valida las imágenes del documento
     */
    async validateImages() {
        console.log('🖼️ Validando imágenes...');
        
        const imageValidation = {
            valido: true,
            errores: [],
            advertencias: [],
            detalles: {
                imagenesEncontradas: 0,
                imagenesBody: 0,
                imagenesHeader: 0,
                relacionesImagen: []
            }
        };

        try {
            // Verificar relaciones de imágenes
            const relsEntry = this.zip.getEntry('word/_rels/document.xml.rels');
            if (relsEntry) {
                const relsXml = relsEntry.getData().toString('utf8');
                const relsDoc = this.parser.parseFromString(relsXml, 'text/xml');
                
                const relationships = relsDoc.getElementsByTagName('Relationship');
                for (let i = 0; i < relationships.length; i++) {
                    const rel = relationships[i];
                    const type = rel.getAttribute('Type');
                    
                    if (type && type.includes('image')) {
                        const target = rel.getAttribute('Target');
                        const id = rel.getAttribute('Id');
                        
                        imageValidation.detalles.relacionesImagen.push({
                            id: id,
                            target: target
                        });
                        
                        // Verificar que el archivo de imagen existe
                        const imagePath = `word/${target}`;
                        const imageEntry = this.zip.getEntry(imagePath);
                        if (!imageEntry) {
                            imageValidation.errores.push(`Imagen referenciada no encontrada: ${imagePath}`);
                            imageValidation.valido = false;
                        }
                    }
                }
            }

            // Contar imágenes en document.xml
            const documentEntry = this.zip.getEntry('word/document.xml');
            if (documentEntry) {
                const documentXml = documentEntry.getData().toString('utf8');
                const documentDoc = this.parser.parseFromString(documentXml, 'text/xml');
                
                const drawings = documentDoc.getElementsByTagName('w:drawing');
                imageValidation.detalles.imagenesBody = drawings.length;
            }

            // Contar imágenes en headers
            const headerFiles = ['word/header1.xml', 'word/header2.xml'];
            for (const headerFile of headerFiles) {
                const headerEntry = this.zip.getEntry(headerFile);
                if (headerEntry) {
                    const headerXml = headerEntry.getData().toString('utf8');
                    const headerDoc = this.parser.parseFromString(headerXml, 'text/xml');
                    
                    const drawings = headerDoc.getElementsByTagName('w:drawing');
                    imageValidation.detalles.imagenesHeader += drawings.length;
                }
            }

            imageValidation.detalles.imagenesEncontradas = 
                imageValidation.detalles.imagenesBody + imageValidation.detalles.imagenesHeader;

            if (imageValidation.detalles.imagenesEncontradas === 0) {
                imageValidation.advertencias.push('No se encontraron imágenes en el documento');
            }

        } catch (error) {
            imageValidation.errores.push(`Error en validación de imágenes: ${error.message}`);
            imageValidation.valido = false;
        }

        if (!imageValidation.valido) {
            this.validationResults.errores.push(...imageValidation.errores);
        }
        
        this.validationResults.advertencias.push(...imageValidation.advertencias);

        return imageValidation;
    }

    /**
     * Valida las tablas del documento
     */
    async validateTables() {
        console.log('📊 Validando tablas...');
        
        const tableValidation = {
            valido: true,
            errores: [],
            detalles: {
                tablasEncontradas: 0,
                estructuraTablas: []
            }
        };

        try {
            const documentEntry = this.zip.getEntry('word/document.xml');
            if (documentEntry) {
                const documentXml = documentEntry.getData().toString('utf8');
                const documentDoc = this.parser.parseFromString(documentXml, 'text/xml');
                
                const tables = documentDoc.getElementsByTagName('w:tbl');
                tableValidation.detalles.tablasEncontradas = tables.length;
                
                for (let i = 0; i < tables.length; i++) {
                    const table = tables[i];
                    const rows = table.getElementsByTagName('w:tr');
                    
                    const tableInfo = {
                        indice: i,
                        filas: rows.length,
                        celdas: []
                    };
                    
                    for (let j = 0; j < rows.length; j++) {
                        const row = rows[j];
                        const cells = row.getElementsByTagName('w:tc');
                        tableInfo.celdas.push(cells.length);
                    }
                    
                    tableValidation.detalles.estructuraTablas.push(tableInfo);
                }
            }

        } catch (error) {
            tableValidation.errores.push(`Error en validación de tablas: ${error.message}`);
            tableValidation.valido = false;
        }

        if (!tableValidation.valido) {
            this.validationResults.errores.push(...tableValidation.errores);
        }

        return tableValidation;
    }

    /**
     * Valida el posicionamiento de elementos
     */
    async validatePositioning() {
        console.log('📐 Validando posicionamiento...');
        
        const positioningValidation = {
            valido: true,
            errores: [],
            detalles: {
                elementosFlotantes: 0,
                elementosInline: 0,
                posicionamientos: []
            }
        };

        try {
            const documentEntry = this.zip.getEntry('word/document.xml');
            if (documentEntry) {
                const documentXml = documentEntry.getData().toString('utf8');
                const documentDoc = this.parser.parseFromString(documentXml, 'text/xml');
                
                // Analizar elementos con posicionamiento
                const anchors = documentDoc.getElementsByTagName('wp:anchor');
                const inlines = documentDoc.getElementsByTagName('wp:inline');
                
                positioningValidation.detalles.elementosFlotantes = anchors.length;
                positioningValidation.detalles.elementosInline = inlines.length;
                
                // Analizar posicionamientos específicos
                for (let i = 0; i < anchors.length; i++) {
                    const anchor = anchors[i];
                    const positioning = this.extractPositioningInfo(anchor);
                    positioningValidation.detalles.posicionamientos.push({
                        tipo: 'anchor',
                        indice: i,
                        posicionamiento: positioning
                    });
                }
            }

        } catch (error) {
            positioningValidation.errores.push(`Error en validación de posicionamiento: ${error.message}`);
            positioningValidation.valido = false;
        }

        if (!positioningValidation.valido) {
            this.validationResults.errores.push(...positioningValidation.errores);
        }

        return positioningValidation;
    }

    /**
     * Extrae información de posicionamiento de un elemento anchor
     */
    extractPositioningInfo(anchor) {
        const positioning = {};

        const positionH = anchor.getElementsByTagName('wp:positionH')[0];
        if (positionH) {
            positioning.horizontal = {
                relativeFrom: positionH.getAttribute('relativeFrom')
            };
            const posOffset = positionH.getElementsByTagName('wp:posOffset')[0];
            if (posOffset) {
                positioning.horizontal.offset = posOffset.textContent;
            }
        }

        const positionV = anchor.getElementsByTagName('wp:positionV')[0];
        if (positionV) {
            positioning.vertical = {
                relativeFrom: positionV.getAttribute('relativeFrom')
            };
            const posOffset = positionV.getElementsByTagName('wp:posOffset')[0];
            if (posOffset) {
                positioning.vertical.offset = posOffset.textContent;
            }
        }

        return positioning;
    }

    /**
     * Valida la integridad general del documento
     */
    async validateIntegrity() {
        console.log('🔒 Validando integridad...');
        
        const integrityValidation = {
            valido: true,
            errores: [],
            detalles: {
                tamanioArchivo: 0,
                archivosInternos: 0,
                relacionesValidas: true
            }
        };

        try {
            // Verificar tamaño del archivo
            const stats = await fs.stat(this.docxPath);
            integrityValidation.detalles.tamanioArchivo = stats.size;
            
            if (stats.size === 0) {
                integrityValidation.errores.push('El archivo está vacío');
                integrityValidation.valido = false;
            }

            // Contar archivos internos
            const entries = this.zip.getEntries();
            integrityValidation.detalles.archivosInternos = entries.length;
            
            if (entries.length === 0) {
                integrityValidation.errores.push('El archivo no contiene elementos internos');
                integrityValidation.valido = false;
            }

        } catch (error) {
            integrityValidation.errores.push(`Error en validación de integridad: ${error.message}`);
            integrityValidation.valido = false;
        }

        if (!integrityValidation.valido) {
            this.validationResults.errores.push(...integrityValidation.errores);
        }

        return integrityValidation;
    }

    /**
     * Valida contra un documento de referencia
     */
    async validateAgainstReference(referencePath) {
        console.log(`🔄 Validando contra documento de referencia: ${path.basename(referencePath)}`);
        
        const referenceValidation = {
            valido: true,
            diferencias: [],
            similitudes: []
        };

        try {
            const referenceValidator = new DocxValidator(referencePath);
            const referenceResults = await referenceValidator.validateComplete();
            
            // Comparar estructuras
            const currentStructure = this.validationResults.validaciones.estructura;
            const referenceStructure = referenceResults.validaciones.estructura;
            
            this.compareStructures(currentStructure, referenceStructure, referenceValidation);
            
            // Comparar imágenes
            const currentImages = this.validationResults.validaciones.imagenes;
            const referenceImages = referenceResults.validaciones.imagenes;
            
            this.compareImages(currentImages, referenceImages, referenceValidation);
            
        } catch (error) {
            referenceValidation.diferencias.push(`Error en comparación: ${error.message}`);
            referenceValidation.valido = false;
        }

        return referenceValidation;
    }

    /**
     * Compara estructuras entre documentos
     */
    compareStructures(current, reference, validation) {
        if (current.detalles.elementosBody !== reference.detalles.elementosBody) {
            validation.diferencias.push(
                `Diferencia en elementos del body: ${current.detalles.elementosBody} vs ${reference.detalles.elementosBody}`
            );
        } else {
            validation.similitudes.push('Misma cantidad de elementos en el body');
        }
    }

    /**
     * Compara imágenes entre documentos
     */
    compareImages(current, reference, validation) {
        if (current.detalles.imagenesEncontradas !== reference.detalles.imagenesEncontradas) {
            validation.diferencias.push(
                `Diferencia en cantidad de imágenes: ${current.detalles.imagenesEncontradas} vs ${reference.detalles.imagenesEncontradas}`
            );
        } else {
            validation.similitudes.push('Misma cantidad de imágenes');
        }
    }

    /**
     * Genera reporte de validación
     */
    async generateValidationReport(outputPath = './output') {
        try {
            await fs.ensureDir(outputPath);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `validation_report_${timestamp}.json`;
            const filePath = path.join(outputPath, fileName);
            
            await fs.writeJson(filePath, this.validationResults, { spaces: 2 });
            console.log(`✅ Reporte de validación guardado en: ${filePath}`);
            
            return filePath;
        } catch (error) {
            console.error('❌ Error al generar reporte de validación:', error);
            throw error;
        }
    }

    /**
     * Muestra resumen de validación en consola
     */
    showValidationSummary() {
        console.log('\n📊 RESUMEN DE VALIDACIÓN');
        console.log('='.repeat(50));
        console.log(`Archivo: ${this.validationResults.archivo}`);
        console.log(`Estado: ${this.validationResults.valido ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
        console.log(`Errores: ${this.validationResults.errores.length}`);
        console.log(`Advertencias: ${this.validationResults.advertencias.length}`);
        
        if (this.validationResults.errores.length > 0) {
            console.log('\n❌ ERRORES:');
            this.validationResults.errores.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        if (this.validationResults.advertencias.length > 0) {
            console.log('\n⚠️ ADVERTENCIAS:');
            this.validationResults.advertencias.forEach((warning, index) => {
                console.log(`  ${index + 1}. ${warning}`);
            });
        }
        
        console.log('\n📋 DETALLES DE VALIDACIÓN:');
        Object.entries(this.validationResults.validaciones).forEach(([key, validation]) => {
            const status = validation.valido ? '✅' : '❌';
            console.log(`  ${status} ${key.toUpperCase()}`);
        });
    }
}

/**
 * Funciones de utilidad para validación
 */
export class ValidationUtils {
    /**
     * Valida múltiples documentos en lote
     */
    static async validateBatch(docxPaths) {
        const results = [];
        
        for (const docxPath of docxPaths) {
            try {
                const validator = new DocxValidator(docxPath);
                const result = await validator.validateComplete();
                results.push({
                    archivo: path.basename(docxPath),
                    ruta: docxPath,
                    resultado: result
                });
            } catch (error) {
                results.push({
                    archivo: path.basename(docxPath),
                    ruta: docxPath,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * Compara dos documentos DOCX
     */
    static async compareDocuments(docx1Path, docx2Path) {
        const validator1 = new DocxValidator(docx1Path);
        const validator2 = new DocxValidator(docx2Path);
        
        const result1 = await validator1.validateComplete();
        const result2 = await validator2.validateComplete();
        
        return validator1.validateAgainstReference(docx2Path);
    }

    /**
     * Genera métricas de calidad del documento
     */
    static calculateQualityMetrics(validationResults) {
        const metrics = {
            puntuacionCalidad: 100,
            factores: {
                estructura: validationResults.validaciones.estructura?.valido ? 25 : 0,
                headers: validationResults.validaciones.headers?.valido ? 20 : 0,
                imagenes: validationResults.validaciones.imagenes?.valido ? 25 : 0,
                tablas: validationResults.validaciones.tablas?.valido ? 15 : 0,
                posicionamiento: validationResults.validaciones.posicionamiento?.valido ? 10 : 0,
                integridad: validationResults.validaciones.integridad?.valido ? 5 : 0
            }
        };
        
        metrics.puntuacionCalidad = Object.values(metrics.factores).reduce((sum, val) => sum + val, 0);
        
        return metrics;
    }

    /**
     * Sugiere correcciones basadas en errores encontrados
     */
    static suggestCorrections(validationResults) {
        const suggestions = [];
        
        validationResults.errores.forEach(error => {
            if (error.includes('Archivo requerido faltante')) {
                suggestions.push('Regenerar el documento asegurándose de incluir todos los archivos XML necesarios');
            } else if (error.includes('Imagen referenciada no encontrada')) {
                suggestions.push('Verificar que todas las imágenes estén correctamente embebidas en el documento');
            } else if (error.includes('body')) {
                suggestions.push('Revisar la estructura del contenido principal del documento');
            } else {
                suggestions.push(`Revisar: ${error}`);
            }
        });
        
        return suggestions;
    }
}

export default DocxValidator;
