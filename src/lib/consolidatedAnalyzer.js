/**
 * Librería Consolidada de Analizadores Avanzada
 * 
 * Unifica todas las funciones de análisis de documentos DOCX con análisis detallado.
 * Incluye análisis exhaustivo de headers, imágenes, body, estructura, estilos, y metadatos.
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
            extractImages: options.extractImages || true,
            extractText: options.extractText || true,
            analyzeStyles: options.analyzeStyles || true,
            analyzeMetadata: options.analyzeMetadata || true,
            analyzeRelationships: options.analyzeRelationships || true,
            logLevel: options.logLevel || 'info',
            ...options
        };
        
        this.zip = null;
        this.parser = new DOMParser();
        this.analysisResults = {};
        this.documentParts = {};
    }

    /**
     * Inicializa el analizador y carga todas las partes del documento
     */
    async initialize() {
        try {
            if (!await fs.pathExists(this.docxPath)) {
                throw new Error(`Archivo no encontrado: ${this.docxPath}`);
            }
            
            this.zip = new AdmZip(this.docxPath);
            this.log('info', `Archivo DOCX cargado: ${path.basename(this.docxPath)}`);
            
            // Cargar todas las partes del documento
            await this.loadDocumentParts();
            
            return true;
        } catch (error) {
            this.log('error', `Error al inicializar: ${error.message}`);
            throw error;
        }
    }

    /**
     * Carga todas las partes del documento DOCX
     */
    async loadDocumentParts() {
        this.log('info', '📄 Cargando partes del documento...');
        
        const partFiles = [
            'word/document.xml',
            'word/header1.xml',
            'word/header2.xml',
            'word/footer1.xml',
            'word/footer2.xml',
            'word/styles.xml',
            'word/numbering.xml',
            'word/settings.xml',
            'word/fontTable.xml',
            'word/theme/theme1.xml',
            '[Content_Types].xml',
            'docProps/core.xml',
            'docProps/app.xml',
            'docProps/custom.xml',
            'word/_rels/document.xml.rels'
        ];

        for (const partFile of partFiles) {
            const entry = this.zip.getEntry(partFile);
            if (entry) {
                this.documentParts[partFile] = {
                    content: entry.getData().toString('utf8'),
                    size: entry.header.size,
                    compressedSize: entry.header.compressedSize
                };
                this.log('debug', `Cargado: ${partFile} (${entry.header.size} bytes)`);
            }
        }

        // Cargar imágenes si está habilitado
        if (this.options.extractImages) {
            await this.loadMediaFiles();
        }
    }

    /**
     * Carga archivos de medios (imágenes)
     */
    async loadMediaFiles() {
        const entries = this.zip.getEntries();
        this.documentParts.media = {};
        
        entries.forEach(entry => {
            if (entry.entryName.startsWith('word/media/')) {
                this.documentParts.media[entry.entryName] = {
                    name: entry.entryName,
                    size: entry.header.size,
                    compressedSize: entry.header.compressedSize,
                    type: this.getMediaType(entry.entryName)
                };
            }
        });
        
        this.log('info', `📷 Encontrados ${Object.keys(this.documentParts.media).length} archivos de medios`);
    }

    /**
     * Análisis completo y detallado del documento
     */
    async analyzeComplete() {
        await this.initialize();
        
        this.log('info', '🔍 Iniciando análisis completo y detallado del documento...');
        
        const analysis = {
            timestamp: new Date().toISOString(),
            archivo: path.basename(this.docxPath),
            tamaño: await this.getFileSize(),
            
            // Metadatos del documento
            metadata: this.options.analyzeMetadata ? await this.analyzeMetadata() : null,
            
            // Estructura del documento
            structure: await this.analyzeDocumentStructure(),
            
            // Análisis de headers y footers
            headers: await this.analyzeHeaders(),
            footers: await this.analyzeFooters(),
            
            // Análisis de contenido del body
            body: await this.analyzeBodyContent(),
            
            // Análisis de imágenes detallado
            images: await this.analyzeImagesDetailed(),
            
            // Análisis de tablas
            tables: await this.analyzeTables(),
            
            // Análisis de estilos
            styles: this.options.analyzeStyles ? await this.analyzeStyles() : null,
            
            // Análisis de relaciones
            relationships: this.options.analyzeRelationships ? await this.analyzeRelationships() : null,
            
            // Configuración de página
            pageSetup: await this.analyzePageSetup(),
            
            // Estadísticas del texto
            textStats: this.options.extractText ? await this.analyzeTextStatistics() : null
        };

        this.analysisResults = analysis;
        await this.saveResults(analysis, 'complete_analysis');
        return analysis;
    }

    /**
     * Obtiene el tamaño del archivo
     */
    async getFileSize() {
        const stats = await fs.stat(this.docxPath);
        return {
            bytes: stats.size,
            kb: Math.round(stats.size / 1024 * 100) / 100,
            mb: Math.round(stats.size / (1024 * 1024) * 100) / 100
        };
    }

    /**
     * Determina el tipo de archivo de medios
     */
    getMediaType(fileName) {
        const ext = path.extname(fileName).toLowerCase();
        const typeMap = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.tiff': 'image/tiff',
            '.wmf': 'image/wmf',
            '.emf': 'image/emf'
        };
        return typeMap[ext] || 'unknown';
    }

    /**
     * Análisis detallado de metadatos
     */
    async analyzeMetadata() {
        this.log('info', '📋 Analizando metadatos del documento...');
        
        const metadata = {
            core: {},
            app: {},
            custom: {}
        };

        // Metadatos principales (core.xml)
        if (this.documentParts['docProps/core.xml']) {
            const coreDoc = this.parser.parseFromString(this.documentParts['docProps/core.xml'].content, 'text/xml');
            metadata.core = {
                title: this.getElementText(coreDoc, 'dc:title'),
                subject: this.getElementText(coreDoc, 'dc:subject'),
                creator: this.getElementText(coreDoc, 'dc:creator'),
                keywords: this.getElementText(coreDoc, 'cp:keywords'),
                description: this.getElementText(coreDoc, 'dc:description'),
                lastModifiedBy: this.getElementText(coreDoc, 'cp:lastModifiedBy'),
                created: this.getElementText(coreDoc, 'dcterms:created'),
                modified: this.getElementText(coreDoc, 'dcterms:modified'),
                category: this.getElementText(coreDoc, 'cp:category'),
                contentStatus: this.getElementText(coreDoc, 'cp:contentStatus')
            };
        }

        // Propiedades de aplicación (app.xml)
        if (this.documentParts['docProps/app.xml']) {
            const appDoc = this.parser.parseFromString(this.documentParts['docProps/app.xml'].content, 'text/xml');
            metadata.app = {
                application: this.getElementText(appDoc, 'Application'),
                docSecurity: this.getElementText(appDoc, 'DocSecurity'),
                scaleCrop: this.getElementText(appDoc, 'ScaleCrop'),
                manager: this.getElementText(appDoc, 'Manager'),
                company: this.getElementText(appDoc, 'Company'),
                totalTime: this.getElementText(appDoc, 'TotalTime'),
                pages: this.getElementText(appDoc, 'Pages'),
                words: this.getElementText(appDoc, 'Words'),
                characters: this.getElementText(appDoc, 'Characters'),
                charactersWithSpaces: this.getElementText(appDoc, 'CharactersWithSpaces'),
                lines: this.getElementText(appDoc, 'Lines'),
                paragraphs: this.getElementText(appDoc, 'Paragraphs'),
                version: this.getElementText(appDoc, 'AppVersion')
            };
        }

        return metadata;
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
     * Análisis detallado de la estructura del documento
     */
    async analyzeDocumentStructure() {
        this.log('info', '🏗️ Analizando estructura del documento...');
        
        const structure = {
            partes: Object.keys(this.documentParts).length,
            archivosPresentes: Object.keys(this.documentParts),
            tamañoTotal: 0,
            compresionTotal: 0
        };

        // Calcular tamaños
        Object.values(this.documentParts).forEach(part => {
            if (part.size) {
                structure.tamañoTotal += part.size;
                structure.compresionTotal += part.compressedSize || 0;
            }
        });

        structure.ratioCompresion = structure.tamañoTotal > 0 
            ? Math.round((structure.compresionTotal / structure.tamañoTotal) * 100) / 100 
            : 0;

        return structure;
    }

    /**
     * Análisis detallado de headers
     */
    async analyzeHeaders() {
        this.log('info', '📄 Analizando headers detalladamente...');
        
        const headers = [];
        const headerFiles = ['word/header1.xml', 'word/header2.xml'];
        
        for (const headerFile of headerFiles) {
            if (!this.documentParts[headerFile]) continue;
            
            const headerDoc = this.parser.parseFromString(this.documentParts[headerFile].content, 'text/xml');
            
            const headerInfo = {
                archivo: headerFile,
                tamaño: this.documentParts[headerFile].size,
                imagenes: [],
                texto: this.extractTextFromElement(headerDoc),
                parrafos: headerDoc.getElementsByTagName('w:p').length,
                tablas: headerDoc.getElementsByTagName('w:tbl').length,
                drawing: headerDoc.getElementsByTagName('w:drawing').length
            };

            // Analizar imágenes en detalle
            const drawings = headerDoc.getElementsByTagName('w:drawing');
            for (let i = 0; i < drawings.length; i++) {
                const imageInfo = await this.analyzeImageInDrawing(drawings[i], headerFile);
                if (imageInfo) {
                    headerInfo.imagenes.push(imageInfo);
                }
            }

            headers.push(headerInfo);
        }
        
        return headers;
    }

    /**
     * Análisis detallado de tablas
     */
    async analyzeTables() {
        this.log('info', '📊 Analizando tablas...');
        
        const tablesInfo = {
            totalTablas: 0,
            tablasEnHeaders: 0,
            tablasEnBody: 0,
            detallesTablas: []
        };

        // Analizar tablas en headers
        const headerFiles = ['word/header1.xml', 'word/header2.xml'];
        for (const headerFile of headerFiles) {
            if (!this.documentParts[headerFile]) continue;
            
            const headerDoc = this.parser.parseFromString(this.documentParts[headerFile].content, 'text/xml');
            const tables = headerDoc.getElementsByTagName('w:tbl');
            
            for (let i = 0; i < tables.length; i++) {
                const tableInfo = this.analyzeTableStructure(tables[i], headerFile);
                tablesInfo.detallesTablas.push(tableInfo);
                tablesInfo.tablasEnHeaders++;
            }
        }

        // Analizar tablas en body
        if (this.documentParts['word/document.xml']) {
            const bodyDoc = this.parser.parseFromString(this.documentParts['word/document.xml'].content, 'text/xml');
            const tables = bodyDoc.getElementsByTagName('w:tbl');
            
            for (let i = 0; i < tables.length; i++) {
                const tableInfo = this.analyzeTableStructure(tables[i], 'word/document.xml');
                tablesInfo.detallesTablas.push(tableInfo);
                tablesInfo.tablasEnBody++;
            }
        }

        tablesInfo.totalTablas = tablesInfo.tablasEnHeaders + tablesInfo.tablasEnBody;
        
        return tablesInfo;
    }

    /**
     * Análisis de estilos del documento
     */
    async analyzeStyles() {
        this.log('info', '🎨 Analizando estilos...');
        
        if (!this.documentParts['word/styles.xml']) {
            return null;
        }

        const stylesDoc = this.parser.parseFromString(this.documentParts['word/styles.xml'].content, 'text/xml');
        
        const stylesInfo = {
            totalEstilos: stylesDoc.getElementsByTagName('w:style').length,
            estilosParrafo: 0,
            estilosCaracter: 0,
            estilosTabla: 0,
            estilosNumeracion: 0,
            estilosPersonalizados: [],
            fuentesPorDefecto: {}
        };

        const styles = stylesDoc.getElementsByTagName('w:style');
        for (let i = 0; i < styles.length; i++) {
            const style = styles[i];
            const type = style.getAttribute('w:type');
            const styleId = style.getAttribute('w:styleId');
            const name = this.getElementText(style, 'w:name');
            
            switch (type) {
                case 'paragraph':
                    stylesInfo.estilosParrafo++;
                    break;
                case 'character':
                    stylesInfo.estilosCaracter++;
                    break;
                case 'table':
                    stylesInfo.estilosTabla++;
                    break;
                case 'numbering':
                    stylesInfo.estilosNumeracion++;
                    break;
            }

            if (style.getAttribute('w:customStyle') === '1') {
                stylesInfo.estilosPersonalizados.push({
                    id: styleId,
                    nombre: name,
                    tipo: type
                });
            }
        }

        // Analizar fuentes por defecto
        const docDefaults = stylesDoc.getElementsByTagName('w:docDefaults')[0];
        if (docDefaults) {
            const runDefaults = docDefaults.getElementsByTagName('w:rPrDefault')[0];
            if (runDefaults) {
                const font = runDefaults.getElementsByTagName('w:rFonts')[0];
                if (font) {
                    stylesInfo.fuentesPorDefecto = {
                        ascii: font.getAttribute('w:ascii'),
                        hAnsi: font.getAttribute('w:hAnsi'),
                        eastAsia: font.getAttribute('w:eastAsia'),
                        cs: font.getAttribute('w:cs')
                    };
                }
            }
        }

        return stylesInfo;
    }

    /**
     * Análisis de relaciones del documento
     */
    async analyzeRelationships() {
        this.log('info', '🔗 Analizando relaciones...');
        
        if (!this.documentParts['word/_rels/document.xml.rels']) {
            return null;
        }

        const relsDoc = this.parser.parseFromString(this.documentParts['word/_rels/document.xml.rels'].content, 'text/xml');
        
        const relationships = {
            totalRelaciones: 0,
            tiposRelacion: {},
            archivosVinculados: []
        };

        const rels = relsDoc.getElementsByTagName('Relationship');
        for (let i = 0; i < rels.length; i++) {
            const rel = rels[i];
            const type = rel.getAttribute('Type').split('/').pop();
            const target = rel.getAttribute('Target');
            const id = rel.getAttribute('Id');

            relationships.totalRelaciones++;
            
            if (!relationships.tiposRelacion[type]) {
                relationships.tiposRelacion[type] = 0;
            }
            relationships.tiposRelacion[type]++;

            relationships.archivosVinculados.push({
                id: id,
                tipo: type,
                objetivo: target
            });
        }

        return relationships;
    }

    /**
     * Análisis de configuración de página
     */
    async analyzePageSetup() {
        this.log('info', '📄 Analizando configuración de página...');
        
        if (!this.documentParts['word/document.xml']) {
            return null;
        }

        const bodyDoc = this.parser.parseFromString(this.documentParts['word/document.xml'].content, 'text/xml');
        const sectPr = bodyDoc.getElementsByTagName('w:sectPr')[0];
        
        if (!sectPr) return null;

        const pageSetup = {
            tamaño: {},
            margenes: {},
            orientacion: 'portrait',
            columnas: 1,
            headers: {},
            footers: {}
        };

        // Tamaño de página
        const pgSz = sectPr.getElementsByTagName('w:pgSz')[0];
        if (pgSz) {
            pageSetup.tamaño = {
                ancho: parseInt(pgSz.getAttribute('w:w')) || 0,
                alto: parseInt(pgSz.getAttribute('w:h')) || 0,
                orientacion: pgSz.getAttribute('w:orient') || 'portrait'
            };
            pageSetup.orientacion = pageSetup.tamaño.orientacion;
        }

        // Márgenes
        const pgMar = sectPr.getElementsByTagName('w:pgMar')[0];
        if (pgMar) {
            pageSetup.margenes = {
                superior: parseInt(pgMar.getAttribute('w:top')) || 0,
                inferior: parseInt(pgMar.getAttribute('w:bottom')) || 0,
                izquierdo: parseInt(pgMar.getAttribute('w:left')) || 0,
                derecho: parseInt(pgMar.getAttribute('w:right')) || 0,
                encabezado: parseInt(pgMar.getAttribute('w:header')) || 0,
                piePagina: parseInt(pgMar.getAttribute('w:footer')) || 0
            };
        }

        // Referencias a headers y footers
        const headerRefs = sectPr.getElementsByTagName('w:headerReference');
        const footerRefs = sectPr.getElementsByTagName('w:footerReference');
        
        for (let i = 0; i < headerRefs.length; i++) {
            const ref = headerRefs[i];
            pageSetup.headers[ref.getAttribute('w:type')] = ref.getAttribute('r:id');
        }
        
        for (let i = 0; i < footerRefs.length; i++) {
            const ref = footerRefs[i];
            pageSetup.footers[ref.getAttribute('w:type')] = ref.getAttribute('r:id');
        }

        return pageSetup;
    }

    /**
     * Análisis de estadísticas de texto
     */
    async analyzeTextStatistics() {
        this.log('info', '📝 Analizando estadísticas de texto...');
        
        let textoCompleto = '';
        
        // Extraer texto del body
        if (this.documentParts['word/document.xml']) {
            const bodyDoc = this.parser.parseFromString(this.documentParts['word/document.xml'].content, 'text/xml');
            textoCompleto += this.extractTextFromElement(bodyDoc);
        }

        // Extraer texto de headers
        const headerFiles = ['word/header1.xml', 'word/header2.xml'];
        for (const headerFile of headerFiles) {
            if (this.documentParts[headerFile]) {
                const headerDoc = this.parser.parseFromString(this.documentParts[headerFile].content, 'text/xml');
                textoCompleto += ' ' + this.extractTextFromElement(headerDoc);
            }
        }

        // Extraer texto de footers
        const footerFiles = ['word/footer1.xml', 'word/footer2.xml'];
        for (const footerFile of footerFiles) {
            if (this.documentParts[footerFile]) {
                const footerDoc = this.parser.parseFromString(this.documentParts[footerFile].content, 'text/xml');
                textoCompleto += ' ' + this.extractTextFromElement(footerDoc);
            }
        }

        const palabras = textoCompleto.split(/\s+/).filter(w => w.length > 0);
        const lineas = textoCompleto.split('\n');
        
        return {
            caracteres: textoCompleto.length,
            caracteresConEspacios: textoCompleto.length,
            caracteresSinEspacios: textoCompleto.replace(/\s/g, '').length,
            palabras: palabras.length,
            lineas: lineas.length,
            promedioCaracteresPorPalabra: palabras.length > 0 ? Math.round(textoCompleto.replace(/\s/g, '').length / palabras.length * 100) / 100 : 0,
            promedioPalabrasPorLinea: lineas.length > 0 ? Math.round(palabras.length / lineas.length * 100) / 100 : 0
        };
    }

    /**
     * Análisis detallado de una imagen en un drawing
     */
    async analyzeImageInDrawing(drawing, ubicacion) {
        const extents = drawing.getElementsByTagName('wp:extent');
        const embeds = drawing.getElementsByTagName('a:blip');
        const anchors = drawing.getElementsByTagName('wp:anchor');
        const inlines = drawing.getElementsByTagName('wp:inline');
        
        if (extents.length === 0 || embeds.length === 0) {
            return null;
        }

        const extent = extents[0];
        const embed = embeds[0];
        const relationId = embed.getAttribute('r:embed');
        
        const imageInfo = {
            ubicacion: ubicacion,
            relacionId: relationId,
            dimensiones: {
                cx: parseInt(extent.getAttribute('cx')) || 0,
                cy: parseInt(extent.getAttribute('cy')) || 0,
                cx_pixels: Math.round((parseInt(extent.getAttribute('cx')) || 0) / 9525),
                cy_pixels: Math.round((parseInt(extent.getAttribute('cy')) || 0) / 9525)
            },
            posicionamiento: {
                tipo: anchors.length > 0 ? 'anchor' : 'inline',
                detalles: {}
            },
            formato: {}
        };

        // Analizar posicionamiento detallado
        if (anchors.length > 0) {
            const anchor = anchors[0];
            imageInfo.posicionamiento.detalles = {
                allowOverlap: anchor.getAttribute('allowOverlap') === '1',
                layoutInCell: anchor.getAttribute('layoutInCell') === '1',
                locked: anchor.getAttribute('locked') === '1',
                hidden: anchor.getAttribute('hidden') === '1'
            };

            // Posición horizontal
            const positionH = anchor.getElementsByTagName('wp:positionH')[0];
            if (positionH) {
                imageInfo.posicionamiento.horizontal = {
                    relativeFrom: positionH.getAttribute('relativeFrom'),
                    offset: this.getElementText(positionH, 'wp:posOffset'),
                    align: this.getElementText(positionH, 'wp:align')
                };
            }

            // Posición vertical
            const positionV = anchor.getElementsByTagName('wp:positionV')[0];
            if (positionV) {
                imageInfo.posicionamiento.vertical = {
                    relativeFrom: positionV.getAttribute('relativeFrom'),
                    offset: this.getElementText(positionV, 'wp:posOffset'),
                    align: this.getElementText(positionV, 'wp:align')
                };
            }

            // Tipo de wrapping
            const wrapNone = anchor.getElementsByTagName('wp:wrapNone')[0];
            const wrapSquare = anchor.getElementsByTagName('wp:wrapSquare')[0];
            const wrapTight = anchor.getElementsByTagName('wp:wrapTight')[0];
            const wrapThrough = anchor.getElementsByTagName('wp:wrapThrough')[0];
            const wrapTopAndBottom = anchor.getElementsByTagName('wp:wrapTopAndBottom')[0];

            if (wrapNone) {
                imageInfo.formato.wrapping = {
                    tipo: 'none',
                    descripcion: 'Behind text - no afecta el flujo del texto'
                };
            } else if (wrapSquare) {
                imageInfo.formato.wrapping = {
                    tipo: 'square',
                    descripcion: 'Square wrapping'
                };
            } else if (wrapTight) {
                imageInfo.formato.wrapping = {
                    tipo: 'tight',
                    descripcion: 'Tight wrapping'
                };
            } else if (wrapThrough) {
                imageInfo.formato.wrapping = {
                    tipo: 'through',
                    descripcion: 'Through wrapping'
                };
            } else if (wrapTopAndBottom) {
                imageInfo.formato.wrapping = {
                    tipo: 'topAndBottom',
                    descripcion: 'Top and bottom wrapping'
                };
            }
        }

        // Analizar recortes si existen
        const srcRect = drawing.getElementsByTagName('a:srcRect')[0];
        if (srcRect) {
            imageInfo.recorte = {
                l: srcRect.getAttribute('l'),
                t: srcRect.getAttribute('t'),
                r: srcRect.getAttribute('r'),
                b: srcRect.getAttribute('b')
            };
        }

        return imageInfo;
    }

    /**
     * Análisis de estructura de una tabla
     */
    analyzeTableStructure(table, ubicacion) {
        const rows = table.getElementsByTagName('w:tr');
        const cells = table.getElementsByTagName('w:tc');
        
        const tableInfo = {
            ubicacion: ubicacion,
            filas: rows.length,
            celdas: cells.length,
            estructura: [],
            propiedades: {}
        };

        // Analizar propiedades de la tabla
        const tblPr = table.getElementsByTagName('w:tblPr')[0];
        if (tblPr) {
            const tblW = tblPr.getElementsByTagName('w:tblW')[0];
            const tblStyle = tblPr.getElementsByTagName('w:tblStyle')[0];
            
            if (tblW) {
                tableInfo.propiedades.ancho = {
                    valor: tblW.getAttribute('w:w'),
                    tipo: tblW.getAttribute('w:type')
                };
            }
            
            if (tblStyle) {
                tableInfo.propiedades.estilo = tblStyle.getAttribute('w:val');
            }
        }

        // Analizar estructura fila por fila
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowCells = row.getElementsByTagName('w:tc');
            
            const rowInfo = {
                fila: i + 1,
                celdas: rowCells.length,
                texto: this.extractTextFromElement(row)
            };
            
            tableInfo.estructura.push(rowInfo);
        }

        return tableInfo;
    }

    /**
     * Análisis de estructura por páginas
     */
    async analyzePageStructure(body) {
        const pageBreaks = body.querySelectorAll('w\\:br[w\\:type="page"]');
        const tables = body.getElementsByTagName('w:tbl');
        const images = body.getElementsByTagName('w:drawing');
        
        return {
            saltosPagina: pageBreaks.length,
            paginasEstimadas: pageBreaks.length + 1,
            elementosPorPagina: {
                tablas: tables.length,
                imagenes: images.length
            }
        };
    }

    /**
     * Extrae texto de un elemento XML
     */
    extractTextFromElement(element) {
        const textNodes = element.getElementsByTagName('w:t');
        let texto = '';
        
        for (let i = 0; i < textNodes.length; i++) {
            const textNode = textNodes[i];
            if (textNode.firstChild && textNode.firstChild.nodeValue) {
                texto += textNode.firstChild.nodeValue;
            }
        }
        
        return texto.trim();
    }

    /**
     * Obtiene el texto de un elemento específico
     */
    getElementText(parent, tagName) {
        const elements = parent.getElementsByTagName(tagName);
        if (elements.length > 0 && elements[0].firstChild) {
            return elements[0].firstChild.nodeValue;
        }
        return '';
    }

    /**
     * Guarda los resultados del análisis
     */
    async saveResults(results, prefix = 'analysis') {
        await fs.ensureDir(this.options.outputDir);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const fileName = `${prefix}_${timestamp}.json`;
        const filePath = path.join(this.options.outputDir, fileName);
        
        await fs.writeFile(filePath, JSON.stringify(results, null, 2));
        this.log('info', `📁 Resultados guardados en: ${filePath}`);
        
        return filePath;
    }

    /**
     * Sistema de logging
     */
    log(level, message) {
        if (this.options.logLevel === 'debug' || level === 'error' || level === 'info') {
            const prefix = {
                error: '❌',
                info: 'ℹ️',
                debug: '🐛'
            }[level] || 'ℹ️';
            
            console.log(`${prefix} ${message}`);
        }
    }

    /**
     * Muestra resumen del análisis
     */
    showAnalysisSummary() {
        if (!this.analysisResults || Object.keys(this.analysisResults).length === 0) {
            console.log('⚠️ No hay resultados de análisis para mostrar');
            return;
        }

        console.log('\n📊 RESUMEN DEL ANÁLISIS DETALLADO');
        console.log('============================================================');
        
        const results = this.analysisResults;
        
        console.log(`📄 Archivo: ${results.archivo}`);
        console.log(`📅 Análisis realizado: ${new Date(results.timestamp).toLocaleString()}`);
        
        if (results.tamaño) {
            console.log(`💾 Tamaño: ${results.tamaño.mb} MB (${results.tamaño.bytes} bytes)`);
        }
        
        if (results.structure) {
            console.log(`📁 Partes del documento: ${results.structure.partes}`);
            console.log(`🗜️ Ratio de compresión: ${results.structure.ratioCompresion}`);
        }
        
        if (results.images) {
            console.log(`🖼️ Imágenes totales: ${results.images.totalImagenes}`);
            console.log(`   - En headers: ${results.images.imagenesEnHeaders}`);
            console.log(`   - En body: ${results.images.imagenesEnBody}`);
        }
        
        if (results.tables) {
            console.log(`📊 Tablas totales: ${results.tables.totalTablas}`);
            console.log(`   - En headers: ${results.tables.tablasEnHeaders}`);
            console.log(`   - En body: ${results.tables.tablasEnBody}`);
        }
        
        if (results.textStats) {
            console.log(`📝 Estadísticas de texto:`);
            console.log(`   - Palabras: ${results.textStats.palabras}`);
            console.log(`   - Caracteres: ${results.textStats.caracteres}`);
            console.log(`   - Líneas: ${results.textStats.lineas}`);
        }
        
        if (results.styles) {
            console.log(`🎨 Estilos totales: ${results.styles.totalEstilos}`);
            console.log(`   - Párrafo: ${results.styles.estilosParrafo}`);
            console.log(`   - Carácter: ${results.styles.estilosCaracter}`);
            console.log(`   - Personalizados: ${results.styles.estilosPersonalizados.length}`);
        }
        
        console.log('\n✅ Análisis detallado completado');
    }

    // Métodos de compatibilidad con la interfaz anterior
    async analyzeImageFormatting() {
        const completeAnalysis = await this.analyzeComplete();
        return {
            fecha: completeAnalysis.timestamp,
            archivo: completeAnalysis.archivo,
            headers: completeAnalysis.headers || []
        };
    }

    async analyzeHeaderDimensions() {
        const completeAnalysis = await this.analyzeComplete();
        return {
            fecha: completeAnalysis.timestamp,
            archivo: completeAnalysis.archivo,
            headers: completeAnalysis.headers || []
        };
    }

    async analyzeBodyPositioning() {
        const completeAnalysis = await this.analyzeComplete();
        return {
            fecha: completeAnalysis.timestamp,
            archivo: completeAnalysis.archivo,
            body: completeAnalysis.body || {}
        };
    }

    async analyzeDocumentStructure() {
        const completeAnalysis = await this.analyzeComplete();
        return {
            fecha: completeAnalysis.timestamp,
            archivo: completeAnalysis.archivo,
            structure: completeAnalysis.structure || {}
        };
    }
}
