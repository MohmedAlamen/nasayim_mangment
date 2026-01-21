import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Plus, Filter, MoreHorizontal, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Customers: React.FC = () => {
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    {
      id: 1,
      name: dir === 'rtl' ? 'أحمد محمد الشمري' : 'Ahmed Mohammed Al-Shamri',
      email: 'ahmed@example.com',
      phone: '+966 50 123 4567',
      location: dir === 'rtl' ? 'الرياض، حي النخيل' : 'Riyadh, Al Nakhil',
      totalServices: 8,
      lastService: dir === 'rtl' ? 'منذ 3 أيام' : '3 days ago',
      status: 'active',
    },
    {
      id: 2,
      name: dir === 'rtl' ? 'سارة العلي' : 'Sara Al Ali',
      email: 'sara@example.com',
      phone: '+966 55 987 6543',
      location: dir === 'rtl' ? 'جدة، حي الروضة' : 'Jeddah, Al Rawdah',
      totalServices: 5,
      lastService: dir === 'rtl' ? 'منذ أسبوع' : '1 week ago',
      status: 'active',
    },
    {
      id: 3,
      name: dir === 'rtl' ? 'محمد السعيد' : 'Mohammed Al Said',
      email: 'mohammed@example.com',
      phone: '+966 54 456 7890',
      location: dir === 'rtl' ? 'الدمام، حي الفيصلية' : 'Dammam, Al Faisaliah',
      totalServices: 12,
      lastService: dir === 'rtl' ? 'اليوم' : 'Today',
      status: 'vip',
    },
    {
      id: 4,
      name: dir === 'rtl' ? 'فاطمة الحربي' : 'Fatima Al Harbi',
      email: 'fatima@example.com',
      phone: '+966 56 111 2222',
      location: dir === 'rtl' ? 'الرياض، حي العليا' : 'Riyadh, Al Olaya',
      totalServices: 3,
      lastService: dir === 'rtl' ? 'منذ شهر' : '1 month ago',
      status: 'inactive',
    },
  ];

  const statusStyles = {
    active: 'bg-success/10 text-success border-success/20',
    vip: 'bg-accent/10 text-accent border-accent/20',
    inactive: 'bg-muted text-muted-foreground border-border',
  };

  const statusLabels = {
    active: dir === 'rtl' ? 'نشط' : 'Active',
    vip: dir === 'rtl' ? 'عميل مميز' : 'VIP',
    inactive: dir === 'rtl' ? 'غير نشط' : 'Inactive',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('customers')}</h1>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? 'إدارة وعرض جميع العملاء' : 'Manage and view all customers'}
          </p>
        </div>
        <Button className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="w-4 h-4 me-2" />
          {t('addNew')}
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 me-2" />
          {t('filter')}
        </Button>
        <Button variant="outline">
          {t('export')}
        </Button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <div 
            key={customer.id}
            className="bg-card p-5 rounded-2xl border border-border hover:shadow-lg transition-all duration-200 animate-fade-in"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{customer.name}</h3>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full border",
                    statusStyles[customer.status as keyof typeof statusStyles]
                  )}>
                    {statusLabels[customer.status as keyof typeof statusLabels]}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                  <DropdownMenuItem>{t('edit')}</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">{t('delete')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span dir="ltr">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{customer.location}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">
                  {dir === 'rtl' ? 'عدد الخدمات:' : 'Services:'}
                </span>
                <span className="font-semibold ms-1">{customer.totalServices}</span>
              </div>
              <div className="text-muted-foreground">
                {customer.lastService}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
