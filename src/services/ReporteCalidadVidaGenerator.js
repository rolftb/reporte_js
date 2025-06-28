import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, HeadingLevel, BorderStyle } from 'docx';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

/**
 * Generador de Reportes de Calidad de Vida
 * Basado en la especificación del formato corporativo de Mutual Asesorías
 */
class ReporteCalidadVidaGenerator {
  constructor() {
    this.colores = {
      primary: '#003366',
      secondary: '#F5F5F5', 
      accent: '#FFFFFF',
      border: '#CCCCCC'
    };
  }

  /**
   * Genera el reporte completo de Calidad de Vida
   * @param {Object} datos - Datos del reporte
   * @param {Object} imagenes - Rutas de las imágenes
   * @returns {Object} Información del documento generado
   */
  async generarReporte(datos, imagenes = {}) {
    try {
      console.log('📄 Generando Reporte de Calidad de Vida...');
      
      // Validar datos requeridos
      this.validarDatos(datos);
      
      // Procesar imágenes
      const imagenesProcessed = await this.procesarImagenes(imagenes);
      
      // Crear estructura del documento
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: '2.5cm',
                right: '2.5cm', 
                bottom: '2.5cm',
                left: '2.5cm'
              }
            }
          },
          children: [
            // Encabezado con logos
            await this.crearEncabezadoLogos(datos, imagenesProcessed),
            
            // Espacio
            new Paragraph({ text: '', spacing: { after: 400 } }),
            
            // Tabla de aspectos técnicos
            await this.crearTablaAspectosTecnicos(datos),
            
            // Espacio
            new Paragraph({ text: '', spacing: { after: 400 } }),
            
            // Registro fotográfico
            await this.crearRegistroFotografico(datos, imagenesProcessed)
          ]
        }]
      });
      
      // Generar archivo
      const buffer = await Packer.toBuffer(doc);
      const fileName = this.generarNombreArchivo(datos);
      const outputPath = path.join('output', fileName);
      
      await fs.ensureDir('output');
      await fs.writeFile(outputPath, buffer);
      
      console.log(`✅ Reporte generado: ${fileName}`);
      console.log(`📊 Tamaño: ${(buffer.length / 1024).toFixed(2)} KB`);
      
      return {
        success: true,
        fileName,
        outputPath,
        size: buffer.length,
        datos_procesados: datos,
        imagenes_procesadas: Object.keys(imagenesProcessed).length
      };
      
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      throw error;
    }
  }
  
  /**
   * Valida que todos los datos requeridos estén presentes
   */
  validarDatos(datos) {
    const requeridos = [
      'nombre_empresa',
      'fecha_inicio', 
      'fecha_fin',
      'lugar_actividad',
      'profesional_cargo',
      'fecha_registro',
      'cantidad_pausas',
      'participantes_pausa1'
    ];
    
    const faltantes = requeridos.filter(campo => !datos[campo]);
    
    if (faltantes.length > 0) {
      throw new Error(`Datos requeridos faltantes: ${faltantes.join(', ')}`);
    }
  }
  
  /**
   * Crea el encabezado con logos corporativos
   */
  async crearEncabezadoLogos(datos, imagenes) {
    // Banda superior
    const bandaSuperior = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                imagenes.logo_mutual 
                  ? new Paragraph({ 
                      children: [new ImageRun({
                        data: imagenes.logo_mutual,
                        transformation: { width: 120, height: 60 }
                      })]
                    })
                  : new Paragraph({ text: '[Logo Mutual]' })
              ],
              width: { size: 33, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({
                text: 'Medios Verificadores',
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 }
              })],
              width: { size: 34, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                imagenes.logo_calidad_vida
                  ? new Paragraph({
                      children: [new ImageRun({
                        data: imagenes.logo_calidad_vida,
                        transformation: { width: 120, height: 60 }
                      })],
                      alignment: AlignmentType.RIGHT
                    })
                  : new Paragraph({ 
                      text: '[Logo Calidad de Vida]',
                      alignment: AlignmentType.RIGHT 
                    })
              ],
              width: { size: 33, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ]
    });
    
    // Banda inferior con nombre empresa
    const bandaInferior = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                imagenes.logo_mutual
                  ? new Paragraph({
                      children: [new ImageRun({
                        data: imagenes.logo_mutual,
                        transformation: { width: 120, height: 60 }
                      })]
                    })
                  : new Paragraph({ text: '[Logo Mutual]' })
              ],
              width: { size: 33, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: datos.nombre_empresa,
                  size: 32, // 16pt
                  bold: true,
                  color: '003366'
                })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 }
              })],
              width: { size: 34, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                imagenes.logo_calidad_vida
                  ? new Paragraph({
                      children: [new ImageRun({
                        data: imagenes.logo_calidad_vida,
                        transformation: { width: 120, height: 60 }
                      })],
                      alignment: AlignmentType.RIGHT
                    })
                  : new Paragraph({
                      text: '[Logo Calidad de Vida]',
                      alignment: AlignmentType.RIGHT
                    })
              ],
              width: { size: 33, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ]
    });
    
    return [bandaSuperior, bandaInferior];
  }
  
  /**
   * Crea la tabla de aspectos técnicos
   */
  async crearTablaAspectosTecnicos(datos) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Header
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: 'ASPECTOS TÉCNICOS DE LA ACTIVIDAD EN TERRENO',
                  size: 24, // 12pt
                  bold: true,
                  color: 'FFFFFF'
                })],
                alignment: AlignmentType.CENTER
              })],
              columnSpan: 2,
              shading: { fill: '003366' }
            })
          ]
        }),
        // Datos
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: 'Nombre de la actividad',
                  size: 20,
                  bold: true
                })]
              })],
              width: { size: 40, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: 'Programa de Calidad de Vida',
                  size: 20
                })]
              })],
              width: { size: 60, type: WidthType.PERCENTAGE }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: 'Fecha',
                  size: 20,
                  bold: true
                })]
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: `Desde el ${datos.fecha_inicio} al ${datos.fecha_fin}`,
                  size: 20
                })]
              })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: 'Lugar',
                  size: 20,
                  bold: true
                })]
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: datos.lugar_actividad,
                  size: 20
                })]
              })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: 'Profesional a cargo',
                  size: 20,
                  bold: true
                })]
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: datos.profesional_cargo,
                  size: 20
                })]
              })]
            })
          ]
        })
      ]
    });
  }
  
  /**
   * Crea la sección de registro fotográfico
   */
  async crearRegistroFotografico(datos, imagenes) {
    // Crear tabla principal
    const tabla = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Header
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: 'REGISTRO FOTOGRÁFICO DE LA ACTIVIDAD',
                  size: 24,
                  bold: true,
                  color: 'FFFFFF'
                })],
                alignment: AlignmentType.CENTER
              })],
              columnSpan: 2,
              shading: { fill: '003366' }
            })
          ]
        }),
        // Contenido mixto
        new TableRow({
          children: [
            // Datos de actividad
            new TableCell({
              children: [
                await this.crearSubtablaDatos(datos)
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
              verticalAlign: 'top'
            }),
            // Grid fotográfico
            new TableCell({
              children: [
                await this.crearGridFotografico(imagenes)
              ],
              width: { size: 60, type: WidthType.PERCENTAGE },
              verticalAlign: 'top'
            })
          ]
        })
      ]
    });
    
    return tabla;
  }
  
  /**
   * Crea la subtabla con datos de la actividad
   */
  async crearSubtablaDatos(datos) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Fecha', size: 20, bold: true })]
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: datos.fecha_registro, size: 20 })]
              })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Cantidad de pausas', size: 20, bold: true })]
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: datos.cantidad_pausas.toString(), size: 20 })]
              })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Participantes pausa nº1', size: 20, bold: true })]
              })]
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: datos.participantes_pausa1.toString(), size: 20 })]
              })]
            })
          ]
        })
      ]
    });
  }
  
  /**
   * Crea el grid de 2x2 para las fotografías
   */
  async crearGridFotografico(imagenes) {
    const fotos = ['foto1', 'foto2', 'foto3', 'foto4'];
    
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                imagenes[fotos[0]]
                  ? new Paragraph({
                      children: [new ImageRun({
                        data: imagenes[fotos[0]],
                        transformation: { width: 150, height: 100 }
                      })],
                      alignment: AlignmentType.CENTER
                    })
                  : new Paragraph({ 
                      text: 'Foto 1',
                      alignment: AlignmentType.CENTER
                    })
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                imagenes[fotos[1]]
                  ? new Paragraph({
                      children: [new ImageRun({
                        data: imagenes[fotos[1]],
                        transformation: { width: 150, height: 100 }
                      })],
                      alignment: AlignmentType.CENTER
                    })
                  : new Paragraph({
                      text: 'Foto 2',
                      alignment: AlignmentType.CENTER
                    })
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                imagenes[fotos[2]]
                  ? new Paragraph({
                      children: [new ImageRun({
                        data: imagenes[fotos[2]],
                        transformation: { width: 150, height: 100 }
                      })],
                      alignment: AlignmentType.CENTER
                    })
                  : new Paragraph({
                      text: 'Foto 3',
                      alignment: AlignmentType.CENTER
                    })
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                imagenes[fotos[3]]
                  ? new Paragraph({
                      children: [new ImageRun({
                        data: imagenes[fotos[3]],
                        transformation: { width: 150, height: 100 }
                      })],
                      alignment: AlignmentType.CENTER
                    })
                  : new Paragraph({
                      text: 'Foto 4',
                      alignment: AlignmentType.CENTER
                    })
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ]
    });
  }
  
  /**
   * Procesa y optimiza las imágenes para el reporte
   */
  async procesarImagenes(imagenes) {
    const processed = {};
    
    for (const [key, path] of Object.entries(imagenes || {})) {
      if (path && await fs.pathExists(path)) {
        try {
          // Determinar tamaño según tipo de imagen
          let width, height;
          if (key.includes('logo')) {
            width = 120;
            height = 60;
          } else {
            width = 150;
            height = 100;
          }
          
          // Procesar imagen
          const buffer = await sharp(path)
            .resize(width, height, {
              fit: sharp.fit.cover,
              position: sharp.strategy.centre
            })
            .jpeg({ quality: 85 })
            .toBuffer();
          
          processed[key] = buffer;
          console.log(`✅ Imagen procesada: ${key}`);
          
        } catch (error) {
          console.warn(`⚠️ Error procesando imagen ${key}:`, error.message);
        }
      }
    }
    
    return processed;
  }
  
  /**
   * Genera nombre de archivo único basado en los datos
   */
  generarNombreArchivo(datos) {
    const empresaClean = datos.nombre_empresa
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    const timestamp = new Date().toISOString().slice(0, 10);
    
    return `Reporte_CalidadVida_${empresaClean}_${timestamp}.docx`;
  }
}

export default ReporteCalidadVidaGenerator;
