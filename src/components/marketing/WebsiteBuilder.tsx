import { useState } from 'react';
import type { BusinessPage, WebTemplate } from '../../types/templates';
import { WEBSITE_TEMPLATES } from '../../config/templates';
import TemplateGallery from './TemplateGallery';
import PageBuilder from './PageBuilder';
import BusinessInfoForm from './BusinessInfoForm';

const WebsiteBuilder = () => {
  const [step, setStep] = useState<'template' | 'info' | 'editor'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<WebTemplate | null>(null);
  const [currentPage, setCurrentPage] = useState<BusinessPage | null>(null);

  const handleTemplateSelect = (template: WebTemplate) => {
    setSelectedTemplate(template);
    setStep('info');
  };

  const handleBusinessInfo = (info: Pick<BusinessPage, 'url' | 'rif' | 'businessName'>) => {
    if (!selectedTemplate) return;

    const newPage: BusinessPage = {
      ...info,
      templateId: selectedTemplate.id,
      content: {
        sections: selectedTemplate.defaultSections,
        theme: selectedTemplate.defaultTheme
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCurrentPage(newPage);
    setStep('editor');
  };

  const handleSavePage = async (page: BusinessPage) => {
    // TODO: Implementar guardado en backend
    console.log('Guardando página:', page);
    setCurrentPage(page);
  };

  const handlePublishPage = async (page: BusinessPage) => {
    // TODO: Implementar publicación en backend
    const publishedPage = {
      ...page,
      status: 'published' as const,
      updatedAt: new Date()
    };
    console.log('Publicando página:', publishedPage);
    setCurrentPage(publishedPage);
  };

  const handleBack = () => {
    if (step === 'editor') {
      setStep('info');
    } else if (step === 'info') {
      setStep('template');
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Generador de Sitios Web
            </h1>
            {step !== 'template' && (
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Volver {step === 'editor' ? 'a información' : 'a plantillas'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'template' && (
          <TemplateGallery
            templates={WEBSITE_TEMPLATES}
            onTemplateSelect={handleTemplateSelect}
          />
        )}

        {step === 'info' && selectedTemplate && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">
                Plantilla seleccionada: {selectedTemplate.name}
              </h2>
              <p className="text-gray-600">
                Ahora, completa la información básica de tu negocio
              </p>
            </div>
            <BusinessInfoForm onSubmit={handleBusinessInfo} />
          </div>
        )}

        {step === 'editor' && currentPage && (
          <PageBuilder
            page={currentPage}
            onSave={handleSavePage}
            onPublish={handlePublishPage}
          />
        )}
      </main>
    </div>
  );
};

export default WebsiteBuilder; 