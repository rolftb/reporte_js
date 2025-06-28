# 🎬 Demos y Demostraciones

Este directorio contiene scripts de demostración para mostrar las capacidades del sistema de documentos DOCX.

## 📋 Archivos

- **`demoCompleteSystem.js`** - Demostración completa del flujo de trabajo
- **`finalSystemDemo.cjs`** - Demo final del sistema operativo  
- **`showImageSystem.cjs`** - Muestra el estado actual del sistema de imágenes
- **`generarReporteEjemplo.js`** - Genera un reporte de Calidad de Vida de ejemplo

## 🎯 Demostraciones Disponibles

### Demo Completo del Sistema
```bash
node src/demos/demoCompleteSystem.js
```
**Muestra**: Flujo completo desde extracción hasta generación

### Estado del Sistema de Imágenes
```bash
node src/demos/showImageSystem.cjs
```
**Muestra**: Estado actual de imágenes extraídas y registro

### Demo Final del Sistema
```bash
node src/demos/finalSystemDemo.cjs
```
**Muestra**: Demostración del sistema completamente operativo

### Generar Reporte de Ejemplo
```bash
node src/demos/generarReporteEjemplo.js
```
**Muestra**: Generación completa de un reporte de Calidad de Vida con datos de ejemplo

## 📊 Propósito de Cada Demo

### Demo Completo
- Extracción de imágenes
- Generación con imágenes reales
- Generación con placeholders
- Comparación de resultados
- Verificación de no-duplicados

### Sistema de Imágenes
- Listado de imágenes disponibles
- Detalles del registro
- Instrucciones de uso
- Estado de archivos

### Demo Final
- Verificación de estado actual
- Demostración de extracción
- Análisis del sistema
- Instrucciones del generador

### Reporte de Ejemplo
- Generación de reportes
- Uso de datos simulados
- Formato de salida
- Ejemplo de análisis

## 🚀 Flujo de Demostración

### 1. Verificar Sistema
```bash
node src/demos/showImageSystem.cjs
```

### 2. Demo Completo
```bash
node src/demos/demoCompleteSystem.js
```

### 3. Verificar Resultados
Revisar archivos generados en `./output/`

## 📁 Archivos Generados

Las demos generan:
- Documentos DOCX de ejemplo
- Reportes de estado JSON
- Logs detallados de operaciones
- Comparaciones visuales

## 🎓 Para Nuevos Usuarios

**Secuencia recomendada**:
1. Ejecutar `showImageSystem.cjs` para ver estado actual
2. Ejecutar `demoCompleteSystem.js` para ver capacidades
3. Revisar documentos generados en `./output/`
4. Experimentar con tests específicos en `/src/tests/`

## 🔗 Relacionado

Las demos utilizan:
- **Extractores**: Para obtener imágenes
- **Generadores**: Para crear documentos
- **Tests**: Para validación
- **Analizadores**: Para mostrar información
