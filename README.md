# Reporteador de Empresas - Sistema PUMA

## � Documento Principal de Referencia

**Archivo Base**: `uploads/PUMA MES 6 2025.docx`

Este es el documento maestro que contiene el formato estándar PUMA que debe ser replicado y analizado por el sistema. Todos los analizadores, generadores y validadores están optimizados para trabajar con este formato específico.

## �📁 Estructura Organizada por Temas

Este repositorio ha sido reorganizado por temas funcionales para facilitar la navegación y el mantenimiento del código, enfocado en el procesamiento del formato PUMA.

### 🗂️ Directorios Principales

```
src/
├── 📊 analyzers/     # Análisis profundo del documento PUMA
├── 🖼️ extractors/    # Extracción de imágenes del documento base
├── 📝 generators/    # Generación de documentos con formato PUMA
├── 🧪 tests/         # Pruebas específicas para replicación PUMA
├── ✅ validators/    # Validadores de estructura y formato PUMA
├── 🎬 demos/         # Demostraciones del sistema completo
├── 🎮 controllers/   # Controladores de API
├── 🛣️ routes/        # Rutas de la aplicación
├── ⚙️ services/      # Servicios del sistema
└── 🔧 utils/         # Utilidades generales
```

## 🚀 Inicio Rápido - Trabajo con PUMA

### Para Analizar el Documento PUMA
```bash
# Análisis profundo del documento PUMA (RECOMENDADO)
node src/analyzers/deepAnalyzePuma.js

# Análisis específico de estructura de páginas
node src/analyzers/analyzePageStructure.js

# Análisis del formato de imágenes en header
node src/analyzers/analyzeImageFormatting.cjs

# Escaneo general del documento
node src/analyzers/scanDocx.js "uploads/PUMA MES 6 2025.docx"
```

### Para Extraer Imágenes del PUMA
```bash
# Extracción completa de imágenes del documento PUMA
node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"

# Extracción básica de imágenes
node src/extractors/extractImages.js
```

### Para Generar Documentos con Formato PUMA
```bash
# MÉTODO PRINCIPAL - Replicador exacto del formato PUMA
node src/generators/PumaExactReplicator.js

# Generador con estructura real PUMA
node src/generators/PumaRealStructureGenerator.js

# Generador principal de documentos PUMA
node src/generators/PumaDocumentGenerator.js

# Crear documentos de ejemplo con formato PUMA
node src/generators/createSample.js
```

### Para Probar y Validar el Sistema PUMA
```bash
# TEST PRINCIPAL - Replicación exacta del PUMA
node src/tests/testExactReplicator.js

# Prueba de estructura real
node src/tests/testRealStructure.js

# Validación completa del documento generado
node src/tests/validateExactSpecifications.js

# Pruebas específicas de replicación PUMA
node src/tests/testPumaReplication.js
```

### Para Ver Demos del Sistema PUMA
```bash
# DEMO COMPLETO - Sistema funcionando end-to-end
node src/demos/demoCompleteSystem.js

# Demo final del sistema con validaciones
node src/demos/finalSystemDemo.cjs

# Generar reporte completo de ejemplo PUMA
node src/demos/generarReporteEjemplo.js

# Ver estado del sistema de imágenes
node src/demos/showImageSystem.cjs
```

### Para Validar Componentes Específicos
```bash
# Validación final completa del sistema
node src/validators/finalValidation.cjs

# Validar formato de imágenes (CRÍTICO)
node src/validators/validateImageFormatting.cjs

# Validar posicionamiento del body
node src/validators/validateBodyPositioning.cjs

# Validar estructura de páginas
node src/validators/validatePageStructure.cjs

# Validar recorte de imágenes
node src/validators/validateImageCropping.cjs
```

## 📊 Catálogo Completo de Archivos por Función

