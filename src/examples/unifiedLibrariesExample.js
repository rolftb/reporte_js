/**
 * Ejemplo de uso de las Librerías Unificadas DOCX
 * 
 * Este archivo demuestra cómo usar las librerías unificadas para
 * análisis, generación y validación de documentos DOCX.
 */

import { 
    PumaDocxSystem, 
    quickAnalyze, 
    quickGenerate, 
    quickValidate, 
    quickProcess 
} from '../lib/index.js';

/**
 * Ejemplo 1: Uso completo del sistema unificado
 */
async function ejemploCompletoSistema() {
    console.log('🔧 EJEMPLO 1: Sistema Completo');
    console.log('=' .repeat(50));
    
    try {
        // Configurar opciones del sistema
        const options = {
            extractedImagesPath: './extracted_images',
            outputPath: './output',
            useRealImages: true,
            logLevel: 'info'
        };

        // Inicializar sistema
        const system = new PumaDocxSystem(options);
        
        // Datos del documento a generar
        const documentData = {
            empresa: "PUMA ENERGY CHILE S.A.",
            actividad: "Programa de Calidad de Vida",
            fechaPeriodo: "Desde el 21 de mayo al 20 de junio",
            lugar: "Av. Pdte. Kennedy 5454",
            profesional: "Profesional área Calidad de Vida - Mutual Asesorías.",
            sesiones: [
                {
                    fecha: "27-05-2025",
                    cantidadPausas: "1",
                    participantes: "16"
                },
                {
                    fecha: "03-06-2025",
                    cantidadPausas: "1",
                    participantes: "12"
                },
                {
                    fecha: "10-06-2025",
                    cantidadPausas: "1",
                    participantes: "18"
                },
                {
                    fecha: "17-06-2025",
                    cantidadPausas: "1",
                    participantes: "15"
                }
            ]
        };

        // Procesar documento completo
        const originalDocxPath = '../reporte_py/template-word/PUMA MES 6 2025.docx';
        const outputFileName = 'puma_unified_complete.docx';
        
        const results = await system.processComplete(originalDocxPath, documentData, outputFileName);
        
        console.log('✅ Procesamiento completo exitoso');
        console.log('📊 Resumen:', results.summary);
        
        // Mostrar estado del sistema
        system.showSystemStatus();
        
        return results;
        
    } catch (error) {
        console.error('❌ Error en ejemplo completo:', error);
        throw error;
    }
}

/**
 * Ejemplo 2: Uso de funciones rápidas individuales
 */
async function ejemploFuncionesRapidas() {
    console.log('\\n⚡ EJEMPLO 2: Funciones Rápidas');
    console.log('=' .repeat(50));
    
    try {
        const originalDocxPath = '../reporte_py/template-word/PUMA MES 6 2025.docx';
        
        // 1. Análisis rápido
        console.log('🔍 Realizando análisis rápido...');
        const analysisResults = await quickAnalyze(originalDocxPath);
        console.log('✅ Análisis completado:', analysisResults.outputPath);
        
        // 2. Generación rápida
        console.log('🔧 Realizando generación rápida...');
        const documentData = {
            empresa: "EJEMPLO EMPRESA",
            actividad: "Actividad de Prueba",
            fechaPeriodo: "Periodo de prueba",
            lugar: "Ubicación de prueba"
        };
        
        const generationResults = await quickGenerate(documentData, 'puma_unified_quick.docx');
        console.log('✅ Generación completada:', generationResults.generated);
        
        // 3. Validación rápida
        console.log('✅ Realizando validación rápida...');
        const validationResults = await quickValidate(generationResults.generated, originalDocxPath);
        console.log('✅ Validación completada:', validationResults.reportPath);
        
        return {
            analysis: analysisResults,
            generation: generationResults,
            validation: validationResults
        };
        
    } catch (error) {
        console.error('❌ Error en funciones rápidas:', error);
        throw error;
    }
}

/**
 * Ejemplo 3: Procesamiento en lote
 */
