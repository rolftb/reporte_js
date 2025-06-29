/**
 * Librería Consolidada de Analizadores
 * 
 * Unifica todas las funciones de análisis de documentos DOCX en una sola librería.
 * Incluye análisis de headers, imágenes, body y estructura general.
 */

import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { DOMParser } from 'xmldom';

export class ConsolidatedAnalyzer {
    constructor(docxPath, options = {}) {
        this.docxPath = docxPath;
        this.options = {
            outputDir: options.outputDir || './output',
            extractImages: options.extractImages || false,
            logLevel: options.logLevel || 'info',
            ...options
        };
        
        this.zip = null;
        this.parser = new DOMParser();
        this.analysisResults = {};
    }

    /**
     * Inicializa el analizador
     */
    async initialize() {
        try {
            if (!await fs.pathExists(this.docxPath)) {
                throw new Error(`Archivo no encontrado: ${this.docxPath}`);
            }
            
            this.zip = new AdmZip(this.docxPath);
            this.log('info', `Archivo DOCX cargado: ${path.basename(this.docxPath)}`);
            
            return true;
        } catch (error) {
            this.log('error', `Error al inicializar: ${error.message}`);
            throw error;
        }
    }

    /**
     * Análisis completo del documento
     */
    async analyzeComplete() {
        await this.initialize();
        
        this.log('info', '🔍 Iniciando análisis completo del documento...');
        
        const analysis = {
            timestamp: new Date().toISOString(),
            archivo: path.basename(this.docxPath),
            headerDimensions: await this.analyzeHeaderDimensions(),
            imageFormatting: await this.analyzeImageFormatting(),
            bodyPositioning: await this.analyzeBodyPositioning(),
            documentStructure: await this.analyzeDocumentStructure()
        };

        this.analysisResults = analysis;
        return analysis;
    }

    /**
     * Análisis de dimensiones de headers
     */
    async analyzeHeaderDimensions() {
        this.log('info', '📏 Analizando dimensiones de headers...');
        
        const headerAnalysis = {
            headers: [],
            totalImages: 0
        };

        const headerFiles = ['word/header1.xml', 'word/header2.xml'];
        
        for (const headerFile of headerFiles) {
            const headerEntry = this.zip.getEntry(headerFile);
            if (!headerEntry) continue;
            
            const headerXml = headerEntry.getData().toString('utf8');
            const headerDoc = this.parser.parseFromString(headerXml, 'text/xml');
            
            const headerInfo = {
                archivo: headerFile,
                imagenes: []
            };

            const drawings = headerDoc.getElementsByTagName('w:drawing');
            
            for (let i = 0; i < drawings.length; i++) {
                const drawing = drawings[i];
                const extents = drawing.getElementsByTagName('wp:extent');
                const embeds = drawing.getElementsByTagName('a:blip');
                
                if (extents.length > 0 && embeds.length > 0) {
                    const extent = extents[0];
                    const embed = embeds[0];
                    const cx = extent.getAttribute('cx');
                    const cy = extent.getAttribute('cy');
                    const rId = embed.getAttribute('r:embed');

                    const widthPx = Math.round(parseInt(cx) / 914400 * 96);
                    const heightPx = Math.round(parseInt(cy) / 914400 * 96);

                    headerInfo.imagenes.push({
                        relacionId: rId,
                        dimensionesOriginales: { cx, cy },
                        dimensionesPixeles: { width: widthPx, height: heightPx },
                        posicion: i
                    });
                    
                    headerAnalysis.totalImages++;
                }
            }

            headerAnalysis.headers.push(headerInfo);
        }

        return headerAnalysis;
    }

    /**
     * Análisis de formato de imágenes
     */
    async analyzeImageFormatting() {
        this.log('info', '🖼️ Analizando formato de imágenes...');
        
        const imageFormatting = {
            headers: [],
            formatoImagenes: {}
        };

        const headerFiles = ['word/header1.xml', 'word/header2.xml'];
        
        for (const headerFile of headerFiles) {
            const headerEntry = this.zip.getEntry(headerFile);
            if (!headerEntry) continue;
            
            const headerXml = headerEntry.getData().toString('utf8');
            const headerDoc = this.parser.parseFromString(headerXml, 'text/xml');
            
            const headerInfo = {
                archivo: headerFile,
                imagenes: []
            };

            const drawings = headerDoc.getElementsByTagName('w:drawing');
            
            for (let i = 0; i < drawings.length; i++) {
                const drawing = drawings[i];
                const imageInfo = this.extractImageFormattingInfo(drawing, i);
                
                if (imageInfo) {
                    headerInfo.imagenes.push(imageInfo);
                }
            }

            imageFormatting.headers.push(headerInfo);
        }

        return imageFormatting;
    }

