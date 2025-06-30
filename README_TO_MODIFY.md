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

### 🖼️ **analyzeImageFormatting.cjs** - Coordenadas Dinámicas e Imágenes Avanzadas

#### 🔍 **Qué Buscar:**
```javascript
// Coordenadas fijas que deben ser variables:
- Posiciones X,Y de imágenes (en unidades EMU)
- Tamaños width, height con recortes específicos
- Configuraciones de wrapping (NONE, SQUARE, TIGHT, etc.)
- Relaciones imagen-texto (behind, in front, through)
- Coordenadas de anclaje (página, párrafo, header)
- Parámetros de recorte (crop top, bottom, left, right)
- Configuraciones de flotado y superposición
```

#### 🔧 **Cómo Modificar - Imágenes con Recortes:**
```javascript
// EN EL ARCHIVO ORIGINAL:
const imageRun = new ImageRun({
  data: imageBuffer,
  transformation: {
    width: 200,
    height: 150
  }
});

// MODIFICAR A - Imagen con Recorte Parametrizado:
const imageRun = new ImageRun({
  data: imageBuffer,
  transformation: {
    width: params.images?.logo?.size?.width || 200,
    height: params.images?.logo?.size?.height || 150,
    // RECORTES PARAMETRIZADOS
    crop: {
      left: params.images?.logo?.crop?.left || 0,    // % del borde izquierdo a recortar
      top: params.images?.logo?.crop?.top || 0,      // % del borde superior a recortar  
      right: params.images?.logo?.crop?.right || 0,  // % del borde derecho a recortar
      bottom: params.images?.logo?.crop?.bottom || 0 // % del borde inferior a recortar
    }
  },
  // POSICIONAMIENTO FLOTANTE DETRÁS DEL TEXTO
  floating: {
    horizontalPosition: {
      relative: HorizontalPositionRelativeFrom.PAGE,
      align: params.images?.logo?.position?.horizontal?.align || HorizontalPositionAlign.LEFT,
      offset: params.images?.logo?.position?.x || 1234567 // EMU units
    },
    verticalPosition: {
      relative: VerticalPositionRelativeFrom.PAGE,
      align: params.images?.logo?.position?.vertical?.align || VerticalPositionAlign.TOP,
      offset: params.images?.logo?.position?.y || 987654 // EMU units
    },
    wrap: {
      type: TextWrappingType.NONE,     // DETRÁS DEL TEXTO
      side: TextWrappingSide.BOTH_SIDES
    },
    margins: {
      top: params.images?.logo?.margins?.top || 0,
      bottom: params.images?.logo?.margins?.bottom || 0,
      left: params.images?.logo?.margins?.left || 0,
      right: params.images?.logo?.margins?.right || 0
    },
    allowOverlap: true,    // Permite superposición con otros elementos
    layoutInCell: true     // Mantiene imagen dentro del contenedor (header/cell)
  }
});
```

#### 📐 **Posicionamiento de Tablas en Coordenadas Específicas:**
```javascript
// TABLA CON POSICIÓN FLOTANTE PARAMETRIZADA:
const table = new Table({
  rows: [
    // ... filas de la tabla
  ],
  // POSICIONAMIENTO FLOTANTE DE LA TABLA
  tableFloatProperties: {
    horizontalAnchor: params.tables?.mainTable?.anchor?.horizontal || TableAnchorType.PAGE,
    verticalAnchor: params.tables?.mainTable?.anchor?.vertical || TableAnchorType.PAGE,
    absoluteHorizontalDistance: params.tables?.mainTable?.position?.x || 2000000, // EMU
    absoluteVerticalDistance: params.tables?.mainTable?.position?.y || 1500000,   // EMU
    allowOverlap: params.tables?.mainTable?.allowOverlap || true,
    overlap: params.tables?.mainTable?.overlap || OverlapType.NEVER
  },
  width: {
    size: params.tables?.mainTable?.width || 5000,
    type: WidthType.DXA
  },
  borders: {
    // Bordes parametrizados...
  }
});
```

