# 🎯 Generador de Reportes PUMA

Sistema optimizado para generar reportes PUMA con análisis avanzado de imágenes y replicación exacta del formato del documento original "PUMA MES 6 2025.docx".

## 🚀 Características

- ✅ **Análisis avanzado de imágenes v3.0** con metadata completa de posicionamiento
- ✅ **Extracción de coordenadas exactas** (x, y) y propiedades de recorte
- ✅ **Información de contexto detallada** (header, footer, tabla, párrafo, flotante)
- ✅ **Captura de propiedades de wrap** (square, tight, through, etc.)
- ✅ **Dimensiones reales y transformaciones** (rotación, volteo, escala)
- ✅ **Distribución por páginas** con ubicación estructural específica
- ✅ **Genera reportes con estructura real** basada en el documento original
- ✅ **Sistema totalmente automatizado** con estadísticas completas

## ⚡ Uso Rápido

### 1. Análisis Avanzado de Imágenes (Recomendado)
```bash
cd C:\Users\rolft\Repositorios\Pauli\reporte_js
node runAdvancedAnalysis.cjs
```

### 2. Análisis Básico (Legacy)
```bash
node src/documentImageExtractor.cjs
```

### 3. Generar Reporte
```bash
node generatePumaReport.js
```

¡El reporte se genera en `./output/reporte_puma_[timestamp].docx` con toda la información de posicionamiento capturada!

## 📁 Estructura del Proyecto

```
reporte_js/
├── src/
│   ├── documentImageExtractor.cjs     # Extractor de imágenes
│   └── generators/
│       ├── PumaRealStructureGenerator.js   # Generador principal
│       └── PumaDocumentGenerator.js        # Generador alternativo
├── extracted_images/                  # Imágenes extraídas (18 imágenes)
│   ├── image1_32f311ba.jpeg          # Header primer pagina (logo 1) TODO
│   ├── image2_077bc1b1.jpeg          # Header segunda pagina (logo 2) TODO
│   ├── image4_fe4f8c66.jpeg          # Foto actividad 1
│   ├── ...                           # Fotos actividades 2-15
│   └── image_registry.json           # Registro de imágenes
├── uploads/
│   └── PUMA MES 6 2025.docx          # Documento original
├── output/                           # Reportes generados
├── generatePumaReport.js             # Generador principal
└── package.json                      # Dependencias
```

## 🎯 Archivos Esenciales

### `src/documentImageExtractor.cjs`
Extrae las 18 imágenes del documento original PUMA:
- 2 imágenes distintas para el header según pagina
    - Primera pagina (logos corporativos)
    - Segunda pagina (header sin logos)
- 15 imágenes de actividades
- Evita duplicados usando hash MD5
- Genera registro JSON con metadatos, definiendo:
    - Nombre de la imagen
    - Hash MD5
    - Tipo de imagen (header o actividad)
    - Fecha de extracción
    - Define la úbicación especifica en cada página de las imágenes.
    - Define si las imagenes están cortadas o no.

### `src/generators/PumaRealStructureGenerator.js`
Genera documentos con la estructura real del original:
- Header completamente visual
- primera pagina tabla de `ASPECTOS TÉCNICOS DE LA ACTIVIDAD EN TERRENO` 
| ASPECTOS TÉCNICOS DE LA ACTIVIDAD EN TERRENO |   |
|----------------------------------------------|---|
| Nombre de la actividad | Programa de Calidad de Vida. |
| Fecha | Desde el 21 de mayo al 20 de junio |
| Lugar | Av. Pdte. Kennedy 5454 |
| Profesional a cargo | Profesional área Calidad de Vida - Mutual Asesorías. |
- luego de la tabla anterior, se coloca otra tabla con los `REGISTRO FOTOGRÁFICO DE LA ACTIVAD` este recuadro o tabla está en el encabezado de la página (en todas las páginas incluyendo la primera) y es una tabla de dos filas, la cual la primera fila tiene el título y la segunda fila tiene un espacio para colocar al inicio una tabla de 3 filas, dos columnas y luego las 4 fotos de la actividad
- Páginas basadas en imágenes (4 por página)
- Distribución fiel al documento original
- Carga automática de imágenes extraídas

### `generatePumaReport.js`
Script principal simplificado:
- Punto de entrada único
- Verificaciones automáticas
- Manejo de errores claro
- Salida en formato DOCX

## 📊 Resultados

El sistema genera reportes que incluyen:

