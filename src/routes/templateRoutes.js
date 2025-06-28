import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

const router = express.Router();

// Configuración de Multer para plantillas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'templates/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /docx|doc/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .docx y .doc'));
    }
  }
});

/**
 * GET /api/templates/list
 * Listar todas las plantillas disponibles
 */
router.get('/list', async (req, res) => {
  try {
    const templatesDir = path.join(process.cwd(), 'templates');
    await fs.ensureDir(templatesDir);
    
    const files = await fs.readdir(templatesDir);
    const templates = [];
    
    for (const file of files) {
      if (path.extname(file).toLowerCase() === '.docx' || path.extname(file).toLowerCase() === '.doc') {
        const filePath = path.join(templatesDir, file);
        const stats = await fs.stat(filePath);
        
        templates.push({
          name: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        });
      }
    }
    
    res.json({
      message: 'Lista de plantillas obtenida exitosamente',
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error listando plantillas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * POST /api/templates/upload
 * Subir una nueva plantilla
 */
router.post('/upload', upload.single('template'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se proporcionó archivo de plantilla'
      });
    }

    res.json({
      message: 'Plantilla subida exitosamente',
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Error subiendo plantilla:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * DELETE /api/templates/:fileName
 * Eliminar una plantilla
 */
router.delete('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), 'templates', fileName);
    
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      return res.status(404).json({
        error: 'Plantilla no encontrada'
      });
    }
    
    await fs.remove(filePath);
    
    res.json({
      message: 'Plantilla eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando plantilla:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * GET /api/templates/download/:fileName
 * Descargar una plantilla específica
 */
router.get('/download/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), 'templates', fileName);
    
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      return res.status(404).json({
        error: 'Plantilla no encontrada'
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error descargando plantilla:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

export default router;
