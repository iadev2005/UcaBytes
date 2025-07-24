import { useState } from 'react';
import WebsiteBuilder from '../components/marketing/WebsiteBuilder';
import { GlobeIcon } from '../icons';

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

        <div className="max-w-md mx-auto">
          <div
            tabIndex={0}
            role="button"
            onClick={() => setShowBuilder(true)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setShowBuilder(true)}
            className="group w-full bg-white border border-gray-100 rounded-2xl shadow-lg px-8 py-8 flex flex-col gap-4 transition-all duration-200 cursor-pointer hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary/30"
            aria-label="Abrir generador de sitios web"
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary-100)]">
                <GlobeIcon className="w-7 h-7" style={{ color: 'var(--color-primary-600)' }} />
              </span>
              <h2 className="text-2xl font-bold text-[var(--color-primary-700)]">
                Generador de Sitios Web
              </h2>
            </div>
            <p className="text-base text-gray-600">
              Crea sitios web profesionales para PyMEs en minutos. Selecciona una plantilla, personaliza el contenido y publica tu sitio web en pocos pasos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
