import React, { useState } from "react";

function Calendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(today.getDate());

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
    <div className="bg-white/90 rounded-3xl shadow-xl shadow-gray-200/80 p-4 border border-gray-200 w-full max-w-xs">
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
  return (
    <div className="min-h-screen flex flex-col justify-start bg-[var(--color-background)] p-8">
      <h1 className="text-4xl font-bold mb-8 text-start">
        ¡Bienvenido al Panel de Control!
      </h1>
      <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Columna Izquierda - Estática */}
        <div className="flex flex-col gap-8">
          {/* Resumen de Ciclo */}
          <div className="bg-white/90 rounded-3xl shadow-xl shadow-gray-200/80 p-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">
              Resumen de Ciclo o Progreso
            </h2>
            <div className="space-y-2 text-lg">
              <div>
                Producto más vendido:{" "}
                <span className="font-semibold">"Paquete Premium X"</span>
              </div>
              <div>
                Tickets o servicios completados:{" "}
                <span className="font-semibold">33 / 50</span>{" "}
                <span className="text-sm">(Meta mensual)</span>
              </div>
              <div>
                Ingresos generados:{" "}
                <span className="font-semibold">$12,400 / $15,000</span>
              </div>
            </div>
          </div>
          {/* Botones de acceso rápido y Calendario en una fila */}
          <div className="flex flex-row gap-8 justify-center items-start">
            {/* Cuadros de acceso rápido */}
            <div className="grid grid-cols-2 gap-4 w-40">
              <div className="w-16 h-16 border-2 border-black rounded-lg"></div>
              <div className="w-16 h-16 border-2 border-black rounded-lg"></div>
              <div className="w-16 h-16 border-2 border-black rounded-lg"></div>
              <div className="w-16 h-16 border-2 border-black rounded-lg"></div>
            </div>
            {/* Calendario funcional */}
            <Calendar />
          </div>
        </div>
        {/* Columna Derecha - Scrollable */}
        <div className="flex flex-col gap-8 max-h-[600px] overflow-y-auto pr-2  items-end">
          {/* Tips Útiles */}
          <div className="bg-yellow-100/90 rounded-3xl shadow-xl shadow-gray-200/80 p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-yellow-700 mb-2">
              Tips Útiles
            </h2>
            <p className="text-lg">Un tip útil debería estar aquí...</p>
          </div>
          {/* To-Do List */}
          <div className="bg-white/90 rounded-3xl shadow-xl shadow-gray-200/80 p-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-2">To-Do List:</h2>
            <ul className="text-lg space-y-2">
              <li>Pegarle digo pagarle a Carlos</li>
              <li className="border-t border-black pt-2">
                Prostituir a Cristian
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}