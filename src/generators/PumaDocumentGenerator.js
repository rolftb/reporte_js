import { Document, Packer, Table, TableCell, TableRow, Paragraph, TextRun, Header, SectionType, AlignmentType, WidthType, BorderStyle } from 'docx';
import fs from 'fs-extra';
import path from 'path';

/**
 * Generador específico para replicar la estructura exacta de PUMA MES 6 2025.docx
 * 
 * ESTRUCTURA REAL IDENTIFICADA tras análisis:
 * - Header: 3 imágenes posicionadas específicamente (logos corporativos)
 * - Página 1: Título PUMA + Tabla Aspectos Técnicos
 * - Páginas 2+: Una actividad por página con tabla de registro + máximo 4 fotos por página
 * - Total: 18 archivos de imagen, 5 tablas, distribución específica por página
 */
class PumaDocumentGenerator {
  constructor() {
    this.config = {
      primaryColor: "003366",
      secondaryColor: "F5F5F5", 
      borderColor: "CCCCCC",
      headerColor: "FFFFFF",
      
      fontFamily: "Arial",
      titleFontSize: 28,
      headerFontSize: 24,
      tableFontSize: 20,
      
      margins: {
        top: 1440,
        right: 1440,
        bottom: 1440,
        left: 1440
      },
      
      imageConfig: {
        photos: {
          maxPerPage: 4,
          gridColumns: 2
        }
      }
    };
  }

  async generateDocument(data) {
    console.log('📄 Generando documento con estructura PUMA por páginas...');
    
    const sections = [];
    
    // PÁGINA 1: Portada
    sections.push({
      properties: {
        page: { margin: this.config.margins }
      },
      headers: {
        default: this.createMainHeader(data)
      },
      children: [
        this.createMainTitle(data.empresa || "PUMA"),
        new Paragraph({ children: [new TextRun("")] }),
        this.createAspectosTecnicosTable(data)
      ]
    });
    
    // PÁGINAS 2+: Una por actividad
    const registros = data.registros || this.getDefaultRegistros();
    
    registros.forEach((registro, index) => {
      const fotos = this.limitPhotosPerPage(registro.fotos || this.getDefaultPhotos(index), 4);
      
      sections.push({
        properties: {
          page: { margin: this.config.margins },
          type: SectionType.NEXT_PAGE
        },
        headers: {
          default: this.createActivityHeader(data, registro, index + 1)
        },
        children: [
          this.createActivityTitle(registro, index + 1),
          new Paragraph({ children: [new TextRun("")] }),
          this.createActivityRegistrationTable(registro),
          new Paragraph({ children: [new TextRun("")] }),
          new Paragraph({ children: [new TextRun("")] }),
          this.createPhotoGrid(fotos, index + 1)
        ]
      });
    });

    return new Document({ sections: sections });
  }

