# Librerías Unificadas DOCX - Sistema PUMA

Este documento describe el sistema de librerías unificadas para análisis, generación y validación de documentos DOCX del proyecto PUMA.

## 📚 Descripción General

Las librerías unificadas proporcionan un conjunto coherente y reutilizable de funciones para:

- **Análisis**: Extracción de estructura, formateo, posicionamiento e imágenes de documentos DOCX
- **Generación**: Creación de documentos DOCX con réplica exacta de formato y contenido
- **Validación**: Verificación de integridad, estructura y fidelidad de documentos generados
- **Utilidades**: Funciones auxiliares para manejo de archivos, imágenes, formatos y logging

## 🏗️ Estructura de las Librerías

```
src/lib/
├── index.js              # Punto de entrada principal
├── docxAnalyzer.js       # Análisis de documentos DOCX
├── docxGenerator.js      # Generación de documentos DOCX
├── docxValidator.js      # Validación de documentos DOCX
└── docxUtils.js          # Utilidades compartidas
```

## 🔧 Instalación y Configuración

### Dependencias

```bash
npm install docx adm-zip xmldom xml2js fs-extra
```

### Uso Básico

```javascript
import { PumaDocxSystem, quickProcess } from './src/lib/index.js';

// Uso del sistema completo
const system = new PumaDocxSystem({
    extractedImagesPath: './extracted_images',
    outputPath: './output',
    useRealImages: true
});

// Proceso rápido
const result = await quickProcess(
    'original.docx',
    documentData,
    'generated.docx'
);
```

## 📖 Documentación de APIs

### PumaDocxSystem

Clase principal que unifica todas las funcionalidades.

#### Constructor

```javascript
const system = new PumaDocxSystem(options);
```

**Opciones:**
- `extractedImagesPath`: Ruta donde están las imágenes extraídas (default: './extracted_images')
- `outputPath`: Ruta de salida para documentos generados (default: './output')
- `useRealImages`: Usar imágenes reales o placeholders (default: true)
- `logLevel`: Nivel de logging ('info', 'debug', 'error')

#### Métodos Principales

##### `processComplete(docxPath, documentData, outputFileName)`

Ejecuta el flujo completo de análisis, generación y validación.

```javascript
const result = await system.processComplete(
    '../template-word/PUMA MES 6 2025.docx',
    {
        empresa: "EMPRESA EJEMPLO",
        actividad: "Actividad de Ejemplo",
        fechaPeriodo: "Enero 2025",
        lugar: "Ubicación",
        sesiones: [...]
    },
    'documento_generado.docx'
);
```

**Retorna:**
```javascript
{
    original: {
        path: string,
        analysis: object
    },
    generated: {
        path: string,
        validation: object,
        comparison: object
    },
    success: boolean,
    summary: object
}
```

##### `analyzeOnly(docxPath)`

Solo analiza un documento DOCX existente.

```javascript
const analysis = await system.analyzeOnly('documento.docx');
```

##### `generateOnly(documentData, analysisFile, outputFileName)`

Solo genera un documento DOCX.

```javascript
const result = await system.generateOnly(
    documentData,
    'analysis.json',  // opcional
    'nuevo_documento.docx'
);
```

##### `validateOnly(docxPath, referencePath)`

Solo valida un documento DOCX.

```javascript
const validation = await system.validateOnly(
    'documento_generado.docx',
    'documento_original.docx'  // opcional
);
```

##### `processBatch(documentConfigs)`

Procesa múltiples documentos en lote.

```javascript
const configs = [
    {
        docxPath: 'original1.docx',
        documentData: { ... },
        outputFileName: 'output1.docx'
    },
    {
        docxPath: 'original2.docx',
        documentData: { ... },
        outputFileName: 'output2.docx'
    }
];

const results = await system.processBatch(configs);
```

### DocxAnalyzer

Clase especializada en análisis de documentos DOCX.

#### Métodos Principales

##### `analyzeComplete()`

Análisis completo del documento.

```javascript
const analyzer = new DocxAnalyzer('documento.docx');
const analysis = await analyzer.analyzeComplete();
```

