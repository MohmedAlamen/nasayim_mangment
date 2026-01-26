import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Download, Upload, Eye, MoreHorizontal, FileText, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useInvoices, useDeleteInvoice, InvoiceWithRelations } from '@/hooks/useInvoices';
import InvoiceDialog from '@/components/invoices/InvoiceDialog';
import InvoicePrint from '@/components/invoices/InvoicePrint';
import ImportInvoicesDialog from '@/components/invoices/ImportInvoicesDialog';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { useAuth } from '@/contexts/AuthContext';
import { exportInvoicesToCSV, exportInvoicesToJSON } from '@/utils/invoiceExport';

const Invoices: React.FC = () => {
  const { t, dir } = useLanguage();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithRelations | null>(null);

  const { data: invoices, isLoading } = useInvoices();
  const deleteInvoice = useDeleteInvoice();

  // Handle URL params
  useEffect(() => {
    if (searchParams.get('action') === 'new') setDialogOpen(true);
  }, [searchParams]);

  const statusStyles: Record<string, string> = {
    paid: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const statusLabels: Record<string, string> = {
    paid: dir === 'rtl' ? 'مدفوعة' : 'Paid',
    pending: dir === 'rtl' ? 'معلقة' : 'Pending',
    overdue: dir === 'rtl' ? 'متأخرة' : 'Overdue',
  };

  const handleEdit = (invoice: InvoiceWithRelations) => { setSelectedInvoice(invoice); setDialogOpen(true); };
  const handleView = (invoice: InvoiceWithRelations) => { setSelectedInvoice(invoice); setPrintDialogOpen(true); };
  const handleDelete = (invoice: InvoiceWithRelations) => { setSelectedInvoice(invoice); setDeleteDialogOpen(true); };
  const confirmDelete = async () => { if (selectedInvoice) { await deleteInvoice.mutateAsync(selectedInvoice.id); setDeleteDialogOpen(false); setSelectedInvoice(null); } };
  const handleAdd = () => { setSelectedInvoice(null); setDialogOpen(true); };

  // Calculate totals
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const paidAmount = invoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const pendingAmount = invoices?.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('invoices')}</h1>
          <p className="text-muted-foreground">{dir === 'rtl' ? 'إدارة الفواتير والمدفوعات' : 'Manage invoices and payments'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 me-2" />{t('export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
              <DropdownMenuItem onClick={() => invoices && exportInvoicesToCSV(invoices, dir)}>
                {dir === 'rtl' ? 'تصدير CSV' : 'Export CSV'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => invoices && exportInvoicesToJSON(invoices)}>
                {dir === 'rtl' ? 'تصدير JSON' : 'Export JSON'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="w-4 h-4 me-2" />{dir === 'rtl' ? 'استيراد' : 'Import'}
          </Button>
          <Button onClick={handleAdd} className="gradient-primary text-primary-foreground shadow-glow">
            <Plus className="w-4 h-4 me-2" />{dir === 'rtl' ? 'فاتورة جديدة' : 'New Invoice'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي الفواتير' : 'Total Invoices'}</p>
          <p className="text-2xl font-bold mt-1">{t('currency')} {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المبلغ المستلم' : 'Amount Received'}</p>
          <p className="text-2xl font-bold mt-1 text-success">{t('currency')} {paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المبلغ المعلق' : 'Pending Amount'}</p>
          <p className="text-2xl font-bold mt-1 text-warning">{t('currency')} {pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}

      {/* Empty State */}
      {!isLoading && invoices?.length === 0 && (
        <Card><CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{dir === 'rtl' ? 'لا توجد فواتير' : 'No invoices yet'}</p>
          <Button onClick={handleAdd} className="mt-4"><Plus className="w-4 h-4 me-2" />{dir === 'rtl' ? 'إنشاء فاتورة' : 'Create Invoice'}</Button>
        </CardContent></Card>
      )}

      {/* Table */}
      {!isLoading && invoices && invoices.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dir === 'rtl' ? 'رقم الفاتورة' : 'Invoice #'}</TableHead>
                <TableHead>{t('customers')}</TableHead>
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
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{invoice.invoice_number}</div>
                  </TableCell>
                  <TableCell>{invoice.customers?.name || '-'}</TableCell>
                  <TableCell>{format(new Date(invoice.created_at), 'PPP', { locale: dir === 'rtl' ? ar : undefined })}</TableCell>
                  <TableCell className="font-semibold">{t('currency')} {invoice.amount}</TableCell>
                  <TableCell>
                    <span className={cn("px-2 py-1 text-xs font-medium rounded-full border", statusStyles[invoice.status || 'pending'])}>
                      {statusLabels[invoice.status || 'pending']}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(invoice)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleView(invoice)}><Printer className="w-4 h-4" /></Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                          <DropdownMenuItem onClick={() => handleEdit(invoice)}>{t('edit')}</DropdownMenuItem>
                          {isAdmin && <DropdownMenuItem onClick={() => handleDelete(invoice)} className="text-destructive">{t('delete')}</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <InvoiceDialog open={dialogOpen} onOpenChange={setDialogOpen} invoice={selectedInvoice} />
      <InvoicePrint open={printDialogOpen} onOpenChange={setPrintDialogOpen} invoice={selectedInvoice} />
      <ImportInvoicesDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} isLoading={deleteInvoice.isPending} />
    </div>
  );
};

export default Invoices;
