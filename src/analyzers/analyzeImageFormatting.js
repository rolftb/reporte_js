/**
 * Analizador de formato y posicionamiento de imágenes en headers
 * Extrae información específica sobre anchoring, wrapping, y posicionamiento
 * para replicar exactamente el comportamiento de las imágenes en el DOCX original
 */

import AdmZip from 'adm-zip';
import xml2js from 'xml2js';
import fs from 'fs';

class ImageFormattingAnalyzer {
    constructor(docxPath) {
        this.docxPath = docxPath;
        this.zip = new AdmZip(docxPath);
        this.parser = new xml2js.Parser({ explicitArray: true });
        this.results = {
            fecha: new Date().toISOString(),
            archivo: docxPath.split('\\').pop(),
            headers: [],
            formatoImagenes: {}
        };
    }

    async analyze() {
        try {
            console.log('🔍 Analizando formato de imágenes en headers...');
            
            // Analizar headers
            await this.analyzeHeaders();
            
            // Analizar document.xml para relaciones
            await this.analyzeDocumentRelations();
            
            // Guardar resultados
            await this.saveResults();
            
            console.log('✅ Análisis de formato de imágenes completado');
            return this.results;
        } catch (error) {
            console.error('❌ Error en análisis:', error);
            throw error;
        }
    }

    async analyzeHeaders() {
        const headerFiles = ['word/header1.xml', 'word/header2.xml'];
        
        for (let i = 0; i < headerFiles.length; i++) {
            const headerFile = headerFiles[i];
            const headerEntry = this.zip.getEntry(headerFile);
            
            if (headerEntry) {
                console.log(`📄 Analizando ${headerFile}...`);
                const xmlContent = headerEntry.getData().toString('utf8');
                const parsed = await this.parser.parseStringPromise(xmlContent);
                
                const headerAnalysis = {
                    archivo: headerFile,
                    imagenes: [],
                    estructura: this.analyzeHeaderStructure(parsed)
                };

                // Buscar elementos de imagen/dibujo
                this.findImagesInElement(parsed, headerAnalysis.imagenes, headerFile);
                
                this.results.headers.push(headerAnalysis);
            }
        }
    }

    findImagesInElement(element, imagesList, context) {
        if (typeof element !== 'object' || element === null) return;

        // Buscar drawing elements (w:drawing)
        if (element['w:drawing']) {
            element['w:drawing'].forEach(drawing => {
                this.analyzeDrawing(drawing, imagesList, context);
            });
        }

        // Buscar pict elements (w:pict) - formato legacy
        if (element['w:pict']) {
            element['w:pict'].forEach(pict => {
                this.analyzePict(pict, imagesList, context);
            });
        }

        // Recursión para elementos anidados
        Object.values(element).forEach(value => {
            if (Array.isArray(value)) {
                value.forEach(item => this.findImagesInElement(item, imagesList, context));
            } else if (typeof value === 'object') {
                this.findImagesInElement(value, imagesList, context);
            }
        });
    }

    analyzeDrawing(drawing, imagesList, context) {
        console.log(`🎨 Encontrado drawing en ${context}`);
        
        const imageInfo = {
            tipo: 'drawing',
            contexto: context,
            formato: {},
            posicionamiento: {},
            dimensiones: {}
        };

        // Analizar inline o anchor
        if (drawing['wp:inline']) {
            imageInfo.posicionamiento.tipo = 'inline';
            drawing['wp:inline'].forEach(inline => {
                this.analyzeInlineDrawing(inline, imageInfo);
            });
        }

        if (drawing['wp:anchor']) {
            imageInfo.posicionamiento.tipo = 'anchor';
            drawing['wp:anchor'].forEach(anchor => {
                this.analyzeAnchorDrawing(anchor, imageInfo);
            });
        }

        imagesList.push(imageInfo);
    }

    analyzeInlineDrawing(inline, imageInfo) {
        console.log('📌 Analizando drawing inline');
        
        // Obtener dimensiones
        if (inline['wp:extent']) {
            const extent = inline['wp:extent'][0]['$'];
            if (extent) {
                imageInfo.dimensiones.cx = extent.cx;
                imageInfo.dimensiones.cy = extent.cy;
                imageInfo.dimensiones.cx_pixels = Math.round(parseInt(extent.cx) / 9525);
                imageInfo.dimensiones.cy_pixels = Math.round(parseInt(extent.cy) / 9525);
            }
        }

        // Obtener efectos de wrapping (inline normalmente no tiene wrapping)
        imageInfo.formato.wrapping = 'inline';
        
        // Buscar blip para ID de imagen
        this.findBlipInfo(inline, imageInfo);
    }