#### 📝 **Cuadro de Texto en Header con Coordenadas Específicas:**
```javascript
// TEXTBOX EN HEADER CON POSICIÓN ABSOLUTA:
const headerTextBox = new Paragraph({
  children: [
    new TextRun({
      children: [
        new Drawing({
          // CUADRO DE TEXTO FLOTANTE
          inline: false,  // Flotante, no inline
          floating: {
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.PAGE,
              offset: params.header?.textBox?.position?.x || 5000000 // EMU desde borde izquierdo
            },
            verticalPosition: {
              relative: VerticalPositionRelativeFrom.PAGE,  
              offset: params.header?.textBox?.position?.y || 500000  // EMU desde borde superior
            },
            wrap: {
              type: TextWrappingType.TOP_AND_BOTTOM,  // Texto arriba y abajo
              side: TextWrappingSide.BOTH_SIDES
            },
            allowOverlap: false,
            layoutInCell: true  // Importante para headers
          },
          // CONTENIDO DEL TEXTBOX
          textBox: {
            width: params.header?.textBox?.size?.width || 3000000,   // EMU
            height: params.header?.textBox?.size?.height || 1000000, // EMU
            textBoxContent: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: params.header?.textBox?.content || "Texto del cuadro",
                    bold: params.header?.textBox?.style?.bold || false,
                    size: params.header?.textBox?.style?.size || 20,
                    color: params.header?.textBox?.style?.color || "#000000"
                  })
                ],
                alignment: params.header?.textBox?.alignment || AlignmentType.CENTER
              })
            ],
            // ESTILO DEL CUADRO
            textBoxStyle: {
              fill: params.header?.textBox?.background?.color || "#FFFFFF",
              stroke: {
                color: params.header?.textBox?.border?.color || "#000000",
                width: params.header?.textBox?.border?.width || 1
              }
            }
          }
        })
      ]
    })
  ]
});
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

### 🗂️ **Esquema JSON Propuesto - EXPANDIDO:**

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
      "position": { 
        "x": 1234567, 
        "y": 987654,
        "horizontal": {
          "align": "LEFT",
          "relative": "PAGE"
        },
        "vertical": {
          "align": "TOP", 
          "relative": "PAGE"
        }
      },
      "size": { 
        "width": 200, 
        "height": 100 
      },
      "crop": {
        "left": 0,    // % a recortar del borde izquierdo (0-100)
        "top": 10,    // % a recortar del borde superior
        "right": 0,   // % a recortar del borde derecho  
        "bottom": 5   // % a recortar del borde inferior
      },
      "wrapping": "NONE",
      "margins": {
        "top": 0,
        "bottom": 0, 
        "left": 0,
        "right": 0
      },
      "allowOverlap": true,
      "layoutInCell": true
    },
    "header_background": {
      "path": "./images/header_bg.jpg",
      "position": { "x": 0, "y": 0 },
      "size": { "width": 800, "height": 150 },
      "crop": { "left": 0, "top": 0, "right": 0, "bottom": 0 },
      "wrapping": "NONE"
    },
    "session_photo": {
      "path": "./images/actividad1.jpg",
      "position": { 
        "x": 3000000,  // EMU units - posición flotante específica
        "y": 2000000 
      },
      "size": { "width": 300, "height": 200 },
      "crop": { 
        "left": 15,   // Recortar 15% del lado izquierdo
        "top": 10,    // Recortar 10% de arriba
        "right": 15,  // Recortar 15% del lado derecho
        "bottom": 0   // No recortar abajo
      },
      "wrapping": "SQUARE",  // Texto alrededor de la imagen
      "allowOverlap": false
    }
  },
  "tables": {
    "mainTable": {
      "position": {
        "x": 2000000,  // EMU - posición horizontal absoluta
        "y": 1500000   // EMU - posición vertical absoluta  
      },
      "anchor": {
        "horizontal": "PAGE",  // Anclado a la página
        "vertical": "PAGE"
      },
      "width": 5000,           // DXA units
      "allowOverlap": true,
      "overlap": "NEVER",
      "borders": {
        "top": { "style": "SINGLE", "size": 4, "color": "#000000" },
        "bottom": { "style": "SINGLE", "size": 4, "color": "#000000" },
        "left": { "style": "SINGLE", "size": 4, "color": "#000000" },
        "right": { "style": "SINGLE", "size": 4, "color": "#000000" }
      }
    },
    "participantsTable": {
      "position": { "x": 1000000, "y": 3000000 },
      "width": 4000,
      "allowOverlap": false
    }
  },
  "header": {
    "textBox": {
      "position": {
        "x": 5000000,  // EMU - desde borde izquierdo de la página
        "y": 500000    // EMU - desde borde superior de la página
      },
      "size": {
        "width": 3000000,   // EMU - ancho del cuadro
        "height": 1000000   // EMU - alto del cuadro
      },
      "content": "INFORME MENSUAL",
      "style": {
        "bold": true,
        "size": 24,
        "color": "#FFFFFF"
      },
      "alignment": "CENTER",
      "background": {
        "color": "#0066CC"  // Fondo azul
      },
      "border": {
        "color": "#003366",
        "width": 2
      },
      "wrapping": "TOP_AND_BOTTOM"  // Texto arriba y abajo del cuadro
    },
    "companyInfo": {
      "position": { "x": 8500000, "y": 300000 },
      "size": { "width": 2500000, "height": 800000 },
      "content": "{{company.name}}\n{{company.address}}",
      "style": { "bold": false, "size": 18, "color": "#333333" },
      "alignment": "RIGHT"
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
    },
    "coordinates": {
      "units": "EMU",
      "conversionFactor": 12700,  // 1 punto = 12700 EMU
      "pageWidth": 11906000,      // EMU para A4
      "pageHeight": 16838000      // EMU para A4
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

---

## 📐 GUÍA DE COORDENADAS Y POSICIONAMIENTO

### 📏 **Unidades de Medida en DOCX:**
#### 🔢 **EMU (English Metric Units):**
```javascript
// CONVERSIONES IMPORTANTES:
1 punto = 12,700 EMU
1 pulgada = 914,400 EMU  
1 cm = 360,000 EMU
1 mm = 36,000 EMU