### 🔍 ANALIZADORES (src/analyzers/)
| Archivo | Función Principal | Uso con PUMA | 📋 Dependencias | ⚠️ Requisitos Previos |
|---------|------------------|--------------|------------------|----------------------|
| `deepAnalyzePuma.js` | **Análisis profundo del PUMA** | ⭐ PRINCIPAL para análisis completo | `fs-extra`, `jszip`, `xmldom` | ✅ Documento PUMA en ruta específica |
| `analyzeImageFormatting.cjs` | Analiza formato XML de imágenes | ⭐ Crítico para posicionamiento | `fs`, `jszip`, `xmldom` | 🔄 Ejecutar **después** de `deepAnalyzePuma.js` |
| `analyzePageStructure.js` | Estructura de páginas y secciones | ⭐ Esencial para layout | `mammoth`, `fs-extra` | ✅ Solo necesita documento PUMA |
| `analyzeHeaders.js` | Análisis de headers y footers | ⭐ Para cabeceras PUMA | `mammoth`, `fs-extra` | ✅ Solo necesita documento PUMA |
| `analyzeBodyPositioning.cjs` | Posicionamiento del contenido | ⭐ Anti-desplazamiento | `jszip`, `xmldom` | 🔄 Ejecutar **después** de análisis de imágenes |
| `scanDocx.js` | Escaneo general de documentos | 📋 Análisis básico | `mammoth`, `fs-extra` | ✅ Solo necesita documento PUMA |
| `analyzeHeaderStructure.js` | Estructura detallada de headers | 🔧 Análisis específico | `mammoth`, `fs-extra` | ✅ Solo necesita documento PUMA |

### 🖼️ EXTRACTORES (src/extractors/)
| Archivo | Función Principal | Uso con PUMA | 📋 Dependencias | ⚠️ Requisitos Previos |
|---------|------------------|--------------|------------------|----------------------|
| `documentImageExtractor.cjs` | **Extractor principal de imágenes** | ⭐ PRINCIPAL para PUMA | `jszip`, `xmldom`, `fs-extra`, `crypto` | 🔄 Ejecutar **antes** que generadores |
| `extractImages.js` | Extracción básica de imágenes | 📋 Método alternativo | `mammoth`, `fs-extra` | ✅ Solo necesita documento PUMA |

### 📝 GENERADORES (src/generators/)
| Archivo | Función Principal | Uso con PUMA | 📋 Dependencias | ⚠️ Requisitos Previos |
|---------|------------------|--------------|------------------|----------------------|
| `PumaExactReplicator.js` | **Replicador exacto del formato PUMA** | ⭐ PRINCIPAL - Réplica perfecta | `docx`, `fs-extra`, `path` | 🚨 **CRÍTICO**: Ejecutar `documentImageExtractor.cjs` primero |
| `PumaRealStructureGenerator.js` | Generador con estructura real PUMA | ⭐ Estructura completa | `docx`, `fs-extra` | 🔄 Ejecutar **después** de análisis profundo |
| `PumaDocumentGenerator.js` | Generador principal de documentos PUMA | ⭐ Versión robusta | `docx`, `fs-extra` | 🔄 Ejecutar **después** de análisis profundo |
| `createSample.js` | Crear documentos de ejemplo | 📋 Para pruebas | `docx`, `fs-extra` | ✅ Sin requisitos específicos |
| `reporte_actividad_terreno.js` | Generador específico de reportes | 🔧 Caso específico | `docx`, `fs-extra` | ✅ Sin requisitos específicos |

### 🧪 TESTS (src/tests/)
| Archivo | Función Principal | Uso con PUMA | 📋 Dependencias | ⚠️ Requisitos Previos |
|---------|------------------|--------------|------------------|----------------------|
| `testExactReplicator.js` | **Test del replicador exacto** | ⭐ PRINCIPAL - Validación completa | `../generators/PumaExactReplicator.js`, `docx` | 🚨 **CRÍTICO**: Imágenes extraídas en `./extracted_images/` |
| `testRealStructure.js` | Test de estructura real | ⭐ Validación de layout | `../generators/PumaRealStructureGenerator.js` | 🔄 Ejecutar análisis profundo primero |
| `validateExactSpecifications.js` | Validación de especificaciones exactas | ⭐ Control de calidad | `fs-extra`, generadores | 🔄 Ejecutar **después** de generar documentos |
| `testPumaReplication.js` | Test específico de replicación PUMA | ⭐ Pruebas PUMA | `../generators/PumaDocumentGenerator.js` | 🔄 Ejecutar análisis profundo primero |
| `testPumaWithImages.js` | Test con imágenes PUMA | 🖼️ Validación de imágenes | `../generators/`, `docx` | 🚨 **CRÍTICO**: Imágenes extraídas requeridas |
| `validateCorrections.js` | Validación de correcciones aplicadas | 🔧 Control de cambios | `fs-extra` | 🔄 Ejecutar **después** de generar documentos |

