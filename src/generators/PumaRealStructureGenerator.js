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
                this.imageRegistry = await fs.readJson(registryPath);
                
                console.log(`📋 Registro cargado: ${Object.keys(this.imageRegistry).length} imágenes`);
                
                // Clasificar imágenes según estructura real del README
                for (const [hash, imageInfo] of Object.entries(this.imageRegistry)) {
                    // Imágenes del header según página (image1 y image2 son header)
                    const isHeaderImage = imageInfo.originalPath.includes('image1.') || 
                                         imageInfo.originalPath.includes('image2.');
                    
                    if (isHeaderImage) {
                        this.headerImages.push({
                            ...imageInfo,
                            hash: hash,
                            isFirstPage: imageInfo.originalPath.includes('image1.') // Logo primera página
                        });
                    } else {
                        this.documentImages.push({
                            ...imageInfo,
                            hash: hash
                        });
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
                const imagePath = path.join(this.extractedImagesPath, headerImage.fileName);
                
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
        
        // Agregar hasta 4 imágenes por página según README
        const imagesPerPage = 4;
        const startIndex = (pageNumber - 1) * imagesPerPage;
        
        // Crear grid para las fotos
        for (let i = 0; i < imagesPerPage && (startIndex + i) < this.documentImages.length; i++) {
            const imageInfo = this.documentImages[startIndex + i];
            const imagePath = path.join(this.extractedImagesPath, imageInfo.fileName);
            
            try {
                if (await fs.pathExists(imagePath)) {
                    const imageBuffer = await fs.readFile(imagePath);
                    
                    pageChildren.push(
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new ImageRun({
                                    data: imageBuffer,
                                    transformation: {
                                        width: 300,
                                        height: 225
                                    }
                                })
                            ]
                        })
                    );
                    
                    // Descripción de la foto
                    pageChildren.push(
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `Foto ${i + 1}`,
                                    size: 12,
                                    italic: true
                                })
                            ]
                        })
                    );
                    
                    // Pequeño espacio entre fotos
                    if (i < imagesPerPage - 1) {
                        pageChildren.push(new Paragraph({ children: [new TextRun("")] }));
                    }
                    
                    console.log(`📸 Imagen página ${pageNumber}: ${imageInfo.fileName}`);
                } else {
                    console.warn(`⚠️ Imagen no encontrada: ${imagePath}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error cargando imagen:`, error);
            }
        }
        
        return pageChildren;
    }

    async generateDocument() {
        console.log('📄 Generando documento PUMA con estructura real (corregido)...');
        
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
