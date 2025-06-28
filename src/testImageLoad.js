/**
 * Generador simplificado para probar las imágenes
 */

import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } from 'docx';
import fs from 'fs-extra';
import path from 'path';

async function generateSimpleDocWithImages() {
    console.log('🧪 Generando documento simple con imágenes...');
    
    try {
        // Cargar el registro de imágenes
        const registryPath = './extracted_images/image_registry.json';
        const registry = await fs.readJson(registryPath);
        
        console.log(`📋 Cargando registro: ${Object.keys(registry).length} imágenes`);
        
        // Recopilar algunas imágenes para prueba
        const images = Object.values(registry).slice(0, 5); // Tomar las primeras 5
        
        console.log('🖼️ Imágenes seleccionadas:');
        images.forEach((img, index) => {
            console.log(`   ${index + 1}. ${img.fileName}`);
        });
        
        // Crear párrafos con imágenes
        const paragraphs = [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "DOCUMENTO DE PRUEBA CON IMÁGENES REALES",
                        bold: true,
                        size: 28
                    })
                ]
            }),
            new Paragraph({ children: [new TextRun("")] }) // Línea vacía
        ];
        
        // Agregar cada imagen
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const imagePath = path.join('./extracted_images', img.fileName);
            
            console.log(`📸 Procesando imagen: ${imagePath}`);
            
            if (await fs.pathExists(imagePath)) {
                const imageBuffer = await fs.readFile(imagePath);
                
                // Párrafo con título de la imagen
                paragraphs.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: `Imagen ${i + 1}: ${img.fileName}`,
                                bold: true,
                                size: 16
                            })
                        ]
                    })
                );
                
                // Párrafo con la imagen
                paragraphs.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: imageBuffer,
                                transformation: {
                                    width: 300,
                                    height: 200
                                }
                            })
                        ]
                    })
                );
                
                // Línea vacía
                paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
                
                console.log(`✅ Imagen agregada: ${img.fileName}`);
            } else {
                console.warn(`⚠️ Imagen no encontrada: ${imagePath}`);
                
                paragraphs.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: `❌ Error: Imagen no encontrada - ${img.fileName}`,
                                color: "FF0000"
                            })
                        ]
                    })
                );
            }
        }
        
        // Crear documento
        const doc = new Document({
            sections: [{
                children: paragraphs
            }]
        });
        
        // Generar buffer
        const buffer = await Packer.toBuffer(doc);
        
        // Guardar archivo
        const outputPath = `./output/prueba_imagenes_${Date.now()}.docx`;
        await fs.writeFile(outputPath, buffer);
        
        console.log('\n✅ DOCUMENTO GENERADO EXITOSAMENTE');
        console.log(`📁 Ubicación: ${outputPath}`);
        console.log('\n🔍 VERIFICACIONES:');
        console.log('   1. Abrir el documento');
        console.log('   2. Verificar que las imágenes se muestran correctamente');
        console.log('   3. Confirmar que no hay errores de carga');
        
        return outputPath;
        
    } catch (error) {
        console.error('❌ ERROR:', error);
        throw error;
    }
}

generateSimpleDocWithImages();
