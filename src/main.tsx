import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import DesignSystem from './pages/design-system'
import Marketing from './pages/Marketing.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ProductsServices from './pages/ProductsServices.tsx'
import CentralOperations from './pages/CentralOperations.tsx'
import Automations from './pages/Automations.tsx'
import Settings from './pages/Settings.tsx'
import Layout from './pages/Layout.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
 import LoginRegister from './pages/Login-register.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas sin Layout */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        { <Route path="login-register" element={<LoginRegister />} /> }
        {/* Rutas protegidas con Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="design-system" element={<DesignSystem />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="products-services" element={<ProductsServices />} />
          <Route path="central-operations" element={<CentralOperations />} />
          <Route path="automations" element={<Automations />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
