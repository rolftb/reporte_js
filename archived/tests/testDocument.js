import DocumentService from './services/DocumentService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDocumentGeneration() {
  console.log('🧪 Probando generación de documentos...');
  
  const documentService = new DocumentService();
  
  try {
    // Datos de prueba
    const testData = {
      title: 'Reporte de Prueba - Reporteador de Empresas',
      company: 'Empresa Demo S.A.',
      content: `Este es un reporte de prueba generado automáticamente.

El sistema de reporteador de empresas permite:
- Generar documentos Word (.docx) dinámicamente
- Procesar texto e imágenes
- Aplicar formatos predefinidos
- Crear reportes personalizados para diferentes empresas

Características técnicas:
- Basado en Node.js y JavaScript moderno
- API REST para integración fácil
- Soporte para múltiples formatos de imagen
- Validación de datos de entrada
- Manejo seguro de archivos

Este documento fue generado el: ${new Date().toLocaleString('es-ES')}`,
      images: [], // Sin imágenes por ahora
      template: null // Sin plantilla por ahora
    };
    
    console.log('📝 Creando documento...');
    const result = await documentService.createDocument(testData);
    
    if (result.success) {
      console.log('✅ Documento creado exitosamente:');
      console.log(`   📁 Archivo: ${result.fileName}`);
      console.log(`   📍 Ruta: ${result.outputPath}`);
      console.log(`   📊 Tamaño: ${(result.size / 1024).toFixed(2)} KB`);
      console.log(`   🕒 Creado: ${result.createdAt}`);
    } else {
      console.log('❌ Error creando documento');
    }
    
    // Listar documentos generados
    console.log('\n📋 Listando documentos generados:');
    const documents = await documentService.listGeneratedDocuments();
    
    if (documents.length > 0) {
      documents.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.fileName} (${(doc.size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('   No hay documentos generados');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testDocumentGeneration();
}

export default testDocumentGeneration;
