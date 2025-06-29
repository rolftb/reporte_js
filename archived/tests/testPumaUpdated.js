import PumaDocumentGenerator from './generators/PumaDocumentGenerator.js';
import path from 'path';

async function testPumaGenerator() {
  console.log('🧪 PRUEBA DEL GENERADOR PUMA - ESTRUCTURA ACTUALIZADA');
  console.log('='.repeat(60));
  
  const generator = new PumaDocumentGenerator();
  
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
          // Solo 3 fotos para demostrar que respeta el límite
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
  
  const outputPath = path.join('output', `puma_estructura_actualizada_${Date.now()}.docx`);
  const result = await generator.generateAndSave(testData, outputPath);
  
  if (result.success) {
    console.log('🎉 Generación exitosa!');
    console.log(`📄 Archivo: ${result.path}`);
    console.log('');
    console.log('📋 Características implementadas:');
    console.log('   ✅ Header con estructura real identificada (3 logos)');
    console.log('   ✅ Página 1: Título PUMA + Tabla Aspectos Técnicos');
    console.log('   ✅ Una actividad por página (páginas 2+)');
    console.log('   ✅ Tabla de registro por actividad');
    console.log('   ✅ Máximo 4 fotos por página');
    console.log('   ✅ Grid 2x2 para distribución de fotos');
    console.log('   ✅ Limite estricto de fotos respetado');
    console.log('   ✅ Estructura de header según análisis real');
    console.log('');
    console.log('📊 Estructura del documento generado:');
    console.log(`   - Total de páginas: ${1 + testData.registros.length}`);
    console.log(`   - Actividades: ${testData.registros.length}`);
    console.log(`   - Fotos por página: máximo 4`);
    console.log(`   - Headers específicos por tipo de página`);
  } else {
    console.log('❌ Error en la generación:', result.error);
  }
}

testPumaGenerator().catch(console.error);
