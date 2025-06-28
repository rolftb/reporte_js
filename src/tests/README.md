# 🧪 Tests y Pruebas

Este directorio contiene scripts de prueba para validar el funcionamiento de extractores, generadores y análisis.

## 📋 Archivos de Test

### Tests de Generadores
- **`testRealStructure.js`** - Prueba del generador con estructura real del PUMA
- **`testPumaWithImages.js`** - Prueba del generador tradicional con imágenes reales
- **`testPumaUpdated.js`** - Prueba del generador actualizado
- **`testPumaReplication.js`** - Prueba de replicación de estructura PUMA

### Tests de Carga de Imágenes
- **`testImageLoad.js`** - Prueba simple de carga de imágenes extraídas
- **`testDocument.js`** - Test general de generación de documentos
- **`testSimple.js`** - Test simplificado para verificación rápida

### Tests Básicos
- **`test-docx.js`** - Prueba básica de creación de documentos DOCX
- **`test-scan.js`** - Prueba básica del escáner de documentos
- **`basic.test.js`** - Tests unitarios formales con Jest

### Tests de Replicación
- **`testExactReplicator.js`** - 🆕 Genera replicación exacta del documento "PUMA MES 6 2025.docx"

## 🚀 Ejecución de Tests

### Test Recomendado (Estructura Real)
```bash
node src/tests/testRealStructure.js
```
**Qué hace**: Genera documento con estructura visual real del PUMA

### Test de Imágenes
```bash
node src/tests/testImageLoad.js
```
**Qué hace**: Verifica que las imágenes extraídas se cargan correctamente

### Test Completo con Imágenes
```bash
node src/tests/testPumaWithImages.js
```
**Qué hace**: Genera documentos con y sin imágenes reales para comparación

### Test Rápido
```bash
node src/tests/testSimple.js
```
**Qué hace**: Verificación rápida del sistema básico

### Test de Replicación Exacta (Nuevo)
```bash
node src/tests/testExactReplicator.js
```
**Qué hace**: Genera una replicación exacta del documento "PUMA MES 6 2025.docx" con todos los datos específicos extraídos

## 📊 Resultados de Tests

Todos los tests generan archivos en `./output/`:
- Documentos DOCX para verificación visual
- Logs detallados en consola
- Comparaciones entre versiones con/sin imágenes

### Ejemplo de Salida
```
✅ DOCUMENTO GENERADO EXITOSAMENTE
📁 Ubicación: ./output/puma_estructura_real_1234567890.docx
🎯 Imágenes de header: 2 cargadas
🖼️ Imágenes de documento: 16 distribuidas en 4 páginas
```

## 🔍 Validación Manual

Después de ejecutar tests, verificar:
1. **Header**: Debe mostrar logos, no solo texto
2. **Páginas**: Deben contener 4 imágenes máximo por página
3. **Imágenes**: Deben ser las extraídas del documento original
4. **Estructura**: Debe ser similar al documento original

## 🔗 Dependencias

Los tests requieren:
- **Imágenes extraídas**: Ejecutar primero extractores
- **Generadores**: Deben estar disponibles en `/src/generators/`
- **Registro de imágenes**: `./extracted_images/image_registry.json`

## 📝 Crear Nuevos Tests

### Template Básico
```javascript
import { PumaRealStructureGenerator } from '../generators/PumaRealStructureGenerator.js';
import { Packer } from 'docx';
import fs from 'fs-extra';

async function miNuevoTest() {
    console.log('🧪 MI NUEVO TEST');
    
    const generator = new PumaRealStructureGenerator(true);
    const doc = await generator.generateDocument();
    const buffer = await Packer.toBuffer(doc);
    
    const outputPath = `./output/mi_test_${Date.now()}.docx`;
    await fs.writeFile(outputPath, buffer);
    
    console.log(`✅ Test completado: ${outputPath}`);
}

miNuevoTest();
```

## 🎯 Propósito de Cada Test

- **Real Structure**: Validar estructura visual fiel al original
- **Image Load**: Confirmar carga correcta de imágenes extraídas  
- **Puma With Images**: Comparar generación con/sin imágenes
- **Simple**: Verificación rápida de funcionalidad básica
- **Document**: Test general de capacidades del generador
- **Exact Replicator**: Asegurar replicación exacta de documentos fuente
