# Reporteador de Empresas

## Objetivo
Este repositorio permite procesar texto e imágenes y generar reportes Word con un formato estándar para diferentes empresas.

## Lenguajes y Tecnologías
El lenaguaje principal es JavaScript, utilizando Node.js como entorno de ejecución y reactjs para la interfaz de usuario. También se emplean bibliotecas y herramientas específicas para manipular archivos .docx.
### JavaScript libraries and tools

Aquí tienes un listado de bibliotecas y herramientas JavaScript para editar archivos .doc

- **Syncfusion JavaScript Word Processor**: Componente con interfaz gráfica que permite crear, editar, visualizar e imprimir documentos Word.
- **Docx.js Editor**: Entorno interactivo para generar y modificar archivos .docx con JavaScript, compatible tanto con Node como con navegadores.
- **docx.js**: Biblioteca que facilita la generación y modificación de documentos .docx usando JavaScript/TypeScript. [github repositorio](https://github.com/dolanmiu/docx)
- **Apryse JavaScript DOCX Editor SDK**: Permite la colaboración segura en archivos DOCX integrando capacidades de edición nativas en aplicaciones web.
- Docxtemplater


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
