# 🎯 Generador de Reportes PUMA

Sistema simplificado para generar reportes PUMA con imágenes reales extraídas del documento original "PUMA MES 6 2025.docx".

## 🚀 Características

- ✅ **Extrae imágenes automáticamente** del documento DOCX original
- ✅ **Genera reportes con estructura real** basada en el documento original
- ✅ **Incluye logos corporativos** en el header
- ✅ **Distribuye fotos de actividades** en las páginas (4 por página)
- ✅ **Evita duplicados** usando hash MD5
- ✅ **Sistema totalmente automatizado**

## ⚡ Uso Rápido

### 1. Extraer Imágenes (Solo una vez)
```bash
cd C:\Users\rolft\Repositorios\Pauli\reporte_js
node src/documentImageExtractor.cjs "./uploads/PUMA MES 6 2025.docx"
```

### 2. Generar Reporte
```bash
node generatePumaReport.js
```

¡Eso es todo! El reporte se genera en `./output/reporte_puma_[timestamp].docx`

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
