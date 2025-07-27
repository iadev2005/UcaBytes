import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { updateCompany } from '../supabase/data';

export default function Settings() {
  // Todos los hooks deben ir aquí, antes de cualquier return condicional
  const { companyData, companyLoading, updateCompanyData } = useCompany();
  const [language, setLanguage] = useState('es');
  const [theme, setTheme] = useState('light');
  const [popup, setPopup] = useState<{ open: boolean; message: string; success: boolean }>({ open: false, message: '', success: false });
  const [form, setForm] = useState({
    rif: '',
    razonsocial: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    fecha_fundacion: '',
  });

  // Inicializar los campos editables con los datos originales
  useEffect(() => {
    if (companyData) {
      setForm({
        rif: companyData.rif || '',
        razonsocial: companyData.razonsocial || '',
        descripcion: companyData.descripcion || '',
        direccion: companyData.direccion || '',
        telefono: companyData.telefono || '',
        fecha_fundacion: companyData.fecha_fundacion || '',
      });
    }
  }, [companyData]);

  // Detectar si hay cambios
  const hasChanges =
    form.rif !== (companyData?.rif || '') ||
    form.razonsocial !== (companyData?.razonsocial || '') ||
    form.descripcion !== (companyData?.descripcion || '') ||
    form.direccion !== (companyData?.direccion || '') ||
    form.telefono !== (companyData?.telefono || '') ||
    form.fecha_fundacion !== (companyData?.fecha_fundacion || '');

  // Handler para los campos editables
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handler para aplicar cambios y mostrar popup
  const handleApplyChanges = async () => {
    if (!companyData) return;
    const result = await updateCompany(companyData.id, form);
    setPopup({ open: true, message: result.message, success: result.success });
    if (result.success) {
      updateCompanyData(form);
    }
  };

  // Cerrar popup automáticamente después de 2.5s
  useEffect(() => {
    if (popup.open) {
      const timer = setTimeout(() => setPopup({ ...popup, open: false }), 2500);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  // Returns condicionales después de los hooks
  if (companyLoading) {
    return <div className="p-10">Cargando datos de la empresa...</div>;
  }

  if (!companyData) {
    return <div className="p-10">No se encontraron datos de la empresa.</div>;
  }

  return (
    <div className="min-h-screen h-screen w-full p-10 overflow-y-auto">
      {popup.open && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${popup.success ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {popup.message}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8">Configuración</h1>
      {/* General */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la empresa</label>
            <input type="text" value={companyData.nombrecomercial} disabled className="w-sm rounded-lg border border-gray-300 px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RIF</label>
            <input type="text" name="rif" value={form.rif} onChange={handleChange} className="w-sm rounded-lg border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Razón Social</label>
            <input type="text" name="razonsocial" value={form.razonsocial} onChange={handleChange} className="w-sm rounded-lg border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input type="email" value={companyData.email} disabled className="w-sm rounded-lg border border-gray-300 px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} className="w-sm rounded-lg border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className="w-sm rounded-lg border border-gray-300 px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Fundación</label>
            <input type="text" name="fecha_fundacion" value={form.fecha_fundacion} onChange={handleChange} className="w-sm rounded-lg border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Avatar</label>
            <img src={companyData.avatar || 'https://ui-avatars.com/api/?name=Empresa&background=8B5CF6&color=fff&size=128&bold=true'} alt="Avatar" className="w-20 h-20 rounded-full border border-gray-300 object-cover" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${hasChanges ? 'bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)]' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!hasChanges}
            onClick={handleApplyChanges}
          >
            Aplicar cambios
          </button>
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
          <div>
            <label className="block text-sm font-medium mb-1">Idioma</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]">
              <option value="es">Español</option>
              <option value="en">Próximamente más idiomas...</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
} 