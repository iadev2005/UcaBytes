import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import WebsiteBuilder from '../components/marketing/WebsiteBuilder';
import InstagramAssistant from '../components/marketing/InstagramAssistant';
import LoadingScreen from '../components/marketing/LoadingScreen';
import TokenInputModal from '../components/marketing/TokenInputModal';
import TokenGuide from '../components/marketing/TokenGuide';
import { SidebarCollapseContext } from './Layout';
import { GlobeIcon } from '../icons';

export default function Marketing() {
  const { isSidebarCollapsed } = useContext(SidebarCollapseContext);
  const [searchParams] = useSearchParams();
  const [showBuilder, setShowBuilder] = useState(false);
  const [showInstagramAssistant, setShowInstagramAssistant] = useState(false);
  const [instagramPosts, setInstagramPosts] = useState(null);
  const [loadingInstagram, setLoadingInstagram] = useState(false);
  
  // Estados para el token
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [currentToken, setCurrentToken] = useState<string>('');
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showTokenGuide, setShowTokenGuide] = useState(false);

  // Función para cargar token guardado
  const loadSavedToken = async () => {
    const savedToken = localStorage.getItem('instagram_token');
    const tokenValid = localStorage.getItem('instagram_token_valid');
    
    if (savedToken && tokenValid === 'true') {
      // Validar el token guardado para asegurar que sigue siendo válido
      try {
        const response = await fetch('http://localhost:3001/api/instagram/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: savedToken }),
        });
        
        const data = await response.json();
        
        if (data.valid) {
          setCurrentToken(savedToken);
          setIsTokenValid(true);
          return true;
        } else {
          // Token ya no es válido, limpiarlo
          clearInvalidToken();
          return false;
        }
      } catch (error) {
        // Error de conexión, limpiar token por seguridad
        clearInvalidToken();
        return false;
      }
    }
    return false;
  };

  // Función para guardar token válido
  const saveValidToken = (token: string) => {
    localStorage.setItem('instagram_token', token);
    localStorage.setItem('instagram_token_valid', 'true');
  };

  // Función para limpiar token inválido
  const clearInvalidToken = () => {
    localStorage.removeItem('instagram_token');
    localStorage.removeItem('instagram_token_valid');
  };

  // Funciones para manejar el token
  const handleTokenSubmit = async (token: string) => {
    setValidatingToken(true);
    setTokenError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/instagram/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setCurrentToken(token);
        setIsTokenValid(true);
        saveValidToken(token); // Guardar token válido
        setShowTokenModal(false);
        setTokenError(null);
        // Cargar posts después de validar el token
        await loadInstagramPosts(token);
      } else {
        setTokenError(data.error || 'Token inválido');
        clearInvalidToken(); // Limpiar token inválido
      }
    } catch (error) {
      setTokenError('Error de conexión al validar el token');
    } finally {
      setValidatingToken(false);
    }
  };

  const handleTokenModalClose = () => {
    // Permitir cerrar el modal siempre
    setShowTokenModal(false);
    setTokenError(null);
  };

  const handleShowTokenGuide = () => {
    setShowTokenGuide(true);
  };

  // Función para cargar posts después de validar el token
  const loadInstagramPosts = async (token: string) => {
    console.log('[DEBUG] Marketing - Iniciando carga de posts con token:', token ? 'EXISTE' : 'NO_EXISTE');
    setLoadingInstagram(true);
    try {
      const res = await fetch('http://localhost:3001/api/instagram/fetch-posts', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      console.log('[DEBUG] Marketing - Respuesta de fetch-posts:', data);
      if (data.success) {
        setInstagramPosts(data.posts);
        setShowInstagramAssistant(true);
        console.log('[DEBUG] Marketing - Posts cargados exitosamente, mostrando asistente');
      } else {
        console.error('Error al obtener publicaciones de Instagram:', data);
      }
    } catch (e) {
      console.error('Error de red o backend al cargar posts:', e);
    } finally {
      setLoadingInstagram(false);
    }
  };

  // Cargar token guardado al inicio
  useEffect(() => {
    const initializeToken = async () => {
      await loadSavedToken();
      setTokenLoaded(true);
      setInitializing(false);
    };
    
    initializeToken();
  }, []);

  // Manejar parámetros de URL para acceso rápido
  useEffect(() => {
    const urlAction = searchParams.get('action');
    
    if (urlAction === 'asistente-instagram') {
      // Cargar automáticamente el asistente de Instagram
      const loadInstagramAssistant = async () => {
        setLoadingInstagram(true);
        try {
          // Usar el token guardado si está disponible
          const tokenToUse = currentToken || localStorage.getItem('instagram_token');
          
          if (!tokenToUse) {
            alert('Se requiere un token de Instagram válido');
            setLoadingInstagram(false);
            return;
          }
          
          const res = await fetch('http://localhost:3001/api/instagram/fetch-posts', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: tokenToUse })
          });
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
      };
      
      loadInstagramAssistant();
    }
  }, [searchParams, currentToken]);



  if (loadingInstagram) {
    return <LoadingScreen message="Cargando Asistente de Instagram..." subtitle="Obteniendo publicaciones y datos" />;
  }
  if (showBuilder) {
    return <WebsiteBuilder />;
  }
  if (showInstagramAssistant) {
    return <InstagramAssistant 
      posts={instagramPosts} 
      isSidebarCollapsed={isSidebarCollapsed}
      token={currentToken}
    />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8 h-screen w-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-primary-700)] mb-4 mt-8">
            Impulsa tu presencia digital
          </h1>
        </div>

        <div className="flex flex-col min-h-[60vh] justify-center items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Card WebsiteBuilder */}
          <button
            onClick={() => setShowBuilder(true)}
            className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-3xl shadow-2xl p-10 text-left transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-105 cursor-pointer group"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-[var(--color-primary-50)] rounded-full p-4 shadow group-hover:scale-110 transition-transform duration-300">
                <GlobeIcon className="w-14 h-14" style={{ color: 'var(--color-primary-600)' }} />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[var(--color-primary-700)] tracking-tight">Generador de Sitios Web</h2>
            <p className="text-gray-500 text-lg leading-relaxed">Crea sitios web profesionales para PyMEs en minutos. Selecciona una plantilla, personaliza el contenido y publica tu sitio web en pocos pasos.</p>
          </button>

          {/* Card InstagramAssistant */}
          <button
            onClick={() => {
              console.log('[DEBUG] Marketing - Botón clickeado');
              console.log('[DEBUG] Marketing - isTokenValid:', isTokenValid);
              console.log('[DEBUG] Marketing - currentToken:', currentToken ? 'EXISTE' : 'NO_EXISTE');
              
              // Verificar directamente en localStorage si hay un token válido
              const savedToken = localStorage.getItem('instagram_token');
              const tokenValid = localStorage.getItem('instagram_token_valid');
              
              console.log('[DEBUG] Marketing - Token en localStorage:', savedToken ? 'EXISTE' : 'NO_EXISTE');
              console.log('[DEBUG] Marketing - Token válido en localStorage:', tokenValid);
              
              if (savedToken && tokenValid === 'true') {
                console.log('[DEBUG] Marketing - Cargando asistente con token de localStorage');
                // Si hay token válido en localStorage, cargar el asistente directamente
                loadInstagramPosts(savedToken);
              } else {
                console.log('[DEBUG] Marketing - Mostrando modal para token');
                setShowTokenModal(true);
              }
            }}
            disabled={loadingInstagram}
            className={`bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-3xl shadow-2xl p-10 text-left transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-105 cursor-pointer group ${
              loadingInstagram ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-[var(--color-primary-50)] rounded-full p-4 shadow group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" className="w-14 h-10 fill-current text-[var(--color-primary-700)]">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[var(--color-primary-700)] tracking-tight">
              {loadingInstagram ? 'Cargando Asistente...' : 'Asistente de Instagram'}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              {loadingInstagram 
                ? 'Cargando tu asistente de Instagram...' 
                : 'Gestiona tu presencia en Instagram de manera profesional. Visualiza y programa posts, recibe sugerencias con IA, y mantén un calendario de publicaciones optimizado.'
              }
            </p>
          </button>
          </div>
        </div>
      </div>
      {loadingInstagram && <LoadingScreen />}
      
      {/* Modal de Token - Solo mostrar si no hay token válido y no se está inicializando */}
      <TokenInputModal
        isOpen={showTokenModal && !isTokenValid && !initializing}
        onSubmit={handleTokenSubmit}
        onClose={handleTokenModalClose}
        isLoading={validatingToken}
        error={tokenError}
        onShowGuide={handleShowTokenGuide}
      />
      
      <TokenGuide
        isOpen={showTokenGuide}
        onClose={() => setShowTokenGuide(false)}
      />
    </div>
  );
}
