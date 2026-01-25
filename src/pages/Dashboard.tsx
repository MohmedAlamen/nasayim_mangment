import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ServicesChart from '@/components/dashboard/ServicesChart';
import { Users, Wrench, Calendar, DollarSign, ArrowRight, ArrowLeft, Clock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats, useTodayAppointments } from '@/hooks/useDashboardStats';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import AppointmentDialog from '@/components/appointments/AppointmentDialog';
import CustomerDialog from '@/components/customers/CustomerDialog';
import InvoiceDialog from '@/components/invoices/InvoiceDialog';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Dialog states
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  // Enable realtime notifications
  useRealtimeNotifications();

  // Fetch real data
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: todayAppointments, isLoading: appointmentsLoading } = useTodayAppointments();

  // Handle URL params for opening dialogs
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new-appointment') setAppointmentDialogOpen(true);
    if (action === 'new-customer') setCustomerDialogOpen(true);
    if (action === 'new-invoice') setInvoiceDialogOpen(true);
  }, [searchParams]);

  const statCards = [
    { 
      title: t('totalCustomers'), 
      value: statsLoading ? '...' : stats?.totalCustomers.toLocaleString() || '0', 
      icon: Users, 
      variant: 'default' as const
    },
    { 
      title: t('activeServices'), 
      value: statsLoading ? '...' : stats?.activeServices.toString() || '0', 
      icon: Wrench, 
      variant: 'primary' as const
    },
    { 
      title: t('pendingAppointments'), 
      value: statsLoading ? '...' : stats?.pendingAppointments.toString() || '0', 
      icon: Calendar, 
      variant: 'accent' as const
    },
    { 
      title: t('monthlyRevenue'), 
      value: statsLoading ? '...' : `${t('currency')} ${stats?.monthlyRevenue.toLocaleString() || '0'}`, 
      icon: DollarSign, 
      variant: 'default' as const
    },
  ];

  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-primary/10 text-primary',
    in_progress: 'bg-accent/10 text-accent',
    completed: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  const statusLabels: Record<string, string> = {
    pending: dir === 'rtl' ? 'قيد الانتظار' : 'Pending',
    confirmed: dir === 'rtl' ? 'مؤكد' : 'Confirmed',
    in_progress: dir === 'rtl' ? 'جاري' : 'In Progress',
    completed: dir === 'rtl' ? 'مكتمل' : 'Completed',
    cancelled: dir === 'rtl' ? 'ملغي' : 'Cancelled',
  };

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Quick Actions */}
      <section>
        <QuickActions 
          onAddAppointment={() => setAppointmentDialogOpen(true)}
          onAddCustomer={() => setCustomerDialogOpen(true)}
          onCreateInvoice={() => setInvoiceDialogOpen(true)}
        />
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} variant={stat.variant} />
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold">{dir === 'rtl' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              {t('viewAll')}<ArrowIcon className="w-4 h-4 ms-2" />
            </Button>
          </div>
          <RevenueChart />
        </div>
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold">{dir === 'rtl' ? 'توزيع الخدمات' : 'Services Distribution'}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/services')}>
              {t('viewAll')}<ArrowIcon className="w-4 h-4 ms-2" />
            </Button>
          </div>
          <ServicesChart />
        </div>
      </section>

      {/* Today's Appointments */}
      <section className="bg-card p-6 rounded-2xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {dir === 'rtl' ? 'مواعيد اليوم' : "Today's Appointments"} 
            {stats?.todayAppointments ? ` (${stats.todayAppointments})` : ''}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
            {t('viewAll')}<ArrowIcon className="w-4 h-4 ms-2" />
          </Button>
        </div>

        {appointmentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : todayAppointments && todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appointment: any) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-xl font-bold text-primary">{appointment.scheduled_time?.substring(0, 5)}</div>
                    </div>
                    <div className="flex-1 border-s ps-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{appointment.customers?.name || '-'}</h4>
                        <Badge variant="outline" className={statusStyles[appointment.status || 'pending']}>
                          {statusLabels[appointment.status || 'pending']}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {appointment.services && (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: appointment.services.color || '#2d8a5f' }} />
                            {dir === 'rtl' ? appointment.services.name_ar : appointment.services.name_en}
                          </span>
                        )}
                        {appointment.employees && (
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{appointment.employees.name}</span>
                        )}
                        {appointment.customers?.address && (
                          <span>{appointment.customers.address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{dir === 'rtl' ? 'لا توجد مواعيد اليوم' : 'No appointments today'}</p>
            <Button className="mt-4" onClick={() => setAppointmentDialogOpen(true)}>
              {dir === 'rtl' ? 'إضافة موعد' : 'Add Appointment'}
            </Button>
          </div>
        )}
      </section>

      {/* Dialogs */}
      <AppointmentDialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen} appointment={null} />
      <CustomerDialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen} customer={null} />
      <InvoiceDialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen} invoice={null} />
    </div>
  );
};

export default Dashboard;
