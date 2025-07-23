import { Link, Outlet, useLocation } from 'react-router-dom'
import { HomeIcon, NotificationIcon, MegaphoneIcon, ServicesIcon, OperationsIcon, AutomationIcon, ConfigurationIcon } from '../icons';

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 h-screen fixed top-0 left-0 bg-[var(--color-primary-100)] p-0 flex flex-col gap-0 shadow-lg z-10">
        <div className="flex-1 flex flex-col pt-12">
          <nav className="flex flex-col gap-2">
            <SidebarLink to="/" icon={HomeIcon} label="Home" active={location.pathname === '/'} />
            <SidebarLink to="/dashboard" icon={NotificationIcon} label="Dashboard" active={location.pathname === '/dashboard'} />
            <SidebarLink to="/marketing" icon={MegaphoneIcon} label="Marketing" active={location.pathname === '/marketing'} />
            <SidebarLink to="/products-services" icon={ServicesIcon} label="Productos y Servicios" active={location.pathname === '/products-services'} />
            <SidebarLink to="/central-operations" icon={OperationsIcon} label="Operaciones Centrales" active={location.pathname === '/central-operations'} />
            <SidebarLink to="/automations" icon={AutomationIcon} label="Automatizaciones" active={location.pathname === '/automations'} />
          </nav>
          <div className="flex-1" />
          <nav className="flex flex-col gap-2 mb-8">
            <SidebarLink to="/settings" icon={ConfigurationIcon} label="Configuración" active={location.pathname === '/settings'} />
          </nav>
        </div>
      </aside>
      <main className="flex-1 ml-64 h-screen overflow-y-auto bg-white">
        <Outlet />
      </main>
    </div>
  )
}

function SidebarLink({ to, icon: Icon, label, active }: { to: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, label: string, active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl font-normal text-[var(--color-primary-600)] transition-all ${active ? 'bg-white shadow-lg font-semibold' : 'hover:bg-[var(--color-primary-50)]'}`}
      style={{ fontFamily: 'var(--font-syne)' }}
    >
      <Icon className="w-6 h-6" />
      <span className="text-base text-left">{label}</span>
    </Link>
  );
} 