// EJEMPLOS DE CONVERSIÓN:
const pointsToEMU = (points) => points * 12700;
const cmToEMU = (cm) => cm * 360000;
const mmToEMU = (mm) => mm * 36000;

// Posicionar imagen a 2cm del borde izquierdo, 1.5cm del superior:
const position = {
  x: cmToEMU(2),    // = 720,000 EMU
  y: cmToEMU(1.5)   // = 540,000 EMU
};
```
#### 📄 **Dimensiones de Página A4 en EMU:**
```javascript
const A4_DIMENSIONS = {
  width: 11906000,   // EMU (21 cm)
  height: 16838000,  // EMU (29.7 cm)
  margins: {
    top: 720000,     // EMU (2 cm por defecto)
    bottom: 720000,  // EMU (2 cm por defecto)
    left: 720000,    // EMU (2 cm por defecto)
    right: 720000    // EMU (2 cm por defecto)
  }
};

// ÁREA ÚTIL DE CONTENIDO:
const contentArea = {
  width: A4_DIMENSIONS.width - A4_DIMENSIONS.margins.left - A4_DIMENSIONS.margins.right,
  height: A4_DIMENSIONS.height - A4_DIMENSIONS.margins.top - A4_DIMENSIONS.margins.bottom,
  startX: A4_DIMENSIONS.margins.left,
  startY: A4_DIMENSIONS.margins.top
};
```

### 🎯 **Ejemplos Prácticos de Posicionamiento:**
#### 🖼️ **Imagen Logo en Esquina Superior Derecha:**
```javascript
const logoPosition = {
  x: A4_DIMENSIONS.width - cmToEMU(3),  // 3cm desde borde derecho
  y: cmToEMU(1),                        // 1cm desde borde superior
  horizontal: {
    align: "LEFT",                      // Alineación desde punto X
    relative: "PAGE"                    // Relativo a la página
  },
  vertical: {
    align: "TOP",                       // Alineación desde punto Y  
    relative: "PAGE"                    // Relativo a la página
  }
};
```
#### 📊 **Tabla Centrada en la Página:**
```javascript
const centeredTablePosition = {
  x: (A4_DIMENSIONS.width - cmToEMU(15)) / 2,  // Centrar tabla de 15cm
  y: cmToEMU(5),                               // 5cm desde arriba
  anchor: {
    horizontal: "PAGE",
    vertical: "PAGE"
  }
};
```
#### 📝 **Cuadro de Texto en Header:**
```javascript
const headerTextBoxPosition = {
  x: cmToEMU(1),      // 1cm desde borde izquierdo
  y: mmToEMU(5),      // 5mm desde borde superior del header
  size: {
    width: cmToEMU(8),   // 8cm de ancho
    height: mmToEMU(15)  // 15mm de alto
  }
};
```

### ✂️ **Guía de Recortes de Imágenes:**
#### 🔢 **Porcentajes de Recorte:**
```javascript
// RECORTE EN PORCENTAJES (0-100):
const imageCrop = {
  left: 10,    // Recortar 10% del lado izquierdo
  top: 15,     // Recortar 15% de la parte superior  
  right: 5,    // Recortar 5% del lado derecho
  bottom: 0    // No recortar la parte inferior
};

// EJEMPLO: Imagen de 400x300 con recorte:
// - Ancho final: 400 - (10% + 5%) = 340px
// - Alto final: 300 - (15% + 0%) = 255px
```
#### 🖼️ **Recorte para Circular/Ovalado:**
```javascript
// SIMULAR IMAGEN CIRCULAR (recorte proporcional):
const circularCrop = {
  left: 25,    // 25% cada lado para mantener proporción
  top: 25,     // 25% arriba y abajo
  right: 25,   // Resultado: imagen cuadrada central
  bottom: 25
};
```

### 🔄 **Tipos de Wrapping (Ajuste de Texto):**
```javascript
const wrappingTypes = {
  NONE: "Imagen detrás del texto (no afecta flujo)",
  SQUARE: "Texto alrededor del rectángulo de la imagen", 
  TIGHT: "Texto ajustado al contorno de la imagen",
  THROUGH: "Texto a través de áreas transparentes",
  TOP_AND_BOTTOM: "Texto solo arriba y abajo de la imagen",
  IN_FRONT_OF_TEXT: "Imagen delante del texto",
  BEHIND_TEXT: "Imagen detrás del texto"
};

// PARA PUMA (imágenes flotantes sin desplazar contenido):
const pumaImageWrapping = {
  type: TextWrappingType.NONE,        // Detrás del texto
  side: TextWrappingSide.BOTH_SIDES,  // Ambos lados
  allowOverlap: true,                 // Permite superposición
  layoutInCell: true                  // Mantiene en contenedor
};
```

## 🎯 CASOS DE USO ESPECÍFICOS Y EJEMPLOS

### 🖼️ **CASO 1: Logo con Recorte Flotante**

#### 📋 **JSON de Configuración:**
```json
{
  "images": {
    "company_logo": {
      "path": "./images/logo_empresa_completo.png",
      "position": {
        "x": 10800000,  // ~9.5cm desde izquierda (esquina superior derecha)
        "y": 200000     // ~5mm desde arriba
      },
      "size": {
        "width": 180,   // Puntos
        "height": 60    // Puntos  
      },
      "crop": {
        "left": 20,     // Recortar logo complejo, dejar solo símbolo
        "top": 10,      // Quitar texto superior
        "right": 15,    // Quitar elementos laterales
        "bottom": 5     // Quitar texto inferior
      },
      "wrapping": "NONE",
      "allowOverlap": true,
      "layoutInCell": true
    }
  }
}
```

#### 🔧 **Código de Implementación:**
```javascript
// En PumaParametricGenerator.js:
const createFloatingLogo = (params) => {
  const logoConfig = params.images?.company_logo;
  if (!logoConfig) return null;

  return new ImageRun({
    data: fs.readFileSync(logoConfig.path),
    transformation: {
      width: logoConfig.size.width,
      height: logoConfig.size.height,
      crop: {
        left: logoConfig.crop.left,
        top: logoConfig.crop.top,
        right: logoConfig.crop.right,
        bottom: logoConfig.crop.bottom
      }
    },
    floating: {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.PAGE,
        offset: logoConfig.position.x
      },
      verticalPosition: {
        relative: VerticalPositionRelativeFrom.PAGE,
        offset: logoConfig.position.y
      },
      wrap: {
        type: TextWrappingType.NONE,
        side: TextWrappingSide.BOTH_SIDES
      },
      allowOverlap: logoConfig.allowOverlap,
      layoutInCell: logoConfig.layoutInCell
    }
  });
};
```

### 📊 **CASO 2: Tabla de Participantes Posicionada**

#### 📋 **JSON de Configuración:**
```json
{
  "tables": {
    "participants": {
      "position": {
        "x": 1440000,  // 2cm desde izquierda  
        "y": 2880000   // 8cm desde arriba
      },
      "width": 7200,   // ~12.7cm de ancho
      "data": [
        ["Nombre", "Cargo", "Área"],
        ["Juan Pérez", "Supervisor", "Producción"],
        ["María García", "Coordinadora", "RRHH"]
      ],
      "style": {
        "headerBackground": "#0066CC",
        "headerTextColor": "#FFFFFF",
        "borderColor": "#333333",
        "borderWidth": 1
      }
    }
  }
}
```

#### 🔧 **Código de Implementación:**
```javascript
const createPositionedTable = (params) => {
  const tableConfig = params.tables?.participants;
  if (!tableConfig) return null;

  const rows = tableConfig.data.map((rowData, index) => 
    new TableRow({
      children: rowData.map(cellText => 
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  bold: index === 0, // Header en bold
                  color: index === 0 ? tableConfig.style.headerTextColor : "#000000"
                })
              ]
            })
          ],
          shading: index === 0 ? {
            type: ShadingType.SOLID,
            color: tableConfig.style.headerBackground
          } : undefined
        })
      )
    })
  );

  return new Table({
    rows: rows,
    tableFloatProperties: {
      horizontalAnchor: TableAnchorType.PAGE,
      verticalAnchor: TableAnchorType.PAGE,
      absoluteHorizontalDistance: tableConfig.position.x,
      absoluteVerticalDistance: tableConfig.position.y,
      allowOverlap: true
    },
    width: {
      size: tableConfig.width,
      type: WidthType.DXA
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: tableConfig.style.borderWidth },
      bottom: { style: BorderStyle.SINGLE, size: tableConfig.style.borderWidth },
      left: { style: BorderStyle.SINGLE, size: tableConfig.style.borderWidth },
      right: { style: BorderStyle.SINGLE, size: tableConfig.style.borderWidth }
    }
  });
};
```

### 📝 **CASO 3: Cuadro de Texto en Header con Información Dinámica**

#### 📋 **JSON de Configuración:**
```json
{
  "header": {
    "infoBox": {
      "position": {
        "x": 7200000,   // ~6.3cm desde izquierda (lado derecho)
        "y": 360000     // ~1cm desde arriba
      },
      "size": {
        "width": 3600000,  // ~3.2cm ancho
        "height": 720000   // ~2cm alto
      },
      "content": "CONFIDENCIAL\nReporte Interno\n{{date}}",
      "style": {
        "fontSize": 16,
        "fontColor": "#FFFFFF",
        "bold": true,
        "alignment": "CENTER"
      },
      "background": {
        "color": "#CC0000",   // Rojo para confidencial
        "transparency": 80    // 80% opaco
      },
      "border": {
        "color": "#990000",
        "width": 2,
        "style": "SOLID"
      }
    }
  }
}
```

#### 🔧 **Código de Implementación:**
```javascript
const createHeaderTextBox = (params) => {
  const boxConfig = params.header?.infoBox;
  if (!boxConfig) return null;

  // Reemplazar variables dinámicas
  const content = boxConfig.content
    .replace('{{date}}', new Date().toLocaleDateString('es-ES'))
    .replace('{{company.name}}', params.company?.name || '');

  return new Drawing({
    inline: false,
    floating: {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.PAGE,
        offset: boxConfig.position.x
      },
      verticalPosition: {
        relative: VerticalPositionRelativeFrom.PAGE,
        offset: boxConfig.position.y
      },
      wrap: {
        type: TextWrappingType.TOP_AND_BOTTOM,
        side: TextWrappingSide.BOTH_SIDES
      },
      allowOverlap: false,
      layoutInCell: true
    },
    textBox: {
      width: boxConfig.size.width,
      height: boxConfig.size.height,
      textBoxContent: content.split('\n').map(line => 
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: boxConfig.style.bold,
              size: boxConfig.style.fontSize,
              color: boxConfig.style.fontColor
            })
          ],
          alignment: AlignmentType[boxConfig.style.alignment]
        })
      ),
      textBoxStyle: {
        fill: boxConfig.background.color,
        fillOpacity: boxConfig.background.transparency,
        stroke: {
          color: boxConfig.border.color,
          width: boxConfig.border.width
        }
      }
    }
  });
};
```

### 🎨 **CASO 4: Imagen de Fondo con Actividad Específica**

#### 📋 **JSON de Configuración:**
```json
{
  "sessions": [
    {
      "id": "session_1",
      "backgroundImage": {
        "path": "./images/fondo_actividad_yoga.jpg",
        "position": { "x": 0, "y": 4320000 },  // 12cm desde arriba
        "size": { "width": 600, "height": 400 },
        "crop": { "left": 0, "top": 20, "right": 0, "bottom": 30 },
        "opacity": 30,  // 30% visible para que no interfiera con texto
        "wrapping": "NONE"
      }
    }
  ]
}
```

#### 🔧 **Código de Implementación:**
```javascript
const createSessionBackground = (sessionConfig) => {
  const bgConfig = sessionConfig.backgroundImage;
  if (!bgConfig) return null;

  return new ImageRun({
    data: fs.readFileSync(bgConfig.path),
    transformation: {
      width: bgConfig.size.width,
      height: bgConfig.size.height,
      crop: bgConfig.crop,
      opacity: bgConfig.opacity  // Transparencia para fondo
    },
    floating: {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.PAGE,
        offset: bgConfig.position.x
      },
      verticalPosition: {
        relative: VerticalPositionRelativeFrom.PAGE,
        offset: bgConfig.position.y
      },
      wrap: {
        type: TextWrappingType.NONE,  // Detrás de todo el contenido
        side: TextWrappingSide.BOTH_SIDES
      },
      allowOverlap: true,
      layoutInCell: false,
      zIndex: -1  // Enviar al fondo
    }
  });
};
```

---

## ⚠️ NIVELES DE IMPLEMENTACIÓN Y CONFIGURACIONES

### 🟢 **CONFIGURACIONES YA IMPLEMENTADAS** (Probadas en archivos .js existentes)

#### ✅ **En `src/generators/PumaExactReplicator.js`:**
```javascript
// ESTAS CONFIGURACIONES YA FUNCIONAN:
- ImageRun básico con transformation (width, height)
- TextWrappingType.NONE (imágenes detrás del texto)
- Posicionamiento floating básico con EMU
- allowOverlap: true
- layoutInCell: true
- HorizontalPositionRelativeFrom.PAGE
- VerticalPositionRelativeFrom.PAGE
```

#### ✅ **En `src/analyzers/analyzeImageFormatting.cjs`:**
```javascript
// ESTAS EXTRACCIONES YA FUNCIONAN:
- Coordenadas X,Y en unidades EMU
- Dimensiones de imágenes
- Configuraciones básicas de wrapping
- Análisis de posicionamiento absoluto
```

#### ✅ **En `src/extractors/documentImageExtractor.cjs`:**
```javascript
// ESTAS FUNCIONALIDADES YA FUNCIONAN:
- Extracción de imágenes del DOCX
- Guardado en ./extracted_images/
- Manejo de rutas de imágenes
- Mapeo imagen → archivo extraído
```

### 🟡 **CONFIGURACIONES PARCIALMENTE IMPLEMENTADAS** (Requieren ajustes)

#### ⚠️ **Tables con posicionamiento flotante:**
```javascript
// ESTADO: Implementación básica existe, posicionamiento avanzado NO
const table = new Table({
  rows: [...],  // ✅ YA IMPLEMENTADO
  // ⚠️ ESTA PARTE NECESITA IMPLEMENTACIÓN:
  tableFloatProperties: {
    horizontalAnchor: TableAnchorType.PAGE,  // ❌ PUEDE GENERAR ERRORES
    verticalAnchor: TableAnchorType.PAGE,    // ❌ PUEDE GENERAR ERRORES
    absoluteHorizontalDistance: 2000000,     // ❌ NO PROBADO
    absoluteVerticalDistance: 1500000        // ❌ NO PROBADO
  }
});
```

#### ⚠️ **Recortes de imágenes (crop):**
```javascript
// ESTADO: Transformaciones básicas funcionan, crop avanzado NO
transformation: {
  width: 200,   // ✅ YA IMPLEMENTADO
  height: 150,  // ✅ YA IMPLEMENTADO
  // ⚠️ ESTA PARTE PUEDE FALLAR:
  crop: {       // ❌ NO COMPLETAMENTE PROBADO
    left: 10,   // ❌ PUEDE GENERAR ERRORES
    top: 15,    // ❌ PUEDE GENERAR ERRORES
    right: 5,   // ❌ PUEDE GENERAR ERRORES
    bottom: 0   // ❌ PUEDE GENERAR ERRORES
  }
}
```

### 🔴 **CONFIGURACIONES EXPERIMENTALES** (Alto riesgo de errores)

#### ❌ **TextBox con Drawing (NO implementado):**
```javascript
// ESTADO: COMPLETAMENTE EXPERIMENTAL - PUEDE FALLAR
new Drawing({
  inline: false,        // ❌ NO PROBADO EN SISTEMA ACTUAL
  floating: {
    // ...configuración experimental
  },
  textBox: {
    // ...configuración experimental
  }
});
```

#### ❌ **Opacity y transparency (NO soportado nativamente):**
```javascript
// ESTADO: NO SOPORTADO POR LIBRERÍA docx.js
transformation: {
  opacity: 30  // ❌ ESTA PROPIEDAD NO EXISTE EN docx.js
},
textBoxStyle: {
  fillOpacity: 80  // ❌ PUEDE NO FUNCIONAR
}
```

#### ❌ **zIndex (NO soportado):**
```javascript
floating: {
  zIndex: -1  // ❌ ESTA PROPIEDAD NO EXISTE EN docx.js
}
```

### 📋 **CONFIGURACIONES SEGURAS PARA IMPLEMENTAR:**
````markdown
## 🛠️ GUÍA DE IMPLEMENTACIÓN SEGURA

### 📋 **PASO A PASO: De lo Probado a lo Experimental**

#### 🥇 **FASE 1: Implementar Solo lo Probado (1-2 días)**
```javascript
// EMPEZAR CON ESTAS CONFIGURACIONES SEGURAS:
class PumaParametricGeneratorSafe {
  constructor(params) {
    this.params = params;
  }

