import JSZip from 'jszip';
import { DOMParser } from 'xmldom';
import fs from 'fs-extra';

/**
 * Analizador específico para la estructura del encabezado del documento PUMA
 * Extrae información detallada sobre logos, imágenes y distribución del header
 */
class HeaderStructureAnalyzer {
  constructor() {
    this.headerInfo = {
      images: [],
      layout: {},
      relationships: {},
      textElements: []
    };
  }

  async analyzeHeader(docxPath) {
    console.log('🔍 Analizando estructura del encabezado...');
    
    try {
      const data = await fs.readFile(docxPath);
      const zip = await JSZip.loadAsync(data);
      
      // 1. Analizar el header principal
      const headerFile = zip.file('word/header1.xml');
      if (headerFile) {
        const headerContent = await headerFile.async('text');
        await this.parseHeaderXML(headerContent);
      }
      
      // 2. Analizar relaciones del header
      const headerRelsFile = zip.file('word/_rels/header1.xml.rels');
      if (headerRelsFile) {
        const headerRelsContent = await headerRelsFile.async('text');
        await this.parseHeaderRelationships(headerRelsContent);
      }
      
      // 3. Analizar el documento principal para imágenes del header
      const documentFile = zip.file('word/document.xml');
      if (documentFile) {
        const documentContent = await documentFile.async('text');
        await this.parseDocumentImages(documentContent);
      }
      
      // 4. Obtener lista de archivos de imagen
      await this.getImageFiles(zip);
      
      // 5. Generar reporte
      const report = this.generateHeaderReport();
      
      // Guardar reporte
      const outputPath = `./output/header_structure_analysis_${Date.now()}.json`;
      await fs.ensureDir('./output');
      await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8');
      
      console.log(`✅ Análisis del encabezado completado: ${outputPath}`);
      return report;
      
    } catch (error) {
      console.error('❌ Error analizando encabezado:', error);
      throw error;
    }
  }

  async parseHeaderXML(headerContent) {
    console.log('📄 Analizando header1.xml...');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(headerContent, 'text/xml');
    
    // Buscar elementos de imagen en el header
    const drawings = doc.getElementsByTagName('w:drawing');
    const runs = doc.getElementsByTagName('w:r');
    const paragraphs = doc.getElementsByTagName('w:p');
    
    console.log(`📊 Header - Dibujos: ${drawings.length}, Runs: ${runs.length}, Párrafos: ${paragraphs.length}`);
    
    // Analizar párrafos del header
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const textContent = this.extractTextFromNode(para);
      
      if (textContent.trim()) {
        this.headerInfo.textElements.push({
          position: i,
          text: textContent.trim(),
          hasImages: para.getElementsByTagName('w:drawing').length > 0
        });
      }
    }
    
