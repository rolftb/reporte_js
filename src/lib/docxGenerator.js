/**
 * Librería Unificada de Generación de Documentos DOCX
 * 
 * Esta librería contiene todas las funciones necesarias para generar
 * documentos DOCX con réplica exacta de formato, posicionamiento,
 * headers, imágenes y estructuras complejas.
 * 
 * @version 1.0.0
 * @author PUMA Generation System
 */

import { Document, Packer, Paragraph, TextRun, ImageRun, Header, SectionType, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, TextWrappingType, TextWrappingSide, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, HorizontalPositionAlign, VerticalPositionAlign, PageBreak } from 'docx';
import fs from 'fs-extra';
import path from 'path';

/**
 * Clase principal para generación de documentos DOCX
 */
export class DocxGenerator {
    constructor(options = {}) {
        this.options = {
            useRealImages: options.useRealImages || true,
            extractedImagesPath: options.extractedImagesPath || './extracted_images',
            outputPath: options.outputPath || './output',
            ...options
        };
        
        this.imageRegistry = null;
        this.analysisData = null;
        this.documentElements = [];
    }

    /**
     * Carga datos de análisis para usar en la generación
     */
    async loadAnalysisData(analysisFile) {
        try {
            if (typeof analysisFile === 'string') {
                this.analysisData = await fs.readJson(analysisFile);
            } else {
                this.analysisData = analysisFile;
            }
            console.log('✅ Datos de análisis cargados para generación');
        } catch (error) {
            console.error('❌ Error al cargar datos de análisis:', error);
            throw error;
        }
    }

    /**
     * Carga el registro de imágenes extraídas
     */
    async loadImageRegistry() {
        try {
            const registryPath = path.join(this.options.extractedImagesPath, 'image_registry.json');
            if (await fs.pathExists(registryPath)) {
                this.imageRegistry = await fs.readJson(registryPath);
                console.log(`✅ Registro de imágenes cargado: ${Object.keys(this.imageRegistry).length} imágenes`);
            } else {
                console.log('⚠️ No se encontró registro de imágenes, usando imágenes por defecto');
                this.imageRegistry = {};
            }
        } catch (error) {
            console.error('❌ Error al cargar registro de imágenes:', error);
            this.imageRegistry = {};
        }
    }

    /**
     * Genera un documento completo basado en datos de análisis
     */
    async generateDocument(documentData, outputFileName = 'generated_document.docx') {
        try {
            console.log('🔄 Iniciando generación de documento...');
            
            // Cargar registro de imágenes
            await this.loadImageRegistry();
            
            // Crear headers
            const headers = await this.createHeaders();
            
            // Crear contenido del body
            const bodyElements = await this.createBodyContent(documentData);
            
            // Crear documento
            const doc = new Document({
                sections: [{
                    headers: headers,
                    children: bodyElements,
                    properties: {
                        page: {
                            margin: {
                                top: 1440,    // 1 inch = 1440 twips
                                right: 1440,
                                bottom: 1440,
                                left: 1440,
                            },
                        },
                    },
                }]
            });

            // Guardar documento
            const outputPath = path.join(this.options.outputPath, outputFileName);
            await fs.ensureDir(this.options.outputPath);
            
            const buffer = await Packer.toBuffer(doc);
            await fs.writeFile(outputPath, buffer);
            
            console.log(`✅ Documento generado exitosamente: ${outputPath}`);
            return outputPath;
            
        } catch (error) {
            console.error('❌ Error en generación de documento:', error);
            throw error;
        }
    }

    /**
     * Crea headers basados en datos de análisis
     */
    async createHeaders() {
        const headers = {};
        
        try {
            // Header principal (first page)
            const headerElements = await this.createHeaderElements();
            
            headers.default = new Header({
                children: headerElements
            });
            
            return headers;
        } catch (error) {
            console.error('❌ Error al crear headers:', error);
            return {};
        }
    }

    /**
     * Crea elementos del header
     */
    async createHeaderElements() {
        const elements = [];
        
        // Si tenemos datos de análisis, usar esos datos
        if (this.analysisData && this.analysisData.headerDimensions) {
            elements.push(...await this.createAnalyzedHeaderElements());
        } else {
            // Usar elementos por defecto
            elements.push(...await this.createDefaultHeaderElements());
        }
        
        return elements;
    }

