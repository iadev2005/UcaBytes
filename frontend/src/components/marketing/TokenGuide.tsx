import React, { useState, useContext } from 'react';
import { SidebarCollapseContext } from '../../pages/Layout';

interface TokenGuideProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function TokenGuide({ onClose, isOpen }: TokenGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const { isSidebarCollapsed } = useContext(SidebarCollapseContext);

  const steps = [
    {
      id: 1,
      title: "Crear una Página de Facebook",
      description: "Primero necesitas crear una página de Facebook para tu empresa",
      instructions: [
        "Ve a facebook.com y asegúrate de estar conectado con tu cuenta personal",
        "Haz clic en el botón 'Menú' en la esquina superior derecha (al lado del botón de Messenger)",
        "Selecciona 'Páginas' en el menú desplegable",
        "Haz clic en 'Crear nueva página'",
        "Completa la información de tu empresa:",
        "  - Nombre de la página",
        "  - Categoría de negocio",
        "  - Descripción",
        "  - Información de contacto",
        "Haz clic en 'Crear página'"
      ],
      image: "/images/Screenshot 2025-07-27 200536.png",
      tip: "Asegúrate de usar el nombre real de tu empresa para la página"
    },
    {
      id: 2,
      title: "Conectar Instagram Business",
      description: "Asocia tu cuenta de Instagram a la página de Facebook",
      instructions: [
        "Ve a tu página de Facebook recién creada y cambia a la cuenta de la página desde el botón de perfil en la esquina superior derecha",
        "En el menú lateral izquierdo, busca y haz clic en 'Promocionar publicaciones de Instagram'",
        "Facebook te pedirá conectar tu cuenta de Instagram - haz clic en 'Conectar cuenta' e inicia sesión",
        "Si tu Instagram no es una cuenta Business:",
        "  - Ve a tu perfil de Instagram",
        "  - Haz clic en 'Editar perfil'",
        "  - Busca y haz clic en 'Cambiar a cuenta profesional'",
        "  - Selecciona 'Empresa' como tipo de cuenta",
        "Confirma la conexión entre Facebook e Instagram"
      ],
      image: "/images/Screenshot 2025-07-27 203138.png",
      tip: "Tu cuenta de Instagram debe ser una cuenta Business, no Personal"
    },
    {
      id: 3,
      title: "Registrarse en Meta for Developers",
      description: "Crea una cuenta de desarrollador en Meta",
      instructions: [
        "Ve a developers.facebook.com",
        "Haz clic en 'Iniciar sesión' o 'Registrarse'",
        "Usa tu cuenta personal de Facebook para registrarte",
        "Completa la verificación de identidad si es requerida",
        "Acepta los términos y condiciones",
        "Confirma tu cuenta de desarrollador"
      ],
      image: "/images/Screenshot 2025-07-27 202113.png",
      tip: "Usa la misma cuenta de Facebook que usaste para crear la página"
    },
    {
      id: 4,
      title: "Crear una Aplicación",
      description: "Crea una nueva aplicación en Meta for Developers",
      instructions: [
        "En Meta for Developers, haz clic en 'Mis aplicaciones'",
        "Haz clic en 'Crear aplicación'",
        "Selecciona 'Otro' como tipo de aplicación",
        "Completa la información básica:",
        "  - Nombre de la aplicación (puede ser cualquier nombre, como 'Mi Empresa App', 'Test App', etc.)",
        "  - Email de contacto",
        "En la sección 'Casos de uso', haz clic en la opción 'Todo' y al final de la lista selecciona 'Otro'",
        "Haz clic en 'Siguiente' y en la sección 'Tipo de aplicación' selecciona 'Negocios' o 'Business'",
        "Completa la verificación de seguridad si es requerida",
        "Finalmente, haz clic en 'Crear app'"
      ],
      image: "/images/Screenshot 2025-07-27 201924.png",
      tip: "El nombre de la aplicación puede ser cualquier cosa, como 'Mi Empresa App', 'Test App', 'Mi App', etc. No afecta la funcionalidad"
    },
    {
      id: 5,
      title: "Acceder al Explorador de Graph API",
      description: "Accede a las herramientas para generar el token",
      instructions: [
        "Ve a 'Mis aplicaciones' en Meta for Developers",
        "Haz clic en tu aplicación recién creada",
        "En el menú lateral, posa tu mouse sobre 'Herramientas'",
        "Haz clic en 'Explorador de Graph API'"
      ],
      image: "/images/Screenshot 2025-07-27 203604.png",
      tip: "El explorador te permitirá generar el token de acceso"
    },
    {
      id: 6,
      title: "Agregar Permisos y Generar Token",
      description: "Configura los permisos necesarios y genera el token de acceso",
      instructions: [
        "En el explorador de Graph API, agrega estos permisos:",
        "  - publish_video",
        "  - catalog_management", 
        "  - private_computation_access",
        "  - pages_show_list",
        "  - business_management",
        "  - instagram_basic",
        "  - instagram_manage_comments",
        "  - instagram_manage_insights",
        "  - instagram_content_publish",
        "  - pages_read_engagement",
        "  - pages_manage_metadata",
        "  - pages_read_user_content",
        "  - pages_manage_posts",
        "  - instagram_manage_events",
        "Genera el token de acceso",
        "Copia el token completo",
        "Una vez copiado el token, cierra esta guía y pégalo en el campo correspondiente de la aplicación"
      ],
      image: "/images/Screenshot 2025-07-27 204819.png",
      tip: "Los tokens suelen expirar con el tiempo. Cuando esto suceda, la aplicación te pedirá un nuevo token, tendrás que generar uno nuevo y pegarlo"
    }
  ];

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out" 
         style={{ 
           marginLeft: isSidebarCollapsed ? '4rem' : '20rem',
           width: isSidebarCollapsed ? 'calc(100% - 4rem)' : 'calc(100% - 20rem)'
         }}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--color-primary-600)] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Guía para Obtener Token de Instagram</h2>
              <p className="text-blue-100 mt-1">Sigue estos pasos para configurar tu cuenta</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Paso {currentStep} de {steps.length}</span>
              <span>{Math.round((currentStep / steps.length) * 100)}% completado</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {currentStepData.description}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Instrucciones:</h4>
            <ol className="space-y-2">
              {currentStepData.instructions.map((instruction, index) => {
                // Si la instrucción empieza con espacios y un guión, es una sublista
                if (instruction.trim().startsWith('-')) {
                  return (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="w-6 mr-3 mt-0.5 flex-shrink-0"></span>
                      <span className="ml-6">{instruction.trim()}</span>
                    </li>
                  );
                }
                // Si es una instrucción principal
                return (
                  <li key={index} className="text-gray-700 flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                      {currentStepData.instructions.filter((_, i) => i < index && !currentStepData.instructions[i].trim().startsWith('-')).length + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Tip */}
          <div className={`p-4 mb-6 ${currentStep === 6 ? 'bg-yellow-100 border-l-4 border-yellow-600 shadow-lg' : 'bg-yellow-50 border-l-4 border-yellow-400'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {currentStep === 6 ? (
                  <svg className="h-6 w-6 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${currentStep === 6 ? 'text-yellow-800 font-semibold' : 'text-yellow-700'}`}>
                  <strong>{currentStep === 6 ? '¡IMPORTANTE!' : 'Consejo:'}</strong> {currentStepData.tip}
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="text-center">
              {currentStepData.image && (
                <img 
                  src={currentStepData.image} 
                  alt={`Referencia para ${currentStepData.title}`}
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                  style={{ maxHeight: '300px' }}
                />
              )}
              {!currentStepData.image && (
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Imagen de referencia para el paso {currentStep}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-3">Acciones Rápidas:</h4>
            <div className="flex justify-center">
              <button
                onClick={() => window.open("https://developers.facebook.com", "_blank")}
                className="flex items-center justify-center px-6 py-3 bg-[var(--color-secondary-500)] text-white rounded-lg hover:bg-[var(--color-secondary-600)] transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir Meta Developers
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700 cursor-pointer'
            }`}
          >
            ← Anterior
          </button>
          
          <div className="text-sm text-gray-600">
            Paso {currentStep} de {steps.length}
          </div>
          
          <button
            onClick={currentStep === steps.length ? onClose : nextStep}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              currentStep === steps.length
                ? 'bg-[var(--color-secondary-500)] text-white hover:bg-[var(--color-secondary-600)]'
                : 'bg-[var(--color-secondary-500)] text-white hover:bg-[var(--color-secondary-600)]'
            }`}
          >
            {currentStep === steps.length ? 'Completado' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
} 