**Resultado:**
```javascript
{
    headerDimensions: { ... },
    imageFormatting: { ... },
    bodyPositioning: { ... },
    documentStructure: { ... }
}
```

##### `analyzeHeaderDimensions()`

Analiza dimensiones de imágenes en headers.

##### `analyzeImageFormatting()`

Analiza formato y posicionamiento de imágenes.

##### `analyzeBodyPositioning()`

Analiza posicionamiento de elementos en el body.

##### `analyzeDocumentStructure()`

Analiza estructura general del documento.

### DocxGenerator

Clase especializada en generación de documentos DOCX.

#### Constructor

```javascript
const generator = new DocxGenerator({
    useRealImages: true,
    extractedImagesPath: './extracted_images',
    outputPath: './output'
});
```

#### Métodos Principales

##### `generateDocument(documentData, outputFileName)`

Genera un documento completo.

```javascript
const outputPath = await generator.generateDocument(
    documentData,
    'documento_generado.docx'
);
```

##### `loadAnalysisData(analysisFile)`

Carga datos de análisis previo.

```javascript
await generator.loadAnalysisData('analysis.json');
```

### DocxValidator

Clase especializada en validación de documentos DOCX.

#### Métodos Principales

##### `validateComplete()`

Validación completa del documento.

```javascript
const validator = new DocxValidator('documento.docx');
const validation = await validator.validateComplete();
```

**Resultado:**
```javascript
{
    valido: boolean,
    errores: string[],
    advertencias: string[],
    validaciones: {
        estructura: { ... },
        headers: { ... },
        imagenes: { ... },
        tablas: { ... },
        posicionamiento: { ... },
        integridad: { ... }
    }
}
```

##### `validateAgainstReference(referencePath)`

Compara con documento de referencia.

```javascript
const comparison = await validator.validateAgainstReference('original.docx');
```

##### `showValidationSummary()`

Muestra resumen de validación en consola.

##### `generateValidationReport(outputPath)`

Genera reporte de validación en archivo JSON.

### Funciones de Conveniencia

#### `quickAnalyze(docxPath, outputPath)`

Análisis rápido de un documento.

```javascript
import { quickAnalyze } from './src/lib/index.js';

const result = await quickAnalyze('documento.docx', './output');
```

#### `quickGenerate(documentData, outputFileName, options)`

Generación rápida de un documento.

```javascript
import { quickGenerate } from './src/lib/index.js';

const result = await quickGenerate(
    documentData,
    'documento.docx',
    { useRealImages: true }
);
```

#### `quickValidate(docxPath, referencePath, outputPath)`

Validación rápida de un documento.

```javascript
import { quickValidate } from './src/lib/index.js';

const result = await quickValidate(
    'documento.docx',
    'referencia.docx',
    './output'
);
```

#### `quickProcess(originalDocxPath, documentData, outputFileName, options)`

Proceso completo rápido.

```javascript
import { quickProcess } from './src/lib/index.js';

const result = await quickProcess(
    'original.docx',
    documentData,
    'generado.docx',
    { outputPath: './output' }
);
```

## 🔧 Utilidades

### DocxUtils

Utilidades para manejo de archivos DOCX.

```javascript
import { DocxUtils } from './src/lib/index.js';

// Verificar si es DOCX válido
const isValid = await DocxUtils.isValidDocx('archivo.docx');

// Extraer información básica
const info = await DocxUtils.extractBasicInfo('archivo.docx');

// Buscar archivos DOCX
const files = await DocxUtils.findDocxFiles('./directorio', true);

// Crear respaldo
const backupPath = await DocxUtils.createBackup('archivo.docx');
```

### ImageUtils

Utilidades para manejo de imágenes.

```javascript
import { ImageUtils } from './src/lib/index.js';

// Verificar imagen válida
const isValid = ImageUtils.isValidImageFile('imagen.jpg');

// Información de imagen
const info = await ImageUtils.getImageInfo('imagen.jpg');

// Buscar imágenes
const images = await ImageUtils.findImageFiles('./directorio');

// Organizar por sesión
const organized = ImageUtils.organizeImagesBySession(imagePaths);
```

### FormatUtils

Utilidades para conversiones de formato.

