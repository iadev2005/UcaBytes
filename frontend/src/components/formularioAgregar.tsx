import React, { useState } from 'react';

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
  onAddProducto: (producto: Producto) => void;
  onAddServicio: (servicio: Servicio) => void;
  onClose: () => void;
  initialProducto?: Producto;
  initialServicio?: Servicio;
  isEditMode?: boolean;
};

const FormAdd: React.FC<Props> = ({ activeTab, onAddProducto, onAddServicio, onClose, initialProducto, initialServicio, isEditMode }) => {
  // Estado para producto
  const [producto, setProducto] = useState<Producto>(
    initialProducto || {
      id_producto: '',
      rif_pyme: '',
      nombre_producto: '',
      descripcion_producto: '',
      precio_producto: '',
      categoria_producto: '',
      stock_producto: '',
      imagen_producto: '',
    }
  );
  const [servicio, setServicio] = useState<Servicio>(
    initialServicio || { nombre_servicio: '', descripcion_servicio: '', precio_servicio: '' }
  );
  const [imgPreview, setImgPreview] = useState<string | null>(initialProducto?.imagen_producto || null);
  const [error, setError] = useState<string | null>(null);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleServicioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setServicio((prev) => ({ ...prev, [name]: value }));
  };

  // Imagen
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProducto((prev) => ({ ...prev, imagen_producto: reader.result as string }));
        setImgPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (activeTab === 'productos') {
      // Validación básica
      if (!producto.id_producto || !producto.nombre_producto) {
        setError('ID y nombre del producto son obligatorios');
        return;
      }
      onAddProducto(producto);
      onClose();
      if (!isEditMode) {
        setProducto({
          id_producto: '', rif_pyme: '', nombre_producto: '', descripcion_producto: '', precio_producto: '', categoria_producto: '', stock_producto: '', imagen_producto: '',
        });
        setImgPreview(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Columna 1: campos */}
          <div className="flex flex-col gap-4">
            <input className="border rounded px-3 py-2" placeholder="ID del producto" name="id_producto" value={producto.id_producto} onChange={handleChange} />
            <input className="border rounded px-3 py-2" placeholder="RIF de la pyme" name="rif_pyme" value={producto.rif_pyme} onChange={handleChange} />
            <input className="border rounded px-3 py-2" placeholder="Nombre del producto" name="nombre_producto" value={producto.nombre_producto} onChange={handleChange} />
            <textarea className="border rounded px-3 py-2" placeholder="Descripción del producto" name="descripcion_producto" value={producto.descripcion_producto} onChange={handleChange} />
            <input className="border rounded px-3 py-2" placeholder="Precio del producto" name="precio_producto" type="number" min="0" step="0.01" value={producto.precio_producto} onChange={handleChange} />
            <input className="border rounded px-3 py-2" placeholder="Categoría del producto" name="categoria_producto" value={producto.categoria_producto} onChange={handleChange} />
            <input className="border rounded px-3 py-2" placeholder="Stock del producto" name="stock_producto" type="number" min="0" value={producto.stock_producto} onChange={handleChange} />
          </div>
          {/* Columna 2: imagen */}
          <div className="flex flex-col items-center justify-center gap-4 mt-4 md:mt-0">
            <label className="block mb-1 font-medium">Imagen del producto</label>
            <input className="border rounded px-3 py-2 w-full" type="file" name="imagen_producto" accept="image/*" onChange={handleImage} />
            {imgPreview ? (
              <img src={imgPreview} alt="preview" className="mt-2 w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl border" />
            ) : (
              <div className="mt-2 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl border text-sm">Sin imagen</div>
            )}
          </div>
        </div>
        <button type="submit" className="px-4 py-2 rounded self-end bg-[#D8315B] hover:bg-[#b71e44] text-white mt-4">{isEditMode ? 'Guardar cambios' : 'Guardar'}</button>
      </form>
    );
  }
  // Formulario para servicios
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