import { useEffect, useState } from 'react';
import { NotificationIcon } from '../icons/Notification';
import { Link } from 'react-router-dom';

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
    <div className="w-full flex items-center justify-between px-6 bg-white border-b border-[var(--color-primary-100)] h-[70px] min-h-[50px] sticky top-0 z-20">
      {/* Izquierda: Notificación, hora y fecha */}
      <div className="flex items-center gap-6">
        <button className="w-12 h-12 bg-[var(--color-primary-100)] rounded-lg flex items-center justify-center shadow hover:bg-[var(--color-primary-200)] transition-colors">
          <NotificationIcon className="w-7 h-7 text-[var(--color-primary-600)]" />
        </button>
        <span className="font-mono text-xl text-[var(--color-primary-700)]">{time}</span>
        <span className="text-lg text-[var(--color-primary-400)]">{fullDate}</span>
      </div>
      {/* Derecha: Empresa y avatar */}
      <Link to="/profile" className="flex items-center gap-4 cursor-pointer group px-3 py-1 rounded-lg hover:bg-[var(--color-primary-50)] transition-colors" style={{ textDecoration: 'none' }}>
        <span className="font-semibold text-xl text-[var(--color-primary-700)] leading-tight whitespace-nowrap">
          {company}
        </span>
        <img src={avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-primary-200)] group-hover:border-[var(--color-primary-400)] transition-colors" />
      </Link>
    </div>
  );
} 