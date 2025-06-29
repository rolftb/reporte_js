import DocumentService from '../services/DocumentService.js';
import { validateReportData } from '../utils/validators.js';

describe('DocumentService', () => {
  let documentService;

  beforeEach(() => {
    documentService = new DocumentService();
  });

  test('should create a basic document', async () => {
    const testData = {
      title: 'Reporte de Prueba',
      company: 'Empresa Test',
      content: 'Este es un contenido de prueba para el documento.',
      images: [],
      template: null
    };

    const result = await documentService.createDocument(testData);
    
    expect(result.success).toBe(true);
    expect(result.fileName).toBeDefined();
    expect(result.outputPath).toBeDefined();
  });

  test('should extract structure from HTML', () => {
    const html = '<h1>Título Principal</h1><h2>Subtítulo</h2><p>Contenido</p>';
    const structure = documentService.extractStructure(html);
    
    expect(structure).toHaveLength(2);
    expect(structure[0].type).toBe('heading');
    expect(structure[0].level).toBe(1);
    expect(structure[0].text).toBe('Título Principal');
  });
});

describe('Validators', () => {
  test('should validate report data correctly', () => {
    const validData = {
      title: 'Reporte Válido',
      company: 'Empresa Válida',
      content: 'Contenido válido'
    };

    const result = validateReportData(validData);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject invalid report data', () => {
    const invalidData = {
      title: '',
      company: '',
      content: 'x'.repeat(20000)
    };

    const result = validateReportData(invalidData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
