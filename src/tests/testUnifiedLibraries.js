/**
 * Script de Prueba para Librerías Unificadas DOCX
 * 
 * Este script demuestra el uso completo de las librerías unificadas
 * para generar documentos PUMA con análisis, generación y validación.
 */

import PumaUnifiedGenerator from '../generators/PumaUnifiedGenerator.js';
import { 
    PumaDocxSystem, 
    quickProcess,
    LogUtils 
} from '../lib/index.js';

async function testUnifiedLibraries() {
    console.log('🧪 PRUEBA DE LIBRERÍAS UNIFICADAS DOCX');
    console.log('='.repeat(60));
    
    const logger = LogUtils.createLogger('TEST-UNIFIED');
    
    try {
        // Test 1: Generador PUMA Unificado
        logger.info('🔧 Test 1: Generador PUMA Unificado');
        await testPumaUnifiedGenerator();
        
        // Test 2: Sistema completo
        logger.info('🔧 Test 2: Sistema Completo');
        await testCompleteSystem();
        
        // Test 3: Función de proceso rápido
        logger.info('🔧 Test 3: Proceso Rápido');
        await testQuickProcess();
        
        logger.success('✅ Todas las pruebas completadas exitosamente');
        
    } catch (error) {
        logger.error(`❌ Error en pruebas: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

/**
 * Prueba del generador PUMA unificado
 */
async function testPumaUnifiedGenerator() {
    console.log('\\n🏢 PRUEBA: Generador PUMA Unificado');
    console.log('-'.repeat(50));
    
    try {
        const generator = new PumaUnifiedGenerator({
            outputPath: './output/unified_tests',
            useRealImages: true
        });
        
        // Mostrar estadísticas
        generator.showStats();
        
        // Datos personalizados
        const customData = {
            empresa: "EMPRESA DE PRUEBA UNIFICADA",
            actividad: "Test de Librerías Unificadas",
            fechaPeriodo: "Enero 2025",
            lugar: "Laboratorio de Pruebas",
            sesiones: [
                {
                    fecha: "15-01-2025",
                    cantidadPausas: "2",
                    participantes: "20"
                },
                {
                    fecha: "22-01-2025",
                    cantidadPausas: "1",
                    participantes: "18"
                }
            ]
        };
        
        // Generar documento
        const result = await generator.generatePumaDocument(customData, 'test_unified_puma.docx');
        
        console.log('✅ Generación exitosa');
        console.log(`📄 Archivo generado: ${result.generated ? result.generated.path : 'Generado'}`);
        
        // Validar documento generado
        if (result.generated && result.generated.path) {
            const validationResult = await generator.validateGenerated(result.generated.path);
            console.log(`✅ Validación: ${validationResult.validation.valido ? 'VÁLIDO' : 'INVÁLIDO'}`);
        }
        
        // Limpiar recursos
        await generator.cleanup();
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en prueba del generador PUMA:', error);
        throw error;
    }
}

/**
 * Prueba del sistema completo
 */
async function testCompleteSystem() {
    console.log('\\n🔧 PRUEBA: Sistema Completo');
    console.log('-'.repeat(50));
    
    try {
        const system = new PumaDocxSystem({
            outputPath: './output/unified_tests',
            useRealImages: true,
            logLevel: 'info'
        });
        
        const documentData = {
            empresa: "SISTEMA COMPLETO TEST",
            actividad: "Prueba de Sistema Unificado",
            fechaPeriodo: "Test Period 2025",
            lugar: "Test Location"
        };
        
        // Buscar documento original
        const originalPaths = [
            '../reporte_py/template-word/PUMA MES 6 2025.docx',
            './uploads/PUMA MES 6 2025.docx'
        ];
        
        let originalPath = null;
        const { DocxUtils } = await import('../lib/docxUtils.js');
        
        for (const path of originalPaths) {
            try {
                if (await DocxUtils.isValidDocx(path)) {
                    originalPath = path;
                    break;
                }
            } catch (error) {
                // Continuar buscando
            }
        }
        
        if (originalPath) {
            console.log(`📄 Usando documento original: ${originalPath}`);
            
            const result = await system.processComplete(
                originalPath, 
                documentData, 
                'test_system_complete.docx'
            );
            
            console.log('✅ Procesamiento completo exitoso');
            console.log(`📊 Calidad: ${result.summary.quality.puntuacionCalidad}/100`);
            
            // Mostrar recomendaciones
            if (result.summary.recommendations.length > 0) {
                console.log('💡 Recomendaciones:');
                result.summary.recommendations.forEach((rec, index) => {
                    console.log(`  ${index + 1}. ${rec}`);
                });
            }
            
            return result;
        } else {
            console.log('⚠️ No se encontró documento original, probando solo generación');
            
            const result = await system.generateOnly(
                documentData, 
                null, 
                'test_system_generate_only.docx'
            );
            
            console.log('✅ Generación exitosa');
            return result;
        }
        
    } catch (error) {
        console.error('❌ Error en prueba del sistema completo:', error);
        throw error;
    }
}

/**
 * Prueba de proceso rápido
 */
async function testQuickProcess() {
    console.log('\\n⚡ PRUEBA: Proceso Rápido');
    console.log('-'.repeat(50));
    
    try {
        const documentData = {
            empresa: "QUICK PROCESS TEST",
            actividad: "Prueba de Proceso Rápido",
            fechaPeriodo: "Quick Test 2025",
            lugar: "Test Environment",
            sesiones: [
                {
                    fecha: "01-01-2025",
                    cantidadPausas: "1",
                    participantes: "10"
                }
            ]
        };
        
        const options = {
            outputPath: './output/unified_tests',
            useRealImages: false // Usar placeholders para prueba rápida
        };
        
        // Buscar documento original
        const originalPaths = [
            '../reporte_py/template-word/PUMA MES 6 2025.docx',
            './uploads/PUMA MES 6 2025.docx'
        ];
        
        let originalPath = null;
        const { DocxUtils } = await import('../lib/docxUtils.js');
        
        for (const path of originalPaths) {
            try {
                if (await DocxUtils.isValidDocx(path)) {
                    originalPath = path;
                    break;
                }
            } catch (error) {
                // Continuar buscando
            }
        }
        
        if (originalPath) {
            const { measureTime } = LogUtils;
            
            const { result, duration } = await measureTime(
                () => quickProcess(originalPath, documentData, 'test_quick_process.docx', options),
                'Proceso Rápido Completo'
            );
            
            console.log('✅ Proceso rápido completado');
            console.log(`⏱️ Tiempo total: ${duration}ms`);
            console.log(`📊 Resultado: ${result.success ? 'EXITOSO' : 'FALLIDO'}`);
            
            return result;
        } else {
            console.log('⚠️ No se encontró documento original para proceso rápido');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error en prueba de proceso rápido:', error);
        throw error;
    }
}

/**
 * Función principal
 */
async function main() {
    try {
        await testUnifiedLibraries();
        
        console.log('\\n🎉 PRUEBAS COMPLETADAS EXITOSAMENTE');
        console.log('='.repeat(60));
        console.log('📁 Revisa la carpeta ./output/unified_tests para ver los archivos generados');
        
    } catch (error) {
        console.error('\\n💥 PRUEBAS FALLIDAS');
        console.error('='.repeat(60));
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default {
    testUnifiedLibraries,
    testPumaUnifiedGenerator,
    testCompleteSystem,
    testQuickProcess
};
