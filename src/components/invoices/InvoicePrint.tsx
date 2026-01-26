import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { InvoiceWithRelations } from '@/hooks/useInvoices';

interface InvoicePrintProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithRelations | null;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ open, onOpenChange, invoice }) => {
  const { dir } = useLanguage();

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html dir="${dir}">
            <head>
              <title>${invoice?.invoice_number || 'Invoice'}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; direction: ${dir}; }
                .header { text-align: center; margin-bottom: 40px; }
                .logo { font-size: 24px; font-weight: bold; color: #2d8a5f; }
                .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .info-box { background: #f9f9f9; padding: 20px; border-radius: 8px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: ${dir === 'rtl' ? 'right' : 'left'}; border-bottom: 1px solid #ddd; }
                th { background: #f5f5f5; }
                .total { font-size: 20px; font-weight: bold; text-align: ${dir === 'rtl' ? 'left' : 'right'}; margin-top: 20px; }
                .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>${printContent.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } 
  };

  if (!invoice) return null;

  const statusLabels: Record<string, string> = {
    pending: dir === 'rtl' ? 'معلقة' : 'Pending',
    paid: dir === 'rtl' ? 'مدفوعة' : 'Paid',
    overdue: dir === 'rtl' ? 'متأخرة' : 'Overdue',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{dir === 'rtl' ? 'معاينة الفاتورة' : 'Invoice Preview'}</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={handlePrint}><Printer className="w-4 h-4 me-2" />{dir === 'rtl' ? 'طباعة' : 'Print'}</Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div id="invoice-print-content" className="bg-white p-6 rounded-lg">
          {/* Header */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">
              {dir === 'rtl' ? 'شركة مكافحة الحشرات' : 'Pest Control Company'}
            </h1>
            <p className="text-muted-foreground">{dir === 'rtl' ? 'خدمات متميزة لبيئة نظيفة' : 'Premium services for a clean environment'}</p>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{dir === 'rtl' ? 'معلومات الفاتورة' : 'Invoice Info'}</h3>
              <p><strong>{dir === 'rtl' ? 'رقم الفاتورة:' : 'Invoice #:'}</strong> {invoice.invoice_number}</p>
              <p><strong>{dir === 'rtl' ? 'التاريخ:' : 'Date:'}</strong> {format(new Date(invoice.created_at), 'PPP', { locale: dir === 'rtl' ? ar : undefined })}</p>
              {invoice.due_date && <p><strong>{dir === 'rtl' ? 'تاريخ الاستحقاق:' : 'Due Date:'}</strong> {format(new Date(invoice.due_date), 'PPP', { locale: dir === 'rtl' ? ar : undefined })}</p>}
              <p><strong>{dir === 'rtl' ? 'الحالة:' : 'Status:'}</strong> {statusLabels[invoice.status || 'pending']}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{dir === 'rtl' ? 'معلومات العميل' : 'Customer Info'}</h3>
              <p><strong>{dir === 'rtl' ? 'الاسم:' : 'Name:'}</strong> {invoice.customers?.name || '-'}</p>
              <p><strong>{dir === 'rtl' ? 'الهاتف:' : 'Phone:'}</strong> {invoice.customers?.phone || '-'}</p>
              <p><strong>{dir === 'rtl' ? 'العنوان:' : 'Address:'}</strong> {invoice.customers?.address || '-'}</p>
            </div>
          </div>

          {/* Service Details */}
          {invoice.appointments?.services && (
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b">
                  <th className="text-start py-3">{dir === 'rtl' ? 'الخدمة' : 'Service'}</th>
                  <th className="text-start py-3">{dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                  <th className="text-end py-3">{dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">{dir === 'rtl' ? invoice.appointments.services.name_ar : invoice.appointments.services.name_en}</td>
                  <td className="py-3">{invoice.appointments.scheduled_date}</td>
                  <td className="text-end py-3">{invoice.appointments.services.price} {dir === 'rtl' ? 'ر.س' : 'SAR'}</td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Total */}
          <div className="text-end border-t pt-4">
            <p className="text-2xl font-bold text-primary">
              {dir === 'rtl' ? 'الإجمالي:' : 'Total:'} {invoice.amount} {dir === 'rtl' ? 'ر.س' : 'SAR'}
            </p>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">{dir === 'rtl' ? 'ملاحظات' : 'Notes'}</h3>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t text-muted-foreground text-sm">
            <p>{dir === 'rtl' ? 'شكراً لتعاملكم معنا' : 'Thank you for your business'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePrint;
