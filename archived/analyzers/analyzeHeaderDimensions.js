/**
 * Analizador específico para obtener dimensiones exactas de imágenes en headers
 */

import AdmZip from 'adm-zip';
import { DOMParser } from 'xmldom';
import fs from 'fs-extra';

async function analyzeHeaderDimensions() {
    console.log('🔍 ANÁLISIS DE DIMENSIONES DE HEADERS - PUMA MES 6 2025.docx');
    console.log('=' .repeat(65));
    
    try {
        const docxPath = '../reporte_py/template-word/PUMA MES 6 2025.docx';
        
        if (!await fs.pathExists(docxPath)) {
            console.log('⚠️ Intentando con ruta alternativa...');
            const altPath = './uploads/PUMA MES 6 2025.docx';
            if (!await fs.pathExists(altPath)) {
                throw new Error('No se encuentra el archivo PUMA MES 6 2025.docx');
            }
            const zip = new AdmZip(altPath);
        } else {
            var zip = new AdmZip(docxPath);
        }

        const parser = new DOMParser();

        // Analizar header1.xml
        console.log('\\n📋 ANÁLISIS DE HEADER 1:');
        console.log('----------------------------------------');
        const header1Entry = zip.getEntry('word/header1.xml');
        if (header1Entry) {
            const header1Xml = header1Entry.getData().toString('utf8');
            const header1Doc = parser.parseFromString(header1Xml, 'text/xml');
            
            // Buscar elementos de imagen con dimensiones
            const drawings = header1Doc.getElementsByTagName('w:drawing');
            console.log(`📊 Dibujos encontrados en header1: ${drawings.length}`);
            
            for (let i = 0; i < drawings.length; i++) {
                const drawing = drawings[i];
                const extents = drawing.getElementsByTagName('wp:extent');
                const embeds = drawing.getElementsByTagName('a:blip');
                
                if (extents.length > 0 && embeds.length > 0) {
                    const extent = extents[0];
                    const embed = embeds[0];
                    const cx = extent.getAttribute('cx'); // ancho en EMUs
                    const cy = extent.getAttribute('cy'); // alto en EMUs
                    const embedId = embed.getAttribute('r:embed');
                    
                    // Convertir EMUs a píxeles (1 EMU = 1/914400 inches, 1 inch = 96 pixels)
                    const widthPx = Math.round(parseInt(cx) / 914400 * 96);
                    const heightPx = Math.round(parseInt(cy) / 914400 * 96);
                    
                    console.log(`🖼️ Imagen ${i + 1}:`);
                    console.log(`   - Embed ID: ${embedId}`);
                    console.log(`   - Dimensiones EMU: ${cx} x ${cy}`);
                    console.log(`   - Dimensiones Píxeles: ${widthPx} x ${heightPx}`);
                }
            }
        }

        // Analizar header2.xml
        console.log('\\n📋 ANÁLISIS DE HEADER 2:');
        console.log('----------------------------------------');
        const header2Entry = zip.getEntry('word/header2.xml');
        if (header2Entry) {
            const header2Xml = header2Entry.getData().toString('utf8');
            const header2Doc = parser.parseFromString(header2Xml, 'text/xml');
            
            // Buscar elementos de imagen con dimensiones
            const drawings = header2Doc.getElementsByTagName('w:drawing');
            console.log(`📊 Dibujos encontrados en header2: ${drawings.length}`);
            
            for (let i = 0; i < drawings.length; i++) {
                const drawing = drawings[i];
                const extents = drawing.getElementsByTagName('wp:extent');
                const embeds = drawing.getElementsByTagName('a:blip');
                
                if (extents.length > 0 && embeds.length > 0) {
                    const extent = extents[0];
                    const embed = embeds[0];
                    const cx = extent.getAttribute('cx');
                    const cy = extent.getAttribute('cy');
                    const embedId = embed.getAttribute('r:embed');
                    
                    const widthPx = Math.round(parseInt(cx) / 914400 * 96);
                    const heightPx = Math.round(parseInt(cy) / 914400 * 96);
                    
                    console.log(`🖼️ Imagen ${i + 1}:`);
                    console.log(`   - Embed ID: ${embedId}`);
                    console.log(`   - Dimensiones EMU: ${cx} x ${cy}`);
                    console.log(`   - Dimensiones Píxeles: ${widthPx} x ${heightPx}`);
                }
            }
        }

        // Mapear relaciones de header
        console.log('\\n🔗 RELACIONES DE HEADERS:');
        console.log('----------------------------------------');
        
        const header1RelsEntry = zip.getEntry('word/_rels/header1.xml.rels');
        if (header1RelsEntry) {
            const header1RelsXml = header1RelsEntry.getData().toString('utf8');
            const header1RelsDoc = parser.parseFromString(header1RelsXml, 'text/xml');
            const relationships = header1RelsDoc.getElementsByTagName('Relationship');
            
            console.log('📋 Header1 relaciones:');
            for (let i = 0; i < relationships.length; i++) {
                const rel = relationships[i];
                const id = rel.getAttribute('Id');
                const target = rel.getAttribute('Target');
                const type = rel.getAttribute('Type');
                if (type && type.includes('image')) {
                    console.log(`   ${id}: ${target} (image)`);
                }
            }
        }

        const header2RelsEntry = zip.getEntry('word/_rels/header2.xml.rels');
        if (header2RelsEntry) {
            const header2RelsXml = header2RelsEntry.getData().toString('utf8');
            const header2RelsDoc = parser.parseFromString(header2RelsXml, 'text/xml');
            const relationships = header2RelsDoc.getElementsByTagName('Relationship');
            
            console.log('📋 Header2 relaciones:');
            for (let i = 0; i < relationships.length; i++) {
                const rel = relationships[i];
                const id = rel.getAttribute('Id');
                const target = rel.getAttribute('Target');
                const type = rel.getAttribute('Type');
                if (type && type.includes('image')) {
                    console.log(`   ${id}: ${target} (image)`);
                }
            }
        }

        console.log('\\n💾 Guardando análisis de dimensiones...');
        const analysis = {
            fecha: new Date().toISOString(),
            archivo: 'PUMA MES 6 2025.docx',
            headers_analizados: 2,
            nota: 'Dimensiones en píxeles para uso en generador'
        };

        await fs.writeJson(`./output/header_dimensions_${Date.now()}.json`, analysis, { spaces: 2 });
        console.log('✅ Análisis de dimensiones completado');

    } catch (error) {
        console.error('❌ Error en análisis:', error.message);
        throw error;
    }
}

analyzeHeaderDimensions()
    .then(() => {
        console.log('\\n🎉 ANÁLISIS DE DIMENSIONES COMPLETADO');
    })
    .catch(error => {
        console.error('\\n💥 ERROR:', error.message);
        process.exit(1);
    });
