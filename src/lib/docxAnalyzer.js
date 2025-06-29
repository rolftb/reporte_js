/**
 * Librería Unificada de Análisis de Documentos DOCX
 * 
 * Esta librería contiene todas las funciones necesarias para analizar
 * documentos DOCX, extraer información de estructura, formateo, posicionamiento
 * e imágenes de headers y body.
 * 
 * @version 1.0.0
 * @author PUMA Analysis System
 */

import AdmZip from 'adm-zip';
import { DOMParser } from 'xmldom';
import fs from 'fs-extra';
import path from 'path';

/**
 * Clase principal para análisis de documentos DOCX
 */
export class DocxAnalyzer {
    constructor(docxPath) {
        this.docxPath = docxPath;
        this.zip = null;
        this.parser = new DOMParser();
        this.results = {
            fecha: new Date().toISOString(),
            archivo: path.basename(docxPath),
            headers: [],
            body: {},
            imagenes: {},
            estructura: {}
        };
    }

    /**
     * Inicializa el analizador cargando el archivo DOCX
     */
    async initialize() {
        try {
            if (!await fs.pathExists(this.docxPath)) {
                throw new Error(`Archivo no encontrado: ${this.docxPath}`);
            }
            this.zip = new AdmZip(this.docxPath);
            console.log(`✅ Archivo DOCX cargado: ${path.basename(this.docxPath)}`);
        } catch (error) {
            console.error('❌ Error al cargar archivo DOCX:', error);
            throw error;
        }
    }

    /**
     * Análisis completo del documento
     */
    async analyzeComplete() {
        await this.initialize();
        
        const analysis = {
            headerDimensions: await this.analyzeHeaderDimensions(),
            imageFormatting: await this.analyzeImageFormatting(),
            bodyPositioning: await this.analyzeBodyPositioning(),
            documentStructure: await this.analyzeDocumentStructure()
        };

        return analysis;
    }

    /**
     * Analiza las dimensiones de las imágenes en headers
     */
    async analyzeHeaderDimensions() {
        console.log('🔍 Analizando dimensiones de headers...');
        
        const headerAnalysis = {
            headers: [],
            dimensiones: {}
        };

        // Analizar header1.xml y header2.xml
        const headerFiles = ['word/header1.xml', 'word/header2.xml'];
        
        for (let i = 0; i < headerFiles.length; i++) {
            const headerFile = headerFiles[i];
            const headerEntry = this.zip.getEntry(headerFile);
            
            if (!headerEntry) continue;
            
            const headerXml = headerEntry.getData().toString('utf8');
            const headerDoc = this.parser.parseFromString(headerXml, 'text/xml');
            
            const headerInfo = {
                archivo: headerFile,
                imagenes: [],
                dimensiones: {}
            };

            // Buscar elementos de imagen con dimensiones
            const drawings = headerDoc.getElementsByTagName('w:drawing');
            
            for (let j = 0; j < drawings.length; j++) {
                const drawing = drawings[j];
                const extents = drawing.getElementsByTagName('wp:extent');
                const embeds = drawing.getElementsByTagName('a:blip');
                
                if (extents.length > 0 && embeds.length > 0) {
                    const extent = extents[0];
                    const embed = embeds[0];
                    const cx = extent.getAttribute('cx'); // ancho en EMUs
                    const cy = extent.getAttribute('cy'); // alto en EMUs
                    const rId = embed.getAttribute('r:embed');

                    // Convertir EMUs a píxeles (1 EMU = 1/914400 inch, 1 inch = 96 px)
                    const widthPx = Math.round(parseInt(cx) / 914400 * 96);
                    const heightPx = Math.round(parseInt(cy) / 914400 * 96);

                    const imageInfo = {
                        relacionId: rId,
                        dimensionesOriginales: { cx, cy },
                        dimensionesPixeles: { width: widthPx, height: heightPx },
                        posicion: j
                    };

                    headerInfo.imagenes.push(imageInfo);
                }
            }

            headerAnalysis.headers.push(headerInfo);
        }

        return headerAnalysis;
    }

