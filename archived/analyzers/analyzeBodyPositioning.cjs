/**
 * Analizador de Posicionamiento del Body del Documento
 * 
 * Extrae la posición exacta de todos los elementos en el cuerpo del documento:
 * - Imágenes con coordenadas específicas
 * - Tablas con posicionamiento
 * - Párrafos y su alineación
 * - Elementos flotantes y anclados
 */

const AdmZip = require('adm-zip');
const xml2js = require('xml2js');
const fs = require('fs');

class BodyPositioningAnalyzer {
    constructor(docxPath) {
        this.docxPath = docxPath;
        this.zip = new AdmZip(docxPath);
        this.parser = new xml2js.Parser({ explicitArray: true });
        this.results = {
            fecha: new Date().toISOString(),
            archivo: docxPath.split('\\').pop(),
            body: {
                paragraphs: [],
                tables: [],
                images: [],
                drawings: [],
                sectionProperties: {}
            },
            posicionamiento: {
                imagenes: [],
                tablas: [],
                elementos_flotantes: []
            }
        };
    }

    async analyze() {
        try {
            console.log('🔍 Analizando posicionamiento del body del documento...');
            
            // Analizar document.xml principal
            await this.analyzeMainDocument();
            
            // Analizar relaciones de imagen
            await this.analyzeDocumentRelations();
            
            // Guardar resultados
            await this.saveResults();
            
            console.log('✅ Análisis de posicionamiento del body completado');
            return this.results;
        } catch (error) {
            console.error('❌ Error en análisis:', error);
            throw error;
        }
    }

    async analyzeMainDocument() {
        const docEntry = this.zip.getEntry('word/document.xml');
        if (!docEntry) {
            throw new Error('No se encontró document.xml');
        }

        console.log('📄 Analizando word/document.xml...');
        const xmlContent = docEntry.getData().toString('utf8');
        const parsed = await this.parser.parseStringPromise(xmlContent);

        // Analizar el body del documento
        if (parsed['w:document'] && parsed['w:document']['w:body']) {
            const body = parsed['w:document']['w:body'][0];
            await this.analyzeBodyElements(body);
        }
    }

    async analyzeBodyElements(body) {
        console.log('📋 Analizando elementos del body...');
        
        let elementIndex = 0;

        for (const [elementType, elements] of Object.entries(body)) {
            if (!Array.isArray(elements)) continue;

            elements.forEach((element, index) => {
                const elementInfo = {
                    tipo: elementType,
                    indice: elementIndex++,
                    indiceEnTipo: index
                };

                switch (elementType) {
                    case 'w:p':
                        this.analyzeParagraph(element, elementInfo);
                        break;
                    case 'w:tbl':
                        this.analyzeTable(element, elementInfo);
                        break;
                    case 'w:sectPr':
                        this.analyzeSectionProperties(element);
                        break;
                }
            });
        }
    }

    analyzeParagraph(paragraph, elementInfo) {
        console.log(`📝 Analizando párrafo ${elementInfo.indice}...`);
        
        const paraInfo = {
            ...elementInfo,
            contenido: [],
            propiedades: {},
            imagenes: [],
            dibujos: []
        };

        // Analizar propiedades del párrafo
        if (paragraph['w:pPr']) {
            paraInfo.propiedades = this.analyzeParagraphProperties(paragraph['w:pPr'][0]);
        }

        // Analizar runs (contenido)
        if (paragraph['w:r']) {
            paragraph['w:r'].forEach((run, runIndex) => {
                const runInfo = this.analyzeRun(run, runIndex, elementInfo.indice);
                paraInfo.contenido.push(runInfo);
                
                // Si el run contiene imágenes o dibujos, agregarlos
                if (runInfo.imagenes.length > 0) {
                    paraInfo.imagenes.push(...runInfo.imagenes);
                }
                if (runInfo.dibujos.length > 0) {
                    paraInfo.dibujos.push(...runInfo.dibujos);
                }
            });
        }

        this.results.body.paragraphs.push(paraInfo);

        // Agregar imágenes al listado general
        paraInfo.imagenes.forEach(img => {
            this.results.posicionamiento.imagenes.push({
                ...img,
                paragraph: elementInfo.indice,
                contexto: 'body'
            });
        });
    }

