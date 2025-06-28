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

import { Document, Packer, Paragraph, TextRun, ImageRun, Header, SectionType, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
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
                    // Buscar por nombre de imagen (ej: "image1.jpeg" en "word/media/image1.jpeg")
                    if (info.originalPath.includes(imageName) || info.originalPath.endsWith(imageName)) {
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
                                            size: 22
                                        })
                                    ],
                                    alignment: AlignmentType.CENTER,
                                })
                            ],
                            columnSpan: 2,
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
                },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    await this.createImageRun("image17.jpeg", 120, 60), // Logo izquierdo
                                    new TextRun({
                                        text: "    PUMA ENERGY CHILE S.A.    ",
                                        bold: true,
                                        size: 20
                                    }),
                                    await this.createImageRun("image18.jpeg", 120, 60), // Logo derecho
                                ],
                                alignment: AlignmentType.CENTER,
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
