import express from 'express';
import multer from 'multer';
import path from 'path';
import DocumentService from '../services/DocumentService.js';
import { validateReportData } from '../utils/validators.js';

const router = express.Router();
const documentService = new DocumentService();

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir imágenes y documentos Word
    const allowedTypes = /jpeg|jpg|png|gif|bmp|docx|doc/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

/**
 * POST /api/reports/create
 * Crear un nuevo reporte
 */
router.post('/create', upload.fields([
  { name: 'template', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'textFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, company, content } = req.body;
    
    // Validar datos de entrada
    const validation = validateReportData({ title, company, content });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: validation.errors
      });
    }

    // Procesar archivos subidos
    const files = req.files || {};
    const templateFile = files.template ? files.template[0].path : null;
    const imageFiles = files.images ? files.images.map(file => file.path) : [];
    
    // Si hay un archivo de texto, leerlo
    let textContent = content || '';
    if (files.textFile) {
      const fs = await import('fs-extra');
      textContent = await fs.readFile(files.textFile[0].path, 'utf-8');
    }

    // Crear el documento
    const result = await documentService.createDocument({
      title,
      company,
      content: textContent,
      images: imageFiles,
      template: templateFile
    });

    res.json({
      message: 'Reporte creado exitosamente',
      data: result
    });

  } catch (error) {
    console.error('Error creando reporte:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * GET /api/reports/list
 * Listar todos los reportes generados
 */
router.get('/list', async (req, res) => {
  try {
    const documents = await documentService.listGeneratedDocuments();
    
    res.json({
      message: 'Lista de reportes obtenida exitosamente',
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error listando reportes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * GET /api/reports/download/:fileName
 * Descargar un reporte específico
 */
router.get('/download/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), 'output', fileName);
    
    // Verificar que el archivo existe
    const fs = await import('fs-extra');
    const exists = await fs.pathExists(filePath);
    
    if (!exists) {
      return res.status(404).json({
        error: 'Archivo no encontrado'
      });
    }

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar archivo
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Error descargando reporte:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * DELETE /api/reports/:fileName
 * Eliminar un reporte específico
 */
router.delete('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    const success = await documentService.deleteDocument(fileName);
    
    if (success) {
      res.json({
        message: 'Reporte eliminado exitosamente'
      });
    } else {
      res.status(404).json({
        error: 'Reporte no encontrado'
      });
    }
  } catch (error) {
    console.error('Error eliminando reporte:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * POST /api/reports/analyze-template
 * Analizar el formato de una plantilla
 */
router.post('/analyze-template', upload.single('template'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se proporcionó archivo de plantilla'
      });
    }

    const analysis = await documentService.analyzeTemplate(req.file.path);
    
    res.json({
      message: 'Análisis de plantilla completado',
      data: analysis
    });
  } catch (error) {
    console.error('Error analizando plantilla:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

export default router;
