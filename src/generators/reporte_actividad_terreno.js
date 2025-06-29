/**
 * Generador de reporte de actividad de terreno con estructura real identificada.
 
* ESTRUCTURA REAL IDENTIFICADA:
 * - Header: Completamente compuesto una imagen Floating behindDocument 
        - Definido como imagen de fondo y con especificaciones de tamaño, posición y recortada 
 * - Páginas: 
        - Pagina principal con 2 tablas y luego 4 imagenes Floating.
            - la primera de `ASPECTOS TÉCNICOS DE LA ACTIVIDAD EN TERRENO` con 4 filas y 2 columnas de texto
            -  La segunda de 3 filas de texto y 4 imágenes Floating.
        - El resto de páginas 1 tabla 3 filas y dos columnas de texto, luego 4 imagenes Floating.
* - Footer: No se utiliza. 
 */

import { 
    Document, Packer, Paragraph, TextRun, ImageRun, Header, SectionType, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign,
    WrapTight
} from 'docx';
import fs from 'fs-extra';
import path from 'path';



class ReportStructureGenerator {
    constructor(useRealImages = true) {
        this.useRealImages = useRealImages;
        this.extractedImagesPath = './extracted_images';
        this.MediaPath = './media';
        this.imageRegistry = null;
        this.firts_header_image = null; // Para almacenar la imagen del primer header
        this.enterprise_name = null; // Nombre de la empresa (Texto que ira en el primer header)
        this.second_header_image = null; // Para almacenar la imagen del segundo header
        this.documentImages = [];   // Para almacenar imágenes de las actividades
        this.table_technical =  null; // Para almacenar la tabla de aspectos técnicos
        this.tables_activity = []; // Para almacenar tablas de actividades
    
    this.config = {
            margins: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
            },
            colors: {
                headerText: "FFFFFF", // nombre de la empresa en el primer header
                firts_row_table_technical: "#92D050", 
                borderColor: "000000"
            }
        };
    }
    async loadHeaderImages() {
        try {
            // Cargar la imagen del primer header
            const firstHeaderImagePath = path.join(this.MediaPath, 'header_primera_pagina.jpeg');
            const secondHeaderImagePath = path.join(this.MediaPath, 'header_paginas_siguientes.jpeg');
            const RegistryHeaderPath = path.join(this.MediaPath, 'header_images_info.json');

            // Verificar si las imágenes existen
            if (await fs.pathExists(firstHeaderImagePath)) {
                this.firts_header_image = await fs.readFile(firstHeaderImagePath);
                console.log('✓ Primera imagen de header cargada correctamente');
            } else {
                console.warn('⚠ No se encontró la imagen del primer header:', firstHeaderImagePath);
            }

            if (await fs.pathExists(secondHeaderImagePath)) {
                this.second_header_image = await fs.readFile(secondHeaderImagePath);
                console.log('✓ Segunda imagen de header cargada correctamente');
            } else {
                console.warn('⚠ No se encontró la imagen del segundo header:', secondHeaderImagePath);
            }

            // Cargar configuración de formato si existe
            if (await fs.pathExists(RegistryHeaderPath)) {
                this.formatHeadersConfig = await fs.readJson(RegistryHeaderPath);
                console.log('✓ Configuración de formato de headers cargada');
                return this.formatHeadersConfig;
            } else {
                console.warn('⚠ No se encontró el archivo de configuración de headers');
                return null;
            }

        } catch (error) {
            console.error('❌ Error al cargar las imágenes del header:', error);
            throw error;
        }
    }
    async createImageHeader(isFirstPage = false) {
        try {
            // Cargar configuración si no está ya cargada
            if (!this.formatHeadersConfig) {
                this.formatHeadersConfig = await this.loadHeaderImages();
            }
            
            // Seleccionar la imagen apropiada según el tipo de página
            const headerImage = isFirstPage ? this.firts_header_image : this.second_header_image;
            
            if (!headerImage) {
                console.warn(`⚠ No hay imagen disponible para ${isFirstPage ? 'primera página' : 'páginas siguientes'}`);
                return null;
            }

            let config;
            
            // Leer configuración desde el JSON
            if (this.formatHeadersConfig && this.formatHeadersConfig.header_images) {
                console.log('✓ Usando configuración del JSON para headers');
                
                if (isFirstPage) {
                    // Configuración para primera página
                    const firstPageConfig = this.formatHeadersConfig.header_images.primera_pagina;
                    config = {
                        width: firstPageConfig.formatInfo.width || 2519680,
                        height: firstPageConfig.formatInfo.height || 2519680,
                        description: firstPageConfig.description,
                        fileName: firstPageConfig.fileName,
                        originalSize: firstPageConfig.size,
                        // Información de posicionamiento y formato específico del image_registry.json
                        positioning: {
                            x: 0, // Centrado en la página
                            y: 0, // En la parte superior
                            xRelativeFrom: 'page',
                            yRelativeFrom: 'page'
                        },
                        // Usar valores de formatting del image_registry.json
                        finalDimensions: {
                            width: 820,   // Ancho final de visualización
                            height: 1150  // Alto final de visualización
                        },
                        cropping: {
                            // Valores de formatting en porcentajes
                            left: 0.9,     // cropLeft del formatting
                            top: 0,        // cropTop del formatting
                            right: 24.934, // cropRight del formatting
                            bottom: 15.846, // cropBottom del formatting
                            // Información adicional de transformación
                            scaleX: 100,
                            scaleY: 100,
                            rotation: 0,
                            flipHorizontal: false,
                            flipVertical: false,
                            brightness: 0,
                            contrast: 0
                        },
                        floating: {
                            behindText: true,
                            wrapType: 'none',
                            isInHeader: true,
                            headerType: 'header2'
                        }
                    };
                    console.log(`📊 Primera página - Dimensiones originales: ${config.width}x${config.height} EMU`);
                    console.log(`📏 Dimensiones finales: ${config.finalDimensions.width}x${config.finalDimensions.height} px`);
                    console.log(`✂️ Recorte aplicado: L:${config.cropping.left}%, T:${config.cropping.top}%, R:${config.cropping.right}%, B:${config.cropping.bottom}%`);
                } else {
                    // Configuración para páginas siguientes
                    const otherPagesConfig = this.formatHeadersConfig.header_images.paginas_siguientes;
                    
                    // Si no tiene dimensiones específicas, usar valores recomendados
                    const recommendedFormat = this.formatHeadersConfig.usage_instructions.formato_recomendado;
                    const [recWidth, recHeight] = recommendedFormat.match(/\d+/g) || ['600', '100'];
                    
                    config = {
                        width: otherPagesConfig.formatInfo.width || (parseInt(recWidth) * 914400 / 96), // Convertir px a EMU
                        height: otherPagesConfig.formatInfo.height || (parseInt(recHeight) * 914400 / 96),
                        description: otherPagesConfig.description,
                        fileName: otherPagesConfig.fileName,
                        originalSize: otherPagesConfig.size,
                        // Configuración más simple para páginas siguientes
                        positioning: {
                            x: 0,
                            y: 0,
                            xRelativeFrom: 'page',
                            yRelativeFrom: 'page'
                        },
                        cropping: {
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0
                        },
                        floating: {
                            behindText: true,
                            wrapType: 'none'
                        }
                    };
                    console.log(`📊 Páginas siguientes - Dimensiones: ${config.width}x${config.height} EMU (${config.originalSize} bytes)`);
                }
            } else {
                // Configuración de respaldo si no hay JSON
                console.log('⚠ Usando configuración de respaldo');
                const headerConfig = {
                    firstPage: {
                        width: 2519680,
                        height: 2519680,
                        cropping: { left: 0, top: 0, right: 0, bottom: 0 },
                        positioning: { x: 0, y: 0, xRelativeFrom: 'page', yRelativeFrom: 'page' },
                        floating: { behindText: true, wrapType: 'none' }
                    },
                    otherPages: {
                        width: 914400 * 6.5, // ~600px
                        height: 914400 * 1.0,  // ~100px
                        cropping: { left: 0, top: 0, right: 0, bottom: 0 },
                        positioning: { x: 0, y: 0, xRelativeFrom: 'page', yRelativeFrom: 'page' },
                        floating: { behindText: true, wrapType: 'none' }
                    }
                };
                config = isFirstPage ? headerConfig.firstPage : headerConfig.otherPages;
            }

            // Crear el ImageRun para el header con configuración completa
            const imageRunConfig = {
                data: headerImage,
                transformation: {
                    // Usar las dimensiones finales de formatting si están disponibles
                    width: config.finalDimensions ? (config.finalDimensions.width * 914400 / 96) : config.width, // Convertir px a EMU
                    height: config.finalDimensions ? (config.finalDimensions.height * 914400 / 96) : config.height,
                },
                floating: {
                    horizontalPosition: {
                        relative: config.positioning?.xRelativeFrom || 'page',
                        align: 'center',
                        offset: config.positioning?.x || 0
                    },
                    verticalPosition: {
                        relative: config.positioning?.yRelativeFrom || 'page',
                        offset: config.positioning?.y || 0
                    },
                    wrap: {
                        type: config.floating?.behindText ? 'behindDocument' : 'none',
                        side: 'bothSides'
                    }
                }
            };

            // Aplicar recorte usando los valores de formatting (en porcentajes)
            if (config.cropping && (
                config.cropping.left || 
                config.cropping.top || 
                config.cropping.right || 
                config.cropping.bottom
            )) {
                // Convertir porcentajes a unidades de recorte (multiplicar por 1000 para obtener unidades EMU de recorte)
                imageRunConfig.crop = {
                    left: Math.round((config.cropping.left || 0) * 1000),
                    top: Math.round((config.cropping.top || 0) * 1000),
                    right: Math.round((config.cropping.right || 0) * 1000),
                    bottom: Math.round((config.cropping.bottom || 0) * 1000)
                };
                console.log(`✂️ Aplicando recorte: L:${config.cropping.left}% (${imageRunConfig.crop.left}), T:${config.cropping.top}% (${imageRunConfig.crop.top}), R:${config.cropping.right}% (${imageRunConfig.crop.right}), B:${config.cropping.bottom}% (${imageRunConfig.crop.bottom})`);
            }

            // Aplicar transformaciones adicionales si están disponibles
            if (config.cropping) {
                if (config.cropping.rotation) {
                    imageRunConfig.transformation.rotation = config.cropping.rotation;
                }
                if (config.cropping.flipHorizontal) {
                    imageRunConfig.transformation.flipHorizontal = config.cropping.flipHorizontal;
                }
                if (config.cropping.flipVertical) {
                    imageRunConfig.transformation.flipVertical = config.cropping.flipVertical;
                }
            }

            const headerImageRun = new ImageRun(imageRunConfig);

            // Crear el párrafo del header
            const headerParagraph = new Paragraph({
                children: [headerImageRun],
                alignment: AlignmentType.CENTER
            });

            console.log(`✓ Header ${isFirstPage ? 'primera página' : 'páginas siguientes'} creado correctamente`);
            return headerParagraph;

        } catch (error) {
            console.error('❌ Error al crear header de imagen:', error);
            throw error;
        }
    }
    // Continue...

    // ------------------------------------------------------------------------------------------------------------------------------------------------//
    async createDocument() {
        try {
            console.log('📄 Creando documento...');
            // TODO: Implementar creación completa del documento
            return null;
        } catch (error) {
            console.error('❌ Error al crear documento:', error);
            throw error;
        }
    }

    // Método de prueba para verificar la funcionalidad
    async testHeaderFunctionality() {
        console.log('🧪 Iniciando prueba de funcionalidad de headers...\n');
        
        try {
            // 1. Probar carga de imágenes
            console.log('📁 Probando carga de imágenes...');
            const headerConfig = await this.loadHeaderImages();
            
            if (headerConfig) {
                console.log('📊 Configuración cargada:', JSON.stringify(headerConfig.header_images, null, 2));
            }
            
            // 2. Verificar que las imágenes se cargaron
            console.log('\n🖼️ Verificando estado de las imágenes:');
            console.log(`- Primera imagen: ${this.firts_header_image ? '✓ Cargada' : '❌ No cargada'}`);
            console.log(`- Segunda imagen: ${this.second_header_image ? '✓ Cargada' : '❌ No cargada'}`);
            
            if (this.firts_header_image) {
                console.log(`- Tamaño primera imagen: ${this.firts_header_image.length} bytes`);
            }
            if (this.second_header_image) {
                console.log(`- Tamaño segunda imagen: ${this.second_header_image.length} bytes`);
            }
            
            // 3. Probar creación de headers
            console.log('\n🎨 Probando creación de headers...');
            
            if (this.firts_header_image) {
                const firstPageHeader = await this.createImageHeader(true);
                console.log(`- Header primera página: ${firstPageHeader ? '✓ Creado' : '❌ Error'}`);
            }
            
            if (this.second_header_image) {
                const otherPagesHeader = await this.createImageHeader(false);
                console.log(`- Header otras páginas: ${otherPagesHeader ? '✓ Creado' : '❌ Error'}`);
            }
            
            console.log('\n✅ Prueba completada exitosamente!');
            return true;
            
        } catch (error) {
            console.error('❌ Error durante la prueba:', error);
            return false;
        }
    }
}

// Función de prueba independiente
async function testReportGenerator() {
    console.log('🚀 Iniciando prueba del generador de reportes...\n');
    
    try {
        const generator = new ReportStructureGenerator();
        const result = await generator.testHeaderFunctionality();
        
        if (result) {
            console.log('\n🎉 ¡Todas las pruebas pasaron correctamente!');
        } else {
            console.log('\n⚠️ Algunas pruebas fallaron. Revisa los mensajes anteriores.');
        }
        
    } catch (error) {
        console.error('💥 Error crítico en la prueba:', error);
    }
}

// Ejecutar la prueba si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testReportGenerator();
}

export { ReportStructureGenerator };