  createSafeImage(imageKey) {
    const imageConfig = this.params.images?.[imageKey];
    if (!imageConfig) return null;

    // ✅ SOLO USAR PROPIEDADES PROBADAS:
    return new ImageRun({
      data: fs.readFileSync(imageConfig.path),  // ✅ FUNCIONA
      transformation: {
        width: imageConfig.size?.width || 200,  // ✅ FUNCIONA
        height: imageConfig.size?.height || 150 // ✅ FUNCIONA
        // ❌ NO AGREGAR crop: {...} AÚN
      },
      floating: {
        horizontalPosition: {
          relative: HorizontalPositionRelativeFrom.PAGE, // ✅ FUNCIONA
          offset: imageConfig.position?.x || 1000000      // ✅ FUNCIONA
        },
        verticalPosition: {
          relative: VerticalPositionRelativeFrom.PAGE,   // ✅ FUNCIONA
          offset: imageConfig.position?.y || 1000000     // ✅ FUNCIONA
        },
        wrap: {
          type: TextWrappingType.NONE,        // ✅ FUNCIONA
          side: TextWrappingSide.BOTH_SIDES   // ✅ FUNCIONA
        },
        allowOverlap: true,                   // ✅ FUNCIONA
        layoutInCell: true                    // ✅ FUNCIONA
      }
    });
  }

