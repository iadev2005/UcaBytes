import { useState, useRef, useEffect } from 'react';
import type { BusinessPage, PageSection, ThemeConfig } from '../../types/templates';
import { cn } from '../../lib/utils';
import ImageUploader from './ImageUploader';
import StyleEditor from './StyleEditor';
import ResizablePanel from './ResizablePanel';
import PagePreview from './PagePreview';

// Tipos de secciones disponibles
const SECTION_TYPES = {
  hero: {
    name: 'Hero',
    icon: '🎯',
    description: 'Sección principal con imagen de fondo y texto destacado',
    defaultContent: {
      title: 'Título principal',
      description: 'Descripción breve que capture la atención',
      buttonText: 'Llamada a la acción',
      buttonLink: '#',
      backgroundImage: '/placeholder.jpg'
    }
  },
  features: {
    name: 'Características',
    icon: '✨',
    description: 'Muestra las características principales de tu producto/servicio',
    defaultContent: {
      title: 'Nuestras características',
      features: [
        { title: 'Característica 1', description: 'Descripción breve' },
        { title: 'Característica 2', description: 'Descripción breve' }
      ]
    }
  },
  products: {
    name: 'Productos',
    icon: '🛍',
    description: 'Galería de productos destacados',
    defaultContent: {
      title: 'Productos destacados',
      products: []
    }
  },
  testimonials: {
    name: 'Testimonios',
    icon: '💬',
    description: 'Opiniones y testimonios de clientes',
    defaultContent: {
      title: 'Lo que dicen nuestros clientes',
      testimonials: [
        { name: 'Cliente 1', text: 'Testimonio...', image: '/placeholder.jpg' }
      ]
    }
  },
  contact: {
    name: 'Contacto',
    icon: '📞',
    description: 'Formulario de contacto y información',
    defaultContent: {
      title: 'Contáctanos',
      email: 'contacto@empresa.com',
      phone: '+1234567890',
      address: 'Dirección de la empresa'
    }
  }
};

type EditorMode = 'desktop' | 'tablet' | 'mobile';

interface PageEditorProps {
  page: BusinessPage;
  onSave: (page: BusinessPage) => void;
  onPublish: (page: BusinessPage) => void;
}

// Configuración por defecto para cada tipo de sección
const DEFAULT_SECTION_CONTENT = {
  hero: {
    title: 'Título principal',
    description: 'Descripción breve que capture la atención',
    buttonText: 'Llamada a la acción',
    buttonLink: '#',
    backgroundImage: '/placeholder.jpg',
    features: [],
    products: [],
    testimonials: [],
    stats: []
  },
  features: {
    title: 'Nuestras características',
    features: [
      { title: 'Característica 1', description: 'Descripción breve' },
      { title: 'Característica 2', description: 'Descripción breve' }
    ],
    products: [],
    testimonials: [],
    stats: []
  },
  products: {
    title: 'Productos destacados',
    description: 'Explora nuestra selección de productos',
    products: [
      {
        name: 'Producto 1',
        description: 'Descripción del producto',
        price: 99.99,
        image: '/placeholder.jpg'
      },
      {
        name: 'Producto 2',
        description: 'Descripción del producto',
        price: 149.99,
        image: '/placeholder.jpg'
      },
      {
        name: 'Producto 3',
        description: 'Descripción del producto',
        price: 199.99,
        image: '/placeholder.jpg'
      }
    ],
    features: [],
    testimonials: [],
    stats: []
  },
  testimonials: {
    title: 'Lo que dicen nuestros clientes',
    description: 'Testimonios de clientes satisfechos',
    testimonials: [
      {
        name: 'Cliente 1',
        role: 'CEO',
        text: 'Excelente servicio y atención al cliente. Superaron todas nuestras expectativas.',
        image: '/placeholder.jpg'
      },
      {
        name: 'Cliente 2',
        role: 'Director de Marketing',
        text: 'Un equipo profesional y comprometido. Resultados excepcionales.',
        image: '/placeholder.jpg'
      },
      {
        name: 'Cliente 3',
        role: 'Gerente General',
        text: 'La mejor decisión que tomamos fue trabajar con ellos. Altamente recomendados.',
        image: '/placeholder.jpg'
      }
    ],
    features: [],
    products: [],
    stats: []
  },
  contact: {
    title: 'Contáctanos',
    description: 'Estamos aquí para ayudarte',
    email: 'contacto@empresa.com',
    phone: '+1234567890',
    address: 'Dirección de la empresa',
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.952912260219!2d3.375295414770757!3d6.524379695281496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos!5e0!3m2!1sen!2sng!4v1629291962087!5m2!1sen!2sng" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
    showSocialMedia: true,
    socialLinks: {
      facebook: 'https://facebook.com/empresa',
      instagram: 'https://instagram.com/empresa',
      twitter: 'https://twitter.com/empresa'
    },
    features: [],
    products: [],
    testimonials: [],
    stats: []
  },
  about: {
    title: 'Sobre nosotros',
    description: 'Nuestra historia y experiencia',
    content: 'Contenido detallado sobre la empresa...',
    image: '/placeholder.jpg',
    stats: [
      { label: 'Años de experiencia', value: '10+' },
      { label: 'Clientes satisfechos', value: '1000+' }
    ],
    features: [],
    products: [],
    testimonials: []
  }
};

