import { useState } from "react";
import FormAdd from '../components/formularioAgregar';

export default function ProductsServices() {
  const [activeTab, setActiveTab] = useState<'productos' | 'servicios'>('productos');
  const [modalOpen, setModalOpen] = useState(false);

  // Estado real de productos y servicios
  const [productos, setProductos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);

  // Estado para edición
  const [editProducto, setEditProducto] = useState<any | null>(null);
  const [editServicio, setEditServicio] = useState<any | null>(null);

  // Handlers para agregar
  const handleAddProducto = (producto: any) => {
    setProductos((prev) => [...prev, producto]);
  };
  const handleAddServicio = (servicio: any) => {
    setServicios((prev) => [...prev, servicio]);
  };

  // Handler para editar producto
  const handleEditProducto = (productoEditado: any) => {
    setProductos((prev) => prev.map((p) => p.id_producto === productoEditado.id_producto ? productoEditado : p));
    setEditProducto(null);
    setModalOpen(false);
  };
  // Handler para editar servicio
  const handleEditServicio = (servicioEditado: any) => {
    setServicios((prev) => prev.map((s) => s.nombre_servicio === servicioEditado.nombre_servicio ? servicioEditado : s));
    setEditServicio(null);
    setModalOpen(false);
  };

  // Modal simple
  function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-3xl p-10 shadow-2xl min-w-[350px] w-full max-w-4xl relative animate-fade-in ml-8">
          {/* Header del modal */}
          <div className="flex items-center justify-between mb-6 border-b pb-3">
            <h2 className="text-2xl font-bold text-[var(--color-primary-700)] font-syne">{activeTab === 'productos' ? 'Agregar producto' : 'Agregar servicio'}</h2>
            <button
              className="text-3xl text-gray-400 hover:text-[#D8315B] transition-colors font-bold px-2"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <div className="overflow-y-auto max-h-[70vh] pr-2">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-8 bg-[var(--color-background)] p-4 md:p-8">
      {/* Columna izquierda: 3/4 */}
      <div className="w-full md:flex-1 md:basis-3/4 max-w-4xl bg-white rounded-2xl shadow-lg p-4 md:p-8 flex flex-col items-center gap-6">
        {/* Switch Toggle */}
        <div className="flex items-center gap-4 mb-4 select-none">
          <span className={`text-base font-medium transition-colors ${activeTab === 'productos' ? 'text-[var(--color-primary-700)]' : 'text-gray-400'}`}>Productos</span>
          <div className="relative" style={{ width: 55, height: 23 }}>
            <input
              id="switch-toggle"
              type="checkbox"
              checked={activeTab === 'servicios'}
              onChange={() => setActiveTab(activeTab === 'productos' ? 'servicios' : 'productos')}
              className="peer appearance-none w-[55px] h-[23px] absolute top-0 left-0 z-10 cursor-pointer"
              style={{ outline: 'none' }}
            />
            <label
              htmlFor="switch-toggle"
              className={`block w-[55px] h-[23px] rounded-full transition-colors duration-200 ${activeTab === 'servicios' ? 'bg-blue-200' : 'bg-gray-400'}`}
            >
              <span
                className={`block absolute top-[1px] left-[1px] w-[21px] h-[21px] rounded-full bg-white shadow transition-all duration-200 ${activeTab === 'servicios' ? 'translate-x-[32px]' : ''}`}
              />
            </label>
          </div>
          <span className={`text-base font-medium transition-colors ${activeTab === 'servicios' ? 'text-[var(--color-primary-700)]' : 'text-gray-400'}`}>Servicios</span>
        </div>
        {/* Botón agregar */}
        <button
          className="self-end mb-2 px-4 py-2 rounded bg-[#D8315B] hover:bg-[#b71e44] text-white"
          onClick={() => setModalOpen(true)}
        >
          {activeTab === 'productos' ? 'Agregar producto' : 'Agregar servicio'}
        </button>
        {/* Lista */}
        <ul className="w-full flex flex-col gap-2">
          {activeTab === 'productos'
            ? productos.map((item, idx) => (
                <li key={item.id_producto + idx} className="border rounded px-4 py-2 bg-gray-50 flex items-center gap-4 cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => { setEditProducto(item); setModalOpen(true); }}
                >
                  {item.imagen_producto && (
                    <img src={item.imagen_producto} alt={item.nombre_producto} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <div className="font-bold">{item.nombre_producto}</div>
                    <div className="text-xs text-gray-500">ID: {item.id_producto}</div>
                    <div className="text-xs">Precio: {item.precio_producto}</div>
                    <div className="text-xs">Stock: {item.stock_producto}</div>
                  </div>
                </li>
              ))
            : servicios.map((item, idx) => (
                <li key={item.nombre_servicio + idx} className="border rounded px-4 py-2 bg-gray-50 cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => { setEditServicio(item); setModalOpen(true); }}
                >
                  <div className="font-bold">{item.nombre_servicio}</div>
                  <div className="text-xs text-gray-500">{item.descripcion_servicio}</div>
                  <div className="text-xs">Precio: {item.precio_servicio}</div>
                </li>
              ))}
        </ul>
      </div>
      {/* Columna derecha: 1/4 */}
      <div className="w-full md:flex-1 md:basis-1/4 max-w-xs flex flex-col gap-6 min-w-[200px] md:min-w-[250px] mt-8 md:mt-0">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 flex flex-col items-center justify-center h-1/2">
          <div className="w-full flex items-center justify-center text-gray-400 text-center">
            Aquí irá la visualización del producto más popular
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 flex flex-col items-center justify-center h-1/2">
          <div className="w-full flex items-center justify-center text-gray-400 text-center">
            Aquí irá la visualización del producto menos popular
          </div>
        </div>
      </div>
      {/* Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditProducto(null); setEditServicio(null); }}>
        {activeTab === 'productos' && editProducto ? (
          <FormAdd
            activeTab={activeTab}
            onAddProducto={handleEditProducto}
            onAddServicio={handleAddServicio}
            onClose={() => { setModalOpen(false); setEditProducto(null); }}
            initialProducto={editProducto}
            isEditMode={true}
          />
        ) : activeTab === 'servicios' && editServicio ? (
          <FormAdd
            activeTab={activeTab}
            onAddProducto={handleAddProducto}
            onAddServicio={handleEditServicio}
            onClose={() => { setModalOpen(false); setEditServicio(null); }}
            initialServicio={editServicio}
            isEditMode={true}
          />
        ) : (
          <FormAdd
            activeTab={activeTab}
            onAddProducto={handleAddProducto}
            onAddServicio={handleAddServicio}
            onClose={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
} 