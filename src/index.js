import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

// Importar rutas
import reportRoutes from './routes/reportRoutes.js';
import templateRoutes from './routes/templateRoutes.js';

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad y configuración
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/output', express.static(path.join(__dirname, '../output')));

// Asegurar que los directorios existan
const ensureDirectories = async () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../output'),
    path.join(__dirname, '../templates'),
    path.join(__dirname, '../logs')
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
};

// Rutas de la API
app.use('/api/reports', reportRoutes);
app.use('/api/templates', templateRoutes);

// Ruta de salud del servicio
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Reporteador de Empresas funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API Reporteador de Empresas',
    version: '1.0.0',
    endpoints: {
      reports: '/api/reports',
      templates: '/api/templates',
      health: '/health'
    }
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor',
      status: err.status || 500
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Ruta no encontrada',
      status: 404
    }
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    await ensureDirectories();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}`);
      console.log(`💚 Health check en http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