    /**
     * Extrae información detallada de formato de imagen
     */
    extractImageFormattingInfo(drawing, index) {
        const imageInfo = {
            indice: index,
            relacionId: null,
            dimensiones: {},
            posicionamiento: {},
            wrapping: {},
            recorte: null
        };

        // Extraer ID de relación
        const embeds = drawing.getElementsByTagName('a:blip');
        if (embeds.length > 0) {
            imageInfo.relacionId = embeds[0].getAttribute('r:embed');
        }

        // Extraer dimensiones
        const extents = drawing.getElementsByTagName('wp:extent');
        if (extents.length > 0) {
            const extent = extents[0];
            const cx = extent.getAttribute('cx');
            const cy = extent.getAttribute('cy');
            
            imageInfo.dimensiones = {
                cx_original: cx,
                cy_original: cy,
                cx_pixels: Math.round(parseInt(cx) / 914400 * 96),
                cy_pixels: Math.round(parseInt(cy) / 914400 * 96)
            };
        }

        // Extraer posicionamiento
        const anchors = drawing.getElementsByTagName('wp:anchor');
        const inlines = drawing.getElementsByTagName('wp:inline');
        
        if (anchors.length > 0) {
            imageInfo.posicionamiento = this.extractAnchorPositioning(anchors[0]);
        } else if (inlines.length > 0) {
            imageInfo.posicionamiento = { tipo: 'inline' };
        }

        // Extraer wrapping
        const wrapSquare = drawing.getElementsByTagName('wp:wrapSquare')[0] ||
                          drawing.getElementsByTagName('wp:wrapNone')[0] ||
                          drawing.getElementsByTagName('wp:wrapTight')[0];
        
        if (wrapSquare) {
            imageInfo.wrapping = {
                tipo: wrapSquare.tagName.replace('wp:wrap', '').toLowerCase(),
                wrapText: wrapSquare.getAttribute('wrapText') || 'bothSides'
            };
        }

        // Extraer información de recorte
        const srcRects = drawing.getElementsByTagName('a:srcRect');
        if (srcRects.length > 0) {
            const srcRect = srcRects[0];
            imageInfo.recorte = {
                l: srcRect.getAttribute('l') || '0',
                t: srcRect.getAttribute('t') || '0',
                r: srcRect.getAttribute('r') || '0',
                b: srcRect.getAttribute('b') || '0'
            };
        }

        return imageInfo;
    }

    /**
     * Extrae información de posicionamiento anchor
     */
    extractAnchorPositioning(anchor) {
        const positioning = {
            tipo: 'anchor',
            horizontal: {},
            vertical: {}
        };

        const positionH = anchor.getElementsByTagName('wp:positionH')[0];
        if (positionH) {
            positioning.horizontal.relativeFrom = positionH.getAttribute('relativeFrom');
            const posOffset = positionH.getElementsByTagName('wp:posOffset')[0];
            const align = positionH.getElementsByTagName('wp:align')[0];
            
            if (posOffset) {
                positioning.horizontal.offset = posOffset.textContent;
            }
            if (align) {
                positioning.horizontal.align = align.textContent;
            }
        }

        const positionV = anchor.getElementsByTagName('wp:positionV')[0];
        if (positionV) {
            positioning.vertical.relativeFrom = positionV.getAttribute('relativeFrom');
            const posOffset = positionV.getElementsByTagName('wp:posOffset')[0];
            const align = positionV.getElementsByTagName('wp:align')[0];
            
            if (posOffset) {
                positioning.vertical.offset = posOffset.textContent;
            }
            if (align) {
                positioning.vertical.align = align.textContent;
            }
        }

        return positioning;
    }

    /**
     * Análisis de posicionamiento del body
     */
    async analyzeBodyPositioning() {
        this.log('info', '📐 Analizando posicionamiento del body...');
        
        const bodyAnalysis = {
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
            bodyAnalysis.tablas.push(tableInfo);
        }

        // Analizar imágenes del body
        const drawings = documentDoc.getElementsByTagName('w:drawing');
        for (let i = 0; i < drawings.length; i++) {
            const drawing = drawings[i];
            const imageInfo = this.extractBodyImageInfo(drawing, i);
            if (imageInfo) {
                bodyAnalysis.imagenes.push(imageInfo);
            }
        }

        // Analizar párrafos
        const paragraphs = documentDoc.getElementsByTagName('w:p');
        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            const paragraphInfo = this.extractParagraphInfo(paragraph, i);
            bodyAnalysis.parrafos.push(paragraphInfo);
        }

        return bodyAnalysis;
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

