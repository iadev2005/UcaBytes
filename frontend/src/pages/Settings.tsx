import { useState } from 'react';

export default function Settings() {
  const [company, setCompany] = useState('Nombre Empresa');
  const [email, setEmail] = useState('empresa@email.com');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('es');
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#3E92EE');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  return (
    <div className="min-h-screen h-screen w-full p-10 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">Configuración</h1>
      {/* General */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la empresa</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Idioma</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]">
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </div>
        </div>
      </section>
      <hr className="my-8 border-gray-300" />
      {/* Apariencia */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Apariencia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Tema</label>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]">
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color primario</label>
            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-12 p-0 border-2 border-gray-300 rounded-lg cursor-pointer" />
          </div>
        </div>
      </section>
      <hr className="my-8 border-gray-300" />
      {/* Notificaciones */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Notificaciones</h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} className="accent-[var(--color-primary-400)] w-5 h-5" />
            <span>Recibir notificaciones por correo</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={pushNotif} onChange={e => setPushNotif(e.target.checked)} className="accent-[var(--color-primary-400)] w-5 h-5" />
            <span>Recibir notificaciones push</span>
          </label>
        </div>
      </section>
    </div>
  );
} 