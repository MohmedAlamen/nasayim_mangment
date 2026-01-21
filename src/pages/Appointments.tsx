import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Appointments: React.FC = () => {
  const { t, dir } = useLanguage();

  const appointments = [
    {
      id: 1,
      customer: dir === 'rtl' ? 'أحمد محمد' : 'Ahmed Mohammed',
      service: t('pestControl'),
      date: '2024-01-15',
      time: '10:00 AM',
      location: dir === 'rtl' ? 'الرياض، حي النخيل' : 'Riyadh, Al Nakhil',
      employee: dir === 'rtl' ? 'خالد العتيبي' : 'Khaled Al-Otaibi',
      status: 'pending',
    },
    {
      id: 2,
      customer: dir === 'rtl' ? 'سارة العلي' : 'Sara Al Ali',
      service: t('rodentControl'),
      date: '2024-01-15',
      time: '11:30 AM',
      location: dir === 'rtl' ? 'جدة، حي الروضة' : 'Jeddah, Al Rawdah',
      employee: dir === 'rtl' ? 'فيصل الدوسري' : 'Faisal Al-Dosari',
      status: 'inProgress',
    },
    {
      id: 3,
      customer: dir === 'rtl' ? 'محمد السعيد' : 'Mohammed Al Said',
      service: t('termiteControl'),
      date: '2024-01-15',
      time: '02:00 PM',
      location: dir === 'rtl' ? 'الدمام، حي الفيصلية' : 'Dammam, Al Faisaliah',
      employee: dir === 'rtl' ? 'سعد الشهري' : 'Saad Al-Shehri',
      status: 'completed',
    },
    {
      id: 4,
      customer: dir === 'rtl' ? 'فاطمة الحربي' : 'Fatima Al Harbi',
      service: t('disinfection'),
      date: '2024-01-16',
      time: '09:00 AM',
      location: dir === 'rtl' ? 'الرياض، حي العليا' : 'Riyadh, Al Olaya',
      employee: dir === 'rtl' ? 'عبدالله القحطاني' : 'Abdullah Al-Qahtani',
      status: 'pending',
    },
    {
      id: 5,
      customer: dir === 'rtl' ? 'نورة المالكي' : 'Noura Al-Malki',
      service: t('fumigation'),
      date: '2024-01-16',
      time: '01:00 PM',
      location: dir === 'rtl' ? 'جدة، حي السلامة' : 'Jeddah, Al Salamah',
      employee: dir === 'rtl' ? 'ماجد العمري' : 'Majid Al-Omari',
      status: 'cancelled',
    },
  ];

  const statusStyles = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    inProgress: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const statusLabels = {
    pending: t('pending'),
    inProgress: t('inProgress'),
    completed: t('completed'),
    cancelled: t('cancelled'),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('appointments')}</h1>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? 'إدارة وجدولة مواعيد الخدمات' : 'Manage and schedule service appointments'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 me-2" />
            {t('filter')}
          </Button>
          <Button className="gradient-primary text-primary-foreground shadow-glow">
            <Plus className="w-4 h-4 me-2" />
            {dir === 'rtl' ? 'موعد جديد' : 'New Appointment'}
          </Button>
        </div>
      </div>

      {/* Date Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[t('today'), t('thisWeek'), t('thisMonth')].map((tab, index) => (
          <Button
            key={tab}
            variant={index === 0 ? 'default' : 'outline'}
            className={cn(index === 0 && 'gradient-primary text-primary-foreground')}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div 
            key={appointment.id}
            className="bg-card p-5 rounded-2xl border border-border hover:shadow-lg transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{appointment.customer}</h3>
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full border",
                      statusStyles[appointment.status as keyof typeof statusStyles]
                    )}>
                      {statusLabels[appointment.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{appointment.service}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.date} - {appointment.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{appointment.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{appointment.employee}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">{t('edit')}</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
