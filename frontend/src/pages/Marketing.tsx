import React, { useState, useContext } from 'react';
import WebsiteBuilder from '../components/marketing/WebsiteBuilder';
<<<<<<< HEAD
import { GlobeIcon } from '../icons';
=======
import InstagramAssistant from '../components/marketing/InstagramAssistant';
import LoadingScreen from '../components/marketing/LoadingScreen';
import { SidebarCollapseContext } from './Layout';
>>>>>>> samuel

export default function Marketing() {
  const { isSidebarCollapsed } = useContext(SidebarCollapseContext);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showInstagramAssistant, setShowInstagramAssistant] = useState(false);
  const [instagramPosts, setInstagramPosts] = useState(null);
  const [loadingInstagram, setLoadingInstagram] = useState(false);

  if (loadingInstagram) {
    return <LoadingScreen />;
  }
  if (showBuilder) {
    return <WebsiteBuilder />;
  }
  if (showInstagramAssistant) {
    return <InstagramAssistant posts={instagramPosts} isSidebarCollapsed={isSidebarCollapsed} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-primary-700)] mb-4 mt-8">
            Impulsa tu presencia digital
          </h1>
        </div>

<<<<<<< HEAD
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
=======
        <div className="flex flex-col min-h-[60vh] justify-center items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Card WebsiteBuilder */}
          <button
            onClick={() => setShowBuilder(true)}
            className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-3xl shadow-2xl p-10 text-left transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-105 cursor-pointer group"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-[var(--color-primary-50)] rounded-full p-4 shadow group-hover:scale-110 transition-transform duration-300">
                <span className="text-5xl">🌐</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[var(--color-primary-700)] tracking-tight">Generador de Sitios Web</h2>
            <p className="text-gray-500 text-lg leading-relaxed">Crea sitios web profesionales para PyMEs en minutos. Selecciona una plantilla, personaliza el contenido y publica tu sitio web en pocos pasos.</p>
          </button>

          {/* Card InstagramAssistant */}
          <button
            onClick={async () => {
              setLoadingInstagram(true);
              try {
                const res = await fetch('http://localhost:3001/api/instagram/fetch-posts', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                  setInstagramPosts(data.posts);
                  setShowInstagramAssistant(true);
                } else {
                  alert('Error al obtener publicaciones de Instagram');
                }
              } catch (e) {
                alert('Error de red o backend');
              }
              setLoadingInstagram(false);
            }}
            className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-3xl shadow-2xl p-10 text-left transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-105 cursor-pointer group"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-[var(--color-primary-50)] rounded-full p-4 shadow group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" className="w-14 h-10 fill-current text-[var(--color-primary-700)]">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[var(--color-primary-700)] tracking-tight">Asistente de Instagram</h2>
            <p className="text-gray-500 text-lg leading-relaxed">Gestiona tu presencia en Instagram de manera profesional. Visualiza y programa posts, recibe sugerencias con IA, y mantén un calendario de publicaciones optimizado.</p>
          </button>
>>>>>>> samuel
          </div>
        </div>
      </div>
      {loadingInstagram && <LoadingScreen />}
    </div>
  );
}
