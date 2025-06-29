/**
 * Generador PUMA que replica la estructura REAL del documento
 * 
 * ESTRUCTURA REAL IDENTIFICADA:
 * - Header: Completamente compuesto de imágenes (logos corporativos)
 * - Páginas: Principalmente imágenes con mínimo texto
 * - Formato corregido para evitar archivos DOCX rotos
 */

import { 
    Document, Packer, Paragraph, TextRun, ImageRun, Header, SectionType, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign
} from 'docx';
import fs from 'fs-extra';
import path from 'path';

class PumaRealStructureGenerator {
    constructor(useRealImages = true) {
        this.useRealImages = useRealImages;
        this.extractedImagesPath = './extracted_images';
        this.imageRegistry = null;
        this.headerImages = [];
        this.documentImages = [];
        
        this.config = {
            margins: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
            },
            colors: {
                headerBg: "003366",
                headerText: "FFFFFF",
                borderColor: "000000"
            }
        };
    }

    async loadExtractedImages() {
        if (!this.useRealImages) {
            console.log('🖼️ Modo placeholder activado');
            return;
        }

        try {
            const registryPath = path.join(this.extractedImagesPath, 'image_registry.json');
            
            if (await fs.pathExists(registryPath)) {
                const registry = await fs.readJson(registryPath);
                
                // Verificar si es la nueva estructura v3.0
                if (registry.metadata && registry.metadata.version === "3.0") {
                    console.log(`📋 Registro v3.0 cargado: ${registry.metadata.totalImages} imágenes`);
                    console.log(`🎯 Características: ${registry.metadata.features.join(', ')}`);
                    
                    this.imageRegistry = registry;
                    
                    // Clasificar imágenes usando la nueva estructura
                    for (const [hash, imageInfo] of Object.entries(registry.images)) {
                        // Determinar si es imagen de header según contexto o path
                        const isHeaderImage = imageInfo.context?.isInHeader || 
                                             imageInfo.originalPath.includes('image18.') || 
                                             imageInfo.originalPath.includes('image17.');
                        
                        if (isHeaderImage) {
                            this.headerImages.push({
                                ...imageInfo,
                                hash: hash,
                                isFirstPage: imageInfo.originalPath.includes('image18.')
                            });
                        } else {
                            this.documentImages.push({
                                ...imageInfo,
                                hash: hash
                            });
                        }
                    }
                    
                    console.log(`📊 Estadísticas del análisis:`);
                    console.log(`   - Imágenes con recorte: ${registry.statistics?.withCropping || 0}`);
                    console.log(`   - Imágenes flotantes: ${registry.statistics?.byPosition?.floating || 0}`);
                    console.log(`   - Dimensiones promedio: ${registry.statistics?.avgDimensions?.width}x${registry.statistics?.avgDimensions?.height}`);
                    
                } else {
                    // Estructura legacy
                    console.log(`📋 Registro legacy cargado: ${Object.keys(registry).length} imágenes`);
                    this.imageRegistry = registry;
                    
                    // Clasificar imágenes según estructura legacy
                    for (const [hash, imageInfo] of Object.entries(registry)) {
                        // Saltar metadata si existe
                        if (hash === 'metadata') continue;
                        
                        const isHeaderImage = imageInfo.originalPath?.includes('image18.') || 
                                             imageInfo.originalPath?.includes('image17.');
                        
                        if (isHeaderImage) {
                            this.headerImages.push({
                                ...imageInfo,
                                hash: hash,
                                isFirstPage: imageInfo.originalPath?.includes('image18.')
                            });
                        } else {
                            this.documentImages.push({
                                ...imageInfo,
                                hash: hash
                            });
                        }
                    }
                }
                
                console.log(`🎯 Imágenes de header: ${this.headerImages.length}`);
                console.log(`🖼️ Imágenes de documento: ${this.documentImages.length}`);
                
            } else {
                console.warn('⚠️ No se encontró registro de imágenes');
            }
        } catch (error) {
            console.error('❌ Error cargando imágenes:', error);
            this.useRealImages = false;
        }
    }

    async createImageHeader(isFirstPage = false) {
        // Header simplificado para evitar problemas de estructura
        const headerChildren = [];
        
        // Logos del header según página
        if (this.useRealImages && this.headerImages.length > 0) {
            const headerImage = this.headerImages.find(img => 
                isFirstPage ? img.isFirstPage : !img.isFirstPage
            );
            
            if (headerImage) {
                let imagePath = path.join(this.extractedImagesPath, headerImage.fileName);
                
                // Alternativa: usar imágenes de media si no están en extracted_images
                if (!await fs.pathExists(imagePath)) {
                    const mediaFileName = isFirstPage ? 'header_primera_pagina.jpeg' : 'header_paginas_siguientes.jpeg';
                    imagePath = path.join('./media', mediaFileName);
                    console.log(`📁 Usando imagen de media: ${mediaFileName}`);
                }
                
                try {
                    if (await fs.pathExists(imagePath)) {
                        const imageBuffer = await fs.readFile(imagePath);
                        
                        headerChildren.push(
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new ImageRun({
                                        data: imageBuffer,
                                        transformation: {
                                            width: 600,
                                            height: 100
                                        }
                                    })
                                ]
                            })
                        );
                        
                        console.log(`✅ Header imagen agregada: ${headerImage.fileName}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Error cargando imagen header:`, error);
                }
            }
        }

        // Título del registro fotográfico como párrafo simple
        headerChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "REGISTRO FOTOGRÁFICO DE LA ACTIVIDAD",
                        bold: true,
                        size: 20,
                        color: this.config.colors.headerBg
                    })
                ]
            })
        );

        // Línea separadora
        headerChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "════════════════════════════════════════",
                        size: 12,
                        color: this.config.colors.headerBg
                    })
                ]
            })
        );

        return new Header({ children: headerChildren });
    }

    createRegistroFotograficoTable() {
        // Tabla "REGISTRO FOTOGRÁFICO DE LA ACTIVIDAD" como contenido de página
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: "REGISTRO FOTOGRÁFICO DE LA ACTIVIDAD",
                                            bold: true,
                                            size: 20,
                                            color: this.config.colors.headerText
                                        })
                                    ]
                                })
                            ],
                            shading: { fill: this.config.colors.headerBg },
                            borders: this.getTableBorders(),
                            margins: {
                                top: 150,
                                bottom: 150,
                                left: 100,
                                right: 100
                            }
                        })
                    ]
                })
            ]
        });
    }

    createAspectosTecnicosTable() {
        // Tabla "ASPECTOS TÉCNICOS DE LA ACTIVIDAD EN TERRENO" según README
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [40, 60],
            rows: [
                // Título
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: "ASPECTOS TÉCNICOS DE LA ACTIVIDAD EN TERRENO",
                                            bold: true,
                                            size: 20,
                                            color: this.config.colors.headerText
                                        })
                                    ]
                                })
                            ],
                            columnSpan: 2,
                            shading: { fill: this.config.colors.headerBg },
                            borders: this.getTableBorders(),
                            margins: {
                                top: 200,
                                bottom: 200,
                                left: 100,
                                right: 100
                            }
                        })
                    ]
                }),
                // Contenido según README
                this.createDataRow("Nombre de la actividad", "Programa de Calidad de Vida."),
                this.createDataRow("Fecha", "Desde el 21 de mayo al 20 de junio"),
                this.createDataRow("Lugar", "Av. Pdte. Kennedy 5454"),
                this.createDataRow("Profesional a cargo", "Profesional área Calidad de Vida - Mutual Asesorías.")
            ]
        });
    }

    createDataRow(label, value) {
        return new TableRow({
            children: [
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: label,
                                    bold: true,
                                    size: 16
                                })
                            ]
                        })
                    ],
                    borders: this.getTableBorders(),
                    margins: {
                        top: 150,
                        bottom: 150,
                        left: 100,
                        right: 100
                    }
                }),
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: value,
                                    size: 16
                                })
                            ]
                        })
                    ],
                    borders: this.getTableBorders(),
                    margins: {
                        top: 150,
                        bottom: 150,
                        left: 100,
                        right: 100
                    }
                })
            ]
        });
    }

    createActivityInfoTable(pageNumber) {
        // Tabla interna de 3 filas, 2 columnas según README
        return new Table({
            width: { size: 80, type: WidthType.PERCENTAGE },
            columnWidths: [50, 50],
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Fecha",
                                            bold: true,
                                            size: 14
                                        })
                                    ]
                                })
                            ],
                            borders: this.getTableBorders()
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `Actividad ${pageNumber}`,
                                            size: 14
                                        })
                                    ]
                                })
                            ],
                            borders: this.getTableBorders()
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Cantidad de pausas",
                                            bold: true,
                                            size: 14
                                        })
                                    ]
                                })
                            ],
                            borders: this.getTableBorders()
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "4",
                                            size: 14
                                        })
                                    ]
                                })
                            ],
                            borders: this.getTableBorders()
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Participantes",
                                            bold: true,
                                            size: 14
                                        })
                                    ]
                                })
                            ],
                            borders: this.getTableBorders()
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Trabajadores del área",
                                            size: 14
                                        })
                                    ]
                                })
                            ],
                            borders: this.getTableBorders()
                        })
                    ]
                })
            ]
        });
    }

    getTableBorders() {
        return {
            top: { style: BorderStyle.SINGLE, size: 1, color: this.config.colors.borderColor },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: this.config.colors.borderColor },
            left: { style: BorderStyle.SINGLE, size: 1, color: this.config.colors.borderColor },
            right: { style: BorderStyle.SINGLE, size: 1, color: this.config.colors.borderColor }
        };
    }

    async createImagePage(pageNumber) {
        const pageChildren = [];
        
        // Tabla del registro fotográfico al inicio de cada página
        pageChildren.push(this.createRegistroFotograficoTable());
        
        // Espacio
        pageChildren.push(new Paragraph({ children: [new TextRun("")] }));
        
        // Tabla interna de información de actividad (3 filas, 2 columnas)
        pageChildren.push(this.createActivityInfoTable(pageNumber));
        
        // Espacio antes de fotos
        pageChildren.push(new Paragraph({ children: [new TextRun("")] }));
        
        // Agregar exactamente 4 imágenes por página en formato 2x2
        const imagesPerPage = 4;
        const startIndex = (pageNumber - 1) * imagesPerPage;
        
        console.log(`📸 Página ${pageNumber}: Mostrando imágenes ${startIndex + 1} a ${Math.min(startIndex + imagesPerPage, this.documentImages.length)}`);
        
        // Crear filas para la tabla 2x2
        const tableRows = [];
        
        // Crear 2 filas de la tabla (2 filas, 2 columnas cada una)
        for (let row = 0; row < 2; row++) {
            const tableCells = [];
            
            for (let col = 0; col < 2; col++) {
                const imageIndex = startIndex + (row * 2) + col;
                let cellContent = [];
                
                if (imageIndex < this.documentImages.length) {
                    const imageInfo = this.documentImages[imageIndex];
                    const imagePath = path.join(this.extractedImagesPath, imageInfo.fileName);
                    
                    try {
                        if (await fs.pathExists(imagePath)) {
                            const imageBuffer = await fs.readFile(imagePath);
                            
                            // Imagen centrada
                            cellContent.push(
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { after: 100 },
                                    children: [
                                        new ImageRun({
                                            data: imageBuffer,
                                            transformation: {
                                                width: 200,  // Tamaño reducido para que quepan 2x2
                                                height: 150
                                            }
                                        })
                                    ]
                                })
                            );
                            
                            // Descripción de la actividad
                            cellContent.push(
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: `Actividad ${imageIndex + 1}`,
                                            size: 16,
                                            bold: true
                                        })
                                    ]
                                })
                            );
                            
                            console.log(`📸 Imagen página ${pageNumber}: ${imageInfo.fileName}`);
                        } else {
                            console.warn(`⚠️ Imagen no encontrada: ${imagePath}`);
                            cellContent.push(
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: `Imagen no disponible`,
                                            size: 12,
                                            italic: true
                                        })
                                    ]
                                })
                            );
                        }
                    } catch (error) {
                        console.warn(`⚠️ Error cargando imagen:`, error);
                        cellContent.push(
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `Error cargando imagen`,
                                        size: 12,
                                        italic: true
                                    })
                                ]
                            })
                        );
                    }
                } else {
                    // Celda vacía si no hay más imágenes
                    cellContent.push(
                        new Paragraph({
                            children: [new TextRun(" ")]
                        })
                    );
                }
                
                tableCells.push(
                    new TableCell({
                        width: {
                            size: 50,
                            type: WidthType.PERCENTAGE
                        },
                        verticalAlign: VerticalAlign.CENTER,
                        children: cellContent
                    })
                );
            }
            
            tableRows.push(
                new TableRow({
                    children: tableCells
                })
            );
        }
        
        // Crear tabla con las filas generadas
        const imageTable = new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: tableRows
        });
        
        pageChildren.push(imageTable);
        
        return pageChildren;
    }

    async generateDocument() {
        console.log('📄 Generando documento PUMA con estructura real (corregido)...');
        
        // Cargar imágenes (detecta automáticamente v3.0 vs legacy)
        await this.loadExtractedImages();
        
        const sections = [];
        
        // PRIMERA PÁGINA: Tabla de aspectos técnicos + header
        const firstPageHeader = await this.createImageHeader(true); // Header primera página
        const aspectosTecnicosTable = this.createAspectosTecnicosTable();
        
        sections.push({
            properties: {
                page: { margin: this.config.margins }
            },
            headers: {
                default: firstPageHeader
            },
            children: [
                aspectosTecnicosTable,
                new Paragraph({ children: [new TextRun("")] }), // Espacio
                new Paragraph({ children: [new TextRun("")] })  // Espacio adicional
            ]
        });
        
        // PÁGINAS SIGUIENTES: Una por cada set de 4 actividades
        const imagesPerPage = 4;
        const totalPages = Math.ceil(this.documentImages.length / imagesPerPage) || 1;
        
        console.log(`📊 Generando ${totalPages} páginas de actividades para ${this.documentImages.length} imágenes`);
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const activityPageHeader = await this.createImageHeader(false); // Header páginas siguientes
            const pageChildren = await this.createImagePage(pageNum);
            
            sections.push({
                properties: {
                    page: { margin: this.config.margins },
                    type: SectionType.NEXT_PAGE
                },
                headers: {
                    default: activityPageHeader
                },
                children: pageChildren
            });
        }
        
        return new Document({ sections: sections });
    }
}

export { PumaRealStructureGenerator };
