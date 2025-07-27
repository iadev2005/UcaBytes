import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FormAdd from '../components/formularioAgregar';
import Modal from '../components/Modal';

// Eliminar mockProductos y mockServicios
// const mockProductos = [
//   { 
//     id_producto: '1', 
//     rif_pyme: 'J-12345678-9', 
//     nombre_producto: 'Laptop HP Pavilion', 
//     descripcion_producto: 'Laptop de alto rendimiento para trabajo y gaming',
//     precio_producto: '25000', 
//     categoria_producto: 'Electrónicos',
//     stock_producto: '15',
//     imagen_producto: ''
//   },
//   { 
//     id_producto: '2', 
//     rif_pyme: 'J-12345678-9', 
//     nombre_producto: 'Mouse Inalámbrico', 
//     descripcion_producto: 'Mouse ergonómico con conexión inalámbrica',
//     precio_producto: '500', 
//     categoria_producto: 'Accesorios',
//     stock_producto: '50',
//     imagen_producto: ''
//   },
//   { 
//     id_producto: '3', 
//     rif_pyme: 'J-12345678-9', 
//     nombre_producto: 'Teclado Mecánico', 
//     descripcion_producto: 'Teclado mecánico con switches Cherry MX',
//     precio_producto: '1200', 
//     categoria_producto: 'Accesorios',
//     stock_producto: '25',
//     imagen_producto: ''
//   },
//   { 
//     id_producto: '4', 
//     rif_pyme: 'J-12345678-9', 
//     nombre_producto: 'Monitor 24"', 
//     descripcion_producto: 'Monitor LED de 24 pulgadas Full HD',
//     precio_producto: '3500', 
//     categoria_producto: 'Electrónicos',
//     stock_producto: '10',
//     imagen_producto: ''
//   },
//   { 
//     id_producto: '5', 
//     rif_pyme: 'J-12345678-9', 
//     nombre_producto: 'Auriculares Bluetooth', 
//     descripcion_producto: 'Auriculares inalámbricos con cancelación de ruido',
//     precio_producto: '800', 
//     categoria_producto: 'Accesorios',
//     stock_producto: '30',
//     imagen_producto: ''
//   }
// ];

// const mockServicios = [
//   {
//     nombre_servicio: 'Mantenimiento de Computadoras',
//     descripcion_servicio: 'Servicio completo de mantenimiento preventivo y correctivo para computadoras',
//     precio_servicio: '1500'
//   },
//   {
//     nombre_servicio: 'Instalación de Software',
//     descripcion_servicio: 'Instalación y configuración de software especializado',
//     precio_servicio: '800'
//   },
//   {
//     nombre_servicio: 'Recuperación de Datos',
//     descripcion_servicio: 'Servicio de recuperación de datos perdidos o eliminados',
//     precio_servicio: '2500'
//   },
//   {
//     nombre_servicio: 'Configuración de Red',
//     descripcion_servicio: 'Configuración e instalación de redes WiFi y cableadas',
//     precio_servicio: '1200'
//   },
//   {
//     nombre_servicio: 'Reparación de Impresoras',
//     descripcion_servicio: 'Servicio técnico especializado en impresoras y escáneres',
//     precio_servicio: '900'
//   }
// ];

const categorias = ['Todos', 'Electrónicos', 'Accesorios', 'Almacenamiento', 'Software'];

