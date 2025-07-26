import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DesignSystem from './pages/design-system'
import Marketing from './pages/Marketing.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ProductsServices from './pages/ProductsServices.tsx'
import CentralOperations from './pages/CentralOperations.tsx'
import Settings from './pages/Settings.tsx'
import Layout from './pages/Layout.tsx'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import PagePreview from './components/marketing/PagePreview';
import { useParams,useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Login from './pages/Login';
import Register from './pages/Register';
import LoginRegister from './pages/Login-register';
import ChatButton from './components/ChatButton';
import Home from './pages/Home.tsx';
import Perfil from './pages/Perfil.tsx';
import React from 'react';
import { CompanyProvider } from './context/CompanyContext';
import { client } from './supabase/client'; // Importa el cliente de Supabase


function RequireAuth({ children }: { children: React.ReactElement }) {
    const location = useLocation();
    const [session, setSession] = useState<unknown>(null); // Estado para la sesión de Supabase
    const [loading, setLoading] = useState(true); // Estado para controlar si estamos cargando la sesión

    useEffect(() => {

      //Obtener la sesión inicial al cargar el componente
      const getInitialSession = async () => {
        const { data: { session } } = await client.auth.getSession();
        setSession(session);
        setLoading(false);
      };

    

      getInitialSession();

      //Suscribirse a los cambios de estado de autenticación
      // La suscripción devuelve un objeto con una propiedad 'subscription'
      const { data: { subscription } } = client.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session); // Actualiza la sesión cuando cambia el estado
          setLoading(false); // Ya no estamos cargando después del primer cambio o inicial
        }
      );

      //Limpiar la suscripción cuando el componente se desmonte
      return () => {
        subscription.unsubscribe();
      };
    }, []); // El array de dependencias vacío asegura que se ejecute una sola vez al montar el componente.

    // Si aún estamos cargando la sesión, muestra un indicador de carga.
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando autenticación...</div>;
    }

    // Si no hay sesión (usuario no autenticado), redirige al login
    if (!session) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si hay sesión (usuario autenticado), renderiza los componentes hijos
    return children;
}

// Componente auxiliar para el catch-all, para verificar la autenticación
function AuthRedirect() {
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await client.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    checkSession();
  }, []); // Solo se ejecuta una vez al montar

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;
  }

  // Si hay sesión, redirige a /app; si no, a /
  return session ? <Navigate to="/app" replace /> : <Navigate to="/" replace />;
}

function PublicSite() {
  const { siteId } = useParams();
  const [page, setPage] = useState<unknown>(null);
  useEffect(() => {
    if (siteId) {
      getDoc(doc(db, 'sites', siteId)).then((snap) => {
        if (snap.exists()) setPage(snap.data());
        else setPage(null);
      });
    }
  }, [siteId]);
  if (!page) return <div className="min-h-screen flex items-center justify-center text-gray-500">Sitio no encontrado</div>;
  return <PagePreview page={page} isEditor={false} />;
}

function LayoutWithChat() {
  return (
    <>
      <Layout />
      <ChatButton section="global" />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas*/}
          <Route path="/site/:siteId" element={<PublicSite />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<LoginRegister />} />
          
          {/* Rutas Privadas*/}
          <Route path="/app" element={
            <RequireAuth>
              <LayoutWithChat />
            </RequireAuth>
          }>
            <Route index element={<Home />} />
            <Route path="design-system" element={<DesignSystem />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="products-services" element={<ProductsServices />} />
            <Route path="central-operations" element={<CentralOperations />} />
            <Route path="settings" element={<Settings />} />
          </Route>


          {/* Catch-all: si no está autenticado, ve a /, si sí, ve a /app */}
          <Route path="*" element={<AuthRedirect />} />
      </Routes>
    </BrowserRouter>
    </CompanyProvider>
  </StrictMode>
)
