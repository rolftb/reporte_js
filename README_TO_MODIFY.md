# 🔧 Guía de Modificación del Sistema PUMA

## 📋 Objetivo
Esta guía explica cómo modificar el sistema existente para crear un generador de documentos JS que reciba parámetros del DOCX `PUMA MES 6 2025.docx` por medio de un JSON, permitiendo la edición del formato de forma fácil e intuitiva.

## 🎯 Resultado Esperado
Crear un sistema donde:
```javascript
// Uso deseado
const generator = new PumaParametricGenerator();
const document = await generator.generateFromJSON(parametersJSON);
```

---

## 📖 PASO 1: Archivos a Leer y Analizar

### 🔍 **Archivos OBLIGATORIOS de Análisis** (src/)

#### 1. **Analizadores para Extraer Estructura**
```bash
📊 src/analyzers/deepAnalyzePuma.js
   ↳ 🎯 QUÉ LEER: Estructura XML interna del documento
   ↳ 💡 PARA QUÉ: Identificar elementos parametrizables
   ↳ 🔧 MODIFICAR: Extraer elementos como variables JSON

📊 src/analyzers/analyzeImageFormatting.cjs  
   ↳ 🎯 QUÉ LEER: Posicionamiento y formato de imágenes
   ↳ 💡 PARA QUÉ: Crear parámetros de coordenadas dinámicas
   ↳ 🔧 MODIFICAR: Convertir coordenadas fijas en variables

📊 src/analyzers/analyzePageStructure.js
   ↳ 🎯 QUÉ LEER: Estructura de páginas y secciones
   ↳ 💡 PARA QUÉ: Parametrizar márgenes, tamaños, orientación
   ↳ 🔧 MODIFICAR: Extraer dimensiones como parámetros JSON
```

#### 2. **Extractor para Imágenes Dinámicas**
```bash
🖼️ src/extractors/documentImageExtractor.cjs
   ↳ 🎯 QUÉ LEER: Sistema de extracción y referenciado de imágenes  
   ↳ 💡 PARA QUÉ: Permitir imágenes variables por JSON
   ↳ 🔧 MODIFICAR: Crear mapeo dinámico imagen → placeholder
```

#### 3. **Generador Base a Modificar**
```bash
📝 src/generators/PumaExactReplicator.js
   ↳ 🎯 QUÉ LEER: Lógica exacta de replicación del formato
   ↳ 💡 PARA QUÉ: Base para el generador parametrizado
   ↳ 🔧 MODIFICAR: Convertir valores hardcoded en parámetros JSON
```

---

## 🛠️ PASO 2: Análisis Específico por Archivo

### 📊 **deepAnalyzePuma.js** - Extraer Elementos Parametrizables

#### 🔍 **Qué Buscar:**
```javascript
// Elementos fijos que deben ser variables:
- Textos específicos: "PUMA ENERGY CHILE S.A."
- Fechas: "21 de mayo al 20 de junio"  
- Direcciones: "Av. Pdte. Kennedy 5454"
- Títulos de secciones
- Nombres de participantes
- Descripciones de actividades
```

#### 🔧 **Cómo Modificar:**
```javascript
// EN EL ARCHIVO ORIGINAL:
const companyName = "PUMA ENERGY CHILE S.A.";

// MODIFICAR A:
const companyName = params.company?.name || "EMPRESA DEFAULT";
```

#### 📋 **Nuevo Archivo a Crear:**
```bash
📊 src/analyzers/extractParametrizableElements.js
   ↳ Analizar deepAnalyzePuma.js y extraer todos los elementos variables
   ↳ Generar esquema JSON con todos los parámetros identificados
```

### 🖼️ **analyzeImageFormatting.cjs** - Coordenadas Dinámicas

#### 🔍 **Qué Buscar:**
```javascript
// Coordenadas fijas que deben ser variables:
- Posiciones X,Y de imágenes
- Tamaños width, height  
- Configuraciones de wrapping
- Relaciones imagen-texto
```

#### 🔧 **Cómo Modificar:**
```javascript
// EN EL ARCHIVO ORIGINAL:
const imagePosition = { x: 1234567, y: 987654 }; // EMU units

// MODIFICAR A:
const imagePosition = {
  x: params.images?.logo?.position?.x || 1234567,
  y: params.images?.logo?.position?.y || 987654
};
```

### 📝 **PumaExactReplicator.js** - Generador Parametrizado

