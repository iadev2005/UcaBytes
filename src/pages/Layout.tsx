import { Link, Outlet, useLocation } from 'react-router-dom'

const sidebarOptions = [
  { path: '/', label: 'Inicio' },
  { path: '/design-system', label: 'Design System' },
]

function Sidebar() {
  const location = useLocation()
  return (
    <aside className="w-64 min-h-screen bg-gray-100 border-r p-6">
      <nav className="flex flex-col gap-4">
        {sidebarOptions.map(option => (
          <Link
            key={option.path}
            to={option.path}
            className={`px-4 py-2 rounded font-medium transition-colors ${location.pathname === option.path ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            {option.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-white">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout 