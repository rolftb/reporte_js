const JSZip = require('jszip');
const { DOMParser } = require('xmldom');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

/**
 * Extractor avanzado de imágenes para documentos DOCX
 * Captura información detallada sobre posicionamiento, formato, recorte y contexto
 */
class DocumentImageExtractor {
  constructor(outputDir = './extracted_images') {
    this.outputDir = outputDir;
    this.imageRegistry = new Map();
    this.extractedImages = [];
    this.documentStructure = {
      pages: new Map(),
      headers: new Map(),
      footers: new Map(),
      tables: [],
      paragraphs: [],
      sections: []
    };
    this.relationshipMap = new Map();
    this.currentContext = {
      pageNumber: 1,
      sectionNumber: 1,
      tableNumber: 0,
      paragraphNumber: 0,
      isInHeader: false,
      isInFooter: false,
      isInTable: false,
      currentTable: null
    };
  }

  async analyzeAndExtractImages(docxPath) {
    console.log('🔍 Iniciando análisis avanzado del documento...');
    
    try {
      await fs.ensureDir(this.outputDir);
      
      const data = await fs.readFile(docxPath);
      const zip = await JSZip.loadAsync(data);
      
      // 1. Cargar registro existente
      await this.loadExistingRegistry();
      
      // 2. Analizar todas las relaciones primero
      await this.parseAllRelationships(zip);
      
      // 3. Extraer imágenes con metadata básica
      await this.extractImagesWithBasicMetadata(zip);
      
      // 4. Analizar estructura del documento
      await this.analyzeDocumentStructure(zip);
      
      // 5. Analizar headers y footers
      await this.analyzeHeadersAndFooters(zip);
      
      // 6. Analizar el documento principal con contexto completo
      await this.analyzeMainDocumentWithContext(zip);
      
      // 7. Postprocesar y enriquecer la información
      await this.enrichImageInformation();
      
      // 8. Guardar registro avanzado
      await this.saveAdvancedRegistry();
      
      // 9. Generar reporte completo
      const report = this.generateCompleteReport(docxPath);
      
      console.log(`✅ Análisis completado`);
      console.log(`📁 Imágenes extraídas: ${this.extractedImages.length}`);
      console.log(`🔍 Información capturada: posición, formato, recorte, contexto`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Error en análisis avanzado:', error);
      throw error;
    }
  }

  async loadExistingRegistry() {
    const registryPath = path.join(this.outputDir, 'image_registry.json');
    
    try {
      if (await fs.pathExists(registryPath)) {
        const registryData = await fs.readFile(registryPath, 'utf8');
        const registry = JSON.parse(registryData);
        
        if (registry.images) {
          for (const [hash, info] of Object.entries(registry.images)) {
            this.imageRegistry.set(hash, info);
          }
          console.log(`📋 Registro cargado: ${this.imageRegistry.size} imágenes`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Creando nuevo registro de imágenes');
    }
  }

  async parseAllRelationships(zip) {
    console.log('🔗 Analizando todas las relaciones...');
    
    // Relaciones del documento principal
    const docRels = zip.file('word/_rels/document.xml.rels');
    if (docRels) {
      const content = await docRels.async('text');
      this.parseRelationshipXML(content, 'document');
    }
    
    // Relaciones de headers
    for (let i = 1; i <= 10; i++) {
      const headerRels = zip.file(`word/_rels/header${i}.xml.rels`);
      if (headerRels) {
        const content = await headerRels.async('text');
        this.parseRelationshipXML(content, `header${i}`);
      }
    }
    
    // Relaciones de footers
    for (let i = 1; i <= 10; i++) {
      const footerRels = zip.file(`word/_rels/footer${i}.xml.rels`);
      if (footerRels) {
        const content = await footerRels.async('text');
        this.parseRelationshipXML(content, `footer${i}`);
      }
    }
  }

  parseRelationshipXML(relsContent, context) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(relsContent, 'text/xml');
    const relationships = doc.getElementsByTagName('Relationship');
    
    for (let i = 0; i < relationships.length; i++) {
      const rel = relationships[i];
      const id = rel.getAttribute('Id');
      const type = rel.getAttribute('Type');
      const target = rel.getAttribute('Target');
      
      if (type && type.includes('image')) {
        this.relationshipMap.set(id, {
          id,
          type,
          target,
          context,
          imagePath: `word/${target}`
        });
      }
    }
  }

  async extractImagesWithBasicMetadata(zip) {
    console.log('🖼️ Extrayendo imágenes con metadata básica...');
    
    // Buscar todas las imágenes en el directorio media
    const mediaFiles = Object.keys(zip.files).filter(name => 
      name.startsWith('word/media/') && this.isImageFile(name)
    );
    
    for (const imagePath of mediaFiles) {
      const file = zip.file(imagePath);
      if (file) {
        const imageData = await file.async('nodebuffer');
        const hash = crypto.createHash('md5').update(imageData).digest('hex');
        const fileName = `${path.basename(imagePath, path.extname(imagePath))}_${hash.substring(0, 8)}${path.extname(imagePath)}`;
        
        if (!this.imageRegistry.has(hash)) {
          // Guardar imagen física
          const outputPath = path.join(this.outputDir, fileName);
          await fs.writeFile(outputPath, imageData);
          
          // Obtener metadata básica de la imagen
          const basicMetadata = await this.getImageBasicMetadata(imageData, imagePath);
          
          // Crear registro inicial
          const imageInfo = {
            fileName,
            originalPath: imagePath,
            hash,
            size: imageData.length,
            format: basicMetadata.format,
            dimensions: basicMetadata.dimensions,
            extractedAt: new Date().toISOString(),
            
            // Información de posición (se llenará después)
            position: {
              page: null,
              section: null,
              headerType: null,
              tableId: null,
              cellPosition: null,
              paragraphId: null,
              runId: null,
              absolutePosition: null,
              relativePosition: null
            },
            
            // Información de formato y estilo
            formatting: {
              width: null,
              height: null,
              scaleX: 100,
              scaleY: 100,
              rotation: 0,
              flipHorizontal: false,
              flipVertical: false,
              brightness: 0,
              contrast: 0,
              cropLeft: 0,
              cropTop: 0,
              cropRight: 0,
              cropBottom: 0
            },
            
            // Información de contexto
            context: {
              isInHeader: false,
              isInFooter: false,
              isInTable: false,
              isFloating: false,
              isInline: false,
              wrapType: null,
              anchor: null,
              zOrder: null,
              behindText: false
            },
            
            // Información de relación
            relationship: {
              relationshipId: null,
              embedId: null,
              context: null
            },
            
            // Contexto textual
            textContext: {
              precedingText: null,
              followingText: null,
              altText: null,
              title: null,
              description: null
            }
          };
          
          this.imageRegistry.set(hash, imageInfo);
          this.extractedImages.push(imageInfo);
        }
      }
    }
  }

  async getImageBasicMetadata(imageData, imagePath) {
    const format = path.extname(imagePath).toLowerCase().substring(1);
    
    // Detectar dimensiones básicas según el formato
    let dimensions = { width: null, height: null };
    
    try {
      if (format === 'jpg' || format === 'jpeg') {
        dimensions = this.getJpegDimensions(imageData);
      } else if (format === 'png') {
        dimensions = this.getPngDimensions(imageData);
      }
    } catch (error) {
      console.warn(`⚠️ No se pudieron obtener dimensiones de ${imagePath}`);
    }
    
    return {
      format,
      dimensions
    };
  }

  getJpegDimensions(buffer) {
    // Búsqueda simple de dimensiones JPEG
    for (let i = 0; i < buffer.length - 8; i++) {
      if (buffer[i] === 0xFF && buffer[i + 1] === 0xC0) {
        return {
          height: buffer.readUInt16BE(i + 5),
          width: buffer.readUInt16BE(i + 7)
        };
      }
    }
    return { width: null, height: null };
  }

  getPngDimensions(buffer) {
    // Verificar header PNG y obtener dimensiones
    if (buffer.length >= 24 && 
        buffer[0] === 0x89 && buffer[1] === 0x50 && 
        buffer[2] === 0x4E && buffer[3] === 0x47) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20)
      };
    }
    return { width: null, height: null };
  }

