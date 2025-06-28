# 📄 Guía de Uso - Escáner de Documentos DOCX

## 🚀 Configuración Inicial

### 1. Instalación Automática
```bash
# Ejecutar configuración completa
setup.bat

# O paso a paso:
setup.bat check-deps    # Verificar dependencias
setup.bat install       # Instalar paquetes
```

### 2. Verificar Instalación
```bash
setup.bat help
```

## 📝 Crear Documentos de Ejemplo

### Generar Documento de Prueba
```bash
setup.bat create-sample
```

Esto creará `templates/documento-ejemplo-analisis.docx` con:
- ✅ Estructura jerárquica de encabezados
- ✅ Tablas con datos técnicos
- ✅ Párrafos con diferentes formatos
- ✅ Contenido de ejemplo completo

## 🔍 Escanear Documentos DOCX

### Uso Básico
```bash
# Escanear documento específico
setup.bat scan ruta\del\archivo.docx

# Ejemplos:
setup.bat scan templates\documento-ejemplo-analisis.docx
setup.bat scan C:\Users\Usuario\Documentos\mi-archivo.docx
```

### Uso Directo con Node.js
```bash
node src\scanDocx.js templates\mi-documento.docx
```

## 📊 Resultados del Análisis

### Información Extraída
El escáner analiza y extrae:

1. **📈 Estadísticas del Documento**
   - Número de palabras
   - Número de caracteres
   - Número de párrafos

2. **🏗️ Estructura del Documento**
   - Encabezados jerárquicos (H1, H2, H3, etc.)
   - Organización del contenido

3. **🔍 Elementos Detectados**
   - ✅ Presencia de imágenes
   - ✅ Presencia de tablas
   - ✅ Estilos aplicados

4. **📄 Contenido**
   - Texto completo extraído
   - Muestra de los primeros 500 caracteres
   - Texto limpio sin formato

### Archivo de Resultados
Los resultados se guardan automáticamente en:
```
output/analisis_[nombre-archivo]_[timestamp].json
```

### Ejemplo de Salida
```json
{
  "archivo": "templates/documento-ejemplo-analisis.docx",
  "fecha_analisis": "2025-06-28T21:38:11.629Z",
  "estadisticas": {
    "palabras": 168,
    "caracteres": 1138,
    "paragrafos": 31
  },
  "estructura": [
    {
      "type": "heading",
      "level": 1,
      "text": "1. Introducción"
    }
  ],
  "tiene_imagenes": false,
  "tiene_tablas": true,
  "muestra_contenido": "Documento de Ejemplo...",
  "mensajes": []
}
```

## 🛠️ Formatos Soportados

### Documentos
- **.docx** - Microsoft Word 2007+ (recomendado)
- **.doc** - Microsoft Word 97-2003 (compatible)

### Características Detectadas
- ✅ **Texto**: Contenido completo con formato
- ✅ **Encabezados**: H1, H2, H3, H4, H5, H6
- ✅ **Tablas**: Estructura y contenido
- ✅ **Imágenes**: Presencia detectada
- ✅ **Estilos**: Formatos aplicados
- ✅ **Párrafos**: Estructura del documento

## 🔧 Solución de Problemas

### Errores Comunes

**❌ "Archivo no encontrado"**
```bash
# Verificar ruta del archivo
dir templates\
# Usar ruta absoluta si es necesario
setup.bat scan "C:\ruta\completa\archivo.docx"
```

**❌ "Tipo de archivo no permitido"**
```bash
# Verificar extensión del archivo
# Solo se permiten .docx y .doc
```

**❌ "Node.js no instalado"**
```bash
# Descargar e instalar desde: https://nodejs.org
setup.bat check-deps
```

### Archivos de Log
Los errores se registran en:
- `logs/app.log` (en modo servidor)
- Consola (en modo directo)

## 📚 Ejemplos Avanzados

### Escanear Múltiples Archivos
```bash
# Crear script batch personalizado
for %%f in (templates\*.docx) do setup.bat scan "%%f"
```

### Integración con API
```bash
# Iniciar servidor
setup.bat dev

# Usar endpoints HTTP
POST http://localhost:3000/api/reports/analyze-template
```

### Automatización
```bash
# Script de procesamiento automatizado
setup.bat create-sample
setup.bat scan templates\documento-ejemplo-analisis.docx
```

## 🎯 Casos de Uso

### 1. Análisis de Plantillas Corporativas
- Extraer estructura de documentos existentes
- Identificar patrones de formato
- Replicar estructura en nuevos documentos

### 2. Migración de Documentos
- Analizar documentos legacy
- Extraer contenido para migración
- Validar estructura después de conversión

### 3. Control de Calidad
- Verificar completitud de documentos
- Validar estructura requerida
- Detectar elementos faltantes

### 4. Generación de Reportes
- Crear reportes automáticos de análisis
- Estadísticas de uso de documentos
- Auditoría de contenido

## 🚀 Próximos Pasos

Después de dominar el escáner básico:
1. **Usar la API REST** para integración web
2. **Crear plantillas personalizadas** con el generador
3. **Desarrollar flujos automatizados** de procesamiento
4. **Integrar con sistemas externos** via webhooks

¿Necesitas ayuda? Usa `setup.bat help` para ver todos los comandos disponibles.
