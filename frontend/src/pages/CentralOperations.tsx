import { useState, useEffect } from 'react';
import Modal from '../components/Modal';

const mockEmpleados = [
  { nombre: 'Samuel Guzmán', puesto: 'Mi Novio', categoria: 'Administrativo', salario: 100000, pagado: false }
];
const categorias = ['Todos', 'Administrativo', 'Ventas', 'Soporte'];
const prioridades = ['Alta', 'Media', 'Baja'];

export default function CentralOperations() {
  const [tab, setTab] = useState<'empleados' | 'tareas'>('empleados');
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
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: '', puesto: '', categoria: 'Administrativo', salario: '', pagado: false });

  useEffect(() => {
    localStorage.setItem('task_planner', JSON.stringify(tareas));
  }, [tareas]);

  const empleadosFiltrados = cat === 'Todos' ? empleados : empleados.filter(e => e.categoria === cat);

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
        pagado: false
      }
    ]);
    setNuevoEmpleado({ nombre: '', puesto: '', categoria: 'Administrativo', salario: '', pagado: false });
    setModalOpen(false);
  };
  const togglePagado = (idx: number) => {
    setEmpleados(empleados.map((e, i) => i === idx ? { ...e, pagado: !e.pagado } : e));
  };

  return (
    <div className="w-full mx-auto px-20 py-10 bg-[var(--color-background)] min-h-screen h-screen overflow-y-auto">
      {/* Tabs */}
      <div className="flex mb-8 w-full max-w-lg mx-auto">
        <div className="flex w-full rounded-2xl border-2 border-[var(--color-primary-600)] bg-white overflow-hidden">
          <button
            className={`flex-1 py-2 text-xl font-bold transition-all duration-200
              ${tab === 'empleados'
                ? 'bg-[var(--color-primary-600)] text-white shadow-inner'
                : 'bg-white text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]'}
              rounded-l-2xl`}
            style={{ borderRight: '1.5px solid var(--color-primary-600)' }}
            onClick={() => setTab('empleados')}
          >
            Empleados
          </button>
          <button
            className={`flex-1 py-2 text-xl font-bold transition-all duration-200
              ${tab === 'tareas'
                ? 'bg-[var(--color-primary-600)] text-white shadow-inner'
                : 'bg-white text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]'}
              rounded-r-2xl`}
            onClick={() => setTab('tareas')}
          >
            Tareas
          </button>
        </div>
      </div>
      {/* Barra de acciones */}
      {tab === 'empleados' && (
        <div className="flex items-center justify-between mb-6">
          <button
            className="bg-[var(--color-secondary-500)] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-[var(--color-secondary-600)] transition-colors"
            onClick={() => setModalOpen(true)}
          >
            Agregar empleado
          </button>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
            value={cat}
            onChange={e => setCat(e.target.value)}
          >
            {categorias.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}
      {/* Lista de empleados */}
      {tab === 'empleados' && (
        <div className="flex flex-col gap-4">
          {empleadosFiltrados.map((emp, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-200 gap-2 md:gap-0">
              <div className="flex-1">
                <span className="font-bold text-lg text-[var(--color-primary-700)]">{emp.nombre}</span>
                <span className="ml-4 text-gray-500">{emp.puesto}</span>
                <span className="ml-4 text-xs text-gray-400">{emp.categoria}</span>
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
      {/* Tareas (task planner) */}
      {tab === 'tareas' && (
        <div className="max-w-2xl mx-auto">
          <form onSubmit={agregarTarea} className="flex flex-col md:flex-row gap-3 mb-6 items-center">
            <input
              type="text"
              value={nuevaTarea}
              onChange={e => setNuevaTarea(e.target.value)}
              placeholder="Nueva tarea..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
            />
            <select
              value={prioridad}
              onChange={e => setPrioridad(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
            >
              {prioridades.map(p => <option key={p}>{p}</option>)}
            </select>
            <button type="submit" className="bg-[var(--color-secondary-500)] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-[var(--color-secondary-600)] transition-colors">
              Agregar tarea
            </button>
          </form>
          {/* Lista de tareas agrupadas por prioridad */}
          {prioridades.map(prio => (
            <div key={prio} className="mb-6">
              <h3 className={`text-lg font-bold mb-2 ${prio === 'Alta' ? 'text-[var(--color-secondary-600)]' : prio === 'Media' ? 'text-[var(--color-primary-600)]' : 'text-gray-500'}`}>{prio}</h3>
              <ul className="flex flex-col gap-4">
                {tareas.filter(t => t.prioridad === prio).length === 0 && (
                  <li className="text-gray-400 italic">No hay tareas de prioridad {prio.toLowerCase()}.</li>
                )}
                {tareas.filter(t => t.prioridad === prio).map((t, idx) => {
                   const globalIdx = tareas.findIndex(tt => tt === t);
                   return (
                     <li
                       key={globalIdx}
                       className={`flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-2 shadow ${dragIdx === globalIdx ? 'ring-2 ring-[var(--color-primary-400)] z-10' : ''} ${dragOverIdx === globalIdx && dragIdx !== null && dragIdx !== globalIdx ? 'ring-2 ring-[var(--color-secondary-400)]' : ''}`}
                       draggable={true}
                       onDragStart={() => handleDragStart(globalIdx)}
                       onDragOver={e => { e.preventDefault(); handleDragOver(globalIdx); }}
                       onDrop={() => handleDrop(globalIdx)}
                       onDragEnd={handleDragEnd}
                       style={{ cursor: 'grab' }}
                     >
                       <input type="checkbox" checked={t.completada} onChange={() => toggleCompletada(globalIdx)} className="accent-[var(--color-primary-400)] w-5 h-5" />
                       {editIdx === globalIdx ? (
                         <input
                           className="flex-1 border-b border-[var(--color-primary-400)] outline-none px-1 py-0.5"
                           value={editTexto}
                           onChange={e => setEditTexto(e.target.value)}
                           onBlur={() => saveEdit(globalIdx)}
                           onKeyDown={e => { if (e.key === 'Enter') saveEdit(globalIdx); if (e.key === 'Escape') cancelEdit(); }}
                           autoFocus
                         />
                       ) : (
                         <span
                           className={`flex-1 ${t.completada ? 'line-through text-gray-400' : ''}`}
                           onDoubleClick={() => startEdit(globalIdx, t.texto)}
                         >
                           {t.texto}
                         </span>
                       )}
                       <button onClick={() => eliminarTarea(globalIdx)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
                     </li>
                   );
                 })}
              </ul>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar empleado">
        <form onSubmit={handleAddEmpleado} className="flex flex-col gap-4 w-72">
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
          <button type="submit" className="bg-[var(--color-secondary-500)] text-white rounded-lg py-2 font-semibold mt-2 hover:bg-[var(--color-secondary-600)] transition-colors">Agregar</button>
        </form>
      </Modal>
    </div>
  );
} 