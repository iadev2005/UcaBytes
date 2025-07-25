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
    <div className="bg-white rounded-3xl shadow-xl p-4 w-full max-w-xs h-[360px] overflow-hidden flex flex-col">
      <h2 className="text-lg font-bold text-center">Mira tus eventos</h2>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={prevMonth}
          className="px-2 font-bold text-lg text-[var(--color-primary-400)]"
          disabled={month === 0 && year === today.getFullYear()}
        >&lt;</button>
        <h3 className={`font-bold transition-all duration-200 ${monthNames[month].length > 7 ? "text-base" : "text-md"}`}>{monthNames[month]} {year}</h3>
        <button
          onClick={nextMonth}
          className="px-2 font-bold text-lg text-[var(--color-primary-400)]"
          disabled={month === 11 && year === today.getFullYear() + 1}
        >&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-[2px] text-center text-sm mb-1 w-full">
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
                  className={`w-full aspect-square rounded-full text-sm transition-all
                    ${day === selected ? "bg-[var(--color-secondary-300)] border-2 border-[var(--color-secondary-400)] font-bold" : ""}
                    ${day === today.getDate() && month === today.getMonth() && year === today.getFullYear() && day !== selected ? "bg-gray-200 font-bold" : ""}
                    hover:bg-[var(--color-secondary-100)]
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

  useEffect(() => {
    localStorage.setItem('accesos_rapidos', JSON.stringify(accesos));
  }, [accesos]);

  const accesosDisponibles: string[] = ["Ventas", "Inventario", "Facturación", "Marketing"];
  const eventosPorFecha: Record<string, string[]> = {
    "2025-07-24": ["Reunión con equipo de ventas", "Llamada con cliente importante"],
    "2025-07-25": ["Entrega de reporte mensual"],
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] p-8 items-center relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-secondary-100)] rounded-full opacity-60 blur-2xl z-0" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-[var(--color-secondary-100)] to-[var(--color-primary-100)] rounded-full opacity-50 blur-2xl z-0" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 w-[600px] h-32 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[var(--color-primary-50)] to-[var(--color-secondary-50)] opacity-40 blur-3xl z-0" />
      <h1 className="text-4xl font-bold mb-8">¡Bienvenido al Panel de Control!</h1>

      <div className="grid [grid-template-columns:2fr_min-content_0.8fr] gap-10 w-full max-w-6xl flex-1 justify-start z-10">
        <div className="flex flex-col gap-8 flex-1 justify-start h-[77vh]">
          <div className="bg-white rounded-3xl shadow-2xl p-6 border border-[var(--color-primary-100)] animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <DashboardIcon className="text-[var(--color-primary-400)] w-7 h-7" />
              <h2 className="text-2xl font-bold">Resumen de Ciclo o Progreso</h2>
            </div>
            <div className="flex items-center justify-center h-27 text-lg text-gray-400">
              No hay datos para mostrar.
            </div>
          </div>

          <div className="flex gap-8 w-full">
            <div className="flex flex-col items-center gap-2 w-1/2 bg-white rounded-3xl shadow-2xl p-6 border border-[var(--color-primary-100)] animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                <AutomationIcon className="text-[var(--color-secondary-400)] w-7 h-7" />
                <h2 className="text-2xl font-bold">Acceso Rápido</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full min-h-[250px] justify-items-center">
                {accesos.map((acceso, i) => (
                  <div
                    key={i}
                    className={`relative w-28 h-28 ${dragIndex === i ? 'z-20' : ''}`}
                    draggable={dragIndex === i}
                    onDragStart={dragIndex === i ? () => handleDragStart(i) : undefined}
                    onDragOver={dragIndex !== null && dragIndex !== i ? (e) => { e.preventDefault(); handleDragOver(i); } : undefined}
                    onDrop={dragIndex !== null && dragIndex !== i ? () => handleDrop(i) : undefined}
                    onDragEnd={dragIndex === i ? handleDragEnd : undefined}
                    style={{ cursor: dragIndex === i ? 'grab' : 'default' }}
                  >
                    <button className="w-full h-full rounded-2xl bg-[var(--color-secondary-500)] text-white font-bold text-sm flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                      onClick={() => handleAccesoClick(acceso)}
                    >
                      <span className="block text-center leading-tight break-words">{acceso}</span>
                    </button>
                    <button
                      className="absolute top-3 right-0 p-0 transition-colors"
                      onClick={() => setOpenKebab(openKebab === i ? null : i)}
                      tabIndex={0}
                    >
                      <KebabIcon width={20} height={20} color="#fff" />
                    </button>
                    {openKebab === i && (
                      <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-28 flex flex-col">
                        <button
                          className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-t-lg"
                          onClick={() => eliminarAcceso(i)}
                        >
                          Eliminar
                        </button>
                        <button
                          className="px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-b-lg"
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
                    className="w-28 h-28 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 text-3xl text-gray-400 hover:bg-gray-100 hover:scale-105 transition-transform flex items-center justify-center"
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

        <div className="flex flex-row h-[77vh] col-span-2 overflow-hidden justify-end">
          <div className="w-px bg-gray-300 h-full" />
          <div className="flex flex-col gap-8 overflow-y-auto pr-6 pb-3 items-end flex-1 h-full w-full pl-6">
            <div className="bg-[var(--color-secondary-300)] rounded-3xl shadow-2xl p-6 border border-[var(--color-secondary-100)] w-full animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <MegaphoneIcon className="text-[var(--color-secondary-600)] w-6 h-6" />
                <h2 className="text-2xl font-bold text-[var(--color-secondary-800)]">Tips Útiles</h2>
              </div>
              <p className="text-lg">Un tip útil debería estar aquí...</p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200 w-full animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-2">To-Do List:</h2>
              <hr className="border-t border-gray-300 mb-4" />
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-[var(--color-secondary-700)] mb-1">Prioridad Alta</h3>
                <ul className="text-base space-y-1 mb-3">
                  <li className="border-b border-dotted border-[var(--color-secondary-200)] pb-1 mb-1">Enviar facturas pendientes</li>
                  <li className="border-b border-dotted border-[var(--color-secondary-200)] pb-1 mb-1">Responder correos urgentes</li>
                  <li className="border-b border-dotted border-[var(--color-secondary-200)] pb-1 mb-1">Actualizar reporte de ventas</li>
                </ul>
                <hr className="border-t border-gray-200 my-2" />
              </div>
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-[var(--color-primary-700)] mb-1">Metas y Seguimiento</h3>
                <ul className="text-base space-y-1 mb-3">
                  <li className="border-b border-dotted border-[var(--color-primary-200)] pb-1 mb-1">Revisar metas del trimestre</li>
                  <li className="border-b border-dotted border-[var(--color-primary-200)] pb-1 mb-1">Preparar presentación para junta</li>
                  <li className="border-b border-dotted border-[var(--color-primary-200)] pb-1 mb-1">Contactar nuevos clientes potenciales</li>
                </ul>
                <hr className="border-t border-gray-200 my-2" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Operaciones</h3>
                <ul className="text-base space-y-1">
                  <li className="border-b border-dotted border-gray-300 pb-1 mb-1">Revisar inventario semanal</li>
                  <li className="border-b border-dotted border-gray-300 pb-1 mb-1">Capacitación del equipo</li>
                </ul>
              </div>
            </div>

            {Array.from({ length: 0 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200 w-full animate-fade-in-up">
                <h2 className="text-xl font-bold mb-2">Elemento extra {idx + 1}</h2>
                <p>Este es un elemento adicional para probar el scroll en la columna derecha.</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={eventModalOpen} onClose={() => setEventModalOpen(false)} title={selectedDate ? `Eventos para ${selectedDate.toLocaleDateString()}` : "Eventos"}>
        {eventosFecha.length > 0 ? (
          <ul className="list-disc pl-5">
            {eventosFecha.map((evento: string, idx: number) => (
              <li key={idx}>{evento}</li>
            ))}
          </ul>
        ) : (
          <p>No hay eventos para este día.</p>
        )}
      </Modal>
    </div>
  );
}