  createMainHeader(data) {
    return new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "REGISTRO FOTOGRÁFICO DE LA ACTIVIDAD",
              bold: true,
              size: this.config.headerFontSize,
              color: this.config.headerColor,
              font: this.config.fontFamily
            })
          ],
          shading: { fill: this.config.primaryColor }
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "[LOGO MUTUAL] [MEDIOS VERIFICADORES] [CALIDAD DE VIDA]",
              size: 16,
              color: this.config.borderColor,
              font: this.config.fontFamily
            })
          ]
        })
      ]
    });
  }

  createActivityHeader(data, registro, activityNumber) {
    return new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `REGISTRO FOTOGRÁFICO - ACTIVIDAD ${activityNumber}`,
              bold: true,
              size: this.config.headerFontSize,
              color: this.config.headerColor,
              font: this.config.fontFamily
            })
          ],
          shading: { fill: this.config.primaryColor }
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Fecha: ${registro.fecha} | ${data.empresa || "PUMA"}`,
              size: 18,
              font: this.config.fontFamily
            })
          ]
        })
      ]
    });
  }

  createMainTitle(empresa) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: empresa,
          bold: true,
          size: this.config.titleFontSize,
          font: this.config.fontFamily
        })
      ]
    });
  }

  createActivityTitle(registro, numeroActividad) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `ACTIVIDAD ${numeroActividad} - ${registro.fecha}`,
          bold: true,
          size: this.config.tableFontSize + 2,
          font: this.config.fontFamily,
          color: this.config.primaryColor
        })
      ]
    });
  }

  createAspectosTecnicosTable(data) {
    const rows = [
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
                    color: this.config.headerColor,
                    size: this.config.headerFontSize
                  })
                ]
              })
            ],
            columnSpan: 2,
            shading: { fill: this.config.primaryColor },
            borders: this.getTableBorders()
          })
        ]
      }),
      this.createDataRow("Nombre de la actividad", data.nombreActividad || "Programa de Calidad de Vida."),
      this.createDataRow("Fecha", data.fechaRango || "Desde el 21 de mayo al al 20 de junio"),
      this.createDataRow("Lugar", data.lugar || "Av. Pdte. Kennedy 5454"),
      this.createDataRow("Profesional a cargo", data.profesional || "Profesional área Calidad de Vida - Mutual Asesorías.")
    ];

    return new Table({
      rows: rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [40, 60]
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
                  size: this.config.tableFontSize,
                  font: this.config.fontFamily
                })
              ]
            })
          ],
          borders: this.getTableBorders(),
          width: { size: 40, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: value,
                  size: this.config.tableFontSize,
                  font: this.config.fontFamily
                })
              ]
            })
          ],
          borders: this.getTableBorders(),
          width: { size: 60, type: WidthType.PERCENTAGE }
        })
      ]
    });
  }

  createActivityRegistrationTable(registro) {
    return new Table({
      rows: [
        this.createRegistroRow("Fecha", registro.fecha),
        this.createRegistroRow("Cantidad de pausas", registro.cantidadPausas.toString()),
        this.createRegistroRow("Participantes pausa nº1", registro.participantes.toString())
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [50, 50]
    });
  }

  createRegistroRow(label, value) {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: label,
                  bold: true,
                  size: 18,
                  font: this.config.fontFamily
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
                  text: value,
                  size: 18,
                  font: this.config.fontFamily
                })
              ]
            })
          ],
          borders: this.getTableBorders()
        })
      ]
    });
  }

  createPhotoGrid(fotos, activityNumber) {
    const limitedPhotos = fotos.slice(0, this.config.imageConfig.photos.maxPerPage);
    
    if (limitedPhotos.length === 0) {
      return new Paragraph({
        children: [
          new TextRun({
            text: "Sin fotografías disponibles para esta actividad",
            italic: true,
            color: this.config.borderColor
          })
        ]
      });
    }

    const rows = [];
    
    for (let i = 0; i < limitedPhotos.length; i += 2) {
      const foto1 = limitedPhotos[i];
      const foto2 = limitedPhotos[i + 1] || null;
      
      rows.push(new TableRow({
        children: [
          this.createPhotoCell(foto1, i + 1),
          foto2 ? this.createPhotoCell(foto2, i + 2) : this.createEmptyPhotoCell()
        ]
      }));
    }

    return new Table({
      rows: rows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    });
  }

  createPhotoCell(foto, numero) {
    return new TableCell({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `[FOTO ${numero}]`,
              size: 16,
              font: this.config.fontFamily,
              color: this.config.borderColor
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: foto.descripcion || `Descripción de la foto ${numero}`,
              size: 14,
              font: this.config.fontFamily,
              italic: true
            })
          ]
        })
      ],
      borders: this.getTableBorders(),
      width: { size: 50, type: WidthType.PERCENTAGE }
    });
  }

  createEmptyPhotoCell() {
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun("")] })],
      borders: this.getTableBorders(),
      width: { size: 50, type: WidthType.PERCENTAGE }
    });
  }

  limitPhotosPerPage(fotos, maxFotos = 4) {
    if (!fotos || fotos.length === 0) return [];
    return fotos.slice(0, maxFotos);
  }

  getTableBorders() {
    return {
      top: { style: BorderStyle.SINGLE, size: 1, color: this.config.borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: this.config.borderColor },
      left: { style: BorderStyle.SINGLE, size: 1, color: this.config.borderColor },
      right: { style: BorderStyle.SINGLE, size: 1, color: this.config.borderColor }
    };
  }

  getDefaultPhotos(activityIndex) {
    return [
      { descripcion: "Vista general de la actividad" },
      { descripcion: "Participantes durante la pausa" },
      { descripcion: "Desarrollo de la actividad" },
      { descripcion: "Cierre de la actividad" }
    ];
  }

  getDefaultRegistros() {
    return [
      {
        fecha: "27-05-2025",
        cantidadPausas: 1,
        participantes: 16,
        fotos: this.getDefaultPhotos(0)
      },
      {
        fecha: "03-06-2025",
        cantidadPausas: 1,
        participantes: 12,
        fotos: this.getDefaultPhotos(1)
      },
      {
        fecha: "10-06-2025",
        cantidadPausas: 1,
        participantes: 18,
        fotos: this.getDefaultPhotos(2)
      },
      {
        fecha: "17-06-2025",
        cantidadPausas: 1,
        participantes: 16,
        fotos: this.getDefaultPhotos(3)
      }
    ];
  }

  async generateAndSave(data, outputPath) {
    try {
      console.log('🔧 Iniciando generación del documento PUMA...');
      
      const doc = await this.generateDocument(data);
      const buffer = await Packer.toBuffer(doc);
      
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, buffer);
      
      console.log(`✅ Documento generado exitosamente: ${outputPath}`);
      console.log(`📊 Estructura generada:`);
      console.log(`   - Página 1: Título + Aspectos Técnicos`);
      console.log(`   - Páginas 2+: ${data.registros?.length || 4} actividades con tablas y fotos (máx 4 c/u)`);
      
      return { success: true, path: outputPath };
      
    } catch (error) {
      console.error('❌ Error generando documento:', error);
      return { success: false, error: error.message };
    }
  }
}

export default PumaDocumentGenerator;
