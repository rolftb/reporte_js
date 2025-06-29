/**
 * 🖼️ EXTRACTOR DE IMÁGENES AVANZADO
 * Extrae y guarda todas las imágenes del documento DOCX
 */
import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import crypto from 'crypto';

export class ImageExtractor {
    constructor(outputDir = './extracted_images') {
        this.outputDir = outputDir;
        this.imageRegistry = [];
        this.imageHashes = new Set(); // Para evitar duplicados
    }

    /**
     * Extrae todas las imágenes del DOCX
     */
    async extractAllImages(docxPath) {
        try {
            console.log('🖼️ Iniciando extracción de imágenes...');
            
            // Crear directorio de salida
            await fs.ensureDir(this.outputDir);
            
            // Abrir archivo DOCX
            const zip = new AdmZip(docxPath);
            const entries = zip.getEntries();
            
            const extractedImages = [];
            let imageCounter = 1;
            
            for (const entry of entries) {
                // Buscar archivos de imagen en word/media/
                if (entry.entryName.startsWith('word/media/') && this.isImageFile(entry.entryName)) {
                    const imageData = await this.extractSingleImage(entry, imageCounter);
                    if (imageData) {
                        extractedImages.push(imageData);
                        imageCounter++;
                    }
                }
            }
            
            // Guardar registro de imágenes
            await this.saveImageRegistry(extractedImages);
            
            console.log(`✅ Extracción completada: ${extractedImages.length} imágenes`);
            return extractedImages;
            
        } catch (error) {
            console.error('❌ Error en extracción de imágenes:', error);
            throw error;
        }
    }

    /**
     * Extrae una imagen individual
     */
    async extractSingleImage(entry, counter) {
        try {
            const imageBuffer = entry.getData();
            const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
            
            // Evitar duplicados
            if (this.imageHashes.has(hash)) {
                console.log(`⚠️ Imagen duplicada omitida: ${entry.entryName}`);
                return null;
            }
            
            this.imageHashes.add(hash);
            
            // Determinar extensión
            const originalExt = path.extname(entry.entryName);
            const fileName = `image_${counter.toString().padStart(3, '0')}${originalExt}`;
            const outputPath = path.join(this.outputDir, fileName);
            
            // Guardar imagen
            await fs.writeFile(outputPath, imageBuffer);
            
            const imageInfo = {
                id: counter,
                originalPath: entry.entryName,
                fileName: fileName,
                outputPath: outputPath,
                size: imageBuffer.length,
                hash: hash,
                extension: originalExt,
                extracted: new Date().toISOString()
            };
            
            console.log(`📷 Imagen extraída: ${fileName} (${this.formatBytes(imageBuffer.length)})`);
            return imageInfo;
            
        } catch (error) {
            console.error(`❌ Error extrayendo imagen ${entry.entryName}:`, error);
            return null;
        }
    }

    /**
     * Verifica si un archivo es una imagen
     */
    isImageFile(filePath) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.emf', '.wmf'];
        return imageExtensions.includes(path.extname(filePath).toLowerCase());
    }

    /**
     * Guarda el registro de imágenes
     */
    async saveImageRegistry(images) {
        const registryPath = path.join(this.outputDir, 'image_registry.json');
        const registry = {
            extractedAt: new Date().toISOString(),
            totalImages: images.length,
            images: images,
            summary: {
                totalSize: images.reduce((sum, img) => sum + img.size, 0),
                extensions: [...new Set(images.map(img => img.extension))],
                uniqueHashes: images.length
            }
        };
        
        await fs.writeJson(registryPath, registry, { spaces: 2 });
        console.log(`📋 Registro guardado: ${registryPath}`);
    }

    /**
     * Formatea bytes a formato legible
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

/**
 * 📊 ANALIZADOR AVANZADO DE TABLAS
 * Analiza la estructura, posición y contenido detallado de las tablas
 */
export class TableAnalyzer {
    constructor() {
        this.tables = [];
        this.tablePositions = new Map();
    }

