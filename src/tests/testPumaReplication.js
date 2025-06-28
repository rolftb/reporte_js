import PumaDocumentGenerator from './generators/PumaDocumentGenerator.js';
import path from 'path';

async function testPumaReplication() {
  console.log('🧪 PRUEBA DE REPLICACIÓN ESTRUCTURA PUMA');
  console.log('='.repeat(60));
  
  const generator = new PumaDocumentGenerator();
  
  // Datos exactos del análisis del documento original
  const datosOriginales = {
    empresa: "PUMA",
    nombreActividad: "Programa de Calidad de Vida.",
    fechaRango: "Desde el 21 de mayo al al 20 de junio",
    lugar: "Av. Pdte. Kennedy 5454",
    profesional: "Profesional área Calidad de Vida - Mutual Asesorías.",
    registros: [
      {
        fecha: "27-05-2025",
        cantidadPausas: 1,
        participantes: 16
      },
      {
        fecha: "03-06-2025",
        cantidadPausas: 1,
        participantes: 12
      },
      {
        fecha: "10-06-2025",
        cantidadPausas: 1,
        participantes: 18
      },
      {
        fecha: "17-06-2025",
        cantidadPausas: 1,
        participantes: 16
      }
    ]
  };
  
  console.log('📊 Datos a replicar:');
  console.log(`   🏢 Empresa: ${datosOriginales.empresa}`);
  console.log(`   💼 Actividad: ${datosOriginales.nombreActividad}`);
  console.log(`   📅 Rango fechas: ${datosOriginales.fechaRango}`);
  console.log(`   📍 Lugar: ${datosOriginales.lugar}`);
  console.log(`   👤 Profesional: ${datosOriginales.profesional}`);
  console.log(`   📋 Registros: ${datosOriginales.registros.length} entradas`);
  
  console.log('');
  console.log('🔧 Generando documento...');
  
  const outputPath = path.join('output', `puma_replicado_${Date.now()}.docx`);
  const resultado = await generator.generateAndSave(datosOriginales, outputPath);
  
  if (resultado.success) {
    console.log('✅ REPLICACIÓN EXITOSA');
    console.log(`📄 Archivo generado: ${resultado.path}`);
    console.log('');
    console.log('📋 ESTRUCTURA REPLICADA:');
    console.log('   ✅ Título principal PUMA');
    console.log('   ✅ Tabla Aspectos Técnicos (5 filas)');
    console.log('   ✅ 4 Tablas de registro por fecha');
    console.log('   ✅ Formato y estilos corporativos');
    console.log('');
    console.log('🔍 Para verificar la replicación:');
    console.log('   1. Abrir el archivo generado en Word');
    console.log('   2. Comparar con el original PUMA MES 6 2025.docx');
    console.log('   3. Verificar estructura de tablas');
    
  } else {
    console.log('❌ ERROR EN LA REPLICACIÓN');
    console.log(`🔧 Detalles: ${resultado.error}`);
  }
}

// Ejecutar la prueba
testPumaReplication().catch(console.error);