### ✅ VALIDADORES (src/validators/)
| Archivo | Función Principal | Uso con PUMA | 📋 Dependencias | ⚠️ Requisitos Previos |
|---------|------------------|--------------|------------------|----------------------|
| `finalValidation.cjs` | **Validación final completa** | ⭐ PRINCIPAL - Check final | `../generators/PumaExactReplicator.js` | 🚨 **CRÍTICO**: Ejecutar **después** de todo el flujo |
| `validateImageFormatting.cjs` | Validar formato de imágenes | ⭐ CRÍTICO - Posicionamiento | `fs`, `jszip`, `xmldom` | 🔄 Ejecutar **después** de análisis de imágenes |
| `validateBodyPositioning.cjs` | Validar posicionamiento del body | ⭐ Anti-desplazamiento | `fs`, `jszip` | 🔄 Ejecutar **después** de generar documentos |
| `validatePageStructure.cjs` | Validar estructura de páginas | ⭐ Layout correcto | `fs-extra`, `mammoth` | 🔄 Ejecutar **después** de generar documentos |
| `validateImageCropping.cjs` | Validar recorte de imágenes | 🖼️ Tamaños correctos | `fs-extra`, `sharp` | 🔄 Ejecutar **después** de extracción de imágenes |
| `validatePumaStructure.js` | Validar estructura específica PUMA | 🔧 Estructura interna | `fs-extra`, `mammoth` | 🔄 Ejecutar **después** de análisis profundo |

### 🎬 DEMOS (src/demos/)
| Archivo | Función Principal | Uso con PUMA | 📋 Dependencias | ⚠️ Requisitos Previos |
|---------|------------------|--------------|------------------|----------------------|
| `demoCompleteSystem.js` | **Demo completo del sistema** | ⭐ PRINCIPAL - End-to-end | Todos los generadores y analizadores | 🚨 **CRÍTICO**: Ejecutar flujo completo antes |
| `finalSystemDemo.cjs` | Demo final con todas las validaciones | ⭐ Sistema completo | Todos los validadores | 🚨 **CRÍTICO**: Ejecutar todos los pasos antes |
| `generarReporteEjemplo.js` | Generar reporte de ejemplo | 📋 Demostración | `../generators/` | 🔄 Ejecutar extracción de imágenes antes |
| `showImageSystem.cjs` | Mostrar estado del sistema de imágenes | 🖼️ Debug de imágenes | `fs-extra` | 🔄 Ejecutar **después** de extracción |

## � Cadenas de Dependencias y Orden de Ejecución

### 🚨 DEPENDENCIAS CRÍTICAS

#### Para Generadores (ORDEN OBLIGATORIO):
```bash
# 1. OBLIGATORIO: Extraer imágenes ANTES que cualquier generador
node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"

# 2. Ahora sí se pueden ejecutar los generadores
node src/generators/PumaExactReplicator.js        # ✅ Funcionará correctamente
node src/generators/PumaRealStructureGenerator.js  # ✅ Funcionará correctamente
```

#### Para Tests (ORDEN OBLIGATORIO):
```bash
# 1. REQUISITO: Imágenes extraídas
node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"

# 2. Ahora los tests funcionarán
node src/tests/testExactReplicator.js           # ✅ Encontrará las imágenes
node src/tests/testPumaWithImages.js           # ✅ Encontrará las imágenes
```