    /**
     * Analiza todas las tablas del documento
     */
    async analyzeAllTables(documentXml, stylesXml = null) {
        try {
            console.log('📊 Analizando estructura detallada de tablas...');
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(documentXml, 'text/xml');
            
            // Encontrar todas las tablas
            const tables = doc.getElementsByTagName('w:tbl');
            console.log(`📋 Encontradas ${tables.length} tablas`);
            
            for (let i = 0; i < tables.length; i++) {
                const tableAnalysis = await this.analyzeTable(tables[i], i + 1, stylesXml);
                this.tables.push(tableAnalysis);
            }
            
            return this.tables;
            
        } catch (error) {
            console.error('❌ Error analizando tablas:', error);
            throw error;
        }
    }

    /**
     * Analiza una tabla individual con detalles completos
     */
    async analyzeTable(tableNode, tableIndex, stylesXml) {
        try {
            const tableAnalysis = {
                id: tableIndex,
                position: this.calculateTablePosition(tableNode),
                structure: this.analyzeTableStructure(tableNode),
                content: this.extractTableContent(tableNode),
                styling: this.analyzeTableStyling(tableNode, stylesXml),
                metadata: this.extractTableMetadata(tableNode)
            };

            console.log(`📋 Tabla ${tableIndex} analizada: ${tableAnalysis.structure.rows}x${tableAnalysis.structure.columns}`);
            return tableAnalysis;
            
        } catch (error) {
            console.error(`❌ Error analizando tabla ${tableIndex}:`, error);
            return null;
        }
    }

    /**
     * Calcula la posición exacta de la tabla en el documento
     */
    calculateTablePosition(tableNode) {
        const position = {
            documentOrder: 0,
            beforeElements: [],
            afterElements: [],
            parentSection: null,
            pageEstimate: 1
        };

        try {
            // Encontrar elementos hermanos anteriores
            let sibling = tableNode.previousSibling;
            while (sibling) {
                if (sibling.nodeType === 1) { // Element node
                    position.beforeElements.unshift({
                        type: sibling.nodeName,
                        text: this.extractTextFromNode(sibling).substring(0, 50)
                    });
                }
                sibling = sibling.previousSibling;
            }

            // Encontrar elementos hermanos posteriores
            sibling = tableNode.nextSibling;
            while (sibling && position.afterElements.length < 3) {
                if (sibling.nodeType === 1) { // Element node
                    position.afterElements.push({
                        type: sibling.nodeName,
                        text: this.extractTextFromNode(sibling).substring(0, 50)
                    });
                }
                sibling = sibling.nextSibling;
            }

            // Calcular orden en el documento
            position.documentOrder = position.beforeElements.length;
            
        } catch (error) {
            console.warn('⚠️ No se pudo calcular posición exacta de tabla');
        }

        return position;
    }

    /**
     * Analiza la estructura básica de la tabla
     */
    analyzeTableStructure(tableNode) {
        const rows = tableNode.getElementsByTagName('w:tr');
        let maxColumns = 0;

        // Calcular número máximo de columnas
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('w:tc');
            maxColumns = Math.max(maxColumns, cells.length);
        }

        const structure = {
            rows: rows.length,
            columns: maxColumns,
            totalCells: 0,
            hasHeader: false,
            isRegular: true
        };

        // Verificar si es una tabla regular
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('w:tc');
            structure.totalCells += cells.length;
            