async function ejemploProcesamientoLote() {
    console.log('\\n📦 EJEMPLO 3: Procesamiento en Lote');
    console.log('=' .repeat(50));
    
    try {
        const system = new PumaDocxSystem({
            outputPath: './output/batch'
        });
        
        // Configurar múltiples documentos
        const documentConfigs = [
            {
                docxPath: '../reporte_py/template-word/PUMA MES 6 2025.docx',
                documentData: {
                    empresa: "EMPRESA A",
                    actividad: "Actividad A",
                    fechaPeriodo: "Período A",
                    lugar: "Lugar A"
                },
                outputFileName: 'batch_document_A.docx'
            },
            {
                docxPath: '../reporte_py/template-word/PUMA MES 6 2025.docx',
                documentData: {
                    empresa: "EMPRESA B",
                    actividad: "Actividad B",
                    fechaPeriodo: "Período B",
                    lugar: "Lugar B"
                },
                outputFileName: 'batch_document_B.docx'
            }
        ];
        
        const batchResults = await system.processBatch(documentConfigs);
        
        console.log('✅ Procesamiento en lote completado');
        console.log(`📊 Resultados: ${batchResults.filter(r => r.success).length}/${batchResults.length} exitosos`);
        
        return batchResults;
        
    } catch (error) {
        console.error('❌ Error en procesamiento en lote:', error);
        throw error;
    }
}

/**
 * Ejemplo 4: Uso individual de componentes
 */
async function ejemploComponentesIndividuales() {
    console.log('\\n🔧 EJEMPLO 4: Componentes Individuales');
    console.log('=' .repeat(50));
    
    try {
        const originalDocxPath = '../reporte_py/template-word/PUMA MES 6 2025.docx';
        
        // Usar solo el analizador
        console.log('🔍 Usando analizador individual...');
        const { DocxAnalyzer } = await import('../lib/docxAnalyzer.js');
        const analyzer = new DocxAnalyzer(originalDocxPath);
        const headerAnalysis = await analyzer.analyzeHeaderDimensions();
        console.log('✅ Análisis de headers completado');
        
        // Usar solo el generador
        console.log('🔧 Usando generador individual...');
        const { DocxGenerator } = await import('../lib/docxGenerator.js');
        const generator = new DocxGenerator({ outputPath: './output' });
        await generator.loadAnalysisData(headerAnalysis);
        
        const documentData = {
            empresa: "PRUEBA INDIVIDUAL",
            actividad: "Test de Componente"
        };
        
        const generatedPath = await generator.generateDocument(documentData, 'individual_test.docx');
        console.log('✅ Generación individual completada');
        
        // Usar solo el validador
        console.log('✅ Usando validador individual...');
        const { DocxValidator } = await import('../lib/docxValidator.js');
        const validator = new DocxValidator(generatedPath);
        const validationResults = await validator.validateComplete();
        validator.showValidationSummary();
        
        return {
            analysis: headerAnalysis,
            generated: generatedPath,
            validation: validationResults
        };
        
    } catch (error) {
        console.error('❌ Error en componentes individuales:', error);
        throw error;
    }
}

/**
 * Función principal para ejecutar todos los ejemplos
 */
async function ejecutarEjemplos() {
    console.log('🚀 EJEMPLOS DE USO - LIBRERÍAS UNIFICADAS DOCX');
    console.log('='.repeat(70));
    
    try {
        // Ejemplo 1: Sistema completo
        const resultadoCompleto = await ejemploCompletoSistema();
        
        // Ejemplo 2: Funciones rápidas
        const resultadoRapido = await ejemploFuncionesRapidas();
        
        // Ejemplo 3: Procesamiento en lote
        const resultadoLote = await ejemploProcesamientoLote();
        
        // Ejemplo 4: Componentes individuales
        const resultadoIndividual = await ejemploComponentesIndividuales();
        
        console.log('\\n🎉 TODOS LOS EJEMPLOS COMPLETADOS EXITOSAMENTE');
        console.log('='.repeat(70));
        
        return {
            completo: resultadoCompleto,
            rapido: resultadoRapido,
            lote: resultadoLote,
            individual: resultadoIndividual
        };
        
    } catch (error) {
        console.error('❌ Error en ejecución de ejemplos:', error);
        process.exit(1);
    }
}

// Ejecutar ejemplos si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    ejecutarEjemplos();
}

export default {
    ejemploCompletoSistema,
    ejemploFuncionesRapidas,
    ejemploProcesamientoLote,
    ejemploComponentesIndividuales,
    ejecutarEjemplos
};