    /**
     * Analiza el formateo y posicionamiento de imágenes
     */
    async analyzeImageFormatting() {
        console.log('🔍 Analizando formateo de imágenes...');
        
        const imageFormatting = {
            headers: [],
            formatoImagenes: {},
            posicionamiento: {}
        };

        const headerFiles = ['word/header1.xml', 'word/header2.xml'];
        
        for (let i = 0; i < headerFiles.length; i++) {
            const headerFile = headerFiles[i];
            const headerEntry = this.zip.getEntry(headerFile);
            
            if (!headerEntry) continue;
            
            const headerXml = headerEntry.getData().toString('utf8');
            const headerDoc = this.parser.parseFromString(headerXml, 'text/xml');
            
            const headerInfo = {
                archivo: headerFile,
                imagenes: [],
                formateo: {}
            };

            // Analizar elementos de drawing
            const drawings = headerDoc.getElementsByTagName('w:drawing');
            
            for (let j = 0; j < drawings.length; j++) {
                const drawing = drawings[j];
                
                // Extraer información de posicionamiento
                const anchors = drawing.getElementsByTagName('wp:anchor');
                const inlines = drawing.getElementsByTagName('wp:inline');
                
                let positionInfo = {};
                
                if (anchors.length > 0) {
                    const anchor = anchors[0];
                    positionInfo = this.extractAnchorPositioning(anchor);
                } else if (inlines.length > 0) {
                    positionInfo = { type: 'inline' };
                }

                // Extraer información de la imagen
                const embeds = drawing.getElementsByTagName('a:blip');
                if (embeds.length > 0) {
                    const embed = embeds[0];
                    const rId = embed.getAttribute('r:embed');
                    
                    const imageInfo = {
                        relacionId: rId,
                        posicionamiento: positionInfo,
                        indice: j
                    };
                    
                    headerInfo.imagenes.push(imageInfo);
                }
            }

            imageFormatting.headers.push(headerInfo);
        }

        return imageFormatting;
    }

    /**
     * Extrae información de posicionamiento de elementos anchor
     */
    extractAnchorPositioning(anchor) {
        const positioning = {
            type: 'anchor',
            horizontal: {},
            vertical: {},
            wrapping: {},
            extent: {}
        };

        // Posicionamiento horizontal
        const positionH = anchor.getElementsByTagName('wp:positionH')[0];
        if (positionH) {
            positioning.horizontal.relativeFrom = positionH.getAttribute('relativeFrom');
            const posOffset = positionH.getElementsByTagName('wp:posOffset')[0];
            if (posOffset) {
                positioning.horizontal.offset = posOffset.textContent;
            }
        }

        // Posicionamiento vertical
        const positionV = anchor.getElementsByTagName('wp:positionV')[0];
        if (positionV) {
            positioning.vertical.relativeFrom = positionV.getAttribute('relativeFrom');
            const posOffset = positionV.getElementsByTagName('wp:posOffset')[0];
            if (posOffset) {
                positioning.vertical.offset = posOffset.textContent;
            }
        }

        // Información de wrapping
        const wrapSquare = anchor.getElementsByTagName('wp:wrapSquare')[0];
        if (wrapSquare) {
            positioning.wrapping = {
                type: 'square',
                wrapText: wrapSquare.getAttribute('wrapText') || 'bothSides'
            };
        }

        // Extent (dimensiones)
        const extent = anchor.getElementsByTagName('wp:extent')[0];
        if (extent) {
            positioning.extent = {
                cx: extent.getAttribute('cx'),
                cy: extent.getAttribute('cy')
            };
        }

        return positioning;
    }

    /**
     * Analiza el posicionamiento de elementos en el body
     */
    async analyzeBodyPositioning() {
        console.log('🔍 Analizando posicionamiento del body...');
        
        const bodyPositioning = {
            tablas: [],
            imagenes: [],
            parrafos: [],
            estructura: {}
        };

        const documentEntry = this.zip.getEntry('word/document.xml');
        if (!documentEntry) {
            throw new Error('No se encontró document.xml');
        }

        const documentXml = documentEntry.getData().toString('utf8');
        const documentDoc = this.parser.parseFromString(documentXml, 'text/xml');

        // Analizar tablas
        const tables = documentDoc.getElementsByTagName('w:tbl');
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const tableInfo = this.extractTableInfo(table, i);
            bodyPositioning.tablas.push(tableInfo);
        }

