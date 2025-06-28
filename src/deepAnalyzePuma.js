import fs from 'fs-extra';
import JSZip from 'jszip';
import { DOMParser } from 'xmldom';

/**
 * Analizador profundo de la estructura DOCX de PUMA MES 6 2025
 * Examina el XML interno para entender la estructura exacta
 */
async function deepAnalyzePumaDocx() {
  console.log('🔬 ANÁLISIS PROFUNDO: PUMA MES 6 2025.docx');
  console.log('='.repeat(60));
  
  const filePath = 'c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_py\\template-word\\PUMA MES 6 2025.docx';
  
  try {
    // Leer el archivo DOCX como ZIP
    const buffer = await fs.readFile(filePath);
    const zip = await JSZip.loadAsync(buffer);
    
    console.log('📦 Contenido del archivo ZIP (DOCX):');
    console.log('-'.repeat(40));
    Object.keys(zip.files).forEach(filename => {
      console.log(`📄 ${filename}`);
    });
    
    console.log('');
    console.log('📋 ANÁLISIS DEL DOCUMENTO PRINCIPAL:');
    console.log('-'.repeat(40));
    
    // Analizar document.xml (contenido principal)
    const documentXml = await zip.file('word/document.xml').async('text');
    const parser = new DOMParser();
    const doc = parser.parseFromString(documentXml, 'application/xml');
    
    // Buscar tablas
    const tables = doc.getElementsByTagName('w:tbl');
    console.log(`📊 Número de tablas encontradas: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('');
      console.log('📊 ANÁLISIS DE TABLAS:');
      console.log('-'.repeat(40));
      
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const rows = table.getElementsByTagName('w:tr');
        console.log(`\n📋 Tabla ${i + 1}:`);
        console.log(`   📏 Filas: ${rows.length}`);
        
        // Analizar cada fila
        for (let j = 0; j < Math.min(rows.length, 5); j++) { // Solo primeras 5 filas
          const row = rows[j];
          const cells = row.getElementsByTagName('w:tc');
          console.log(`   📄 Fila ${j + 1}: ${cells.length} celdas`);
          
          // Obtener contenido de las celdas
          for (let k = 0; k < cells.length; k++) {
            const cell = cells[k];
            const textNodes = cell.getElementsByTagName('w:t');
            let cellText = '';
            for (let l = 0; l < textNodes.length; l++) {
              if (textNodes[l].firstChild) {
                cellText += textNodes[l].firstChild.nodeValue || '';
              }
            }
            if (cellText.trim()) {
              console.log(`      📝 Celda ${k + 1}: "${cellText.trim()}"`);
            }
          }
        }
        
        if (rows.length > 5) {
          console.log(`   [...${rows.length - 5} filas adicionales]`);
        }
      }
    }
    
    // Buscar imágenes
    const drawings = doc.getElementsByTagName('w:drawing');
    const pics = doc.getElementsByTagName('pic:pic');
    console.log('');
    console.log(`🖼️ Elementos de dibujo encontrados: ${drawings.length}`);
    console.log(`📸 Imágenes encontradas: ${pics.length}`);
    
    // Analizar relationships para imágenes
    if (await zip.file('word/_rels/document.xml.rels')) {
      const relsXml = await zip.file('word/_rels/document.xml.rels').async('text');
      const relsDoc = parser.parseFromString(relsXml, 'application/xml');
      const relationships = relsDoc.getElementsByTagName('Relationship');
      
      console.log('');
      console.log('🔗 RELACIONES DEL DOCUMENTO:');
      console.log('-'.repeat(40));
      
      const imageRels = [];
      for (let i = 0; i < relationships.length; i++) {
        const rel = relationships[i];
        const type = rel.getAttribute('Type');
        const target = rel.getAttribute('Target');
        const id = rel.getAttribute('Id');
        
        if (type && type.includes('image')) {
          imageRels.push({ id, target });
          console.log(`🖼️ Imagen ${id}: ${target}`);
        }
      }
      
      console.log(`📊 Total de imágenes referenciadas: ${imageRels.length}`);
    }
    
    // Analizar estilos
    if (await zip.file('word/styles.xml')) {
      const stylesXml = await zip.file('word/styles.xml').async('text');
      const stylesDoc = parser.parseFromString(stylesXml, 'application/xml');
      const styles = stylesDoc.getElementsByTagName('w:style');
      
      console.log('');
      console.log('🎨 ESTILOS DEL DOCUMENTO:');
      console.log('-'.repeat(40));
      console.log(`📝 Total de estilos: ${styles.length}`);
      
      // Mostrar algunos estilos importantes
      for (let i = 0; i < Math.min(styles.length, 10); i++) {
        const style = styles[i];
        const styleId = style.getAttribute('w:styleId');
        const styleName = style.getElementsByTagName('w:name')[0];
        const name = styleName ? styleName.getAttribute('w:val') : 'Sin nombre';
        console.log(`   🎨 ${styleId}: ${name}`);
      }
    }
    
    // Extraer texto plano para análisis de estructura
    const textNodes = doc.getElementsByTagName('w:t');
    const allText = [];
    for (let i = 0; i < textNodes.length; i++) {
      if (textNodes[i].firstChild) {
        const text = textNodes[i].firstChild.nodeValue;
        if (text && text.trim()) {
          allText.push(text.trim());
        }
      }
    }
    
    console.log('');
    console.log('📄 ESTRUCTURA DE CONTENIDO IDENTIFICADA:');
    console.log('-'.repeat(40));
    
    // Identificar patrones específicos del formato PUMA
    const patterns = {
      'Header empresa': allText.find(t => t.includes('PUMA')),
      'Aspectos técnicos título': allText.find(t => t.includes('ASPECTOS TÉCNICOS')),
      'Nombre actividad label': allText.find(t => t === 'Nombre de la actividad'),
      'Calidad de vida': allText.find(t => t.includes('Calidad de Vida')),
      'Fecha label': allText.filter(t => t === 'Fecha'),
      'Lugar label': allText.find(t => t === 'Lugar'),
      'Profesional label': allText.find(t => t.includes('Profesional')),
      'Cantidad pausas': allText.filter(t => t.includes('Cantidad de pausas')),
      'Participantes': allText.filter(t => t.includes('Participantes'))
    };
    
    Object.entries(patterns).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`✅ ${key}: ${value.length} ocurrencias`);
        if (value.length > 0) console.log(`   📝 Ejemplo: "${value[0]}"`);
      } else if (value) {
        console.log(`✅ ${key}: "${value}"`);
      } else {
        console.log(`❌ ${key}: No encontrado`);
      }
    });
    
    // Guardar análisis detallado
    const analysis = {
      archivo: 'PUMA MES 6 2025.docx',
      fecha_analisis: new Date().toISOString(),
      estructura_xml: {
        tablas: tables.length,
        imagenes: pics.length,
        dibujos: drawings.length
      },
      patrones_identificados: patterns,
      texto_completo: allText,
      archivos_internos: Object.keys(zip.files)
    };
    
    await fs.ensureDir('output');
    const outputFile = `output/puma_deep_analysis_${Date.now()}.json`;
    await fs.writeJSON(outputFile, analysis, { spaces: 2 });
    
    console.log('');
    console.log(`💾 Análisis profundo guardado en: ${outputFile}`);
    console.log('✅ Análisis profundo completado');
    
  } catch (error) {
    console.error('❌ Error en análisis profundo:', error.message);
    console.error(error);
  }
}

deepAnalyzePumaDocx().catch(console.error);
