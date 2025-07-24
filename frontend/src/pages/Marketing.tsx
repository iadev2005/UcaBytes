import { useState } from 'react';
import WebsiteBuilder from '../components/marketing/WebsiteBuilder';

export default function Marketing() {
  const [showBuilder, setShowBuilder] = useState(false);

  if (showBuilder) {
    return <WebsiteBuilder />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-primary-700)] mb-4">
            Marketing Digital
          </h1>
          <p className="text-lg text-gray-600">
            Herramientas profesionales para impulsar tu presencia digital
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <button
            onClick={() => setShowBuilder(true)}
            className="w-full bg-white rounded-xl shadow-lg p-8 text-left transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="text-4xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold mb-2 text-[var(--color-primary-700)]">
              Generador de Sitios Web
            </h2>
            <p className="text-gray-600">
              Crea sitios web profesionales para PyMEs en minutos. Selecciona una plantilla, personaliza el contenido y publica tu sitio web en pocos pasos.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
