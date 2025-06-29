# Documentación para Desarrolladores

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
src/
├── controllers/     # Controladores de la aplicación
├── services/        # Servicios de negocio (lógica principal)
├── routes/          # Definición de rutas de la API
├── utils/           # Utilidades y helpers
└── index.js         # Punto de entrada
```

### Flujo de Datos
```
Cliente → Express Routes → Controllers → Services → Document Generation
```

## 🔧 Servicios Principales

### DocumentService
Servicio principal para manejo de documentos Word.

**Métodos principales:**
- `createDocument(data)` - Crear nuevo documento
- `readDocxFile(filePath)` - Leer archivo DOCX existente
- `processImage(imagePath, options)` - Procesar imágenes
- `analyzeTemplate(templatePath)` - Analizar plantillas
- `listGeneratedDocuments()` - Listar documentos

### ReportController
Controlador que maneja las solicitudes HTTP.

**Endpoints:**
- `POST /api/reports/create` - Crear reporte
- `GET /api/reports/list` - Listar reportes
- `GET /api/reports/download/:fileName` - Descargar
- `DELETE /api/reports/:fileName` - Eliminar

## 📚 Librerías Utilizadas

### Principales
- **docx**: Generación de documentos Word
- **mammoth**: Lectura de archivos DOCX
- **sharp**: Procesamiento de imágenes
- **express**: Framework web
- **multer**: Manejo de archivos

### Utilidades
- **joi**: Validación de datos
- **fs-extra**: Operaciones de archivos
- **uuid**: Generación de IDs únicos

## 🔍 Validaciones

### Datos de Entrada
```javascript
const schema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  company: Joi.string().min(1).max(100).required(),
  content: Joi.string().allow('').max(10000)
});
```

### Archivos
- **Tamaño máximo**: 10MB
- **Tipos permitidos**: .docx, .doc, .jpg, .jpeg, .png, .gif, .bmp
- **Validación de extensión y MIME type**

## 🧪 Testing

### Ejecutar Pruebas
```bash
npm test
```

### Prueba Manual
```bash
node src/testDocument.js
```

### Estructura de Pruebas
```
tests/
├── basic.test.js           # Pruebas básicas
├── integration.test.js     # Pruebas de integración
└── api.test.js            # Pruebas de API
```

## 🔧 Configuración

### Variables de Entorno (.env)
```env
NODE_ENV=development
PORT=3000
UPLOAD_PATH=./uploads
TEMPLATE_PATH=./templates
OUTPUT_PATH=./output
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,bmp
ALLOWED_DOCUMENT_TYPES=docx,doc
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### Configuración de Multer
```javascript
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
```

## 📝 Generación de Documentos

### Estructura Básica
```javascript
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER
      }),
      // ... más contenido
    ]
  }]
});
```

### Inserción de Imágenes
```javascript
new Paragraph({
  children: [
    new ImageRun({
      data: imageBuffer,
      transformation: {
        width: 400,
        height: 300,
      },
    })
  ],
  alignment: AlignmentType.CENTER
});
```

## 🔄 Flujo de Procesamiento

### 1. Recepción de Datos
- Validación de entrada
- Procesamiento de archivos subidos
- Sanitización de datos

### 2. Procesamiento de Imágenes
- Redimensionado con Sharp
- Optimización de calidad
- Conversión de formato si es necesario

### 3. Lectura de Plantilla (opcional)
- Extracción de contenido con Mammoth
- Análisis de estructura
- Preservación de formato

### 4. Generación del Documento
- Creación de estructura con docx
- Inserción de contenido
- Aplicación de formato

### 5. Almacenamiento
- Guardado en directorio output
- Generación de metadatos
- Limpieza de archivos temporales

## 🚀 Extensiones Futuras

### Mejoras Planificadas
1. **Plantillas Dinámicas**: Variables reemplazables
2. **Más Formatos**: PDF, HTML export
3. **Base de Datos**: Persistencia de metadatos
4. **Autenticación**: JWT tokens
5. **Caching**: Redis para archivos frecuentes
6. **Webhooks**: Notificaciones de completado

### Estructura para Extensiones
```
src/
├── middleware/      # Autenticación, rate limiting
├── models/          # Modelos de datos
├── config/          # Configuraciones
└── plugins/         # Extensiones modulares
```

## 🐛 Debugging

### Logs
- **Desarrollo**: Console + archivo
- **Producción**: Solo archivo
- **Niveles**: error, warn, info, debug

### Herramientas Recomendadas
- **VS Code Debugger**: Configurado en .vscode/launch.json
- **Postman**: Para testing de API
- **Jest**: Para pruebas automatizadas

### Comandos Útiles
```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Debugging con inspector
node --inspect src/index.js

# Análisis de memoria
node --inspect --trace-gc src/index.js
```

## 📊 Performance

### Métricas Clave
- **Tiempo de generación**: < 5 segundos por documento
- **Memoria**: < 500MB para archivos de 50MB
- **Concurrencia**: 10 documentos simultáneos

### Optimizaciones
- Stream processing para archivos grandes
- Compresión de imágenes automática
- Cache de plantillas frecuentes
- Limpieza automática de archivos temporales

## 🔒 Seguridad

### Validaciones Implementadas
- Tipo de archivo por extensión y MIME
- Tamaño máximo de archivos
- Sanitización de nombres de archivo
- Validación de rutas

### Mejoras de Seguridad Recomendadas
- Rate limiting por IP
- Autenticación JWT
- Escaneo de malware en archivos
- Logs de auditoría
- HTTPS obligatorio en producción