- **Header**: Logos corporativos reales del documento original
- **Página 1**: 4 imágenes de actividades
- **Página 2**: 4 imágenes de actividades  
- **Página 3**: 4 imágenes de actividades
- **Página 4**: 4 imágenes de actividades

**Total**: 18 imágenes distribuidas correctamente

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Ya está listo para usar
```

## 💡 Resolución de Problemas

### "No se encontraron imágenes extraídas"
```bash
# Extraer imágenes primero
node src/documentImageExtractor.cjs "./uploads/PUMA MES 6 2025.docx"
```

### "Error al generar reporte"
- Verifica que el archivo `PUMA MES 6 2025.docx` esté en `./uploads/`
- Asegúrate de haber extraído las imágenes primero
- Verifica que el directorio `./output/` sea escribible

## 📋 Estado del Sistema

- ✅ **Extracción**: 18 imágenes extraídas y registradas
- ✅ **Generación**: Documento con estructura real replicada
- ✅ **Validación**: Sistema probado y funcional
- ✅ **Optimización**: Sin archivos obsoletos o test

## 🎉 Ventajas del Sistema Limpio

- **Simplicidad**: Solo archivos esenciales
- **Velocidad**: Sin código obsoleto que ralentice
- **Claridad**: Estructura fácil de entender
- **Mantenibilidad**: Código enfocado en la funcionalidad principal

El sistema está optimizado para generar reportes PUMA de alta calidad con el mínimo de archivos y máxima eficiencia.

## 🔍 Análisis Avanzado de Imágenes v3.0

El nuevo sistema de análisis captura información extremadamente detallada sobre cada imagen:

### 📍 Información de Posicionamiento
- **Coordenadas absolutas**: Posición exacta (x, y) en unidades EMU
- **Referencias espaciales**: Punto de anclaje (column, paragraph, page, etc.)
- **Ubicación estructural**: Header, footer, tabla, párrafo, imagen flotante
- **Distribución por páginas**: Asignación específica a cada página del documento

### 🎨 Información de Formato
- **Dimensiones reales**: Ancho y alto en píxeles (ej: 265x265)
- **Recorte detallado**: cropLeft, cropTop, cropRight, cropBottom en porcentajes
- **Transformaciones**: Rotación, volteo horizontal/vertical, escala
- **Propiedades de wrap**: square, tight, through, topAndBottom, none

### 📊 Estadísticas Capturadas
Del análisis del documento PUMA se obtuvieron estas métricas:
- **18 imágenes totales** procesadas
- **17 imágenes con recorte** (94% tienen algún tipo de recorte)
- **17 imágenes flotantes** (94% están posicionadas de forma flotante)
- **1 imagen en header**, **16 imágenes flotantes**, **1 en párrafo**
- **Dimensiones promedio**: 298x317 píxeles

### 📁 Estructura del Registro v3.0
```json
{
  "metadata": {
    "version": "3.0",
    "features": [
      "positioning", "cropping", "context", "formatting",
      "absolute_positioning", "wrap_settings", "transformations"
    ]
  },
  "pageDistribution": {
    "1": [
      {
        "fileName": "image5_6fa52ec6.jpeg",
        "position": {
          "page": 1,
          "paragraphId": 61,
          "absolutePosition": {
            "x": 4079875,        // Coordenada X exacta
            "xRelativeFrom": "column",
            "y": 153670,         // Coordenada Y exacta
            "yRelativeFrom": "paragraph"
          }
        },
        "formatting": {
          "width": 265,          // Ancho real en píxeles
          "height": 265,         // Alto real en píxeles
          "cropLeft": 12.5,      // Recorte izquierdo 12.5%
          "cropRight": 12.5      // Recorte derecho 12.5%
        },
        "context": {
          "isFloating": true,    // Imagen flotante
          "wrapType": "square"   // Texto rodea en cuadrado
        }
      }
    ]
  },
  "statistics": {
    "withCropping": 17,        // 17 de 18 imágenes tienen recorte
    "avgDimensions": {
      "width": 298,            // Ancho promedio
      "height": 317            // Alto promedio
    }
  }
}
```

### 🎯 Casos de Uso de la Metadata
Esta información detallada permite:
- **Replicación exacta** del posicionamiento original
- **Aplicación correcta de recortes** a las imágenes
- **Configuración precisa** de propiedades de wrap de texto
- **Distribución fiel** de imágenes por página
- **Análisis de patrones** de diseño en el documento
