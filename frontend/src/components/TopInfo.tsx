import { useEffect, useState } from 'react';

export default function TopInfo() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formato de hora y fecha
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const fullDate = `${day}-${month}-${year}`;

  // Datos de empresa (mock)
  const company = 'Nombre Empresa';
  const avatar = 'https://ui-avatars.com/api/?name=Empresa&background=8B5CF6&color=fff&size=128';

  return (
    <div className="w-full flex items-center justify-between px-10 bg-white border-b border-[var(--color-primary-100)] h-[20%] min-h-[50px] sticky top-0 z-20">
      {/* Botón de notificación */}
      <button className="w-10 h-10 bg-[var(--color-primary-100)] rounded-lg flex items-center justify-center shadow hover:bg-[var(--color-primary-200)] transition-colors">
        <div className="w-5 h-5 bg-[var(--color-primary-400)] rounded-sm" />
      </button>
      {/* Hora y fecha */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-lg text-[var(--color-primary-700)]">{time}</span>
        <span className="text-base text-[var(--color-primary-400)]">{fullDate}</span>
      </div>
      {/* Empresa y avatar */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-[var(--color-primary-700)] leading-tight">{company}</span>
        <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-primary-200)]" />
      </div>
    </div>
  );
} 