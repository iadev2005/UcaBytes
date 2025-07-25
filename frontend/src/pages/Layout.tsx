import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import TopInfo from '../components/TopInfo';
import { useState, createContext, useEffect } from 'react';
import { motion } from 'framer-motion';

export const SidebarCollapseContext = createContext<{ isSidebarCollapsed: boolean }>({ isSidebarCollapsed: false });

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <SidebarCollapseContext.Provider value={{ isSidebarCollapsed }}>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        {/* Mobile: normal flex layout, Desktop: animated fixed positioning */}
        <motion.div 
          className="min-h-screen flex flex-col h-full bg-white w-full md:h-screen md:fixed md:top-0 md:right-0"
          animate={{
            width: isDesktop ? (isSidebarCollapsed ? 'calc(100% - 4rem)' : 'calc(100% - 20rem)') : '100%',
            marginLeft: isDesktop ? (isSidebarCollapsed ? '4rem' : '20rem') : '0'
          }}
          initial={{
            width: isDesktop ? 'calc(100% - 20rem)' : '100%',
            marginLeft: isDesktop ? '20rem' : '0'
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.3
          }}
        >
          <TopInfo />
          <main className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            <Outlet />
          </main>
        </motion.div>
      </div>
    </SidebarCollapseContext.Provider>
  )
} 