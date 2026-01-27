import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Calendar, Wrench, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useServices } from '@/hooks/useServices';
import { useInvoices } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';

const Reports: React.FC = () => {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: services } = useServices();
  const { data: invoices } = useInvoices();

  const handleExportCSV = () => {
    if (!invoices || invoices.length === 0) {
      toast({
        variant: "destructive",
        title: dir === 'rtl' ? "لا توجد بيانات" : "No data",
        description: dir === 'rtl' ? "لا توجد فواتير لتصديرها حالياً" : "No invoices to export at the moment"
      });
      return;
    }

    // Prepare CSV data
    const headers = [
      dir === 'rtl' ? 'رقم الفاتورة' : 'Invoice Number',
      dir === 'rtl' ? 'العميل' : 'Customer',
      dir === 'rtl' ? 'المبلغ' : 'Amount',
      dir === 'rtl' ? 'الحالة' : 'Status',
      dir === 'rtl' ? 'التاريخ' : 'Date'
    ];

    const rows = invoices.map(inv => [
      inv.invoice_number,
      inv.customers?.name || '-',
      inv.amount,
      inv.status,
      new Date(inv.created_at).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reports_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: dir === 'rtl' ? "تم التصدير" : "Exported",
      description: dir === 'rtl' ? "تم تحميل التقرير بنجاح" : "Report downloaded successfully"
    });
  };

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
            {dir === 'rtl' ? 'تحليل الأداء والإحصائيات وتصدير البيانات' : 'Performance analysis, statistics and data export'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <FileSpreadsheet className="w-4 h-4 me-2" />
            {dir === 'rtl' ? 'تصدير إكسل' : 'Export Excel'}
          </Button>
          <Button variant="default" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 me-2" />
            {dir === 'rtl' ? 'تحميل PDF' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
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
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {dir === 'rtl' ? 'الإيرادات والمصروفات' : 'Revenue & Expenses'}
          </h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d8a5f" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2d8a5f" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="revenue" name={dir === 'rtl' ? 'الإيرادات' : 'Revenue'} stroke="#2d8a5f" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" name={dir === 'rtl' ? 'المصروفات' : 'Expenses'} stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services Chart */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {dir === 'rtl' ? 'الخدمات الأكثر طلباً' : 'Most Requested Services'}
          </h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} orientation={dir === 'rtl' ? 'right' : 'left'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Bar dataKey="value" name={dir === 'rtl' ? 'العدد' : 'Count'} radius={dir === 'rtl' ? [4, 0, 0, 4] : [0, 4, 4, 0]}>
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Pie Chart */}
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">
            {dir === 'rtl' ? 'حالة الفواتير الإجمالية' : 'Overall Invoice Status'}
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="h-[250px] w-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl min-w-[180px]">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.value} {dir === 'rtl' ? 'فواتير' : 'Invoices'}</span>
                  </div>
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
