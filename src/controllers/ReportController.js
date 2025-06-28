import DocumentService from '../services/DocumentService.js';

class ReportController {
  constructor() {
    this.documentService = new DocumentService();
  }

  /**
   * Controlador para crear un nuevo reporte
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createReport(req, res) {
    try {
      const { title, company, content } = req.body;
      const files = req.files || {};
      
      // Validar datos requeridos
      if (!title || !company) {
        return res.status(400).json({
          error: 'Título y empresa son campos requeridos'
        });
      }

      // Procesar archivos subidos
      const templateFile = files.template ? files.template[0].path : null;
      const imageFiles = files.images ? files.images.map(file => file.path) : [];
      
      // Leer archivo de texto si existe
      let textContent = content || '';
      if (files.textFile) {
        const fs = await import('fs-extra');
        textContent = await fs.readFile(files.textFile[0].path, 'utf-8');
      }

      // Crear el documento
      const result = await this.documentService.createDocument({
        title,
        company,
        content: textContent,
        images: imageFiles,
        template: templateFile
      });

      res.status(201).json({
        success: true,
        message: 'Reporte creado exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error en createReport:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * Controlador para listar reportes generados
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async listReports(req, res) {
    try {
      const documents = await this.documentService.listGeneratedDocuments();
      
      res.json({
        success: true,
        message: 'Lista de reportes obtenida exitosamente',
        data: documents,
        count: documents.length
      });
    } catch (error) {
      console.error('Error en listReports:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * Controlador para descargar un reporte
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async downloadReport(req, res) {
    try {
      const { fileName } = req.params;
      const path = await import('path');
      const fs = await import('fs-extra');
      
      const filePath = path.join(process.cwd(), 'output', fileName);
      
      // Verificar que el archivo existe
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        return res.status(404).json({
          success: false,
          error: 'Archivo no encontrado'
        });
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Enviar archivo
      res.sendFile(filePath);
      
    } catch (error) {
      console.error('Error en downloadReport:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * Controlador para eliminar un reporte
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteReport(req, res) {
    try {
      const { fileName } = req.params;
      
      const success = await this.documentService.deleteDocument(fileName);
      
      if (success) {
        res.json({
          success: true,
          message: 'Reporte eliminado exitosamente'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Reporte no encontrado'
        });
      }
    } catch (error) {
      console.error('Error en deleteReport:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * Controlador para analizar plantilla
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async analyzeTemplate(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó archivo de plantilla'
        });
      }

      const analysis = await this.documentService.analyzeTemplate(req.file.path);
      
      res.json({
        success: true,
        message: 'Análisis de plantilla completado',
        data: analysis
      });
    } catch (error) {
      console.error('Error en analyzeTemplate:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
}

export default ReportController;
