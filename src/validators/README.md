# ✅ Validadores

Este directorio contiene herramientas para validar la estructura y calidad de los documentos generados.

## 📋 Archivos

- **`validatePumaStructure.js`** - Validador de estructura del documento PUMA generado

## 🔍 Validaciones Realizadas

### Estructura del Documento
- Verificación de número de páginas
- Validación de distribución de imágenes
- Comprobación de límites por página (máx 4 fotos)

### Integridad de Imágenes
- Verificación de carga correcta de imágenes
- Validación de rutas y archivos
- Comprobación de metadatos

### Conformidad con Original
- Comparación con estructura del documento fuente
- Validación de header y contenido
- Verificación de layout y distribución

## 🚀 Uso

### Validación Básica
```bash
node src/validators/validatePumaStructure.js
```

### Integración en Tests
```javascript
import { validatePumaStructure } from '../validators/validatePumaStructure.js';

// Después de generar documento
const isValid = await validatePumaStructure(documentPath);
if (isValid) {
    console.log('✅ Documento válido');
} else {
    console.log('❌ Documento tiene errores');
}
```

## 📊 Tipos de Validación

### Estructural
- Número correcto de secciones
- Headers apropiados
- Distribución de contenido

### Visual
- Presencia de imágenes
- Tamaños apropiados
- Posicionamiento correcto

### Funcional
- Compatibilidad con Word
- Integridad de archivos
- Metadatos correctos

## 🔗 Relacionado

Los validadores trabajan con:
- **Tests**: `/src/tests/` - Para validación automática
- **Generadores**: `/src/generators/` - Para verificar output
- **Extractores**: `/src/extractors/` - Para validar datos fuente
