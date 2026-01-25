import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: Translations = {
  // App
  appName: { ar: 'نسائم كلين', en: 'NASAYIM CLEAN' },
  companyName: { ar: 'نسائم كلين', en: 'NASAYIM CLEAN' },
  companyDescription: { ar: 'شركة خاصة متخصصة في مكافحة الحشرات والقوارض', en: 'Pest & Rodent Control Company' },
  
  // Navigation
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  customers: { ar: 'العملاء', en: 'Customers' },
  services: { ar: 'الخدمات', en: 'Services' },
  appointments: { ar: 'المواعيد', en: 'Appointments' },
  employees: { ar: 'الموظفين', en: 'Employees' },
  invoices: { ar: 'الفواتير', en: 'Invoices' },
  reports: { ar: 'التقارير', en: 'Reports' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  
  // Dashboard
  welcomeBack: { ar: 'مرحباً بعودتك', en: 'Welcome Back' },
  todayOverview: { ar: 'نظرة عامة على اليوم', en: "Today's Overview" },
  totalCustomers: { ar: 'إجمالي العملاء', en: 'Total Customers' },
  activeServices: { ar: 'الخدمات النشطة', en: 'Active Services' },
  pendingAppointments: { ar: 'المواعيد المعلقة', en: 'Pending Appointments' },
  monthlyRevenue: { ar: 'إيرادات الشهر', en: 'Monthly Revenue' },
  recentAppointments: { ar: 'المواعيد الأخيرة', en: 'Recent Appointments' },
  upcomingTasks: { ar: 'المهام القادمة', en: 'Upcoming Tasks' },
  viewAll: { ar: 'عرض الكل', en: 'View All' },
  
  // Status
  completed: { ar: 'مكتمل', en: 'Completed' },
  pending: { ar: 'قيد الانتظار', en: 'Pending' },
  inProgress: { ar: 'قيد التنفيذ', en: 'In Progress' },
  cancelled: { ar: 'ملغي', en: 'Cancelled' },
  
  // Services
  pestControl: { ar: 'مكافحة الحشرات', en: 'Pest Control' },
  rodentControl: { ar: 'مكافحة القوارض', en: 'Rodent Control' },
  termiteControl: { ar: 'مكافحة النمل الأبيض', en: 'Termite Control' },
  fumigation: { ar: 'التبخير', en: 'Fumigation' },
  disinfection: { ar: 'التعقيم', en: 'Disinfection' },
  
  // Actions
  addNew: { ar: 'إضافة جديد', en: 'Add New' },
  edit: { ar: 'تعديل', en: 'Edit' },
  delete: { ar: 'حذف', en: 'Delete' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  search: { ar: 'بحث', en: 'Search' },
  filter: { ar: 'تصفية', en: 'Filter' },
  export: { ar: 'تصدير', en: 'Export' },
  
  // Time
  today: { ar: 'اليوم', en: 'Today' },
  thisWeek: { ar: 'هذا الأسبوع', en: 'This Week' },
  thisMonth: { ar: 'هذا الشهر', en: 'This Month' },
  
  // Theme
  darkMode: { ar: 'الوضع الداكن', en: 'Dark Mode' },
  lightMode: { ar: 'الوضع الفاتح', en: 'Light Mode' },
  
  // Currency
  currency: { ar: 'ر.س', en: 'SAR' },
  
  // Misc
  noData: { ar: 'لا توجد بيانات', en: 'No data available' },
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  error: { ar: 'حدث خطأ', en: 'An error occurred' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};