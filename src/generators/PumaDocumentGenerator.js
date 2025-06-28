import { Document, Packer, Table, TableCell, TableRow, Paragraph, TextRun, Header, Footer, ImageRun, AlignmentType, WidthType, HeadingLevel, BorderStyle } from 'docx';
import fs from 'fs-extra';
import path from 'path';

/**
 * Generador específico para replicar la estructura exacta de PUMA MES 6 2025.docx
 * Basado en el análisis profundo del documento original
 */
class PumaDocumentGenerator {
  constructor() {
    this.config = {
      // Colores corporativos identificados
      primaryColor: "003366",
      secondaryColor: "F5F5F5",
      borderColor: "CCCCCC",
      
      
      // Configuración de fuentes
      fontFamily: "Arial",
      
      // Configuración de márgenes (en twips: 1 inch = 1440 twips)
      margins: {
        top: 1440,    // 1 inch
        right: 1440,
        bottom: 1440,
        left: 1440
      }
    };
  }

  /**
   * Genera el documento principal con la estructura exacta identificada
   */
  async generateDocument(data) {
    console.log('📄 Generando documento con estructura PUMA...');
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: this.config.margins
          }
        },
        headers: {
          default: this.createHeader(data)
        },
        children: [
          // Título principal PUMA
          this.createMainTitle(data.empresa || "PUMA"),
          
          // Tabla 1: Aspectos Técnicos (estructura exacta identificada)
          this.createAspectosTecnicosTable(data),
          
          // Espaciado
          new Paragraph({ children: [new TextRun("")] }),
          
          // Tablas de registro por fecha (replicando las 4 tablas encontradas)
          ...this.createRegistroTables(data.registros || this.getDefaultRegistros())
        ]
      }]
    });

    return doc;
  }

  /**
   * Crea el encabezado del documento
   */
  createHeader(data) {
    return new Header({
      children: [
        // Aquí iría la banda de logos según la especificación
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "REGISTRO FOTOGRÁFICO DE LA ACTIVIDAD",
              bold: true,
              size: 24,
              color: "FFFFFF"
            })
          ]
        })
      ]
    });
  }

  /**
   * Crea el título principal PUMA
   */
  createMainTitle(empresa) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: empresa,
          bold: true,
          size: 28,
          font: this.config.fontFamily
        })
      ]
    });
  }

  /**
   * Crea la tabla principal de Aspectos Técnicos (Tabla 1 identificada)
   * Estructura exacta: 5 filas con header + 4 datos
   */
  createAspectosTecnicosTable(data) {
    const rows = [
      // Fila 1: Header (colspan=2 simulado)
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
                    color: "FFFFFF",
                    size: 24
                  })
                ]
              })
            ],
            columnSpan: 2,
            shading: {
              fill: this.config.primaryColor
            },
            borders: this.getTableBorders()
          })
        ]
      }),
      
      // Fila 2: Nombre de la actividad
      this.createDataRow("Nombre de la actividad", data.nombreActividad || "Programa de Calidad de Vida."),
      
      // Fila 3: Fecha
      this.createDataRow("Fecha", data.fechaRango || "Desde el 21 de mayo al al 20 de junio"),
      
      // Fila 4: Lugar
      this.createDataRow("Lugar", data.lugar || "Av. Pdte. Kennedy 5454"),
      
      // Fila 5: Profesional a cargo
      this.createDataRow("Profesional a cargo", data.profesional || "Profesional área Calidad de Vida - Mutual Asesorías.")
    ];

    return new Table({
      rows: rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      columnWidths: [40, 60] // 40% | 60% como especificado
    });
  }

  /**
   * Crea una fila de datos para la tabla principal
   */
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
                  size: 20,
                  font: this.config.fontFamily
                })
              ]
            })
          ],
          borders: this.getTableBorders(),
          width: {
            size: 40,
            type: WidthType.PERCENTAGE
          }
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: value,
                  size: 20,
                  font: this.config.fontFamily
                })
              ]
            })
          ],
          borders: this.getTableBorders(),
          width: {
            size: 60,
            type: WidthType.PERCENTAGE
          }
        })
      ]
    });
  }

  /**
   * Crea las tablas de registro por fecha (Tablas 2-5 identificadas)
   * Cada tabla tiene exactamente 3 filas: Fecha, Cantidad de pausas, Participantes
   */
  createRegistroTables(registros) {
    const tables = [];
    
    registros.forEach((registro, index) => {
      // Espaciado entre tablas
      if (index > 0) {
        tables.push(new Paragraph({ children: [new TextRun("")] }));
      }
      
      const registroTable = new Table({
        rows: [
          // Fila 1: Fecha
          this.createRegistroRow("Fecha", registro.fecha),
          
          // Fila 2: Cantidad de pausas
          this.createRegistroRow("Cantidad de pausas", registro.cantidadPausas.toString()),
          
          // Fila 3: Participantes pausa nº1
          this.createRegistroRow("Participantes pausa nº1", registro.participantes.toString())
        ],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        columnWidths: [50, 50]
      });
      
      tables.push(registroTable);
    });
    
    return tables;
  }

  /**
   * Crea una fila para las tablas de registro
   */
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

  /**
   * Configuración de bordes para las tablas
   */
  getTableBorders() {
    return {
      top: { style: BorderStyle.SINGLE, size: 1, color: this.config.borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: this.config.borderColor },
      left: { style: BorderStyle.SINGLE, size: 1, color: this.config.borderColor },
      right: { style: BorderStyle.SINGLE, size: 1, color: this.config.borderColor }
    };
  }

  /**
   * Datos por defecto basados en el análisis del documento original
   */
  getDefaultRegistros() {
    return [
      {
        fecha: "27-05-2025",
        cantidadPausas: 1,
        participantes: 16
      },
      {
        fecha: "03-06-2025",
        cantidadPausas: 1,
        participantes: 12
      },
      {
        fecha: "10-06-2025",
        cantidadPausas: 1,
        participantes: 18
      },
      {
        fecha: "17-06-2025",
        cantidadPausas: 1,
        participantes: 16
      }
    ];
  }

  /**
   * Genera y guarda el documento
   */
  async generateAndSave(data, outputPath) {
    try {
      console.log('🔧 Iniciando generación del documento PUMA...');
      
      const doc = await this.generateDocument(data);
      const buffer = await Packer.toBuffer(doc);
      
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, buffer);
      
      console.log(`✅ Documento generado exitosamente: ${outputPath}`);
      return { success: true, path: outputPath };
      
    } catch (error) {
      console.error('❌ Error generando documento:', error);
      return { success: false, error: error.message };
    }
  }
}

