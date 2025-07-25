import React, { useState } from "react";

function Calendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState<number | null>(today.getDate());

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Primer día del mes (0=Domingo, 1=Lunes...)
  const firstDay = new Date(year, month, 1).getDay();
  // Días en el mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Ajuste para que la semana empiece en lunes
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const daysArray = [];
  for (let i = 0; i < offset; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);
  // Rellenar hasta 42 celdas para mantener 6 filas siempre
  while (daysArray.length < 42) daysArray.push(null);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelected(null);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelected(null);
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-300/60 p-4 w-full max-w-xs min-h-[340px]">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={prevMonth}
          className="px-2 font-bold text-lg"
          disabled={month === 0 && year === today.getFullYear()}
        >
          &lt;
        </button>
        <h3
          className={`font-bold text-center transition-all duration-200 ${
            monthNames[month].length > 7 ? "text-base" : "text-md"
          }`}
        >
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="px-2 font-bold text-lg"
          disabled={month === 11 && year === today.getFullYear() + 1}
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-[2px] text-center text-sm mb-1 w-full">
        <div>L</div>
        <div>M</div>
        <div>X</div>
        <div>J</div>
        <div>V</div>
        <div>S</div>
        <div>D</div>
        {daysArray.map((day, i) => (
          <div key={i} className="w-full">
            {day ? (
              <button
                onClick={() => setSelected(day)}
                className={`
                  w-full aspect-square rounded-full
                  ${day === selected ? "bg-yellow-300 border-2 border-black font-bold" : ""}
                  ${day === today.getDate() && month === today.getMonth() && year === today.getFullYear() && day !== selected ? "bg-gray-200 font-bold" : ""}
                  hover:bg-yellow-100
                `}
              >
                {day}
              </button>
            ) : (
              <span className="w-full aspect-square inline-block"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [accesos, setAccesos] = useState<string[]>([]);
  const [nuevoAcceso, setNuevoAcceso] = useState("");

  const agregarAcceso = () => {
    if (nuevoAcceso.trim() && accesos.length < 4) {
      setAccesos([...accesos, nuevoAcceso.trim()]);
      setNuevoAcceso("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[var(--color-background)] p-8">
      
      <h1 className="text-4xl font-bold mb-8 text-start">
        ¡Bienvenido al Panel de Control!
      </h1>
      <div className="grid [grid-template-columns:2fr_min-content_0.8fr] gap-6 w-full max-w-5xl flex-1 items-stretch h-[80vh]">
        {/* Columna Izquierda */}
        <div className="flex flex-col gap-8 flex-1 relative z-10 h-full">
          {/* Resumen de Ciclo */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-300/60 p-6 border border-gray-200 w-full">
            <h2 className="text-2xl font-bold mb-4 text-left">
              Resumen de Ciclo o Progreso
            </h2>
            <div className="space-y-2 text-lg text-left">
              <div>
                Producto más vendido: <span className="font-semibold">"Paquete Premium X"</span>
              </div>
              <div>
                Tickets o servicios completados: <span className="font-semibold">33 / 50</span> <span className="text-sm">(Meta mensual)</span>
              </div>
              <div>
                Ingresos generados: <span className="font-semibold">$12,400 / $15,000</span>
              </div>
            </div>
          </div>
          {/* Accesos rápidos y calendario en fila */}
          <div className="flex flex-row gap-8 items-start w-full">
            {/* Cuadros de acceso rápido */}
            <div className="flex flex-col items-center gap-2 w-1/2">
              <div className="grid grid-cols-2 gap-4 w-full mb-2">
                {accesos.map((acceso, i) => (
                  <button
                    key={i}
                    className="w-full h-20 rounded-lg bg-gray-100 shadow-inner flex items-center justify-center text-center text-xs font-semibold border border-gray-200"
                  >
                    {acceso}
                  </button>
                ))}
                {accesos.length < 4 && (
                  <button
                    className="w-full h-20 rounded-lg bg-gray-50 shadow-inner flex items-center justify-center text-2xl font-bold border border-dashed border-gray-300 text-gray-400"
                    onClick={() => {
                      // Focus al input al dar click en "+"
                      document.getElementById("input-acceso")?.focus();
                    }}
                    tabIndex={-1}
                    aria-label="Agregar acceso"
                  >
                    +
                  </button>
                )}
              </div>
              {accesos.length < 4 && (
                <div className="flex gap-2 w-full">
                  <input
                    id="input-acceso"
                    type="text"
                    className="border rounded-lg px-2 py-1 text-sm w-full"
                    placeholder="Nuevo acceso"
                    value={nuevoAcceso}
                    maxLength={12}
                    onChange={(e) => setNuevoAcceso(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") agregarAcceso();
                    }}
                  />
                  <button
                    onClick={agregarAcceso}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                    disabled={!nuevoAcceso.trim()}
                  >
                    Agregar
                  </button>
                </div>
              )}
            </div>
            {/* Calendario funcional alineado a la derecha */}
            <div className="flex-1 flex justify-end">
              <Calendar />
            </div>
          </div>
        </div>
        {/* Línea divisoria y columna derecha con scroll */}
        <div className="flex flex-row h-[80vh] col-span-2 overflow-hidden">
          {/* Línea divisoria vertical */}
          <div className="w-px bg-gray-300 h-full" />
          {/* Columna Derecha - Scrollable */}
          <div className="flex flex-col gap-8 overflow-y-auto pr-0 items-end flex-1 justify-start h-full relative z-10 w-full pl-6">
            {/* Tips Útiles */}
            <div className="bg-yellow-100 rounded-3xl shadow-xl shadow-gray-300/60 p-6 border border-yellow-300 w-full">
              <h2 className="text-2xl font-bold text-yellow-700 mb-2 text-left">
                Tips Útiles
              </h2>
              <p className="text-lg text-left">Un tip útil debería estar aquí...</p>
            </div>
            {/* To-Do List */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-300/60 p-6 border border-gray-200 w-full">
              <h2 className="text-2xl font-bold mb-2 text-left">To-Do List:</h2>
              <ul className="text-lg space-y-2 text-left">
                <li>Pegarle digo pagarle a Carlos</li>
                <li className="border-t border-black pt-2">
                  Prostituir a Cristian
                </li>
              </ul>
            </div>
            {/* Elementos extra para probar el scroll */}
            {Array.from({length: 10}).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-xl shadow-gray-300/60 p-6 border border-gray-200 w-full">
                <h2 className="text-xl font-bold mb-2 text-left">Elemento extra {idx+1}</h2>
                <p className="text-left">Este es un elemento adicional para probar el scroll en la columna derecha.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}