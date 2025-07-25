import { HomeIcon, DashboardIcon, MegaphoneIcon, ServicesIcon, OperationsIcon, ConfigurationIcon } from '../icons';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { cn } from '../lib/utils';

interface SidebarProps {
  onCollapse: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ onCollapse }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0, ease: 'easeOut' }}
      className={cn(
        "h-screen fixed top-0 left-0 bg-[var(--color-primary-100)] p-0 flex flex-col gap-0 shadow-lg z-10 transition-all duration-300",
        isCollapsed ? "w-[4rem]" : "w-[20%]"
      )}
    >
      <div className="flex-1 flex flex-col pt-12">
        <nav className="flex flex-col gap-2">
          <SidebarLink 
            to="/app" 
            icon={HomeIcon} 
            label="Inicio" 
            active={location.pathname === '/app'} 
            isCollapsed={isCollapsed}
          />
          <SidebarLink 
            to="/app/dashboard" 
            icon={DashboardIcon} 
            label="Dashboard" 
            active={location.pathname === '/app/dashboard'} 
            isCollapsed={isCollapsed}
          />
          <SidebarLink 
            to="/app/marketing" 
            icon={MegaphoneIcon} 
            label="Marketing" 
            active={location.pathname === '/app/marketing'} 
            isCollapsed={isCollapsed}
          />
          <SidebarLink 
            to="/app/products-services" 
            icon={ServicesIcon} 
            label="Productos y Servicios" 
            active={location.pathname === '/app/products-services'} 
            isCollapsed={isCollapsed}
          />
          <SidebarLink 
            to="/app/central-operations" 
            icon={OperationsIcon} 
            label="Operaciones Centrales" 
            active={location.pathname === '/app/central-operations'} 
            isCollapsed={isCollapsed}
          />
        </nav>
        <div className="flex-1" />
        <nav className="flex flex-col gap-2 mb-8">
          <SidebarLink 
            to="/app/settings" 
            icon={ConfigurationIcon} 
            label="Configuración" 
            active={location.pathname === '/app/settings'} 
            isCollapsed={isCollapsed}
          />
        </nav>
      </div>
      <div className="mb-8 px-6">
        <button
          onClick={handleLogout}
          className="w-full bg-[var(--color-secondary-400)] text-white rounded-xl py-3 font-semibold shadow hover:bg-[var(--color-secondary-500)] transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
      <button
        onClick={handleCollapse}
        className={cn(
          "absolute top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors",
          "border border-[var(--color-primary-100)]"
        )}
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </motion.aside>
  );
}

function SidebarLink({ 
  to, 
  icon: Icon, 
  label, 
  active, 
  isCollapsed 
}: { 
  to: string, 
  icon: React.FC<React.SVGProps<SVGSVGElement>>, 
  label: string, 
  active?: boolean,
  isCollapsed: boolean 
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 60, damping: 18 }}
    >
      <Link
        to={to}
        className={cn(
          'flex items-center gap-3 px-6 py-3 rounded-xl font-normal text-[var(--color-primary-600)] transition-all',
          active ? 'bg-white shadow-lg font-semibold' : 'hover:bg-[var(--color-primary-50)]',
          isCollapsed && 'px-3 justify-center'
        )}
        style={{ fontFamily: 'var(--font-syne)' }}
      >
        <Icon className="w-6 h-6" />
        {!isCollapsed && (
          <span className="text-base text-left">{label}</span>
        )}
      </Link>
    </motion.div>
  );
}