    analyzeParagraphProperties(pPr) {
        const props = {};
        
        // Alineación
        if (pPr['w:jc']) {
            props.alineacion = pPr['w:jc'][0]['$']['w:val'];
        }

        // Espaciado
        if (pPr['w:spacing']) {
            const spacing = pPr['w:spacing'][0]['$'];
            props.espaciado = {
                before: spacing['w:before'],
                after: spacing['w:after'],
                line: spacing['w:line'],
                lineRule: spacing['w:lineRule']
            };
        }

        // Sangría
        if (pPr['w:ind']) {
            const ind = pPr['w:ind'][0]['$'];
            props.sangria = {
                left: ind['w:left'],
                right: ind['w:right'],
                firstLine: ind['w:firstLine'],
                hanging: ind['w:hanging']
            };
        }

        return props;
    }

    analyzeRun(run, runIndex, paragraphIndex) {
        const runInfo = {
            indice: runIndex,
            texto: '',
            propiedades: {},
            imagenes: [],
            dibujos: []
        };

        // Propiedades del run
        if (run['w:rPr']) {
            runInfo.propiedades = this.analyzeRunProperties(run['w:rPr'][0]);
        }

        // Texto
        if (run['w:t']) {
            runInfo.texto = run['w:t'].map(t => t._ || '').join('');
        }

        // Dibujos/Imágenes
        if (run['w:drawing']) {
            run['w:drawing'].forEach((drawing, drawingIndex) => {
                const drawingInfo = this.analyzeDrawingInBody(drawing, {
                    paragraph: paragraphIndex,
                    run: runIndex,
                    drawing: drawingIndex
                });
                runInfo.dibujos.push(drawingInfo);
                
                // Si el dibujo es una imagen, también agregarla a imágenes
                if (drawingInfo.tipo === 'imagen') {
                    runInfo.imagenes.push(drawingInfo);
                }
            });
        }

        return runInfo;
    }

    analyzeRunProperties(rPr) {
        const props = {};

        if (rPr['w:b']) props.bold = true;
        if (rPr['w:i']) props.italic = true;
        if (rPr['w:u']) props.underline = rPr['w:u'][0]['$']['w:val'] || true;
        if (rPr['w:sz']) props.size = rPr['w:sz'][0]['$']['w:val'];
        if (rPr['w:color']) props.color = rPr['w:color'][0]['$']['w:val'];
        if (rPr['w:rFonts']) {
            const fonts = rPr['w:rFonts'][0]['$'];
            props.fuente = {
                ascii: fonts['w:ascii'],
                hAnsi: fonts['w:hAnsi'],
                cs: fonts['w:cs']
            };
        }

        return props;
    }

    analyzeDrawingInBody(drawing, location) {
        console.log(`🎨 Analizando dibujo en párrafo ${location.paragraph}, run ${location.run}...`);
        
        const drawingInfo = {
            ubicacion: location,
            tipo: 'drawing',
            posicionamiento: {},
            dimensiones: {},
            formato: {},
            relacionId: null
        };

        // Analizar inline vs anchor
        if (drawing['wp:inline']) {
            drawingInfo.posicionamiento.tipo = 'inline';
            this.analyzeInlineDrawingInBody(drawing['wp:inline'][0], drawingInfo);
        }

        if (drawing['wp:anchor']) {
            drawingInfo.posicionamiento.tipo = 'anchor';
            this.analyzeAnchorDrawingInBody(drawing['wp:anchor'][0], drawingInfo);
        }

        return drawingInfo;
    }

    analyzeInlineDrawingInBody(inline, drawingInfo) {
        console.log('📌 Analizando drawing inline en body');
        
        // Dimensiones
        if (inline['wp:extent']) {
            const extent = inline['wp:extent'][0]['$'];
            if (extent) {
                drawingInfo.dimensiones = {
                    cx: extent.cx,
                    cy: extent.cy,
                    cx_pixels: Math.round(parseInt(extent.cx) / 9525),
                    cy_pixels: Math.round(parseInt(extent.cy) / 9525)
                };
            }
        }

        drawingInfo.formato.wrapping = 'inline';
        drawingInfo.tipo = 'imagen';
        
        // Buscar ID de relación
        this.findBlipInformation(inline, drawingInfo);
    }

