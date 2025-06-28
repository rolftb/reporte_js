# 📝 Generadores de Documentos

Este directorio contiene los generadores que crean documentos DOCX con diferentes estructuras y características.

## 📋 Archivos

- **`PumaDocumentGenerator.js`** - Generador original con estructura de tablas y formularios
- **`PumaRealStructureGenerator.js`** - Generador que replica la estructura real visual del documento PUMA
- **`PumaExactReplicator.js`** - 🆕 Replicador exacto que genera el mismo contenido que "PUMA MES 6 2025.docx"
- **`createSample.js`** - Crea documentos DOCX de ejemplo para pruebas y análisis

## 🎯 Generadores Disponibles

### PumaDocumentGenerator (Tradicional)
**Uso**: Documentos estructurados con tablas y formularios
```javascript
import { PumaDocumentGenerator } from './generators/PumaDocumentGenerator.js';
const generator = new PumaDocumentGenerator(true); // con imágenes reales
const document = await generator.generateDocument(data);
```

**Características**:
- Estructura de tablas organizadas
- Campos de registro detallados
- Layout tipo formulario
- Header con logos y texto

### PumaRealStructureGenerator (Recomendado)
**Uso**: Documentos que replican la estructura visual real
```javascript
import { PumaRealStructureGenerator } from './generators/PumaRealStructureGenerator.js';
const generator = new PumaRealStructureGenerator(true);
const document = await generator.generateDocument();
```

**Características**:
- Header completamente visual (solo imágenes)
- Páginas orientadas a contenido fotográfico
- Mínimo texto, máximo impacto visual
- Estructura fiel al documento original

### PumaExactReplicator (Nuevo)
**Uso**: Replicación exacta del documento "PUMA MES 6 2025.docx"
```javascript
import { PumaExactReplicatorGenerator } from './generators/PumaExactReplicator.js';
const generator = new PumaExactReplicatorGenerator(true);
const document = await generator.generateDocument();
```

**Características**:
- Replica exacta de un documento DOCX existente
- Datos extraídos por análisis automático
- 4 sesiones con fechas y participantes específicos
- 16 imágenes reales de actividades
- Estructura idéntica al documento original

## 🔧 Configuración

### Modo con Imágenes Reales
```javascript
const generator = new Generator(true);  // useRealImages = true
```
- Carga automáticamente imágenes de `./extracted_images/`
- Usa el registro de imágenes existente
- Fallback a placeholders si no hay imágenes

### Modo Placeholder
```javascript
const generator = new Generator(false); // useRealImages = false
```
- Genera placeholders para todas las imágenes
- Útil para pruebas y desarrollo
- No requiere extracción previa de imágenes

## 📤 Salida

Los generadores producen:
- Archivos `.docx` funcionales
- Documentos con estructura profesional
- Integración de imágenes reales o placeholders
- Layout responsive y bien formateado

## 🚀 Flujo de Trabajo

### 1. Preparación
```bash
# Extraer imágenes del documento original
node src/extractors/documentImageExtractor.cjs "documento_original.docx"
```

### 2. Generación
```bash
# Usar tests predefinidos
node src/tests/testRealStructure.js

# O implementar personalizado
import { PumaRealStructureGenerator } from './generators/PumaRealStructureGenerator.js';
```

### 3. Validación
```bash
# Validar estructura generada
node src/validators/validatePumaStructure.js
```

## 🎨 Personalización

### Colores y Estilos
```javascript
this.config = {
  primaryColor: "003366",
  margins: { top: 720, right: 720, bottom: 720, left: 720 },
  imageConfig: { photos: { maxPerPage: 4 } }
};
```

### Datos de Entrada
```javascript
const data = {
  empresa: "Nombre Empresa",
  registros: [
    { titulo: "Actividad 1", fotos: [...] },
    { titulo: "Actividad 2", fotos: [...] }
  ]
};
```

## 🔗 Integración

Los generadores trabajan con:
- **Extractores**: `/src/extractors/` - Para obtener imágenes reales
- **Analizadores**: `/src/analyzers/` - Para entender estructura original
- **Validadores**: `/src/validators/` - Para verificar calidad del output
