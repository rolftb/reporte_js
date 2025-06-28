# 📄 Especificación Técnica del Formato de Reporte

## 📖 **Resumen Ejecutivo**

Esta especificación define el formato estándar para reportes corporativos del **Programa de Calidad de Vida** de Mutual Asesorías. El documento describe la estructura, estilos, variables dinámicas y consideraciones técnicas necesarias para generar reportes profesionales automatizados en formato Microsoft Word (.docx).

## 📋 **Información General**

| Propiedad | Valor |
|-----------|-------|
| **Archivo de referencia** | `uploads/PUMA MES 6 2025.docx` |
| **Tipo de documento** | Reporte corporativo de actividades |
| **Organización** | Mutual Asesorías |
| **Programa** | Calidad de Vida Corporativa |
| **Formato objetivo** | Microsoft Word (.docx) |
| **Versión de spec** | 2.0 |
| **Última actualización** | Enero 2025 |

## 🎯 **Propósito y Alcance**

### Objetivos del Documento

- ✅ **Documentación de actividades:** Registro formal de programas de calidad de vida
- ✅ **Evidencia fotográfica:** Respaldo visual de las actividades realizadas
- ✅ **Compliance corporativo:** Cumplimiento de requisitos de reporte institucional
- ✅ **Automatización:** Base para generación automática de reportes

### Audiencia Objetivo

- 👥 **Desarrolladores:** Implementación de generadores automáticos
- 📊 **Supervisores:** Validación de formato y contenido
- 🏢 **Clientes corporativos:** Destinatarios finales de los reportes
- 📋 **Auditores:** Verificación de cumplimiento de estándares

## 🏗️ **Arquitectura del Documento**

### 📄 **Vista General de la Estructura**

```text
┌─────────────────────────────────────────────────────────────┐
│                    PÁGINA 1: PORTADA                       │
├─────────────────────────────────────────────────────────────┤
│ [1.1] Banda Superior de Logos                               │
│ [1.2] Banda de Identificación Corporativa                   │
│ [2.1] Tabla de Aspectos Técnicos                           │
├─────────────────────────────────────────────────────────────┤
│                PÁGINAS 2+: CONTENIDO                       │
├─────────────────────────────────────────────────────────────┤
│ [3.1] Header: Identificación (en todas las páginas)        │
│ [3.2] Tabla Principal de Registro Fotográfico              │
│   ├── [3.2.1] Título de Sección                           │
│   ├── [3.2.2] Datos de Actividad (izquierda)              │
│   └── [3.2.3] Grid Fotográfico 2x2 (derecha)              │
└─────────────────────────────────────────────────────────────┘
```

### 1. **Encabezado Principal (Primera Página)**

#### 1.1 Banda Superior de Logos

**📋 Estructura:** Tabla de 3 columnas, 1 fila  
**🎯 Propósito:** Identificación institucional y de programa

| Elemento | Tipo | Dimensiones | Alineación |
|----------|------|-------------|------------|
| `Logo_mutual.png` | Imagen | 120x60px aprox. | Izquierda |
| "Medios Verificadores" | Texto | - | Centro |
| `Logo_calidad_devida.png` | Imagen | 120x60px aprox. | Derecha |

**⚙️ Especificaciones técnicas:**

- Altura de fila: ~80px
- Bordes: Sin bordes visibles
- Padding: 10px en cada celda
- Font del texto central: Arial, 14pt, Bold

#### 1.2 Banda Inferior de Identificación

**📋 Estructura:** Tabla de 3 columnas, 1 fila  
**🎯 Propósito:** Identificación de la empresa cliente

| Elemento | Tipo | Contenido | Alineación |
|----------|------|-----------|------------|
| `Logo_mutual.png` | Imagen | Logo corporativo | Izquierda |
| Variable: `{nombre_empresa}` | Texto dinámico | Nombre de empresa cliente | Centro |
| `Logo_calidad_devida.png` | Imagen | Logo del programa | Derecha |

**⚙️ Especificaciones técnicas:**

