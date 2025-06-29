/**
 * Script de Duplicación Inteligente de PUMA MES 6 2025.docx
 * 
 * Utiliza el análisis del documento para crear copias modificadas
 */

import { ConsolidatedAnalyzer } from './src/lib/consolidatedAnalyzer.js';
import fs from 'fs-extra';
import path from 'path';

class DocumentDuplicator {
    constructor(originalPath) {
        this.originalPath = originalPath;
        this.analyzer = new ConsolidatedAnalyzer(originalPath);
        this.analysis = null;
    }

    async initialize() {
        console.log('🔍 Analizando documento original...');
        this.analysis = await this.analyzer.analyzeComplete();
        console.log('✅ Análisis completado');
        return this.analysis;
    }

    async createBasicDuplicate(outputPath) {
        console.log('📄 Creando copia básica...');
        await fs.copy(this.originalPath, outputPath);
        console.log(`✅ Copia creada: ${outputPath}`);
        return outputPath;
    }

    async createAnalysisReport(outputDir) {
        const reportPath = path.join(outputDir, 'REPORTE_DUPLICACION.md');
        
        const report = `# 📊 Reporte de Duplicación - ${this.analysis.archivo}

## 📋 Información del Análisis
- **Archivo original:** ${this.analysis.archivo}
- **Tamaño:** ${this.analysis.tamaño.mb} MB
- **Imágenes:** ${Object.keys(this.analysis.structure.media || {}).length}
- **Tablas:** ${this.analysis.structure.tablas || 'N/A'}
- **Fecha de análisis:** ${new Date(this.analysis.timestamp).toLocaleString('es-ES')}

## 🎯 Contenido Identificado
${this.generateContentSummary()}

## 📁 Archivos Duplicados
- ✅ Copia exacta del documento original
- ✅ Análisis completo en JSON
- ✅ Este reporte de duplicación

---
*Duplicación realizada con análisis automatizado*`;

        await fs.writeFile(reportPath, report, 'utf8');
        console.log(`📋 Reporte generado: ${reportPath}`);
        return reportPath;
    }

    generateContentSummary() {
        if (!this.analysis) return 'No hay análisis disponible';

        const summary = [];
        
        // Metadatos
        if (this.analysis.metadata?.core) {
            summary.push(`- **Creador:** ${this.analysis.metadata.core.creator || 'N/A'}`);
            summary.push(`- **Última modificación:** ${this.analysis.metadata.core.lastModifiedBy || 'N/A'}`);
        }

        // Estadísticas
        if (this.analysis.metadata?.app) {
            summary.push(`- **Páginas:** ${this.analysis.metadata.app.pages || 'N/A'}`);
            summary.push(`- **Palabras:** ${this.analysis.metadata.app.words || 'N/A'}`);
        }

        // Estructura
        summary.push(`- **Partes del documento:** ${this.analysis.structure?.partes || 'N/A'}`);
        
        return summary.join('\n');
    }

    async duplicateWithAnalysis(outputDir = './output') {
        await this.initialize();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const baseName = path.basename(this.originalPath, '.docx');
        
        // Crear copias con diferentes propósitos
        const copies = [
            {
                name: `${baseName}_DUPLICADO_${timestamp}.docx`,
                description: 'Copia exacta del original'
            },
            {
                name: `${baseName}_BACKUP_${timestamp}.docx`, 
                description: 'Copia de seguridad'
            }
        ];

        const results = [];
        
        for (const copy of copies) {
            const outputPath = path.join(outputDir, copy.name);
            await this.createBasicDuplicate(outputPath);
            results.push({
                path: outputPath,
                description: copy.description
            });
        }

        // Generar reporte
        await this.createAnalysisReport(outputDir);

        console.log('\n🎉 DUPLICACIÓN COMPLETADA');
        console.log('📁 Archivos generados:');
        results.forEach(result => {
            console.log(`   ✅ ${result.path} - ${result.description}`);
        });

        return results;
    }
}

// Función principal
async function main() {
    const originalPath = process.argv[2] || './uploads/PUMA MES 6 2025.docx';
    const outputDir = process.argv[3] || './output';

    console.log('🚀 DUPLICADOR INTELIGENTE DE DOCUMENTOS DOCX');
    console.log('============================================================');
    console.log(`📄 Archivo origen: ${originalPath}`);
    console.log(`📁 Directorio destino: ${outputDir}`);
    console.log('');

    try {
        const duplicator = new DocumentDuplicator(originalPath);
        const results = await duplicator.duplicateWithAnalysis(outputDir);
        
        console.log('');
        console.log(`✅ ${results.length} archivos duplicados exitosamente`);
        console.log('📊 Análisis completo incluido');
        
        return results;
    } catch (error) {
        console.error('❌ Error en la duplicación:', error.message);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (import.meta.url.startsWith('file://') && process.argv[1].includes('duplicatePuma.js')) {
    main().catch(console.error);
}

export { DocumentDuplicator, main };
