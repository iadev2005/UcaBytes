import { useState, useRef, useEffect } from 'react';
import type { BusinessPage, PageSection } from '../../types/templates';
import { cn } from '../../lib/utils';
import ImageUploader from './ImageUploader';
import StyleEditor from './StyleEditor';
import ResizablePanel from './ResizablePanel';
import PagePreview from './PagePreview';
import { DesktopIcon, MaximizeIcon, MinimizeIcon, HelpIcon } from '../../icons';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

type SubElementKey =
  | 'title'
  | 'description'
  | 'backgroundImage'
  | 'button'
  | 'about-container'
  | 'content'
  | `feature-container-${number}`
  | `feature-title-${number}`
  | `feature-description-${number}`
  | `product-container-${number}`
  | `product-name-${number}`
  | `product-description-${number}`
  | `product-price-${number}`
  | `testimonial-container-${number}`
  | `testimonial-name-${number}`
  | `testimonial-role-${number}`
  | `testimonial-text-${number}`
  | `stat-container-${number}`;

export default function PageEditor({ page, onSave, onPublish }: PageEditorProps) {
  const [currentPage, setCurrentPage] = useState<BusinessPage>(page);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubElement, setSelectedSubElement] = useState<null | { sectionId: string, key: SubElementKey }>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showHelp, setShowHelp] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

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
    draggedSection.current = section;
    setIsDragging(true);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverIndex(null);
    draggedSection.current = null;
    dropTarget.current = null;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dropTarget.current = index;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverIndex(null);

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
    
    // Reset drag state
    draggedSection.current = null;
    dropTarget.current = null;
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
    try {
      setIsPublishing(true);
      if (isDirty) {
        await handleSave();
      }
      await onPublish(currentPage);
    } catch (error) {
      console.error('Error al publicar:', error);
    } finally {
      setIsPublishing(false);
    }
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
    // Si hay un sub-elemento seleccionado, mostrar solo ese campo
    if (selectedSubElement && selectedSubElement.sectionId === section.id) {
      // Features: feature-title-X, feature-description-X, feature-container-X
      if (section.type === 'features' && selectedSubElement.key.startsWith('feature-')) {
        const match = selectedSubElement.key.match(/feature\-(title|description|container)\-(\d+)/);
        if (match) {
          const [, field, idxStr] = match;
          const idx = parseInt(idxStr, 10);
          const feature = section.content.features[idx];
          if (!feature) return null;
          if (field === 'title') {
            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título de la característica</label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={e => {
                      const features = [...section.content.features];
                      features[idx] = { ...feature, title: e.target.value };
                      handleSectionUpdate(section.id, { content: { ...section.content, features } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estilos del título</label>
                  <StyleEditor
                    value={feature.style || {}}
                    onChange={styles => {
                      const features = [...section.content.features];
                      features[idx] = { ...feature, style: { ...feature.style, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, features } });
                    }}
                  />
                </div>
              </div>
            );
          } else if (field === 'description') {
            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción de la característica</label>
                  <textarea
                    value={feature.description}
                    onChange={e => {
                      const features = [...section.content.features];
                      features[idx] = { ...feature, description: e.target.value };
                      handleSectionUpdate(section.id, { content: { ...section.content, features } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estilos de la descripción</label>
                  <StyleEditor
                    value={feature.style || {}}
                    onChange={styles => {
                      const features = [...section.content.features];
                      features[idx] = { ...feature, style: { ...feature.style, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, features } });
                    }}
                  />
                </div>
              </div>
            );
          } else if (field === 'container') {
            // Edición granular: estilos del contenedor + campos y estilos independientes de sub-elementos
            return (
              <div className="space-y-6">
                {/* Estilos del contenedor */}
                <div>
                  <label className="block text-sm font-medium mb-2">Estilos del contenedor</label>
                  <StyleEditor
                    value={feature.style || {}}
                    onChange={styles => {
                      const features = [...section.content.features];
                      features[idx] = { ...feature, style: { ...feature.style, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, features } });
                    }}
                  />
                </div>
                {/* Título */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Título de la característica</label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={e => {
                      const features = [...section.content.features];
                      features[idx] = { ...feature, title: e.target.value };
                      handleSectionUpdate(section.id, { content: { ...section.content, features } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <label className="block text-xs font-medium mb-1">Estilos del título</label>
                  <StyleEditor
                    value={feature.titleStyle || {}}
                    onChange={styles => {
                      const features = [...section.content.features];
                      features[idx] = { ...feature, titleStyle: { ...feature.titleStyle, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, features } });
                    }}
                  />
                </div>
                {/* Descripción */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Descripción de la característica</label>
                  <textarea
                    value={feature.description}
                    onChange={e => {
                      const features = [...section.content.features];
                      features[idx] = { ...feature, description: e.target.value };
                      handleSectionUpdate(section.id, { content: { ...section.content, features } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                  <label className="block text-xs font-medium mb-1">Estilos de la descripción</label>
                  <StyleEditor
                    value={feature.descriptionStyle || {}}
                    onChange={styles => {
                      const features = [...section.content.features];
                      features[idx] = { ...feature, descriptionStyle: { ...feature.descriptionStyle, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, features } });
                    }}
                  />
                </div>
              </div>
            );
          }
        }
      }
      // Products: product-name-X, product-description-X, product-price-X, product-container-X
      if (section.type === 'products' && selectedSubElement.key.startsWith('product-')) {
        const match = selectedSubElement.key.match(/product\-(name|description|price|container)\-(\d+)/);
        if (match) {
          const [, field, idxStr] = match;
          const idx = parseInt(idxStr, 10);
          const product = section.content.products[idx];
          if (!product) return null;
          if (field === 'name') {
            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre del producto</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={e => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, name: e.target.value };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estilos del nombre</label>
                  <StyleEditor
                    value={product.style || {}}
                    onChange={styles => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, style: { ...product.style, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                  />
                </div>
              </div>
            );
          } else if (field === 'description') {
            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción del producto</label>
                  <textarea
                    value={product.description}
                    onChange={e => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, description: e.target.value };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estilos de la descripción</label>
                  <StyleEditor
                    value={product.style || {}}
                    onChange={styles => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, style: { ...product.style, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                  />
                </div>
              </div>
            );
          } else if (field === 'price') {
            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Precio</label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={e => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, price: parseFloat(e.target.value) };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    min={0}
                    step={0.01}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estilos del precio</label>
                  <StyleEditor
                    value={product.style || {}}
                    onChange={styles => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, style: { ...product.style, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                  />
                </div>
              </div>
            );
          } else if (field === 'container') {
            // Edición granular: estilos del contenedor + campos y estilos independientes de sub-elementos
            return (
              <div className="space-y-6">
                {/* Estilos del contenedor */}
                <div>
                  <label className="block text-sm font-medium mb-2">Estilos del contenedor</label>
                  <StyleEditor
                    value={product.style || {}}
                    onChange={styles => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, style: { ...product.style, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                  />
                </div>
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Nombre del producto</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={e => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, name: e.target.value };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <label className="block text-xs font-medium mb-1">Estilos del nombre</label>
                  <StyleEditor
                    value={product.nameStyle || {}}
                    onChange={styles => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, nameStyle: { ...product.nameStyle, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                  />
                </div>
                {/* Descripción */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Descripción del producto</label>
                  <textarea
                    value={product.description}
                    onChange={e => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, description: e.target.value };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                  <label className="block text-xs font-medium mb-1">Estilos de la descripción</label>
                  <StyleEditor
                    value={product.descriptionStyle || {}}
                    onChange={styles => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, descriptionStyle: { ...product.descriptionStyle, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                  />
                </div>
                {/* Precio */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Precio</label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={e => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, price: parseFloat(e.target.value) };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    min={0}
                    step={0.01}
                  />
                  <label className="block text-xs font-medium mb-1">Estilos del precio</label>
                  <StyleEditor
                    value={product.priceStyle || {}}
                    onChange={styles => {
                      const products = [...section.content.products];
                      products[idx] = { ...product, priceStyle: { ...product.priceStyle, ...styles } };
                      handleSectionUpdate(section.id, { content: { ...section.content, products } });
                    }}
                  />
                </div>
              </div>
            );
          }
        }
      }
      switch (selectedSubElement.key) {
        case 'title':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  value={section.content.title || ''}
                  onChange={(e) => {
                    handleSectionUpdate(section.id, {
                      content: { ...section.content, title: e.target.value }
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estilos del título</label>
                <StyleEditor
                  value={section.content.titleStyle || {}}
                  onChange={(styles) => {
                    updateSectionStyles(section.id, 'titleStyle', styles);
                  }}
                />
              </div>
            </div>
          );
        case 'description':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={section.content.description || ''}
                  onChange={(e) => {
                    handleSectionUpdate(section.id, {
                      content: { ...section.content, description: e.target.value }
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estilos de la descripción</label>
                <StyleEditor
                  value={section.content.descriptionStyle || {}}
                  onChange={(styles) => {
                    updateSectionStyles(section.id, 'descriptionStyle', styles);
                  }}
                />
              </div>
            </div>
          );
        case 'backgroundImage':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Imagen de fondo</label>
                <ImageUploader
                  value={section.content.backgroundImage || ''}
                  onChange={(url) => {
                    handleSectionUpdate(section.id, {
                      content: { ...section.content, backgroundImage: url }
                    });
                  }}
                  placeholder="Imagen de fondo del hero"
                  className="aspect-video"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color de fondo</label>
                <input
                  type="color"
                  value={section.content.style?.backgroundColor || '#ffffff'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { backgroundColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color del overlay</label>
                <input
                  type="color"
                  value={section.content.style?.overlayColor || '#000000'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opacidad del overlay</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={section.content.style?.overlayOpacity ?? 0}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayOpacity: parseFloat(e.target.value) });
                  }}
                  className="w-full"
                />
                <span className="text-xs ml-2">{Math.round((section.content.style?.overlayOpacity ?? 0) * 100)}%</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estilos de la sección</label>
                <StyleEditor
                  value={section.content.style || {}}
                  onChange={(styles) => {
                    updateSectionStyles(section.id, 'style', styles);
                  }}
                />
              </div>
            </div>
          );
        case 'button':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Texto del botón</label>
                <input
                  type="text"
                  value={section.content.buttonText || ''}
                  onChange={(e) => {
                    handleSectionUpdate(section.id, {
                      content: { ...section.content, buttonText: e.target.value }
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estilos del botón</label>
                <StyleEditor
                  value={section.content.buttonStyle || {}}
                  onChange={(styles) => {
                    updateSectionStyles(section.id, 'buttonStyle', styles);
                  }}
                />
              </div>
            </div>
          );
        default:
          break;
      }
    }
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            {/* Fondo de la sección */}
            <div className="space-y-2 p-4 border rounded-md bg-gray-50">
              <div className="font-semibold mb-2">Fondo de la sección</div>
              <div>
                <label className="block text-sm font-medium mb-2">Imagen de fondo</label>
                <ImageUploader
                  value={section.content.backgroundImage || ''}
                  onChange={(url) => {
                    handleSectionUpdate(section.id, {
                      content: { ...section.content, backgroundImage: url }
                    });
                  }}
                  placeholder="Imagen de fondo del hero"
                  className="aspect-video"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color de fondo</label>
                <input
                  type="color"
                  value={section.content.style?.backgroundColor || '#ffffff'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { backgroundColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color del overlay</label>
                <input
                  type="color"
                  value={section.content.style?.overlayColor || '#000000'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opacidad del overlay</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={section.content.style?.overlayOpacity ?? 0}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayOpacity: parseFloat(e.target.value) });
                  }}
                  className="w-full"
                />
                <span className="text-xs ml-2">{Math.round((section.content.style?.overlayOpacity ?? 0) * 100)}%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                type="text"
                value={section.content.title || ''}
                onChange={(e) => {
                  handleSectionUpdate(section.id, {
                    content: { ...section.content, title: e.target.value }
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estilos del título</label>
              <StyleEditor
                value={section.content.titleStyle || {}}
                onChange={(styles) => {
                  updateSectionStyles(section.id, 'titleStyle', styles);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => {
                  handleSectionUpdate(section.id, {
                    content: { ...section.content, description: e.target.value }
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Imagen de fondo</label>
              <ImageUploader
                value={section.content.backgroundImage || ''}
                onChange={(url) => {
                  handleSectionUpdate(section.id, {
                    content: { ...section.content, backgroundImage: url }
                  });
                }}
                placeholder="Imagen de fondo del hero"
                className="aspect-video"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estilos de la descripción</label>
              <StyleEditor
                value={section.content.descriptionStyle || {}}
                onChange={(styles) => {
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
                  handleSectionUpdate(section.id, {
                    content: { ...section.content, buttonText: e.target.value }
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estilos del botón</label>
              <StyleEditor
                value={section.content.buttonStyle || {}}
                onChange={(styles) => {
                  updateSectionStyles(section.id, 'buttonStyle', styles);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estilos de la sección</label>
              <StyleEditor
                value={section.content.style || {}}
                onChange={(styles) => {
                  updateSectionStyles(section.id, 'style', styles);
                }}
              />
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            {/* Fondo de la sección */}
            <div className="space-y-2 p-4 border rounded-md bg-gray-50">
              <div className="font-semibold mb-2">Fondo de la sección</div>
              <div>
                <label className="block text-sm font-medium mb-2">Color de fondo</label>
                <input
                  type="color"
                  value={section.content.style?.backgroundColor || '#ffffff'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { backgroundColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color del overlay</label>
                <input
                  type="color"
                  value={section.content.style?.overlayColor || '#000000'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opacidad del overlay</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={section.content.style?.overlayOpacity ?? 0}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayOpacity: parseFloat(e.target.value) });
                  }}
                  className="w-full"
                />
                <span className="text-xs ml-2">{Math.round((section.content.style?.overlayOpacity ?? 0) * 100)}%</span>
              </div>
            </div>
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
            {/* Fondo de la sección */}
            <div className="space-y-2 p-4 border rounded-md bg-gray-50">
              <div className="font-semibold mb-2">Fondo de la sección</div>
              <div>
                <label className="block text-sm font-medium mb-2">Color de fondo</label>
                <input
                  type="color"
                  value={section.content.style?.backgroundColor || '#ffffff'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { backgroundColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color del overlay</label>
                <input
                  type="color"
                  value={section.content.style?.overlayColor || '#000000'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opacidad del overlay</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={section.content.style?.overlayOpacity ?? 0}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayOpacity: parseFloat(e.target.value) });
                  }}
                  className="w-full"
                />
                <span className="text-xs ml-2">{Math.round((section.content.style?.overlayOpacity ?? 0) * 100)}%</span>
              </div>
            </div>
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
            {/* Fondo de la sección */}
            <div className="space-y-2 p-4 border rounded-md bg-gray-50">
              <div className="font-semibold mb-2">Fondo de la sección</div>
              <div>
                <label className="block text-sm font-medium mb-2">Color de fondo</label>
                <input
                  type="color"
                  value={section.content.style?.backgroundColor || '#ffffff'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { backgroundColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color del overlay</label>
                <input
                  type="color"
                  value={section.content.style?.overlayColor || '#000000'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opacidad del overlay</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={section.content.style?.overlayOpacity ?? 0}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayOpacity: parseFloat(e.target.value) });
                  }}
                  className="w-full"
                />
                <span className="text-xs ml-2">{Math.round((section.content.style?.overlayOpacity ?? 0) * 100)}%</span>
              </div>
            </div>
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
            {/* Fondo de la sección */}
            <div className="space-y-2 p-4 border rounded-md bg-gray-50">
              <div className="font-semibold mb-2">Fondo de la sección</div>
              <div>
                <label className="block text-sm font-medium mb-2">Color de fondo</label>
                <input
                  type="color"
                  value={section.content.style?.backgroundColor || '#ffffff'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { backgroundColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color del overlay</label>
                <input
                  type="color"
                  value={section.content.style?.overlayColor || '#000000'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opacidad del overlay</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={section.content.style?.overlayOpacity ?? 0}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayOpacity: parseFloat(e.target.value) });
                  }}
                  className="w-full"
                />
                <span className="text-xs ml-2">{Math.round((section.content.style?.overlayOpacity ?? 0) * 100)}%</span>
              </div>
            </div>
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

      case 'contact':
        return (
          <div className="space-y-4">
            {/* Fondo de la sección */}
            <div className="space-y-2 p-4 border rounded-md bg-gray-50">
              <div className="font-semibold mb-2">Fondo de la sección</div>
              <div>
                <label className="block text-sm font-medium mb-2">Color de fondo</label>
                <input
                  type="color"
                  value={section.content.style?.backgroundColor || '#ffffff'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { backgroundColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color del overlay</label>
                <input
                  type="color"
                  value={section.content.style?.overlayColor || '#000000'}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayColor: e.target.value });
                  }}
                  className="w-12 h-8 p-0 border-0 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opacidad del overlay</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={section.content.style?.overlayOpacity ?? 0}
                  onChange={e => {
                    updateSectionStyles(section.id, 'style', { overlayOpacity: parseFloat(e.target.value) });
                  }}
                  className="w-full"
                />
                <span className="text-xs ml-2">{Math.round((section.content.style?.overlayOpacity ?? 0) * 100)}%</span>
              </div>
            </div>
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
              <label className="block text-sm font-medium mb-2">Información de contacto</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={section.content.email || ''}
                    onChange={(e) => handleSectionUpdate(section.id, {
                      content: { ...section.content, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={section.content.phone || ''}
                    onChange={(e) => handleSectionUpdate(section.id, {
                      content: { ...section.content, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dirección</label>
                  <textarea
                    value={section.content.address || ''}
                    onChange={(e) => handleSectionUpdate(section.id, {
                      content: { ...section.content, address: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mapa de Google</label>
                  <textarea
                    value={section.content.mapEmbed || ''}
                    onChange={(e) => handleSectionUpdate(section.id, {
                      content: { ...section.content, mapEmbed: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Enlaces de redes sociales</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={section.content.socialLinks?.facebook || ''}
                      onChange={(e) => handleSectionUpdate(section.id, {
                        content: { ...section.content, socialLinks: { ...section.content.socialLinks, facebook: e.target.value } }
                      })}
                      placeholder="Facebook"
                    />
                    <input
                      type="text"
                      value={section.content.socialLinks?.instagram || ''}
                      onChange={(e) => handleSectionUpdate(section.id, {
                        content: { ...section.content, socialLinks: { ...section.content.socialLinks, instagram: e.target.value } }
                      })}
                      placeholder="Instagram"
                    />
                    <input
                      type="text"
                      value={section.content.socialLinks?.twitter || ''}
                      onChange={(e) => handleSectionUpdate(section.id, {
                        content: { ...section.content, socialLinks: { ...section.content.socialLinks, twitter: e.target.value } }
                      })}
                      placeholder="Twitter"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mostrar redes sociales</label>
                  <input
                    type="checkbox"
                    checked={section.content.showSocialMedia || false}
                    onChange={(e) => handleSectionUpdate(section.id, {
                      content: { ...section.content, showSocialMedia: e.target.checked }
                    })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
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
        "min-h-screen flex flex-col",
        isFullscreen && "bg-gray-100"
      )}
    >
      {/* Panel izquierdo - Secciones disponibles */}
      <ResizablePanel
        title="Secciones"
        defaultWidth={isFullscreen ? 220 : 280}
        position="left"
        className={cn(
          "border-r",
          isFullscreen && "border-gray-200 fixed z-40 bg-white/95 backdrop-blur-sm shadow-xl rounded-r-lg"
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
              onDragEnd={handleDragEnd}
              onClick={() => handleAddSection(type as PageSection['type'])}
              className={cn(
                "p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-all duration-200",
                isFullscreen && "p-2",
                isDragging && "hover:bg-primary/20 hover:border-primary border-2 border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("text-2xl", isFullscreen && "text-lg")}>{config.icon}</span>
                <div className={cn(isFullscreen && "text-sm")}>
                  <h3 className="font-medium">{config.name}</h3>
                  {!isFullscreen && <p className="text-sm text-gray-500">{config.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ResizablePanel>

      {/* Panel central - Vista previa */}
      <div className={cn(
        "flex-1 bg-gray-100 transition-all",
        isFullscreen ? "p-4 overflow-y-auto" : "p-8 mb-12"
      )}>
        {/* Fullscreen indicator */}
        {isFullscreen && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg">
            <span className="text-sm">Modo pantalla completa</span>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
              title="Salir de pantalla completa"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div
          className={cn(
            "mx-auto bg-white shadow-lg transition-all",
            isFullscreen ? 'w-full' : (
              viewMode === 'desktop' && 'max-w-6xl w-full' ||
              viewMode === 'tablet' && 'max-w-md w-full' ||
              viewMode === 'mobile' && 'max-w-xs w-full'
            ),
            'relative'
          )}
          style={{
            border: viewMode !== 'desktop' ? '1px solid #e5e7eb' : undefined,
            borderRadius: viewMode !== 'desktop' ? 24 : undefined,
            overflow: 'hidden',
            minHeight: isFullscreen ? 'calc(100vh - 2rem)' : 400
          }}
        >
          {/* Initial drop zone */}
          {isDragging && (
            <motion.div
              className={cn(
                "h-2 mx-4 mb-2 border-2 border-dashed border-primary/30 rounded transition-all",
                dragOverIndex === 0 ? "border-primary bg-primary/10 h-8" : "opacity-50"
              )}
              onDragOver={e => handleDragOver(e, 0)}
              onDrop={e => handleDrop(e, 0)}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: dragOverIndex === 0 ? 32 : 8 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
          
          {currentPage.content.sections
            .sort((a, b) => a.order - b.order)
            .map((section, idx) => (
              <React.Fragment key={section.id}>
                {/* Drop zone visual indicator */}
                {isDragging && (
                  <motion.div
                    className={cn(
                      "h-2 mx-4 mb-2 border-2 border-dashed border-primary/30 rounded transition-all",
                      dragOverIndex === idx ? "border-primary bg-primary/10 h-8" : "opacity-50"
                    )}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: dragOverIndex === idx ? 32 : 8 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isDragging && draggedSection.current?.id === section.id ? 0.3 : 1,
                    y: 0,
                    scale: isDragging && draggedSection.current?.id === section.id ? 0.95 : 1
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    layout: { duration: 0.3, ease: "easeInOut" },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 }
                  }}
                  draggable
                  onDragStart={() => handleDragStart(section)}
                  onDragEnd={handleDragEnd}
                  onClick={e => { e.stopPropagation(); setSelectedSectionId(section.id); setSelectedSubElement(null); }}
                  className={cn(
                    'cursor-pointer group relative transition-all mb-4',
                    selectedSectionId === section.id ? 'ring-4 ring-primary/60 z-10' : '',
                    isDragging && 'cursor-grabbing'
                  )}
                  style={{ position: 'relative' }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Drag handle indicator */}
                  <motion.div 
                    className="absolute top-2 right-2 bg-gray-800 text-white p-1 rounded text-xs cursor-grab z-20"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ⋮⋮
                  </motion.div>
                  
                  {/* Botón eliminar sección */}
                  <motion.button
                    onClick={e => { e.stopPropagation(); handleSectionDelete(section.id); setSelectedSubElement(null); }}
                    className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow z-20"
                    title="Eliminar sección"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Eliminar
                  </motion.button>
                  {/* Renderizado de la sección */}
                  <PagePreview
                    page={{ ...currentPage, content: { ...currentPage.content, sections: [section] } }}
                    selectedSectionId={selectedSectionId === section.id ? section.id : undefined}
                    onSubElementDoubleClick={(sectionId, key) => { setSelectedSectionId(sectionId); setSelectedSubElement({ sectionId, key }); }}
                    selectedSubElement={selectedSubElement}
                    isEditor={true}
                    isFullscreen={isFullscreen}
                  />
                </motion.div>

                {/* Final drop zone */}
                {isDragging && idx === currentPage.content.sections.length - 1 && (
                  <motion.div
                    className={cn(
                      "h-2 mx-4 mt-2 border-2 border-dashed border-primary/30 rounded transition-all",
                      dragOverIndex === idx + 1 ? "border-primary bg-primary/10 h-8" : "opacity-50"
                    )}
                    onDragOver={e => handleDragOver(e, idx + 1)}
                    onDrop={e => handleDrop(e, idx + 1)}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: dragOverIndex === idx + 1 ? 32 : 8 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </React.Fragment>
            ))}
        </div>
      </div>

      {/* Panel derecho - Configuración de sección */}
      {selectedSectionId && (
        <ResizablePanel
          title="Configuración"
          defaultWidth={isFullscreen ? 300 : 360}
          onClose={() => { setSelectedSectionId(null); setSelectedSubElement(null); }}
          className={cn(
            isFullscreen && "fixed right-0 z-40 bg-white/95 backdrop-blur-sm shadow-xl rounded-l-lg border-gray-200"
          )}
        >
          <div className="p-4">
            {(() => {
              const section = currentPage.content.sections.find(s => s.id === selectedSectionId)!;
              // Si es testimonials y hay sub-elemento seleccionado, filtrar solo ese testimonial
              if (section.type === 'testimonials' && selectedSubElement && selectedSubElement.key.startsWith('testimonial-')) {
                const match = selectedSubElement.key.match(/testimonial\-(name|role|text|container)\-(\d+)/);
                if (match) {
                  const idx = parseInt(match[2], 10);
                  const testimonial = section.content.testimonials[idx];
                  if (testimonial) {
                    const filteredSection = { ...section, content: { ...section.content, testimonials: [testimonial] } };
                    return renderSectionFields(filteredSection);
                  }
                }
              }
              // Si es contact y hay sub-elemento seleccionado, renderizar solo ese campo
              if (section.type === 'contact' && selectedSubElement && selectedSubElement.key.startsWith('contact-')) {
                return renderSectionFields(section);
              }
              // Por defecto, renderizar toda la sección
              return renderSectionFields(section);
            })()}
          </div>
        </ResizablePanel>
      )}

      {/* Barra de herramientas flotante SIEMPRE visible y fija */}
      <div className="fixed z-50 bg-white shadow-lg flex items-center gap-4
        w-full left-0 bottom-0 px-2 py-1 rounded-none
        md:w-auto md:left-1/2 md:bottom-4 md:translate-x-[-50%] md:rounded-full md:px-4 md:py-2">
        <div className="flex items-center gap-2 border-r pr-2 md:pr-4 w-full md:w-auto justify-center">
          <button
            onClick={() => setViewMode('desktop')}
            className={cn(
              "p-2 rounded-lg transition-colors cursor-pointer",
              viewMode === 'desktop' ? 'bg-[var(--color-primary-100)]' : 'hover:bg-[var(--color-primary-50)]'
            )}
            title="Vista escritorio"
          >
            <DesktopIcon className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-primary-600)]" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
          <button
            onClick={handleSave}
            className={cn(
              "px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base cursor-pointer",
              isDirty ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-500"
            )}
            disabled={!isDirty}
          >
            Guardar
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-3 py-2 md:px-4 md:py-2 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors text-sm md:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Publicando...
              </>
            ) : (
              'Publicar'
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-[var(--color-primary-50)] transition-colors cursor-pointer"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <MinimizeIcon className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-primary-600)]" />
            ) : (
              <MaximizeIcon className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-primary-600)]" />
            )}
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-lg hover:bg-[var(--color-primary-50)] transition-colors cursor-pointer"
            title="Ayuda"
          >
            <HelpIcon className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-primary-600)]" />
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
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
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