    /**
     * Crea elementos del header basados en análisis
     */
    async createAnalyzedHeaderElements() {
        const elements = [];
        
        try {
            const headerData = this.analysisData.headerDimensions.headers[0]; // Usar primer header
            
            if (headerData && headerData.imagenes) {
                for (const imageInfo of headerData.imagenes) {
                    const imageElement = await this.createImageFromAnalysis(imageInfo, 'header');
                    if (imageElement) {
                        elements.push(imageElement);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al crear elementos del header desde análisis:', error);
        }
        
        return elements;
    }

    /**
     * Crea elementos del header por defecto
     */
    async createDefaultHeaderElements() {
        const elements = [];
        
        // Imagen de logo izquierda
        const leftImage = await this.createHeaderImage('left_logo.png', 'left');
        if (leftImage) elements.push(leftImage);
        
        // Imagen de logo derecha
        const rightImage = await this.createHeaderImage('right_logo.png', 'right');
        if (rightImage) elements.push(rightImage);
        
        return elements;
    }

    /**
     * Crea una imagen para el header
     */
    async createHeaderImage(imageName, position = 'left') {
        try {
            const imagePath = await this.resolveImagePath(imageName);
            if (!imagePath) return null;

            const alignment = position === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT;
            
            return new Paragraph({
                alignment: alignment,
                children: [
                    new ImageRun({
                        data: await fs.readFile(imagePath),
                        transformation: {
                            width: 120,
                            height: 80,
                        },
                        floating: {
                            horizontalPosition: {
                                relative: HorizontalPositionRelativeFrom.PAGE,
                                align: position === 'right' ? HorizontalPositionAlign.RIGHT : HorizontalPositionAlign.LEFT,
                            },
                            verticalPosition: {
                                relative: VerticalPositionRelativeFrom.PAGE,
                                align: VerticalPositionAlign.TOP,
                            },
                            wrap: {
                                type: TextWrappingType.SQUARE,
                                side: TextWrappingSide.BOTH_SIDES,
                            },
                        },
                    }),
                ],
            });
        } catch (error) {
            console.error(`❌ Error al crear imagen de header ${imageName}:`, error);
            return null;
        }
    }

    /**
     * Crea una imagen basada en datos de análisis
     */
    async createImageFromAnalysis(imageInfo, context = 'body') {
        try {
            const imagePath = await this.resolveImagePath(imageInfo.relacionId);
            if (!imagePath) return null;

            const dimensions = imageInfo.dimensionesPixeles || { width: 120, height: 80 };
            
            if (context === 'header') {
                return new Paragraph({
                    children: [
                        new ImageRun({
                            data: await fs.readFile(imagePath),
                            transformation: {
                                width: dimensions.width,
                                height: dimensions.height,
                            },
                        }),
                    ],
                });
            } else {
                // Para imágenes del body, usar posicionamiento si está disponible
                const positioning = imageInfo.posicionamiento || {};
                
                if (positioning.type === 'anchor') {
                    return this.createFloatingImage(imagePath, dimensions, positioning);
                } else {
                    return this.createInlineImage(imagePath, dimensions);
                }
            }
        } catch (error) {
            console.error('❌ Error al crear imagen desde análisis:', error);
            return null;
        }
    }

    /**
     * Crea una imagen flotante con posicionamiento específico
     */
    async createFloatingImage(imagePath, dimensions, positioning) {
        try {
            const imageData = await fs.readFile(imagePath);
            
            return new Paragraph({
                children: [
                    new ImageRun({
                        data: imageData,
                        transformation: {
                            width: dimensions.width,
                            height: dimensions.height,
                        },
                        floating: {
                            horizontalPosition: {
                                relative: this.mapHorizontalRelative(positioning.horizontal?.relativeFrom),
                                offset: positioning.horizontal?.offset ? parseInt(positioning.horizontal.offset) : 0,
                            },
                            verticalPosition: {
                                relative: this.mapVerticalRelative(positioning.vertical?.relativeFrom),
                                offset: positioning.vertical?.offset ? parseInt(positioning.vertical.offset) : 0,
                            },
                            wrap: {
                                type: TextWrappingType.SQUARE,
                                side: TextWrappingSide.BOTH_SIDES,
                            },
                        },
                    }),
                ],
            });
        } catch (error) {
            console.error('❌ Error al crear imagen flotante:', error);
            return null;
        }
    }

    /**
     * Crea una imagen inline
     */
    async createInlineImage(imagePath, dimensions) {
        try {
            const imageData = await fs.readFile(imagePath);
            
            return new Paragraph({
                children: [
                    new ImageRun({
                        data: imageData,
                        transformation: {
                            width: dimensions.width,
                            height: dimensions.height,
                        },
                    }),
                ],
            });
        } catch (error) {
            console.error('❌ Error al crear imagen inline:', error);
            return null;
        }
    }

    /**
     * Mapea referencias horizontales de posicionamiento
     */
    mapHorizontalRelative(relative) {
        const mapping = {
            'page': HorizontalPositionRelativeFrom.PAGE,
            'margin': HorizontalPositionRelativeFrom.MARGIN,
            'column': HorizontalPositionRelativeFrom.COLUMN,
            'character': HorizontalPositionRelativeFrom.CHARACTER,
        };
        return mapping[relative] || HorizontalPositionRelativeFrom.PAGE;
    }

    /**
     * Mapea referencias verticales de posicionamiento
     */
    mapVerticalRelative(relative) {
        const mapping = {
            'page': VerticalPositionRelativeFrom.PAGE,
            'margin': VerticalPositionRelativeFrom.MARGIN,
            'paragraph': VerticalPositionRelativeFrom.PARAGRAPH,
            'line': VerticalPositionRelativeFrom.LINE,
        };
        return mapping[relative] || VerticalPositionRelativeFrom.PAGE;
    }

    /**
     * Crea contenido del body del documento
     */
    async createBodyContent(documentData) {
        const elements = [];
        
        try {
            // Si tenemos datos de análisis, usar estructura analizada
            if (this.analysisData && this.analysisData.bodyPositioning) {
                elements.push(...await this.createAnalyzedBodyContent(documentData));
            } else {
                // Usar estructura por defecto
                elements.push(...await this.createDefaultBodyContent(documentData));
            }
        } catch (error) {
            console.error('❌ Error al crear contenido del body:', error);
        }
        
        return elements;
    }

    /**
     * Crea contenido del body basado en análisis
     */
    async createAnalyzedBodyContent(documentData) {
        const elements = [];
        
        try {
            const bodyData = this.analysisData.bodyPositioning;
            
            // Crear tablas analizadas
            if (bodyData.tablas) {
                for (const tableInfo of bodyData.tablas) {
                    const table = await this.createTableFromAnalysis(tableInfo, documentData);
                    if (table) elements.push(table);
                }
            }
            
            // Crear imágenes analizadas
            if (bodyData.imagenes) {
                for (const imageInfo of bodyData.imagenes) {
                    const image = await this.createImageFromAnalysis(imageInfo, 'body');
                    if (image) elements.push(image);
                }
            }
            
        } catch (error) {
            console.error('❌ Error al crear contenido del body desde análisis:', error);
        }
        
        return elements;
    }

    /**
     * Crea una tabla basada en datos de análisis
     */
    async createTableFromAnalysis(tableInfo, documentData) {
        try {
            const rows = [];
            
            for (const rowInfo of tableInfo.filas) {
                const cells = [];
                
                for (const cellInfo of rowInfo.celdas) {
                    const cell = new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: cellInfo.texto || '',
                                    }),
                                ],
                            }),
                        ],
                        width: cellInfo.propiedades?.ancho ? {
                            size: parseInt(cellInfo.propiedades.ancho.w),
                            type: this.mapWidthType(cellInfo.propiedades.ancho.type),
                        } : undefined,
                        shading: cellInfo.propiedades?.sombreado ? {
                            fill: cellInfo.propiedades.sombreado.fill,
                            color: cellInfo.propiedades.sombreado.color,
                        } : undefined,
                    });
                    
                    cells.push(cell);
                }
                
                rows.push(new TableRow({ children: cells }));
            }
            
            return new Table({
                rows: rows,
                width: tableInfo.propiedades?.ancho ? {
                    size: parseInt(tableInfo.propiedades.ancho.w),
                    type: this.mapWidthType(tableInfo.propiedades.ancho.type),
                } : {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                },
            });
            
        } catch (error) {
            console.error('❌ Error al crear tabla desde análisis:', error);
            return null;
        }
    }

    /**
     * Mapea tipos de ancho de Word a docx
     */
    mapWidthType(wordType) {
        const mapping = {
            'dxa': WidthType.DXA,
            'pct': WidthType.PERCENTAGE,
            'auto': WidthType.AUTO,
            'nil': WidthType.NIL,
        };
        return mapping[wordType] || WidthType.AUTO;
    }

    /**
     * Crea contenido del body por defecto
     */
    async createDefaultBodyContent(documentData) {
        const elements = [];
        
        // Tabla principal
        elements.push(this.createMainTable(documentData));
        
        // Contenido de sesiones
        if (documentData.sesiones) {
            for (let i = 0; i < documentData.sesiones.length; i++) {
                if (i > 0) {
                    elements.push(new Paragraph({ children: [new PageBreak()] }));
                }
                
                const sessionElements = await this.createSessionContent(documentData.sesiones[i], i);
                elements.push(...sessionElements);
            }
        }
        
        return elements;
    }

    /**
     * Crea la tabla principal del documento
     */
    createMainTable(documentData) {
        const rows = [
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "EMPRESA:", bold: true })] })],
                        shading: { fill: "D9D9D9" },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: documentData.empresa || "PUMA ENERGY CHILE S.A." })] })],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "ACTIVIDAD:", bold: true })] })],
                        shading: { fill: "D9D9D9" },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: documentData.actividad || "Programa de Calidad de Vida" })] })],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "FECHA:", bold: true })] })],
                        shading: { fill: "D9D9D9" },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: documentData.fechaPeriodo || "Desde el 21 de mayo al 20 de junio" })] })],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "LUGAR:", bold: true })] })],
                        shading: { fill: "D9D9D9" },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: documentData.lugar || "Av. Pdte. Kennedy 5454" })] })],
                    }),
                ],
            }),
        ];

        return new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
        });
    }

    /**
     * Crea contenido de una sesión
     */
    async createSessionContent(sessionData, sessionIndex) {
        const elements = [];
        
        // Tabla de la sesión
        elements.push(this.createSessionTable(sessionData, sessionIndex));
        
        // Imágenes de la sesión
        const sessionImages = await this.createSessionImages(sessionIndex);
        elements.push(...sessionImages);
        
        return elements;
    }

    /**
     * Crea tabla de una sesión
     */
    createSessionTable(sessionData, sessionIndex) {
        const rows = [
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "FECHA:", bold: true })] })],
                        shading: { fill: "D9D9D9" },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: sessionData.fecha || "" })] })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "CANTIDAD DE PAUSAS:", bold: true })] })],
                        shading: { fill: "D9D9D9" },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: sessionData.cantidadPausas || "" })] })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "PARTICIPANTES:", bold: true })] })],
                        shading: { fill: "D9D9D9" },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: sessionData.participantes || "" })] })],
                    }),
                ],
            }),
        ];

        return new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
        });
    }

    /**
     * Crea imágenes de una sesión
     */
    async createSessionImages(sessionIndex) {
        const images = [];
        
        for (let i = 0; i < 4; i++) {
            const imageName = `session_${sessionIndex + 1}_image_${i + 1}.jpg`;
            const imagePath = await this.resolveImagePath(imageName);
            
            if (imagePath) {
                const imageElement = await this.createInlineImage(imagePath, { width: 200, height: 150 });
                if (imageElement) images.push(imageElement);
            }
        }
        
        return images;
    }

    /**
     * Resuelve la ruta de una imagen
     */
    async resolveImagePath(imageName) {
        try {
            // Buscar en registro de imágenes
            if (this.imageRegistry && this.imageRegistry[imageName]) {
                const registeredPath = path.join(this.options.extractedImagesPath, this.imageRegistry[imageName]);
                if (await fs.pathExists(registeredPath)) {
                    return registeredPath;
                }
            }
            
            // Buscar directamente por nombre
            const directPath = path.join(this.options.extractedImagesPath, imageName);
            if (await fs.pathExists(directPath)) {
                return directPath;
            }
            
            // Buscar imágenes por defecto
            const defaultPath = path.join('./templates/images', imageName);
            if (await fs.pathExists(defaultPath)) {
                return defaultPath;
            }
            
            console.log(`⚠️ No se encontró imagen: ${imageName}`);
            return null;
        } catch (error) {
            console.error(`❌ Error al resolver ruta de imagen ${imageName}:`, error);
            return null;
        }
    }
}