        // Analizar imágenes en el body
        const drawings = documentDoc.getElementsByTagName('w:drawing');
        for (let i = 0; i < drawings.length; i++) {
            const drawing = drawings[i];
            const imageInfo = this.extractBodyImageInfo(drawing, i);
            if (imageInfo) {
                bodyPositioning.imagenes.push(imageInfo);
            }
        }

        // Analizar párrafos
        const paragraphs = documentDoc.getElementsByTagName('w:p');
        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            const paragraphInfo = this.extractParagraphInfo(paragraph, i);
            bodyPositioning.parrafos.push(paragraphInfo);
        }

        return bodyPositioning;
    }

    /**
     * Extrae información de tablas
     */
    extractTableInfo(table, index) {
        const tableInfo = {
            indice: index,
            filas: [],
            propiedades: {}
        };

        // Extraer propiedades de la tabla
        const tblPr = table.getElementsByTagName('w:tblPr')[0];
        if (tblPr) {
            const tblW = tblPr.getElementsByTagName('w:tblW')[0];
            if (tblW) {
                tableInfo.propiedades.ancho = {
                    type: tblW.getAttribute('w:type'),
                    w: tblW.getAttribute('w:w')
                };
            }
        }

        // Extraer filas
        const rows = table.getElementsByTagName('w:tr');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowInfo = {
                indice: i,
                celdas: []
            };

            const cells = row.getElementsByTagName('w:tc');
            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                const cellInfo = {
                    indice: j,
                    texto: this.extractCellText(cell),
                    propiedades: this.extractCellProperties(cell)
                };
                rowInfo.celdas.push(cellInfo);
            }

            tableInfo.filas.push(rowInfo);
        }

        return tableInfo;
    }

    /**
     * Extrae texto de una celda
     */
    extractCellText(cell) {
        const texts = cell.getElementsByTagName('w:t');
        let cellText = '';
        for (let i = 0; i < texts.length; i++) {
            cellText += texts[i].textContent;
        }
        return cellText.trim();
    }

    /**
     * Extrae propiedades de una celda
     */
    extractCellProperties(cell) {
        const properties = {};
        
        const tcPr = cell.getElementsByTagName('w:tcPr')[0];
        if (tcPr) {
            const tcW = tcPr.getElementsByTagName('w:tcW')[0];
            if (tcW) {
                properties.ancho = {
                    type: tcW.getAttribute('w:type'),
                    w: tcW.getAttribute('w:w')
                };
            }

            const shd = tcPr.getElementsByTagName('w:shd')[0];
            if (shd) {
                properties.sombreado = {
                    val: shd.getAttribute('w:val'),
                    color: shd.getAttribute('w:color'),
                    fill: shd.getAttribute('w:fill')
                };
            }
        }

        return properties;
    }

    /**
     * Extrae información de imágenes en el body
     */
    extractBodyImageInfo(drawing, index) {
        const embeds = drawing.getElementsByTagName('a:blip');
        if (embeds.length === 0) return null;

        const embed = embeds[0];
        const rId = embed.getAttribute('r:embed');

        const imageInfo = {
            indice: index,
            relacionId: rId,
            posicionamiento: {}
        };

        // Verificar si es anchor o inline
        const anchors = drawing.getElementsByTagName('wp:anchor');
        const inlines = drawing.getElementsByTagName('wp:inline');

        if (anchors.length > 0) {
            imageInfo.posicionamiento = this.extractAnchorPositioning(anchors[0]);
        } else if (inlines.length > 0) {
            imageInfo.posicionamiento = { type: 'inline' };
            const extent = inlines[0].getElementsByTagName('wp:extent')[0];
            if (extent) {
                imageInfo.posicionamiento.extent = {
                    cx: extent.getAttribute('cx'),
                    cy: extent.getAttribute('cy')
                };
            }
        }

        return imageInfo;
    }

    /**
     * Extrae información de párrafos
     */
    extractParagraphInfo(paragraph, index) {
        const paragraphInfo = {
            indice: index,
            texto: '',
            propiedades: {},
            contieneDibujo: false
        };

        // Extraer texto
        const texts = paragraph.getElementsByTagName('w:t');
        for (let i = 0; i < texts.length; i++) {
            paragraphInfo.texto += texts[i].textContent;
        }
        paragraphInfo.texto = paragraphInfo.texto.trim();

        // Verificar si contiene dibujos
        const drawings = paragraph.getElementsByTagName('w:drawing');
        paragraphInfo.contieneDibujo = drawings.length > 0;

        // Extraer propiedades del párrafo
        const pPr = paragraph.getElementsByTagName('w:pPr')[0];
        if (pPr) {
            const jc = pPr.getElementsByTagName('w:jc')[0];
            if (jc) {
                paragraphInfo.propiedades.alineacion = jc.getAttribute('w:val');
            }
        }

        return paragraphInfo;
    }

    /**
     * Analiza la estructura general del documento
     */
    async analyzeDocumentStructure() {
        console.log('🔍 Analizando estructura del documento...');
        
        const structure = {
            seccionesTotal: 0,
            paginasAproximadas: 0,
            elementosPorPagina: [],
            saltosPagina: []
        };

        const documentEntry = this.zip.getEntry('word/document.xml');
        if (!documentEntry) {
            throw new Error('No se encontró document.xml');
        }

        const documentXml = documentEntry.getData().toString('utf8');
        const documentDoc = this.parser.parseFromString(documentXml, 'text/xml');

        // Contar saltos de página
        const pageBreaks = documentDoc.getElementsByTagName('w:br');
        for (let i = 0; i < pageBreaks.length; i++) {
            const br = pageBreaks[i];
            if (br.getAttribute('w:type') === 'page') {
                structure.saltosPagina.push(i);
            }
        }

        // Analizar secciones
        const sectPrs = documentDoc.getElementsByTagName('w:sectPr');
        structure.seccionesTotal = sectPrs.length;

        return structure;
    }

    /**
     * Guarda los resultados del análisis
     */
    async saveResults(outputPath = './output') {
        try {
            await fs.ensureDir(outputPath);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `unified_analysis_${timestamp}.json`;
            const filePath = path.join(outputPath, fileName);
            
            await fs.writeJson(filePath, this.results, { spaces: 2 });
            console.log(`✅ Resultados guardados en: ${filePath}`);
            
            return filePath;
        } catch (error) {
            console.error('❌ Error al guardar resultados:', error);
            throw error;
        }
    }
}

