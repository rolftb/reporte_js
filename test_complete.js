import { ReportStructureGenerator } from './src/generators/reporte_actividad_terreno.js';

async function testCompleteHeaders() {
    console.log('🧪 Prueba completa de funcionalidad de headers...\n');
    
    try {
        const generator = new ReportStructureGenerator();
        
        // 1. Cargar imágenes
        console.log('📁 Cargando imágenes...');
        const config = await generator.loadHeaderImages();
        
        // 2. Verificar tamaños
        console.log('\n📏 Información de imágenes:');
        if (generator.firts_header_image) {
            console.log(`- Primera imagen: ${generator.firts_header_image.length} bytes`);
        }
        if (generator.second_header_image) {
            console.log(`- Segunda imagen: ${generator.second_header_image.length} bytes`);
        }
        
        // 3. Crear headers
        console.log('\n🎨 Creando headers...');
        const firstPageHeader = await generator.createImageHeader(true);
        const otherPagesHeader = await generator.createImageHeader(false);
        
        console.log(`- Header primera página: ${firstPageHeader ? '✓ Creado' : '❌ Error'}`);
        console.log(`- Header otras páginas: ${otherPagesHeader ? '✓ Creado' : '❌ Error'}`);
        
        console.log('\n🎉 ¡Prueba completa exitosa!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCompleteHeaders();