/**
 * Funciones de utilidad para generación
 */
export class GenerationUtils {
    /**
     * Valida datos de documento antes de la generación
     */
    static validateDocumentData(documentData) {
        const validation = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!documentData) {
            validation.errors.push('Datos de documento no proporcionados');
            validation.valid = false;
            return validation;
        }

        // Validaciones requeridas
        const requiredFields = ['empresa', 'actividad', 'fechaPeriodo', 'lugar'];
        for (const field of requiredFields) {
            if (!documentData[field]) {
                validation.warnings.push(`Campo recomendado faltante: ${field}`);
            }
        }

        if (!documentData.sesiones || !Array.isArray(documentData.sesiones)) {
            validation.warnings.push('No se encontraron datos de sesiones');
        }

        return validation;
    }

    /**
     * Optimiza dimensiones de imagen para el documento
     */
    static optimizeImageDimensions(originalWidth, originalHeight, maxWidth = 600, maxHeight = 400) {
        const aspectRatio = originalWidth / originalHeight;
        
        let newWidth = originalWidth;
        let newHeight = originalHeight;
        
        if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
        }
        
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }
        
        return {
            width: Math.round(newWidth),
            height: Math.round(newHeight)
        };
    }

    /**
     * Convierte colores de hex a RGB
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Genera un nombre único para archivo de salida
     */
    static generateUniqueFileName(baseName = 'document', extension = '.docx') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
        return `${nameWithoutExt}_${timestamp}${extension}`;
    }
}

export default DocxGenerator;