```javascript
import { FormatUtils } from './src/lib/index.js';

// Conversiones
const pixels = FormatUtils.emuToPixels(914400);
const emu = FormatUtils.pixelsToEmu(96);
const points = FormatUtils.emuToPoints(12700);

// Formatear bytes
const size = FormatUtils.formatBytes(1024000);

// Fecha para archivo
const timestamp = FormatUtils.formatDateForFilename();
```

### LogUtils

Utilidades para logging y reportes.

```javascript
import { LogUtils } from './src/lib/index.js';

// Crear logger
const logger = LogUtils.createLogger('MI-APP');
logger.info('Mensaje informativo');
logger.success('Operación exitosa');
logger.warning('Advertencia');
logger.error('Error');

// Progreso
LogUtils.logProgress(5, 10, 'Procesando');

// Medir tiempo
const { result, duration } = await LogUtils.measureTime(
    async () => await miOperacion(),
    'Mi Operación'
);

// Guardar log
await LogUtils.saveLogToFile(logData, './logs');
```

### ValidationUtils

Utilidades para validación de datos.

```javascript
import { ValidationUtils } from './src/lib/index.js';

// Validar datos del documento
const validation = ValidationUtils.validateDocumentData(documentData);

// Validar opciones
const optionsValidation = ValidationUtils.validateOptions(options);

// Normalizar datos
const normalized = ValidationUtils.normalizeDocumentData(rawData);
```

## 📊 Estructura de Datos

### DocumentData

Estructura de datos para documentos:

```javascript
{
    empresa: string,           // Requerido
    actividad: string,         // Requerido
    fechaPeriodo: string,      // Recomendado
    lugar: string,             // Recomendado
    profesional: string,       // Opcional
    sesiones: [                // Opcional
        {
            fecha: string,
            cantidadPausas: string,
            participantes: string
        }
    ]
}
```

### AnalysisResult

Resultado de análisis:

```javascript
{
    fecha: string,
    archivo: string,
    headerDimensions: {
        headers: [
            {
                archivo: string,
                imagenes: [
                    {
                        relacionId: string,
                        dimensionesOriginales: { cx: string, cy: string },
                        dimensionesPixeles: { width: number, height: number },
                        posicion: number
                    }
                ]
            }
        ]
    },
    imageFormatting: { ... },
    bodyPositioning: { ... },
    documentStructure: { ... }
}
```

### ValidationResult

Resultado de validación:

```javascript
{
    fecha: string,
    archivo: string,
    valido: boolean,
    errores: string[],
    advertencias: string[],
    validaciones: {
        estructura: { valido: boolean, errores: string[], detalles: object },
        headers: { valido: boolean, errores: string[], detalles: object },
        imagenes: { valido: boolean, errores: string[], detalles: object },
        tablas: { valido: boolean, errores: string[], detalles: object },
        posicionamiento: { valido: boolean, errores: string[], detalles: object },
        integridad: { valido: boolean, errores: string[], detalles: object }
    }
}
```

## 🚀 Ejemplos de Uso

### Ejemplo 1: Generador PUMA con Librerías Unificadas

```javascript
import PumaUnifiedGenerator from './src/generators/PumaUnifiedGenerator.js';

const generator = new PumaUnifiedGenerator({
    outputPath: './output',
    useRealImages: true
});

const customData = {
    empresa: "MI EMPRESA",
    actividad: "Mi Actividad",
    fechaPeriodo: "Enero 2025",
    lugar: "Mi Ubicación",
    sesiones: [
        {
            fecha: "15-01-2025",
            cantidadPausas: "2",
            participantes: "20"
        }
    ]
};

const result = await generator.generatePumaDocument(
    customData,
    'mi_documento_puma.docx'
);
```

### Ejemplo 2: Análisis y Validación

```javascript
import { PumaDocxSystem } from './src/lib/index.js';

const system = new PumaDocxSystem();

// Analizar documento original
const analysis = await system.analyzeOnly('original.docx');

// Generar documento basado en análisis
const generation = await system.generateOnly(
    documentData,
    analysis.outputPath,
    'nuevo.docx'
);

// Validar documento generado
const validation = await system.validateOnly(
    generation.generated,
    'original.docx'
);
```

### Ejemplo 3: Procesamiento en Lote