- Font empresa: Arial, 16pt, Bold, Color: #003366
- Altura de fila: ~60px
- Background: Opcional (#F5F5F5)

### 2. **Sección: Aspectos Técnicos de la Actividad**

#### 2.1 Tabla de Información Técnica

**📋 Estructura:** Tabla de 2 columnas, 5 filas (1 header + 4 datos)  
**🎯 Propósito:** Detalles administrativos y técnicos de la actividad

| Campo | Tipo de Dato | Ejemplo | Validación |
|-------|--------------|---------|------------|
| **Título** | Header colspan=2 | "ASPECTOS TÉCNICOS DE LA ACTIVIDAD EN TERRENO" | Obligatorio |
| Nombre de la actividad | Texto | "Programa de Calidad de Vida" | Max 100 caracteres |
| Fecha | Rango de fechas | "Desde el 21 de mayo al 20 de junio" | Formato: DD/MM/AAAA |
| Lugar | Dirección | "Av. Pdte. Kennedy 5454" | Max 200 caracteres |
| Profesional a cargo | Texto | "Profesional área Calidad de Vida - Mutual Asesorías" | Max 150 caracteres |

**⚙️ Especificaciones de diseño:**

- Header: Background #003366, Texto blanco, Arial 12pt Bold
- Campos: Columna izquierda bold, derecha normal
- Bordes: 1px sólido #CCCCCC
- Ancho total: 100% de la página
- Distribución columnas: 40% | 60%

### 3. **Sección: Registro Fotográfico**

#### 3.1 Encabezado de Sección

**📍 Ubicación:** Presente en TODAS las páginas (header de página)  
**📋 Estructura:** Tabla compleja anidada

#### 3.2 Tabla Principal de Registro Fotográfico

**📋 Estructura:** 2 filas principales

##### Fila 1: Título

| Contenido | Especificación |
|-----------|----------------|
| "REGISTRO FOTOGRÁFICO DE LA ACTIVIDAD" | Colspan=2, Background #003366, Texto blanco, Arial 12pt Bold |

##### Fila 2: Contenido Mixto

**🔄 Subdivisión en dos áreas:**

##### Área A: Datos de la Actividad (Subtabla izquierda)

| Campo | Tipo | Ejemplo | Formato |
|-------|------|---------|---------|
| Fecha | Date | "27-05-2024" | DD-MM-AAAA |
| Cantidad de pausas | Número | "1" | Integer |
| Participantes pausa nº1 | Número | "16" | Integer |

**⚙️ Especificaciones Subtabla:**

- 3 filas x 2 columnas
- Ancho: 40% del contenedor padre
- Font: Arial 10pt
- Bordes internos: 1px #CCCCCC

##### Área B: Grid Fotográfico (Subtabla derecha)

**📋 Estructura:** 2x2 grid para 4 fotografías

| Posición | Dimensiones | Formato |
|----------|-------------|---------|
| Foto 1 (Superior izquierda) | 150x100px | JPG/PNG, máx 2MB |
| Foto 2 (Superior derecha) | 150x100px | JPG/PNG, máx 2MB |
| Foto 3 (Inferior izquierda) | 150x100px | JPG/PNG, máx 2MB |
| Foto 4 (Inferior derecha) | 150x100px | JPG/PNG, máx 2MB |

**⚙️ Especificaciones del Grid:**

- Espacio entre fotos: 5px
- Bordes de imagen: 1px sólido #CCCCCC
- Aspect ratio: 3:2 (landscape)
- Compresión automática si supera tamaño límite

## 🎨 **Guía de Estilo Corporativo**

### Colores Corporativos

- **Primary:** #003366 (Azul corporativo)
- **Secondary:** #F5F5F5 (Gris claro)
- **Accent:** #FFFFFF (Blanco)
- **Border:** #CCCCCC (Gris medio)

### Tipografía

- **Font principal:** Arial
- **Títulos principales:** 14pt Bold
- **Subtítulos:** 12pt Bold  
- **Texto normal:** 10pt Regular
- **Datos de tabla:** 10pt Regular

### Márgenes y Espaciado

- **Margen página:** 2.5cm todos los lados
- **Espaciado entre secciones:** 20px
- **Padding interno tablas:** 8px
- **Line height:** 1.2

## 💾 **Especificación de Variables de Template**

### Definición de Variables Dinámicas

```javascript
{
  // === DATOS CORPORATIVOS ===
  nombre_empresa: "String",           // Nombre de la empresa cliente
  
  // === DATOS DE ACTIVIDAD ===
  fecha_inicio: "DD/MM/AAAA",       // Fecha inicio actividad
  fecha_fin: "DD/MM/AAAA",          // Fecha fin actividad
  lugar_actividad: "String",         // Dirección/ubicación
  profesional_cargo: "String",       // Nombre del profesional
  
  // === DATOS DE REGISTRO ===
  fecha_registro: "DD-MM-AAAA",     // Fecha del registro fotográfico
  cantidad_pausas: "Integer",        // Número de pausas realizadas
  participantes_pausa1: "Integer",   // Participantes en pausa 1
  
  // === RECURSOS MULTIMEDIA ===
  foto1: "File/URL",                 // Imagen 1
  foto2: "File/URL",                 // Imagen 2
  foto3: "File/URL",                 // Imagen 3
  foto4: "File/URL"                  // Imagen 4
}
```

### 🔄 **Validaciones de Entrada**

| Variable | Tipo | Requerido | Validación | Valor por defecto |
|----------|------|-----------|------------|-------------------|
| `nombre_empresa` | String | ✅ | Max 100 chars | - |
| `fecha_inicio` | Date | ✅ | Formato DD/MM/AAAA | - |
| `fecha_fin` | Date | ✅ | >= fecha_inicio | - |
| `lugar_actividad` | String | ✅ | Max 200 chars | - |
| `profesional_cargo` | String | ✅ | Max 150 chars | - |
| `fecha_registro` | Date | ✅ | Formato DD-MM-AAAA | - |
| `cantidad_pausas` | Integer | ✅ | >= 1, <= 10 | 1 |
| `participantes_pausa1` | Integer | ✅ | >= 1, <= 999 | - |
| `foto1-4` | File | ❌ | JPG/PNG, max 5MB | placeholder.png |

## 🔧 **Consideraciones Técnicas para Implementación**

### Manejo de Imágenes

- **📏 Redimensionamiento:** Automático a 150x100px manteniendo aspect ratio
- **🗜️ Compresión:** JPEG calidad 85% para optimizar tamaño
- **🖼️ Fallback:** Imagen placeholder si no está disponible
- **✅ Validación:** Formatos soportados: JPG, PNG, BMP, WebP
- **⚡ Performance:** Procesamiento en background para archivos grandes

### Responsividad del Template

- **📱 Adaptabilidad:** Tabla fluida para diferentes tamaños de página
- **🔄 Escalado:** Logos proporcionales según ancho disponible
- **📊 Grid flexible:** Fotografías responsivas con breakpoints

### Performance y Optimización

- **⚡ Compresión:** Documento final optimizado para tamaño
- **✅ Validación previa:** Campos obligatorios antes de generar
- **🚀 Caching:** Logos corporativos en memoria para reutilización
- **📊 Métricas:** Tiempo de generación < 3 segundos

## 📱 **Casos de Uso y Escenarios**

### 🎯 **Escenario Principal: Generación Estándar**

**Input:** Datos de actividad completos + 4 fotografías  
**Procesamiento:** Validación, formato y optimización  
**Output:** Documento DOCX listo para distribución

**Flujo típico:**

1. 📝 Usuario completa formulario web
2. 🖼️ Carga 4 fotografías de la actividad
3. ⚙️ Sistema valida datos y procesa imágenes
4. 📄 Genera documento DOCX corporativo
5. ✅ Descarga automática del reporte

### 🔄 **Escenarios Alternativos**

#### Variación 1: Múltiples Pausas

- **Input:** cantidad_pausas > 1
- **Adaptación:** Tabla expandida con participantes por pausa
- **Límite:** Máximo 5 pausas diferentes

#### Variación 2: Fotografías Parciales

- **Input:** Menos de 4 fotografías
- **Adaptación:** Placeholders para espacios vacíos
- **Mensaje:** Indicador visual de foto faltante

#### Variación 3: Logos Personalizados

- **Input:** Logo corporativo específico del cliente
- **Adaptación:** Reemplazo dinámico de logos por defecto
- **Formato:** PNG/SVG con transparencia

### 📊 **Métricas de Calidad**

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Tiempo de generación** | < 3 segundos | Promedio por documento |
| **Tamaño del archivo** | < 2MB | Documento final comprimido |
| **Calidad de imagen** | 85% JPEG | Balance calidad/tamaño |
| **Compatibilidad** | Word 2016+ | Versiones soportadas |
| **Tasa de éxito** | > 99% | Documentos generados sin error |

## 🛠️ **Guía de Implementación Técnica**

### Stack Tecnológico Recomendado

```javascript
// Dependencias principales
{
  "docx": "^8.x",           // Generación de documentos Word
  "sharp": "^0.33.x",       // Procesamiento de imágenes
  "joi": "^17.x",           // Validación de schemas
  "fs-extra": "^11.x",      // Operaciones de archivos
  "moment": "^2.x"          // Manejo de fechas
}
```

### Estructura de Clases Sugerida

```javascript
class ReporteGenerator {
  // Configuración del template
  constructor(config)
  
  // Validación de entrada
  validateInput(data)
  
  // Procesamiento de imágenes
  processImages(images)
  
  // Generación del documento
  generateDocument(data)
  
  // Exportación del archivo
  exportToDisk(path)
}
```

### Patrones de Diseño Aplicables

- **🏭 Factory Pattern:** Para diferentes tipos de reporte
- **🔧 Builder Pattern:** Para construcción incremental del documento
- **🎯 Strategy Pattern:** Para diferentes formatos de salida
- **📋 Template Method:** Para estructura común de reportes

## 📚 **Referencias y Estándares**

### Documentación Técnica

- [Office Open XML File Formats](https://docs.microsoft.com/en-us/openspecs/office_file_formats/)
- [DOCX JavaScript Library Documentation](https://docx.js.org/)
- [Corporate Branding Guidelines - Mutual Asesorías](internal-link)

### Estándares de Calidad

- **ISO 8601:** Formato de fechas
- **WCAG 2.1:** Accesibilidad en documentos
- **ISO/IEC 27001:** Seguridad de la información

---

**📅 Última actualización:** Enero 2025  
**✍️ Versión:** 2.0  
**👤 Mantenedor:** Equipo de Desarrollo - Mutual Asesorías