    // Analizar elementos de dibujo
    for (let i = 0; i < drawings.length; i++) {
      const drawing = drawings[i];
      const imageInfo = this.extractImageInfo(drawing);
      if (imageInfo) {
        this.headerInfo.images.push({
          position: i,
          ...imageInfo,
          context: 'header'
        });
      }
    }
  }

  async parseHeaderRelationships(relsContent) {
    console.log('🔗 Analizando relaciones del header...');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(relsContent, 'text/xml');
    
    const relationships = doc.getElementsByTagName('Relationship');
    
    for (let i = 0; i < relationships.length; i++) {
      const rel = relationships[i];
      const id = rel.getAttribute('Id');
      const type = rel.getAttribute('Type');
      const target = rel.getAttribute('Target');
      
      this.headerInfo.relationships[id] = {
        type: type,
        target: target,
        isImage: type && type.includes('image')
      };
    }
  }

  async parseDocumentImages(documentContent) {
    console.log('🖼️ Analizando imágenes del documento principal...');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(documentContent, 'text/xml');
    
    const drawings = doc.getElementsByTagName('w:drawing');
    const tables = doc.getElementsByTagName('w:tbl');
    
    console.log(`📊 Documento - Dibujos: ${drawings.length}, Tablas: ${tables.length}`);
    
    // Analizar distribución de imágenes por contexto
    this.headerInfo.layout = {
      totalDrawings: drawings.length,
      totalTables: tables.length,
      documentImages: []
    };
    
    // Obtener info de cada imagen en el documento
    for (let i = 0; i < drawings.length; i++) {
      const drawing = drawings[i];
      const imageInfo = this.extractImageInfo(drawing);
      if (imageInfo) {
        this.headerInfo.layout.documentImages.push({
          position: i,
          ...imageInfo,
          context: 'document'
        });
      }
    }
  }

  extractImageInfo(drawingNode) {
    try {
      // Buscar elementos clave de la imagen
      const blips = drawingNode.getElementsByTagName('a:blip');
      const extents = drawingNode.getElementsByTagName('wp:extent');
      const positions = drawingNode.getElementsByTagName('wp:posOffset');
      
      if (blips.length > 0) {
        const blip = blips[0];
        const embed = blip.getAttribute('r:embed');
        
        let dimensions = {};
        if (extents.length > 0) {
          const extent = extents[0];
          dimensions = {
            width: extent.getAttribute('cx'),
            height: extent.getAttribute('cy')
          };
        }
        
        let position = {};
        if (positions.length > 0) {
          position = {
            x: positions[0].textContent,
            y: positions[1] ? positions[1].textContent : null
          };
        }
        
        return {
          embed: embed,
          dimensions: dimensions,
          position: position
        };
      }
    } catch (error) {
      console.warn('⚠️ Error extrayendo info de imagen:', error);
    }
    
    return null;
  }

  extractTextFromNode(node) {
    let text = '';
    
    const texts = node.getElementsByTagName('w:t');
    for (let i = 0; i < texts.length; i++) {
      text += texts[i].textContent;
    }
    
    return text;
  }

  async getImageFiles(zip) {
    console.log('📁 Obteniendo archivos de imagen...');
    
    const imageFiles = [];
    
    zip.forEach((relativePath, file) => {
      if (relativePath.startsWith('word/media/') && 
          (relativePath.endsWith('.jpg') || 
           relativePath.endsWith('.jpeg') || 
           relativePath.endsWith('.png'))) {
        imageFiles.push({
          path: relativePath,
          name: relativePath.split('/').pop(),
          size: file._data ? file._data.uncompressedSize : 0
        });
      }
    });
    
    this.headerInfo.mediaFiles = imageFiles;
    console.log(`📊 Archivos de imagen encontrados: ${imageFiles.length}`);
  }

  generateHeaderReport() {
    return {
      fecha_analisis: new Date().toISOString(),
      estructura_header: {
        total_imagenes_header: this.headerInfo.images.length,
        total_elementos_texto: this.headerInfo.textElements.length,
        total_relaciones: Object.keys(this.headerInfo.relationships).length,
        total_archivos_media: this.headerInfo.mediaFiles ? this.headerInfo.mediaFiles.length : 0
      },
      elementos_texto_header: this.headerInfo.textElements,
      imagenes_header: this.headerInfo.images,
      relaciones_header: this.headerInfo.relationships,
      layout_documento: this.headerInfo.layout,
      archivos_media: this.headerInfo.mediaFiles,
      recomendaciones: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recomendaciones = [];
    
    if (this.headerInfo.images.length === 0) {
      recomendaciones.push("No se encontraron imágenes en el header. Verificar si existen headers alternativos.");
    }
    
    if (this.headerInfo.textElements.length === 0) {
      recomendaciones.push("No se encontraron elementos de texto en el header. Verificar estructura del header.");
    }
    
    if (this.headerInfo.mediaFiles && this.headerInfo.mediaFiles.length > 0) {
      recomendaciones.push(`Se encontraron ${this.headerInfo.mediaFiles.length} archivos de imagen. Verificar cuáles corresponden al header.`);
    }
    
    return recomendaciones;
  }
}

// Ejecutar análisis si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new HeaderStructureAnalyzer();
  const docxPath = 'c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_py\\template-word\\PUMA MES 6 2025.docx';
  
  analyzer.analyzeHeader(docxPath)
    .then(report => {
      console.log('🎉 Análisis completado exitosamente');
      console.log('📋 Resumen:');
      console.log(`   - Imágenes en header: ${report.estructura_header.total_imagenes_header}`);
      console.log(`   - Elementos de texto: ${report.estructura_header.total_elementos_texto}`);
      console.log(`   - Archivos media: ${report.estructura_header.total_archivos_media}`);
    })
    .catch(error => {
      console.error('💥 Error en análisis:', error);
      process.exit(1);
    });
}

export default HeaderStructureAnalyzer;
