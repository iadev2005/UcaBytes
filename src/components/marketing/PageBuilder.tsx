import { useState } from 'react';
import type { BusinessPage, PageSection } from '../../types/templates';
import { cn } from '../../lib/utils';
import PagePreview from './PagePreview';

type SectionEditorProps = {
  section: PageSection;
  onUpdate: (updatedSection: PageSection) => void;
  onDelete: (sectionId: string) => void;
  onMove: (sectionId: string, direction: 'up' | 'down') => void;
};

const SectionEditor = ({ section, onUpdate, onDelete, onMove }: SectionEditorProps) => {
  const handleVisibilityToggle = () => {
    onUpdate({ ...section, isVisible: !section.isVisible });
  };

  return (
    <div className={cn(
      'border rounded-lg p-4 mb-4 transition-all',
      section.isVisible ? 'bg-white' : 'bg-gray-50'
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMove(section.id, 'up')}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Mover sección arriba"
          >
            ↑
          </button>
          <button
            onClick={() => onMove(section.id, 'down')}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Mover sección abajo"
          >
            ↓
          </button>
          <button
            onClick={handleVisibilityToggle}
            className={cn(
              'p-2 rounded-full',
              section.isVisible ? 'text-green-600' : 'text-gray-400'
            )}
            aria-label={section.isVisible ? 'Ocultar sección' : 'Mostrar sección'}
          >
            👁
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-2 hover:bg-red-100 text-red-600 rounded-full"
            aria-label="Eliminar sección"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Editor específico según el tipo de sección */}
      <div className="space-y-4">
        {section.type === 'hero' && (
          <div className="space-y-4">
            <input
              type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({
                ...section,
                content: { ...section.content, title: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Título principal"
            />
            <textarea
              value={section.content.description || ''}
              onChange={(e) => onUpdate({
                ...section,
                content: { ...section.content, description: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Descripción"
              rows={3}
            />
          </div>
        )}
        
        {section.type === 'features' && (
          <div className="space-y-4">
            {(section.content.features || []).map((feature: any, index: number) => (
              <div key={index} className="flex gap-4">
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => {
                    const features = [...section.content.features];
                    features[index] = { ...feature, title: e.target.value };
                    onUpdate({
                      ...section,
                      content: { ...section.content, features }
                    });
                  }}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Título de la característica"
                />
                <button
                  onClick={() => {
                    const features = section.content.features.filter((_: any, i: number) => i !== index);
                    onUpdate({
                      ...section,
                      content: { ...section.content, features }
                    });
                  }}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const features = [...(section.content.features || []), { title: '', description: '' }];
                onUpdate({
                  ...section,
                  content: { ...section.content, features }
                });
              }}
              className="w-full py-2 border-2 border-dashed rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400"
            >
              + Agregar característica
            </button>
          </div>
        )}

        {/* Agregar más editores específicos para otros tipos de secciones */}
      </div>
    </div>
  );
};

type PageBuilderProps = {
  page: BusinessPage;
  onSave: (page: BusinessPage) => void;
  onPublish: (page: BusinessPage) => void;
};

const PageBuilder = ({ page, onSave, onPublish }: PageBuilderProps) => {
  const [currentPage, setCurrentPage] = useState<BusinessPage>(page);
  const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'preview'>('content');
  const [showPreview, setShowPreview] = useState(false);

  const handleSectionUpdate = (updatedSection: PageSection) => {
    const updatedSections = currentPage.content.sections.map(section =>
      section.id === updatedSection.id ? updatedSection : section
    );
    
    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        sections: updatedSections
      }
    });
  };

  const handleSectionDelete = (sectionId: string) => {
    const updatedSections = currentPage.content.sections.filter(
      section => section.id !== sectionId
    );
    
    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        sections: updatedSections
      }
    });
  };

  const handleSectionMove = (sectionId: string, direction: 'up' | 'down') => {
    const sections = [...currentPage.content.sections];
    const index = sections.findIndex(section => section.id === sectionId);
    
    if (direction === 'up' && index > 0) {
      [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }
    
    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        sections: sections
      }
    });
  };

  const handleAddSection = (type: PageSection['type']) => {
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      type,
      content: {},
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Editor de Página</h1>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                'px-4 py-2 rounded-md',
                showPreview
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              {showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => onSave(currentPage)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Guardar borrador
            </button>
            <button
              onClick={() => onPublish(currentPage)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Publicar
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <div className={cn(
            'transition-all duration-300',
            showPreview ? 'w-1/2' : 'w-full'
          )}>
            <div className="mb-6">
              <div className="flex gap-4 border-b">
                <button
                  onClick={() => setActiveTab('content')}
                  className={cn(
                    'px-4 py-2 -mb-px',
                    activeTab === 'content'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500'
                  )}
                >
                  Contenido
                </button>
                <button
                  onClick={() => setActiveTab('theme')}
                  className={cn(
                    'px-4 py-2 -mb-px',
                    activeTab === 'theme'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500'
                  )}
                >
                  Tema
                </button>
              </div>
            </div>

            {activeTab === 'content' && (
              <div>
                <div className="space-y-6">
                  {currentPage.content.sections
                    .sort((a, b) => a.order - b.order)
                    .map(section => (
                      <SectionEditor
                        key={section.id}
                        section={section}
                        onUpdate={handleSectionUpdate}
                        onDelete={handleSectionDelete}
                        onMove={handleSectionMove}
                      />
                    ))}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Agregar nueva sección</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['hero', 'features', 'about', 'products', 'contact', 'testimonials'].map(type => (
                      <button
                        key={type}
                        onClick={() => handleAddSection(type as PageSection['type'])}
                        className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                      >
                        <span className="font-medium">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color primario
                  </label>
                  <input
                    type="color"
                    value={currentPage.content.theme.primaryColor}
                    onChange={(e) => setCurrentPage({
                      ...currentPage,
                      content: {
                        ...currentPage.content,
                        theme: {
                          ...currentPage.content.theme,
                          primaryColor: e.target.value
                        }
                      }
                    })}
                    className="w-full h-10 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color secundario
                  </label>
                  <input
                    type="color"
                    value={currentPage.content.theme.secondaryColor}
                    onChange={(e) => setCurrentPage({
                      ...currentPage,
                      content: {
                        ...currentPage.content,
                        theme: {
                          ...currentPage.content.theme,
                          secondaryColor: e.target.value
                        }
                      }
                    })}
                    className="w-full h-10 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fuente principal
                  </label>
                  <select
                    value={currentPage.content.theme.fontFamily}
                    onChange={(e) => setCurrentPage({
                      ...currentPage,
                      content: {
                        ...currentPage.content,
                        theme: {
                          ...currentPage.content.theme,
                          fontFamily: e.target.value
                        }
                      }
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="sans">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estilo del encabezado
                  </label>
                  <select
                    value={currentPage.content.theme.headerStyle}
                    onChange={(e) => setCurrentPage({
                      ...currentPage,
                      content: {
                        ...currentPage.content,
                        theme: {
                          ...currentPage.content.theme,
                          headerStyle: e.target.value as any
                        }
                      }
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="minimal">Minimalista</option>
                    <option value="standard">Estándar</option>
                    <option value="hero">Hero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estilo del pie de página
                  </label>
                  <select
                    value={currentPage.content.theme.footerStyle}
                    onChange={(e) => setCurrentPage({
                      ...currentPage,
                      content: {
                        ...currentPage.content,
                        theme: {
                          ...currentPage.content.theme,
                          footerStyle: e.target.value as any
                        }
                      }
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="simple">Simple</option>
                    <option value="detailed">Detallado</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {showPreview && (
            <div className="w-1/2 sticky top-0 h-screen overflow-auto border-l">
              <PagePreview page={currentPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBuilder; 