### 📋 MAPA DE DEPENDENCIAS COMPLETO

#### 🔄 **Flujo de Análisis** (Sin dependencias estrictas):
```
deepAnalyzePuma.js (INICIO) 
    ↓
    ├── analyzeImageFormatting.cjs
    ├── analyzePageStructure.js
    ├── analyzeHeaders.js
    └── scanDocx.js
```

#### 🖼️ **Flujo de Extracción** (CRÍTICO para generadores):
```
documentImageExtractor.cjs (OBLIGATORIO PRIMERO)
    ↓
    ├── PumaExactReplicator.js ← 🚨 REQUIERE IMÁGENES
    ├── PumaRealStructureGenerator.js ← 🚨 REQUIERE IMÁGENES  
    ├── testExactReplicator.js ← 🚨 REQUIERE IMÁGENES
    └── testPumaWithImages.js ← 🚨 REQUIERE IMÁGENES
```

#### ✅ **Flujo de Validación** (Ejecutar DESPUÉS de generar):
```
[Generadores ejecutados]
    ↓
    ├── validateImageFormatting.cjs
    ├── validateBodyPositioning.cjs
    ├── validatePageStructure.cjs
    └── finalValidation.cjs (ÚLTIMO)
```

### ⚠️ ERRORES COMUNES POR DEPENDENCIAS

#### ❌ **Error: "ENOENT: no such file or directory"**
```bash
# CAUSA: Intentar ejecutar generador sin extraer imágenes
node src/generators/PumaExactReplicator.js

# SOLUCIÓN: Ejecutar extractor primero
node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"
node src/generators/PumaExactReplicator.js
```

#### ❌ **Error: "Cannot find images in ./extracted_images/"**
```bash
# CAUSA: Directorio de imágenes no existe o está vacío
# SOLUCIÓN: Verificar que la extracción fue exitosa
ls ./extracted_images/  # Debe mostrar imágenes extraídas
```

#### ❌ **Error: "Module not found"**
```bash
# CAUSA: Dependencias de Node.js no instaladas
# SOLUCIÓN: Instalar dependencias
npm install
```

### 🎯 RUTAS DE EJECUCIÓN RECOMENDADAS

#### 🥇 **RUTA PRINCIPAL - Replicación Exacta**:
```bash
# 1. Análisis (opcional pero recomendado)
node src/analyzers/deepAnalyzePuma.js

# 2. Extracción (OBLIGATORIO)
node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"

# 3. Generación (PRINCIPAL)
node src/generators/PumaExactReplicator.js

# 4. Testing
node src/tests/testExactReplicator.js

# 5. Validación Final
node src/validators/finalValidation.cjs
```

#### 🥈 **RUTA ALTERNATIVA - Análisis Completo**:
```bash
# 1. Análisis completo del documento
node src/analyzers/deepAnalyzePuma.js
node src/analyzers/analyzeImageFormatting.cjs
node src/analyzers/analyzePageStructure.js

# 2. Extracción
node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"

# 3. Generación con estructura real
node src/generators/PumaRealStructureGenerator.js

# 4. Validación específica
node src/validators/validateImageFormatting.cjs
node src/validators/validatePageStructure.cjs
```

#### 🥉 **RUTA DE DEBUG - Desarrollo**:
```bash
# Para desarrolladores que necesitan entender el sistema
node src/analyzers/deepAnalyzePuma.js
node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"
node src/demos/showImageSystem.cjs
node src/generators/PumaExactReplicator.js
node src/validators/finalValidation.cjs
```

### 📦 DEPENDENCIAS DE NODE.JS POR CATEGORÍA

#### 🔧 **Dependencias Principales**:
```json
{
  "docx": "^8.5.0",           // ← Usado por TODOS los generadores
  "mammoth": "^1.6.0",       // ← Usado por TODOS los analizadores
  "fs-extra": "^11.2.0",     // ← Usado por TODOS los archivos
  "jszip": "^3.10.1",        // ← Usado por extractores y analizadores profundos
  "xmldom": "^0.6.0",        // ← Usado para análisis XML específico
  "sharp": "^0.33.0"         // ← Usado por validadores de imágenes
}
```

