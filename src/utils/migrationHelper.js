/**
 * Script de Migración para Bibliotecas Consolidadas
 * 
 * Identifica archivos que aún necesitan ser refactorizados
 * para usar las bibliotecas consolidadas.
 */

const fs = require('fs');
const path = require('path');

class MigrationHelper {
    constructor() {
        this.srcDir = './src';
        this.results = {
            refactored: [],
            needsRefactoring: [],
            unified: [],
            obsolete: []
        };
    }

    analyzeFiles() {
        console.log('🔍 ANÁLISIS DE MIGRACIÓN A BIBLIOTECAS CONSOLIDADAS');
        console.log('============================================================');

        // Analizar directorios
        this.analyzeDirectory('analyzers');
        this.analyzeDirectory('validators'); 
        this.analyzeDirectory('tests');

        this.showResults();
        this.generateMigrationPlan();
    }

    analyzeDirectory(dirName) {
        const dirPath = path.join(this.srcDir, dirName);
        
        if (!fs.existsSync(dirPath)) {
            console.log(`⚠️ Directorio ${dirName} no encontrado`);
            return;
        }

        console.log(`\n📁 Analizando directorio: ${dirName}`);
        
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            if (file.endsWith('.js') || file.endsWith('.cjs')) {
                this.analyzeFile(dirName, file);
            }
        });
    }

    analyzeFile(dirName, fileName) {
        const filePath = path.join(this.srcDir, dirName, fileName);
        const content = fs.readFileSync(filePath, 'utf8');

        // Categorizar archivos
        if (fileName.includes('_refactored')) {
            this.results.refactored.push(`${dirName}/${fileName}`);
            console.log(`   ✅ ${fileName} - Ya refactorizado`);
        } else if (fileName.includes('unified') || fileName.includes('Unified')) {
            this.results.unified.push(`${dirName}/${fileName}`);
            console.log(`   🚀 ${fileName} - Script unificado`);
        } else if (this.needsRefactoring(content, fileName)) {
            this.results.needsRefactoring.push(`${dirName}/${fileName}`);
            console.log(`   🔄 ${fileName} - Necesita refactoring`);
        } else {
            this.results.obsolete.push(`${dirName}/${fileName}`);
            console.log(`   📦 ${fileName} - Posiblemente obsoleto`);
        }
    }

    needsRefactoring(content, fileName) {
        // Verificar si usa bibliotecas consolidadas
        const usesConsolidated = content.includes('ConsolidatedAnalyzer') || 
                                 content.includes('ConsolidatedValidator');
        
        if (usesConsolidated) {
            return false; // Ya está refactorizado
        }

        // Verificar si contiene lógica que debería usar bibliotecas consolidadas
        const hasAnalysisLogic = content.includes('analyzeImageFormatting') ||
                                content.includes('analyzeHeaderDimensions') ||
                                content.includes('analyzeBodyPositioning');
        
        const hasValidationLogic = content.includes('validateImageFormatting') ||
                                  content.includes('validateImageCropping') ||
                                  content.includes('validateBodyPositioning') ||
                                  content.includes('validatePageStructure');

        return hasAnalysisLogic || hasValidationLogic;
    }

    showResults() {
        console.log('\n📊 RESUMEN DE MIGRACIÓN');
        console.log('============================================================');
        
        console.log(`✅ Archivos ya refactorizados: ${this.results.refactored.length}`);
        this.results.refactored.forEach(file => console.log(`   - ${file}`));
        
        console.log(`\n🚀 Scripts unificados: ${this.results.unified.length}`);
        this.results.unified.forEach(file => console.log(`   - ${file}`));
        
        console.log(`\n🔄 Archivos que necesitan refactoring: ${this.results.needsRefactoring.length}`);
        this.results.needsRefactoring.forEach(file => console.log(`   - ${file}`));
        
        console.log(`\n📦 Archivos posiblemente obsoletos: ${this.results.obsolete.length}`);
        this.results.obsolete.forEach(file => console.log(`   - ${file}`));

        // Calcular progreso
        const total = this.results.refactored.length + 
                     this.results.needsRefactoring.length + 
                     this.results.unified.length;
        const completed = this.results.refactored.length + this.results.unified.length;
        const progress = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

        console.log(`\n📈 PROGRESO DE MIGRACIÓN: ${progress}% (${completed}/${total})`);
    }

    generateMigrationPlan() {
        console.log('\n📋 PLAN DE MIGRACIÓN');
        console.log('============================================================');

        if (this.results.needsRefactoring.length === 0) {
            console.log('🎉 ¡Migración completada! Todos los archivos han sido refactorizados.');
            return;
        }

        console.log('Archivos pendientes de refactoring (en orden de prioridad):');
        
        // Priorizar por tipo
        const priorities = {
            validators: [],
            analyzers: [],
            tests: []
        };

        this.results.needsRefactoring.forEach(file => {
            if (file.includes('validators/')) {
                priorities.validators.push(file);
            } else if (file.includes('analyzers/')) {
                priorities.analyzers.push(file);
            } else if (file.includes('tests/')) {
                priorities.tests.push(file);
            }
        });

        console.log('\n1️⃣ ALTA PRIORIDAD - Validadores:');
        priorities.validators.forEach(file => {
            console.log(`   🔄 ${file}`);
            console.log(`      → Crear: ${file.replace('.', '_refactored.')}`);
        });

        console.log('\n2️⃣ MEDIA PRIORIDAD - Analizadores:');
        priorities.analyzers.forEach(file => {
            console.log(`   🔄 ${file}`);
            console.log(`      → Crear: ${file.replace('.', '_refactored.')}`);
        });

        console.log('\n3️⃣ BAJA PRIORIDAD - Tests:');
        priorities.tests.forEach(file => {
            console.log(`   🔄 ${file}`);
            console.log(`      → Crear: ${file.replace('.', '_refactored.')}`);
        });

        console.log('\n💡 PASOS RECOMENDADOS:');
        console.log('1. Refactorizar validadores restantes');
        console.log('2. Refactorizar analizadores restantes');
        console.log('3. Refactorizar tests restantes');
        console.log('4. Probar funcionamiento con testUnifiedLibraries_refactored.js');
        console.log('5. Archivar archivos obsoletos');
        console.log('6. Actualizar documentación');
    }

    generateRefactoringScript(originalFile) {
        console.log(`\n🛠️ PLANTILLA DE REFACTORING PARA: ${originalFile}`);
        console.log('============================================================');

        const refactoredName = originalFile.replace('.', '_refactored.');
        const isValidator = originalFile.includes('validate');
        const isAnalyzer = originalFile.includes('analyze');
        
        const libraryImport = isValidator 
            ? "const { ConsolidatedValidator } = require('../lib/consolidatedValidator.js');"
            : "const { ConsolidatedAnalyzer } = require('../lib/consolidatedAnalyzer.js');";

        console.log(`// Archivo: ${refactoredName}`);
        console.log(libraryImport);
        console.log('');
        console.log('// Usar métodos de la biblioteca consolidada');
        console.log('// Eliminar lógica duplicada');
        console.log('// Mantener interfaz externa idéntica');
    }
}

// Ejecutar análisis
function main() {
    const migrationHelper = new MigrationHelper();
    migrationHelper.analyzeFiles();

    // Mostrar ejemplo de refactoring si hay archivos pendientes
    if (migrationHelper.results.needsRefactoring.length > 0) {
        const firstFile = migrationHelper.results.needsRefactoring[0];
        migrationHelper.generateRefactoringScript(firstFile);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = {
    MigrationHelper,
    main
};