/**
 * Funciones de utilidad para análisis
 */
export class AnalysisUtils {
    /**
     * Convierte EMUs a píxeles
     */
    static emuToPixels(emu) {
        return Math.round(parseInt(emu) / 914400 * 96);
    }

    /**
     * Convierte píxeles a EMUs
     */
    static pixelsToEmu(pixels) {
        return Math.round(pixels * 914400 / 96);
    }

    /**
     * Convierte EMUs a puntos
     */
    static emuToPoints(emu) {
        return Math.round(parseInt(emu) / 12700);
    }

    /**
     * Formatea resultados para mostrar en consola
     */
    static formatResultsForDisplay(results) {
        const formatted = {
            resumen: {
                archivo: results.archivo,
                fecha: results.fecha,
                totalHeaders: results.headers?.length || 0,
                totalImagenes: Object.keys(results.imagenes || {}).length,
                estructuraCompleta: !!results.estructura
            },
            detalles: results
        };

        return formatted;
    }

    /**
     * Valida la integridad de los resultados del análisis
     */
    static validateAnalysisResults(results) {
        const validation = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!results.archivo) {
            validation.errors.push('Falta información del archivo');
            validation.valid = false;
        }

        if (!results.fecha) {
            validation.errors.push('Falta fecha del análisis');
            validation.valid = false;
        }

        if (!results.headers || results.headers.length === 0) {
            validation.warnings.push('No se encontraron headers en el análisis');
        }

        return validation;
    }
}

export default DocxAnalyzer;
