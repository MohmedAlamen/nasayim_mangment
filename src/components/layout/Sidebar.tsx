import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Calendar, 
  UserCog, 
  FileText, 
  Wallet,
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { t, dir } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/customers', icon: Users, label: 'customers' },
    { path: '/services', icon: Wrench, label: 'services' },
    { path: '/appointments', icon: Calendar, label: 'appointments' },
    { path: '/employees', icon: UserCog, label: 'employees' },
    { path: '/invoices', icon: FileText, label: 'invoices' },
    { path: '/expenses', icon: Wallet, label: dir === 'rtl' ? 'المصروفات' : 'Expenses' },
    { path: '/reports', icon: BarChart3, label: 'reports' },
    { path: '/settings', icon: Settings, label: 'settings' },
  ];

  const CollapseIcon = dir === 'rtl' 
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  return (
    <aside 
      className={cn(
        "fixed top-0 h-screen bg-sidebar text-sidebar-foreground z-40 transition-all duration-300 flex flex-col",
        dir === 'rtl' ? 'right-0' : 'left-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="NASAYIM CLEAN" 
            className={cn(
              "object-contain transition-all duration-300",
              collapsed ? "w-10 h-10" : "w-12 h-12"
            )}
          />
          {!collapsed && (
            <span className="font-bold text-lg whitespace-nowrap">{t('appName')}</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" 
                  : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                !isActive && "group-hover:scale-110"
              )} />
              {!collapsed && (
                <span className="font-medium whitespace-nowrap">{t(item.label)}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors"
        >
          <CollapseIcon className="w-5 h-5" />
          {!collapsed && (
            <span className="text-sm">{dir === 'rtl' ? 'طي القائمة' : 'Collapse'}</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;