```javascript
import { PumaDocxSystem } from './src/lib/index.js';

const system = new PumaDocxSystem();

const configs = [
    {
        docxPath: 'original1.docx',
        documentData: { empresa: "Empresa 1", ... },
        outputFileName: 'output1.docx'
    },
    {
        docxPath: 'original2.docx',
        documentData: { empresa: "Empresa 2", ... },
        outputFileName: 'output2.docx'
    }
];

const results = await system.processBatch(configs);
console.log(`Procesados: ${results.filter(r => r.success).length}/${results.length}`);
```

## 🧪 Testing

### Ejecutar Pruebas

```bash
# Pruebas completas de librerías unificadas
node src/tests/testUnifiedLibraries.js

# Ejemplos de uso
node src/examples/unifiedLibrariesExample.js
```

### Estructura de Pruebas

- `testUnifiedLibraries.js`: Pruebas principales del sistema unificado
- `unifiedLibrariesExample.js`: Ejemplos completos de uso

## 📋 Mejores Prácticas

### 1. Gestión de Errores

```javascript
try {
    const result = await system.processComplete(docxPath, data, output);
    if (!result.success) {
        console.log('Errores encontrados:', result.generated.validation.errores);
    }
} catch (error) {
    logger.error(`Error en procesamiento: ${error.message}`);
}
```

### 2. Validación de Datos

```javascript
import { ValidationUtils } from './src/lib/index.js';

const validation = ValidationUtils.validateDocumentData(documentData);
if (!validation.valid) {
    console.error('Datos inválidos:', validation.errors);
    return;
}
```

### 3. Optimización de Rendimiento

```javascript
// Usar procesamiento en lote para múltiples documentos
const results = await system.processBatch(configs);

// Medir tiempos de ejecución
const { result, duration } = await LogUtils.measureTime(
    () => system.processComplete(...),
    'Proceso Completo'
);
```

### 4. Manejo de Recursos

```javascript
// Limpiar recursos al finalizar
await system.cleanup(true); // true = eliminar archivos temporales
```

## 🔄 Migración desde Versión Anterior

Para migrar desde la versión anterior a las librerías unificadas:

### Cambios en Imports

**Antes:**
```javascript
import PumaExactReplicatorGenerator from './src/generators/PumaExactReplicator.js';
import { analyzeHeaderDimensions } from './src/analyzers/analyzeHeaderDimensions.js';
```

**Después:**
```javascript
import { PumaDocxSystem, DocxAnalyzer, DocxGenerator } from './src/lib/index.js';
// O usar el generador unificado
import PumaUnifiedGenerator from './src/generators/PumaUnifiedGenerator.js';
```

### Cambios en Uso

**Antes:**
```javascript
const generator = new PumaExactReplicatorGenerator();
await generator.loadExtractedImages();
const doc = await generator.generateDocument();
```

**Después:**
```javascript
const generator = new PumaUnifiedGenerator();
const result = await generator.generatePumaDocument(documentData, 'output.docx');
```

## 📝 Changelog

### v1.0.0 - Librerías Unificadas

- ✅ Creación del sistema unificado `PumaDocxSystem`
- ✅ Librerías modulares para análisis, generación y validación
- ✅ Funciones de conveniencia para uso rápido
- ✅ Utilidades compartidas para manejo de archivos, imágenes y formatos
- ✅ Sistema de logging consistente
- ✅ Validación robusta de datos y documentos
- ✅ Procesamiento en lote
- ✅ Comparación con documentos de referencia
- ✅ Generador PUMA actualizado usando librerías unificadas
- ✅ Documentación completa y ejemplos de uso

## 🤝 Contribución

Para contribuir al desarrollo de las librerías:

1. Mantener consistencia en las APIs
2. Documentar nuevas funciones
3. Agregar pruebas para nuevas características
4. Seguir las convenciones de naming establecidas
5. Actualizar la documentación

## 📞 Soporte

Para problemas o preguntas sobre las librerías unificadas:

1. Revisar esta documentación
2. Ejecutar las pruebas para verificar el funcionamiento
3. Revisar los logs generados para información de debugging
4. Consultar los ejemplos de uso incluidos
