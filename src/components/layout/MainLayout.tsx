import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      
      <main 
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          dir === 'rtl' 
            ? (sidebarCollapsed ? 'mr-20' : 'mr-64')
            : (sidebarCollapsed ? 'ml-20' : 'ml-64')
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
