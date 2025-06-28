import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs-extra';

async function testScan() {
  console.log('🔍 Probando escáner de DOCX...');
  
  const filePath = 'templates/prueba-simple.docx';
  
  try {
    console.log(`📄 Escaneando: ${filePath}`);
    
    // Verificar que el archivo existe
    const exists = await fs.pathExists(filePath);
    console.log(`✅ Archivo existe: ${exists}`);
    
    if (!exists) {
      console.log('❌ Archivo no encontrado');
      return;
    }
    
    // Leer con mammoth
    console.log('📖 Leyendo con mammoth...');
    const result = await mammoth.convertToHtml({ path: filePath });
    console.log('✅ HTML generado:', result.value);
    
    const textResult = await mammoth.extractRawText({ path: filePath });
    console.log('✅ Texto extraído:', textResult.value);
    
    // Estadísticas básicas
    const wordCount = textResult.value.split(/\s+/).filter(w => w.length > 0).length;
    console.log(`📊 Palabras: ${wordCount}`);
    
  } catch (error) {
    console.error('❌ Error en escáner:', error);
  }
}

testScan();
