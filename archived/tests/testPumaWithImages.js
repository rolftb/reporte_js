import PumaDocumentGenerator from './generators/PumaDocumentGenerator.js';
import path from 'path';

async function testPumaWithRealImages() {
  console.log('🧪 PRUEBA DEL GENERADOR PUMA CON IMÁGENES REALES');
  console.log('='.repeat(60));
  
  // Generador con imágenes reales
  const generatorWithImages = new PumaDocumentGenerator(true);
  
  // Generador con placeholders para comparación
  const generatorPlaceholder = new PumaDocumentGenerator(false);
  
  const testData = {
    empresa: "PUMA",
    nombreActividad: "Programa de Calidad de Vida.",
    fechaRango: "Desde el 21 de mayo al al 20 de junio",
    lugar: "Av. Pdte. Kennedy 5454",
    profesional: "Profesional área Calidad de Vida - Mutual Asesorías.",
    registros: [
      {
        fecha: "27-05-2025",
        cantidadPausas: 1,
        participantes: 16,
        fotos: [
          { descripcion: "Participantes reunidos para la actividad" },
          { descripcion: "Momento de relajación y pausas activas" },
          { descripcion: "Interacción grupal durante la pausa" },
          { descripcion: "Finalización de la actividad del día" }
        ]
      },
      {
        fecha: "03-06-2025",
        cantidadPausas: 1,
        participantes: 12,
        fotos: [
          { descripcion: "Inicio de actividades de calidad de vida" },
          { descripcion: "Ejercicios grupales de relajación" },
          { descripcion: "Participación activa del personal" }
        ]
      },
      {
        fecha: "10-06-2025",
        cantidadPausas: 1,
        participantes: 18,
        fotos: [
          { descripcion: "Mayor participación del personal" },
          { descripcion: "Actividades de integración" },
          { descripcion: "Momento de pausa y descanso" },
          { descripcion: "Evaluación de la actividad" }
        ]
      },
      {
        fecha: "17-06-2025",
        cantidadPausas: 1,
        participantes: 16,
        fotos: [
          { descripcion: "Últimas actividades del mes" },
          { descripcion: "Retroalimentación grupal" },
          { descripcion: "Cierre del programa mensual" },
          { descripcion: "Registro final de participación" }
        ]
      }
    ]
  };
  
  console.log('📄 GENERANDO DOCUMENTO CON IMÁGENES REALES...');
  const outputPathReal = path.join('output', `puma_con_imagenes_reales_${Date.now()}.docx`);
  const resultReal = await generatorWithImages.generateAndSave(testData, outputPathReal);
  
  console.log('');
  console.log('📄 GENERANDO DOCUMENTO CON PLACEHOLDERS (para comparación)...');
  const outputPathPlaceholder = path.join('output', `puma_con_placeholders_${Date.now()}.docx`);
  const resultPlaceholder = await generatorPlaceholder.generateAndSave(testData, outputPathPlaceholder);
  
  console.log('');
  console.log('📊 RESUMEN DE GENERACIÓN:');
  
  if (resultReal.success) {
    console.log(`✅ Documento con imágenes reales: ${resultReal.path}`);
  } else {
    console.log(`❌ Error con imágenes reales: ${resultReal.error}`);
  }
  
  if (resultPlaceholder.success) {
    console.log(`✅ Documento con placeholders: ${resultPlaceholder.path}`);
  } else {
    console.log(`❌ Error con placeholders: ${resultPlaceholder.error}`);
  }
  
  console.log('');
  console.log('🎯 CARACTERÍSTICAS IMPLEMENTADAS:');
  console.log('   ✅ Extracción automática de imágenes del DOCX original');
  console.log('   ✅ Prevención de duplicados usando hashes MD5');
  console.log('   ✅ Integración de logos reales en el header');
  console.log('   ✅ Integración de fotos reales en las actividades');
  console.log('   ✅ Fallback a placeholders si las imágenes no están disponibles');
  console.log('   ✅ Respeto del límite de 4 fotos por página');
  console.log('   ✅ Estructura de páginas según documento original');
  
  console.log('');
  console.log('📁 ARCHIVOS RELACIONADOS:');
  console.log('   - Imágenes extraídas: ./extracted_images/');
  console.log('   - Registro de imágenes: ./extracted_images/image_registry.json');
  console.log('   - Análisis completo: ./output/complete_analysis_with_images_*.json');
  
  console.log('');
  console.log('🚀 PRÓXIMOS PASOS:');
  console.log('   1. Verificar visualmente los documentos generados');
  console.log('   2. Comparar con el documento original PUMA MES 6 2025.docx');
  console.log('   3. Ajustar tamaños de imagen si es necesario');
  console.log('   4. Optimizar posicionamiento de logos en el header');
}

testPumaWithRealImages().catch(console.error);