#### 🎯 **Archivos que NO requieren dependencias previas**:
- `src/analyzers/deepAnalyzePuma.js`
- `src/analyzers/scanDocx.js` 
- `src/analyzers/analyzePageStructure.js`
- `src/extractors/extractImages.js`
- `src/generators/createSample.js`

#### 🚨 **Archivos con dependencias críticas**:
- `src/generators/PumaExactReplicator.js` → **REQUIERE** `extracted_images/`
- `src/tests/testExactReplicator.js` → **REQUIERE** `extracted_images/`
- `src/tests/testPumaWithImages.js` → **REQUIERE** `extracted_images/`
- `src/validators/finalValidation.cjs` → **REQUIERE** todo el flujo previo

### 🔄 VERIFICAR DEPENDENCIAS ANTES DE EJECUTAR

#### ✅ **Comando de verificación rápida**:
```bash
# Verificar que existe el documento base
ls "uploads/PUMA MES 6 2025.docx"

# Verificar que existen las dependencias de Node.js
npm list docx mammoth fs-extra jszip

# Verificar que existe el directorio de imágenes (después de extracción)
ls ./extracted_images/
```

#### 🛠️ **Script de verificación automática**:
```bash
# Crear un script simple para verificar todo
echo "📋 Verificando dependencias del sistema PUMA..."
echo "✅ Documento base:" && ls "uploads/PUMA MES 6 2025.docx" 2>/dev/null || echo "❌ Documento no encontrado"
echo "✅ Imágenes extraídas:" && ls ./extracted_images/ 2>/dev/null || echo "⚠️ Imágenes no extraídas aún"
echo "✅ Dependencias Node.js:" && npm list --depth=0 | grep -E "(docx|mammoth|fs-extra)" || echo "❌ Faltan dependencias"
```

## 📋 Documentación Principal del Sistema PUMA
- 🎯 [**GENERADOR_PUMA_EXACTO.md**](./GENERADOR_PUMA_EXACTO.md) - Especificaciones del generador exacto
- 📊 [**ANALISIS_PUMA_COMPLETO.md**](./ANALISIS_PUMA_COMPLETO.md) - Análisis completo del documento PUMA
- 🔧 [**IMPLEMENTACION_COMPLETA_PUMA.md**](./IMPLEMENTACION_COMPLETA_PUMA.md) - Guía de implementación
- �️ [**FORMATO_IMAGENES_HEADER.md**](./FORMATO_IMAGENES_HEADER.md) - Sistema anti-desplazamiento de imágenes

### 📚 Documentación por Componentes
- �📋 [Guía de Estructura Completa](./src/ESTRUCTURA_ORGANIZADA.md)
- 🔄 [Documentación de Migración](./MIGRACION_COMPLETA.md)
- 📊 [Analizadores de Documentos](./src/analyzers/README.md)
- 🖼️ [Extractores de Imágenes](./src/extractors/README.md)
- 📝 [Generadores de Documentos](./src/generators/README.md)
- 🧪 [Tests y Pruebas](./src/tests/README.md)
- 🎬 [Demos del Sistema](./src/demos/README.md)
- ✅ [Validadores](./src/validators/README.md)

### 🔍 Documentación de Correcciones y Mejoras
- ✅ [**CORRECCIONES_PUMA.md**](./CORRECCIONES_PUMA.md) - Correcciones aplicadas
- 🏗️ [**CORRECCION_ESTRUCTURA_PAGINAS.md**](./CORRECCION_ESTRUCTURA_PAGINAS.md) - Corrección de estructura
- 📍 [**POSICIONAMIENTO_BODY_COMPLETADO.md**](./POSICIONAMIENTO_BODY_COMPLETADO.md) - Posicionamiento del body
- 🖼️ [**IMPLEMENTACION_FINAL_IMAGENES.md**](./IMPLEMENTACION_FINAL_IMAGENES.md) - Implementación final de imágenes
- ✂️ [**IMPLEMENTACION_RECORTES_IMAGENES.md**](./IMPLEMENTACION_RECORTES_IMAGENES.md) - Sistema de recortes

