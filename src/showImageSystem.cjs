/**
 * Script simple para mostrar el uso del extractor de imágenes
 * y demostrar cómo funciona el sistema de prevención de duplicados
 */

const fs = require('fs');
const path = require('path');

async function showImageRegistry() {
    const registryPath = './extracted_images/image_registry.json';
    
    console.log('📁 VERIFICANDO IMÁGENES EXTRAÍDAS');
    console.log('=' .repeat(40));
    
    try {
        if (!fs.existsSync(registryPath)) {
            console.log('⚠️ No se encontró registro de imágenes');
            console.log('💡 Ejecuta: node src/documentImageExtractor.cjs "documento.docx"');
            return;
        }

        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        const imageCount = Object.keys(registry).length;
        
        console.log(`📋 Registro encontrado: ${imageCount} imágenes extraídas`);
        console.log(`📁 Directorio: ./extracted_images\n`);
        
        // Verificar archivos físicos
        const extractedDir = './extracted_images';
        if (fs.existsSync(extractedDir)) {
            const files = fs.readdirSync(extractedDir);
            const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png|gif|bmp)$/i));
            
            console.log(`🖼️ Archivos de imagen encontrados: ${imageFiles.length}`);
            console.log('');
            
            // Mostrar primeras 5 imágenes
            imageFiles.slice(0, 5).forEach((file, index) => {
                const filePath = path.join(extractedDir, file);
                const stats = fs.statSync(filePath);
                const sizeKB = Math.round(stats.size / 1024);
                console.log(`   ${index + 1}. ${file} (${sizeKB} KB)`);
            });
            
            if (imageFiles.length > 5) {
                console.log(`   ... y ${imageFiles.length - 5} más`);
            }
        }
        
        console.log('\n📊 DETALLES DEL REGISTRO:');
        console.log('-' .repeat(30));
        
        let index = 1;
        for (const [hash, info] of Object.entries(registry)) {
            if (index <= 3) { // Mostrar solo las primeras 3
                const sizeKB = Math.round(info.size / 1024);
                console.log(`${index}. ${info.fileName}`);
                console.log(`   Hash: ${hash.substring(0, 12)}...`);
                console.log(`   Tamaño: ${sizeKB} KB`);
                console.log(`   Original: ${info.originalPath}`);
                console.log('');
            }
            index++;
        }
        
        if (imageCount > 3) {
            console.log(`... y ${imageCount - 3} imágenes más`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function demonstrateExtraction() {
    console.log('\n🔧 CÓMO USAR EL EXTRACTOR DE IMÁGENES');
    console.log('=' .repeat(45));
    console.log('');
    console.log('1. Extraer imágenes del documento PUMA:');
    console.log('   node src/documentImageExtractor.cjs "./uploads/template-word/PUMA MES 6 2025.docx"');
    console.log('');
    console.log('2. Especificar directorio de salida:');
    console.log('   node src/documentImageExtractor.cjs "documento.docx" "./mi_directorio"');
    console.log('');
    console.log('🔄 PREVENCIÓN DE DUPLICADOS:');
    console.log('   - Las imágenes se identifican por hash MD5');
    console.log('   - Si ya existe una imagen, no se vuelve a extraer');
    console.log('   - El registro se mantiene en image_registry.json');
    console.log('');
    console.log('✅ VENTAJAS:');
    console.log('   - No consume espacio innecesario');
    console.log('   - Procesamiento rápido en ejecuciones posteriores');
    console.log('   - Integridad garantizada por hash MD5');
    console.log('   - Compatibilidad con el generador de documentos');
}

// Ejecutar demostración
async function main() {
    console.log('🎯 DEMOSTRACIÓN DEL SISTEMA DE EXTRACCIÓN DE IMÁGENES\n');
    
    await showImageRegistry();
    await demonstrateExtraction();
    
    console.log('\n🎉 Fin de la demostración');
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Las imágenes extraídas están listas para usar');
    console.log('   2. El generador PumaDocumentGenerator puede usar estas imágenes');
    console.log('   3. Ejecuta: node src/testPumaWithImages.js para ver el resultado');
}

main().catch(console.error);
