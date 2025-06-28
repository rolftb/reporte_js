# 📊 Analizadores de Documentos DOCX

Este directorio contiene herramientas para analizar y escanear documentos DOCX, extrayendo información sobre estructura, imágenes, headers y contenido.

## 📋 Archivos

### Análisis de Headers
- **`analyzeHeaders.js`** - Analiza la estructura de headers en documentos DOCX
- **`analyzeHeaderStructure.js`** - Análisis detallado de la estructura del header
- **`analyzeHeaderStructure_cjs.cjs`** - Versión CommonJS del analizador de headers
- **`analyzeHeaderStructure_cjs.js`** - Versión alternativa del analizador

### Análisis de Páginas
- **`analyzePageStructure.js`** - Analiza la estructura de páginas y distribución de contenido

### Análisis Profundos
- **`deepAnalyzePuma.js`** - Análisis profundo específico del documento PUMA
- **`scanDocx.js`** - Scanner general para documentos DOCX
- **`scanPuma.js`** - Scanner específico para documentos PUMA

## 🚀 Uso

### Análisis General de Documento
```bash
node src/analyzers/scanDocx.js "ruta/al/documento.docx"
```

### Análisis Específico de PUMA
```bash
node src/analyzers/deepAnalyzePuma.js
```

### Análisis de Header
```bash
node src/analyzers/analyzeHeaders.js
```

## 📤 Salida

Los analizadores generan:
- Archivos JSON con resultados detallados en `./output/`
- Logs informativos en consola
- Análisis de estructura, imágenes y relaciones

## 🔗 Relacionado

- **Extractores**: `/src/extractors/` - Para extraer imágenes
- **Generadores**: `/src/generators/` - Para crear documentos basados en análisis
- **Validadores**: `/src/validators/` - Para validar estructura generada