export default function ProductsServices() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'productos' | 'servicios'>('productos');
  const [cat, setCat] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  // Inicializar productos y servicios como arrays vacíos para datos reales
  const [productos, setProductos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [editProducto, setEditProducto] = useState<any | null>(null);
  const [editServicio, setEditServicio] = useState<any | null>(null);

  // Guardar productos en localStorage
  useEffect(() => {
    localStorage.setItem('productos', JSON.stringify(productos));
  }, [productos]);

  // Cargar productos del localStorage
  useEffect(() => {
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      setProductos(JSON.parse(productosGuardados));
    }
  }, []);

  // Guardar servicios en localStorage
  useEffect(() => {
    localStorage.setItem('servicios', JSON.stringify(servicios));
  }, [servicios]);

  // Cargar servicios del localStorage
  useEffect(() => {
    const serviciosGuardados = localStorage.getItem('servicios');
    if (serviciosGuardados) {
      setServicios(JSON.parse(serviciosGuardados));
    }
  }, []);

  // Manejar parámetros de URL para acceso rápido
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const urlAction = searchParams.get('action');
    
    if (urlTab) {
      setTab(urlTab as 'productos' | 'servicios');
    }
    
    if (urlAction === 'agregar' && urlTab === 'productos') {
      setEditProducto(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  // Handlers para agregar
  const handleAddProducto = (producto: any) => {
    setProductos((prev) => [...prev, producto]);
    setModalOpen(false);
  };

  const handleAddServicio = (servicio: any) => {
    setServicios((prev) => [...prev, servicio]);
    setModalOpen(false);
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

  // Eliminar producto
  const eliminarProducto = (id: string) => {
    setProductos(productos.filter(p => p.id_producto !== id));
  };

  // Eliminar servicio
  const eliminarServicio = (nombre: string) => {
    setServicios(servicios.filter(s => s.nombre_servicio !== nombre));
  };

  // Filtrar productos por categoría
  const productosFiltrados = cat === 'Todos' ? productos : productos.filter(p => p.categoria_producto === cat);

  // Calcular estadísticas
  const totalProductos = productos.length;
  const totalServicios = servicios.length;
  const stockTotal = productos.reduce((total, p) => total + parseInt(p.stock_producto), 0);
  const valorTotalInventario = productos.reduce((total, p) => total + (parseFloat(p.precio_producto) * parseInt(p.stock_producto)), 0);

  return (
    <div className="w-full mx-auto px-20 py-10 pb-30 bg-[var(--color-background)] min-h-screen h-screen overflow-y-auto">
      {/* Tabs */}
      <div className="flex mb-8 w-full px-20 mx-auto">
        <div className="flex w-full rounded-2xl border-2 border-[var(--color-primary-600)] bg-white overflow-hidden">
          {[
            { key: 'productos', label: 'Productos' },
            { key: 'servicios', label: 'Servicios' }
          ].map(({ key, label }, index, arr) => (
            <button
              key={key}
              className={`flex-1 py-2 text-sm md:text-xl font-bold transition-all duration-200 cursor-pointer ${
                tab === key
                  ? 'bg-[var(--color-primary-600)] text-white shadow-inner'
                  : 'bg-white text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]'
              } ${index === 0 ? 'rounded-l-2xl' : index === arr.length - 1 ? 'rounded-r-2xl' : ''}`}
              style={index < arr.length - 1 ? { borderRight: '1.5px solid var(--color-primary-600)' } : {}}
              onClick={() => setTab(key as typeof tab)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de acciones */}
      {tab === 'productos' && (
        <div className="flex items-center justify-between mb-6">
          <button
            className="bg-[var(--color-secondary-500)] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-[var(--color-secondary-600)] transition-colors cursor-pointer"
            onClick={() => {
              setEditProducto(null);
              setModalOpen(true);
            }}
          >
            Agregar producto
          </button>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] cursor-pointer"
            value={cat}
            onChange={e => setCat(e.target.value)}
          >
            {categorias.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}

      {tab === 'servicios' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button
            className="bg-[var(--color-secondary-500)] text-white px-4 sm:px-5 py-2 rounded-lg font-semibold shadow hover:bg-[var(--color-secondary-600)] transition-colors w-full sm:w-auto cursor-pointer"
            onClick={() => {
              setEditServicio(null);
              setModalOpen(true);
            }}
          >
            Agregar servicio
          </button>
        </div>
      )}

      {/* Resumen de estadísticas */}
      {tab === 'productos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total de Productos</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-primary-700)]">
              {totalProductos}
            </p>
            <p className="text-xs text-gray-500">productos registrados</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Stock Total</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-600)]">
              {stockTotal}
            </p>
            <p className="text-xs text-gray-500">unidades disponibles</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Valor del Inventario</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-600)]">
              ${valorTotalInventario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">valor total</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Categorías</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-primary-600)]">
              {categorias.length - 1}
            </p>
            <p className="text-xs text-gray-500">categorías activas</p>
          </div>
        </div>
      )}

      {tab === 'servicios' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total de Servicios</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-primary-700)]">
              {totalServicios}
            </p>
            <p className="text-xs text-gray-500">servicios disponibles</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Precio Promedio</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-600)]">
              ${servicios.length > 0 ? (servicios.reduce((total, s) => total + parseFloat(s.precio_servicio), 0) / servicios.length).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}
            </p>
            <p className="text-xs text-gray-500">por servicio</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200 sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Servicios Activos</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-primary-600)]">
              {totalServicios}
            </p>
            <p className="text-xs text-gray-500">servicios en catálogo</p>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      {tab === 'productos' && (
        <div className="flex flex-col gap-4">
          {productos.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-xl mb-2">No hay productos en esta categoría</p>
              <p>Haz clic en "Agregar producto" para comenzar</p>
            </div>
          ) : (
            productos.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  {/* Imagen del producto */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                    {producto.imagen_producto ? (
                      <img 
                        src={producto.imagen_producto} 
                        alt={producto.nombre_producto}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--color-primary-700)]">
                      {item.productos?.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{item.productos?.descripcion}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {item.productos?.categoria}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[var(--color-secondary-200)] text-[var(--color-secondary-700)]">
                        ID: {item.productos?.id}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-600)]">
                      ${Number(item.precio_venta ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock: {Number(item.cantidad_actual ?? 0)} unidades
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <img src={item.productos?.image} alt={item.productos?.nombre} className="w-24 h-24 object-cover rounded-lg border" />
                  {/* ...botones de editar/eliminar... */}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lista de servicios */}
      {tab === 'servicios' && (
        <div className="flex flex-col gap-4">
          {servicios.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-xl mb-2">No hay servicios registrados</p>
              <p>Haz clic en "Agregar servicio" para comenzar</p>
            </div>
          ) : (
            servicios.map((servicio) => (
              <div key={servicio.nombre_servicio} className="bg-white rounded-xl shadow p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--color-primary-700)]">
                      {servicio.nombre_servicio}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{servicio.descripcion_servicio}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary-200)] text-[var(--color-primary-700)]">
                        Servicio
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-600)]">
                      ${parseFloat(servicio.precio_servicio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">Precio por servicio</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Servicio disponible</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditServicio(servicio);
                        setModalOpen(true);
                      }}
                      className="bg-[var(--color-primary-600)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-700)] transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarServicio(servicio.nombre_servicio)}
                      className="bg-[var(--color-secondary-400)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-secondary-500)] transition-colors cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => { 
        setModalOpen(false); 
        setEditProducto(null); 
        setEditServicio(null); 
      }}>
        {tab === 'productos' && editProducto ? (
          <FormAdd
            activeTab={tab}
            onAddProducto={handleEditProducto}
            onAddServicio={handleAddServicio}
            onClose={() => { setModalOpen(false); setEditProducto(null); }}
            initialProducto={editProducto}
            isEditMode={true}
          />
        ) : tab === 'servicios' && editServicio ? (
          <FormAdd
            activeTab={tab}
            onAddProducto={handleAddProducto}
            onAddServicio={handleEditServicio}
            onClose={() => { setModalOpen(false); setEditServicio(null); }}
            initialServicio={editServicio}
            isEditMode={true}
          />
        ) : (
          <FormAdd
            activeTab={tab}
            onAddProducto={handleAddProducto}
            onAddServicio={handleAddServicio}
            onClose={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
} 