    analyzeAnchorDrawingInBody(anchor, drawingInfo) {
        console.log('⚓ Analizando drawing anchor en body');
        
        const attributes = anchor['$'] || {};
        
        drawingInfo.posicionamiento.comportamiento = {
            allowOverlap: attributes.allowOverlap === '1',
            locked: attributes.locked === '1',
            layoutInCell: attributes.layoutInCell === '1',
            hidden: attributes.hidden === '1',
            relativeHeight: attributes.relativeHeight
        };

        // Posición simple
        if (anchor['wp:simplePos']) {
            const simplePos = anchor['wp:simplePos'][0]['$'];
            drawingInfo.posicionamiento.simple = {
                x: simplePos.x,
                y: simplePos.y
            };
        }

        // Posición horizontal
        if (anchor['wp:positionH']) {
            const posH = anchor['wp:positionH'][0];
            drawingInfo.posicionamiento.horizontal = {
                relativeFrom: posH['$'].relativeFrom
            };
            
            if (posH['wp:align']) {
                drawingInfo.posicionamiento.horizontal.align = posH['wp:align'][0];
            }
            if (posH['wp:posOffset']) {
                drawingInfo.posicionamiento.horizontal.offset = posH['wp:posOffset'][0];
            }
        }

        // Posición vertical
        if (anchor['wp:positionV']) {
            const posV = anchor['wp:positionV'][0];
            drawingInfo.posicionamiento.vertical = {
                relativeFrom: posV['$'].relativeFrom
            };
            
            if (posV['wp:align']) {
                drawingInfo.posicionamiento.vertical.align = posV['wp:align'][0];
            }
            if (posV['wp:posOffset']) {
                drawingInfo.posicionamiento.vertical.offset = posV['wp:posOffset'][0];
            }
        }

        // Wrapping
        this.analyzeWrappingInBody(anchor, drawingInfo);

        // Dimensiones
        if (anchor['wp:extent']) {
            const extent = anchor['wp:extent'][0]['$'];
            if (extent) {
                drawingInfo.dimensiones = {
                    cx: extent.cx,
                    cy: extent.cy,
                    cx_pixels: Math.round(parseInt(extent.cx) / 9525),
                    cy_pixels: Math.round(parseInt(extent.cy) / 9525)
                };
            }
        }

        drawingInfo.tipo = 'imagen';
        
        // Buscar ID de relación y recortes
        this.findBlipInformation(anchor, drawingInfo);
    }

    analyzeWrappingInBody(anchor, drawingInfo) {
        const wrappingTypes = [
            'wp:wrapNone',
            'wp:wrapSquare', 
            'wp:wrapTight',
            'wp:wrapThrough',
            'wp:wrapTopAndBottom'
        ];

        wrappingTypes.forEach(wrapType => {
            if (anchor[wrapType]) {
                const wrapTypeName = wrapType.replace('wp:wrap', '').toLowerCase();
                drawingInfo.formato.wrapping = {
                    tipo: wrapTypeName,
                    propiedades: anchor[wrapType][0]['$'] || {}
                };
            }
        });
    }

    findBlipInformation(element, drawingInfo) {
        const findBlip = (obj) => {
            if (typeof obj !== 'object' || obj === null) return;
            
            if (obj['a:blip']) {
                const blip = obj['a:blip'][0];
                if (blip['$'] && blip['$']['r:embed']) {
                    drawingInfo.relacionId = blip['$']['r:embed'];
                }
            }

            // Buscar recortes
            if (obj['a:srcRect']) {
                const srcRect = obj['a:srcRect'][0]['$'];
                if (srcRect) {
                    drawingInfo.recorte = {
                        left: srcRect.l || '0',
                        top: srcRect.t || '0', 
                        right: srcRect.r || '0',
                        bottom: srcRect.b || '0'
                    };
                    console.log(`✂️ Recorte en body: l=${srcRect.l}, t=${srcRect.t}, r=${srcRect.r}, b=${srcRect.b}`);
                }
            }
            
            Object.values(obj).forEach(value => {
                if (Array.isArray(value)) {
                    value.forEach(item => findBlip(item));
                } else if (typeof value === 'object') {
                    findBlip(value);
                }
            });
        };
        
        findBlip(element);
    }

