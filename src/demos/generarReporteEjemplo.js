import ReporteCalidadVidaGenerator from '../services/ReporteCalidadVidaGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para generar un reporte de Calidad de Vida de ejemplo
 */
async function generarReporteEjemplo() {
  console.log('📄 Generando Reporte de Calidad de Vida - Ejemplo');
  console.log('=' .repeat(60));
  
  const generator = new ReporteCalidadVidaGenerator();
  
  // Datos de ejemplo basados en la especificación
  const datosEjemplo = {
    // Datos de la empresa
    nombre_empresa: 'PUMA ENERGY CHILE S.A.',
    
    // Datos de la actividad
    fecha_inicio: '21 de mayo',
    fecha_fin: '20 de junio',
    lugar_actividad: 'Av. Pdte. Kennedy 5454',
    profesional_cargo: 'Profesional área Calidad de Vida - Mutual Asesorías',
    
    // Datos del registro fotográfico
    fecha_registro: '27-05-2024',
    cantidad_pausas: 1,
    participantes_pausa1: 16
  };
  
  // Rutas de imágenes (opcionales - se pueden dejar vacías para usar placeholders)
  const imagenesEjemplo = {
    // Logos corporativos
    logo_mutual: null, // 'assets/logo_mutual.png',
    logo_calidad_vida: null, // 'assets/logo_calidad_vida.png',
    
    // Fotografías de la actividad
    foto1: null, // 'uploads/foto1.jpg',
    foto2: null, // 'uploads/foto2.jpg', 
    foto3: null, // 'uploads/foto3.jpg',
    foto4: null  // 'uploads/foto4.jpg'
  };
  
  try {
    console.log('🔄 Procesando datos...');
    console.log(`📍 Empresa: ${datosEjemplo.nombre_empresa}`);
    console.log(`📅 Período: ${datosEjemplo.fecha_inicio} al ${datosEjemplo.fecha_fin}`);
    console.log(`📍 Lugar: ${datosEjemplo.lugar_actividad}`);
    console.log(`👥 Participantes: ${datosEjemplo.participantes_pausa1}`);
    console.log('');
    
    // Generar el reporte
    const resultado = await generator.generarReporte(datosEjemplo, imagenesEjemplo);
    
    if (resultado.success) {
      console.log('✅ REPORTE GENERADO EXITOSAMENTE');
      console.log('-'.repeat(40));
      console.log(`📁 Archivo: ${resultado.fileName}`);
      console.log(`📍 Ubicación: ${resultado.outputPath}`);
      console.log(`📊 Tamaño: ${(resultado.size / 1024).toFixed(2)} KB`);
      console.log(`🖼️ Imágenes procesadas: ${resultado.imagenes_procesadas}`);
      console.log('');
      
      console.log('📋 ESTRUCTURA DEL DOCUMENTO GENERADO:');
      console.log('✅ Encabezado con logos corporativos');
      console.log('✅ Tabla de aspectos técnicos completa');
      console.log('✅ Registro fotográfico con grid 2x2');
      console.log('✅ Formato corporativo Mutual Asesorías');
      console.log('✅ Colores y tipografía oficial');
      console.log('');
      
      console.log('🚀 PRÓXIMOS PASOS:');
      console.log('1. Abrir el archivo generado en Microsoft Word');
      console.log('2. Verificar el formato y estructura');
      console.log('3. Agregar imágenes reales si es necesario');
      console.log('4. Usar como plantilla para reportes futuros');
      console.log('');
      
      // Mostrar comando para escanear el archivo generado
      console.log('🔍 ESCANEAR EL REPORTE GENERADO:');
      console.log(`setup.bat scan "${resultado.outputPath}"`);
      
    } else {
      console.log('❌ Error generando el reporte');
    }
    
  } catch (error) {
    console.error('❌ ERROR DURANTE LA GENERACIÓN:', error.message);
    console.error('🔧 Detalles técnicos:', error);
    
    if (error.message.includes('Datos requeridos faltantes')) {
      console.log('');
      console.log('💡 SUGERENCIA: Verifica que todos los campos requeridos estén presentes:');
      console.log('- nombre_empresa');
      console.log('- fecha_inicio, fecha_fin');
      console.log('- lugar_actividad');
      console.log('- profesional_cargo');
      console.log('- fecha_registro');
      console.log('- cantidad_pausas');
      console.log('- participantes_pausa1');
    }
  }
}

// Función para demostrar el uso con datos personalizados
async function generarReportePersonalizado() {
  console.log('📄 EJEMPLO: Generar Reporte Personalizado');
  console.log('=' .repeat(50));
  
  const generator = new ReporteCalidadVidaGenerator();
  
  // Ejemplo de datos personalizados
  const datosPersonalizados = {
    nombre_empresa: 'MI EMPRESA PERSONALIZADA',
    fecha_inicio: '01 de julio',
    fecha_fin: '31 de julio',
    lugar_actividad: 'Oficina Central - Las Condes',
    profesional_cargo: 'Especialista en Bienestar Laboral',
    fecha_registro: '15-07-2025',
    cantidad_pausas: 2,
    participantes_pausa1: 25
  };
  
  try {
    const resultado = await generator.generarReporte(datosPersonalizados);
    console.log(`✅ Reporte personalizado generado: ${resultado.fileName}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar según los argumentos de línea de comandos
const modo = process.argv[2];

if (modo === 'personalizado') {
  generarReportePersonalizado();
} else {
  generarReporteEjemplo();
}

export { generarReporteEjemplo, generarReportePersonalizado };
