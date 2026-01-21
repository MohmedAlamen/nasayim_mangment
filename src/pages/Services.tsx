import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Bug, Rat, Skull, Wind, Sparkles, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Services: React.FC = () => {
  const { t, dir } = useLanguage();

  const services = [
    {
      id: 1,
      name: t('pestControl'),
      nameAr: 'مكافحة الحشرات',
      nameEn: 'Pest Control',
      description: dir === 'rtl' 
        ? 'مكافحة شاملة للحشرات المنزلية والطائرة' 
        : 'Comprehensive control of household and flying insects',
      icon: Bug,
      price: 350,
      duration: dir === 'rtl' ? '2-3 ساعات' : '2-3 hours',
      color: 'hsl(152 60% 32%)',
      bookings: 156,
    },
    {
      id: 2,
      name: t('rodentControl'),
      nameAr: 'مكافحة القوارض',
      nameEn: 'Rodent Control',
      description: dir === 'rtl' 
        ? 'التخلص من الفئران والجرذان بطرق آمنة' 
        : 'Safe elimination of mice and rats',
      icon: Rat,
      price: 450,
      duration: dir === 'rtl' ? '3-4 ساعات' : '3-4 hours',
      color: 'hsl(38 92% 50%)',
      bookings: 89,
    },
    {
      id: 3,
      name: t('termiteControl'),
      nameAr: 'مكافحة النمل الأبيض',
      nameEn: 'Termite Control',
      description: dir === 'rtl' 
        ? 'معالجة ووقاية من النمل الأبيض للمنازل والمباني' 
        : 'Treatment and prevention of termites in homes and buildings',
      icon: Skull,
      price: 800,
      duration: dir === 'rtl' ? '4-6 ساعات' : '4-6 hours',
      color: 'hsl(0 70% 50%)',
      bookings: 45,
    },
    {
      id: 4,
      name: t('fumigation'),
      nameAr: 'التبخير',
      nameEn: 'Fumigation',
      description: dir === 'rtl' 
        ? 'تبخير شامل للمستودعات والمنشآت الكبيرة' 
        : 'Complete fumigation for warehouses and large facilities',
      icon: Wind,
      price: 1200,
      duration: dir === 'rtl' ? '6-8 ساعات' : '6-8 hours',
      color: 'hsl(200 80% 50%)',
      bookings: 23,
    },
    {
      id: 5,
      name: t('disinfection'),
      nameAr: 'التعقيم',
      nameEn: 'Disinfection',
      description: dir === 'rtl' 
        ? 'تعقيم وتطهير المنازل والمكاتب ضد الفيروسات والبكتيريا' 
        : 'Disinfection of homes and offices against viruses and bacteria',
      icon: Sparkles,
      price: 250,
      duration: dir === 'rtl' ? '1-2 ساعات' : '1-2 hours',
      color: 'hsl(280 70% 50%)',
      bookings: 112,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('services')}</h1>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? 'إدارة خدمات الشركة والأسعار' : 'Manage company services and pricing'}
          </p>
        </div>
        <Button className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="w-4 h-4 me-2" />
          {dir === 'rtl' ? 'إضافة خدمة' : 'Add Service'}
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div 
            key={service.id}
            className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200 group"
          >
            {/* Service Header */}
            <div 
              className="p-6 text-white"
              style={{ backgroundColor: service.color }}
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-white/20 rounded-xl">
                  <service.icon className="w-8 h-8" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                    <DropdownMenuItem>{t('edit')}</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">{t('delete')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="mt-4 text-xl font-bold">{service.name}</h3>
              <p className="mt-1 text-white/80 text-sm">{service.description}</p>
            </div>

            {/* Service Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {dir === 'rtl' ? 'السعر' : 'Price'}
                </span>
                <span className="text-lg font-bold text-primary">
                  {t('currency')} {service.price}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {dir === 'rtl' ? 'المدة' : 'Duration'}
                </span>
                <span className="font-medium">{service.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {dir === 'rtl' ? 'الحجوزات' : 'Bookings'}
                </span>
                <span className="font-medium">{service.bookings}</span>
              </div>

              <Button variant="outline" className="w-full mt-2">
                {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
