# 📁 Carpeta Media - Imágenes de Header PUMA

Esta carpeta contiene las imágenes de header extraídas del documento original "PUMA MES 6 2025.docx" para uso en el sistema de generación de reportes.

## 🖼️ Contenido

### Imágenes de Header
- **`header_primera_pagina.jpeg`** (image18_1eeb3f5e.jpeg)
  - Header para la primera página del reporte
  - Contiene logos corporativos
  - Tamaño original: 2519680x2519680 EMU
  - Hash: 1eeb3f5e1fdecce211e82bda38cc502c

- **`header_paginas_siguientes.jpeg`** (image17_bfca8351.jpeg)
  - Header para páginas 2, 3, 4, etc.
  - Header sin logos corporativos
  - Hash: bfca8351268c989e4d2d6333649d5233

### Archivo de Información
- **`header_images_info.json`**
  - Metadata completa de las imágenes
  - Información de formato y uso
  - Instrucciones de implementación

## 🎯 Uso en el Sistema

Estas imágenes son utilizadas automáticamente por `PumaRealStructureGenerator.js`:

```javascript
// El generador busca primero en extracted_images
// Si no encuentra, usa automáticamente las de media/
const mediaFileName = isFirstPage ? 
    'header_primera_pagina.jpeg' : 
    'header_paginas_siguientes.jpeg';
```

## ✅ Ventajas de esta Estructura

- **Independencia**: No depende de regenerar extracted_images
- **Claridad**: Nombres descriptivos en lugar de hashes
- **Backup**: Copia de seguridad de imágenes críticas
- **Reutilización**: Fácil acceso para otros componentes
- **Documentación**: Metadata detallada disponible

## 🔧 Formato Recomendado

Para uso en documentos DOCX:
- **Ancho**: 600 píxeles
- **Alto**: 100 píxeles  
- **Alineación**: Centrado
- **Formato**: JPEG
- **Calidad**: Alta resolución

## 📋 Origen

Las imágenes fueron extraídas usando:
- `advancedDocumentImageExtractor.cjs` v3.0
- Fecha de extracción: 2025-06-29T04:15:53.919Z
- Documento fuente: PUMA MES 6 2025.docx

## 🎨 Estructura Visual

### Primera Página
```
┌─────────────────────────────────────┐
│  [LOGOS CORPORATIVOS]               │
│  REGISTRO FOTOGRÁFICO DE LA         │
│  ACTIVIDAD                          │
│  ════════════════════════════════   │
└─────────────────────────────────────┘
```

### Páginas Siguientes
```
┌─────────────────────────────────────┐
│  [HEADER SIN LOGOS]                 │
│  REGISTRO FOTOGRÁFICO DE LA         │
│  ACTIVIDAD                          │
│  ════════════════════════════════   │
└─────────────────────────────────────┘
```

Esta estructura garantiza que el header se vea exactamente como en el documento original PUMA.