            if (cells.length !== maxColumns) {
                structure.isRegular = false;
            }
        }

        // Detectar posible header (primera fila con estilo diferente)
        if (rows.length > 0) {
            const firstRowCells = rows[0].getElementsByTagName('w:tc');
            if (firstRowCells.length > 0) {
                // Buscar indicadores de header
                const firstCellProps = firstRowCells[0].getElementsByTagName('w:tcPr')[0];
                if (firstCellProps) {
                    const shading = firstCellProps.getElementsByTagName('w:shd')[0];
                    if (shading) {
                        structure.hasHeader = true;
                    }
                }
            }
        }

        return structure;
    }

    /**
     * Extrae todo el contenido de la tabla
     */
    extractTableContent(tableNode) {
        const content = {
            rows: [],
            allText: '',
            cellValues: []
        };

        try {
            const rows = tableNode.getElementsByTagName('w:tr');
            
            for (let r = 0; r < rows.length; r++) {
                const rowData = {
                    index: r,
                    cells: [],
                    isHeader: r === 0
                };

                const cells = rows[r].getElementsByTagName('w:tc');
                
                for (let c = 0; c < cells.length; c++) {
                    const cellText = this.extractTextFromNode(cells[c]).trim();
                    
                    const cellData = {
                        column: c,
                        text: cellText,
                        length: cellText.length,
                        isEmpty: cellText === '',
                        hasFormatting: this.hasCellFormatting(cells[c])
                    };

                    rowData.cells.push(cellData);
                    content.cellValues.push(cellText);
                    content.allText += cellText + ' ';
                }

                content.rows.push(rowData);
            }
            
        } catch (error) {
            console.warn('⚠️ Error extrayendo contenido de tabla:', error);
        }

        return content;
    }

    /**
     * Analiza el estilo de la tabla
     */
    analyzeTableStyling(tableNode, stylesXml) {
        const styling = {
            tableLook: null,
            styleId: null,
            borders: {},
            width: null,
            alignment: null
        };

        try {
            // Propiedades de tabla
            const tblPr = tableNode.getElementsByTagName('w:tblPr')[0];
            if (tblPr) {
                // Estilo de tabla
                const tblStyle = tblPr.getElementsByTagName('w:tblStyle')[0];
                if (tblStyle) {
                    styling.styleId = tblStyle.getAttribute('w:val');
                }

                // Ancho de tabla
                const tblW = tblPr.getElementsByTagName('w:tblW')[0];
                if (tblW) {
                    styling.width = {
                        value: tblW.getAttribute('w:w'),
                        type: tblW.getAttribute('w:type')
                    };
                }

                // Alineación
                const jc = tblPr.getElementsByTagName('w:jc')[0];
                if (jc) {
                    styling.alignment = jc.getAttribute('w:val');
                }

                // Look de tabla
                const tblLook = tblPr.getElementsByTagName('w:tblLook')[0];
                if (tblLook) {
                    styling.tableLook = {
                        firstRow: tblLook.getAttribute('w:firstRow'),
                        lastRow: tblLook.getAttribute('w:lastRow'),
                        firstColumn: tblLook.getAttribute('w:firstColumn'),
                        lastColumn: tblLook.getAttribute('w:lastColumn'),
                        noHBand: tblLook.getAttribute('w:noHBand'),
                        noVBand: tblLook.getAttribute('w:noVBand')
                    };
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Error analizando estilo de tabla:', error);
        }

        return styling;
    }

    /**
     * Extrae metadatos adicionales de la tabla
     */
    extractTableMetadata(tableNode) {
        return {
            hasNestedTables: tableNode.getElementsByTagName('w:tbl').length > 1,
            hasImages: tableNode.getElementsByTagName('w:drawing').length > 0,
            hasHyperlinks: tableNode.getElementsByTagName('w:hyperlink').length > 0,
            xmlLength: tableNode.toString().length
        };
    }

    /**
     * Verifica si una celda tiene formato especial
     */
    hasCellFormatting(cellNode) {
        const tcPr = cellNode.getElementsByTagName('w:tcPr')[0];
        if (!tcPr) return false;

        return tcPr.getElementsByTagName('w:shd').length > 0 ||
               tcPr.getElementsByTagName('w:tcBorders').length > 0 ||
               tcPr.getElementsByTagName('w:vAlign').length > 0;
    }

    /**
     * Extrae texto de un nodo XML
     */
    extractTextFromNode(node) {
        if (!node) return '';
        
        let text = '';
        const textNodes = node.getElementsByTagName('w:t');
        
        for (let i = 0; i < textNodes.length; i++) {
            if (textNodes[i].firstChild) {
                text += textNodes[i].firstChild.nodeValue || '';
            }
        }
        
        return text;
    }
}
