import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import TopInfo from '../components/TopInfo';
import { useState, createContext } from 'react';
import { cn } from '../lib/utils';

export const SidebarCollapseContext = createContext<{ isSidebarCollapsed: boolean }>({ isSidebarCollapsed: false });

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <SidebarCollapseContext.Provider value={{ isSidebarCollapsed }}>
      <div className="min-h-screen flex">
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div className={cn(
          "min-h-screen flex flex-col h-full bg-white transition-all duration-300",
          isSidebarCollapsed ? "w-[calc(100%-4rem)] ml-[4rem]" : "w-[80%] ml-auto"
        )}>
          <TopInfo />
          <main className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarCollapseContext.Provider>
  )
} 