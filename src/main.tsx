import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import DesignSystem from './pages/design-system'
import Layout from './pages/Layout.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="design-system" element={<DesignSystem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