  // ✅ TEXTOS SEGUROS (ya implementados):
  createSafeText(textContent, style = {}) {
    return new TextRun({
      text: textContent,                     // ✅ FUNCIONA
      bold: style.bold || false,             // ✅ FUNCIONA
      size: style.size || 24,                // ✅ FUNCIONA
      color: style.color || "#000000"        // ✅ FUNCIONA
    });
  }
}
```

#### 🥈 **FASE 2: Probar Configuraciones Intermedias (2-3 días)**
```javascript
// DESPUÉS DE QUE FASE 1 FUNCIONE, PROBAR ESTAS:
class PumaParametricGeneratorIntermediate extends PumaParametricGeneratorSafe {
  
  // ⚠️ PROBAR CON CUIDADO - RECORTES BÁSICOS:
  createImageWithCrop(imageKey) {
    const imageConfig = this.params.images?.[imageKey];
    if (!imageConfig) return null;

    try {
      return new ImageRun({
        data: fs.readFileSync(imageConfig.path),
        transformation: {
          width: imageConfig.size?.width || 200,
          height: imageConfig.size?.height || 150,
          // ⚠️ PROBAR CON VALORES PEQUEÑOS PRIMERO:
          crop: {
            left: Math.min(imageConfig.crop?.left || 0, 10),   // Max 10%
            top: Math.min(imageConfig.crop?.top || 0, 10),     // Max 10%
            right: Math.min(imageConfig.crop?.right || 0, 10), // Max 10%
            bottom: Math.min(imageConfig.crop?.bottom || 0, 10) // Max 10%
          }
        },
        floating: {
          // ...resto igual que en FASE 1
        }
      });
    } catch (error) {
      console.warn(`Error con crop en ${imageKey}:`, error);
      // FALLBACK: usar imagen sin crop
      return this.createSafeImage(imageKey);
    }
  }

