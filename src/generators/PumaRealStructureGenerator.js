/**
 * Generador PUMA que replica la estructura REAL del documento
 * 
 * ESTRUCTURA REAL IDENTIFICADA:
 * - Header: Completamente compuesto de imágenes (logos corporativos)
 * - Páginas: Principalmente imágenes con mínimo texto
 * - No hay tablas estructuradas como pensábamos inicialmente
 * - Es un documento visual/fotográfico, no un formulario de texto
 */

import { Document, Packer, Paragraph, TextRun, ImageRun, Header, SectionType, AlignmentType } from 'docx';
import fs from 'fs-extra';
import path from 'path';

class PumaRealStructureGenerator {
    constructor(useRealImages = true) {
        this.useRealImages = useRealImages;
        this.extractedImagesPath = './extracted_images';
        this.imageRegistry = null;
        this.headerImages = [];
        this.documentImages = [];
        
        this.config = {
            margins: {
                top: 720,    // Reducido para más espacio para imágenes
                right: 720,
                bottom: 720,
                left: 720
            }
        };
    }

    async loadExtractedImages() {
        if (!this.useRealImages) {
            console.log('🖼️ Modo placeholder activado');
            return;
        }

        try {
            const registryPath = path.join(this.extractedImagesPath, 'image_registry.json');
            
            if (await fs.pathExists(registryPath)) {
                this.imageRegistry = await fs.readJson(registryPath);
                
                console.log(`📋 Registro cargado: ${Object.keys(this.imageRegistry).length} imágenes`);
                
                // Clasificar imágenes según estructura real
                for (const [hash, imageInfo] of Object.entries(this.imageRegistry)) {
                    const isHeaderImage = imageInfo.originalPath.includes('image17.') || 
                                         imageInfo.originalPath.includes('image18.');
                    
                    if (isHeaderImage) {
                        this.headerImages.push({
                            ...imageInfo,
                            hash: hash
                        });
                    } else {
                        this.documentImages.push({
                            ...imageInfo,
                            hash: hash
                        });
                    }
                }
                
                console.log(`🎯 Imágenes de header: ${this.headerImages.length}`);
                console.log(`🖼️ Imágenes de documento: ${this.documentImages.length}`);
                
            } else {
                console.warn('⚠️ No se encontró registro de imágenes');
            }
        } catch (error) {
            console.error('❌ Error cargando imágenes:', error);
            this.useRealImages = false;
        }
    }

    async createImageHeader() {
        if (!this.useRealImages || this.headerImages.length === 0) {
            // Header simple con texto
            return new Header({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "REGISTRO FOTOGRÁFICO PUMA",
                                bold: true,
                                size: 24
                            })
                        ]
                    })
                ]
            });
        }

        // Header con imágenes reales
        const headerChildren = [];
        
        for (let i = 0; i < this.headerImages.length; i++) {
            const imageInfo = this.headerImages[i];
            const imagePath = path.join(this.extractedImagesPath, imageInfo.fileName);
            
            try {
                if (await fs.pathExists(imagePath)) {
                    const imageBuffer = await fs.readFile(imagePath);
                    
                    headerChildren.push(
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new ImageRun({
                                    data: imageBuffer,
                                    transformation: {
                                        width: 600,  // Header grande como en el original
                                        height: 150
                                    }
                                })
                            ]
                        })
                    );
                    
                    console.log(`✅ Header imagen agregada: ${imageInfo.fileName}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error cargando imagen header:`, error);
            }
        }

        // Si no se pudieron cargar imágenes, usar texto
        if (headerChildren.length === 0) {
            headerChildren.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "REGISTRO FOTOGRÁFICO PUMA",
                            bold: true,
                            size: 24
                        })
                    ]
                })
            );
        }

        return new Header({ children: headerChildren });
    }

    async createImagePage(pageNumber) {
        const pageChildren = [];
        
        // Título pequeño de la página
        pageChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: `ACTIVIDAD ${pageNumber}`,
                        bold: true,
                        size: 16
                    })
                ]
            })
        );
        
        // Línea vacía
        pageChildren.push(new Paragraph({ children: [new TextRun("")] }));
        
        // Agregar hasta 4 imágenes por página
        const imagesPerPage = 4;
        const startIndex = (pageNumber - 1) * imagesPerPage;
        
        for (let i = 0; i < imagesPerPage && (startIndex + i) < this.documentImages.length; i++) {
            const imageInfo = this.documentImages[startIndex + i];
            const imagePath = path.join(this.extractedImagesPath, imageInfo.fileName);
            
            try {
                if (await fs.pathExists(imagePath)) {
                    const imageBuffer = await fs.readFile(imagePath);
                    
                    pageChildren.push(
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new ImageRun({
                                    data: imageBuffer,
                                    transformation: {
                                        width: 400,
                                        height: 300
                                    }
                                })
                            ]
                        })
                    );
                    
                    // Pequeña descripción
                    pageChildren.push(
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `Foto ${i + 1} - ${imageInfo.fileName}`,
                                    size: 12,
                                    italic: true
                                })
                            ]
                        })
                    );
                    
                    // Espacio
                    pageChildren.push(new Paragraph({ children: [new TextRun("")] }));
                    
                    console.log(`📸 Imagen página ${pageNumber}: ${imageInfo.fileName}`);
                } else {
                    console.warn(`⚠️ Imagen no encontrada: ${imagePath}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error cargando imagen:`, error);
            }
        }
        
        // Si no hay imágenes, agregar placeholder
        if (pageChildren.length <= 2) {
            pageChildren.push(
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "[CONTENIDO VISUAL DE LA ACTIVIDAD]",
                            italic: true,
                            size: 14
                        })
                    ]
                })
            );
        }
        
        return pageChildren;
    }

    async generateDocument() {
        console.log('📄 Generando documento PUMA con estructura real (basado en imágenes)...');
        
        await this.loadExtractedImages();
        
        const sections = [];
        const header = await this.createImageHeader();
        
        // Calcular número de páginas necesarias
        const imagesPerPage = 4;
        const totalPages = Math.ceil(this.documentImages.length / imagesPerPage) || 1;
        
        console.log(`📊 Generando ${totalPages} páginas para ${this.documentImages.length} imágenes`);
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const pageChildren = await this.createImagePage(pageNum);
            
            sections.push({
                properties: {
                    page: { margin: this.config.margins },
                    type: pageNum === 1 ? undefined : SectionType.NEXT_PAGE
                },
                headers: {
                    default: header
                },
                children: pageChildren
            });
        }
        
        return new Document({ sections: sections });
    }
}

export { PumaRealStructureGenerator };
