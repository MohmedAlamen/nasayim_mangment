import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Calendar, Wrench, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useServices } from '@/hooks/useServices';
import { useInvoices } from '@/hooks/useInvoices';

const Reports: React.FC = () => {
  const { t, dir } = useLanguage();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: services } = useServices();
  const { data: invoices } = useInvoices();

  const revenueData = [
    { month: dir === 'rtl' ? 'يناير' : 'Jan', revenue: 42000, expenses: 28000 },
    { month: dir === 'rtl' ? 'فبراير' : 'Feb', revenue: 38000, expenses: 25000 },
    { month: dir === 'rtl' ? 'مارس' : 'Mar', revenue: 55000, expenses: 32000 },
    { month: dir === 'rtl' ? 'أبريل' : 'Apr', revenue: 48000, expenses: 30000 },
    { month: dir === 'rtl' ? 'مايو' : 'May', revenue: 62000, expenses: 35000 },
    { month: dir === 'rtl' ? 'يونيو' : 'Jun', revenue: stats?.monthlyRevenue || 58000, expenses: 33000 },
  ];

  const serviceData = services?.slice(0, 5).map(s => ({
    name: dir === 'rtl' ? s.name_ar : s.name_en,
    value: Math.floor(Math.random() * 100) + 20,
    color: s.color || '#2d8a5f'
  })) || [];

  const statusData = [
    { name: dir === 'rtl' ? 'مدفوعة' : 'Paid', value: invoices?.filter(i => i.status === 'paid').length || 0, color: '#22c55e' },
    { name: dir === 'rtl' ? 'معلقة' : 'Pending', value: invoices?.filter(i => i.status === 'pending').length || 0, color: '#f59e0b' },
    { name: dir === 'rtl' ? 'متأخرة' : 'Overdue', value: invoices?.filter(i => i.status === 'overdue').length || 0, color: '#ef4444' },
  ];

  const statsCards = [
    {
      title: dir === 'rtl' ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: `${stats?.monthlyRevenue?.toLocaleString() || 0} ${t('currency')}`,
      change: '+15%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: dir === 'rtl' ? 'عدد العملاء' : 'Total Customers',
      value: stats?.totalCustomers?.toString() || '0',
      change: '+8%',
      isPositive: true,
      icon: Users,
    },
    {
      title: dir === 'rtl' ? 'الخدمات النشطة' : 'Active Services',
      value: stats?.activeServices?.toString() || '0',
      change: '+12%',
      isPositive: true,
      icon: Wrench,
    },
    {
      title: dir === 'rtl' ? 'مواعيد اليوم' : "Today's Appointments",
      value: stats?.todayAppointments?.toString() || '0',
      change: '+5%',
      isPositive: true,
      icon: Calendar,
    },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('reports')}</h1>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? 'تحليل الأداء والإحصائيات' : 'Performance analysis and statistics'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">{t('thisMonth')}</Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 me-2" />
            {dir === 'rtl' ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-card p-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.isPositive ? 'text-success' : 'text-destructive'}`}>
                {stat.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-semibold mb-4">
            {dir === 'rtl' ? 'الإيرادات والمصروفات' : 'Revenue & Expenses'}
          </h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152 60% 32%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(152 60% 32%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 70% 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(0 70% 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} reversed={dir === 'rtl'} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} orientation={dir === 'rtl' ? 'right' : 'left'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Area type="monotone" dataKey="revenue" name={dir === 'rtl' ? 'الإيرادات' : 'Revenue'} stroke="hsl(152 60% 32%)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" name={dir === 'rtl' ? 'المصروفات' : 'Expenses'} stroke="hsl(0 70% 50%)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services Chart */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-semibold mb-4">
            {dir === 'rtl' ? 'الخدمات الأكثر طلباً' : 'Most Requested Services'}
          </h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Bar dataKey="value" name={dir === 'rtl' ? 'العدد' : 'Count'} radius={[0, 4, 4, 0]}>
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Pie Chart */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">
            {dir === 'rtl' ? 'حالة الفواتير' : 'Invoice Status'}
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;