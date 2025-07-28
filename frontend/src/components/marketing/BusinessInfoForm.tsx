import { useState } from 'react';
import { cn } from '../../lib/utils';

type BusinessInfoFormProps = {
  onSubmit: (info: { url: string; rif: string; businessName: string; fontFamily: 'syne' | 'arial' | 'georgia' | 'mono' }) => void;
};

const FONT_OPTIONS = [
  { value: 'syne', label: 'Syne (Sans, por defecto)', style: { fontFamily: 'var(--font-syne)' }, preview: 'Ejemplo de texto con Syne' },
  { value: 'arial', label: 'Arial / Helvetica / system-ui', style: { fontFamily: 'Arial, Helvetica, system-ui, sans-serif' }, preview: 'Ejemplo de texto con Arial' },
  { value: 'georgia', label: 'Georgia / Times New Roman', style: { fontFamily: 'Georgia, Times New Roman, serif' }, preview: 'Ejemplo de texto con Georgia' },
  { value: 'mono', label: 'Courier New / Consolas', style: { fontFamily: 'Courier New, Consolas, monospace' }, preview: 'Ejemplo de texto con Courier New' },
];

const BusinessInfoForm = ({ onSubmit }: BusinessInfoFormProps) => {
  const [formData, setFormData] = useState({
    url: '',
    rif: '',
    businessName: '',
    fontFamily: 'syne',
  });

  const [errors, setErrors] = useState({
    url: '',
    rif: '',
    businessName: ''
  });

  const validateForm = () => {
    const newErrors = {
      url: '',
      rif: '',
      businessName: ''
    };

    if (!formData.url) {
      newErrors.url = 'La URL es requerida';
    } else if (!/^[a-z0-9-]+$/.test(formData.url)) {
      newErrors.url = 'La URL solo puede contener letras minúsculas, números y guiones';
    }

    if (!formData.rif) {
      newErrors.rif = 'El RIF es requerido';
    } else if (!/^[VEJPG]-\d{8}-\d$/.test(formData.rif)) {
      newErrors.rif = 'El RIF debe tener el formato: J-12345678-9';
    }

    if (!formData.businessName) {
      newErrors.businessName = 'El nombre del negocio es requerido';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        fontFamily: formData.fontFamily as 'syne' | 'arial' | 'georgia' | 'mono',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error al escribir
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Información del Negocio
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="businessName">
            Nombre del Negocio
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className={cn(
              'w-full px-3 py-2 border rounded-md',
              errors.businessName ? 'border-red-500' : 'border-gray-300'
            )}
            placeholder="Ej: Mi Tienda Online"
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.businessName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="rif">
            RIF
          </label>
          <input
            type="text"
            id="rif"
            name="rif"
            value={formData.rif}
            onChange={handleChange}
            className={cn(
              'w-full px-3 py-2 border rounded-md',
              errors.rif ? 'border-red-500' : 'border-gray-300'
            )}
            placeholder="Ej: J-12345678-9"
          />
          {errors.rif && (
            <p className="mt-1 text-sm text-red-500">
              {errors.rif}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="url">
            URL de la página
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0">
              https://
            </span>
            <input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className={cn(
                'flex-1 px-3 py-2 border rounded-r-md',
                errors.url ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="mi-tienda"
            />
          </div>
          {errors.url && (
            <p className="mt-1 text-sm text-red-500">
              {errors.url}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            La URL será: https://{formData.url || 'mi-tienda'}.tudominio.com
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="fontFamily">
            Fuente principal del sitio
          </label>
          <select
            id="fontFamily"
            name="fontFamily"
            value={formData.fontFamily}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            {FONT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} style={opt.style}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Reemplazar la grilla de previews por un solo elemento que cambia según la selección */}
          <div className="mt-4">
            <div
              style={{
                ...FONT_OPTIONS.find(opt => opt.value === formData.fontFamily)?.style,
                fontSize: 20,
                padding: '18px 20px',
                borderRadius: 8,
                border: '2px solid var(--color-primary-200)',
                background: 'var(--color-primary-50)',
                minHeight: 80,
                transition: 'font-family 0.2s',
                boxShadow: '0 2px 8px rgba(62,146,238,0.07)'
              }}
              className="mb-2"
            >
              <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 6 }}>Título de ejemplo</div>
              <div style={{ fontWeight: 400, fontSize: 18 }}>Este es un texto de ejemplo para que veas cómo se verá tu sitio con la fuente seleccionada.</div>
            </div>
          </div>
          {/* Elimina la grilla de previews por fuente individual */}
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-[var(--color-secondary-500)] text-white rounded-lg hover:bg-[var(--color-secondary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)] focus:ring-offset-2 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer mb-8"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Crear mi sitio web
          </div>
        </button>
      </form>
    </div>
  );
};

export default BusinessInfoForm; 