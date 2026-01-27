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
  const { dir, t } = useLanguage();

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
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
                body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; direction: ${dir}; color: #333; }
                .invoice-card { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2d8a5f; padding-bottom: 20px; margin-bottom: 30px; }
                .company-info h1 { margin: 0; color: #2d8a5f; font-size: 28px; }
                .company-info p { margin: 5px 0; color: #666; font-size: 14px; }
                .logo-img { height: 80px; object-contain: contain; }
                .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
                .meta-box { flex: 1; background: #f9fbf9; padding: 15px; border-radius: 8px; border: 1px solid #eef2ee; }
                .meta-box h3 { margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #2d8a5f; border-bottom: 1px solid #e0e8e0; padding-bottom: 5px; }
                .meta-box p { margin: 5px 0; font-size: 14px; line-height: 1.6; }
                table { width: 100%; border-collapse: collapse; margin: 25px 0; border-radius: 8px; overflow: hidden; }
                th { background: #2d8a5f; color: white; padding: 12px; text-align: ${dir === 'rtl' ? 'right' : 'left'}; font-weight: bold; }
                td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                tr:nth-child(even) { background: #fafafa; }
                .totals-section { display: flex; flex-direction: column; align-items: flex-end; margin-top: 20px; }
                .total-row { display: flex; gap: 40px; padding: 10px 0; border-top: 1px solid #eee; width: 250px; justify-content: space-between; }
                .grand-total { font-size: 20px; font-weight: bold; color: #2d8a5f; border-top: 2px solid #2d8a5f; margin-top: 5px; padding-top: 15px; }
                .notes { margin-top: 30px; padding: 15px; background: #fff9f0; border-radius: 8px; border: 1px solid #ffe8cc; font-size: 13px; }
                .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
                @media print {
                  body { padding: 0; }
                  .invoice-card { border: none; box-shadow: none; width: 100%; max-width: none; }
                }
              </style>
            </head>
            <body>
              <div class="invoice-card">
                <div class="header">
                  <div class="company-info">
                    <h1>${t('appName')}</h1>
                    <p>${t('companyDescription')}</p>
                  </div>
                  <img src="/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
                </div>

                <div class="invoice-meta">
                  <div class="meta-box">
                    <h3>${dir === 'rtl' ? 'بيانات الفاتورة' : 'Invoice Details'}</h3>
                    <p><strong>${dir === 'rtl' ? 'رقم الفاتورة:' : 'Invoice No:'}</strong> ${invoice?.invoice_number}</p>
                    <p><strong>${dir === 'rtl' ? 'التاريخ:' : 'Date:'}</strong> ${format(new Date(invoice?.created_at || new Date()), 'PPP', { locale: dir === 'rtl' ? ar : undefined })}</p>
                    <p><strong>${dir === 'rtl' ? 'الحالة:' : 'Status:'}</strong> ${invoice?.status === 'paid' ? (dir === 'rtl' ? 'مدفوعة' : 'Paid') : (dir === 'rtl' ? 'غير مدفوعة' : 'Unpaid')}</p>
                  </div>
                  <div class="meta-box">
                    <h3>${dir === 'rtl' ? 'بيانات العميل' : 'Customer Details'}</h3>
                    <p><strong>${dir === 'rtl' ? 'الاسم:' : 'Name:'}</strong> ${invoice?.customers?.name || '-'}</p>
                    <p><strong>${dir === 'rtl' ? 'الهاتف:' : 'Phone:'}</strong> ${invoice?.customers?.phone || '-'}</p>
                    <p><strong>${dir === 'rtl' ? 'العنوان:' : 'Address:'}</strong> ${invoice?.customers?.address || '-'}</p>
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>${dir === 'rtl' ? 'الوصف' : 'Description'}</th>
                      <th>${dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                      <th style="text-align: ${dir === 'rtl' ? 'left' : 'right'}">${dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>${dir === 'rtl' ? invoice?.appointments?.services?.name_ar : invoice?.appointments?.services?.name_en || (dir === 'rtl' ? 'خدمة مكافحة حشرات' : 'Pest Control Service')}</td>
                      <td>${invoice?.appointments?.scheduled_date || '-'}</td>
                      <td style="text-align: ${dir === 'rtl' ? 'left' : 'right'}">${invoice?.amount} ${t('currency')}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="totals-section">
                  <div class="total-row">
                    <span>${dir === 'rtl' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>${invoice?.amount} ${t('currency')}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span>${dir === 'rtl' ? 'الإجمالي النهائي' : 'Grand Total'}</span>
                    <span>${invoice?.amount} ${t('currency')}</span>
                  </div>
                </div>

                ${invoice?.notes ? `
                <div class="notes">
                  <strong>${dir === 'rtl' ? 'ملاحظات:' : 'Notes:'}</strong>
                  <p>${invoice.notes}</p>
                </div>` : ''}

                <div class="footer">
                  <p>${dir === 'rtl' ? 'شكراً لتعاملكم مع ' : 'Thank you for choosing '}${t('appName')}</p>
                  <p>${new Date().getFullYear()} &copy; ${dir === 'rtl' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        // Wait for images to load before printing
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } 
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" dir={dir}>
        <div className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b flex items-center justify-between">
          <DialogTitle>{dir === 'rtl' ? 'معاينة الفاتورة الاحترافية' : 'Professional Invoice Preview'}</DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 me-2" />
              {dir === 'rtl' ? 'طباعة' : 'Print'}
            </Button>
          </div>
        </div>
        
        <div className="p-8 bg-muted/30">
          <div id="invoice-print-content" className="bg-white p-10 rounded-xl shadow-lg max-w-[800px] mx-auto border min-h-[1000px] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">{t('appName')}</h1>
                <p className="text-muted-foreground max-w-[300px]">{t('companyDescription')}</p>
              </div>
              <img src="/logo.png" alt="Logo" className="h-20 object-contain" />
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
                <h3 className="text-lg font-bold text-primary mb-3 border-b border-primary/10 pb-2">
                  {dir === 'rtl' ? 'بيانات الفاتورة' : 'Invoice Details'}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="font-semibold">{dir === 'rtl' ? 'رقم الفاتورة:' : 'Invoice No:'}</span>
                    <span>{invoice.invoice_number}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">{dir === 'rtl' ? 'التاريخ:' : 'Date:'}</span>
                    <span>{format(new Date(invoice.created_at), 'PPP', { locale: dir === 'rtl' ? ar : undefined })}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">{dir === 'rtl' ? 'الحالة:' : 'Status:'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {invoice.status === 'paid' ? (dir === 'rtl' ? 'مدفوعة' : 'Paid') : (dir === 'rtl' ? 'غير مدفوعة' : 'Unpaid')}
                    </span>
                  </p>
                </div>
              </div>
              <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
                <h3 className="text-lg font-bold text-primary mb-3 border-b border-primary/10 pb-2">
                  {dir === 'rtl' ? 'بيانات العميل' : 'Customer Details'}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="font-semibold">{dir === 'rtl' ? 'الاسم:' : 'Name:'}</span>
                    <span>{invoice.customers?.name || '-'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">{dir === 'rtl' ? 'الهاتف:' : 'Phone:'}</span>
                    <span dir="ltr">{invoice.customers?.phone || '-'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold">{dir === 'rtl' ? 'العنوان:' : 'Address:'}</span>
                    <span className="text-end">{invoice.customers?.address || '-'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-grow">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-3 text-start rounded-s-lg">#</th>
                    <th className="p-3 text-start">{dir === 'rtl' ? 'الوصف' : 'Description'}</th>
                    <th className="p-3 text-start">{dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                    <th className="p-3 text-end rounded-e-lg">{dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  <tr>
                    <td className="p-4">1</td>
                    <td className="p-4 font-medium">
                      {dir === 'rtl' ? invoice.appointments?.services?.name_ar : invoice.appointments?.services?.name_en || (dir === 'rtl' ? 'خدمة مكافحة حشرات' : 'Pest Control Service')}
                    </td>
                    <td className="p-4 text-muted-foreground">{invoice.appointments?.scheduled_date || '-'}</td>
                    <td className="p-4 text-end font-bold">{invoice.amount} {t('currency')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-10 flex flex-col items-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>{dir === 'rtl' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{invoice.amount} {t('currency')}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary border-t-2 border-primary pt-3">
                  <span>{dir === 'rtl' ? 'الإجمالي النهائي' : 'Grand Total'}</span>
                  <span>{invoice.amount} {t('currency')}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-10 p-5 bg-orange-50/50 border border-orange-100 rounded-xl">
                <h4 className="font-bold text-orange-800 mb-2">{dir === 'rtl' ? 'ملاحظات:' : 'Notes:'}</h4>
                <p className="text-sm text-orange-700 leading-relaxed">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-10 border-t text-center text-muted-foreground text-sm">
              <p className="mb-1">{dir === 'rtl' ? 'شكراً لتعاملكم مع ' : 'Thank you for choosing '}{t('appName')}</p>
              <p>{new Date().getFullYear()} &copy; {dir === 'rtl' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePrint;