  async analyzeDocumentStructure(zip) {
    console.log('📋 Analizando estructura del documento...');
    
    const documentFile = zip.file('word/document.xml');
    if (documentFile) {
      const content = await documentFile.async('text');
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      
      // Analizar secciones
      const sections = doc.getElementsByTagName('w:sectPr');
      for (let i = 0; i < sections.length; i++) {
        this.documentStructure.sections.push({
          id: i + 1,
          properties: this.extractSectionProperties(sections[i])
        });
      }
      
      // Analizar tablas
      const tables = doc.getElementsByTagName('w:tbl');
      for (let i = 0; i < tables.length; i++) {
        this.documentStructure.tables.push({
          id: i + 1,
          structure: this.extractTableStructure(tables[i]),
          position: this.getElementPosition(tables[i])
        });
      }
      
      // Analizar párrafos
      const paragraphs = doc.getElementsByTagName('w:p');
      for (let i = 0; i < paragraphs.length; i++) {
        this.documentStructure.paragraphs.push({
          id: i + 1,
          hasImage: this.paragraphHasImage(paragraphs[i]),
          position: this.getElementPosition(paragraphs[i])
        });
      }
    }
  }

  async analyzeHeadersAndFooters(zip) {
    console.log('📑 Analizando headers y footers...');
    
    // Analizar headers
    for (let i = 1; i <= 10; i++) {
      const headerFile = zip.file(`word/header${i}.xml`);
      if (headerFile) {
        const content = await headerFile.async('text');
        await this.analyzeHeaderContent(content, i);
      }
    }
    
    // Analizar footers
    for (let i = 1; i <= 10; i++) {
      const footerFile = zip.file(`word/footer${i}.xml`);
      if (footerFile) {
        const content = await footerFile.async('text');
        await this.analyzeFooterContent(content, i);
      }
    }
  }