export default function PageEditor({ page, onSave, onPublish }: PageEditorProps) {
  const [currentPage, setCurrentPage] = useState<BusinessPage>(page);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showHelp, setShowHelp] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === editorRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await editorRef.current?.requestFullscreen();
      } catch (err) {
        console.error('Error al entrar en pantalla completa:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error('Error al salir de pantalla completa:', err);
      }
    }
  };

  const draggedSection = useRef<PageSection | null>(null);
  const dropTarget = useRef<number | null>(null);

  const handleDragStart = (section: PageSection) => {
    setIsDragging(true);
    draggedSection.current = section;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dropTarget.current = index;
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setIsDragging(false);

    if (!draggedSection.current) return;

    const sections = [...currentPage.content.sections];
    const sourceIndex = sections.findIndex(s => s.id === draggedSection.current?.id);

    if (sourceIndex === -1) {
      // Nueva sección
      const newSection: PageSection = {
        ...draggedSection.current,
        id: `section-${Date.now()}`,
        order: targetIndex
      };
      sections.splice(targetIndex, 0, newSection);
    } else {
      // Reordenar sección existente
      const [movedSection] = sections.splice(sourceIndex, 1);
      sections.splice(targetIndex, 0, movedSection);
    }

    // Actualizar orden
    sections.forEach((section, index) => {
      section.order = index;
    });

    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        sections
      }
    });
    setIsDirty(true);
  };

  // Función para actualizar estilos directamente
  const updateSectionStyles = (sectionId: string, styleType: 'style' | 'titleStyle' | 'descriptionStyle' | 'buttonStyle', styles: any) => {
    console.log('Actualizando estilos:', { sectionId, styleType, styles });

    setCurrentPage(prevPage => {
      const updatedSections = prevPage.content.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            content: {
              ...section.content,
              [styleType]: {
                ...section.content[styleType],
                ...styles
              }
            }
          };
        }
        return section;
      });

      const newPage = {
        ...prevPage,
        content: {
          ...prevPage.content,
          sections: updatedSections
        }
      };

      console.log('Nueva página después de actualizar estilos:', newPage);
      return newPage;
    });

    setIsDirty(true);
  };

  const handleSectionUpdate = (sectionId: string, updates: Partial<PageSection>) => {
    console.log('Actualizando sección:', { sectionId, updates });

    setCurrentPage(prevPage => {
      const updatedSections = prevPage.content.sections.map(section => {
        if (section.id === sectionId) {
          // Si estamos actualizando estilos
          if (updates.content?.titleStyle || updates.content?.style || updates.content?.descriptionStyle || updates.content?.buttonStyle) {
            const updatedContent = {
              ...section.content,
              ...updates.content,
              titleStyle: updates.content?.titleStyle ? {
                ...section.content.titleStyle,
                ...updates.content.titleStyle
              } : section.content.titleStyle,
              style: updates.content?.style ? {
                ...section.content.style,
                ...updates.content.style
              } : section.content.style,
              descriptionStyle: updates.content?.descriptionStyle ? {
                ...section.content.descriptionStyle,
                ...updates.content.descriptionStyle
              } : section.content.descriptionStyle,
              buttonStyle: updates.content?.buttonStyle ? {
                ...section.content.buttonStyle,
                ...updates.content.buttonStyle
              } : section.content.buttonStyle
            };

            console.log('Contenido actualizado:', updatedContent);

            return {
              ...section,
              content: updatedContent
            };
          }

          // Para otras actualizaciones que no son de estilo
          return {
            ...section,
            content: {
              ...section.content,
              ...updates.content
            }
          };
        }
        return section;
      });

      const newPage = {
        ...prevPage,
        content: {
          ...prevPage.content,
          sections: updatedSections
        }
      };

      console.log('Nueva página:', newPage);
      return newPage;
    });

    setIsDirty(true);
  };

  const handleSectionDelete = (sectionId: string) => {
    const sections = currentPage.content.sections.filter(section => section.id !== sectionId);
    
    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        sections
      }
    });
    setSelectedSectionId(null);
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await onSave(currentPage);
      setIsDirty(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      // TODO: Mostrar error al usuario
    }
  };

  const handlePublish = async () => {
    if (isDirty) {
      await handleSave();
    }
    await onPublish(currentPage);
  };

  const handleAddSection = (type: PageSection['type']) => {
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      type,
      content: DEFAULT_SECTION_CONTENT[type],
      isVisible: true,
      order: currentPage.content.sections.length
    };

    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        sections: [...currentPage.content.sections, newSection]
      }
    });
    setSelectedSectionId(newSection.id);
    setIsDirty(true);
  };

  // Renderizar campos de edición según el tipo de sección
  const renderSectionFields = (section: PageSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                type="text"
                value={section.content.title || ''}
                onChange={(e) => {
                  const updatedContent = {
                    ...section.content,
                    title: e.target.value
                  };
                  updateSectionStyles(section.id, 'style', updatedContent);
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estilos del título</label>
              <StyleEditor
                value={section.content.titleStyle || {}}
                onChange={(styles) => {
                  console.log('Actualizando estilos del título:', styles);
                  updateSectionStyles(section.id, 'titleStyle', styles);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => {
                  const updatedContent = {
                    ...section.content,
                    description: e.target.value
                  };
                  updateSectionStyles(section.id, 'style', updatedContent);
                }}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estilos de la descripción</label>
              <StyleEditor
                value={section.content.descriptionStyle || {}}
                onChange={(styles) => {
                  console.log('Actualizando estilos de la descripción:', styles);
                  updateSectionStyles(section.id, 'descriptionStyle', styles);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Texto del botón</label>
              <input
                type="text"
                value={section.content.buttonText || ''}
                onChange={(e) => {
                  const updatedContent = {
                    ...section.content,
                    buttonText: e.target.value
                  };
                  updateSectionStyles(section.id, 'style', updatedContent);
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estilos del botón</label>
              <StyleEditor
                value={section.content.buttonStyle || {}}
                onChange={(styles) => {
                  console.log('Actualizando estilos del botón:', styles);
                  updateSectionStyles(section.id, 'buttonStyle', styles);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estilos de la sección</label>
              <StyleEditor
                value={section.content.style || {}}
                onChange={(styles) => {
                  console.log('Actualizando estilos de la sección:', styles);
                  updateSectionStyles(section.id, 'style', styles);
                }}
              />
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título de la sección</label>
              <input
                type="text"
                value={section.content.title || ''}
                onChange={(e) => handleSectionUpdate(section.id, {
                  content: { ...section.content, title: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Características</label>
              <div className="space-y-4">
                {(section.content.features || []).map((feature, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">Característica {index + 1}</span>
                      <button
                        onClick={() => {
                          const features = section.content.features.filter((_, i) => i !== index);
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, features }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => {
                        const features = [...section.content.features];
                        features[index] = { ...feature, title: e.target.value };
                        handleSectionUpdate(section.id, {
                          content: { ...section.content, features }
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-md mb-2"
                      placeholder="Título"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => {
                        const features = [...section.content.features];
                        features[index] = { ...feature, description: e.target.value };
                        handleSectionUpdate(section.id, {
                          content: { ...section.content, features }
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Descripción"
                      rows={2}
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2">Estilos</label>
                      <StyleEditor
                        value={feature.style || {}}
                        onChange={(style) => {
                          const features = [...section.content.features];
                          features[index] = { ...feature, style };
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, features }
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const features = [
                      ...(section.content.features || []),
                      { title: '', description: '' }
                    ];
                    handleSectionUpdate(section.id, {
                      content: { ...section.content, features }
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400"
                >
                  + Agregar característica
                </button>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                type="text"
                value={section.content.title || ''}
                onChange={(e) => handleSectionUpdate(section.id, {
                  content: { ...section.content, title: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => handleSectionUpdate(section.id, {
                  content: { ...section.content, description: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Productos</label>
              <div className="space-y-4">
                {(section.content.products || []).map((product, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">Producto {index + 1}</span>
                      <button
                        onClick={() => {
                          const products = section.content.products?.filter((_, i) => i !== index);
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, products }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => {
                          const products = [...(section.content.products || [])];
                          products[index] = { ...product, name: e.target.value };
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, products }
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Nombre del producto"
                      />
                      <textarea
                        value={product.description}
                        onChange={(e) => {
                          const products = [...(section.content.products || [])];
                          products[index] = { ...product, description: e.target.value };
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, products }
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Descripción del producto"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => {
                            const products = [...(section.content.products || [])];
                            products[index] = { ...product, price: parseFloat(e.target.value) };
                            handleSectionUpdate(section.id, {
                              content: { ...section.content, products }
                            });
                          }}
                          className="w-32 px-3 py-2 border rounded-md"
                          placeholder="Precio"
                          step="0.01"
                          min="0"
                        />
                        <div className="flex-1">
                          <ImageUploader
                            value={product.image || ''}
                            onChange={(url) => {
                              const products = [...(section.content.products || [])];
                              products[index] = { ...product, image: url };
                              handleSectionUpdate(section.id, {
                                content: { ...section.content, products }
                              });
                            }}
                            placeholder={`Imagen de ${product.name || 'producto'}`}
                            className="aspect-square"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Estilos</label>
                      <StyleEditor
                        value={product.style || {}}
                        onChange={(style) => {
                          const products = [...section.content.products];
                          products[index] = { ...product, style };
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, products }
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const products = [
                      ...(section.content.products || []),
                      {
                        name: '',
                        description: '',
                        price: 0,
                        image: ''
                      }
                    ];
                    handleSectionUpdate(section.id, {
                      content: { ...section.content, products }
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400"
                >
                  + Agregar producto
                </button>
              </div>
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                type="text"
                value={section.content.title || ''}
                onChange={(e) => handleSectionUpdate(section.id, {
                  content: { ...section.content, title: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => handleSectionUpdate(section.id, {
                  content: { ...section.content, description: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Testimonios</label>
              <div className="space-y-4">
                {(section.content.testimonials || []).map((testimonial, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">Testimonio {index + 1}</span>
                      <button
                        onClick={() => {
                          const testimonials = section.content.testimonials.filter((_, i) => i !== index);
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, testimonials }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => {
                          const testimonials = [...section.content.testimonials];
                          testimonials[index] = { ...testimonial, name: e.target.value };
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, testimonials }
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Nombre"
                      />
                      <input
                        type="text"
                        value={testimonial.role}
                        onChange={(e) => {
                          const testimonials = [...section.content.testimonials];
                          testimonials[index] = { ...testimonial, role: e.target.value };
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, testimonials }
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Cargo"
                      />
                      <textarea
                        value={testimonial.text}
                        onChange={(e) => {
                          const testimonials = [...section.content.testimonials];
                          testimonials[index] = { ...testimonial, text: e.target.value };
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, testimonials }
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Testimonio"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <ImageUploader
                          value={testimonial.image || ''}
                          onChange={(url) => {
                            const testimonials = [...section.content.testimonials];
                            testimonials[index] = { ...testimonial, image: url };
                            handleSectionUpdate(section.id, {
                              content: { ...section.content, testimonials }
                            });
                          }}
                          placeholder={`Foto de ${testimonial.name || 'cliente'}`}
                          className="w-24 h-24"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Estilos</label>
                      <StyleEditor
                        value={testimonial.style || {}}
                        onChange={(style) => {
                          const testimonials = [...section.content.testimonials];
                          testimonials[index] = { ...testimonial, style };
                          handleSectionUpdate(section.id, {
                            content: { ...section.content, testimonials }
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const testimonials = [
                      ...(section.content.testimonials || []),
                      { name: '', role: '', text: '', image: '' }
                    ];
                    handleSectionUpdate(section.id, {
                      content: { ...section.content, testimonials }
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400"
                >
                  + Agregar testimonio
                </button>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                type="text"
                value={section.content.title || ''}
                onChange={(e) => handleSectionUpdate(section.id, {
                  content: { ...section.content, title: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descripción breve</label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => handleSectionUpdate(section.id, {
                  content: { ...section.content, description: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contenido principal</label>
              <textarea
                value={section.content.content || ''}
                onChange={(e) => handleSectionUpdate(section.id, {
                  content: { ...section.content, content: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                rows={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Imagen</label>
              <ImageUploader
                value={section.content.image || ''}
                onChange={(url) => handleSectionUpdate(section.id, {
                  content: { ...section.content, image: url }
                })}
                placeholder="Imagen principal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estadísticas</label>
              <div className="space-y-4">
                {(section.content.stats || []).map((stat, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const stats = [...section.content.stats];
                        stats[index] = { ...stat, label: e.target.value };
                        handleSectionUpdate(section.id, {
                          content: { ...section.content, stats }
                        });
                      }}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="Etiqueta"
                    />
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const stats = [...section.content.stats];
                        stats[index] = { ...stat, value: e.target.value };
                        handleSectionUpdate(section.id, {
                          content: { ...section.content, stats }
                        });
                      }}
                      className="w-32 px-3 py-2 border rounded-md"
                      placeholder="Valor"
                    />
                    <button
                      onClick={() => {
                        const stats = section.content.stats.filter((_, i) => i !== index);
                        handleSectionUpdate(section.id, {
                          content: { ...section.content, stats }
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const stats = [
                      ...(section.content.stats || []),
                      { label: '', value: '' }
                    ];
                    handleSectionUpdate(section.id, {
                      content: { ...section.content, stats }
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400"
                >
                  + Agregar estadística
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estilos</label>
              <StyleEditor
                value={section.content.style || {}}
                onChange={(style) => handleSectionUpdate(section.id, {
                  content: { ...section.content, style }
                })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={editorRef} 
      className={cn(
        "h-screen flex",
        isFullscreen && "bg-gray-100"
      )}
    >
      {/* Panel izquierdo - Secciones disponibles */}
      <ResizablePanel
        title="Secciones"
        defaultWidth={280}
        position="left"
        className={cn(
          "border-r",
          isFullscreen && "border-gray-200"
        )}
      >
        <div className="p-4 space-y-2">
          {Object.entries(SECTION_TYPES).map(([type, config]) => (
            <div
              key={type}
              draggable
              onDragStart={() => handleDragStart({
                id: `new-${type}`,
                type: type as PageSection['type'],
                content: DEFAULT_SECTION_CONTENT[type as keyof typeof DEFAULT_SECTION_CONTENT],
                isVisible: true,
                order: 0
              })}
              onClick={() => handleAddSection(type as PageSection['type'])}
              className="p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h3 className="font-medium">{config.name}</h3>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ResizablePanel>

      {/* Panel central - Vista previa */}
      <div className="flex-1 bg-gray-100 overflow-y-auto p-8">
        <PagePreview 
          page={currentPage} 
          onSectionSelect={(id) => setSelectedSectionId(id ?? undefined)}
          selectedSectionId={selectedSectionId ?? undefined}
        />
      </div>

      {/* Panel derecho - Configuración de sección */}
      {selectedSectionId && (
        <ResizablePanel
          title="Configuración"
          defaultWidth={360}
          onClose={() => setSelectedSectionId(null)}
          className={cn(
            isFullscreen && "border-gray-200"
          )}
        >
          <div className="p-4">
            {renderSectionFields(
              currentPage.content.sections.find(s => s.id === selectedSectionId)!
            )}
          </div>
        </ResizablePanel>
      )}

      {/* Barra de herramientas flotante */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2 border-r pr-4">
          <button
            onClick={() => setViewMode('mobile')}
            className={cn(
              "p-2 rounded-lg",
              viewMode === 'mobile' && "bg-gray-100"
            )}
            title="Vista móvil"
          >
            📱
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={cn(
              "p-2 rounded-lg",
              viewMode === 'tablet' && "bg-gray-100"
            )}
            title="Vista tablet"
          >
            📟
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={cn(
              "p-2 rounded-lg",
              viewMode === 'desktop' && "bg-gray-100"
            )}
            title="Vista escritorio"
          >
            🖥
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={cn(
              "px-4 py-2 rounded-lg",
              isDirty ? "bg-primary text-white" : "bg-gray-100"
            )}
            disabled={!isDirty}
          >
            Guardar borrador
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Publicar
          </button>
        </div>

        <div className="flex items-center gap-2 border-l pl-4">
          <button
            onClick={toggleFullscreen}
            className={cn(
              "p-2 rounded-lg hover:bg-gray-100",
              isFullscreen && "bg-gray-100"
            )}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? '⊹' : '⊏'}
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Ayuda"
          >
            ?
          </button>
        </div>
      </div>

      {/* Modal de ayuda */}
      {showHelp && (
        <div className={cn(
          "fixed inset-0 bg-black/50 flex items-center justify-center p-4",
          isFullscreen && "z-[9999]"
        )}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Ayuda</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="prose">
              <h4>Cómo usar el editor</h4>
              <ul>
                <li>Arrastra secciones desde el panel izquierdo o haz clic para agregarlas</li>
                <li>Haz clic en una sección para editarla</li>
                <li>Arrastra las secciones para reordenarlas</li>
                <li>Usa los controles en la parte inferior para cambiar la vista</li>
                <li>Los paneles son redimensionables y se pueden mover</li>
                <li>Minimiza los paneles cuando no los necesites</li>
                <li>Usa el modo pantalla completa para tener más espacio de trabajo</li>
              </ul>
              <h4>Atajos de teclado</h4>
              <ul>
                <li><kbd>F11</kbd> - Pantalla completa</li>
                <li><kbd>Esc</kbd> - Salir de pantalla completa</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 