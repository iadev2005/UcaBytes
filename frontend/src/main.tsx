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
import { useParams } from 'react-router-dom';
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

// Mock de autenticación: revisa si hay 'auth' en localStorage
function isAuthenticated() {
  return localStorage.getItem('auth') === 'true';
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function PublicSite() {
  const { siteId } = useParams();
  const [page, setPage] = useState<any>(null);
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
        <Route path="/site/:siteId" element={<PublicSite />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<LoginRegister />} />
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
        <Route path="*" element={isAuthenticated() ? <Navigate to="/app" replace /> : <Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </CompanyProvider>
  </StrictMode>
)
