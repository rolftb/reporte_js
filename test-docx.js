import { Document, Packer, Paragraph, TextRun } from 'docx';
import fs from 'fs-extra';

async function testDocx() {
  console.log('🧪 Probando creación de documento DOCX...');
  
  try {
    // Crear documento simple
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Hola Mundo - Prueba DOCX",
                size: 28,
                bold: true
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Documento creado el: ${new Date().toLocaleString('es-ES')}`,
                size: 24
              })
            ]
          })
        ]
      }]
    });
    
    // Crear directorio si no existe
    await fs.ensureDir('templates');
    console.log('✅ Directorio templates verificado');
    
    // Generar archivo
    const buffer = await Packer.toBuffer(doc);
    console.log(`✅ Buffer generado: ${buffer.length} bytes`);
    
    const outputPath = 'templates/prueba-simple.docx';
    await fs.writeFile(outputPath, buffer);
    console.log(`✅ Archivo guardado: ${outputPath}`);
    
    // Verificar que el archivo se creó
    const exists = await fs.pathExists(outputPath);
    console.log(`✅ Archivo existe: ${exists}`);
    
    if (exists) {
      const stats = await fs.stat(outputPath);
      console.log(`📊 Tamaño del archivo: ${stats.size} bytes`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDocx();
