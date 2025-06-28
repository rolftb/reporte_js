# 📁 Estructura Organizada del Proyecto

El repositorio ha sido reorganizado por temas para facilitar la navegación y el mantenimiento del código.

## 🗂️ Estructura de Carpetas

```
src/
├── analyzers/          # 📊 Análisis de documentos DOCX
├── extractors/         # 🖼️ Extracción de imágenes  
├── generators/         # 📝 Generación de documentos
├── tests/              # 🧪 Pruebas y validaciones
├── validators/         # ✅ Validadores de estructura
├── demos/              # 🎬 Demostraciones del sistema
├── controllers/        # 🎮 Controladores de API
├── routes/             # 🛣️ Rutas de la aplicación
├── services/           # ⚙️ Servicios del sistema
├── utils/              # 🔧 Utilidades generales
└── index.js            # 🚀 Punto de entrada principal
```

## 🎯 Flujo de Trabajo por Tema

### 📊 1. Analizar un Documento
```bash
# Análisis general
node src/analyzers/scanDocx.js "documento.docx"

# Análisis específico PUMA  
node src/analyzers/deepAnalyzePuma.js

# Análisis de headers
node src/analyzers/analyzeHeaders.js
```

### 🖼️ 2. Extraer Imágenes
```bash
# Extracción principal (recomendado)
node src/extractors/documentImageExtractor.cjs "documento.docx"

# Script simplificado
node src/extractors/extractImages.js "documento.docx"
```

### 📝 3. Generar Documentos
```bash
# Generador con estructura real (recomendado)
node src/tests/testRealStructure.js

# Generador tradicional
node src/tests/testPumaWithImages.js

# Crear documentos de ejemplo para pruebas
node src/generators/createSample.js
```

### 🎬 4. Demos y Ejemplos
```bash
# Generar reporte completo de ejemplo
node src/demos/generarReporteEjemplo.js

# Demo del sistema completo
node src/demos/demoCompleteSystem.js

# Mostrar estado del sistema
node src/demos/showImageSystem.cjs
```

### 🧪 5. Ejecutar Pruebas
```bash
# Pruebas básicas de creación DOCX
node src/tests/test-docx.js

# Pruebas de escáner
node src/tests/test-scan.js

# Tests unitarios formales
npm test
```

## 📖 Documentación por Tema

Cada directorio incluye su propio `README.md` con:
- Descripción de archivos
- Instrucciones de uso
- Ejemplos de código
- Referencias cruzadas

### 📚 Enlaces Rápidos
- [📊 Analizadores](./analyzers/README.md) - Escaneo y análisis de documentos
- [🖼️ Extractores](./extractors/README.md) - Extracción de imágenes sin duplicados
- [📝 Generadores](./generators/README.md) - Creación de documentos DOCX
- [🧪 Tests](./tests/README.md) - Pruebas y validaciones
- [✅ Validadores](./validators/README.md) - Verificación de calidad
- [🎬 Demos](./demos/README.md) - Demostraciones del sistema

## 🚀 Comandos Principales

### Flujo Completo (Nuevo Usuario)
```bash
# 1. Ver estado actual
node src/demos/showImageSystem.cjs

# 2. Extraer imágenes del PUMA
node src/extractors/documentImageExtractor.cjs "../reporte_py/template-word/PUMA MES 6 2025.docx"

# 3. Generar documento con estructura real
node src/tests/testRealStructure.js

# 4. Verificar carga de imágenes
node src/tests/testImageLoad.js
```

### Desarrollo y Personalización
```bash
# Analizar nuevo documento
node src/analyzers/scanDocx.js "mi_documento.docx"

# Extraer imágenes
node src/extractors/documentImageExtractor.cjs "mi_documento.docx" "./mis_imagenes"

# Crear tests personalizados en src/tests/
# Crear generadores personalizados en src/generators/
```

## 🎨 Beneficios de la Organización

### 🔍 Navegación Clara
- **Por función**: Fácil encontrar herramientas específicas
- **Por tema**: Archivos relacionados agrupados
- **Documentación**: README en cada directorio

### 🛠️ Mantenimiento Simplificado  
- **Separación de responsabilidades**: Cada carpeta tiene un propósito específico
- **Escalabilidad**: Fácil agregar nuevos scripts por tema
- **Reutilización**: Componentes organizados para importación

### 👥 Colaboración Mejorada
- **Onboarding**: Nuevos usuarios pueden seguir el flujo por pasos
- **Especialización**: Desarrolladores pueden enfocarse en temas específicos  
- **Documentación**: Cada tema bien documentado y ejemplificado

## 📋 Migración de Scripts Existentes

Los scripts se movieron a sus nuevas ubicaciones:

### Analizadores (analyzers/)
- `analyzeHeaders.js` ← `src/analyzeHeaders.js`
- `scanDocx.js` ← `src/scanDocx.js`
- `deepAnalyzePuma.js` ← `src/deepAnalyzePuma.js`

### Extractores (extractors/)
- `documentImageExtractor.cjs` ← `src/documentImageExtractor.cjs`
- `extractImages.js` ← `src/extractImages.js`

### Tests (tests/)
- `testRealStructure.js` ← `src/testRealStructure.js`
- `testPumaWithImages.js` ← `src/testPumaWithImages.js`
- `testImageLoad.js` ← `src/testImageLoad.js`

### Demos (demos/)
- `showImageSystem.cjs` ← `src/showImageSystem.cjs`
- `demoCompleteSystem.js` ← `src/demoCompleteSystem.js`

### Validadores (validators/)
- `validatePumaStructure.js` ← `src/validatePumaStructure.js`

## 🔄 Imports y Referencias

Los imports se actualizan automáticamente según la nueva estructura:

```javascript
// ANTES
import { PumaDocumentGenerator } from './generators/PumaDocumentGenerator.js';

// DESPUÉS (desde tests/)
import { PumaDocumentGenerator } from '../generators/PumaDocumentGenerator.js';

// DESPUÉS (desde demos/)
import { PumaDocumentGenerator } from '../generators/PumaDocumentGenerator.js';
```

La organización mantiene compatibilidad total mientras mejora la experiencia de desarrollo.
