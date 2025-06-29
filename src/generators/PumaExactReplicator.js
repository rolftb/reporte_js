/**
 * Generador de Documento PUMA - Replicador Exacto
 * 
 * Este generador replica exactamente el contenido del documento:
 * "PUMA MES 6 2025.docx" basado en el análisis profundo realizado.
 * 
 * DATOS EXTRAÍDOS DEL DOCUMENTO ORIGINAL:
 * - Empresa: PUMA ENERGY CHILE S.A.
 * - Actividad: Programa de Calidad de Vida
 * - Período: 21 de mayo al 20 de junio
 * - Lugar: Av. Pdte. Kennedy 5454
 * - 4 sesiones documentadas con fechas y participantes específicos
 * - 16 imágenes reales de las actividades
 */

import { Document, Packer, Paragraph, TextRun, ImageRun, Header, SectionType, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, TextWrappingType, TextWrappingSide, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, HorizontalPositionAlign, VerticalPositionAlign } from 'docx';
import fs from 'fs-extra';
import path from 'path';

class PumaExactReplicatorGenerator {
    constructor(useRealImages = true) {
        this.useRealImages = useRealImages;
        this.extractedImagesPath = './extracted_images';
        this.imageRegistry = null;
        
        // Datos exactos extraídos del documento original
        this.documentData = {
            empresa: "PUMA ENERGY CHILE S.A.",
            actividad: "Programa de Calidad de Vida",
            fechaPeriodo: "Desde el 21 de mayo al al 20 de junio",
            lugar: "Av. Pdte. Kennedy 5454",
            profesional: "Profesional área Calidad de Vida - Mutual Asesorías.",
            
            // Sesiones exactas del documento
            sesiones: [
                {
                    fecha: "27-05-2025",
                    cantidadPausas: "1",
                    participantes: "16"
                },
                {
                    fecha: "03-06-2025", 
                    cantidadPausas: "1",
                    participantes: "12"
                },
                {
                    fecha: "10-06-2025",
                    cantidadPausas: "1", 
                    participantes: "18"
                },
                {
                    fecha: "17-06-2025",
                    cantidadPausas: "1",
                    participantes: "16"
                }
            ]
        };

        this.config = {
            margins: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
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
                console.log(`📋 Registro cargado: ${Object.keys(this.imageRegistry).length} imágenes disponibles`);
            } else {
                console.log('⚠️ No se encontró registro de imágenes extraídas');
                console.log('💡 Ejecuta: node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"');
            }
        } catch (error) {
            console.error('❌ Error cargando imágenes:', error.message);
            this.useRealImages = false;
        }
    }

    async createImageRun(imageName, width = 200, height = 150) {
        if (!this.useRealImages) {
            return new TextRun({
                text: `[${imageName}]`,
                color: "666666",
                italics: true
            });
        }

        try {
            // Buscar imagen en el registro
            let imageInfo = null;
            if (this.imageRegistry) {
                for (const [hash, info] of Object.entries(this.imageRegistry)) {
                    // Mapear nombres personalizados a nombres originales
                    let searchName = imageName;
                    if (imageName === "encabezado_default") {
                        searchName = "image17.jpeg";
                    } else if (imageName === "image_primera_pagina") {
                        searchName = "image18.jpeg";
                    }
                    
                    // Buscar por nombre de imagen (ej: "image1.jpeg" en "word/media/image1.jpeg")
                    if (info.originalPath.includes(searchName) || info.originalPath.endsWith(searchName)) {
                        imageInfo = info;
                        break;
                    }
                }
            }

            if (imageInfo) {
                const imagePath = path.join(this.extractedImagesPath, imageInfo.fileName);
                if (await fs.pathExists(imagePath)) {
                    const imageBuffer = await fs.readFile(imagePath);
                    return new ImageRun({
                        data: imageBuffer,
                        transformation: {
                            width: width,
                            height: height,
                        },
                    });
                }
            }

            // Fallback a placeholder
            return new TextRun({
                text: `[${imageName}]`,
                color: "666666",
                italics: true
            });

        } catch (error) {
            console.log(`⚠️ No se pudo cargar imagen ${imageName}: ${error.message}`);
            return new TextRun({
                text: `[${imageName}]`,
                color: "666666",
                italics: true
            });
        }
    }

    /**
     * Crea una imagen para el header con formato específico que no desplace el contenido
     * Basado en el análisis del documento original que usa wp:wrapNone (behind text)
     */
    async createHeaderImageRun(imageName, width = 200, height = 150, positioning = {}) {
        if (!this.useRealImages) {
            return new TextRun({
                text: `[${imageName}]`,
                color: "666666",
                italics: true
            });
        }

        try {
            // Buscar imagen en el registro
            let imageInfo = null;
            if (this.imageRegistry) {
                for (const [hash, info] of Object.entries(this.imageRegistry)) {
                    // Mapear nombres personalizados a nombres originales
                    let searchName = imageName;
                    if (imageName === "encabezado_default") {
                        searchName = "image17.jpeg";
                    } else if (imageName === "image_primera_pagina") {
                        searchName = "image18.jpeg";
                    }
                    
                    // Buscar por nombre de imagen (ej: "image1.jpeg" en "word/media/image1.jpeg")
                    if (info.originalPath.includes(searchName) || info.originalPath.endsWith(searchName)) {
                        imageInfo = info;
                        break;
                    }
                }
            }

            if (imageInfo) {
                const imagePath = path.join(this.extractedImagesPath, imageInfo.fileName);
                if (await fs.pathExists(imagePath)) {
                    const imageBuffer = await fs.readFile(imagePath);
                    
                    // Configuración de imagen para header basada en análisis XML
                    // El documento original usa wp:wrapNone (behind text) y posicionamiento absoluto
                    const imageRunConfig = {
                        data: imageBuffer,
                        transformation: {
                            width: width,
                            height: height,
                        },
                        // Configuración de posicionamiento que evita desplazar contenido
                        floating: {
                            horizontalPosition: {
                                relative: HorizontalPositionRelativeFrom.PAGE,
                                align: HorizontalPositionAlign.LEFT,
                                offset: positioning.horizontalOffset || 0,
                            },
                            verticalPosition: {
                                relative: VerticalPositionRelativeFrom.PAGE,
                                align: VerticalPositionAlign.TOP,
                                offset: positioning.verticalOffset || 0,
                            },
                            // Importante: Behind text para que no desplace contenido
                            wrap: {
                                type: TextWrappingType.NONE, // Equivale a wp:wrapNone del XML
                                side: TextWrappingSide.BOTH_SIDES,
                            },
                            allowOverlap: true, // Permite superposición como en el original
                            layoutInCell: true, // Mantiene imagen dentro del header
                        }
                    };

                    return new ImageRun(imageRunConfig);
                }
            }

            // Fallback a placeholder
            return new TextRun({
                text: `[${imageName}]`,
                color: "666666",
                italics: true
            });

        } catch (error) {
            console.log(`⚠️ No se pudo cargar imagen del header ${imageName}: ${error.message}`);
            return new TextRun({
                text: `[${imageName}]`,
                color: "666666",
                italics: true
            });
        }
    }

    createAspectosTable() {
        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "ASPECTOS TÉCNICOS DE LA ACTIVIDAD EN TERRENO",
                                            bold: true,
                                            size: 22,
                                            color: "FFFFFF" // Texto blanco
                                        })
                                    ],
                                    alignment: AlignmentType.CENTER,
                                })
                            ],
                            columnSpan: 2,
                            shading: {
                                type: ShadingType.SOLID,
                                color: "4472C4", // Fondo azul corporativo típico de PUMA
                            },
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
                                            text: "Nombre de la actividad",
                                            bold: true
                                        })
                                    ]
                                })
                            ],
                            width: { size: 30, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: this.documentData.actividad
                                        })
                                    ]
                                })
                            ],
                            width: { size: 70, type: WidthType.PERCENTAGE },
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
                                            text: "Fecha",
                                            bold: true
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: this.documentData.fechaPeriodo
                                        })
                                    ]
                                })
                            ]
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
                                            text: "Lugar",
                                            bold: true
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: this.documentData.lugar
                                        })
                                    ]
                                })
                            ]
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
                                            text: "Profesional a cargo",
                                            bold: true
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: this.documentData.profesional
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    createSesionTable(sesion) {
        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Fecha",
                                            bold: true
                                        })
                                    ]
                                })
                            ],
                            width: { size: 30, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: sesion.fecha
                                        })
                                    ]
                                })
                            ],
                            width: { size: 70, type: WidthType.PERCENTAGE },
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
                                            bold: true
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: sesion.cantidadPausas
                                        })
                                    ]
                                })
                            ]
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
                                            text: "Participantes pausa nº1",
                                            bold: true
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: sesion.participantes
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    getImageNumbersForSession(sessionIndex) {
        // Distribución más realista de imágenes basada en el análisis del documento
        const imageDistribution = [
            [1, 2, 3, 4], // Sesión 1: imágenes 1-4
            [5, 6, 7, 8], // Sesión 2: imágenes 5-8  
            [9, 10, 11, 12], // Sesión 3: imágenes 9-12
            [13, 14, 15, 16]  // Sesión 4: imágenes 13-16
        ];
        
        return imageDistribution[sessionIndex] || [];
    }

    async generateDocument() {
        console.log('🏗️ Generando replicación exacta del documento PUMA...');
        await this.loadExtractedImages();

        const children = [];

        // Agregar tabla de aspectos técnicos
        children.push(this.createAspectosTable());
        children.push(new Paragraph({ text: "" })); // Espacio

        // Agregar imágenes y tablas de cada sesión
        for (let i = 0; i < this.documentData.sesiones.length; i++) {
            const sesion = this.documentData.sesiones[i];
            
            // Agregar tabla de sesión
            children.push(this.createSesionTable(sesion));
            children.push(new Paragraph({ text: "" })); // Espacio

            // Agregar imágenes correspondientes a esta sesión
            // Usar distribución más realista basada en las imágenes extraídas
            const imageNumbers = this.getImageNumbersForSession(i);
            
            for (const imageNum of imageNumbers) {
                const imageName = `image${imageNum}.jpeg`;
                const imageRun = await this.createImageRun(imageName, 300, 200);
                children.push(new Paragraph({
                    children: [imageRun],
                    alignment: AlignmentType.CENTER
                }));
                children.push(new Paragraph({ text: "" })); // Espacio entre imágenes
            }

            // Salto de página entre sesiones (excepto la última)
            if (i < this.documentData.sesiones.length - 1) {
                children.push(new Paragraph({
                    pageBreakBefore: true,
                    text: ""
                }));
            }
        }

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: this.config.margins,
                    },
                    titlePage: true, // Habilita header diferente para primera página
                },
                headers: {
                    // Header para la primera página - con imágenes según especificaciones originales
                    first: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    // Primera imagen: offset horizontal 19050, vertical -133350
                                    await this.createHeaderImageRun("encabezado_default", 814, 1072, {
                                        horizontalOffset: Math.round(19050 / 635), // Convertir EMUs a puntos
                                        verticalOffset: Math.round(-133350 / 635)
                                    }),
                                ],
                                alignment: AlignmentType.LEFT, // Cambio a LEFT para posicionamiento absoluto
                            }),
                            new Paragraph({
                                children: [
                                    // Segunda imagen: offset horizontal 457007, vertical 914207  
                                    await this.createHeaderImageRun("encabezado_default", 816, 1042, {
                                        horizontalOffset: Math.round(457007 / 635),
                                        verticalOffset: Math.round(914207 / 635)
                                    }),
                                ],
                                alignment: AlignmentType.LEFT,
                            }),
                            new Paragraph({
                                children: [
                                    // Tercera imagen: offset horizontal 19878, vertical 19878
                                    await this.createHeaderImageRun("image_primera_pagina", 814, 1172, {
                                        horizontalOffset: Math.round(19878 / 635),
                                        verticalOffset: Math.round(19878 / 635)
                                    }),
                                ],
                                alignment: AlignmentType.LEFT,
                            })
                        ]
                    }),
                    // Header para páginas siguientes - solo una imagen según especificaciones
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    // Imagen única: offset horizontal 0, vertical 0
                                    await this.createHeaderImageRun("image_primera_pagina", 820, 1150, {
                                        horizontalOffset: 0,
                                        verticalOffset: 0
                                    }),
                                ],
                                alignment: AlignmentType.LEFT,
                            })
                        ]
                    })
                },
                children: children
            }]
        });

        console.log('✅ Documento PUMA generado exitosamente');
        console.log(`📊 Datos utilizados:`);
        console.log(`   - Empresa: ${this.documentData.empresa}`);
        console.log(`   - Actividad: ${this.documentData.actividad}`);
        console.log(`   - Período: ${this.documentData.fechaPeriodo}`);
        console.log(`   - Sesiones documentadas: ${this.documentData.sesiones.length}`);
        console.log(`   - Total participantes: ${this.documentData.sesiones.reduce((sum, s) => sum + parseInt(s.participantes), 0)}`);

        return doc;
    }
}

export { PumaExactReplicatorGenerator };
