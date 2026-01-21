import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import StatCard from '@/components/dashboard/StatCard';
import AppointmentCard from '@/components/dashboard/AppointmentCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ServicesChart from '@/components/dashboard/ServicesChart';
import { Users, Wrench, Calendar, DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { t, dir } = useLanguage();

  const stats = [
    { 
      title: t('totalCustomers'), 
      value: '1,234', 
      icon: Users, 
      trend: { value: 12, isPositive: true },
      variant: 'default' as const
    },
    { 
      title: t('activeServices'), 
      value: '89', 
      icon: Wrench, 
      trend: { value: 8, isPositive: true },
      variant: 'primary' as const
    },
    { 
      title: t('pendingAppointments'), 
      value: '23', 
      icon: Calendar, 
      trend: { value: 5, isPositive: false },
      variant: 'accent' as const
    },
    { 
      title: t('monthlyRevenue'), 
      value: `${t('currency')} 45,678`, 
      icon: DollarSign, 
      trend: { value: 15, isPositive: true },
      variant: 'default' as const
    },
  ];

  const recentAppointments = [
    {
      customerName: dir === 'rtl' ? 'أحمد محمد' : 'Ahmed Mohammed',
      service: t('pestControl'),
      time: '10:00 AM',
      location: dir === 'rtl' ? 'الرياض، حي النخيل' : 'Riyadh, Al Nakhil',
      status: 'pending' as const,
    },
    {
      customerName: dir === 'rtl' ? 'سارة العلي' : 'Sara Al Ali',
      service: t('rodentControl'),
      time: '11:30 AM',
      location: dir === 'rtl' ? 'جدة، حي الروضة' : 'Jeddah, Al Rawdah',
      status: 'inProgress' as const,
    },
    {
      customerName: dir === 'rtl' ? 'محمد السعيد' : 'Mohammed Al Said',
      service: t('termiteControl'),
      time: '02:00 PM',
      location: dir === 'rtl' ? 'الدمام، حي الفيصلية' : 'Dammam, Al Faisaliah',
      status: 'completed' as const,
    },
    {
      customerName: dir === 'rtl' ? 'فاطمة الحربي' : 'Fatima Al Harbi',
      service: t('disinfection'),
      time: '04:30 PM',
      location: dir === 'rtl' ? 'الرياض، حي العليا' : 'Riyadh, Al Olaya',
      status: 'pending' as const,
    },
  ];

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Actions */}
      <section>
        <QuickActions />
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            variant={stat.variant}
          />
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {dir === 'rtl' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
            </h3>
            <Button variant="ghost" size="sm">
              {t('viewAll')}
              <ArrowIcon className="w-4 h-4 ms-2" />
            </Button>
          </div>
          <RevenueChart />
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {dir === 'rtl' ? 'توزيع الخدمات' : 'Services Distribution'}
            </h3>
            <Button variant="ghost" size="sm">
              {t('viewAll')}
              <ArrowIcon className="w-4 h-4 ms-2" />
            </Button>
          </div>
          <ServicesChart />
        </div>
      </section>

      {/* Recent Appointments */}
      <section className="bg-card p-6 rounded-2xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('recentAppointments')}</h3>
          <Button variant="ghost" size="sm">
            {t('viewAll')}
            <ArrowIcon className="w-4 h-4 ms-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentAppointments.map((appointment, index) => (
            <AppointmentCard key={index} {...appointment} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
