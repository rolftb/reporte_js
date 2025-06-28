const JSZip = require('jszip');
const { DOMParser } = require('xmldom');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

/**
 * Analizador mejorado para extraer y guardar imágenes del documento PUMA
 * Guarda las imágenes en una carpeta y evita duplicados usando hash
 */
class DocumentImageExtractor {
  constructor(outputDir = './extracted_images') {
    this.outputDir = outputDir;
    this.imageRegistry = new Map(); // Para evitar duplicados
    this.extractedImages = [];
    this.headerInfo = {
      images: [],
      layout: {},
      relationships: {},
      textElements: []
    };
  }

  async analyzeAndExtractImages(docxPath) {
    console.log('🔍 Analizando documento y extrayendo imágenes...');
    
    try {
      // Crear directorio de salida
      await fs.ensureDir(this.outputDir);
      
      const data = await fs.readFile(docxPath);
      const zip = await JSZip.loadAsync(data);
      
      // 1. Cargar registro de imágenes existentes
      await this.loadImageRegistry();
      
      // 2. Extraer todas las imágenes
      await this.extractAllImages(zip);
      
      // 3. Analizar el header principal
      const headerFile = zip.file('word/header1.xml');
      if (headerFile) {
        const headerContent = await headerFile.async('text');
        await this.parseHeaderXML(headerContent);
      }
      
      // 4. Analizar relaciones del header
      const headerRelsFile = zip.file('word/_rels/header1.xml.rels');
      if (headerRelsFile) {
        const headerRelsContent = await headerRelsFile.async('text');
        await this.parseHeaderRelationships(headerRelsContent);
      }
      
      // 5. Analizar el documento principal
      const documentFile = zip.file('word/document.xml');
      if (documentFile) {
        const documentContent = await documentFile.async('text');
        await this.parseDocumentImages(documentContent);
      }
      
      // 6. Guardar registro actualizado
      await this.saveImageRegistry();
      
      // 7. Generar reporte completo
      const report = this.generateCompleteReport(docxPath);
      
      // Guardar reporte
      const reportPath = `./output/complete_analysis_with_images_${Date.now()}.json`;
      await fs.ensureDir('./output');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
      
      console.log(`✅ Análisis completado: ${reportPath}`);
      console.log(`📁 Imágenes extraídas en: ${this.outputDir}`);
      console.log(`🖼️ Total de imágenes procesadas: ${this.extractedImages.length}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Error analizando documento:', error);
      throw error;
    }
  }

  async loadImageRegistry() {
    const registryPath = path.join(this.outputDir, 'image_registry.json');
    
    try {
      if (await fs.pathExists(registryPath)) {
        const registryData = await fs.readFile(registryPath, 'utf8');
        const registry = JSON.parse(registryData);
        
        // Cargar en el Map
        for (const [hash, info] of Object.entries(registry)) {
          this.imageRegistry.set(hash, info);
        }
        
        console.log(`📋 Registro de imágenes cargado: ${this.imageRegistry.size} imágenes conocidas`);
      }
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el registro de imágenes, creando uno nuevo');
    }
  }

  async saveImageRegistry() {
    const registryPath = path.join(this.outputDir, 'image_registry.json');
    
    // Convertir Map a objeto para JSON
    const registryObj = Object.fromEntries(this.imageRegistry);
    
    await fs.writeFile(registryPath, JSON.stringify(registryObj, null, 2), 'utf8');
    console.log(`💾 Registro de imágenes guardado: ${registryPath}`);
  }

  async extractAllImages(zip) {
    console.log('🖼️ Extrayendo imágenes del documento...');
    
    let imageCount = 0;
    let duplicateCount = 0;
    
    // Iterar sobre todos los archivos del ZIP
    for (const [relativePath, file] of Object.entries(zip.files)) {
      // Verificar si es una imagen
      if (relativePath.startsWith('word/media/') && 
          (relativePath.endsWith('.jpg') || 
           relativePath.endsWith('.jpeg') || 
           relativePath.endsWith('.png') ||
           relativePath.endsWith('.gif'))) {
        
        try {
          // Obtener datos de la imagen
          const imageData = await file.async('nodebuffer');
          
          // Calcular hash para evitar duplicados
          const hash = crypto.createHash('md5').update(imageData).digest('hex');
          
          // Verificar si ya existe
          if (this.imageRegistry.has(hash)) {
            duplicateCount++;
            console.log(`⏭️ Imagen duplicada ignorada: ${relativePath} (hash: ${hash.substring(0, 8)}...)`);
            continue;
          }
          
          // Generar nombre único
          const extension = path.extname(relativePath);
          const baseName = path.basename(relativePath, extension);
          const uniqueName = `${baseName}_${hash.substring(0, 8)}${extension}`;
          const outputPath = path.join(this.outputDir, uniqueName);
          
          // Guardar imagen
          await fs.writeFile(outputPath, imageData);
          
          // Registrar en el Map
          const imageInfo = {
            originalPath: relativePath,
            extractedPath: outputPath,
            fileName: uniqueName,
            hash: hash,
            size: imageData.length,
            extractedAt: new Date().toISOString()
          };
          
          this.imageRegistry.set(hash, imageInfo);
          this.extractedImages.push(imageInfo);
          
          imageCount++;
          console.log(`✅ Imagen extraída: ${relativePath} → ${uniqueName}`);
          
        } catch (error) {
          console.error(`❌ Error extrayendo imagen ${relativePath}:`, error);
        }
      }
    }
    
    console.log(`📊 Resumen de extracción:`);
    console.log(`   - Imágenes nuevas extraídas: ${imageCount}`);
    console.log(`   - Imágenes duplicadas ignoradas: ${duplicateCount}`);
    console.log(`   - Total en registro: ${this.imageRegistry.size}`);
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
        isImage: type && type.includes('image'),
        extractedImageInfo: this.findExtractedImageByPath(`word/media/${target}`)
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

  findExtractedImageByPath(originalPath) {
    for (const imageInfo of this.extractedImages) {
      if (imageInfo.originalPath === originalPath) {
        return imageInfo;
      }
    }
    return null;
  }

  generateCompleteReport(docxPath) {
    return {
      fecha_analisis: new Date().toISOString(),
      documento_analizado: docxPath,
      directorio_imagenes: this.outputDir,
      
      resumen_extraccion: {
        total_imagenes_extraidas: this.extractedImages.length,
        total_imagenes_en_registro: this.imageRegistry.size,
        directorio_salida: this.outputDir
      },
      
      estructura_header: {
        total_imagenes_header: this.headerInfo.images.length,
        total_elementos_texto: this.headerInfo.textElements.length,
        total_relaciones: Object.keys(this.headerInfo.relationships).length
      },
      
      imagenes_extraidas: this.extractedImages,
      elementos_texto_header: this.headerInfo.textElements,
      imagenes_header: this.headerInfo.images,
      relaciones_header: this.headerInfo.relationships,
      layout_documento: this.headerInfo.layout,
      
      rutas_imagenes_para_generador: this.generateImagePathsForGenerator(),
      recomendaciones: this.generateRecommendations()
    };
  }

  generateImagePathsForGenerator() {
    const paths = {
      header_images: {},
      document_images: []
    };
    
    // Usar el registro de imágenes existente para crear las relaciones
    for (const [hash, imageInfo] of this.imageRegistry.entries()) {
      // Determinar si la imagen pertenece al header o al documento
      const isHeaderImage = imageInfo.originalPath.includes('image1.') || 
                           imageInfo.originalPath.includes('image2.') || 
                           imageInfo.originalPath.includes('image3.');
      
      if (isHeaderImage) {
        // Mapear imágenes del header
        const relId = `rId${imageInfo.originalPath.match(/image(\d+)/)[1]}`;
        paths.header_images[relId] = {
          originalPath: imageInfo.originalPath,
          extractedPath: imageInfo.extractedPath,
          fileName: imageInfo.fileName,
          hash: hash
        };
      } else {
        // Mapear imágenes del documento
        paths.document_images.push({
          originalPath: imageInfo.originalPath,
          extractedPath: imageInfo.extractedPath,
          fileName: imageInfo.fileName,
          hash: hash
        });
      }
    }
    
    console.log(`🔗 Rutas generadas: ${Object.keys(paths.header_images).length} header, ${paths.document_images.length} documento`);
    
    return paths;
  }

  generateRecommendations() {
    const recomendaciones = [];
    
    if (this.extractedImages.length === 0) {
      recomendaciones.push("No se encontraron imágenes para extraer.");
    } else {
      recomendaciones.push(`Se extrajeron ${this.extractedImages.length} imágenes. Están listas para usar en el generador.`);
    }
    
    if (this.headerInfo.images.length === 0) {
      recomendaciones.push("No se encontraron imágenes en el header. Verificar si existen headers alternativos.");
    } else {
      recomendaciones.push(`Se identificaron ${this.headerInfo.images.length} imágenes en el header. Usar las rutas extraídas para replicar el header exacto.`);
    }
    
    recomendaciones.push(`Las imágenes están disponibles en: ${this.outputDir}`);
    recomendaciones.push("Usar la sección 'rutas_imagenes_para_generador' para integrar las imágenes reales en el documento generado.");
    
    return recomendaciones;
  }
}

// Ejecutar análisis si se llama directamente
if (require.main === module) {
  const extractor = new DocumentImageExtractor();
  const docxPath = 'c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_py\\template-word\\PUMA MES 6 2025.docx';
  
  extractor.analyzeAndExtractImages(docxPath)
    .then(report => {
      console.log('🎉 Análisis y extracción completados exitosamente');
      console.log('📋 Resumen:');
      console.log(`   - Imágenes extraídas: ${report.resumen_extraccion.total_imagenes_extraidas}`);
      console.log(`   - Total en registro: ${report.resumen_extraccion.total_imagenes_en_registro}`);
      console.log(`   - Directorio: ${report.directorio_imagenes}`);
      console.log(`   - Imágenes del header: ${report.estructura_header.total_imagenes_header}`);
    })
    .catch(error => {
      console.error('💥 Error en análisis:', error);
      process.exit(1);
    });
}

module.exports = DocumentImageExtractor;
