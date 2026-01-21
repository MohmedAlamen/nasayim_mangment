import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Calendar, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Reports: React.FC = () => {
  const { t, dir } = useLanguage();

  const revenueData = [
    { month: dir === 'rtl' ? 'يناير' : 'Jan', revenue: 42000, expenses: 28000 },
    { month: dir === 'rtl' ? 'فبراير' : 'Feb', revenue: 38000, expenses: 25000 },
    { month: dir === 'rtl' ? 'مارس' : 'Mar', revenue: 55000, expenses: 32000 },
    { month: dir === 'rtl' ? 'أبريل' : 'Apr', revenue: 48000, expenses: 30000 },
    { month: dir === 'rtl' ? 'مايو' : 'May', revenue: 62000, expenses: 35000 },
    { month: dir === 'rtl' ? 'يونيو' : 'Jun', revenue: 58000, expenses: 33000 },
  ];

  const serviceData = [
    { name: t('pestControl'), count: 156 },
    { name: t('rodentControl'), count: 89 },
    { name: t('termiteControl'), count: 45 },
    { name: t('fumigation'), count: 23 },
    { name: t('disinfection'), count: 112 },
  ];

  const stats = [
    {
      title: dir === 'rtl' ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: `${t('currency')} 303,000`,
      change: '+15%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: dir === 'rtl' ? 'عملاء جدد' : 'New Customers',
      value: '234',
      change: '+8%',
      isPositive: true,
      icon: Users,
    },
    {
      title: dir === 'rtl' ? 'الخدمات المكتملة' : 'Completed Services',
      value: '425',
      change: '+12%',
      isPositive: true,
      icon: Wrench,
    },
    {
      title: dir === 'rtl' ? 'متوسط التقييم' : 'Average Rating',
      value: '4.8',
      change: '-0.1',
      isPositive: false,
      icon: Calendar,
    },
  ];

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
        <div className="flex gap-2">
          <Button variant="outline">
            {t('thisMonth')}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 me-2" />
            {dir === 'rtl' ? 'تصدير التقرير' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
        <div className="bg-card p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-semibold mb-4">
            {dir === 'rtl' ? 'الإيرادات والمصروفات' : 'Revenue & Expenses'}
          </h3>
          <div className="h-[300px]">
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
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  reversed={dir === 'rtl'}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  orientation={dir === 'rtl' ? 'right' : 'left'}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name={dir === 'rtl' ? 'الإيرادات' : 'Revenue'}
                  stroke="hsl(152 60% 32%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name={dir === 'rtl' ? 'المصروفات' : 'Expenses'}
                  stroke="hsl(0 70% 50%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-semibold mb-4">
            {dir === 'rtl' ? 'الخدمات المقدمة' : 'Services Provided'}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Bar 
                  dataKey="count" 
                  name={dir === 'rtl' ? 'العدد' : 'Count'}
                  fill="hsl(152 60% 32%)" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
