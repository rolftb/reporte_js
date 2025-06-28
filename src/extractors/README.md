# 🖼️ Extractores de Imágenes

Este directorio contiene herramientas para extraer imágenes de documentos DOCX, evitando duplicados y manteniendo un registro organizado.

## 📋 Archivos

- **`documentImageExtractor.cjs`** - Extractor principal que analiza y extrae todas las imágenes de un documento DOCX
- **`extractImages.js`** - Script simplificado para extracción de imágenes con interfaz ESM

## 🚀 Uso

### Extracción Principal (Recomendado)
```bash
node src/extractors/documentImageExtractor.cjs "ruta/al/documento.docx"
```

### Extracción con Directorio Personalizado
```bash
node src/extractors/documentImageExtractor.cjs "documento.docx" "./mi_directorio"
```

### Script Simplificado
```bash
node src/extractors/extractImages.js "documento.docx"
```

## ✨ Características

### Prevención de Duplicados
- Usa hash MD5 para identificar imágenes únicas
- Evita re-extracción de imágenes ya procesadas
- Mantiene registro persistente en `image_registry.json`

### Análisis Completo
- Extrae metadatos de cada imagen
- Analiza relaciones en el documento
- Genera rutas para integración con generadores

### Soporte de Formatos
- JPEG/JPG
- PNG
- GIF
- BMP
- WEBP

## 📤 Salida

### Estructura Generada
```
extracted_images/
├── image1_32f311ba.jpeg     # Imagen extraída con hash
├── image2_077bc1b1.jpeg     # Otra imagen
├── ...
└── image_registry.json      # Registro de metadatos
```

### Registro JSON
```json
{
  "hash_md5": {
    "originalPath": "word/media/image1.jpeg",
    "extractedPath": "extracted_images/image1_32f311ba.jpeg", 
    "fileName": "image1_32f311ba.jpeg",
    "size": 12345,
    "extractedAt": "2025-06-28T..."
  }
}
```

## 🔗 Integración

Las imágenes extraídas pueden ser utilizadas por:
- **Generadores**: `/src/generators/` - Para crear documentos con imágenes reales
- **Analizadores**: `/src/analyzers/` - Para análisis de contenido visual
- **Tests**: `/src/tests/` - Para validación de carga de imágenes

## 📊 Beneficios

- ✅ **Sin duplicados**: Ahorro de espacio y tiempo
- ✅ **Reutilización**: Una extracción, múltiples usos
- ✅ **Integridad**: Verificación por hash MD5
- ✅ **Organización**: Registro detallado de cada imagen
