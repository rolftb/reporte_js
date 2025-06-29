/**
 * Prueba Simple de Librerías Unificadas
 * 
 * Script básico para verificar que las importaciones funcionan correctamente.
 */

async function testBasicImports() {
    console.log('🧪 PRUEBA BÁSICA DE IMPORTACIONES');
    console.log('='.repeat(50));
    
    try {
        // Test 1: Importar utilidades
        console.log('📦 Test 1: Importando utilidades...');
        const { DocxUtils, LogUtils } = await import('../lib/docxUtils.js');
        const logger = LogUtils.createLogger('TEST-IMPORT');
        logger.success('Utilidades importadas correctamente');
        
        // Test 2: Importar analizador
        console.log('📦 Test 2: Importando analizador...');
        const { DocxAnalyzer } = await import('../lib/docxAnalyzer.js');
        logger.success('Analizador importado correctamente');
        
        // Test 3: Importar generador
        console.log('📦 Test 3: Importando generador...');
        const { DocxGenerator } = await import('../lib/docxGenerator.js');
        logger.success('Generador importado correctamente');
        
        // Test 4: Importar validador
        console.log('📦 Test 4: Importando validador...');
        const { DocxValidator } = await import('../lib/docxValidator.js');
        logger.success('Validador importado correctamente');
        
        // Test 5: Importar sistema principal
        console.log('📦 Test 5: Importando sistema principal...');
        const { PumaDocxSystem } = await import('../lib/index.js');
        logger.success('Sistema principal importado correctamente');
        
        // Test 6: Crear instancia del sistema
        console.log('📦 Test 6: Creando instancia del sistema...');
        const system = new PumaDocxSystem({
            outputPath: './output/test'
        });
        system.showSystemStatus();
        logger.success('Sistema instanciado correctamente');
        
        console.log('\\n✅ TODAS LAS IMPORTACIONES EXITOSAS');
        return true;
        
    } catch (error) {
        console.error('❌ Error en importaciones:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

async function testGeneratorCreation() {
    console.log('\\n🔧 PRUEBA DE CREACIÓN DE GENERADOR');
    console.log('='.repeat(50));
    
    try {
        const PumaUnifiedGenerator = (await import('../generators/PumaUnifiedGenerator.js')).default;
        
        const generator = new PumaUnifiedGenerator({
            outputPath: './output/test',
            useRealImages: false
        });
        
        generator.showStats();
        
        console.log('✅ Generador PUMA creado exitosamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error al crear generador:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

async function main() {
    console.log('🚀 PRUEBA SIMPLE DE LIBRERÍAS UNIFICADAS');
    console.log('='.repeat(60));
    
    const test1 = await testBasicImports();
    const test2 = await testGeneratorCreation();
    
    if (test1 && test2) {
        console.log('\\n🎉 TODAS LAS PRUEBAS BÁSICAS EXITOSAS');
        console.log('Las librerías unificadas están funcionando correctamente.');
    } else {
        console.log('\\n💥 ALGUNAS PRUEBAS FALLARON');
        console.log('Revisa los errores mostrados arriba.');
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default { testBasicImports, testGeneratorCreation };
