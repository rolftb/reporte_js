import Joi from 'joi';

/**
 * Valida los datos de entrada para crear un reporte
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de la validación
 */
export const validateReportData = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).required().messages({
      'string.empty': 'El título es requerido',
      'string.min': 'El título debe tener al menos 1 carácter',
      'string.max': 'El título no puede exceder 200 caracteres'
    }),
    company: Joi.string().min(1).max(100).required().messages({
      'string.empty': 'El nombre de la empresa es requerido',
      'string.min': 'El nombre de la empresa debe tener al menos 1 carácter',
      'string.max': 'El nombre de la empresa no puede exceder 100 caracteres'
    }),
    content: Joi.string().allow('').max(10000).messages({
      'string.max': 'El contenido no puede exceder 10000 caracteres'
    })
  });

  const { error, value } = schema.validate(data);
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : [],
    data: value
  };
};

/**
 * Valida los parámetros de configuración de imagen
 * @param {Object} options - Opciones de imagen
 * @returns {Object} Resultado de la validación
 */
export const validateImageOptions = (options) => {
  const schema = Joi.object({
    width: Joi.number().integer().min(100).max(2000).messages({
      'number.min': 'El ancho mínimo es 100 píxeles',
      'number.max': 'El ancho máximo es 2000 píxeles'
    }),
    height: Joi.number().integer().min(100).max(2000).messages({
      'number.min': 'La altura mínima es 100 píxeles',
      'number.max': 'La altura máxima es 2000 píxeles'
    }),
    quality: Joi.number().integer().min(10).max(100).default(90).messages({
      'number.min': 'La calidad mínima es 10',
      'number.max': 'La calidad máxima es 100'
    })
  });

  const { error, value } = schema.validate(options);
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : [],
    data: value
  };
};

/**
 * Valida que un archivo sea un tipo permitido
 * @param {string} fileName - Nombre del archivo
 * @param {Array} allowedTypes - Tipos de archivo permitidos
 * @returns {boolean} Si el archivo es válido
 */
export const validateFileType = (fileName, allowedTypes) => {
  const extension = fileName.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

/**
 * Valida el tamaño de archivo
 * @param {number} fileSize - Tamaño del archivo en bytes
 * @param {number} maxSize - Tamaño máximo permitido en bytes
 * @returns {boolean} Si el tamaño es válido
 */
export const validateFileSize = (fileSize, maxSize) => {
  return fileSize <= maxSize;
};
