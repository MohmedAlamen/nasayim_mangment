import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Download, Eye, MoreHorizontal, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Invoices: React.FC = () => {
  const { t, dir } = useLanguage();

  const invoices = [
    {
      id: 'INV-001',
      customer: dir === 'rtl' ? 'أحمد محمد' : 'Ahmed Mohammed',
      service: t('pestControl'),
      date: '2024-01-15',
      amount: 350,
      status: 'paid',
    },
    {
      id: 'INV-002',
      customer: dir === 'rtl' ? 'سارة العلي' : 'Sara Al Ali',
      service: t('rodentControl'),
      date: '2024-01-14',
      amount: 450,
      status: 'pending',
    },
    {
      id: 'INV-003',
      customer: dir === 'rtl' ? 'محمد السعيد' : 'Mohammed Al Said',
      service: t('termiteControl'),
      date: '2024-01-13',
      amount: 800,
      status: 'paid',
    },
    {
      id: 'INV-004',
      customer: dir === 'rtl' ? 'فاطمة الحربي' : 'Fatima Al Harbi',
      service: t('disinfection'),
      date: '2024-01-12',
      amount: 250,
      status: 'overdue',
    },
    {
      id: 'INV-005',
      customer: dir === 'rtl' ? 'نورة المالكي' : 'Noura Al-Malki',
      service: t('fumigation'),
      date: '2024-01-11',
      amount: 1200,
      status: 'paid',
    },
  ];

  const statusStyles = {
    paid: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const statusLabels = {
    paid: dir === 'rtl' ? 'مدفوعة' : 'Paid',
    pending: dir === 'rtl' ? 'معلقة' : 'Pending',
    overdue: dir === 'rtl' ? 'متأخرة' : 'Overdue',
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('invoices')}</h1>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? 'إدارة الفواتير والمدفوعات' : 'Manage invoices and payments'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 me-2" />
            {t('export')}
          </Button>
          <Button className="gradient-primary text-primary-foreground shadow-glow">
            <Plus className="w-4 h-4 me-2" />
            {dir === 'rtl' ? 'فاتورة جديدة' : 'New Invoice'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground">
            {dir === 'rtl' ? 'إجمالي الفواتير' : 'Total Invoices'}
          </p>
          <p className="text-2xl font-bold mt-1">{t('currency')} {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground">
            {dir === 'rtl' ? 'المبلغ المستلم' : 'Amount Received'}
          </p>
          <p className="text-2xl font-bold mt-1 text-success">{t('currency')} {paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground">
            {dir === 'rtl' ? 'المبلغ المعلق' : 'Pending Amount'}
          </p>
          <p className="text-2xl font-bold mt-1 text-warning">{t('currency')} {pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dir === 'rtl' ? 'رقم الفاتورة' : 'Invoice #'}</TableHead>
              <TableHead>{t('customers')}</TableHead>
              <TableHead>{t('services')}</TableHead>
              <TableHead>{dir === 'rtl' ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead>{dir === 'rtl' ? 'المبلغ' : 'Amount'}</TableHead>
              <TableHead>{dir === 'rtl' ? 'الحالة' : 'Status'}</TableHead>
              <TableHead>{dir === 'rtl' ? 'الإجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {invoice.id}
                  </div>
                </TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>{invoice.service}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell className="font-semibold">
                  {t('currency')} {invoice.amount}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full border",
                    statusStyles[invoice.status as keyof typeof statusStyles]
                  )}>
                    {statusLabels[invoice.status as keyof typeof statusLabels]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Invoices;