  // ⚠️ PROBAR TABLAS BÁSICAS SIN POSICIONAMIENTO FLOTANTE:
  createBasicTable(tableKey) {
    const tableConfig = this.params.tables?.[tableKey];
    if (!tableConfig) return null;

    // ✅ EMPEZAR CON TABLA NORMAL (no flotante):
    return new Table({
      rows: tableConfig.data.map(rowData => 
        new TableRow({
          children: rowData.map(cellText => 
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cellText })]
                })
              ]
            })
          )
        })
      ),
      width: {
        size: tableConfig.width || 5000,
        type: WidthType.DXA
      }
      // ❌ NO AGREGAR tableFloatProperties AÚN
    });
  }
}
```

#### 🥉 **FASE 3: Experimental Solo Después de Validar (3-5 días)**
```javascript
// SOLO DESPUÉS DE QUE FASE 1 Y 2 FUNCIONEN:
class PumaParametricGeneratorExperimental extends PumaParametricGeneratorIntermediate {
  
  // ❌ ALTAMENTE EXPERIMENTAL - PUEDE FALLAR:
  createTextBox(boxKey) {
    const boxConfig = this.params.header?.[boxKey];
    if (!boxConfig) return null;

    try {
      // ⚠️ ESTO PUEDE NO FUNCIONAR:
      return new Drawing({
        inline: false,
        floating: {
          // ...configuración experimental
        },
        textBox: {
          // ...configuración experimental
        }
      });
    } catch (error) {
      console.error(`TextBox experimental falló:`, error);
      // FALLBACK: crear párrafo normal
      return new Paragraph({
        children: [
          new TextRun({
            text: boxConfig.content || "",
            bold: boxConfig.style?.bold || false
          })
        ]
      });
    }
  }
}
```

### 🧪 **ESTRATEGIA DE TESTING POR FASES:**
#### ✅ **Testing Fase 1:**
```bash
# Crear test específico para configuraciones seguras:
📝 src/tests/testSafeParametric.js

