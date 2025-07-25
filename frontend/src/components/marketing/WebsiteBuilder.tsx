import { useState } from 'react';
import type { BusinessPage, WebTemplate } from '../../types/templates';
import { WEBSITE_TEMPLATES } from '../../config/templates';
import TemplateGallery from './TemplateGallery';
import PageBuilder from './PageBuilder';
import BusinessInfoForm from './BusinessInfoForm';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

type StepId = 'template' | 'info' | 'editor';

// Cambiar el tipo de info para incluir fontFamily
// y actualizar el tipo de theme.fontFamily en BusinessPage

type BusinessInfo = Pick<BusinessPage, 'url' | 'rif' | 'businessName'> & { fontFamily: 'syne' | 'arial' | 'georgia' | 'mono' };

export default function WebsiteBuilder() {
  const [currentStep, setCurrentStep] = useState<StepId>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<WebTemplate | null>(null);
  const [currentPage, setCurrentPage] = useState<BusinessPage | null>(null);
  const [publishedLink, setPublishedLink] = useState<string | null>(null);

  const handleTemplateSelect = (template: WebTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('info');
  };

  const handleBusinessInfo = (info: BusinessInfo) => {
    if (!selectedTemplate) return;

    const newPage: BusinessPage = {
      ...info,
      templateId: selectedTemplate.id,
      content: {
        sections: selectedTemplate.defaultSections,
        theme: {
          ...selectedTemplate.defaultTheme,
          fontFamily: info.fontFamily,
        },
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCurrentPage(newPage);
    setCurrentStep('editor');
  };

  const handleSavePage = async (page: BusinessPage) => {
    // TODO: Implementar guardado en backend
    console.log('Guardando página:', page);
    setCurrentPage(page);
  };

  const handlePublishPage = async (page: BusinessPage) => {
    const publishedPage = {
      ...page,
      status: 'published' as const,
      updatedAt: new Date()
    };
    console.log('Publicando página:', publishedPage);
    setCurrentPage(publishedPage);
    // Guardar en Firestore bajo la colección 'sites' y el ID igual a la url
    if (publishedPage.url) {
      await setDoc(doc(db, 'sites', publishedPage.url), publishedPage);
      setPublishedLink(`/site/${publishedPage.url}`);
    }
  };

  const handleBack = () => {
    if (currentStep === 'editor') {
      setCurrentStep('info');
    } else if (currentStep === 'info') {
      setCurrentStep('template');
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-white border-b sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Generador de Sitios Web
            </h1>
            {currentStep !== 'template' && (
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Volver
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'template' && (
          <TemplateGallery
            templates={WEBSITE_TEMPLATES}
            onTemplateSelect={handleTemplateSelect}
          />
        )}

        {currentStep === 'info' && selectedTemplate && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">
                    Plantilla seleccionada: {selectedTemplate.name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Ahora, completa la información básica de tu negocio
                  </p>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedTemplate.thumbnail}
                      alt={`Vista previa de ${selectedTemplate.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Características incluidas:
                  </h3>
                  <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {selectedTemplate.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <BusinessInfoForm onSubmit={handleBusinessInfo} />
          </div>
        )}

        {currentStep === 'editor' && currentPage && (
          <PageBuilder
            page={currentPage}
            onSave={handleSavePage}
            onPublish={handlePublishPage}
          />
        )}
      {publishedLink && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg px-6 py-4 z-50 border border-primary flex flex-col items-center gap-2">
          <div className="font-semibold text-primary">¡Tu sitio está publicado!</div>
          <a href={publishedLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{window.location.origin + publishedLink}</a>
          <button
            className="mt-2 px-4 py-1 bg-primary text-white rounded"
            onClick={() => navigator.clipboard.writeText(window.location.origin + publishedLink)}
          >
            Copiar enlace
          </button>
        </div>
      )}
      </main>
    </div>
  );
} 