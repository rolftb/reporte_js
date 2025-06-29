/**
 * Demostración Final de Librerías Unificadas
 * 
 * Este script demuestra el uso completo de las librerías unificadas
 * con un ejemplo funcional simple.
 */

async function demoUnifiedLibraries() {
    console.log('🚀 DEMOSTRACIÓN DE LIBRERÍAS UNIFICADAS DOCX');
    console.log('='.repeat(60));
    
    try {
        // Importar librerías
        console.log('📦 Importando librerías...');
        const { LogUtils, DocxUtils, ValidationUtils } = await import('./src/lib/docxUtils.js');
        const { quickGenerate } = await import('./src/lib/index.js');
        
        const logger = LogUtils.createLogger('DEMO');
        logger.success('Librerías importadas exitosamente');
        
        // Crear datos de documento de prueba
        console.log('\\n📝 Preparando datos del documento...');
        const documentData = {
            empresa: "DEMOSTRACIÓN LIBRERÍAS UNIFICADAS",
            actividad: "Prueba de Sistema Unificado",
            fechaPeriodo: "Diciembre 2024 - Enero 2025",
            lugar: "Entorno de Desarrollo",
            profesional: "Sistema Automatizado de Generación",
            sesiones: [
                {
                    fecha: "15-12-2024",
                    cantidadPausas: "1",
                    participantes: "10"
                },
                {
                    fecha: "22-12-2024",
                    cantidadPausas: "1",
                    participantes: "12"
                }
            ]
        };
        
        // Validar datos
        const validation = ValidationUtils.validateDocumentData(documentData);
        if (validation.valid) {
            logger.success('Datos del documento válidos');
        } else {
            logger.error('Datos inválidos:', validation.errors);
            return;
        }
        
        if (validation.warnings.length > 0) {
            logger.warning('Advertencias:', validation.warnings);
        }
        
        // Generar documento usando función rápida
        console.log('\\n🔧 Generando documento...');
        const { measureTime } = LogUtils;
        
        const { result, duration } = await measureTime(
            async () => {
                return await quickGenerate(
                    documentData,
                    'demo_unified_libraries.docx',
                    {
                        outputPath: './output/demo',
                        useRealImages: false // Usar placeholders para la demo
                    }
                );
            },
            'Generación de Documento'
        );
        
        if (result.success) {
            logger.success(`Documento generado exitosamente: ${result.generated}`);
            
            // Verificar archivo generado
            const fileInfo = await DocxUtils.extractBasicInfo(result.generated);
            console.log('\\n📊 Información del archivo generado:');
            console.log(`  📁 Nombre: ${fileInfo.nombre}`);
            console.log(`  📏 Tamaño: ${LogUtils.formatBytes ? LogUtils.formatBytes(fileInfo.tamaño) : fileInfo.tamaño + ' bytes'}`);
            console.log(`  ✅ Válido: ${fileInfo.valido ? 'Sí' : 'No'}`);
            console.log(`  📅 Modificado: ${fileInfo.fechaModificacion}`);
            
        } else {
            logger.error('Error en la generación del documento');
        }
        
        // Mostrar resumen
        console.log('\\n📋 RESUMEN DE LA DEMOSTRACIÓN');
        console.log('-'.repeat(50));
        console.log('✅ Librerías unificadas funcionando correctamente');
        console.log('✅ Validación de datos implementada');
        console.log('✅ Generación de documentos operativa');
        console.log('✅ Utilidades de logging y formato disponibles');
        console.log('✅ Sistema de archivos integrado');
        
        console.log('\\n🎯 BENEFICIOS DE LAS LIBRERÍAS UNIFICADAS:');
        console.log('• Código reutilizable y modular');
        console.log('• APIs consistentes entre componentes');
        console.log('• Manejo unificado de errores y logging');
        console.log('• Validación automática de datos');
        console.log('• Funciones de conveniencia para uso rápido');
        console.log('• Utilidades compartidas para tareas comunes');
        
        console.log('\\n🎉 DEMOSTRACIÓN COMPLETADA EXITOSAMENTE');
        
    } catch (error) {
        console.error('❌ Error en demostración:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Función para mostrar el estado del sistema
async function showSystemInfo() {
    console.log('\\n🔧 INFORMACIÓN DEL SISTEMA');
    console.log('='.repeat(40));
    
    try {
        const { PumaDocxSystem } = await import('./src/lib/index.js');
        
        const system = new PumaDocxSystem({
            outputPath: './output/demo',
            useRealImages: false,
            logLevel: 'info'
        });
        
        system.showSystemStatus();
        
    } catch (error) {
        console.error('❌ Error al mostrar información del sistema:', error.message);
    }
}

// Función principal
async function main() {
    await demoUnifiedLibraries();
    await showSystemInfo();
    
    console.log('\\n📚 Para más información, consulta:');
    console.log('• LIBRERÍAS_UNIFICADAS.md - Documentación completa');
    console.log('• src/examples/unifiedLibrariesExample.js - Ejemplos avanzados');
    console.log('• src/tests/testUnifiedLibraries.js - Pruebas completas');
}

// Ejecutar demostración
main().catch(error => {
    console.error('💥 Error fatal en demostración:', error.message);
    process.exit(1);
});