        // Propiedades de la tabla
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
     * Extrae texto de celda
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
     * Extrae propiedades de celda
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
     * Extrae información de imágenes del body
     */
    extractBodyImageInfo(drawing, index) {
        const embeds = drawing.getElementsByTagName('a:blip');
        if (embeds.length === 0) return null;

        const imageInfo = {
            indice: index,
            relacionId: embeds[0].getAttribute('r:embed'),
            posicionamiento: {}
        };

        const anchors = drawing.getElementsByTagName('wp:anchor');
        const inlines = drawing.getElementsByTagName('wp:inline');

        if (anchors.length > 0) {
            imageInfo.posicionamiento = this.extractAnchorPositioning(anchors[0]);
        } else if (inlines.length > 0) {
            imageInfo.posicionamiento = { tipo: 'inline' };
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

        // Verificar dibujos
        const drawings = paragraph.getElementsByTagName('w:drawing');
        paragraphInfo.contieneDibujo = drawings.length > 0;

        // Propiedades del párrafo
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
     * Análisis de estructura del documento
     */
    async analyzeDocumentStructure() {
        this.log('info', '🏗️ Analizando estructura del documento...');
        
        const structure = {
            seccionesTotal: 0,
            paginasAproximadas: 0,
            saltosPagina: [],
            elementosContados: {
                tablas: 0,
                imagenes: 0,
                parrafos: 0
            }
        };

        const documentEntry = this.zip.getEntry('word/document.xml');
        const documentXml = documentEntry.getData().toString('utf8');
        const documentDoc = this.parser.parseFromString(documentXml, 'text/xml');

        // Contar elementos
        structure.elementosContados.tablas = documentDoc.getElementsByTagName('w:tbl').length;
        structure.elementosContados.imagenes = documentDoc.getElementsByTagName('w:drawing').length;
        structure.elementosContados.parrafos = documentDoc.getElementsByTagName('w:p').length;

        // Saltos de página
        const pageBreaks = documentDoc.getElementsByTagName('w:br');
        for (let i = 0; i < pageBreaks.length; i++) {
            const br = pageBreaks[i];
            if (br.getAttribute('w:type') === 'page') {
                structure.saltosPagina.push(i);
            }
        }

        structure.paginasAproximadas = structure.saltosPagina.length + 1;

        // Secciones
        const sectPrs = documentDoc.getElementsByTagName('w:sectPr');
        structure.seccionesTotal = sectPrs.length;

        return structure;
    }

    /**
     * Guarda todos los resultados de análisis
     */
    async saveAnalysisResults(prefix = 'consolidated_analysis') {
        try {
            await fs.ensureDir(this.options.outputDir);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `${prefix}_${timestamp}.json`;
            const filePath = path.join(this.options.outputDir, fileName);
            
            await fs.writeJson(filePath, this.analysisResults, { spaces: 2 });
            this.log('info', `Análisis guardado en: ${filePath}`);
            
            return filePath;
        } catch (error) {
            this.log('error', `Error al guardar análisis: ${error.message}`);
            throw error;
        }
    }

    /**
     * Muestra resumen de análisis
     */
    showAnalysisSummary() {
        console.log('\n📊 RESUMEN DE ANÁLISIS CONSOLIDADO');
        console.log('='.repeat(60));
        
        if (!this.analysisResults.headerDimensions) {
            console.log('⚠️ No hay resultados de análisis disponibles');
            return;
        }

        const { headerDimensions, imageFormatting, bodyPositioning, documentStructure } = this.analysisResults;

        console.log(`📄 Archivo: ${this.analysisResults.archivo}`);
        console.log(`📅 Fecha: ${this.analysisResults.timestamp}`);
        
        console.log('\n🖼️ Headers:');
        console.log(`  • Total headers: ${headerDimensions.headers.length}`);
        console.log(`  • Total imágenes: ${headerDimensions.totalImages}`);
        
        console.log('\n📐 Body:');
        console.log(`  • Tablas: ${bodyPositioning.tablas.length}`);
        console.log(`  • Imágenes: ${bodyPositioning.imagenes.length}`);
        console.log(`  • Párrafos: ${bodyPositioning.parrafos.length}`);
        
        console.log('\n🏗️ Estructura:');
        console.log(`  • Páginas aproximadas: ${documentStructure.paginasAproximadas}`);
        console.log(`  • Saltos de página: ${documentStructure.saltosPagina.length}`);
        console.log(`  • Secciones: ${documentStructure.seccionesTotal}`);
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
            console.log(`${emoji[level] || 'ℹ️'} [ANALYZER] ${message}`);
        }
    }
}

export default ConsolidatedAnalyzer;
