import fs from 'fs-extra';
import JSZip from 'jszip';
import { DOMParser } from 'xmldom';

/**
 * Analizador específico de headers del documento PUMA
 * Para entender la estructura del encabezado de página
 */
async function analyzeHeaders() {
  console.log('🔍 ANÁLISIS DE HEADERS - PUMA MES 6 2025.docx');
  console.log('='.repeat(60));
  
  const filePath = 'c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_py\\template-word\\PUMA MES 6 2025.docx';
  
  try {
    const buffer = await fs.readFile(filePath);
    const zip = await JSZip.loadAsync(buffer);
    const parser = new DOMParser();
    
    // Analizar header1.xml
    if (await zip.file('word/header1.xml')) {
      console.log('📋 HEADER 1:');
      console.log('-'.repeat(40));
      
      const header1Xml = await zip.file('word/header1.xml').async('text');
      const header1Doc = parser.parseFromString(header1Xml, 'application/xml');
      
      // Buscar tablas en header1
      const tables = header1Doc.getElementsByTagName('w:tbl');
      console.log(`📊 Tablas en header1: ${tables.length}`);
      
      if (tables.length > 0) {
        for (let i = 0; i < tables.length; i++) {
          const table = tables[i];
          const rows = table.getElementsByTagName('w:tr');
          console.log(`\n📋 Tabla ${i + 1} en header1:`);
          console.log(`   📏 Filas: ${rows.length}`);
          
          for (let j = 0; j < rows.length; j++) {
            const row = rows[j];
            const cells = row.getElementsByTagName('w:tc');
            console.log(`   📄 Fila ${j + 1}: ${cells.length} celdas`);
            
            for (let k = 0; k < cells.length; k++) {
              const cell = cells[k];
              const textNodes = cell.getElementsByTagName('w:t');
              let cellText = '';
              for (let l = 0; l < textNodes.length; l++) {
                if (textNodes[l].firstChild) {
                  cellText += textNodes[l].firstChild.nodeValue || '';
                }
              }
              
              // Buscar imágenes en la celda
              const drawings = cell.getElementsByTagName('w:drawing');
              const pics = cell.getElementsByTagName('pic:pic');
              
              if (cellText.trim()) {
                console.log(`      📝 Celda ${k + 1}: "${cellText.trim()}"`);
              }
              if (drawings.length > 0) {
                console.log(`      🖼️ Celda ${k + 1}: ${drawings.length} dibujos`);
              }
              if (pics.length > 0) {
                console.log(`      📸 Celda ${k + 1}: ${pics.length} imágenes`);
              }
            }
          }
        }
      }
      
      // Extraer todo el texto del header1
      const textNodes = header1Doc.getElementsByTagName('w:t');
      const headerText = [];
      for (let i = 0; i < textNodes.length; i++) {
        if (textNodes[i].firstChild) {
          const text = textNodes[i].firstChild.nodeValue;
          if (text && text.trim()) {
            headerText.push(text.trim());
          }
        }
      }
      
      console.log('\n📄 Todo el texto en header1:');
      headerText.forEach((text, index) => {
        console.log(`   ${index + 1}: "${text}"`);
      });
    }
    
    // Analizar header2.xml
    if (await zip.file('word/header2.xml')) {
      console.log('\n📋 HEADER 2:');
      console.log('-'.repeat(40));
      
      const header2Xml = await zip.file('word/header2.xml').async('text');
      const header2Doc = parser.parseFromString(header2Xml, 'application/xml');
      
      const tables2 = header2Doc.getElementsByTagName('w:tbl');
      console.log(`📊 Tablas en header2: ${tables2.length}`);
      
      if (tables2.length > 0) {
        for (let i = 0; i < tables2.length; i++) {
          const table = tables2[i];
          const rows = table.getElementsByTagName('w:tr');
          console.log(`\n📋 Tabla ${i + 1} en header2:`);
          console.log(`   📏 Filas: ${rows.length}`);
          
          for (let j = 0; j < rows.length; j++) {
            const row = rows[j];
            const cells = row.getElementsByTagName('w:tc');
            console.log(`   📄 Fila ${j + 1}: ${cells.length} celdas`);
            
            for (let k = 0; k < cells.length; k++) {
              const cell = cells[k];
              const textNodes = cell.getElementsByTagName('w:t');
              let cellText = '';
              for (let l = 0; l < textNodes.length; l++) {
                if (textNodes[l].firstChild) {
                  cellText += textNodes[l].firstChild.nodeValue || '';
                }
              }
              
              const drawings = cell.getElementsByTagName('w:drawing');
              const pics = cell.getElementsByTagName('pic:pic');
              
              if (cellText.trim()) {
                console.log(`      📝 Celda ${k + 1}: "${cellText.trim()}"`);
              }
              if (drawings.length > 0) {
                console.log(`      🖼️ Celda ${k + 1}: ${drawings.length} dibujos`);
              }
              if (pics.length > 0) {
                console.log(`      📸 Celda ${k + 1}: ${pics.length} imágenes`);
              }
            }
          }
        }
      }
      
      // Extraer todo el texto del header2
      const textNodes2 = header2Doc.getElementsByTagName('w:t');
      const headerText2 = [];
      for (let i = 0; i < textNodes2.length; i++) {
        if (textNodes2[i].firstChild) {
          const text = textNodes2[i].firstChild.nodeValue;
          if (text && text.trim()) {
            headerText2.push(text.trim());
          }
        }
      }
      
      console.log('\n📄 Todo el texto en header2:');
      headerText2.forEach((text, index) => {
        console.log(`   ${index + 1}: "${text}"`);
      });
    }
    
    // Analizar las relaciones de los headers para imágenes
    console.log('\n🔗 RELACIONES DE HEADERS:');
    console.log('-'.repeat(40));
    
    if (await zip.file('word/_rels/header1.xml.rels')) {
      const header1RelsXml = await zip.file('word/_rels/header1.xml.rels').async('text');
      const header1RelsDoc = parser.parseFromString(header1RelsXml, 'application/xml');
      const relationships1 = header1RelsDoc.getElementsByTagName('Relationship');
      
      console.log('📋 Header1 relaciones:');
      for (let i = 0; i < relationships1.length; i++) {
        const rel = relationships1[i];
        const type = rel.getAttribute('Type');
        const target = rel.getAttribute('Target');
        const id = rel.getAttribute('Id');
        console.log(`   ${id}: ${target} (${type.split('/').pop()})`);
      }
    }
    
    if (await zip.file('word/_rels/header2.xml.rels')) {
      const header2RelsXml = await zip.file('word/_rels/header2.xml.rels').async('text');
      const header2RelsDoc = parser.parseFromString(header2RelsXml, 'application/xml');
      const relationships2 = header2RelsDoc.getElementsByTagName('Relationship');
      
      console.log('\n📋 Header2 relaciones:');
      for (let i = 0; i < relationships2.length; i++) {
        const rel = relationships2[i];
        const type = rel.getAttribute('Type');
        const target = rel.getAttribute('Target');
        const id = rel.getAttribute('Id');
        console.log(`   ${id}: ${target} (${type.split('/').pop()})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error analizando headers:', error);
  }
}

analyzeHeaders().catch(console.error);
