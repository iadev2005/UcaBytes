import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar fijo */}
      <aside className="w-64 h-screen fixed top-0 left-0 bg-[var(--color-primary-50)] p-6 flex flex-col gap-4 shadow-lg z-10">
        <h2 className="text-2xl font-bold mb-8 text-[var(--color-primary-700)]">UcaBytes</h2>
        <nav className="flex flex-col gap-4">
          <Link to="/" className="font-semibold text-[var(--color-primary-600)] hover:underline">Home</Link>
          <Link to="/design-system" className="font-semibold text-[var(--color-primary-600)] hover:underline">Design System</Link>
        </nav>
      </aside>
      {/* Main content con scroll */}
      <main className="flex-1 ml-64 h-screen overflow-y-auto p-10">
        <Outlet />
      </main>
    </div>
  )
} 