#### 🔍 **Qué Buscar:**
```javascript
// Valores hardcoded a parametrizar:
- Datos de la empresa
- Fechas del programa  
- Participantes por sesión
- Rutas de imágenes
- Textos de contenido
- Configuraciones de formato
```

#### 🔧 **Cómo Modificar:**
```javascript
// EN EL ARCHIVO ORIGINAL:
new TextRun({
  text: "PUMA ENERGY CHILE S.A.",
  bold: true,
  size: 24
})

// MODIFICAR A:
new TextRun({
  text: params.company?.name || "EMPRESA DEFAULT",
  bold: params.company?.titleStyle?.bold || true,
  size: params.company?.titleStyle?.size || 24
})
```

---

## 📄 PASO 3: Estructura del JSON de Parámetros

### 🗂️ **Esquema JSON Propuesto:**

```json
{
  "company": {
    "name": "PUMA ENERGY CHILE S.A.",
    "address": "Av. Pdte. Kennedy 5454",
    "titleStyle": {
      "bold": true,
      "size": 24,
      "color": "#000000"
    }
  },
  "program": {
    "title": "Programa de Calidad de Vida",
    "period": {
      "start": "21 de mayo",
      "end": "20 de junio",
      "year": "2025"
    },
    "location": "Av. Pdte. Kennedy 5454"
  },
  "sessions": [
    {
      "date": "2025-05-21",
      "title": "Sesión 1: Introducción",
      "participants": ["Juan Pérez", "María García"],
      "description": "Descripción de la actividad...",
      "images": ["session1_img1.jpg", "session1_img2.jpg"]
    }
  ],
  "images": {
    "logo": {
      "path": "./images/logo_empresa.png",
      "position": { "x": 1234567, "y": 987654 },
      "size": { "width": 200, "height": 100 },
      "wrapping": "NONE"
    },
    "header_background": {
      "path": "./images/header_bg.jpg",
      "position": { "x": 0, "y": 0 },
      "size": { "width": 800, "height": 150 }
    }
  },
  "formatting": {
    "pageSize": "A4",
    "margins": {
      "top": 720,
      "bottom": 720,
      "left": 720,
      "right": 720
    },
    "fonts": {
      "primary": "Calibri",
      "secondary": "Arial"
    }
  }
}
```

---

## 🔧 PASO 4: Archivos Nuevos a Crear

### 📋 **1. Extractor de Parámetros**
```bash
📊 src/analyzers/parameterExtractor.js
```

#### 🎯 **Función:**
```javascript
/**
 * Analiza el documento PUMA original y extrae todos los elementos
 * que pueden ser parametrizados en un esquema JSON
 */
class ParameterExtractor {
  async extractFromPumaDocument(docxPath) {
    // Analizar documento original
    // Identificar elementos variables
    // Generar esquema JSON
    // Retornar parámetros extraídos
  }
}
```

### 📝 **2. Generador Parametrizado**
```bash
📝 src/generators/PumaParametricGenerator.js
```

#### 🎯 **Función:**
```javascript
/**
 * Genera documentos DOCX usando parámetros JSON
 * Mantiene el formato exacto de PUMA pero con contenido variable
 */
class PumaParametricGenerator {
  constructor(parametersJSON) {
    this.params = parametersJSON;
  }

  async generateDocument() {
    // Usar parámetros JSON para crear documento
    // Mantener formato exacto del original
    // Permitir personalización total del contenido
  }
}
```

### ✅ **3. Validador de JSON**
```bash
✅ src/validators/validateParametersJSON.js
```

#### 🎯 **Función:**
```javascript
/**
 * Valida que el JSON de parámetros tenga la estructura correcta
 * y todos los campos obligatorios
 */
class JSONValidator {
  validatePumaParameters(parametersJSON) {
    // Validar estructura del JSON
    // Verificar campos obligatorios
    // Validar tipos de datos
    // Retornar errores si los hay
  }
}
```

### 🧪 **4. Test del Sistema Parametrizado**
```bash
🧪 src/tests/testParametricGenerator.js
```

#### 🎯 **Función:**
```javascript
/**
 * Prueba el generador parametrizado con diferentes JSONs
 * Verifica que mantiene el formato PUMA original
 */
async function testParametricGeneration() {
  // Cargar JSON de prueba
  // Generar documento con parámetros
  // Validar que mantiene formato original
  // Verificar personalización correcta
}
```

---

## 🚀 PASO 5: Plan de Implementación

### 📅 **Orden de Desarrollo:**

