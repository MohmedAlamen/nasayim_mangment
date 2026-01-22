import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, Globe, Bell, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary/20 text-primary text-xs">{dir === 'rtl' ? 'مدير' : 'Admin'}</Badge>;
      case 'manager':
        return <Badge className="bg-accent/20 text-accent-foreground text-xs">{dir === 'rtl' ? 'مشرف' : 'Manager'}</Badge>;
      case 'technician':
        return <Badge className="bg-secondary text-secondary-foreground text-xs">{dir === 'rtl' ? 'فني' : 'Technician'}</Badge>;
      default:
        return null;
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-30 transition-all duration-300",
        dir === 'rtl' 
          ? (sidebarCollapsed ? 'left-0 right-20' : 'left-0 right-64')
          : (sidebarCollapsed ? 'left-20 right-0' : 'left-64 right-0')
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Welcome Message */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t('welcomeBack')}{profile ? `, ${profile.full_name}` : ''} 👋
          </h2>
          <p className="text-sm text-muted-foreground">{t('todayOverview')}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
              <DropdownMenuItem 
                onClick={() => setLanguage('ar')}
                className={cn(language === 'ar' && 'bg-muted')}
              >
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={cn(language === 'en' && 'bg-muted')}
              >
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="hover:bg-muted"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="hover:bg-muted relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 end-2 w-2 h-2 bg-accent rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'} className="w-56">
              <div className="px-2 py-2 border-b border-border">
                <p className="font-medium text-sm">{profile?.full_name || 'User'}</p>
                <div className="mt-1">{getRoleBadge()}</div>
              </div>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 me-2" />
                {t('settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 me-2" />
                {dir === 'rtl' ? 'تسجيل الخروج' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
