import React, { useState } from 'react';
import { createProductWithInventory } from '../supabase/data';
import { useCompany } from '../context/CompanyContext';

// Nuevo tipo para el formulario de producto
interface ProductoForm {
  nombre: string;
  descripcion: string;
  cantidad_minima: number;
  cantidad_maxima: number;
  image: string;
  categoria: string;
  precio_venta: number;
  cantidad_actual: number;
}

type Producto = {
  id_producto: string;
  rif_pyme: string;
  nombre_producto: string;
  descripcion_producto: string;
  precio_producto: string;
  categoria_producto: string;
  stock_producto: string;
  imagen_producto?: string; // base64 o url local
};

type Servicio = {
  nombre_servicio: string;
  descripcion_servicio: string;
  precio_servicio: string;
};

type Props = {
  activeTab: 'productos' | 'servicios';
  onAddProducto: (producto: any) => void;
  onAddServicio: (servicio: Servicio) => void;
  onClose: () => void;
  initialProducto?: any;
  initialServicio?: Servicio;
  isEditMode?: boolean;
};

const FormAdd: React.FC<Props> = ({ activeTab, onAddProducto, onAddServicio, onClose, initialProducto, initialServicio, isEditMode }) => {
  const { companyData } = useCompany();
  const [producto, setProducto] = useState<ProductoForm>(
    initialProducto || {
      nombre: '',
      descripcion: '',
      cantidad_minima: 0,
      cantidad_maxima: 0,
      image: '',
      categoria: '',
      precio_venta: 0,
      cantidad_actual: 0,
    }
  );
  const [servicio, setServicio] = useState<Servicio>(
    initialServicio || { nombre_servicio: '', descripcion_servicio: '', precio_servicio: '' }
  );
  const [imgPreview, setImgPreview] = useState<string | null>(initialProducto?.image || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setProducto((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleServicioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setServicio((prev) => ({ ...prev, [name]: value }));
  };

  // Imagen
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Por ahora solo guardamos la URL local (puedes cambiar esto por upload real)
      const url = URL.createObjectURL(file);
      setProducto((prev) => ({ ...prev, image: url }));
      setImgPreview(url);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (activeTab === 'productos') {
      if (!producto.nombre) {
        setError('El nombre del producto es obligatorio');
        return;
      }
      if (!companyData) {
        setError('No se pudo obtener la empresa.');
        return;
      }
      setLoading(true);
      const result = await createProductWithInventory({
        ...producto,
        imagen_producto: producto.image,
        id_empresa: companyData.id
      });
      setLoading(false);
      if (result.success) {
        setSuccess(result.message);
        onAddProducto(result.producto);
        onClose();
        if (!isEditMode) {
          setProducto({ nombre: '', descripcion: '', cantidad_minima: 0, cantidad_maxima: 0, image: '', categoria: '', precio_venta: 0, cantidad_actual: 0 });
          setImgPreview(null);
        }
      } else {
        setError(result.message);
      }
    } else {
      if (!servicio.nombre_servicio) {
        setError('El nombre del servicio es obligatorio');
        return;
      }
      onAddServicio(servicio);
      onClose();
      if (!isEditMode) {
        setServicio({ nombre_servicio: '', descripcion_servicio: '', precio_servicio: '' });
      }
    }
  };

  if (activeTab === 'productos') {
    return (
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-2">{isEditMode ? 'Editar producto' : 'Datos de Producto'}</h2>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Columna 1: campos */}
          <div className="flex flex-col gap-4">
            <label className="block mb-1 font-medium">Nombre del producto</label>
            <input className="border rounded px-3 py-2" placeholder="Nombre del producto" name="nombre" value={producto.nombre} onChange={handleChange} />
            <label className="block mb-1 font-medium">Descripción del producto</label>
            <textarea className="border rounded px-3 py-2" placeholder="Descripción del producto" name="descripcion" value={producto.descripcion} onChange={handleChange} />
            <label className="block mb-1 font-medium">Cantidad mínima en stock</label>
            <input className="border rounded px-3 py-2" placeholder="Cantidad mínima en stock" name="cantidad_minima" type="number" min="0" value={producto.cantidad_minima} onChange={handleChange} />
            <label className="block mb-1 font-medium">Cantidad máxima en stock</label>
            <input className="border rounded px-3 py-2" placeholder="Cantidad máxima en stock" name="cantidad_maxima" type="number" min="0" value={producto.cantidad_maxima} onChange={handleChange} />
            <label className="block mb-1 font-medium">Categoría del producto</label>
            <input className="border rounded px-3 py-2" placeholder="Categoría del producto" name="categoria" value={producto.categoria} onChange={handleChange} />
            <label className="block mb-1 font-medium">Precio de venta</label>
            <input className="border rounded px-3 py-2" placeholder="Precio de venta" name="precio_venta" type="number" min="0" step="0.01" value={producto.precio_venta} onChange={handleChange} />
            <label className="block mb-1 font-medium">Cantidad actual en inventario</label>
            <input className="border rounded px-3 py-2" placeholder="Cantidad actual en inventario" name="cantidad_actual" type="number" min="0" value={producto.cantidad_actual} onChange={handleChange} />
          </div>
          {/* Columna 2: imagen */}
          <div className="flex flex-col items-center justify-center gap-4 mt-4 md:mt-0">
            <label className="block mb-1 font-medium">Imagen del producto</label>
            <input className="border rounded px-3 py-2 w-full" type="file" name="image" accept="image/*" onChange={handleImage} />
            {imgPreview ? (
              <img src={imgPreview} alt="preview" className="mt-2 w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl border" />
            ) : (
              <div className="mt-2 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl border text-sm">Sin imagen</div>
            )}
          </div>
        </div>
        <button type="submit" className="px-4 py-2 rounded self-end bg-[#D8315B] hover:bg-[#b71e44] text-white mt-4" disabled={loading}>{isEditMode ? 'Guardar cambios' : 'Guardar'}</button>
      </form>
    );
  }
  // Formulario para servicios igual que antes
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-2">{isEditMode ? 'Editar servicio' : 'Agregar servicio'}</h2>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <input className="border rounded px-3 py-2" placeholder="Nombre del servicio" name="nombre_servicio" value={servicio.nombre_servicio} onChange={handleServicioChange} />
      <textarea className="border rounded px-3 py-2" placeholder="Descripción del servicio" name="descripcion_servicio" value={servicio.descripcion_servicio} onChange={handleServicioChange} />
      <input className="border rounded px-3 py-2" placeholder="Precio del servicio" name="precio_servicio" type="number" min="0" step="0.01" value={servicio.precio_servicio} onChange={handleServicioChange} />
      <button type="submit" className="px-4 py-2 rounded bg-[#D8315B] hover:bg-[#b71e44] text-white">{isEditMode ? 'Guardar cambios' : 'Guardar'}</button>
    </form>
  );
};

export default FormAdd; 