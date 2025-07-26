import { useState } from 'react';

export default function Settings() {
  const [company, setCompany] = useState('Nombre Empresa');
  const [companyType, setCompanyType] = useState('Tipo de empresa');
  const [email, setEmail] = useState('empresa@email.com');
  const [phone, setPhone] = useState('1234567890');
  const [language, setLanguage] = useState('es');
  const [theme, setTheme] = useState('light');

  return (
    <div className="min-h-screen h-screen w-full p-10 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">Configuración</h1>
      {/* General */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la empresa</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de empresa</label>
            <input type="text" value={companyType} onChange={e => setCompanyType(e.target.value)} className="w-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Idioma</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]">
              <option value="es">Español</option>
              <option value="en">Próximamente más idiomas...</option>
            </select>
          </div>
        </div>
      </section>
      <hr className="my-4 border-gray-300" />
      {/* Apariencia */}
      <section className="mb-2">
        <h2 className="text-2xl font-semibold mb-4">Apariencia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Tema</label>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="w-xs rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]">
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="system">Sistema</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
} 