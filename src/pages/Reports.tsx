import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Calendar, Wrench, Loader2, FileSpreadsheet, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useServices } from '@/hooks/useServices';
import { useInvoices } from '@/hooks/useInvoices';
import { useExpenses, useExpenseStats } from '@/hooks/useExpenses';
import { useToast } from '@/hooks/use-toast';

const Reports: React.FC = () => {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: services } = useServices();
  const { data: invoices } = useInvoices();
  const { data: expenses } = useExpenses();
  const { data: expenseStats } = useExpenseStats();

  // Calculate real revenue from invoices
  const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalExpenses = expenseStats?.totalMonthly || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Generate monthly data from real invoices and expenses
  const generateMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthRevenue = paidInvoices
        .filter(inv => {
          const invDate = new Date(inv.created_at);
          return invDate >= monthStart && invDate <= monthEnd;
        })
        .reduce((sum, inv) => sum + Number(inv.amount), 0);

      const monthExpenses = expenses
        ?.filter(exp => {
          const expDate = new Date(exp.expense_date);
          return expDate >= monthStart && expDate <= monthEnd;
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

      months.push({
        month: format(date, 'MMM', { locale: dir === 'rtl' ? ar : undefined }),
        fullMonth: format(date, 'MMMM yyyy', { locale: dir === 'rtl' ? ar : undefined }),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses,
      });
    }
    return months;
  };

  const monthlyData = generateMonthlyData();

  // Calculate expense breakdown by category
  const expenseByCategory = expenses?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const categoryColors: Record<string, string> = {
    materials: '#3b82f6',
    fuel: '#f59e0b',
    salaries: '#8b5cf6',
    rent: '#ec4899',
    utilities: '#06b6d4',
    maintenance: '#f97316',
    marketing: '#6366f1',
    equipment: '#14b8a6',
    general: '#64748b',
  };

  const categoryLabels: Record<string, { ar: string; en: string }> = {
    materials: { ar: 'مواد', en: 'Materials' },
    fuel: { ar: 'وقود', en: 'Fuel' },
    salaries: { ar: 'رواتب', en: 'Salaries' },
    rent: { ar: 'إيجار', en: 'Rent' },
    utilities: { ar: 'خدمات', en: 'Utilities' },
    maintenance: { ar: 'صيانة', en: 'Maintenance' },
    marketing: { ar: 'تسويق', en: 'Marketing' },
    equipment: { ar: 'معدات', en: 'Equipment' },
    general: { ar: 'عام', en: 'General' },
  };

  const expensePieData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    name: categoryLabels[category]?.[dir === 'rtl' ? 'ar' : 'en'] || category,
    value: amount,
    color: categoryColors[category] || '#64748b',
  }));

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

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html dir="${dir}">
          <head>
            <title>${dir === 'rtl' ? 'تقرير الأداء' : 'Performance Report'}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; direction: ${dir}; color: #333; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2d8a5f; padding-bottom: 20px; margin-bottom: 30px; }
              .company-info h1 { margin: 0; color: #2d8a5f; font-size: 28px; }
              .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 40px; }
              .stat-card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; text-align: center; background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); }
              .stat-value { font-size: 24px; font-weight: bold; margin-top: 8px; }
              .stat-value.positive { color: #22c55e; }
              .stat-value.negative { color: #ef4444; }
              .section-title { font-size: 18px; font-weight: bold; margin: 30px 0 15px; color: #2d8a5f; border-${dir === 'rtl' ? 'right' : 'left'}: 4px solid #2d8a5f; padding-${dir === 'rtl' ? 'right' : 'left'}: 12px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { background: #2d8a5f; color: white; padding: 12px; text-align: ${dir === 'rtl' ? 'right' : 'left'}; font-size: 14px; }
              td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
              tr:nth-child(even) { background: #f9fafb; }
              .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #9ca3af; }
              .summary-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
              @media print {
                @page { margin: 1.5cm; }
                .stat-card { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-info">
                <h1>${t('appName')}</h1>
                <p>${dir === 'rtl' ? 'تقرير الإيرادات والمصروفات الشامل' : 'Comprehensive Revenue & Expenses Report'}</p>
              </div>
              <div style="text-align: ${dir === 'rtl' ? 'left' : 'right'}; font-size: 12px;">
                <p><strong>${dir === 'rtl' ? 'تاريخ التقرير:' : 'Report Date:'}</strong></p>
                <p>${new Date().toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}</p>
              </div>
            </div>

            <div class="summary-box">
              <h3 style="margin: 0 0 15px; color: #166534;">${dir === 'rtl' ? 'ملخص الأداء المالي' : 'Financial Performance Summary'}</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div style="font-size: 12px; color: #6b7280;">${dir === 'rtl' ? 'إجمالي الإيرادات' : 'Total Revenue'}</div>
                  <div class="stat-value positive">${totalRevenue.toLocaleString()} ${t('currency')}</div>
                </div>
                <div class="stat-card">
                  <div style="font-size: 12px; color: #6b7280;">${dir === 'rtl' ? 'إجمالي المصروفات' : 'Total Expenses'}</div>
                  <div class="stat-value negative">${totalExpenses.toLocaleString()} ${t('currency')}</div>
                </div>
                <div class="stat-card">
                  <div style="font-size: 12px; color: #6b7280;">${dir === 'rtl' ? 'صافي الربح' : 'Net Profit'}</div>
                  <div class="stat-value ${netProfit >= 0 ? 'positive' : 'negative'}">${netProfit.toLocaleString()} ${t('currency')}</div>
                </div>
                <div class="stat-card">
                  <div style="font-size: 12px; color: #6b7280;">${dir === 'rtl' ? 'هامش الربح' : 'Profit Margin'}</div>
                  <div class="stat-value ${Number(profitMargin) >= 0 ? 'positive' : 'negative'}">${profitMargin}%</div>
                </div>
              </div>
            </div>

            <div class="section-title">${dir === 'rtl' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</div>
            <table>
              <thead>
                <tr>
                  <th>${dir === 'rtl' ? 'الشهر' : 'Month'}</th>
                  <th>${dir === 'rtl' ? 'الإيرادات' : 'Revenue'}</th>
                  <th>${dir === 'rtl' ? 'المصروفات' : 'Expenses'}</th>
                  <th>${dir === 'rtl' ? 'صافي الربح' : 'Net Profit'}</th>
                </tr>
              </thead>
              <tbody>
                ${monthlyData.map(m => `
                  <tr>
                    <td>${m.fullMonth}</td>
                    <td style="color: #22c55e; font-weight: 600;">${m.revenue.toLocaleString()} ${t('currency')}</td>
                    <td style="color: #ef4444; font-weight: 600;">${m.expenses.toLocaleString()} ${t('currency')}</td>
                    <td style="color: ${m.profit >= 0 ? '#22c55e' : '#ef4444'}; font-weight: 600;">${m.profit.toLocaleString()} ${t('currency')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="section-title">${dir === 'rtl' ? 'سجل الفواتير الأخيرة' : 'Recent Invoices'}</div>
            <table>
              <thead>
                <tr>
                  <th>${dir === 'rtl' ? 'رقم الفاتورة' : 'Invoice No'}</th>
                  <th>${dir === 'rtl' ? 'العميل' : 'Customer'}</th>
                  <th>${dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                  <th>${dir === 'rtl' ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                ${invoices?.slice(0, 10).map(inv => `
                  <tr>
                    <td>${inv.invoice_number}</td>
                    <td>${inv.customers?.name || '-'}</td>
                    <td>${inv.amount} ${t('currency')}</td>
                    <td style="color: ${inv.status === 'paid' ? '#22c55e' : '#f59e0b'};">${inv.status === 'paid' ? (dir === 'rtl' ? 'مدفوعة' : 'Paid') : (dir === 'rtl' ? 'معلقة' : 'Pending')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>${dir === 'rtl' ? 'تم إنشاء هذا التقرير آلياً بواسطة نظام ' : 'Automatically generated by '}${t('appName')}</p>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.frameElement.remove(); }, 100);
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  };

  const handleExportCSV = () => {
    if (!invoices || invoices.length === 0) {
      toast({
        variant: "destructive",
        title: dir === 'rtl' ? "لا توجد بيانات" : "No data",
        description: dir === 'rtl' ? "لا توجد فواتير لتصديرها" : "No invoices to export"
      });
      return;
    }

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

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: dir === 'rtl' ? "تم التصدير" : "Exported",
      description: dir === 'rtl' ? "تم تحميل التقرير بنجاح" : "Report downloaded successfully"
    });
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('reports')}</h1>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? 'تقرير الإيرادات والمصروفات والتحليلات المالية' : 'Revenue, expenses, and financial analytics report'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">{dir === 'rtl' ? '3 أشهر' : '3 Months'}</SelectItem>
              <SelectItem value="6months">{dir === 'rtl' ? '6 أشهر' : '6 Months'}</SelectItem>
              <SelectItem value="12months">{dir === 'rtl' ? 'سنة' : '1 Year'}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <FileSpreadsheet className="w-4 h-4 me-2" />
            {dir === 'rtl' ? 'تصدير إكسل' : 'Export Excel'}
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint}>
            <Download className="w-4 h-4 me-2" />
            {dir === 'rtl' ? 'تحميل PDF' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                +12%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalRevenue.toLocaleString()} {t('currency')}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Wallet className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-red-600">
                <ArrowDownRight className="w-4 h-4" />
                -8%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي المصروفات' : 'Total Expenses'}</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totalExpenses.toLocaleString()} {t('currency')}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {profitMargin}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'صافي الربح' : 'Net Profit'}</p>
            <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {netProfit.toLocaleString()} {t('currency')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'عدد العملاء' : 'Total Customers'}</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.totalCustomers || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {dir === 'rtl' ? 'الإيرادات مقابل المصروفات' : 'Revenue vs Expenses'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses2" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value: number) => [`${value.toLocaleString()} ${t('currency')}`, '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name={dir === 'rtl' ? 'الإيرادات' : 'Revenue'} stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue2)" />
                  <Area type="monotone" dataKey="expenses" name={dir === 'rtl' ? 'المصروفات' : 'Expenses'} stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              {dir === 'rtl' ? 'صافي الربح الشهري' : 'Monthly Net Profit'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} reversed={dir === 'rtl'} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} orientation={dir === 'rtl' ? 'right' : 'left'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} ${t('currency')}`, dir === 'rtl' ? 'صافي الربح' : 'Net Profit']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name={dir === 'rtl' ? 'صافي الربح' : 'Net Profit'}
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              {dir === 'rtl' ? 'توزيع المصروفات' : 'Expense Breakdown'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ${t('currency')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Services Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              {dir === 'rtl' ? 'الخدمات الأكثر طلباً' : 'Top Services'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} orientation={dir === 'rtl' ? 'right' : 'left'} />
                  <Tooltip />
                  <Bar dataKey="value" name={dir === 'rtl' ? 'العدد' : 'Count'} radius={dir === 'rtl' ? [4, 0, 0, 4] : [0, 4, 4, 0]}>
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {dir === 'rtl' ? 'حالة الفواتير' : 'Invoice Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
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
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
