import { useState, useEffect } from 'react';
import Modal from '../components/Modal';

const mockEmpleados = [
  { nombre: 'Samuel Guzmán', puesto: 'Mi Novio', categoria: 'Administrativo', salario: 100000, foto: '', pagado: false }
];
const categorias = ['Todos', 'Administrativo', 'Ventas', 'Soporte'];
const prioridades = ['Alta', 'Media', 'Baja'];

// Mock products data - usando el mismo formato que ProductsServices.tsx
const mockProductos = [
  { 
    id_producto: '1', 
    rif_pyme: 'J-12345678-9', 
    nombre_producto: 'Laptop HP Pavilion', 
    descripcion_producto: 'Laptop de alto rendimiento para trabajo y gaming',
    precio_producto: '25000', 
    categoria_producto: 'Electrónicos',
    stock_producto: '15',
    imagen_producto: ''
  },
  { 
    id_producto: '2', 
    rif_pyme: 'J-12345678-9', 
    nombre_producto: 'Mouse Inalámbrico', 
    descripcion_producto: 'Mouse ergonómico con conexión inalámbrica',
    precio_producto: '500', 
    categoria_producto: 'Accesorios',
    stock_producto: '50',
    imagen_producto: ''
  },
  { 
    id_producto: '3', 
    rif_pyme: 'J-12345678-9', 
    nombre_producto: 'Teclado Mecánico', 
    descripcion_producto: 'Teclado mecánico con switches Cherry MX',
    precio_producto: '1200', 
    categoria_producto: 'Accesorios',
    stock_producto: '25',
    imagen_producto: ''
  },
  { 
    id_producto: '4', 
    rif_pyme: 'J-12345678-9', 
    nombre_producto: 'Monitor 24"', 
    descripcion_producto: 'Monitor LED de 24 pulgadas Full HD',
    precio_producto: '3500', 
    categoria_producto: 'Electrónicos',
    stock_producto: '10',
    imagen_producto: ''
  },
  { 
    id_producto: '5', 
    rif_pyme: 'J-12345678-9', 
    nombre_producto: 'Auriculares Bluetooth', 
    descripcion_producto: 'Auriculares inalámbricos con cancelación de ruido',
    precio_producto: '800', 
    categoria_producto: 'Accesorios',
    stock_producto: '30',
    imagen_producto: ''
  },
  { 
    id_producto: '6', 
    rif_pyme: 'J-12345678-9', 
    nombre_producto: 'Webcam HD', 
    descripcion_producto: 'Cámara web de alta definición para videoconferencias',
    precio_producto: '600', 
    categoria_producto: 'Accesorios',
    stock_producto: '20',
    imagen_producto: ''
  },
  { 
    id_producto: '7', 
    rif_pyme: 'J-12345678-9', 
    nombre_producto: 'Impresora Láser', 
    descripcion_producto: 'Impresora láser monocromática de alta velocidad',
    precio_producto: '4500', 
    categoria_producto: 'Electrónicos',
    stock_producto: '8',
    imagen_producto: ''
  },
  { 
    id_producto: '8', 
    rif_pyme: 'J-12345678-9', 
    nombre_producto: 'Disco Duro 1TB', 
    descripcion_producto: 'Disco duro interno de 1TB para almacenamiento',
    precio_producto: '1200', 
    categoria_producto: 'Almacenamiento',
    stock_producto: '12',
    imagen_producto: ''
  },
];

// Mock services data - usando el mismo formato que ProductsServices.tsx
const mockServicios = [
  {
    nombre_servicio: 'Mantenimiento de Computadoras',
    descripcion_servicio: 'Servicio completo de mantenimiento preventivo y correctivo para computadoras',
    precio_servicio: '1500'
  },
  {
    nombre_servicio: 'Instalación de Software',
    descripcion_servicio: 'Instalación y configuración de software especializado',
    precio_servicio: '800'
  },
  {
    nombre_servicio: 'Recuperación de Datos',
    descripcion_servicio: 'Servicio de recuperación de datos perdidos o eliminados',
    precio_servicio: '2500'
  },
  {
    nombre_servicio: 'Configuración de Red',
    descripcion_servicio: 'Configuración e instalación de redes WiFi y cableadas',
    precio_servicio: '1200'
  },
  {
    nombre_servicio: 'Reparación de Impresoras',
    descripcion_servicio: 'Servicio técnico especializado en impresoras y escáneres',
    precio_servicio: '900'
  },
  {
    nombre_servicio: 'Consultoría IT',
    descripcion_servicio: 'Asesoramiento en tecnología y optimización de sistemas',
    precio_servicio: '2000'
  },
  {
    nombre_servicio: 'Backup y Seguridad',
    descripcion_servicio: 'Implementación de sistemas de backup y seguridad informática',
    precio_servicio: '1800'
  },
  {
    nombre_servicio: 'Desarrollo Web',
    descripcion_servicio: 'Desarrollo de sitios web y aplicaciones web personalizadas',
    precio_servicio: '3500'
  }
];

const metodosPago = ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia', 'PayPal'];

// Types - actualizados para usar el formato de ProductsServices.tsx
interface Producto {
  id_producto: string;
  rif_pyme: string;
  nombre_producto: string;
  descripcion_producto: string;
  precio_producto: string;
  categoria_producto: string;
  stock_producto: string;
  imagen_producto?: string;
  cantidad?: number;
  subtotal?: number;
}

interface Servicio {
  nombre_servicio: string;
  descripcion_servicio: string;
  precio_servicio: string;
  cantidad?: number;
  subtotal?: number;
}