#### **Fase 1: Análisis (📊 1-2 días)**
```bash
1. node src/analyzers/deepAnalyzePuma.js
   ↳ Identificar todos los elementos hardcoded

2. Crear src/analyzers/parameterExtractor.js
   ↳ Extraer automáticamente parámetros del DOCX original

3. Generar esquema JSON inicial
   ↳ Estructura base para parámetros
```

#### **Fase 2: Generador Base (📝 2-3 días)**  
```bash
1. Copiar src/generators/PumaExactReplicator.js
   ↳ Como base para PumaParametricGenerator.js

2. Identificar y parametrizar elementos fijos
   ↳ Reemplazar hardcoded values con JSON params

3. Mantener lógica de formato exacto
   ↳ Solo cambiar contenido, no estructura
```

#### **Fase 3: Validación (✅ 1 día)**
```bash
1. Crear src/validators/validateParametersJSON.js
   ↳ Validar estructura y tipos del JSON

2. Implementar validaciones específicas para PUMA
   ↳ Fechas, imágenes, textos requeridos
```

#### **Fase 4: Testing (🧪 1-2 días)**
```bash
1. Crear tests exhaustivos
   ↳ Verificar diferentes combinaciones de parámetros

2. Validar que mantiene formato original
   ↳ Comparar con documento PUMA base
```

---

## 📋 PASO 6: Comandos de Ejecución del Nuevo Sistema

### 🔍 **Extracción de Parámetros:**
```bash
# Extraer parámetros del documento original
node src/analyzers/parameterExtractor.js "uploads/PUMA MES 6 2025.docx"
# Genera: ./output/puma_parameters_schema.json
```

### 📝 **Generación con Parámetros:**
```bash
# Generar documento usando JSON personalizado
node src/generators/PumaParametricGenerator.js ./config/mi_empresa.json
# Genera: ./output/reporte_mi_empresa.docx
```

### ✅ **Validación:**
```bash
# Validar JSON antes de generar
node src/validators/validateParametersJSON.js ./config/mi_empresa.json
```

### 🧪 **Testing:**
```bash
# Probar sistema completo
node src/tests/testParametricGenerator.js
```

---

## 🎯 PASO 7: Ejemplo de Uso Final

### 📄 **1. Crear JSON personalizado:**
```json
// ./config/mi_empresa.json
{
  "company": {
    "name": "MI EMPRESA S.A.",
    "address": "Mi Dirección 123"
  },
  "program": {
    "title": "Mi Programa Personalizado",
    "period": {
      "start": "1 de julio",
      "end": "31 de julio", 
      "year": "2025"
    }
  },
  "sessions": [
    {
      "date": "2025-07-01",
      "title": "Mi Primera Sesión",
      "participants": ["Participante 1", "Participante 2"]
    }
  ]
}
```

### 🚀 **2. Generar documento:**
```bash
node src/generators/PumaParametricGenerator.js ./config/mi_empresa.json
```

### ✅ **3. Resultado:**
Un documento DOCX idéntico en formato al `PUMA MES 6 2025.docx` original, pero con el contenido personalizado del JSON.

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 🚨 **Dependencias Críticas:**
- **DEBE ejecutarse primero:** `documentImageExtractor.cjs` para imágenes base
- **Mantener estructura exacta:** No cambiar el layout del documento original
- **Validar parámetros:** Siempre validar JSON antes de generar

### 🔧 **Archivos a NO Modificar:**
- `src/analyzers/deepAnalyzePuma.js` (mantener como referencia)
- `src/generators/PumaExactReplicator.js` (mantener como base)
- Sistema de extracción de imágenes (solo extender)

### 📋 **Beneficios del Sistema Parametrizado:**
- ✅ **Reutilización:** Un solo generador para múltiples empresas
- ✅ **Mantenimiento:** Cambios centralizados en un JSON
- ✅ **Escalabilidad:** Fácil agregar nuevos parámetros
- ✅ **Validación:** Control de errores antes de generar
- ✅ **Formato:** Mantiene exactamente el diseño PUMA original

---

## 🔗 Enlaces a Archivos Relacionados

- 📊 [Analizadores Existentes](./src/analyzers/README.md)
- 📝 [Generadores Actuales](./src/generators/README.md)  
- ✅ [Sistema de Validación](./src/validators/README.md)
- 🧪 [Tests del Sistema](./src/tests/README.md)
- 📋 [Documentación Principal](./README.md)
