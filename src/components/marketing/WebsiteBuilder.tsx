import { useState } from 'react';
import type { BusinessPage, WebTemplate } from '../../types/templates';
import { WEBSITE_TEMPLATES } from '../../config/templates';
import { cn } from '../../lib/utils';
import TemplateGallery from './TemplateGallery';
import PageBuilder from './PageBuilder';
import BusinessInfoForm from './BusinessInfoForm';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

type StepId = 'template' | 'info' | 'editor';

export default function WebsiteBuilder() {
  const [currentStep, setCurrentStep] = useState<StepId>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<WebTemplate | null>(null);
  const [currentPage, setCurrentPage] = useState<BusinessPage | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [publishedLink, setPublishedLink] = useState<string | null>(null);

  const handleTemplateSelect = (template: WebTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('info');
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
      <header className="bg-white border-b sticky top-0 z-50">
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
        {/* Tutorial inicial */}
        {showTutorial && currentStep === 'template' && (
          <div className="mb-8 bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                    💡
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    ¡Bienvenido al Generador de Sitios Web!
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Crear tu sitio web es fácil:</p>
                    <ol className="list-decimal ml-4 mt-2 space-y-1">
                      <li>Elige una plantilla que te guste</li>
                      <li>Ingresa la información de tu negocio</li>
                      <li>Personaliza el contenido a tu gusto</li>
                    </ol>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-blue-700 hover:text-blue-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

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