interface Cliente {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

interface Venta {
  id: number;
  productos: Producto[];
  cliente: Cliente;
  metodoPago: string;
  fechaVenta: string;
  fechaPago?: string;
  total: number;
  pagada: boolean;
}

interface ServicioVenta {
  id: number;
  servicios: Servicio[];
  cliente: Cliente;
  metodoPago: string;
  fechaServicio: string;
  fechaPago?: string;
  total: number;
  pagado: boolean;
}

export default function CentralOperations() {
  const [tab, setTab] = useState<'empleados' | 'tareas' | 'ventas' | 'servicios'>('empleados');
  const [cat, setCat] = useState('Todos');
  // Task planner state
  const [tareas, setTareas] = useState([
    { texto: 'Enviar facturas pendientes', prioridad: 'Alta', completada: false },
    { texto: 'Preparar presentación para junta', prioridad: 'Media', completada: false },
    { texto: 'Revisar inventario semanal', prioridad: 'Baja', completada: false },
  ]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editTexto, setEditTexto] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [empleados, setEmpleados] = useState(mockEmpleados.map(e => ({ ...e, pagado: false })));
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: '', puesto: '', categoria: 'Administrativo', salario: '', foto: '', pagado: false });

  // Sales state
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [modalVentaOpen, setModalVentaOpen] = useState(false);
  const [productos, setProductos] = useState(mockProductos);
  const [nuevaVenta, setNuevaVenta] = useState({
    productos: [] as Producto[],
    cliente: {
      nombre: '',
      email: '',
      telefono: '',
      direccion: ''
    },
    metodoPago: 'Efectivo',
    fechaVenta: new Date().toISOString().split('T')[0],
    fechaPago: '',
    total: 0,
    pagada: false
  });
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);

  // Services state
  const [ventasServicios, setVentasServicios] = useState<ServicioVenta[]>([]);
  const [modalServicioOpen, setModalServicioOpen] = useState(false);
  const [servicios, setServicios] = useState(mockServicios);
  const [nuevaServicioVenta, setNuevaServicioVenta] = useState({
    servicios: [] as Servicio[],
    cliente: {
      nombre: '',
      email: '',
      telefono: '',
      direccion: ''
    },
    metodoPago: 'Efectivo',
    fechaServicio: new Date().toISOString().split('T')[0],
    fechaPago: '',
    total: 0,
    pagado: false
  });
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [cantidadServicio, setCantidadServicio] = useState(1);

  useEffect(() => {
    localStorage.setItem('task_planner', JSON.stringify(tareas));
  }, [tareas]);

  useEffect(() => {
    const tareasGuardadas = localStorage.getItem('task_planner');
    if (tareasGuardadas) {
      setTareas(JSON.parse(tareasGuardadas));
    }
  }, []);

  useEffect(() => {
    const ventasGuardadas = localStorage.getItem('ventas');
    if (ventasGuardadas) {
      setVentas(JSON.parse(ventasGuardadas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ventas', JSON.stringify(ventas));
  }, [ventas]);

  useEffect(() => {
    const ventasServiciosGuardadas = localStorage.getItem('ventasServicios');
    if (ventasServiciosGuardadas) {
      setVentasServicios(JSON.parse(ventasServiciosGuardadas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ventasServicios', JSON.stringify(ventasServicios));
  }, [ventasServicios]);

  const empleadosFiltrados = cat === 'Todos' ? empleados : empleados.filter(e => e.categoria === cat);

  // Calculate totals
  const totalVentas = ventas.reduce((total, venta) => total + venta.total, 0);
  const totalVentasPagadas = ventas.filter(venta => venta.pagada).reduce((total, venta) => total + venta.total, 0);
  const totalVentasPendientes = totalVentas - totalVentasPagadas;

  const totalServicios = ventasServicios.reduce((total, servicioVenta) => total + servicioVenta.total, 0);
  const totalServiciosPagados = ventasServicios.filter(servicioVenta => servicioVenta.pagado).reduce((total, servicioVenta) => total + servicioVenta.total, 0);
  const totalServiciosPendientes = totalServicios - totalServiciosPagados;

  // Task planner handlers
  const agregarTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaTarea.trim()) {
      setTareas([...tareas, { texto: nuevaTarea, prioridad, completada: false }]);
      setNuevaTarea('');
      setPrioridad('Media');
    }
  };
  const toggleCompletada = (idx: number) => {
    setTareas(tareas.map((t, i) => i === idx ? { ...t, completada: !t.completada } : t));
  };
  const eliminarTarea = (idx: number) => {
    setTareas(tareas.filter((_, i) => i !== idx));
  };

  // Edición de tarea
  const startEdit = (idx: number, texto: string) => {
    setEditIdx(idx);
    setEditTexto(texto);
  };
  const saveEdit = (idx: number) => {
    setTareas(tareas.map((t, i) => i === idx ? { ...t, texto: editTexto } : t));
    setEditIdx(null);
    setEditTexto('');
  };
  const cancelEdit = () => {
    setEditIdx(null);
    setEditTexto('');
  };
  // Drag & drop handlers
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (idx: number) => setDragOverIdx(idx);
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) return;
    const tareaArr = [...tareas];
    const [moved] = tareaArr.splice(dragIdx, 1);
    tareaArr.splice(idx, 0, moved);
    setTareas(tareaArr);
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleAddEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEmpleado.nombre.trim() || !nuevoEmpleado.puesto.trim() || !nuevoEmpleado.salario) return;
    setEmpleados([
      ...empleados,
      {
        nombre: nuevoEmpleado.nombre,
        puesto: nuevoEmpleado.puesto,
        categoria: nuevoEmpleado.categoria,
        salario: parseFloat(nuevoEmpleado.salario),
        foto: nuevoEmpleado.foto,
        pagado: false
      }
    ]);
    setNuevoEmpleado({ nombre: '', puesto: '', categoria: 'Administrativo', salario: '', foto: '', pagado: false });
    setModalOpen(false);
  };
  const togglePagado = (idx: number) => {
    setEmpleados(empleados.map((e, i) => i === idx ? { ...e, pagado: !e.pagado } : e));
  };

  // Sales handlers
  const agregarProductoAVenta = () => {
    if (!productoSeleccionado || cantidadProducto <= 0) return;
    
    const producto = productos.find(p => p.id_producto === productoSeleccionado);
    if (!producto) return;

    const productoExistente = nuevaVenta.productos.find(p => p.id_producto === producto.id_producto);
    
    if (productoExistente) {
      setNuevaVenta({
        ...nuevaVenta,
        productos: nuevaVenta.productos.map(p => 
          p.id_producto === producto.id_producto 
            ? { ...p, cantidad: (p.cantidad || 0) + cantidadProducto, subtotal: ((p.cantidad || 0) + cantidadProducto) * parseFloat(p.precio_producto) }
            : p
        )
      });
    } else {
      setNuevaVenta({
        ...nuevaVenta,
        productos: [...nuevaVenta.productos, {
          ...producto,
          cantidad: cantidadProducto,
          subtotal: parseFloat(producto.precio_producto) * cantidadProducto
        }]
      });
    }
    
    setProductoSeleccionado('');
    setCantidadProducto(1);
  };

  const removerProductoDeVenta = (productoId: string) => {
    setNuevaVenta({
      ...nuevaVenta,
      productos: nuevaVenta.productos.filter(p => p.id_producto !== productoId)
    });
  };

  const actualizarCantidadProducto = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      removerProductoDeVenta(productoId);
      return;
    }
    
    setNuevaVenta({
      ...nuevaVenta,
      productos: nuevaVenta.productos.map(p => 
        p.id_producto === productoId 
          ? { ...p, cantidad: nuevaCantidad, subtotal: parseFloat(p.precio_producto) * nuevaCantidad }
          : p
      )
    });
  };

  const calcularTotal = () => {
    return nuevaVenta.productos.reduce((total, producto) => total + (producto.subtotal || 0), 0);
  };

  const handleCrearVenta = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaVenta.productos.length === 0) return;
    if (!nuevaVenta.cliente.nombre.trim()) return;

    const ventaCompleta: Venta = {
      id: Date.now(),
      ...nuevaVenta,
      total: calcularTotal(),
      fechaVenta: new Date(nuevaVenta.fechaVenta).toISOString(),
      fechaPago: nuevaVenta.fechaPago ? new Date(nuevaVenta.fechaPago).toISOString() : undefined,
      pagada: !!nuevaVenta.fechaPago
    };

    setVentas([ventaCompleta, ...ventas]);
    
    // Reset form
    setNuevaVenta({
      productos: [],
      cliente: {
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
      },
      metodoPago: 'Efectivo',
      fechaVenta: new Date().toISOString().split('T')[0],
      fechaPago: '',
      total: 0,
      pagada: false
    });
    
    setModalVentaOpen(false);
  };

  const eliminarVenta = (ventaId: number) => {
    setVentas(ventas.filter(v => v.id !== ventaId));
  };

  const toggleVentaPagada = (ventaId: number) => {
    setVentas(ventas.map(v => {
      if (v.id === ventaId) {
        const nuevaPagada = !v.pagada;
        return {
          ...v, 
          pagada: nuevaPagada,
          fechaPago: nuevaPagada ? new Date().toISOString() : undefined
        };
      }
      return v;
    }));
  };

  const actualizarFechaPago = (ventaId: number, fechaPago: string) => {
    setVentas(ventas.map(v => {
      if (v.id === ventaId) {
        return {
          ...v,
          fechaPago: fechaPago ? new Date(fechaPago).toISOString() : undefined,
          pagada: !!fechaPago
        };
      }
      return v;
    }));
  };

  // Services handlers
  const agregarServicioAVenta = () => {
    if (!servicioSeleccionado || cantidadServicio <= 0) return;
    
    const servicio = servicios.find(s => s.nombre_servicio === servicioSeleccionado);
    if (!servicio) return;

    const servicioExistente = nuevaServicioVenta.servicios.find(s => s.nombre_servicio === servicio.nombre_servicio);
    
    if (servicioExistente) {
      setNuevaServicioVenta({
        ...nuevaServicioVenta,
        servicios: nuevaServicioVenta.servicios.map(s => 
          s.nombre_servicio === servicio.nombre_servicio 
            ? { ...s, cantidad: (s.cantidad || 0) + cantidadServicio, subtotal: ((s.cantidad || 0) + cantidadServicio) * parseFloat(s.precio_servicio) }
            : s
        )
      });
    } else {
      setNuevaServicioVenta({
        ...nuevaServicioVenta,
        servicios: [...nuevaServicioVenta.servicios, {
          ...servicio,
          cantidad: cantidadServicio,
          subtotal: parseFloat(servicio.precio_servicio) * cantidadServicio
        }]
      });
    }
    
    setServicioSeleccionado('');
    setCantidadServicio(1);
  };

  const removerServicioDeVenta = (nombreServicio: string) => {
    setNuevaServicioVenta({
      ...nuevaServicioVenta,
      servicios: nuevaServicioVenta.servicios.filter(s => s.nombre_servicio !== nombreServicio)
    });
  };

  const actualizarCantidadServicio = (nombreServicio: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      removerServicioDeVenta(nombreServicio);
      return;
    }
    
    setNuevaServicioVenta({
      ...nuevaServicioVenta,
      servicios: nuevaServicioVenta.servicios.map(s => 
        s.nombre_servicio === nombreServicio 
          ? { ...s, cantidad: nuevaCantidad, subtotal: parseFloat(s.precio_servicio) * nuevaCantidad }
          : s
      )
    });
  };

  const calcularTotalServicios = () => {
    return nuevaServicioVenta.servicios.reduce((total, servicio) => total + (servicio.subtotal || 0), 0);
  };

  const handleCrearServicioVenta = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaServicioVenta.servicios.length === 0) return;
    if (!nuevaServicioVenta.cliente.nombre.trim()) return;

    const servicioVentaCompleta: ServicioVenta = {
      id: Date.now(),
      ...nuevaServicioVenta,
      total: calcularTotalServicios(),
      fechaServicio: new Date(nuevaServicioVenta.fechaServicio).toISOString(),
      fechaPago: nuevaServicioVenta.fechaPago ? new Date(nuevaServicioVenta.fechaPago).toISOString() : undefined,
      pagado: !!nuevaServicioVenta.fechaPago
    };

    setVentasServicios([servicioVentaCompleta, ...ventasServicios]);
    
    // Reset form
    setNuevaServicioVenta({
      servicios: [],
      cliente: {
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
      },
      metodoPago: 'Efectivo',
      fechaServicio: new Date().toISOString().split('T')[0],
      fechaPago: '',
      total: 0,
      pagado: false
    });
    
    setModalServicioOpen(false);
  };

  const eliminarServicioVenta = (servicioVentaId: number) => {
    setVentasServicios(ventasServicios.filter(v => v.id !== servicioVentaId));
  };

  const toggleServicioPagado = (servicioVentaId: number) => {
    setVentasServicios(ventasServicios.map(v => {
      if (v.id === servicioVentaId) {
        const nuevoPagado = !v.pagado;
        return {
          ...v, 
          pagado: nuevoPagado,
          fechaPago: nuevoPagado ? new Date().toISOString() : undefined
        };
      }
      return v;
    }));
  };

  const actualizarFechaPagoServicio = (servicioVentaId: number, fechaPago: string) => {
    setVentasServicios(ventasServicios.map(v => {
      if (v.id === servicioVentaId) {
        return {
          ...v,
          fechaPago: fechaPago ? new Date(fechaPago).toISOString() : undefined,
          pagado: !!fechaPago
        };
      }
      return v;
    }));
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full mx-auto px-20 py-10 bg-[var(--color-background)] min-h-screen h-screen overflow-y-auto">
      {/* Tabs */}
      <div className="flex mb-8 w-full px-20 mx-auto">
        <div className="flex w-full rounded-2xl border-2 border-[var(--color-primary-600)] bg-white overflow-hidden">
          {[
            { key: 'empleados', label: 'Empleados' },
            { key: 'tareas', label: 'Tareas' },
            { key: 'ventas', label: 'Ventas' },
            { key: 'servicios', label: 'Control de Servicios' }
          ].map(({ key, label }, index, arr) => (
        <button
          key={key}
          className={`flex-1 py-2 text-sm md:text-xl font-bold transition-all duration-200 ${
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
      {tab === 'empleados' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-700)]">Gestión de Empleados</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="bg-[var(--color-secondary-500)] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-[var(--color-secondary-600)] transition-colors w-full sm:w-auto"
              onClick={() => setModalOpen(true)}
            >
              Agregar empleado
            </button>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] w-full sm:w-auto"
              value={cat}
              onChange={e => setCat(e.target.value)}
            >
              {categorias.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {tab === 'ventas' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-700)]">Gestión de Ventas</h2>
          <button
            className="bg-[var(--color-secondary-500)] text-white px-4 sm:px-5 py-2 rounded-lg font-semibold shadow hover:bg-[var(--color-secondary-600)] transition-colors w-full sm:w-auto"
            onClick={() => setModalVentaOpen(true)}
          >
            Nueva Venta
          </button>
        </div>
      )}

      {tab === 'servicios' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-700)]">Gestión de Servicios</h2>
          <button
            className="bg-[var(--color-secondary-500)] text-white px-4 sm:px-5 py-2 rounded-lg font-semibold shadow hover:bg-[var(--color-secondary-600)] transition-colors w-full sm:w-auto"
            onClick={() => setModalServicioOpen(true)}
          >
            Nuevo Servicio
          </button>
        </div>
      )}

      {/* Lista de empleados */}
      {tab === 'empleados' && (
        <div className="flex flex-col gap-4">
          {empleadosFiltrados.map((emp, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-200 gap-2 md:gap-0">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {emp.foto ? (
                    <img 
                      src={emp.foto} 
                      alt={`Foto de ${emp.nombre}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-gray-500 text-sm font-semibold ${emp.foto ? 'hidden' : ''}`}>
                    {emp.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-lg text-[var(--color-primary-700)]">{emp.nombre}</span>
                  <span className="ml-4 text-gray-500">{emp.puesto}</span>
                  <span className="ml-4 text-xs text-gray-400">{emp.categoria}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <span className="text-sm text-gray-700">Salario: <span className="font-semibold">${emp.salario?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></span>
                <span className="text-sm text-[var(--color-primary-400)]">Pago quincenal: <span className="font-semibold">${emp.salario ? (emp.salario/2).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}</span></span>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={emp.pagado} onChange={() => togglePagado(idx)} className="accent-[var(--color-primary-400)] w-5 h-5" />
                  Nómina pagada
                </label>
              </div>
            </div>
          ))}
          {empleadosFiltrados.length === 0 && (
            <div className="text-center text-gray-400 py-8">No hay empleados en esta categoría.</div>
          )}
        </div>
      )}

      {/* Resumen de ventas */}
      {tab === 'ventas' && ventas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total de Ventas</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-primary-700)]">
              ${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">{ventas.length} ventas</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Ventas Pagadas</h3>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              ${totalVentasPagadas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">{ventas.filter(v => v.pagada).length} ventas pagadas</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200 sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Pendiente de Pago</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-600)]">
              ${totalVentasPendientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">{ventas.filter(v => !v.pagada).length} ventas pendientes</p>
          </div>
        </div>
      )}

      {/* Resumen de servicios */}
      {tab === 'servicios' && ventasServicios.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total de Servicios</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-primary-700)]">
              ${totalServicios.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">{ventasServicios.length} servicios</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Servicios Pagados</h3>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              ${totalServiciosPagados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">{ventasServicios.filter(v => v.pagado).length} servicios pagados</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200 sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Pendiente de Pago</h3>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-600)]">
              ${totalServiciosPendientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">{ventasServicios.filter(v => !v.pagado).length} servicios pendientes</p>
          </div>
        </div>
      )}

      {/* Lista de ventas */}
      {tab === 'ventas' && (
        <div className="flex flex-col gap-4">
          {ventas.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-xl mb-2">No hay ventas registradas</p>
              <p>Haz clic en "Nueva Venta" para comenzar</p>
            </div>
          ) : (
            ventas.map((venta) => (
              <div key={venta.id} className={`bg-white rounded-xl shadow p-4 sm:p-6 border-2 ${venta.pagada ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--color-primary-700)]">
                      Venta #{venta.id}
                    </h3>
                    <p className="text-sm text-gray-500">Venta: {formatearFecha(venta.fechaVenta)}</p>
                    {venta.fechaPago && (
                      <p className="text-sm text-green-600">Pago: {formatearFecha(venta.fechaPago)}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${venta.pagada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {venta.pagada ? 'Pagada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-600)]">
                      ${venta.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">{venta.metodoPago}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-[var(--color-primary-600)] mb-2">Cliente</h4>
                    <p className="font-medium">{venta.cliente.nombre}</p>
                    {venta.cliente.email && <p className="text-sm text-gray-600">{venta.cliente.email}</p>}
                    {venta.cliente.telefono && <p className="text-sm text-gray-600">{venta.cliente.telefono}</p>}
                    {venta.cliente.direccion && <p className="text-sm text-gray-600">{venta.cliente.direccion}</p>}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-[var(--color-primary-600)] mb-2">Productos</h4>
                    <div className="space-y-1">
                      {venta.productos.map((producto) => (
                        <div key={producto.id_producto} className="flex justify-between text-sm">
                          <span className="flex-1 mr-2">{producto.nombre_producto} x{producto.cantidad}</span>
                          <span className="font-medium whitespace-nowrap">${(producto.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={venta.pagada} 
                        onChange={() => toggleVentaPagada(venta.id)} 
                        className="accent-[var(--color-primary-400)] w-4 h-4" 
                      />
                      <span className={venta.pagada ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                        {venta.pagada ? 'Venta pagada' : 'Marcar como pagada'}
                      </span>
                    </label>
                    {venta.pagada && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs text-gray-500">Fecha pago:</span>
                        <input
                          type="date"
                          value={venta.fechaPago ? new Date(venta.fechaPago).toISOString().split('T')[0] : ''}
                          onChange={e => actualizarFechaPago(venta.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarVenta(venta.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold self-start sm:self-auto"
                  >
                    Eliminar venta
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tareas (task planner) */}
      {tab === 'tareas' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-primary-700)] mb-4">Gestión de Tareas</h2>
            <form onSubmit={agregarTarea} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva tarea</label>
                <input
                  type="text"
                  value={nuevaTarea}
                  onChange={e => setNuevaTarea(e.target.value)}
                  placeholder="Escribe una nueva tarea..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={prioridad}
                  onChange={e => setPrioridad(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                >
                  {prioridades.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <button 
                type="submit" 
                className="bg-[var(--color-secondary-500)] text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-[var(--color-secondary-600)] transition-colors w-full sm:w-auto"
              >
                Agregar tarea
              </button>
            </form>
          </div>
          {/* Lista de tareas agrupadas por prioridad */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {prioridades.map(prio => (
              <div key={prio} className="bg-white rounded-xl shadow p-4">
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${prio === 'Alta' ? 'text-[var(--color-secondary-600)]' : prio === 'Media' ? 'text-[var(--color-primary-600)]' : 'text-gray-500'}`}>
                  <div className={`w-3 h-3 rounded-full ${prio === 'Alta' ? 'bg-[var(--color-secondary-600)]' : prio === 'Media' ? 'bg-[var(--color-primary-600)]' : 'bg-gray-500'}`}></div>
                  {prio}
                  <span className="text-sm font-normal text-gray-500">
                    ({tareas.filter(t => t.prioridad === prio).length})
                  </span>
                </h3>
                <ul className="flex flex-col gap-3">
                  {tareas.filter(t => t.prioridad === prio).length === 0 && (
                    <li className="text-gray-400 italic text-center py-4">No hay tareas de prioridad {prio.toLowerCase()}.</li>
                  )}
                  {tareas.filter(t => t.prioridad === prio).map((t, idx) => {
                     const globalIdx = tareas.findIndex(tt => tt === t);
                     return (
                       <li
                         key={globalIdx}
                         className={`flex items-center gap-3 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 shadow-sm ${dragIdx === globalIdx ? 'ring-2 ring-[var(--color-primary-400)] z-10' : ''} ${dragOverIdx === globalIdx && dragIdx !== null && dragIdx !== globalIdx ? 'ring-2 ring-[var(--color-secondary-400)]' : ''} ${t.completada ? 'opacity-75' : ''}`}
                         draggable={true}
                         onDragStart={() => handleDragStart(globalIdx)}
                         onDragOver={e => { e.preventDefault(); handleDragOver(globalIdx); }}
                         onDrop={() => handleDrop(globalIdx)}
                         onDragEnd={handleDragEnd}
                         style={{ cursor: 'grab' }}
                       >
                         <input 
                           type="checkbox" 
                           checked={t.completada} 
                           onChange={() => toggleCompletada(globalIdx)} 
                           className="accent-[var(--color-primary-400)] w-4 h-4" 
                         />
                         {editIdx === globalIdx ? (
                           <input
                             className="flex-1 border-b border-[var(--color-primary-400)] outline-none px-1 py-0.5 text-sm"
                             value={editTexto}
                             onChange={e => setEditTexto(e.target.value)}
                             onBlur={() => saveEdit(globalIdx)}
                             onKeyDown={e => { if (e.key === 'Enter') saveEdit(globalIdx); if (e.key === 'Escape') cancelEdit(); }}
                             autoFocus
                           />
                         ) : (
                           <span
                             className={`flex-1 text-sm ${t.completada ? 'line-through text-gray-400' : 'text-gray-700'}`}
                             onDoubleClick={() => startEdit(globalIdx, t.texto)}
                           >
                             {t.texto}
                           </span>
                         )}
                         <button 
                           onClick={() => eliminarTarea(globalIdx)} 
                           className="text-red-500 hover:text-red-700 text-sm font-semibold px-2 py-1 rounded hover:bg-red-50"
                         >
                           ×
                         </button>
                       </li>
                     );
                   })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
      )}


      {/* Lista de servicios */}
      {tab === 'servicios' && (
        <div className="flex flex-col gap-4">
          {ventasServicios.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-xl mb-2">No hay servicios registrados</p>
              <p>Haz clic en "Nuevo Servicio" para comenzar</p>
            </div>
          ) : (
            ventasServicios.map((servicioVenta) => (
              <div key={servicioVenta.id} className={`bg-white rounded-xl shadow p-4 sm:p-6 border-2 ${servicioVenta.pagado ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--color-primary-700)]">
                      Servicio #{servicioVenta.id}
                    </h3>
                    <p className="text-sm text-gray-500">Servicio: {formatearFecha(servicioVenta.fechaServicio)}</p>
                    {servicioVenta.fechaPago && (
                      <p className="text-sm text-green-600">Pago: {formatearFecha(servicioVenta.fechaPago)}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${servicioVenta.pagado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {servicioVenta.pagado ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-600)]">
                      ${servicioVenta.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">{servicioVenta.metodoPago}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-[var(--color-primary-600)] mb-2">Cliente</h4>
                    <p className="font-medium">{servicioVenta.cliente.nombre}</p>
                    {servicioVenta.cliente.email && <p className="text-sm text-gray-600">{servicioVenta.cliente.email}</p>}
                    {servicioVenta.cliente.telefono && <p className="text-sm text-gray-600">{servicioVenta.cliente.telefono}</p>}
                    {servicioVenta.cliente.direccion && <p className="text-sm text-gray-600">{servicioVenta.cliente.direccion}</p>}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-[var(--color-primary-600)] mb-2">Servicios</h4>
                    <div className="space-y-1">
                      {servicioVenta.servicios.map((servicio) => (
                        <div key={servicio.nombre_servicio} className="flex justify-between text-sm">
                          <span className="flex-1 mr-2">{servicio.nombre_servicio} x{servicio.cantidad}</span>
                          <span className="font-medium whitespace-nowrap">${(servicio.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={servicioVenta.pagado} 
                        onChange={() => toggleServicioPagado(servicioVenta.id)} 
                        className="accent-[var(--color-primary-400)] w-4 h-4" 
                      />
                      <span className={servicioVenta.pagado ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                        {servicioVenta.pagado ? 'Servicio pagado' : 'Marcar como pagado'}
                      </span>
                    </label>
                    {servicioVenta.pagado && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs text-gray-500">Fecha pago:</span>
                        <input
                          type="date"
                          value={servicioVenta.fechaPago ? new Date(servicioVenta.fechaPago).toISOString().split('T')[0] : ''}
                          onChange={e => actualizarFechaPagoServicio(servicioVenta.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarServicioVenta(servicioVenta.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold self-start sm:self-auto"
                  >
                    Eliminar servicio
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar empleado" size="md">
        <form onSubmit={handleAddEmpleado} className="flex flex-col gap-4 w-full">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Nombre</span>
            <input type="text" value={nuevoEmpleado.nombre} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Puesto</span>
            <input type="text" value={nuevoEmpleado.puesto} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, puesto: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Categoría</span>
            <select value={nuevoEmpleado.categoria} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, categoria: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]">
              {categorias.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Salario mensual</span>
            <input type="number" min="0" step="0.01" value={nuevoEmpleado.salario} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, salario: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" required />
          </label>
          <div className="text-sm text-gray-600">Pago quincenal: <span className="font-semibold">${nuevoEmpleado.salario && !isNaN(Number(nuevoEmpleado.salario)) ? (Number(nuevoEmpleado.salario)/2).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}</span></div>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Foto del empleado</span>
            <div className="flex gap-2">
              <input 
                type="url" 
                value={nuevoEmpleado.foto} 
                onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, foto: e.target.value })} 
                placeholder="URL de la imagen o sube un archivo"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setNuevoEmpleado({ ...nuevoEmpleado, foto: event.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="foto-empleado"
              />
              <label
                htmlFor="foto-empleado"
                className="bg-[var(--color-primary-600)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-700)] transition-colors cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Subir
              </label>
            </div>
            {nuevoEmpleado.foto && (
              <div className="mt-2">
                <span className="text-sm text-gray-600">Vista previa:</span>
                <div className="mt-1 w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  <img 
                    src={nuevoEmpleado.foto} 
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </label>
          <button type="submit" className="bg-[var(--color-secondary-500)] text-white rounded-lg py-2 font-semibold mt-2 hover:bg-[var(--color-secondary-600)] transition-colors">Agregar</button>
        </form>
      </Modal>

      {/* Modal para nueva venta */}
      <Modal open={modalVentaOpen} onClose={() => setModalVentaOpen(false)} title="Nueva Venta" size="xl">
        <form onSubmit={handleCrearVenta} className="flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="flex flex-col gap-6">
              {/* Información del cliente */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-primary-700)] mb-3">Información del Cliente</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Nombre *</span>
                    <input 
                      type="text" 
                      value={nuevaVenta.cliente.nombre} 
                      onChange={e => setNuevaVenta({...nuevaVenta, cliente: {...nuevaVenta.cliente, nombre: e.target.value}})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                      required 
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Email</span>
                    <input 
                      type="email" 
                      value={nuevaVenta.cliente.email} 
                      onChange={e => setNuevaVenta({...nuevaVenta, cliente: {...nuevaVenta.cliente, email: e.target.value}})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Teléfono</span>
                    <input 
                      type="tel" 
                      value={nuevaVenta.cliente.telefono} 
                      onChange={e => setNuevaVenta({...nuevaVenta, cliente: {...nuevaVenta.cliente, telefono: e.target.value}})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Dirección</span>
                    <input 
                      type="text" 
                      value={nuevaVenta.cliente.direccion} 
                      onChange={e => setNuevaVenta({...nuevaVenta, cliente: {...nuevaVenta.cliente, direccion: e.target.value}})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                    />
                  </label>
                </div>
              </div>

              {/* Fechas de la venta */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-primary-700)] mb-3">Fechas</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Fecha de Venta *</span>
                    <input 
                      type="date" 
                      value={nuevaVenta.fechaVenta} 
                      onChange={e => setNuevaVenta({...nuevaVenta, fechaVenta: e.target.value})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                      required 
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Fecha de Pago</span>
                    <input 
                      type="date" 
                      value={nuevaVenta.fechaPago} 
                      onChange={e => setNuevaVenta({...nuevaVenta, fechaPago: e.target.value})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                    />
                    <span className="text-xs text-gray-500">Dejar vacío si aún no se ha pagado</span>
                  </label>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-primary-700)] mb-3">Método de Pago</h3>
                <select
                  value={nuevaVenta.metodoPago}
                  onChange={e => setNuevaVenta({...nuevaVenta, metodoPago: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                >
                  {metodosPago.map(metodo => (
                    <option key={metodo} value={metodo}>{metodo}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="flex flex-col gap-6">
              {/* Agregar productos */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-primary-700)] mb-3">Productos</h3>
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={productoSeleccionado}
                      onChange={e => setProductoSeleccionado(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos.map(producto => (
                        <option key={producto.id_producto} value={producto.id_producto}>
                          {producto.nombre_producto} - ${parseFloat(producto.precio_producto).toLocaleString('es-MX')}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={cantidadProducto}
                        onChange={e => setCantidadProducto(parseInt(e.target.value) || 1)}
                        className="w-20 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                      />
                      <button
                        type="button"
                        onClick={agregarProductoAVenta}
                        disabled={!productoSeleccionado}
                        className="bg-[var(--color-primary-600)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-700)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de productos en la venta */}
                {nuevaVenta.productos.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold mb-2">Productos en la venta:</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {nuevaVenta.productos.map((producto) => (
                        <div key={producto.id_producto} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-2 rounded gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm sm:text-base truncate block">{producto.nombre_producto}</span>
                            <span className="text-xs sm:text-sm text-gray-500">${parseFloat(producto.precio_producto).toLocaleString('es-MX')} c/u</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={producto.cantidad}
                              onChange={e => actualizarCantidadProducto(producto.id_producto, parseInt(e.target.value) || 1)}
                              className="w-16 sm:w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
                            />
                            <span className="font-semibold min-w-[70px] sm:min-w-[90px] text-right text-sm">
                              ${(producto.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                            <button
                              type="button"
                              onClick={() => removerProductoDeVenta(producto.id_producto)}
                              className="text-red-500 hover:text-red-700 text-sm font-semibold px-2 py-1 rounded hover:bg-red-50"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-base sm:text-lg">Total:</span>
                        <span className="font-bold text-lg sm:text-xl text-[var(--color-secondary-600)]">
                          ${calcularTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end border-t pt-4">
            <button
              type="button"
              onClick={() => setModalVentaOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors order-2 sm:order-1 w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={nuevaVenta.productos.length === 0}
              className="bg-[var(--color-secondary-500)] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[var(--color-secondary-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
            >
              Crear Venta
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para nuevo servicio */}
      <Modal open={modalServicioOpen} onClose={() => setModalServicioOpen(false)} title="Nuevo Servicio" size="xl">
        <form onSubmit={handleCrearServicioVenta} className="flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="flex flex-col gap-6">
              {/* Información del cliente */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-primary-700)] mb-3">Información del Cliente</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Nombre *</span>
                    <input 
                      type="text" 
                      value={nuevaServicioVenta.cliente.nombre} 
                      onChange={e => setNuevaServicioVenta({...nuevaServicioVenta, cliente: {...nuevaServicioVenta.cliente, nombre: e.target.value}})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                      required 
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Email</span>
                    <input 
                      type="email" 
                      value={nuevaServicioVenta.cliente.email} 
                      onChange={e => setNuevaServicioVenta({...nuevaServicioVenta, cliente: {...nuevaServicioVenta.cliente, email: e.target.value}})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Teléfono</span>
                    <input 
                      type="tel" 
                      value={nuevaServicioVenta.cliente.telefono} 
                      onChange={e => setNuevaServicioVenta({...nuevaServicioVenta, cliente: {...nuevaServicioVenta.cliente, telefono: e.target.value}})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Dirección</span>
                    <input 
                      type="text" 
                      value={nuevaServicioVenta.cliente.direccion} 
                      onChange={e => setNuevaServicioVenta({...nuevaServicioVenta, cliente: {...nuevaServicioVenta.cliente, direccion: e.target.value}})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                    />
                  </label>
                </div>
              </div>

              {/* Fechas del servicio */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-primary-700)] mb-3">Fechas</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Fecha de Servicio *</span>
                    <input 
                      type="date" 
                      value={nuevaServicioVenta.fechaServicio} 
                      onChange={e => setNuevaServicioVenta({...nuevaServicioVenta, fechaServicio: e.target.value})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                      required 
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-semibold">Fecha de Pago</span>
                    <input 
                      type="date" 
                      value={nuevaServicioVenta.fechaPago} 
                      onChange={e => setNuevaServicioVenta({...nuevaServicioVenta, fechaPago: e.target.value})} 
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]" 
                    />
                    <span className="text-xs text-gray-500">Dejar vacío si aún no se ha pagado</span>
                  </label>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-primary-700)] mb-3">Método de Pago</h3>
                <select
                  value={nuevaServicioVenta.metodoPago}
                  onChange={e => setNuevaServicioVenta({...nuevaServicioVenta, metodoPago: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                >
                  {metodosPago.map(metodo => (
                    <option key={metodo} value={metodo}>{metodo}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="flex flex-col gap-6">
              {/* Agregar servicios */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-primary-700)] mb-3">Servicios</h3>
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={servicioSeleccionado}
                      onChange={e => setServicioSeleccionado(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                    >
                      <option value="">Seleccionar servicio...</option>
                      {servicios.map(servicio => (
                        <option key={servicio.nombre_servicio} value={servicio.nombre_servicio}>
                          {servicio.nombre_servicio} - ${parseFloat(servicio.precio_servicio).toLocaleString('es-MX')}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={cantidadServicio}
                        onChange={e => setCantidadServicio(parseInt(e.target.value) || 1)}
                        className="w-20 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                      />
                      <button
                        type="button"
                        onClick={agregarServicioAVenta}
                        disabled={!servicioSeleccionado}
                        className="bg-[var(--color-primary-600)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-700)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de servicios en la venta */}
                {nuevaServicioVenta.servicios.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold mb-2">Servicios en la venta:</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {nuevaServicioVenta.servicios.map((servicio) => (
                        <div key={servicio.nombre_servicio} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-2 rounded gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm sm:text-base truncate block">{servicio.nombre_servicio}</span>
                            <span className="text-xs sm:text-sm text-gray-500">${parseFloat(servicio.precio_servicio).toLocaleString('es-MX')} c/u</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={servicio.cantidad}
                              onChange={e => actualizarCantidadServicio(servicio.nombre_servicio, parseInt(e.target.value) || 1)}
                              className="w-16 sm:w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
                            />
                            <span className="font-semibold min-w-[70px] sm:min-w-[90px] text-right text-sm">
                              ${(servicio.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                            <button
                              type="button"
                              onClick={() => removerServicioDeVenta(servicio.nombre_servicio)}
                              className="text-red-500 hover:text-red-700 text-sm font-semibold px-2 py-1 rounded hover:bg-red-50"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-base sm:text-lg">Total:</span>
                        <span className="font-bold text-lg sm:text-xl text-[var(--color-secondary-600)]">
                          ${calcularTotalServicios().toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end border-t pt-4">
            <button
              type="button"
              onClick={() => setModalServicioOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors order-2 sm:order-1 w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={nuevaServicioVenta.servicios.length === 0}
              className="bg-[var(--color-secondary-500)] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[var(--color-secondary-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
            >
              Crear Servicio
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 