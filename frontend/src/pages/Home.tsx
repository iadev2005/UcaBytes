import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { KebabIcon, DashboardIcon, MegaphoneIcon, AutomationIcon } from "../icons";

// Tipos para eventos y props
interface CalendarProps {
  onDateClick: (date: Date) => void;
  eventosPorFecha: Record<string, string[]>;
}

function Calendar({ onDateClick, eventosPorFecha }: CalendarProps) {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [selected, setSelected] = useState<number>(today.getDate());

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < offset; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);
  while (daysArray.length < 42) daysArray.push(null);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelected(today.getDate());
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelected(today.getDate());
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-4 md:p-3 sm:p-2 w-full max-w-xs h-[280px] overflow-hidden flex flex-col">
      <h2 className="text-sm font-bold text-center">Mira tus eventos</h2>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={prevMonth}
          className="px-2 font-bold text-base text-[var(--color-primary-400)] cursor-pointer"
          disabled={month === 0 && year === today.getFullYear()}
        >&lt;</button>
        <h3 className={`font-bold transition-all duration-200 text-sm ${monthNames[month].length > 7 ? "text-sm" : "text-sm"}`}>{monthNames[month]} {year}</h3>
        <button
          onClick={nextMonth}
          className="px-2 font-bold text-base text-[var(--color-primary-400)] cursor-pointer"
          disabled={month === 11 && year === today.getFullYear() + 1}
        >&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-[1px] text-center text-xs mb-1 w-full">
        {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => <div key={i}>{d}</div>)}
        {daysArray.map((day, i) => {
          const dateObj = day ? new Date(year, month, day) : null;
          const dateKey = dateObj ? dateObj.toISOString().slice(0, 10) : "";
          const tieneEvento = !!eventosPorFecha[dateKey];
          return (
            <div key={i} className="w-full relative">
              {day ? (
                <button
                  onClick={() => {
                    setSelected(day);
                    onDateClick(new Date(year, month, day));
                  }}
                  className={`w-full aspect-square rounded-full text-xs transition-all
                    ${day === selected ? "bg-[var(--color-secondary-300)] border-2 border-[var(--color-secondary-400)] font-bold" : ""}
                    ${day === today.getDate() && month === today.getMonth() && year === today.getFullYear() && day !== selected ? "bg-gray-200 font-bold" : ""}
                    hover:bg-[var(--color-secondary-100)] cursor-pointer
                  `}
                >
                  {day}
                  {tieneEvento && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-2 w-1 h-1 rounded-full bg-[var(--color-secondary-400)]"></span>
                  )}
                </button>
              ) : (
                <span className="w-full aspect-square inline-block"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [accesos, setAccesos] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accesos_rapidos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openKebab, setOpenKebab] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEventText, setNewEventText] = useState('');
  
  // Estado persistente para eventos
  const [eventosPorFecha, setEventosPorFecha] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eventos_calendario');
      return saved ? JSON.parse(saved) : {
        "2025-01-24": ["Reunión con equipo de ventas", "Llamada con cliente importante"],
        "2025-01-25": ["Entrega de reporte mensual"],
      };
    }
    return {
      "2025-01-24": ["Reunión con equipo de ventas", "Llamada con cliente importante"],
      "2025-01-25": ["Entrega de reporte mensual"],
    };
  });

  useEffect(() => {
    localStorage.setItem('accesos_rapidos', JSON.stringify(accesos));
  }, [accesos]);

  // Guardar eventos en localStorage cuando cambien
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('eventos_calendario', JSON.stringify(eventosPorFecha));
    }
  }, [eventosPorFecha]);

  const accesosDisponibles: string[] = ["Ventas", "Inventario", "Facturación", "Marketing"];
  const agregarAcceso = (acceso: string) => {
    if (acceso && !accesos.includes(acceso) && accesos.length < 4) {
      setAccesos([...accesos, acceso]);
    }
    setModalOpen(false);
  };

  const eliminarAcceso = (idx: number) => {
    setAccesos(accesos.filter((_, i) => i !== idx));
    setOpenKebab(null);
  };

  // Funciones para manejar eventos
  const agregarEvento = () => {
    if (!selectedDate || !newEventText.trim()) return;
    
    const dateKey = selectedDate.toISOString().slice(0, 10);
    const nuevosEventos = {
      ...eventosPorFecha,
      [dateKey]: [...(eventosPorFecha[dateKey] || []), newEventText.trim()]
    };
    
    setEventosPorFecha(nuevosEventos);
    setNewEventText('');
    setShowAddEventForm(false);
  };

  const eliminarEvento = (eventIndex: number) => {
    if (!selectedDate) return;
    
    const dateKey = selectedDate.toISOString().slice(0, 10);
    const eventosActuales = eventosPorFecha[dateKey] || [];
    const nuevosEventos = {
      ...eventosPorFecha,
      [dateKey]: eventosActuales.filter((_, idx) => idx !== eventIndex)
    };
    
    // Si no quedan eventos para esa fecha, eliminar la entrada
    if (nuevosEventos[dateKey].length === 0) {
      delete nuevosEventos[dateKey];
    }
    
    setEventosPorFecha(nuevosEventos);
  };

  const handleEventModalClose = () => {
    setEventModalOpen(false);
    setShowAddEventForm(false);
    setNewEventText('');
  };

  const activarArrastrar = (idx: number) => {
    setDragIndex(idx);
    setOpenKebab(null);
  };
  const handleDragStart = (idx: number) => {
    setDragIndex(idx);
  };
  const handleDragOver = (idx: number) => {
    setDragOverIndex(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return;
    const newAccesos = [...accesos];
    const [moved] = newAccesos.splice(dragIndex, 1);
    newAccesos.splice(idx, 0, moved);
    setAccesos(newAccesos);
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Handler para cuando se hace click en un acceso rápido
  const handleAccesoClick = (acceso: string) => {
    // Aquí puedes agregar navegación o lógica personalizada
    console.log('Acceso rápido clickeado:', acceso);
  };

  const eventosFecha: string[] = selectedDate ? eventosPorFecha[selectedDate.toISOString().slice(0, 10)] || [] : [];

  // Lista de tips útiles para mejorar la empresa
  const tipsUtiles = [
    "Automatiza tareas repetitivas para ahorrar tiempo.",
    "Escucha el feedback de tus clientes y adáptate.",
    "Invierte en la capacitación de tu equipo.",
    "Analiza tus métricas clave cada semana.",
    "Fomenta la innovación y la creatividad.",
    "Mantén una comunicación clara y abierta.",
    "Diversifica tus fuentes de ingreso.",
    "Aprovecha herramientas digitales para marketing.",
    "Establece metas claras y medibles.",
    "Cuida la experiencia del cliente en cada punto de contacto."
  ];
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tipsUtiles.length);
    }, 60000);
    return () => clearInterval(interval);
  }, [tipsUtiles.length]);

  // To-Do List sincronizada con task planner
  const [plannerTasks, setPlannerTasks] = useState<any[]>([]);
  useEffect(() => {
    const updateTasks = () => {
      const stored = localStorage.getItem('task_planner');
      if (stored) {
        try {
          setPlannerTasks(JSON.parse(stored));
        } catch {
          setPlannerTasks([]);
        }
      } else {
        setPlannerTasks([]);
      }
    };
    updateTasks();
    window.addEventListener('storage', updateTasks);
    return () => window.removeEventListener('storage', updateTasks);
  }, []);
  const prioridades = ['Alta', 'Media', 'Baja'];
  const plannerTasksByPriority = (prio: string) => plannerTasks.filter(t => t.prioridad === prio).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] p-8 items-center relative overflow-hidden">
      <h1 className="text-4xl md:text-3xl sm:text-2xl font-bold mb-8">¡Bienvenido al Panel de Control!</h1>

      <div className="grid [grid-template-columns:2fr_min-content_0.8fr] gap-8 w-full max-w-5xl flex-1 justify-start z-10">
        <div className="flex flex-col gap-4 flex-1 justify-start h-[70vh]">
          <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-3 sm:p-2 border border-[var(--color-primary-100)] animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-bold px-5">Resumen de Ciclo o Progreso</h2>
            </div>
            <div className="flex items-center justify-center h-16 text-sm text-gray-400">
              No hay datos para mostrar.
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <div className="flex flex-col items-center gap-2 w-1/2 bg-white rounded-3xl shadow-2xl p-4 md:p-3 sm:p-2 border border-[var(--color-primary-100)] animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <AutomationIcon className="text-[var(--color-secondary-400)] w-5 h-5" />
                <h2 className="text-lg font-bold">Acceso Rápido</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full min-h-[160px] justify-items-center">
                {accesos.map((acceso, i) => (
                  <div
                    key={i}
                    className={`relative w-20 h-20 ${dragIndex === i ? 'z-20' : ''}`}
                    draggable={dragIndex === i}
                    onDragStart={dragIndex === i ? () => handleDragStart(i) : undefined}
                    onDragOver={dragIndex !== null && dragIndex !== i ? (e) => { e.preventDefault(); handleDragOver(i); } : undefined}
                    onDrop={dragIndex !== null && dragIndex !== i ? () => handleDrop(i) : undefined}
                    onDragEnd={dragIndex === i ? handleDragEnd : undefined}
                    style={{ cursor: dragIndex === i ? 'grab' : 'default' }}
                  >
                    <button className="w-full h-full rounded-2xl bg-[var(--color-secondary-500)] text-white font-bold text-xs flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer"
                      onClick={() => handleAccesoClick(acceso)}
                    >
                      <span className="block text-center leading-tight break-words">{acceso}</span>
                    </button>
                    <button
                      className="absolute top-2 right-0 p-0 transition-colors cursor-pointer"
                      onClick={() => setOpenKebab(openKebab === i ? null : i)}
                      tabIndex={0}
                    >
                      <KebabIcon width={16} height={16} color="#fff" />
                    </button>
                    {openKebab === i && (
                      <div className="absolute right-0 top-6 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-24 flex flex-col">
                        <button
                          className="px-3 py-1.5 text-left text-red-600 hover:bg-red-50 rounded-t-lg cursor-pointer text-xs"
                          onClick={() => eliminarAcceso(i)}
                        >
                          Eliminar
                        </button>
                        <button
                          className="px-3 py-1.5 text-left text-gray-700 hover:bg-gray-100 rounded-b-lg cursor-pointer text-xs"
                          onClick={() => activarArrastrar(i)}
                        >
                          Arrastrar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {accesos.length < 4 && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 text-xl text-gray-400 hover:bg-gray-100 hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
                    title="Agregar acceso rápido"
                  >
                    +
                  </button>
                )}
              </div>
              <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Selecciona un acceso rápido">
                <ul className="flex flex-col mb-4 w-full divide-y divide-[var(--color-primary-200)]">
                  {accesosDisponibles.filter(a => !accesos.includes(a)).map((acceso) => (
                    <li key={acceso} className="w-full">
                      <span
                        className="w-full block px-4 py-2 cursor-pointer rounded-md transition-colors text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)] hover:underline text-base font-medium text-left"
                        onClick={() => agregarAcceso(acceso)}
                        tabIndex={0}
                        role="button"
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') agregarAcceso(acceso); }}
                      >
                        {acceso}
                      </span>
                    </li>
                  ))}
                </ul>
              </Modal>
            </div>

            <div className="flex-1 flex justify-end animate-fade-in-up">
              <Calendar onDateClick={(date: Date) => {
                setSelectedDate(date);
                setEventModalOpen(true);
              }} eventosPorFecha={eventosPorFecha} />
            </div>
          </div>
        </div>

        <div className="flex flex-row h-[70vh] col-span-2 overflow-hidden justify-end">
          <div className="w-px bg-gray-300 h-full" />
          <div className="flex flex-col gap-6 overflow-y-auto pr-6 pb-3 items-end flex-1 h-full w-full pl-6">
            <div className="bg-[var(--color-secondary-300)] rounded-3xl shadow-2xl p-5 border border-[var(--color-secondary-100)] w-full animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <MegaphoneIcon className="text-[var(--color-secondary-600)] w-5 h-5" />
                <h2 className="text-xl font-bold text-[var(--color-secondary-800)]">Tips Útiles</h2>
              </div>
              <p className="text-base transition-all duration-500 min-h-[28px]">{tipsUtiles[tipIndex]}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-5 border border-gray-200 w-full animate-fade-in-up">
              <h2 className="text-xl font-bold mb-2">Por hacer:</h2>
              <hr className="border-t border-gray-300 mb-4" />
              {prioridades.map(prio => {
                const tasks = plannerTasksByPriority(prio);
                return (
                  <div key={prio} className="mb-2">
                    <h3 className={`text-base font-semibold mb-1 ${prio === 'Alta' ? 'text-[var(--color-secondary-700)]' : prio === 'Media' ? 'text-[var(--color-primary-700)]' : 'text-gray-700'}`}>{prio}</h3>
                    <ul className="text-sm space-y-1 mb-3">
                      {tasks.length > 0 ? (
                        tasks.map((t, idx) => (
                          <li key={idx} className={`border-b pb-1 mb-1 ${prio === 'Alta' ? 'border-[var(--color-secondary-200)]' : prio === 'Media' ? 'border-[var(--color-primary-200)]' : 'border-gray-300'}`}>{t.texto}</li>
                        ))
                      ) : (
                        <li className="text-gray-400 italic">Sin tareas de prioridad {prio.toLowerCase()}.</li>
                      )}
                    </ul>
                    {tasks.length > 1 && <hr className="border-t border-gray-200 my-2" />}
                  </div>
                );
              })}
            </div>

            {Array.from({ length: 0 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-2xl p-5 border border-gray-200 w-full animate-fade-in-up">
                <h2 className="text-lg font-bold mb-2">Elemento extra {idx + 1}</h2>
                <p className="text-sm">Este es un elemento adicional para probar el scroll en la columna derecha.</p>
              </div>
            ))}
            {/* Espacio adicional al final para asegurar scroll completo */}
            <div className="h-20 lg:h-24"></div>
          </div>
        </div>
      </div>

      <Modal open={eventModalOpen} onClose={handleEventModalClose} title={selectedDate ? `Eventos para ${selectedDate.toLocaleDateString()}` : "Eventos"}>
        <div className="w-full max-w-md">
          {/* Lista de eventos existentes */}
          {eventosFecha.length > 0 ? (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Eventos existentes:</h3>
              <ul className="space-y-2">
                {eventosFecha.map((evento: string, idx: number) => (
                  <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="flex-1">{evento}</span>
                    <button
                      onClick={() => eliminarEvento(idx)}
                      className="ml-2 text-red-500 hover:text-red-700 cursor-pointer text-sm font-semibold"
                      title="Eliminar evento"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 mb-4">No hay eventos para este día.</p>
          )}

          {/* Botón para mostrar formulario o formulario de agregar evento */}
          {!showAddEventForm ? (
            <button
              onClick={() => setShowAddEventForm(true)}
              className="w-full bg-[var(--color-secondary-500)] text-white py-2 px-4 rounded-lg hover:bg-[var(--color-secondary-600)] transition-colors cursor-pointer"
            >
              + Agregar evento
            </button>
          ) : (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Agregar nuevo evento:</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newEventText}
                  onChange={(e) => setNewEventText(e.target.value)}
                  placeholder="Describe el evento..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-300)] cursor-pointer"
                  onKeyDown={(e) => e.key === 'Enter' && agregarEvento()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={agregarEvento}
                    disabled={!newEventText.trim()}
                    className="flex-1 bg-[var(--color-primary-600)] text-white py-2 px-4 rounded-lg hover:bg-[var(--color-primary-700)] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => {
                      setShowAddEventForm(false);
                      setNewEventText('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
