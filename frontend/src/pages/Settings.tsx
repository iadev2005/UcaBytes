import { useState, useEffect, useRef } from 'react';
import { useCompany } from '../context/CompanyContext';
import { updateCompany, uploadAvatar } from '../supabase/data';

export default function Settings() {
  // Todos los hooks deben ir aquí, antes de cualquier return condicional
  const { companyData, companyLoading, updateCompanyData } = useCompany();
  const [popup, setPopup] = useState<{ open: boolean; message: string; success: boolean }>({ open: false, message: '', success: false });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        fecha_fundacion: companyData.fecha_fundacion ? new Date(companyData.fecha_fundacion).toISOString().split('T')[0] : '',
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

  // Handler para subir avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyData) return;

    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file, companyData.id);
      if (result.success && result.url) {
        // Actualizar el avatar en la base de datos
        const updateResult = await updateCompany(companyData.id, { ...form, avatar: result.url });
        if (updateResult.success) {
          updateCompanyData({ avatar: result.url });
          setPopup({ open: true, message: 'Avatar actualizado con éxito!', success: true });
        } else {
          setPopup({ open: true, message: updateResult.message, success: false });
        }
      } else {
        setPopup({ open: true, message: result.message || 'Error al subir el avatar', success: false });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setPopup({ open: true, message: 'Error al subir el avatar', success: false });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handler para aplicar cambios y mostrar popup
  const handleApplyChanges = async () => {
    if (!companyData) return;
    
    // Preparar los datos para enviar, convirtiendo la fecha si es necesario
    const dataToSend = { ...form };
    
    // Si hay fecha_fundacion, convertirla al formato YYYY-MM-DD para PostgreSQL
    if (dataToSend.fecha_fundacion) {
      const date = new Date(dataToSend.fecha_fundacion);
      if (!isNaN(date.getTime())) {
        dataToSend.fecha_fundacion = date.toISOString().split('T')[0]; // YYYY-MM-DD
      }
    }
    
    const result = await updateCompany(companyData.id, dataToSend);
    setPopup({ open: true, message: result.message, success: result.success });
    if (result.success) {
      updateCompanyData(dataToSend);
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
            <input type="date" name="fecha_fundacion" value={form.fecha_fundacion} onChange={handleChange} className="w-sm rounded-lg border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Avatar</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={companyData.avatar || 'https://ui-avatars.com/api/?name=Empresa&background=8B5CF6&color=fff&size=128&bold=true'} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full border border-gray-300 object-cover" 
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 text-sm bg-[var(--color-primary-500)] text-white rounded-lg hover:bg-[var(--color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingAvatar ? 'Subiendo...' : 'Cambiar Avatar'}
                </button>
              </div>
            </div>
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

    </div>
  );
} 