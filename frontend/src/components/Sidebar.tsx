import { useState, type Dispatch, type SetStateAction } from 'react';
import { HomeIcon, NotificationIcon, MegaphoneIcon, ServicesIcon, OperationsIcon, ConfigurationIcon, SidebarExpandIcon, SidebarCollapseIcon, LogOutIcon } from '../icons';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate} from 'react-router-dom';
import { cn } from '../lib/utils';
import logo from '../assets/logo/logo.svg';

interface SidebarProps {
  onCollapse: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ onCollapse }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/');
  };

  // Sidebar content as a component for reuse
  const sidebarContent = (
    <>
      <div className="flex flex-col items-center pt-8 pb-4">
        <img src={logo} alt="Logo" className={cn("transition-all", isCollapsed ? "w-10 h-10" : "w-32 h-32")} />
        {!isCollapsed && (
          <span
            style={{
              fontFamily: 'Syne, var(--font-syne)',
              fontWeight: 800,
              color: 'var(--color-primary-600)'
            }}
            className="mt-2 text-2xl tracking-wide"
          >
            PymeUp
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col pt-4">
        <nav className="flex flex-col gap-2">
          <SidebarLink to="/app" icon={HomeIcon} label="Home" active={location.pathname === '/app'} isCollapsed={isCollapsed} />
          <SidebarLink to="/app/dashboard" icon={NotificationIcon} label="Dashboard" active={location.pathname === '/app/dashboard'} isCollapsed={isCollapsed} />
          <SidebarLink to="./marketing" icon={MegaphoneIcon} label="Marketing" active={location.pathname === '/app/marketing'} isCollapsed={isCollapsed} />
          <SidebarLink to="./products-services" icon={ServicesIcon} label="Productos y Servicios" active={location.pathname === '/app/products-services'} isCollapsed={isCollapsed} />
          <SidebarLink to="./central-operations" icon={OperationsIcon} label="Operaciones Centrales" active={location.pathname === '/app/central-operations'} isCollapsed={isCollapsed} />
        </nav>
        <div className="flex-1" />
        <nav className="flex flex-col gap-2 mb-8">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          >
            <button
              onClick={handleLogout}
              className={cn(
                'flex items-center gap-3 px-6 py-3 rounded-xl font-normal text-[var(--color-primary-600)] transition-all',
                'hover:bg-[var(--color-primary-100)]',
                isCollapsed && 'px-3 justify-center',
                'w-full'
              )}
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              <LogOutIcon className="w-6 h-6" />
              {!isCollapsed && (
                <span className="text-base text-left">Cerrar sesión</span>
              )}
            </button>
          </motion.div>
          <SidebarLink to="/app/settings" icon={ConfigurationIcon} label="Configuración" active={location.pathname === '/app/settings'} isCollapsed={isCollapsed} />
        </nav>
      </div>
      <button
        onClick={handleCollapse}
        className={cn(
          "absolute top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors",
          "border border-[var(--color-primary-100)]",
          "hidden md:flex"
        )}
        aria-label={isCollapsed ? 'Desplegar sidebar' : 'Replegar sidebar'}
      >
        {isCollapsed ? <SidebarExpandIcon className="w-6 h-6 text-[var(--color-primary-600)]" /> : <SidebarCollapseIcon className="w-6 h-6 text-[var(--color-primary-600)]" />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-[60] md:hidden bg-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center border border-[var(--color-primary-100)]"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <SidebarExpandIcon className="w-6 h-6 text-[var(--color-primary-600)]" />
      </button>
      {/* Sidebar for desktop */}
      <motion.aside
        className={cn(
          "h-screen fixed top-0 left-0 bg-[var(--color-primary-100)] p-0 flex-col gap-0 shadow-lg z-50 transition-all duration-300 hidden md:flex",
          isCollapsed ? "w-[4rem]" : "w-[20rem]"
        )}
      >
        {sidebarContent}
      </motion.aside>
      {/* Sidebar overlay for mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex">
          <motion.aside
            className="h-full w-64 bg-[var(--color-primary-100)] shadow-lg flex flex-col relative"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 40, damping: 24 }}
          >
            <button
              className="absolute top-4 right-4 bg-white rounded-full shadow w-8 h-8 flex items-center justify-center border border-[var(--color-primary-100)]"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
            >
              <SidebarCollapseIcon className="w-6 h-6 text-[var(--color-primary-600)]" />
            </button>
            {sidebarContent}
          </motion.aside>
          <div className="flex-1 cursor-pointer" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
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
          active ? 'bg-white shadow-lg font-semibold' : 'hover:bg-[var(--color-primary-100)]',
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