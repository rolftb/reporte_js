import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType } from 'docx';
import mammoth from 'mammoth';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

class DocumentService {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'output');
    this.templateDir = path.join(process.cwd(), 'templates');
  }

  /**
   * Lee un archivo DOCX existente y extrae su contenido
   * @param {string} filePath - Ruta del archivo DOCX
   * @returns {Object} Contenido y metadatos del documento
   */
  async readDocxFile(filePath) {
    try {
      const result = await mammoth.convertToHtml({ path: filePath });
      const textContent = await mammoth.extractRawText({ path: filePath });
      
      return {
        html: result.value,
        text: textContent.value,
        messages: result.messages,
        success: true
      };
    } catch (error) {
      console.error('Error leyendo archivo DOCX:', error);
      throw new Error(`No se pudo leer el archivo DOCX: ${error.message}`);
    }
  }

  /**
   * Procesa una imagen para optimizarla antes de insertarla en el documento
   * @param {string} imagePath - Ruta de la imagen
   * @param {Object} options - Opciones de procesamiento
   * @returns {Buffer} Buffer de la imagen procesada
   */
  async processImage(imagePath, options = {}) {
    try {
      const { width = 600, height, quality = 90 } = options;
      
      let sharpImage = sharp(imagePath);
      
      // Redimensionar si se especifica
      if (width || height) {
        sharpImage = sharpImage.resize(width, height, {
          fit: sharp.fit.inside,
          withoutEnlargement: true
        });
      }
      
      // Optimizar calidad
      sharpImage = sharpImage.jpeg({ quality });
      
      return await sharpImage.toBuffer();
    } catch (error) {
      console.error('Error procesando imagen:', error);
      throw new Error(`No se pudo procesar la imagen: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo documento DOCX con contenido personalizado
   * @param {Object} data - Datos para el documento
   * @returns {Object} Información del documento generado
   */
  async createDocument(data) {
    try {
      const {
        title = 'Reporte de Empresa',
        content = '',
        company = '',
        images = [],
        template = null
      } = data;

      // Si hay una plantilla, leer su formato
      let templateFormat = null;
      if (template) {
        templateFormat = await this.readDocxFile(template);
      }

      // Crear párrafos del documento
      const documentParagraphs = [];

      // Título principal
      documentParagraphs.push(
        new Paragraph({
          text: title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // Información de la empresa
      if (company) {
        documentParagraphs.push(
          new Paragraph({
            text: `Empresa: ${company}`,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 }
          })
        );
      }

      // Contenido principal
      if (content) {
        const contentParagraphs = content.split('\n').map(line => 
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 24 // 12pt
              })
            ],
            spacing: { after: 200 }
          })
        );
        documentParagraphs.push(...contentParagraphs);
      }

      // Procesar e insertar imágenes
      for (const imagePath of images) {
        try {
          const imageBuffer = await this.processImage(imagePath);
          
          documentParagraphs.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 400,
                    height: 300,
                  },
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 }
            })
          );
        } catch (imageError) {
          console.warn(`No se pudo procesar la imagen ${imagePath}:`, imageError);
        }
      }

      // Crear el documento
      const doc = new Document({
        sections: [{
          properties: {},
          children: documentParagraphs
        }]
      });

      // Generar el archivo
      const fileName = `reporte_${company.replace(/\s+/g, '_')}_${Date.now()}.docx`;
      const outputPath = path.join(this.outputDir, fileName);
      
      await fs.ensureDir(this.outputDir);
      
      const buffer = await Packer.toBuffer(doc);
      await fs.writeFile(outputPath, buffer);

      return {
        success: true,
        fileName,
        outputPath,
        size: buffer.length,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creando documento:', error);
      throw new Error(`No se pudo crear el documento: ${error.message}`);
    }
  }

  /**
   * Analiza el formato de un documento plantilla
   * @param {string} templatePath - Ruta del archivo plantilla
   * @returns {Object} Análisis del formato
   */
  async analyzeTemplate(templatePath) {
    try {
      const templateContent = await this.readDocxFile(templatePath);
      
      // Análisis básico del contenido
      const analysis = {
        wordCount: templateContent.text.split(/\s+/).length,
        paragraphCount: templateContent.text.split('\n').length,
        hasImages: templateContent.html.includes('<img'),
        hasTables: templateContent.html.includes('<table'),
        structure: this.extractStructure(templateContent.html),
        success: true
      };

      return analysis;
    } catch (error) {
      console.error('Error analizando plantilla:', error);
      throw new Error(`No se pudo analizar la plantilla: ${error.message}`);
    }
  }

  /**
   * Extrae la estructura básica del documento HTML
   * @param {string} html - Contenido HTML del documento
   * @returns {Array} Estructura del documento
   */
  extractStructure(html) {
    const structure = [];
    
    // Buscar encabezados
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      structure.push({
        type: 'heading',
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, '').trim()
      });
    }

    return structure;
  }

  /**
   * Lista todos los documentos generados
   * @returns {Array} Lista de documentos
   */
  async listGeneratedDocuments() {
    try {
      await fs.ensureDir(this.outputDir);
      const files = await fs.readdir(this.outputDir);
      
      const documents = [];
      for (const file of files) {
        if (path.extname(file) === '.docx') {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          
          documents.push({
            fileName: file,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          });
        }
      }
      
      return documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error listando documentos:', error);
      throw new Error(`No se pudieron listar los documentos: ${error.message}`);
    }
  }

  /**
   * Elimina un documento generado
   * @param {string} fileName - Nombre del archivo a eliminar
   * @returns {boolean} Éxito de la operación
   */
  async deleteDocument(fileName) {
    try {
      const filePath = path.join(this.outputDir, fileName);
      await fs.remove(filePath);
      return true;
    } catch (error) {
      console.error('Error eliminando documento:', error);
      throw new Error(`No se pudo eliminar el documento: ${error.message}`);
    }
  }
}

export default DocumentService;
