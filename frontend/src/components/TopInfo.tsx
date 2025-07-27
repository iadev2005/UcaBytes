import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCompany } from '../context/CompanyContext';

export default function TopInfo() {
  const [date, setDate] = useState(new Date());
  const { companyData } = useCompany();

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

  const getAvatarSrc = () => {
    if (companyData && companyData.avatar) {
      return companyData.avatar;
    }
    // Imagen por defecto si no hay avatar
    return 'https://ui-avatars.com/api/?name=Empresa&background=8B5CF6&color=fff&size=128&bold=true';
  };

  return (
    <motion.div
      className="w-full flex items-center justify-between px-10 bg-white border-b border-[var(--color-primary-100)] h-[70px] min-h-[50px] sticky top-0 z-20"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Izquierda: Notificación, hora y fecha */}
      <div className="flex items-center gap-6">
        <span className="font-mono text-xl text-[var(--color-primary-700)]">{time}</span>
        <span className="text-lg text-[var(--color-primary-400)]">{fullDate}</span>
      </div>
      
      {/* Derecha: Empresa y avatar */}
      <Link to="/app/perfil" className="flex items-center gap-4 cursor-pointer group px-3 py-1 rounded-lg hover:bg-[var(--color-primary-50)] transition-colors" style={{ textDecoration: 'none' }}>
        <span className="font-semibold text-xl text-[var(--color-primary-700)] leading-tight whitespace-nowrap">
          {companyData?.nombrecomercial || 'Nombre Empresa'}
        </span>
        <img 
          src={getAvatarSrc()} 
          alt="avatar" 
          className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-primary-200)] group-hover:border-[var(--color-primary-400)] transition-colors"
        />
      </Link>
    </motion.div>
  );
} 