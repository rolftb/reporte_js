/**
 * Prueba Mínima de Librerías
 */

console.log('🧪 Iniciando prueba mínima...');

try {
    // Importar solo utilidades
    import('./src/lib/docxUtils.js').then(module => {
        const { LogUtils } = module;
        const logger = LogUtils.createLogger('TEST');
        logger.success('✅ Librerías básicas funcionando');
        console.log('🎉 Prueba mínima exitosa');
    }).catch(error => {
        console.error('❌ Error:', error.message);
    });
} catch (error) {
    console.error('❌ Error en prueba mínima:', error.message);
}