    analyzeAnchorDrawing(anchor, imageInfo) {
        console.log('⚓ Analizando drawing anchor');
        
        const attributes = anchor['$'] || {};
        
        // Propiedades de anchor
        imageInfo.posicionamiento.comportamiento = {
            allowOverlap: attributes.allowOverlap === '1',
            locked: attributes.locked === '1',
            layoutInCell: attributes.layoutInCell === '1',
            hidden: attributes.hidden === '1',
            relativeHeight: attributes.relativeHeight
        };

        // Analizar simple position
        if (anchor['wp:simplePos']) {
            const simplePos = anchor['wp:simplePos'][0]['$'];
            imageInfo.posicionamiento.simple = {
                x: simplePos.x,
                y: simplePos.y
            };
        }

        // Analizar position horizontal
        if (anchor['wp:positionH']) {
            const posH = anchor['wp:positionH'][0];
            imageInfo.posicionamiento.horizontal = {
                relativeFrom: posH['$'].relativeFrom
            };
            
            if (posH['wp:align']) {
                imageInfo.posicionamiento.horizontal.align = posH['wp:align'][0];
            }
            if (posH['wp:posOffset']) {
                imageInfo.posicionamiento.horizontal.offset = posH['wp:posOffset'][0];
            }
        }

        // Analizar position vertical
        if (anchor['wp:positionV']) {
            const posV = anchor['wp:positionV'][0];
            imageInfo.posicionamiento.vertical = {
                relativeFrom: posV['$'].relativeFrom
            };
            
            if (posV['wp:align']) {
                imageInfo.posicionamiento.vertical.align = posV['wp:align'][0];
            }
            if (posV['wp:posOffset']) {
                imageInfo.posicionamiento.vertical.offset = posV['wp:posOffset'][0];
            }
        }

        // Analizar wrapping
        this.analyzeWrapping(anchor, imageInfo);

        // Obtener dimensiones
        if (anchor['wp:extent']) {
            const extent = anchor['wp:extent'][0]['$'];
            if (extent) {
                imageInfo.dimensiones.cx = extent.cx;
                imageInfo.dimensiones.cy = extent.cy;
                imageInfo.dimensiones.cx_pixels = Math.round(parseInt(extent.cx) / 9525);
                imageInfo.dimensiones.cy_pixels = Math.round(parseInt(extent.cy) / 9525);
            }
        }

        // Buscar blip para ID de imagen
        this.findBlipInfo(anchor, imageInfo);
    }

    analyzeWrapping(anchor, imageInfo) {
        // Verificar diferentes tipos de wrapping
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
                imageInfo.formato.wrapping = {
                    tipo: wrapTypeName,
                    propiedades: anchor[wrapType][0]['$'] || {}
                };
                
                if (wrapTypeName === 'none') {
                    imageInfo.formato.wrapping.descripcion = 'Behind text - no wrapping';
                } else if (wrapTypeName === 'square') {
                    imageInfo.formato.wrapping.descripcion = 'Square - text wraps around image';
                } else if (wrapTypeName === 'topandbottom') {
                    imageInfo.formato.wrapping.descripcion = 'Top and bottom - text above and below';
                }
            }
        });
    }

    findBlipInfo(element, imageInfo) {
        // Buscar recursivamente a:blip para obtener r:embed
        const findBlip = (obj) => {
            if (typeof obj !== 'object' || obj === null) return;
            
            if (obj['a:blip']) {
                const blip = obj['a:blip'][0];
                if (blip['$'] && blip['$']['r:embed']) {
                    imageInfo.relacionId = blip['$']['r:embed'];
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

    analyzePict(pict, imagesList, context) {
        console.log(`🖼️ Encontrado pict en ${context}`);
        
        const imageInfo = {
            tipo: 'pict',
            contexto: context,
            formato: {},
            posicionamiento: { tipo: 'legacy' },
            dimensiones: {}
        };

        // Analizar elementos VML (legacy)
        // Esto es más complejo y depende del formato específico

        imagesList.push(imageInfo);
    }

    analyzeHeaderStructure(parsed) {
        return {
            paragraphs: this.countElements(parsed, 'w:p'),
            tables: this.countElements(parsed, 'w:tbl'),
            drawings: this.countElements(parsed, 'w:drawing'),
            pictures: this.countElements(parsed, 'w:pict')
        };
    }

    countElements(obj, elementName) {
        let count = 0;
        
        const countRecursive = (element) => {
            if (typeof element !== 'object' || element === null) return;
            
            if (element[elementName]) {
                count += element[elementName].length;
            }
            
            Object.values(element).forEach(value => {
                if (Array.isArray(value)) {
                    value.forEach(item => countRecursive(item));
                } else if (typeof value === 'object') {
                    countRecursive(value);
                }
            });
        };
        
        countRecursive(obj);
        return count;
    }

    async analyzeDocumentRelations() {
        // Analizar relaciones para mapear IDs de imagen
        const relsFiles = [
            'word/_rels/header1.xml.rels',
            'word/_rels/header2.xml.rels'
        ];

        for (const relsFile of relsFiles) {
            const relsEntry = this.zip.getEntry(relsFile);
            if (relsEntry) {
                const xmlContent = relsEntry.getData().toString('utf8');
                const parsed = await this.parser.parseStringPromise(xmlContent);
                
                if (parsed.Relationships && parsed.Relationships.Relationship) {
                    parsed.Relationships.Relationship.forEach(rel => {
                        const attrs = rel['$'];
                        if (attrs.Type && attrs.Type.includes('image')) {
                            this.results.formatoImagenes[attrs.Id] = {
                                archivo: attrs.Target,
                                tipo: attrs.Type
                            };
                        }
                    });
                }
            }
        }
    }

    async saveResults() {
        const timestamp = Date.now();
        const outputPath = `c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_js\\output\\image_formatting_${timestamp}.json`;
        
        fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
        console.log(`💾 Resultados guardados en: ${outputPath}`);
    }
}

// Ejecutar si se llama directamente
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
    const docxPath = 'c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_js\\uploads\\PUMA MES 6 2025.docx';
    
    const analyzer = new ImageFormattingAnalyzer(docxPath);
    analyzer.analyze().catch(console.error);
}

export default ImageFormattingAnalyzer;