    analyzeTable(table, elementInfo) {
        console.log(`📊 Analizando tabla ${elementInfo.indice}...`);
        
        const tableInfo = {
            ...elementInfo,
            propiedades: {},
            filas: [],
            posicionamiento: {}
        };

        // Propiedades de la tabla
        if (table['w:tblPr']) {
            tableInfo.propiedades = this.analyzeTableProperties(table['w:tblPr'][0]);
        }

        // Grid de la tabla
        if (table['w:tblGrid']) {
            tableInfo.grid = this.analyzeTableGrid(table['w:tblGrid'][0]);
        }

        // Filas de la tabla
        if (table['w:tr']) {
            table['w:tr'].forEach((row, rowIndex) => {
                const rowInfo = this.analyzeTableRow(row, rowIndex);
                tableInfo.filas.push(rowInfo);
            });
        }

        this.results.body.tables.push(tableInfo);
        
        // Si la tabla tiene posicionamiento especial, agregarla a elementos flotantes
        if (tableInfo.propiedades.posicionamiento) {
            this.results.posicionamiento.elementos_flotantes.push({
                tipo: 'tabla',
                indice: elementInfo.indice,
                posicionamiento: tableInfo.propiedades.posicionamiento
            });
        }
    }

    analyzeTableProperties(tblPr) {
        const props = {};

        // Ancho de tabla
        if (tblPr['w:tblW']) {
            const tblW = tblPr['w:tblW'][0]['$'];
            props.ancho = {
                valor: tblW['w:w'],
                tipo: tblW['w:type']
            };
        }

        // Alineación de tabla
        if (tblPr['w:jc']) {
            props.alineacion = tblPr['w:jc'][0]['$']['w:val'];
        }

        // Posicionamiento de tabla (si es flotante)
        if (tblPr['w:tblpPr']) {
            const tblpPr = tblPr['w:tblpPr'][0]['$'];
            props.posicionamiento = {
                leftFromText: tblpPr['w:leftFromText'],
                rightFromText: tblpPr['w:rightFromText'],
                topFromText: tblpPr['w:topFromText'],
                bottomFromText: tblpPr['w:bottomFromText'],
                vertAnchor: tblpPr['w:vertAnchor'],
                horzAnchor: tblpPr['w:horzAnchor'],
                tblpXSpec: tblpPr['w:tblpXSpec'],
                tblpYSpec: tblpPr['w:tblpYSpec'],
                tblpX: tblpPr['w:tblpX'],
                tblpY: tblpPr['w:tblpY']
            };
            console.log('📍 Tabla con posicionamiento flotante detectada');
        }

        // Bordes
        if (tblPr['w:tblBorders']) {
            props.bordes = this.analyzeTableBorders(tblPr['w:tblBorders'][0]);
        }

        return props;
    }

    analyzeTableGrid(tblGrid) {
        const grid = {
            columnas: []
        };

        if (tblGrid['w:gridCol']) {
            tblGrid['w:gridCol'].forEach((gridCol, index) => {
                const attrs = gridCol['$'] || {};
                grid.columnas.push({
                    indice: index,
                    ancho: attrs['w:w']
                });
            });
        }

        return grid;
    }

    analyzeTableRow(row, rowIndex) {
        const rowInfo = {
            indice: rowIndex,
            propiedades: {},
            celdas: []
        };

        // Propiedades de fila
        if (row['w:trPr']) {
            rowInfo.propiedades = this.analyzeRowProperties(row['w:trPr'][0]);
        }

        // Celdas
        if (row['w:tc']) {
            row['w:tc'].forEach((cell, cellIndex) => {
                const cellInfo = this.analyzeTableCell(cell, cellIndex, rowIndex);
                rowInfo.celdas.push(cellInfo);
            });
        }

        return rowInfo;
    }

    analyzeRowProperties(trPr) {
        const props = {};

        if (trPr['w:trHeight']) {
            const height = trPr['w:trHeight'][0]['$'];
            props.altura = {
                valor: height['w:val'],
                regla: height['w:hRule']
            };
        }

        return props;
    }

