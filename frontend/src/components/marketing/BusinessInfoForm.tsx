import { useState } from 'react';
import type { BusinessPage } from '../../types/templates';
import { cn } from '../../lib/utils';

type BusinessInfoFormProps = {
  onSubmit: (info: Pick<BusinessPage, 'url' | 'rif' | 'businessName'>) => void;
};

const BusinessInfoForm = ({ onSubmit }: BusinessInfoFormProps) => {
  const [formData, setFormData] = useState({
    url: '',
    rif: '',
    businessName: ''
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
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        <button
          type="submit"
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Continuar
        </button>
      </form>
    </div>
  );
};

export default BusinessInfoForm; 