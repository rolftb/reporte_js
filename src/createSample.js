import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import fs from 'fs-extra';
import path from 'path';

/**
 * Crea un documento DOCX de ejemplo para probar el escáner
 */
async function createSampleDocument() {
  try {
    console.log('📝 Creando documento DOCX de ejemplo...');
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Título principal
          new Paragraph({
            text: "Documento de Ejemplo para Análisis",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Subtítulo
          new Paragraph({
            text: "Reporteador de Empresas - Sistema de Análisis DOCX",
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          
          // Encabezado nivel 1
          new Paragraph({
            text: "1. Introducción",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          
          // Párrafo normal
          new Paragraph({
            children: [
              new TextRun({
                text: "Este documento ha sido creado automáticamente para demostrar las capacidades del sistema de análisis de documentos DOCX. El sistema puede extraer texto, analizar estructura, detectar elementos como tablas e imágenes, y generar reportes detallados.",
                size: 24
              })
            ],
            spacing: { after: 200 }
          }),
          
          // Encabezado nivel 2
          new Paragraph({
            text: "1.1 Características del Sistema",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          
          // Lista con viñetas simulada
          new Paragraph({
            children: [
              new TextRun({
                text: "• Análisis automático de documentos Word\n• Extracción de texto y estructura\n• Detección de elementos multimedia\n• Generación de reportes en formato JSON\n• Compatible con .docx y .doc",
                size: 24
              })
            ],
            spacing: { after: 300 }
          }),
          
          // Encabezado nivel 1
          new Paragraph({
            text: "2. Especificaciones Técnicas",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          
          // Tabla de ejemplo
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Componente", alignment: AlignmentType.CENTER })],
                    width: { size: 30, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Tecnología", alignment: AlignmentType.CENTER })],
                    width: { size: 35, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Versión", alignment: AlignmentType.CENTER })],
                    width: { size: 35, type: WidthType.PERCENTAGE }
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Backend" })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Node.js + Express" })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "22.16.0" })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Procesamiento DOCX" })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "docx + mammoth" })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "8.5.0 + 1.9.1" })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Imágenes" })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Sharp" })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "0.33.5" })],
                  }),
                ],
              }),
            ],
          }),
          
          // Espacio después de la tabla
          new Paragraph({
            text: "",
            spacing: { after: 300 }
          }),
          
          // Otro encabezado
          new Paragraph({
            text: "3. Resultados Esperados",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          
          // Párrafo con formato
          new Paragraph({
            children: [
              new TextRun({
                text: "Al ejecutar el análisis sobre este documento, el sistema debería detectar:",
                size: 24
              })
            ],
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "✓ ",
                size: 24,
                color: "00FF00"
              }),
              new TextRun({
                text: "Estructura jerárquica con 3 encabezados de nivel 1 y 1 de nivel 2\n",
                size: 24
              }),
              new TextRun({
                text: "✓ ",
                size: 24,
                color: "00FF00"
              }),
              new TextRun({
                text: "Presencia de una tabla con 4 filas y 3 columnas\n",
                size: 24
              }),
              new TextRun({
                text: "✓ ",
                size: 24,
                color: "00FF00"
              }),
              new TextRun({
                text: "Aproximadamente 200-300 palabras de contenido\n",
                size: 24
              }),
              new TextRun({
                text: "✓ ",
                size: 24,
                color: "00FF00"
              }),
              new TextRun({
                text: "Múltiples párrafos con diferentes estilos",
                size: 24
              })
            ],
            spacing: { after: 400 }
          }),
          
          // Pie del documento
          new Paragraph({
            text: "— Fin del Documento —",
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `Generado automáticamente el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
                size: 20,
                italics: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 }
          })
        ]
      }]
    });
    
    // Asegurar que existe el directorio templates
    await fs.ensureDir('templates');
    
    // Generar el archivo
    const fileName = 'documento-ejemplo-analisis.docx';
    const outputPath = path.join('templates', fileName);
    
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
    
    console.log(`✅ Documento creado exitosamente: ${outputPath}`);
    console.log(`📊 Tamaño: ${(buffer.length / 1024).toFixed(2)} KB`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error creando documento de ejemplo:', error);
    throw error;
  }
}

// Ejecutar si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleDocument();
}

export default createSampleDocument;
