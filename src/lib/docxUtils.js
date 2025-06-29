/**
 * Librería Unificada de Utilidades para Documentos DOCX
 * 
 * Esta librería contiene funciones de utilidad compartidas para
 * análisis, generación y validación de documentos DOCX.
 * 
 * @version 1.0.0
 * @author PUMA Utilities System
 */

import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';

/**
 * Utilidades para manejo de archivos DOCX
 */
export class DocxUtils {
    /**
     * Verifica si un archivo es un DOCX válido
     */
    static async isValidDocx(filePath) {
        try {
            if (!await fs.pathExists(filePath)) {
                return false;
            }

            const zip = new AdmZip(filePath);
            const entries = zip.getEntries();
            
            // Verificar archivos esenciales
            const requiredFiles = [
                'word/document.xml',
                '_rels/.rels',
                '[Content_Types].xml'
            ];

            for (const file of requiredFiles) {
                const found = entries.some(entry => entry.entryName === file);
                if (!found) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Extrae información básica de un archivo DOCX
     */
    static async extractBasicInfo(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const zip = new AdmZip(filePath);
            const entries = zip.getEntries();

            return {
                nombre: path.basename(filePath),
                ruta: filePath,
                tamaño: stats.size,
                fechaModificacion: stats.mtime,
                archivosInternos: entries.length,
                valido: await this.isValidDocx(filePath)
            };
        } catch (error) {
            return {
                nombre: path.basename(filePath),
                ruta: filePath,
                error: error.message,
                valido: false
            };
        }
    }

    /**
     * Lista todos los archivos DOCX en un directorio
     */
    static async findDocxFiles(directory, recursive = false) {
        try {
            const files = [];
            const items = await fs.readdir(directory, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(directory, item.name);

                if (item.isFile() && path.extname(item.name).toLowerCase() === '.docx') {
                    files.push(fullPath);
                } else if (item.isDirectory() && recursive) {
                    const subFiles = await this.findDocxFiles(fullPath, recursive);
                    files.push(...subFiles);
                }
            }

            return files;
        } catch (error) {
            console.error(`Error al buscar archivos DOCX en ${directory}:`, error);
            return [];
        }
    }

    /**
     * Crea una copia de respaldo de un archivo DOCX
     */
    static async createBackup(filePath, backupDir = './backups') {
        try {
            await fs.ensureDir(backupDir);
            
            const fileName = path.basename(filePath, '.docx');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `${fileName}_backup_${timestamp}.docx`;
            const backupPath = path.join(backupDir, backupName);

            await fs.copy(filePath, backupPath);
            console.log(`✅ Respaldo creado: ${backupPath}`);

            return backupPath;
        } catch (error) {
            console.error('❌ Error al crear respaldo:', error);
            throw error;
        }
    }
}

/**
 * Utilidades para manejo de imágenes
 */
export class ImageUtils {
    /**
     * Verifica si un archivo es una imagen válida
     */
    static isValidImageFile(filePath) {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const ext = path.extname(filePath).toLowerCase();
        return validExtensions.includes(ext);
    }

    /**
     * Obtiene información básica de una imagen
     */
    static async getImageInfo(filePath) {
        try {
            if (!await fs.pathExists(filePath)) {
                throw new Error('Archivo de imagen no encontrado');
            }

            const stats = await fs.stat(filePath);
            
            return {
                nombre: path.basename(filePath),
                ruta: filePath,
                extension: path.extname(filePath),
                tamaño: stats.size,
                fechaModificacion: stats.mtime,
                valida: this.isValidImageFile(filePath)
            };
        } catch (error) {
            return {
                nombre: path.basename(filePath),
                ruta: filePath,
                error: error.message,
                valida: false
            };
        }
    }

    /**
     * Busca imágenes en un directorio
     */
    static async findImageFiles(directory, recursive = false) {
        try {
            const images = [];
            const items = await fs.readdir(directory, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(directory, item.name);

                if (item.isFile() && this.isValidImageFile(item.name)) {
                    images.push(fullPath);
                } else if (item.isDirectory() && recursive) {
                    const subImages = await this.findImageFiles(fullPath, recursive);
                    images.push(...subImages);
                }
            }

            return images;
        } catch (error) {
            console.error(`Error al buscar imágenes en ${directory}:`, error);
            return [];
        }
    }

    /**
     * Organiza imágenes por sesión basándose en nombres de archivo
     */
    static organizeImagesBySession(imagePaths) {
        const sessions = {};

        imagePaths.forEach(imagePath => {
            const fileName = path.basename(imagePath);
            
            // Intentar extraer información de sesión del nombre del archivo
            const sessionMatch = fileName.match(/session_(\d+)|sesion_(\d+)|(\d+)/i);
            
            if (sessionMatch) {
                const sessionNumber = sessionMatch[1] || sessionMatch[2] || sessionMatch[3];
                const sessionKey = `session_${sessionNumber}`;
                
                if (!sessions[sessionKey]) {
                    sessions[sessionKey] = [];
                }
                
                sessions[sessionKey].push(imagePath);
            } else {
                // Si no se puede determinar la sesión, agregar a una categoría general
                if (!sessions.general) {
                    sessions.general = [];
                }
                sessions.general.push(imagePath);
            }
        });

        return sessions;
    }
}

/**
 * Utilidades para conversiones y formatos
 */
export class FormatUtils {
    /**
     * Convierte EMUs (English Metric Units) a píxeles
     */
    static emuToPixels(emu) {
        // 1 EMU = 1/914400 inch, 1 inch = 96 pixels
        return Math.round(parseInt(emu) / 914400 * 96);
    }

    /**
     * Convierte píxeles a EMUs
     */
    static pixelsToEmu(pixels) {
        return Math.round(pixels * 914400 / 96);
    }

    /**
     * Convierte EMUs a puntos
     */
    static emuToPoints(emu) {
        // 1 EMU = 1/12700 point
        return Math.round(parseInt(emu) / 12700);
    }

    /**
     * Convierte puntos a EMUs
     */
    static pointsToEmu(points) {
        return Math.round(points * 12700);
    }

    /**
     * Convierte twips a píxeles
     */
    static twipsToPixels(twips) {
        // 1 twip = 1/1440 inch, 1 inch = 96 pixels
        return Math.round(parseInt(twips) / 1440 * 96);
    }

    /**
     * Convierte píxeles a twips
     */
    static pixelsToTwips(pixels) {
        return Math.round(pixels * 1440 / 96);
    }

    /**
     * Formatea bytes a una representación legible
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Formatea una fecha para nombres de archivo
     */
    static formatDateForFilename(date = new Date()) {
        return date.toISOString().replace(/[:.]/g, '-').split('.')[0];
    }

    /**
     * Genera un hash simple de una cadena
     */
    static simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
}

/**
 * Utilidades para logging y reportes
 */
export class LogUtils {
    /**
     * Crea un logger con formato consistente
     */
    static createLogger(context = 'DOCX') {
        return {
            info: (message) => console.log(`ℹ️ [${context}] ${message}`),
            success: (message) => console.log(`✅ [${context}] ${message}`),
            warning: (message) => console.log(`⚠️ [${context}] ${message}`),
            error: (message) => console.log(`❌ [${context}] ${message}`),
            debug: (message) => console.log(`🔍 [${context}] ${message}`)
        };
    }

    /**
     * Genera un reporte de progreso
     */
    static logProgress(current, total, operation = 'Procesando') {
        const percentage = Math.round((current / total) * 100);
        const bar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
        console.log(`🔄 ${operation}: [${bar}] ${percentage}% (${current}/${total})`);
    }

    /**
     * Mide el tiempo de ejecución de una función
     */
    static async measureTime(fn, label = 'Operación') {
        const start = Date.now();
        const result = await fn();
        const end = Date.now();
        const duration = end - start;
        
        console.log(`⏱️ ${label} completado en ${duration}ms`);
        
        return { result, duration };
    }

    /**
     * Guarda un log detallado en archivo
     */
    static async saveLogToFile(logData, outputPath = './logs') {
        try {
            await fs.ensureDir(outputPath);
            
            const timestamp = FormatUtils.formatDateForFilename();
            const fileName = `docx_operation_${timestamp}.log`;
            const filePath = path.join(outputPath, fileName);
            
            const logContent = {
                timestamp: new Date().toISOString(),
                data: logData,
                system: {
                    node: process.version,
                    platform: process.platform,
                    memory: process.memoryUsage()
                }
            };
            
            await fs.writeJson(filePath, logContent, { spaces: 2 });
            console.log(`📝 Log guardado en: ${filePath}`);
            
            return filePath;
        } catch (error) {
            console.error('❌ Error al guardar log:', error);
            throw error;
        }
    }
}

/**
 * Utilidades para validación de datos
 */
export class ValidationUtils {
    /**
     * Valida estructura de datos de documento
     */
    static validateDocumentData(data) {
        const errors = [];
        const warnings = [];

        if (!data) {
            errors.push('Datos de documento no proporcionados');
            return { valid: false, errors, warnings };
        }

        // Campos requeridos
        const requiredFields = ['empresa', 'actividad'];
        requiredFields.forEach(field => {
            if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
                errors.push(`Campo requerido faltante o inválido: ${field}`);
            }
        });

        // Campos recomendados
        const recommendedFields = ['fechaPeriodo', 'lugar', 'profesional'];
        recommendedFields.forEach(field => {
            if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
                warnings.push(`Campo recomendado faltante: ${field}`);
            }
        });

        // Validar sesiones
        if (data.sesiones) {
            if (!Array.isArray(data.sesiones)) {
                errors.push('Las sesiones deben ser un array');
            } else {
                data.sesiones.forEach((session, index) => {
                    if (!session.fecha) {
                        errors.push(`Sesión ${index + 1}: falta fecha`);
                    }
                    if (!session.participantes) {
                        warnings.push(`Sesión ${index + 1}: falta número de participantes`);
                    }
                });
            }
        } else {
            warnings.push('No se encontraron datos de sesiones');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Valida configuración de opciones
     */
    static validateOptions(options) {
        const errors = [];
        const warnings = [];

        if (!options) {
            return { valid: true, errors, warnings };
        }

        // Validar rutas
        if (options.extractedImagesPath && typeof options.extractedImagesPath !== 'string') {
            errors.push('extractedImagesPath debe ser una cadena');
        }

        if (options.outputPath && typeof options.outputPath !== 'string') {
            errors.push('outputPath debe ser una cadena');
        }

        // Validar tipos booleanos
        if (options.useRealImages !== undefined && typeof options.useRealImages !== 'boolean') {
            warnings.push('useRealImages debe ser un booleano');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Normaliza datos de entrada
     */
    static normalizeDocumentData(data) {
        if (!data) return {};

        const normalized = { ...data };

        // Normalizar cadenas
        const stringFields = ['empresa', 'actividad', 'fechaPeriodo', 'lugar', 'profesional'];
        stringFields.forEach(field => {
            if (normalized[field] && typeof normalized[field] === 'string') {
                normalized[field] = normalized[field].trim();
            }
        });

        // Normalizar sesiones
        if (normalized.sesiones && Array.isArray(normalized.sesiones)) {
            normalized.sesiones = normalized.sesiones.map(session => ({
                fecha: session.fecha ? session.fecha.trim() : '',
                cantidadPausas: session.cantidadPausas || '1',
                participantes: session.participantes ? session.participantes.toString().trim() : '0'
            }));
        }

        return normalized;
    }
}

export default {
    DocxUtils,
    ImageUtils,
    FormatUtils,
    LogUtils,
    ValidationUtils
};