    analyzeTableCell(cell, cellIndex, rowIndex) {
        const cellInfo = {
            fila: rowIndex,
            columna: cellIndex,
            propiedades: {},
            contenido: []
        };

        // Propiedades de celda
        if (cell['w:tcPr']) {
            cellInfo.propiedades = this.analyzeCellProperties(cell['w:tcPr'][0]);
        }

        // Contenido de la celda (párrafos)
        if (cell['w:p']) {
            cell['w:p'].forEach((paragraph, paraIndex) => {
                const paraInfo = {
                    indice: paraIndex,
                    contenido: [],
                    propiedades: {}
                };

                if (paragraph['w:pPr']) {
                    paraInfo.propiedades = this.analyzeParagraphProperties(paragraph['w:pPr'][0]);
                }

                if (paragraph['w:r']) {
                    paragraph['w:r'].forEach((run, runIndex) => {
                        const runInfo = this.analyzeRun(run, runIndex, `tabla-${rowIndex}-${cellIndex}-${paraIndex}`);
                        paraInfo.contenido.push(runInfo);
                    });
                }

                cellInfo.contenido.push(paraInfo);
            });
        }

        return cellInfo;
    }

    analyzeCellProperties(tcPr) {
        const props = {};

        // Ancho de celda
        if (tcPr['w:tcW']) {
            const tcW = tcPr['w:tcW'][0]['$'];
            props.ancho = {
                valor: tcW['w:w'],
                tipo: tcW['w:type']
            };
        }

        // Sombreado
        if (tcPr['w:shd']) {
            const shd = tcPr['w:shd'][0]['$'];
            props.sombreado = {
                val: shd['w:val'],
                color: shd['w:color'],
                fill: shd['w:fill']
            };
        }

        // Span de celdas
        if (tcPr['w:gridSpan']) {
            props.gridSpan = tcPr['w:gridSpan'][0]['$']['w:val'];
        }

        if (tcPr['w:vMerge']) {
            props.vMerge = tcPr['w:vMerge'][0]['$']['w:val'] || 'continue';
        }

        return props;
    }

    analyzeTableBorders(tblBorders) {
        const borders = {};
        
        const borderTypes = ['w:top', 'w:left', 'w:bottom', 'w:right', 'w:insideH', 'w:insideV'];
        
        borderTypes.forEach(borderType => {
            if (tblBorders[borderType]) {
                const border = tblBorders[borderType][0]['$'];
                borders[borderType.replace('w:', '')] = {
                    val: border['w:val'],
                    color: border['w:color'],
                    sz: border['w:sz'],
                    space: border['w:space']
                };
            }
        });

        return borders;
    }

    analyzeSectionProperties(sectPr) {
        console.log('⚙️ Analizando propiedades de sección...');
        
        const sectionProps = {};

        // Tamaño de página
        if (sectPr['w:pgSz']) {
            const pgSz = sectPr['w:pgSz'][0]['$'];
            sectionProps.pageSize = {
                w: pgSz['w:w'],
                h: pgSz['w:h'],
                orient: pgSz['w:orient']
            };
        }

        // Márgenes
        if (sectPr['w:pgMar']) {
            const pgMar = sectPr['w:pgMar'][0]['$'];
            sectionProps.margins = {
                top: pgMar['w:top'],
                right: pgMar['w:right'],
                bottom: pgMar['w:bottom'],
                left: pgMar['w:left'],
                header: pgMar['w:header'],
                footer: pgMar['w:footer']
            };
        }

        this.results.body.sectionProperties = sectionProps;
    }

    async analyzeDocumentRelations() {
        const relsFile = 'word/_rels/document.xml.rels';
        const relsEntry = this.zip.getEntry(relsFile);
        
        if (relsEntry) {
            const xmlContent = relsEntry.getData().toString('utf8');
            const parsed = await this.parser.parseStringPromise(xmlContent);
            
            if (parsed.Relationships && parsed.Relationships.Relationship) {
                parsed.Relationships.Relationship.forEach(rel => {
                    const attrs = rel['$'];
                    if (attrs.Type && attrs.Type.includes('image')) {
                        this.results.body.imageRelations = this.results.body.imageRelations || {};
                        this.results.body.imageRelations[attrs.Id] = {
                            archivo: attrs.Target,
                            tipo: attrs.Type
                        };
                    }
                });
            }
        }
    }

    async saveResults() {
        const timestamp = Date.now();
        const outputPath = `c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_js\\output\\body_positioning_${timestamp}.json`;
        
        fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
        console.log(`💾 Resultados guardados en: ${outputPath}`);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const docxPath = 'c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_js\\uploads\\PUMA MES 6 2025.docx';
    
    const analyzer = new BodyPositioningAnalyzer(docxPath);
    analyzer.analyze().catch(console.error);
}

module.exports = BodyPositioningAnalyzer;
