import fs from 'fs-extra';
import JSZip from 'jszip';
import { DOMParser } from 'xmldom';

/**
 * Analizador de estructura de página del documento PUMA
 * Para entender la distribución de contenido por página
 */
async function analyzePageStructure() {
  console.log('📄 ANÁLISIS DE ESTRUCTURA POR PÁGINA - PUMA');
  console.log('='.repeat(60));
  
  const filePath = 'c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_py\\template-word\\PUMA MES 6 2025.docx';
  
  try {
    const buffer = await fs.readFile(filePath);
    const zip = await JSZip.loadAsync(buffer);
    const parser = new DOMParser();
    
    // Analizar document.xml principal
    const documentXml = await zip.file('word/document.xml').async('text');
    const doc = parser.parseFromString(documentXml, 'application/xml');
    
    console.log('📋 ANÁLISIS DETALLADO DEL DOCUMENTO:');
    console.log('-'.repeat(40));
    
    // Buscar saltos de página
    const pageBreaks = doc.getElementsByTagName('w:br');
    const sectionBreaks = doc.getElementsByTagName('w:sectPr');
    
    console.log(`📄 Saltos de página encontrados: ${pageBreaks.length}`);
    console.log(`📑 Secciones encontradas: ${sectionBreaks.length}`);
    
    // Analizar tablas y su contenido
    const tables = doc.getElementsByTagName('w:tbl');
    console.log(`\n📊 ANÁLISIS DETALLADO DE TABLAS (${tables.length} total):`);
    
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const rows = table.getElementsByTagName('w:tr');
      
      console.log(`\n📋 TABLA ${i + 1}:`);
      console.log(`   📏 Filas: ${rows.length}`);
      
      // Analizar cada fila para encontrar patrones
      let tableContent = [];
      
      for (let j = 0; j < rows.length; j++) {
        const row = rows[j];
        const cells = row.getElementsByTagName('w:tc');
        let rowContent = [];
        
        for (let k = 0; k < cells.length; k++) {
          const cell = cells[k];
          
          // Extraer texto
          const textNodes = cell.getElementsByTagName('w:t');
          let cellText = '';
          for (let l = 0; l < textNodes.length; l++) {
            if (textNodes[l].firstChild) {
              cellText += textNodes[l].firstChild.nodeValue || '';
            }
          }
          
          // Contar imágenes en la celda
          const drawings = cell.getElementsByTagName('w:drawing');
          const pics = cell.getElementsByTagName('pic:pic');
          
          rowContent.push({
            text: cellText.trim(),
            images: pics.length,
            drawings: drawings.length
          });
        }
        
        tableContent.push(rowContent);
      }
      
      // Mostrar contenido de la tabla
      tableContent.forEach((row, rowIndex) => {
        console.log(`   📄 Fila ${rowIndex + 1}: ${row.length} celdas`);
        row.forEach((cell, cellIndex) => {
          if (cell.text) {
            console.log(`      📝 Celda ${cellIndex + 1}: "${cell.text}"`);
          }
          if (cell.images > 0) {
            console.log(`      📸 Celda ${cellIndex + 1}: ${cell.images} imágenes`);
          }
        });
      });
      
      // Identificar el tipo de tabla
      if (tableContent.length > 0 && tableContent[0].length > 0) {
        const firstCellText = tableContent[0][0].text;
        if (firstCellText.includes('ASPECTOS TÉCNICOS')) {
          console.log(`   🎯 Tipo: TABLA PRINCIPAL (Aspectos Técnicos)`);
        } else if (firstCellText === 'Fecha' || tableContent.some(row => row.some(cell => cell.text === 'Fecha'))) {
          console.log(`   🎯 Tipo: TABLA DE REGISTRO`);
        } else if (tableContent.some(row => row.some(cell => cell.images > 0))) {
          console.log(`   🎯 Tipo: TABLA CON IMÁGENES (posible grid fotográfico)`);
        }
      }
    }
    
    // Analizar distribución de imágenes
    console.log(`\n🖼️ ANÁLISIS DE DISTRIBUCIÓN DE IMÁGENES:`);
    console.log('-'.repeat(40));
    
    const allDrawings = doc.getElementsByTagName('w:drawing');
    const allPics = doc.getElementsByTagName('pic:pic');
    
    console.log(`📊 Total imágenes en documento: ${allPics.length}`);
    console.log(`🎨 Total elementos drawing: ${allDrawings.length}`);
    
    // Buscar patrones de organización de imágenes
    let imagesByTable = [];
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const tablePics = table.getElementsByTagName('pic:pic');
      const tableDrawings = table.getElementsByTagName('w:drawing');
      
      if (tablePics.length > 0 || tableDrawings.length > 0) {
        imagesByTable.push({
          tableIndex: i + 1,
          images: tablePics.length,
          drawings: tableDrawings.length
        });
      }
    }
    
    console.log('\n📊 Imágenes por tabla:');
    imagesByTable.forEach(table => {
      console.log(`   📋 Tabla ${table.tableIndex}: ${table.images} imágenes, ${table.drawings} drawings`);
    });
    
    // Buscar párrafos con imágenes (fuera de tablas)
    const paragraphs = doc.getElementsByTagName('w:p');
    let imagesInParagraphs = 0;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const paraPics = para.getElementsByTagName('pic:pic');
      if (paraPics.length > 0) {
        imagesInParagraphs += paraPics.length;
      }
    }
    
    console.log(`📄 Imágenes en párrafos (fuera de tablas): ${imagesInParagraphs}`);
    
    // Crear análisis de estructura de página
    const analysis = {
      fecha_analisis: new Date().toISOString(),
      estructura_documento: {
        total_tablas: tables.length,
        total_imagenes: allPics.length,
        saltos_pagina: pageBreaks.length,
        secciones: sectionBreaks.length
      },
      tablas_detalle: [],
      distribucion_imagenes: imagesByTable,
      patrones_identificados: {
        tabla_principal: null,
        tablas_registro: [],
        tablas_imagenes: []
      }
    };
    
    // Clasificar tablas
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const rows = table.getElementsByTagName('w:tr');
      const pics = table.getElementsByTagName('pic:pic');
      
      let tableInfo = {
        indice: i + 1,
        filas: rows.length,
        imagenes: pics.length,
        tipo: 'desconocido',
        contenido_muestra: []
      };
      
      // Extraer muestra de contenido
      for (let j = 0; j < Math.min(rows.length, 3); j++) {
        const row = rows[j];
        const cells = row.getElementsByTagName('w:tc');
        let rowSample = [];
        
        for (let k = 0; k < Math.min(cells.length, 3); k++) {
          const cell = cells[k];
          const textNodes = cell.getElementsByTagName('w:t');
          let cellText = '';
          for (let l = 0; l < textNodes.length; l++) {
            if (textNodes[l].firstChild) {
              cellText += textNodes[l].firstChild.nodeValue || '';
            }
          }
          if (cellText.trim()) {
            rowSample.push(cellText.trim());
          }
        }
        tableInfo.contenido_muestra.push(rowSample);
      }
      
      // Clasificar tipo
      const firstRowText = tableInfo.contenido_muestra[0]?.join(' ') || '';
      if (firstRowText.includes('ASPECTOS TÉCNICOS')) {
        tableInfo.tipo = 'principal';
        analysis.patrones_identificados.tabla_principal = tableInfo;
      } else if (tableInfo.contenido_muestra.some(row => row.includes('Fecha')) && 
                 tableInfo.contenido_muestra.some(row => row.includes('Participantes'))) {
        tableInfo.tipo = 'registro';
        analysis.patrones_identificados.tablas_registro.push(tableInfo);
      } else if (pics.length > 0) {
        tableInfo.tipo = 'imagenes';
        analysis.patrones_identificados.tablas_imagenes.push(tableInfo);
      }
      
      analysis.tablas_detalle.push(tableInfo);
    }
    
    // Guardar análisis
    await fs.ensureDir('output');
    const outputFile = `output/page_structure_analysis_${Date.now()}.json`;
    await fs.writeJSON(outputFile, analysis, { spaces: 2 });
    
    console.log(`\n💾 Análisis guardado en: ${outputFile}`);
    
    // Mostrar resumen
    console.log('\n📋 RESUMEN DE ESTRUCTURA:');
    console.log('-'.repeat(40));
    console.log(`📊 Tabla principal: ${analysis.patrones_identificados.tabla_principal ? 'Sí' : 'No'}`);
    console.log(`📋 Tablas de registro: ${analysis.patrones_identificados.tablas_registro.length}`);
    console.log(`🖼️ Tablas con imágenes: ${analysis.patrones_identificados.tablas_imagenes.length}`);
    
    if (analysis.patrones_identificados.tablas_imagenes.length > 0) {
      console.log('\n🖼️ DETALLES DE TABLAS CON IMÁGENES:');
      analysis.patrones_identificados.tablas_imagenes.forEach(tabla => {
        console.log(`   📋 Tabla ${tabla.indice}: ${tabla.imagenes} imágenes, ${tabla.filas} filas`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error analizando estructura:', error);
  }
}

analyzePageStructure().catch(console.error);