# Probar solo:
- Imágenes básicas con posicionamiento
- Textos con estilos básicos
- Párrafos y secciones simples
```

#### ⚠️ **Testing Fase 2:**
```bash
# Crear test para configuraciones intermedias:
📝 src/tests/testIntermediateParametric.js

# Probar con precaución:
- Recortes de imagen con valores pequeños (0-10%)
- Tablas básicas sin flotado
- Validar que no rompe el formato
```

#### ❌ **Testing Fase 3:**
```bash
# Crear test para configuraciones experimentales:
📝 src/tests/testExperimentalParametric.js

# Probar en entorno aislado:
- TextBox (probablemente falle)
- Tablas flotantes (puede generar errores)
- Transparency/opacity (no soportado)
```

### 📋 **CHECKLIST DE VALIDACIÓN:**
#### ✅ **Antes de implementar cualquier nueva configuración:**
```javascript
// 1. ¿Está en la documentación oficial de docx.js?
// 2. ¿Hay ejemplos en GitHub del proyecto docx?
// 3. ¿Es similar a algo que ya funciona en PumaExactReplicator.js?
```

#### 🔄 **Funciones de Validación de Configuraciones:**
```javascript
const isConfigSafe = (configName) => {
  const safeConfigs = [
    'ImageRun.transformation.width',
    'ImageRun.transformation.height', 
    'ImageRun.floating.horizontalPosition',
    'ImageRun.floating.verticalPosition',
    'TextRun.text',
    'TextRun.bold',
    'TextRun.size',
    'TextRun.color'
  ];
  
  return safeConfigs.includes(configName);
};
```

### 🚨 **ERRORES COMUNES A EVITAR:**
#### ❌ **Error 1: Usar propiedades inexistentes**
```javascript
// MAL:
new ImageRun({
  transparency: 50,  // ❌ Esta propiedad NO existe
  zIndex: -1        // ❌ Esta propiedad NO existe
});

// BIEN:
new ImageRun({
  transformation: { width: 200 },  // ✅ Esta propiedad SÍ existe
  floating: { wrap: { type: TextWrappingType.NONE } }  // ✅ Existe
});
```

#### ❌ **Error 2: No validar datos de entrada**
```javascript
// MAL:
const width = params.images.logo.size.width;  // ❌ Puede ser undefined

// BIEN:
const width = params?.images?.logo?.size?.width || 200;  // ✅ Seguro
```

#### ❌ **Error 3: No manejar errores**
```javascript
// MAL:
return new ImageRun({ data: fs.readFileSync(path) });  // ❌ Puede fallar

// BIEN:
try {
  const data = fs.readFileSync(path);
  return new ImageRun({ data });
} catch (error) {
  console.warn(`Error cargando imagen: ${path}`);
  return null;
}
```

---