  async analyzeHeaderContent(headerContent, headerNumber) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(headerContent, 'text/xml');
    
    this.currentContext.isInHeader = true;
    this.currentContext.headerNumber = headerNumber;
    
    // Buscar imágenes en el header
    const drawings = doc.getElementsByTagName('w:drawing');
    const images = doc.getElementsByTagName('w:blip');
    
    for (let i = 0; i < drawings.length; i++) {
      this.analyzeDrawingElement(drawings[i], `header${headerNumber}`);
    }
    
    for (let i = 0; i < images.length; i++) {
      this.analyzeImageElement(images[i], `header${headerNumber}`);
    }
    
    this.currentContext.isInHeader = false;
  }

  async analyzeFooterContent(footerContent, footerNumber) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(footerContent, 'text/xml');
    
    this.currentContext.isInFooter = true;
    this.currentContext.footerNumber = footerNumber;
    
    // Buscar imágenes en el footer
    const drawings = doc.getElementsByTagName('w:drawing');
    const images = doc.getElementsByTagName('w:blip');
    
    for (let i = 0; i < drawings.length; i++) {
      this.analyzeDrawingElement(drawings[i], `footer${footerNumber}`);
    }
    
    for (let i = 0; i < images.length; i++) {
      this.analyzeImageElement(images[i], `footer${footerNumber}`);
    }
    
    this.currentContext.isInFooter = false;
  }

  async analyzeMainDocumentWithContext(zip) {
    console.log('📄 Analizando documento principal con contexto...');
    
    const documentFile = zip.file('word/document.xml');
    if (documentFile) {
      const content = await documentFile.async('text');
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      
      this.currentContext = {
        pageNumber: 1,
        sectionNumber: 1,
        tableNumber: 0,
        paragraphNumber: 0,
        isInHeader: false,
        isInFooter: false,
        isInTable: false,
        currentTable: null
      };
      
      // Procesar todos los elementos del documento en orden
      this.processDocumentElements(doc.documentElement);
    }
  }

  processDocumentElements(element) {
    const children = element.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      
      if (child.nodeType === 1) { // Element node
        const tagName = child.nodeName;
        
        switch (tagName) {
          case 'w:sectPr':
            this.currentContext.sectionNumber++;
            break;
            
          case 'w:tbl':
            this.currentContext.tableNumber++;
            this.currentContext.isInTable = true;
            this.currentContext.currentTable = {
              id: this.currentContext.tableNumber,
              structure: this.extractTableStructure(child)
            };
            this.processDocumentElements(child);
            this.currentContext.isInTable = false;
            this.currentContext.currentTable = null;
            break;
            
          case 'w:p':
            this.currentContext.paragraphNumber++;
            this.processDocumentElements(child);
            break;
            
          case 'w:drawing':
            this.analyzeDrawingElement(child, 'document');
            break;
            
          case 'w:blip':
            this.analyzeImageElement(child, 'document');
            break;
            
          default:
            this.processDocumentElements(child);
            break;
        }
      }
    }
  }

  analyzeDrawingElement(drawingElement, context) {
    // Buscar información de posicionamiento
    const inline = drawingElement.getElementsByTagName('wp:inline')[0];
    const anchor = drawingElement.getElementsByTagName('wp:anchor')[0];
    const blip = drawingElement.getElementsByTagName('a:blip')[0];
    
    if (blip) {
      const embedId = blip.getAttribute('r:embed');
      if (embedId) {
        const imageInfo = this.findImageByRelationshipId(embedId, context);
        if (imageInfo) {
          // Actualizar información de posición
          this.updateImagePosition(imageInfo, drawingElement, inline, anchor);
          
          // Actualizar información de formato
          this.updateImageFormatting(imageInfo, drawingElement);
          
          // Actualizar contexto
          this.updateImageContext(imageInfo);
        }
      }
    }
  }

  analyzeImageElement(imageElement, context) {
    const embedId = imageElement.getAttribute('r:embed');
    if (embedId) {
      const imageInfo = this.findImageByRelationshipId(embedId, context);
      if (imageInfo) {
        this.updateImageContext(imageInfo);
      }
    }
  }

  findImageByRelationshipId(relationshipId, context) {
    const relationship = this.relationshipMap.get(relationshipId);
    if (relationship) {
      // Buscar la imagen por path
      for (const [hash, imageInfo] of this.imageRegistry) {
        if (imageInfo.originalPath === relationship.imagePath) {
          // Asegurar que el objeto relationship existe
          if (!imageInfo.relationship) {
            imageInfo.relationship = {
              relationshipId: null,
              embedId: null,
              context: null
            };
          }
          imageInfo.relationship.relationshipId = relationshipId;
          imageInfo.relationship.context = context;
          return imageInfo;
        }
      }
    }
    return null;
  }

  updateImagePosition(imageInfo, drawingElement, inline, anchor) {
    // Asegurar que el objeto position existe
    if (!imageInfo.position) {
      imageInfo.position = {
        page: null,
        section: null,
        headerType: null,
        tableId: null,
        cellPosition: null,
        paragraphId: null,
        runId: null,
        absolutePosition: null,
        relativePosition: null
      };
    }
    
    // Asegurar que el objeto context existe
    if (!imageInfo.context) {
      imageInfo.context = {
        isInHeader: false,
        isInFooter: false,
        isInTable: false,
        isFloating: false,
        isInline: false,
        wrapType: null,
        anchor: null,
        zOrder: null,
        behindText: false
      };
    }
    
    imageInfo.position.page = this.currentContext.pageNumber;
    imageInfo.position.section = this.currentContext.sectionNumber;
    
    if (this.currentContext.isInHeader) {
      imageInfo.position.headerType = `header${this.currentContext.headerNumber}`;
    }
    
    if (this.currentContext.isInFooter) {
      imageInfo.position.headerType = `footer${this.currentContext.footerNumber}`;
    }
    
    if (this.currentContext.isInTable) {
      imageInfo.position.tableId = this.currentContext.tableNumber;
      imageInfo.position.cellPosition = this.getCurrentCellPosition();
    }
    
    imageInfo.position.paragraphId = this.currentContext.paragraphNumber;
    
    // Posición absoluta vs relativa
    if (inline) {
      imageInfo.context.isInline = true;
      imageInfo.context.isFloating = false;
    }
    
    if (anchor) {
      imageInfo.context.isFloating = true;
      imageInfo.context.isInline = false;
      
      // Extraer información de anclaje
      const positionH = anchor.getElementsByTagName('wp:positionH')[0];
      const positionV = anchor.getElementsByTagName('wp:positionV')[0];
      
      if (positionH) {
        const relativeFrom = positionH.getAttribute('relativeFrom');
        const posOffset = positionH.getElementsByTagName('wp:posOffset')[0];
        if (posOffset) {
          imageInfo.position.absolutePosition = {
            x: parseInt(posOffset.textContent) || 0,
            xRelativeFrom: relativeFrom
          };
        }
      }
      
      if (positionV) {
        const relativeFrom = positionV.getAttribute('relativeFrom');
        const posOffset = positionV.getElementsByTagName('wp:posOffset')[0];
        if (posOffset) {
          if (!imageInfo.position.absolutePosition) {
            imageInfo.position.absolutePosition = {};
          }
          imageInfo.position.absolutePosition.y = parseInt(posOffset.textContent) || 0;
          imageInfo.position.absolutePosition.yRelativeFrom = relativeFrom;
        }
      }
      
      // Información de wrap
      const wrapSquare = anchor.getElementsByTagName('wp:wrapSquare')[0];
      const wrapTight = anchor.getElementsByTagName('wp:wrapTight')[0];
      const wrapThrough = anchor.getElementsByTagName('wp:wrapThrough')[0];
      const wrapTopAndBottom = anchor.getElementsByTagName('wp:wrapTopAndBottom')[0];
      const wrapNone = anchor.getElementsByTagName('wp:wrapNone')[0];
      
      if (wrapSquare) imageInfo.context.wrapType = 'square';
      else if (wrapTight) imageInfo.context.wrapType = 'tight';
      else if (wrapThrough) imageInfo.context.wrapType = 'through';
      else if (wrapTopAndBottom) imageInfo.context.wrapType = 'topAndBottom';
      else if (wrapNone) imageInfo.context.wrapType = 'none';
      
      // Z-order
      const behindDoc = anchor.getAttribute('behindDoc');
      if (behindDoc === '1') {
        imageInfo.context.behindText = true;
      }
    }
  }

  updateImageFormatting(imageInfo, drawingElement) {
    // Asegurar que el objeto formatting existe
    if (!imageInfo.formatting) {
      imageInfo.formatting = {
        width: null,
        height: null,
        scaleX: 100,
        scaleY: 100,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        brightness: 0,
        contrast: 0,
        cropLeft: 0,
        cropTop: 0,
        cropRight: 0,
        cropBottom: 0
      };
    }
    
    // Buscar información de extensión de imagen
    const extent = drawingElement.getElementsByTagName('wp:extent')[0];
    if (extent) {
      const cx = extent.getAttribute('cx');
      const cy = extent.getAttribute('cy');
      if (cx) imageInfo.formatting.width = Math.round(parseInt(cx) / 9525); // EMU to pixels
      if (cy) imageInfo.formatting.height = Math.round(parseInt(cy) / 9525); // EMU to pixels
    }
    
    // Buscar transformaciones
    const xfrm = drawingElement.getElementsByTagName('a:xfrm')[0];
    if (xfrm) {
      const rot = xfrm.getAttribute('rot');
      if (rot) {
        imageInfo.formatting.rotation = parseInt(rot) / 60000; // Convertir de unidades de Word a grados
      }
      
      const flipH = xfrm.getAttribute('flipH');
      const flipV = xfrm.getAttribute('flipV');
      if (flipH === '1') imageInfo.formatting.flipHorizontal = true;
      if (flipV === '1') imageInfo.formatting.flipVertical = true;
    }
    
    // Buscar información de recorte
    const srcRect = drawingElement.getElementsByTagName('a:srcRect')[0];
    if (srcRect) {
      const l = srcRect.getAttribute('l');
      const t = srcRect.getAttribute('t');
      const r = srcRect.getAttribute('r');
      const b = srcRect.getAttribute('b');
      
      if (l) imageInfo.formatting.cropLeft = parseInt(l) / 1000; // Convertir de unidades de porcentaje
      if (t) imageInfo.formatting.cropTop = parseInt(t) / 1000;
      if (r) imageInfo.formatting.cropRight = parseInt(r) / 1000;
      if (b) imageInfo.formatting.cropBottom = parseInt(b) / 1000;
    }
    
    // Buscar ajustes de imagen
    const clrRepl = drawingElement.getElementsByTagName('a:clrRepl');
    const clrChange = drawingElement.getElementsByTagName('a:clrChange');
    const lum = drawingElement.getElementsByTagName('a:lum')[0];
    
    if (lum) {
      const bright = lum.getAttribute('bright');
      const contrast = lum.getAttribute('contrast');
      if (bright) imageInfo.formatting.brightness = parseInt(bright) / 1000;
      if (contrast) imageInfo.formatting.contrast = parseInt(contrast) / 1000;
    }
  }

  updateImageContext(imageInfo) {
    // Asegurar que el objeto context existe
    if (!imageInfo.context) {
      imageInfo.context = {
        isInHeader: false,
        isInFooter: false,
        isInTable: false,
        isFloating: false,
        isInline: false,
        wrapType: null,
        anchor: null,
        zOrder: null,
        behindText: false
      };
    }
    
    imageInfo.context.isInHeader = this.currentContext.isInHeader;
    imageInfo.context.isInFooter = this.currentContext.isInFooter;
    imageInfo.context.isInTable = this.currentContext.isInTable;
    
    if (this.currentContext.isInTable && this.currentContext.currentTable) {
      imageInfo.context.tableStructure = this.currentContext.currentTable;
    }
  }

  getCurrentCellPosition() {
    // Implementación simplificada - en una implementación completa 
    // se rastrearían las celdas específicas
    return {
      row: null,
      column: null,
      cellId: null
    };
  }

  extractTableStructure(tableElement) {
    const rows = tableElement.getElementsByTagName('w:tr');
    const structure = {
      rows: rows.length,
      columns: 0,
      cells: []
    };
    
    if (rows.length > 0) {
      const firstRow = rows[0];
      const cells = firstRow.getElementsByTagName('w:tc');
      structure.columns = cells.length;
    }
    
    return structure;
  }

  extractSectionProperties(sectionElement) {
    return {
      pageSize: this.getPageSize(sectionElement),
      margins: this.getMargins(sectionElement),
      orientation: this.getOrientation(sectionElement)
    };
  }

  getPageSize(sectionElement) {
    const pgSz = sectionElement.getElementsByTagName('w:pgSz')[0];
    if (pgSz) {
      return {
        width: pgSz.getAttribute('w'),
        height: pgSz.getAttribute('h')
      };
    }
    return null;
  }

  getMargins(sectionElement) {
    const pgMar = sectionElement.getElementsByTagName('w:pgMar')[0];
    if (pgMar) {
      return {
        top: pgMar.getAttribute('top'),
        right: pgMar.getAttribute('right'),
        bottom: pgMar.getAttribute('bottom'),
        left: pgMar.getAttribute('left')
      };
    }
    return null;
  }

  getOrientation(sectionElement) {
    const pgSz = sectionElement.getElementsByTagName('w:pgSz')[0];
    if (pgSz) {
      const orient = pgSz.getAttribute('orient');
      return orient || 'portrait';
    }
    return 'portrait';
  }

  paragraphHasImage(paragraphElement) {
    const drawings = paragraphElement.getElementsByTagName('w:drawing');
    const images = paragraphElement.getElementsByTagName('w:blip');
    return drawings.length > 0 || images.length > 0;
  }

  getElementPosition(element) {
    // Implementación simplificada para obtener posición relativa en el documento
    return {
      documentOrder: null,
      relativePath: null
    };
  }

  async enrichImageInformation() {
    console.log('🔍 Enriqueciendo información de imágenes...');
    
    // Agrupar imágenes por contexto y página
    const pageDistribution = {};
    const contextDistribution = {
      header: [],
      footer: [],
      table: [],
      paragraph: [],
      floating: []
    };
    
    for (const [hash, imageInfo] of this.imageRegistry) {
      // Asegurar que las estructuras estén inicializadas
      if (!imageInfo.position) {
        imageInfo.position = {
          page: null,
          section: null,
          headerType: null,
          tableId: null,
          cellPosition: null,
          paragraphId: null,
          runId: null,
          absolutePosition: null,
          relativePosition: null
        };
      }
      
      if (!imageInfo.context) {
        imageInfo.context = {
          isInHeader: false,
          isInFooter: false,
          isInTable: false,
          isFloating: false,
          isInline: false,
          wrapType: null,
          anchor: null,
          zOrder: null,
          behindText: false
        };
      }
      
      if (!imageInfo.formatting) {
        imageInfo.formatting = {
          width: null,
          height: null,
          scaleX: 100,
          scaleY: 100,
          rotation: 0,
          flipHorizontal: false,
          flipVertical: false,
          brightness: 0,
          contrast: 0,
          cropLeft: 0,
          cropTop: 0,
          cropRight: 0,
          cropBottom: 0
        };
      }
      
      // Distribución por página
      const page = imageInfo.position.page || 'unknown';
      if (!pageDistribution[page]) {
        pageDistribution[page] = [];
      }
      pageDistribution[page].push({
        fileName: imageInfo.fileName,
        hash,
        position: imageInfo.position,
        context: imageInfo.context,
        formatting: imageInfo.formatting
      });
      
      // Distribución por contexto
      if (imageInfo.context.isInHeader) {
        contextDistribution.header.push(imageInfo);
      } else if (imageInfo.context.isInFooter) {
        contextDistribution.footer.push(imageInfo);
      } else if (imageInfo.context.isInTable) {
        contextDistribution.table.push(imageInfo);
      } else if (imageInfo.context.isFloating) {
        contextDistribution.floating.push(imageInfo);
      } else {
        contextDistribution.paragraph.push(imageInfo);
      }
    }
    
    this.pageDistribution = pageDistribution;
    this.contextDistribution = contextDistribution;
  }

  async saveAdvancedRegistry() {
    const registryPath = path.join(this.outputDir, 'image_registry.json');
    
    const registry = {
      metadata: {
        version: "3.0",
        generatedAt: new Date().toISOString(),
        totalImages: this.imageRegistry.size,
        analysisLevel: "advanced",
        features: [
          "positioning",
          "cropping",
          "context",
          "formatting",
          "page_distribution",
          "table_analysis",
          "text_context",
          "xml_relations",
          "drawing_properties",
          "absolute_positioning",
          "wrap_settings",
          "transformations"
        ]
      },
      documentStructure: {
        totalPages: this.getEstimatedPageCount(),
        sections: this.documentStructure.sections.length,
        tables: this.documentStructure.tables.length,
        paragraphs: this.documentStructure.paragraphs.length,
        headerTypes: this.getHeaderTypes(),
        footerTypes: this.getFooterTypes()
      },
      pageDistribution: this.pageDistribution || {},
      contextDistribution: this.contextDistribution || {},
      images: Object.fromEntries(this.imageRegistry),
      statistics: this.generateStatistics()
    };
    
    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2), 'utf8');
    console.log(`💾 Registro avanzado guardado: ${registryPath}`);
  }

  generateStatistics() {
    const stats = {
      totalImages: this.imageRegistry.size,
      byFormat: {},
      byContext: {
        header: 0,
        footer: 0,
        table: 0,
        paragraph: 0,
        floating: 0
      },
      byPosition: {
        inline: 0,
        floating: 0
      },
      withCropping: 0,
      withTransformations: 0,
      avgDimensions: { width: 0, height: 0 }
    };
    
    let totalWidth = 0;
    let totalHeight = 0;
    let validDimensions = 0;
    
    for (const [hash, imageInfo] of this.imageRegistry) {
      // Por formato
      const format = imageInfo.format;
      stats.byFormat[format] = (stats.byFormat[format] || 0) + 1;
      
      // Por contexto
      if (imageInfo.context.isInHeader) stats.byContext.header++;
      else if (imageInfo.context.isInFooter) stats.byContext.footer++;
      else if (imageInfo.context.isInTable) stats.byContext.table++;
      else if (imageInfo.context.isFloating) stats.byContext.floating++;
      else stats.byContext.paragraph++;
      
      // Por posición
      if (imageInfo.context.isInline) stats.byPosition.inline++;
      if (imageInfo.context.isFloating) stats.byPosition.floating++;
      
      // Con recorte
      if (imageInfo.formatting.cropLeft > 0 || imageInfo.formatting.cropTop > 0 ||
          imageInfo.formatting.cropRight > 0 || imageInfo.formatting.cropBottom > 0) {
        stats.withCropping++;
      }
      
      // Con transformaciones
      if (imageInfo.formatting.rotation !== 0 || 
          imageInfo.formatting.flipHorizontal || 
          imageInfo.formatting.flipVertical) {
        stats.withTransformations++;
      }
      
      // Dimensiones promedio
      if (imageInfo.formatting.width && imageInfo.formatting.height) {
        totalWidth += imageInfo.formatting.width;
        totalHeight += imageInfo.formatting.height;
        validDimensions++;
      }
    }
    
    if (validDimensions > 0) {
      stats.avgDimensions.width = Math.round(totalWidth / validDimensions);
      stats.avgDimensions.height = Math.round(totalHeight / validDimensions);
    }
    
    return stats;
  }

  getEstimatedPageCount() {
    // Estimación basada en el número de secciones y saltos de página
    return Math.max(1, this.documentStructure.sections.length);
  }

  getHeaderTypes() {
    const types = [];
    for (let i = 1; i <= 10; i++) {
      if (this.documentStructure.headers.has(i)) {
        types.push(`header${i}`);
      }
    }
    return types;
  }

  getFooterTypes() {
    const types = [];
    for (let i = 1; i <= 10; i++) {
      if (this.documentStructure.footers.has(i)) {
        types.push(`footer${i}`);
      }
    }
    return types;
  }

  generateCompleteReport(docxPath) {
    return {
      documentPath: docxPath,
      analysisTimestamp: new Date().toISOString(),
      extractedImages: this.extractedImages.length,
      registryVersion: "3.0",
      summary: {
        totalImages: this.imageRegistry.size,
        pageDistribution: Object.keys(this.pageDistribution || {}).length,
        contextTypes: Object.keys(this.contextDistribution || {}),
        documentStructure: {
          sections: this.documentStructure.sections.length,
          tables: this.documentStructure.tables.length,
          paragraphs: this.documentStructure.paragraphs.length
        }
      },
      capabilities: [
        "Advanced positioning detection",
        "Cropping information extraction",
        "Context analysis (header/footer/table)",
        "Formatting properties capture",
        "Transformation detection",
        "Wrap settings analysis",
        "Relationship mapping",
        "Page distribution tracking"
      ]
    };
  }

  isImageFile(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'].includes(ext);
  }
}

module.exports = { DocumentImageExtractor };
