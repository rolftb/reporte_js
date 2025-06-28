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


# Proyecto y pasos
## Instalación y Configuración
Se apoyará de un archivo que permite ejecutar las configuaraciones desde la terminal de comandos.
## Instalación de javaScript
### Instalación de Node.js
### Instalación de React.js
### Instalación de dependencias librerías
Las dependencias se instalarán mediante el gestor de paquetes npm, ejecutando el siguiente comando en la terminal:
### Cargar los archivos de configuración
#### Archivo docx que será escaneado y copiado su formato en el nuevo archivo, para ser procesado con javaScript.
#### Archivo de texto que contiene la información a procesar y generar el reporte.
#### Archivo de imagen que será insertada en el reporte.

## Procesamiento de Archivos
Esto se realizará en varias etapas, para cada una de ellas se presenta un archivo javaScript que contiene el código necesario para llevar a cabo la tarea y se ejecutará en el entorno de Node.js.
### Lectura del archivo docx
Se utilizará una biblioteca específica para leer el archivo .docx y extraer su formato.
### Procesamiento del archivo de texto
Se leerá el archivo de texto y se procesará su contenido para generar el reporte.
### Inserción de imágenes
Se utilizará una biblioteca para insertar imágenes en el documento Word generado.
