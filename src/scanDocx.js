import DocumentService from './services/DocumentService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para escanear y analizar archivos DOCX
 * Uso: node src/scanDocx.js [ruta-del-archivo.docx]
 */
async function scanDocxFile() {
  console.log('📄 Escáner de Archivos DOCX - Reporteador de Empresas');
  console.log('=' .repeat(60));
  
  const documentService = new DocumentService();
  
  // Obtener el archivo desde argumentos de línea de comandos
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('❌ Error: Debes proporcionar la ruta del archivo DOCX');
    console.log('📝 Uso: node src/scanDocx.js [ruta-del-archivo.docx]');
    console.log('📝 Ejemplo: node src/scanDocx.js templates/mi-documento.docx');
    process.exit(1);
  }
  
  // Verificar que el archivo existe
  const fileExists = await fs.pathExists(filePath);
  if (!fileExists) {
    console.log(`❌ Error: El archivo ${filePath} no existe`);
    process.exit(1);
  }
  
  // Verificar que es un archivo .docx
  const extension = path.extname(filePath).toLowerCase();
  if (extension !== '.docx' && extension !== '.doc') {
    console.log(`❌ Error: El archivo debe ser .docx o .doc, recibido: ${extension}`);
    process.exit(1);
  }
  
  try {
    console.log(`🔍 Escaneando archivo: ${filePath}`);
    console.log('');
    
    // Leer el archivo DOCX
    console.log('📖 Leyendo contenido del documento...');
    const content = await documentService.readDocxFile(filePath);
    
    if (content.success) {
      console.log('✅ Documento leído exitosamente');
      console.log('');
      
      // Mostrar estadísticas básicas
      console.log('📊 ESTADÍSTICAS DEL DOCUMENTO:');
      console.log('-'.repeat(40));
      
      const wordCount = content.text.split(/\s+/).filter(word => word.length > 0).length;
      const charCount = content.text.length;
      const paragraphCount = content.text.split(/\n+/).filter(p => p.trim().length > 0).length;
      
      console.log(`📝 Palabras: ${wordCount}`);
      console.log(`🔤 Caracteres: ${charCount}`);
      console.log(`📄 Párrafos: ${paragraphCount}`);
      
      // Analizar estructura
      console.log('');
      console.log('🏗️ ANÁLISIS DE ESTRUCTURA:');
      console.log('-'.repeat(40));
      
      const analysis = await documentService.analyzeTemplate(filePath);
      
      if (analysis.success) {
        console.log(`📊 Análisis de palabras: ${analysis.wordCount}`);
        console.log(`📋 Párrafos detectados: ${analysis.paragraphCount}`);
        console.log(`🖼️ Contiene imágenes: ${analysis.hasImages ? 'Sí' : 'No'}`);
        console.log(`📊 Contiene tablas: ${analysis.hasTables ? 'Sí' : 'No'}`);
        
        if (analysis.structure && analysis.structure.length > 0) {
          console.log('');
          console.log('📑 ESTRUCTURA DE ENCABEZADOS:');
          console.log('-'.repeat(40));
          analysis.structure.forEach((item, index) => {
            const indent = '  '.repeat(item.level - 1);
            console.log(`${indent}H${item.level}: ${item.text}`);
          });
        }
      }
      
      // Mostrar una muestra del contenido de texto
      console.log('');
      console.log('📄 MUESTRA DEL CONTENIDO (primeros 500 caracteres):');
      console.log('-'.repeat(40));
      const sampleText = content.text.substring(0, 500);
      console.log(sampleText);
      if (content.text.length > 500) {
        console.log('\n[...contenido truncado...]');
      }
      
      // Mostrar mensajes de conversión si hay alguno
      if (content.messages && content.messages.length > 0) {
        console.log('');
        console.log('⚠️ MENSAJES DE CONVERSIÓN:');
        console.log('-'.repeat(40));
        content.messages.forEach(message => {
          console.log(`${message.type}: ${message.message}`);
        });
      }
      
      // Guardar análisis en archivo
      const analysisFile = path.join('output', `analisis_${path.basename(filePath, extension)}_${Date.now()}.json`);
      await fs.ensureDir('output');
      
      const analysisData = {
        archivo: filePath,
        fecha_analisis: new Date().toISOString(),
        estadisticas: {
          palabras: wordCount,
          caracteres: charCount,
          paragrafos: paragraphCount
        },
        estructura: analysis.structure || [],
        tiene_imagenes: analysis.hasImages || false,
        tiene_tablas: analysis.hasTables || false,
        muestra_contenido: sampleText,
        mensajes: content.messages || []
      };
      
      await fs.writeJSON(analysisFile, analysisData, { spaces: 2 });
      console.log('');
      console.log(`💾 Análisis guardado en: ${analysisFile}`);
      
    } else {
      console.log('❌ Error leyendo el documento');
    }
    
  } catch (error) {
    console.error('❌ Error durante el escaneo:', error.message);
    console.error('🔧 Detalles técnicos:', error);
    process.exit(1);
  }
  
  console.log('');
  console.log('✅ Escaneo completado');
}

// Ejecutar si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  scanDocxFile();
}

export default scanDocxFile;
