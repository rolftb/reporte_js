import fs from 'fs-extra';
import path from 'path';

/**
 * Formatea el tamaño de archivo en formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Genera un nombre de archivo único
 * @param {string} baseName - Nombre base del archivo
 * @param {string} extension - Extensión del archivo
 * @returns {string} Nombre de archivo único
 */
export const generateUniqueFileName = (baseName, extension) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${cleanBaseName}_${timestamp}_${random}.${extension}`;
};

/**
 * Limpia y normaliza texto para usar en nombres de archivo
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
export const sanitizeFileName = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Crea un directorio si no existe
 * @param {string} dirPath - Ruta del directorio
 * @returns {Promise<void>}
 */
export const ensureDirectory = async (dirPath) => {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    console.error(`Error creando directorio ${dirPath}:`, error);
    throw error;
  }
};

/**
 * Elimina archivos antiguos de un directorio
 * @param {string} dirPath - Ruta del directorio
 * @param {number} maxAge - Edad máxima en milisegundos
 * @returns {Promise<number>} Número de archivos eliminados
 */
export const cleanOldFiles = async (dirPath, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const files = await fs.readdir(dirPath);
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (Date.now() - stats.mtime.getTime() > maxAge) {
        await fs.remove(filePath);
        deletedCount++;
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error(`Error limpiando archivos antiguos en ${dirPath}:`, error);
    return 0;
  }
};

/**
 * Verifica si un archivo existe
 * @param {string} filePath - Ruta del archivo
 * @returns {Promise<boolean>} Si el archivo existe
 */
export const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtiene información detallada de un archivo
 * @param {string} filePath - Ruta del archivo
 * @returns {Promise<Object>} Información del archivo
 */
export const getFileInfo = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const extension = path.extname(filePath).toLowerCase();
    
    return {
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size),
      extension,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    throw new Error(`No se pudo obtener información del archivo: ${error.message}`);
  }
};