// Script de prueba
async function testPumaGenerator() {
  console.log('🧪 PRUEBA DEL GENERADOR PUMA');
  console.log('='.repeat(50));
  
  const generator = new PumaDocumentGenerator();
  
  const testData = {
    empresa: "PUMA",
    nombreActividad: "Programa de Calidad de Vida.",
    fechaRango: "Desde el 21 de mayo al al 20 de junio",
    lugar: "Av. Pdte. Kennedy 5454",
    profesional: "Profesional área Calidad de Vida - Mutual Asesorías.",
    registros: [
      {
        fecha: "27-05-2025",
        cantidadPausas: 1,
        participantes: 16
      },
      {
        fecha: "03-06-2025",
        cantidadPausas: 1,
        participantes: 12
      },
      {
        fecha: "10-06-2025",
        cantidadPausas: 1,
        participantes: 18
      },
      {
        fecha: "17-06-2025",
        cantidadPausas: 1,
        participantes: 16
      }
    ]
  };
  
  const outputPath = path.join('output', `puma_replica_${Date.now()}.docx`);
  const result = await generator.generateAndSave(testData, outputPath);
  
  if (result.success) {
    console.log('🎉 Generación exitosa!');
    console.log(`📄 Archivo: ${result.path}`);
  } else {
    console.log('❌ Error en la generación:', result.error);
  }
}

// Ejecutar prueba si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testPumaGenerator().catch(console.error);
}

export default PumaDocumentGenerator;
