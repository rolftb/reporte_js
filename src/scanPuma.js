import DocumentService from './services/DocumentService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script específico para escanear PUMA MES 6 2025.docx
 */
async function scanPumaDocument() {
  console.log('📄 Análisis del Documento PUMA MES 6 2025.docx');
  console.log('=' .repeat(60));
  
  const documentService = new DocumentService();
  
  // Ruta específica del archivo
  const possiblePaths = [
    path.join(__dirname, '..', 'reporte_py', 'template-word', 'PUMA MES 6 2025.docx'),
    'c:\\Users\\rolft\\Repositorios\\Pauli\\reporte_py\\template-word\\PUMA MES 6 2025.docx',
    path.join('..', 'reporte_py', 'template-word', 'PUMA MES 6 2025.docx')
  ];
  
  let filePath = null;
  
  console.log('🔍 Buscando archivo PUMA MES 6 2025.docx...');
  
  for (const testPath of possiblePaths) {
    console.log(`🔍 Verificando: ${testPath}`);
    if (await fs.pathExists(testPath)) {
      console.log(`✅ Encontrado en: ${testPath}`);
      filePath = testPath;
      break;
    }
  }
  
  if (!filePath) {
    console.log('❌ Error: No se pudo encontrar el archivo PUMA MES 6 2025.docx');
    return;
  }
  
  try {
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
      
      // Analizar estructura específica del formato PUMA
      console.log('');
      console.log('🏗️ ANÁLISIS ESPECÍFICO FORMATO PUMA:');
      console.log('-'.repeat(40));
      
      const text = content.text;
      
      // Buscar elementos específicos del formato
      const tieneLogoMutual = text.includes('Logo_mutual') || text.includes('Mutual');
      const tieneCalidadVida = text.includes('Calidad de Vida') || text.includes('calidad');
      const tieneMediosVerificadores = text.includes('Medios Verificadores');
      const tieneAspectosTecnicos = text.includes('ASPECTOS TÉCNICOS') || text.includes('aspectos');
      const tieneRegistroFotografico = text.includes('REGISTRO FOTOGRÁFICO') || text.includes('registro');
      const tieneFechas = text.includes('Fecha') || text.includes('fecha');
      const tienePausas = text.includes('pausa') || text.includes('Pausas');
      const tieneParticipantes = text.includes('Participantes') || text.includes('participantes');
      
      console.log(`🏢 Contiene referencia a Mutual: ${tieneLogoMutual ? 'Sí' : 'No'}`);
      console.log(`💼 Contiene Calidad de Vida: ${tieneCalidadVida ? 'Sí' : 'No'}`);
      console.log(`📋 Contiene Medios Verificadores: ${tieneMediosVerificadores ? 'Sí' : 'No'}`);
      console.log(`⚙️ Contiene Aspectos Técnicos: ${tieneAspectosTecnicos ? 'Sí' : 'No'}`);
      console.log(`📸 Contiene Registro Fotográfico: ${tieneRegistroFotografico ? 'Sí' : 'No'}`);
      console.log(`📅 Contiene referencias de Fecha: ${tieneFechas ? 'Sí' : 'No'}`);
      console.log(`⏸️ Contiene referencias a Pausas: ${tienePausas ? 'Sí' : 'No'}`);
      console.log(`👥 Contiene referencias a Participantes: ${tieneParticipantes ? 'Sí' : 'No'}`);
      
      // Análisis avanzado
      const analysis = await documentService.analyzeTemplate(filePath);
      
      if (analysis.success) {
        console.log('');
        console.log('📋 ANÁLISIS TÉCNICO DETALLADO:');
        console.log('-'.repeat(40));
        console.log(`📊 Total de palabras: ${analysis.wordCount}`);
        console.log(`📄 Total de párrafos: ${analysis.paragraphCount}`);
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
      
      // Mostrar contenido dividido en secciones
      console.log('');
      console.log('📄 CONTENIDO DEL DOCUMENTO:');
      console.log('-'.repeat(40));
      
      // Dividir en líneas y analizar
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      console.log(`📋 Total de líneas con contenido: ${lines.length}`);
      console.log('');
      
      // Mostrar las primeras 20 líneas
      console.log('🔍 PRIMERAS 20 LÍNEAS DEL CONTENIDO:');
      console.log('-'.repeat(40));
      lines.slice(0, 20).forEach((line, index) => {
        console.log(`${(index + 1).toString().padStart(2, '0')}: ${line.trim()}`);
      });
      
      if (lines.length > 20) {
        console.log(`\n[... ${lines.length - 20} líneas adicionales ...]`);
      }
      
      // Guardar análisis detallado
      const analysisFile = path.join('output', `puma_analysis_${Date.now()}.json`);
      await fs.ensureDir('output');
      
      const detailedAnalysis = {
        archivo: 'PUMA MES 6 2025.docx',
        fecha_analisis: new Date().toISOString(),
        ruta_completa: filePath,
        estadisticas: {
          palabras: wordCount,
          caracteres: charCount,
          paragrafos: paragraphCount,
          lineas: lines.length
        },
        elementos_formato: {
          tiene_logo_mutual: tieneLogoMutual,
          tiene_calidad_vida: tieneCalidadVida,
          tiene_medios_verificadores: tieneMediosVerificadores,
          tiene_aspectos_tecnicos: tieneAspectosTecnicos,
          tiene_registro_fotografico: tieneRegistroFotografico,
          tiene_fechas: tieneFechas,
          tiene_pausas: tienePausas,
          tiene_participantes: tieneParticipantes
        },
        estructura: analysis.structure || [],
        tiene_imagenes: analysis.hasImages || false,
        tiene_tablas: analysis.hasTables || false,
        contenido_completo: text,
        lineas_contenido: lines,
        mensajes: content.messages || []
      };
      
      await fs.writeJSON(analysisFile, detailedAnalysis, { spaces: 2 });
      console.log('');
      console.log(`💾 Análisis detallado guardado en: ${analysisFile}`);
      
    } else {
      console.log('❌ Error leyendo el documento:', content.error);
    }
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error.message);
    console.error('🔧 Detalles técnicos:', error);
  }
  
  console.log('');
  console.log('✅ Análisis completado');
}

// Ejecutar el análisis
scanPumaDocument().catch(console.error);
