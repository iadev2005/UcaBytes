import {  Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import TopInfo from '../components/TopInfo';

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="min-h-screen flex w-[80%] ml-auto flex-col h-full bg-white">
        <TopInfo />
        <main className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
} 