## 🎯 Flujo de Trabajo Recomendado para PUMA

### ⚠️ VERIFICACIÓN PREVIA OBLIGATORIA
```bash
# 0. Verificar que existe el documento base
ls "uploads/PUMA MES 6 2025.docx"  # ✅ Debe existir

# 0.1 Verificar dependencias de Node.js
npm install  # ✅ Instalar si es necesario
```

### 1. Análisis Inicial del Documento
```bash
# Paso 1: Análisis profundo (SIN dependencias previas)
node src/analyzers/deepAnalyzePuma.js

# Paso 2: Análisis de formato de imágenes (Ejecutar DESPUÉS del paso 1)
node src/analyzers/analyzeImageFormatting.cjs
```

### 2. Extracción de Recursos (🚨 CRÍTICO)
```bash
# 🚨 OBLIGATORIO: Extraer todas las imágenes del documento base
# ⚠️ TODOS los generadores dependen de este paso
node src/extractors/documentImageExtractor.cjs "uploads/PUMA MES 6 2025.docx"

# Verificar que se extrajeron correctamente
ls ./extracted_images/  # ✅ Debe mostrar archivos de imagen
```

### 3. Generación del Documento (✅ Ahora sí funcionará)
```bash
# Generar réplica exacta (RECOMENDADO)
# ✅ Funcionará porque ya existen las imágenes extraídas
node src/generators/PumaExactReplicator.js
```

### 4. Validación y Testing (🔄 Orden específico)
```bash
# Test completo del replicador (requiere imágenes extraídas)
node src/tests/testExactReplicator.js

# Validación específica de imágenes
node src/validators/validateImageFormatting.cjs

# Validación final (ejecutar AL FINAL)
node src/validators/finalValidation.cjs
```

### 5. Demo del Sistema Completo (🎬 Demostración final)
```bash
# Demostración end-to-end (requiere todo el flujo previo)
node src/demos/demoCompleteSystem.js
```

## Objetivo
Este repositorio permite procesar el documento **PUMA MES 6 2025.docx** y generar reportes Word con el formato estándar PUMA para diferentes empresas. El sistema está especializado en replicar exactamente la estructura, formato y posicionamiento de elementos del documento original.

### 🎯 Características Principales del Sistema PUMA:
- **Replicación Exacta**: Copia perfecta del formato y estructura del documento original
- **Sistema Anti-Desplazamiento**: Las imágenes se posicionan correctamente sin mover el contenido
- **Análisis Profundo**: Extracción detallada de todos los elementos del documento
- **Validación Completa**: Verificación automática de la fidelidad de la réplica
- **Extracción de Imágenes**: Manejo inteligente de imágenes con posicionamiento absoluto

## Lenguajes y Tecnologías
El lenguaje principal es JavaScript, utilizando Node.js como entorno de ejecución y ReactJS para la interfaz de usuario. El sistema está optimizado para trabajar con el formato PUMA específico y emplea bibliotecas especializadas para manipular archivos .docx con alta fidelidad.

### 🛠️ Stack Tecnológico para PUMA
- **Node.js** - Entorno de ejecución principal
- **docx.js** - Biblioteca principal para generación de documentos Word
- **mammoth** - Lectura y análisis de documentos .docx existentes  
- **sharp** - Procesamiento avanzado de imágenes
- **yauzl** - Extracción de archivos ZIP/DOCX
- **xml2js** - Parsing de XML para análisis profundo del formato

### JavaScript libraries and tools

Bibliotecas y herramientas JavaScript especializadas para el formato PUMA:

- **docx.js**: Biblioteca principal utilizada para la generación exacta del formato PUMA. [github repositorio](https://github.com/dolanmiu/docx)
- **mammoth**: Para el análisis profundo del documento PUMA original
- **sharp**: Procesamiento de imágenes con posicionamiento absoluto
- **Syncfusion JavaScript Word Processor**: Componente con interfaz gráfica (futuro)
- **Apryse JavaScript DOCX Editor SDK**: Para colaboración avanzada (futuro)

### 🔧 Herramientas de Desarrollo PUMA
- **ESLint** - Linting de código JavaScript
- **Prettier** - Formateo automático de código
- **Jest** - Framework de testing para validaciones
- **Makefile** - Automatización de tareas del sistema


# Proyecto y Configuración

## 🛠️ Librerías Seleccionadas

Después del análisis de opciones, se han seleccionado las siguientes librerías por su robustez y facilidad de uso:

### Principales
- **[docx](https://github.com/dolanmiu/docx)** - Generación y manipulación de documentos .docx con JavaScript/TypeScript
- **mammoth** - Lectura y extracción de contenido de archivos .docx existentes
- **sharp** - Procesamiento y optimización de imágenes de alta performance
- **express** - Framework web para crear la API REST
- **multer** - Middleware para manejo de archivos subidos

### Adicionales
- **joi** - Validación de esquemas de datos
- **fs-extra** - Operaciones de sistema de archivos mejoradas
- **helmet** - Seguridad para Express
- **cors** - Manejo de CORS
- **compression** - Compresión gzip

## 📁 Estructura del Proyecto

```
reporte_js/
├── src/
│   ├── controllers/          # Controladores de la aplicación
│   ├── services/            # Servicios de negocio
│   │   └── DocumentService.js
│   ├── routes/              # Definición de rutas de la API
│   │   ├── reportRoutes.js
│   │   └── templateRoutes.js
│   ├── utils/               # Utilidades y helpers
│   │   ├── validators.js
│   │   └── fileUtils.js
│   └── index.js             # Punto de entrada de la aplicación
├── templates/               # Plantillas de documentos Word
├── uploads/                 # Archivos subidos temporalmente
├── output/                  # Documentos generados
├── tests/                   # Pruebas unitarias e integración
├── package.json
├── Makefile                 # Comandos automatizados
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** v18.0.0 o superior
- **NPM** v9.0.0 o superior

### Configuración Rápida

```bash
# Clonar o navegar al directorio del proyecto
cd reporte_js

# Configuración automática (recomendado)
make setup
```

### Configuración Manual

```bash
# 1. Verificar dependencias del sistema
make check-deps

# 2. Instalar dependencias de Node.js
npm install

# 3. Copiar archivo de configuración
copy .env.example .env

# 4. Crear directorios necesarios
mkdir uploads templates output logs
```

### Variables de Entorno

Edita el archivo `.env` según tus necesidades:

```env
NODE_ENV=development
PORT=3000
UPLOAD_PATH=./uploads
TEMPLATE_PATH=./templates
OUTPUT_PATH=./output
MAX_FILE_SIZE=10485760
```

## ▶️ Ejecución

### Modo Desarrollo
```bash
make dev
# o
npm run dev
```

### Modo Producción
```bash
make start
# o
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📋 Comandos Disponibles

```bash
make help          # Mostrar todos los comandos disponibles
make setup          # Configuración inicial completa
make dev            # Ejecutar en modo desarrollo
make start          # Ejecutar en modo producción
make test           # Ejecutar pruebas
make lint           # Verificar código con ESLint
make format         # Formatear código con Prettier
make clean          # Limpiar archivos temporales
make check-deps     # Verificar dependencias del sistema
```

## 🔌 API Endpoints

### Reportes
- `POST /api/reports/create` - Crear nuevo reporte
- `GET /api/reports/list` - Listar reportes generados
- `GET /api/reports/download/:fileName` - Descargar reporte específico
- `DELETE /api/reports/:fileName` - Eliminar reporte
- `POST /api/reports/analyze-template` - Analizar formato de plantilla

### Plantillas
- `GET /api/templates/list` - Listar plantillas disponibles
- `POST /api/templates/upload` - Subir nueva plantilla
- `GET /api/templates/download/:fileName` - Descargar plantilla
- `DELETE /api/templates/:fileName` - Eliminar plantilla

### Sistema
- `GET /health` - Estado del servicio
- `GET /` - Información de la API

## 📤 Uso de la API

### Crear un Reporte

```bash
curl -X POST http://localhost:3000/api/reports/create \
  -F "title=Reporte Mensual" \
  -F "company=Mi Empresa" \
  -F "content=Contenido del reporte aquí..." \
  -F "images=@imagen1.jpg" \
  -F "images=@imagen2.png" \
  -F "template=@plantilla.docx"
```

### Listar Reportes Generados

```bash
curl http://localhost:3000/api/reports/list
```

## 🧪 Pruebas

```bash
# Ejecutar todas las pruebas
make test

# Ejecutar pruebas específicas
npm test -- basic.test.js
```

## 📝 Procesamiento de Archivos

### Formatos Soportados

#### Documentos
- **.docx** - Microsoft Word (recomendado)
- **.doc** - Microsoft Word (legacy)

#### Imágenes
- **JPG/JPEG** - Fotografías y gráficos
- **PNG** - Imágenes con transparencia
- **GIF** - Imágenes animadas
- **BMP** - Bitmaps

#### Texto
- **TXT** - Archivos de texto plano
- **JSON** - Datos estructurados

### Flujo de Procesamiento

1. **Carga de Archivos**: Los archivos se suben a través de la API
2. **Validación**: Se verifica tipo, tamaño y contenido
3. **Procesamiento de Imágenes**: Optimización y redimensionado con Sharp
4. **Lectura de Plantilla**: Extracción de formato con Mammoth (opcional)
5. **Generación**: Creación del documento con la librería docx
6. **Almacenamiento**: Guardado en el directorio de salida

## 🛡️ Seguridad y Limitaciones

- **Tamaño máximo de archivo**: 10MB por defecto
- **Tipos de archivo**: Validación estricta de extensiones
- **Sanitización**: Nombres de archivo y contenido
- **Headers de seguridad**: Implementados con Helmet
- **CORS**: Configurado para desarrollo

## 🔧 Troubleshooting

### Problemas Comunes

**Error: "Cannot find module"**
```bash
make clean
make install
```

**Puerto ocupado**
```bash
# Cambiar puerto en .env
PORT=3001
```

**Errores de permisos**
```bash
# En Windows, ejecutar como administrador
# En Linux/Mac
sudo chown -R $USER:$USER .
```

## 📈 Mejoras Futuras

- [ ] Interfaz web con React
- [ ] Soporte para más formatos de imagen
- [ ] Plantillas dinámicas con variables
- [ ] Integración con bases de datos
- [ ] Autenticación y autorización
- [ ] Logs estructurados
- [ ] Métricas y monitoreo
- [ ] Contenedorización con Docker

## 🖼️ Sistema de Formato de Imágenes Anti-Desplazamiento

**NUEVA FUNCIONALIDAD**: Las imágenes del header ahora se posicionan correctamente sin desplazar el contenido del documento.

### ✅ Características Implementadas:
- **TextWrappingType.NONE**: Imágenes "behind text" (detrás del texto)
- **Posicionamiento absoluto**: Coordenadas exactas del documento original
- **allowOverlap: true**: Permite superposición de imágenes
- **layoutInCell: true**: Mantiene imágenes dentro del header
- **Conversión EMU → puntos**: Mapeo preciso de coordenadas

### 📄 Archivos Relacionados:
- `src/analyzers/analyzeImageFormatting.cjs` - Analiza formato XML
- `src/validators/validateImageFormatting.cjs` - Valida implementación  
- `src/generators/PumaExactReplicator.js` - Aplica formato correcto
- `FORMATO_IMAGENES_HEADER.md` - Documentación detallada

### 🚀 Uso:
```bash
# Generar documento con formato aplicado
node src/tests/testExactReplicator.js

# Validar configuraciones
node src/validators/validateImageFormatting.cjs
```
