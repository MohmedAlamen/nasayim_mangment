import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, CheckCircle, Clock } from 'lucide-react';
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
              <title>${invoice?.invoice_number || 'Invoice'}</title>
              <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Cairo', Arial, sans-serif; 
                  padding: 0; 
                  direction: ${dir}; 
                  color: #1f2937; 
                  background: white;
                  font-size: 14px;
                  line-height: 1.6;
                }
                .invoice-wrapper {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 40px;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 40px;
                  padding-bottom: 30px;
                  border-bottom: 3px solid #059669;
                }
                .company-section h1 {
                  font-size: 32px;
                  font-weight: 700;
                  color: #059669;
                  margin-bottom: 8px;
                }
                .company-section p {
                  color: #6b7280;
                  font-size: 13px;
                  max-width: 280px;
                }
                .invoice-title-section {
                  text-align: ${dir === 'rtl' ? 'left' : 'right'};
                }
                .invoice-badge {
                  display: inline-block;
                  padding: 8px 20px;
                  background: linear-gradient(135deg, #059669 0%, #047857 100%);
                  color: white;
                  font-size: 20px;
                  font-weight: 700;
                  border-radius: 8px;
                  margin-bottom: 12px;
                }
                .invoice-number {
                  font-size: 24px;
                  font-weight: 700;
                  color: #1f2937;
                  margin-bottom: 5px;
                }
                .invoice-date {
                  color: #6b7280;
                  font-size: 13px;
                }
                .logo-img {
                  height: 70px;
                  width: auto;
                  object-fit: contain;
                }
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 30px;
                  margin-bottom: 40px;
                }
                .info-box {
                  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                  padding: 25px;
                  border-radius: 16px;
                  border: 1px solid #bbf7d0;
                }
                .info-box h3 {
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  color: #059669;
                  margin-bottom: 15px;
                  font-weight: 700;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                  border-bottom: 1px dashed #a7f3d0;
                }
                .info-row:last-child {
                  border-bottom: none;
                }
                .info-label {
                  color: #6b7280;
                  font-size: 13px;
                }
                .info-value {
                  font-weight: 600;
                  color: #1f2937;
                  font-size: 13px;
                }
                .status-badge {
                  display: inline-block;
                  padding: 4px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                }
                .status-paid {
                  background: #dcfce7;
                  color: #166534;
                }
                .status-pending {
                  background: #fef3c7;
                  color: #92400e;
                }
                .items-table {
                  width: 100%;
                  border-collapse: separate;
                  border-spacing: 0;
                  margin-bottom: 30px;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .items-table th {
                  background: linear-gradient(135deg, #059669 0%, #047857 100%);
                  color: white;
                  padding: 16px 20px;
                  text-align: ${dir === 'rtl' ? 'right' : 'left'};
                  font-weight: 600;
                  font-size: 13px;
                  -webkit-print-color-adjust: exact;
                }
                .items-table th:last-child {
                  text-align: ${dir === 'rtl' ? 'left' : 'right'};
                }
                .items-table td {
                  padding: 18px 20px;
                  border-bottom: 1px solid #e5e7eb;
                  font-size: 14px;
                }
                .items-table tr:last-child td {
                  border-bottom: none;
                }
                .items-table tr:nth-child(even) {
                  background: #f9fafb;
                  -webkit-print-color-adjust: exact;
                }
                .item-name {
                  font-weight: 600;
                  color: #1f2937;
                }
                .item-description {
                  font-size: 12px;
                  color: #6b7280;
                  margin-top: 4px;
                }
                .amount-cell {
                  text-align: ${dir === 'rtl' ? 'left' : 'right'};
                  font-weight: 700;
                  font-size: 15px;
                }
                .totals-section {
                  display: flex;
                  flex-direction: column;
                  align-items: ${dir === 'rtl' ? 'flex-start' : 'flex-end'};
                  margin-bottom: 30px;
                }
                .totals-box {
                  width: 300px;
                  background: #f9fafb;
                  border-radius: 12px;
                  padding: 20px;
                  border: 1px solid #e5e7eb;
                }
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px dashed #e5e7eb;
                }
                .total-row:last-child {
                  border-bottom: none;
                }
                .grand-total {
                  background: linear-gradient(135deg, #059669 0%, #047857 100%);
                  color: white;
                  margin: 15px -20px -20px;
                  padding: 20px;
                  border-radius: 0 0 12px 12px;
                  -webkit-print-color-adjust: exact;
                }
                .grand-total .total-row {
                  border: none;
                  padding: 0;
                }
                .grand-total span {
                  font-size: 18px;
                  font-weight: 700;
                }
                .notes-section {
                  background: #fffbeb;
                  border: 1px solid #fde68a;
                  border-radius: 12px;
                  padding: 20px;
                  margin-bottom: 40px;
                }
                .notes-section h4 {
                  color: #92400e;
                  font-weight: 600;
                  margin-bottom: 10px;
                  font-size: 14px;
                }
                .notes-section p {
                  color: #78350f;
                  font-size: 13px;
                  line-height: 1.7;
                }
                .footer {
                  text-align: center;
                  padding-top: 30px;
                  border-top: 2px solid #e5e7eb;
                  color: #9ca3af;
                  font-size: 12px;
                }
                .footer-thanks {
                  color: #059669;
                  font-weight: 600;
                  font-size: 16px;
                  margin-bottom: 8px;
                }
                @media print {
                  body { padding: 0; }
                  .invoice-wrapper { padding: 20px; }
                  @page { margin: 1cm; }
                }
              </style>
            </head>
            <body>
              <div class="invoice-wrapper">
                <div class="header">
                  <div class="company-section">
                    <h1>${t('appName')}</h1>
                    <p>${t('companyDescription')}</p>
                  </div>
                  <div class="invoice-title-section">
                    <div class="invoice-badge">${dir === 'rtl' ? 'فاتورة' : 'INVOICE'}</div>
                    <div class="invoice-number">${invoice?.invoice_number}</div>
                    <div class="invoice-date">${format(new Date(invoice?.created_at || new Date()), 'PPP', { locale: dir === 'rtl' ? ar : undefined })}</div>
                  </div>
                </div>

                <div class="info-grid">
                  <div class="info-box">
                    <h3>${dir === 'rtl' ? 'بيانات العميل' : 'BILL TO'}</h3>
                    <div class="info-row">
                      <span class="info-label">${dir === 'rtl' ? 'الاسم:' : 'Name:'}</span>
                      <span class="info-value">${invoice?.customers?.name || '-'}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">${dir === 'rtl' ? 'الهاتف:' : 'Phone:'}</span>
                      <span class="info-value" dir="ltr">${invoice?.customers?.phone || '-'}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">${dir === 'rtl' ? 'العنوان:' : 'Address:'}</span>
                      <span class="info-value">${invoice?.customers?.address || '-'}</span>
                    </div>
                  </div>
                  <div class="info-box">
                    <h3>${dir === 'rtl' ? 'تفاصيل الفاتورة' : 'INVOICE DETAILS'}</h3>
                    <div class="info-row">
                      <span class="info-label">${dir === 'rtl' ? 'رقم الفاتورة:' : 'Invoice No:'}</span>
                      <span class="info-value">${invoice?.invoice_number}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">${dir === 'rtl' ? 'التاريخ:' : 'Date:'}</span>
                      <span class="info-value">${format(new Date(invoice?.created_at || new Date()), 'dd/MM/yyyy')}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">${dir === 'rtl' ? 'الحالة:' : 'Status:'}</span>
                      <span class="status-badge ${invoice?.status === 'paid' ? 'status-paid' : 'status-pending'}">${invoice?.status === 'paid' ? (dir === 'rtl' ? '✓ مدفوعة' : '✓ Paid') : (dir === 'rtl' ? '⏳ غير مدفوعة' : '⏳ Unpaid')}</span>
                    </div>
                  </div>
                </div>

                <table class="items-table">
                  <thead>
                    <tr>
                      <th style="width: 50px;">#</th>
                      <th>${dir === 'rtl' ? 'الوصف' : 'Description'}</th>
                      <th style="width: 120px;">${dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                      <th style="width: 150px;">${dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>
                        <div class="item-name">${dir === 'rtl' ? (invoice?.appointments?.services?.name_ar || 'خدمة') : (invoice?.appointments?.services?.name_en || 'Service')}</div>
                        ${invoice?.appointments?.scheduled_date ? `<div class="item-description">${dir === 'rtl' ? 'موعد الخدمة:' : 'Service date:'} ${invoice?.appointments?.scheduled_date}</div>` : ''}
                      </td>
                      <td>${invoice?.appointments?.scheduled_date || format(new Date(invoice?.created_at || new Date()), 'dd/MM/yyyy')}</td>
                      <td class="amount-cell">${Number(invoice?.amount).toLocaleString()} ${t('currency')}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="totals-section">
                  <div class="totals-box">
                    <div class="total-row">
                      <span>${dir === 'rtl' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span>${Number(invoice?.amount).toLocaleString()} ${t('currency')}</span>
                    </div>
                    <div class="total-row">
                      <span>${dir === 'rtl' ? 'ضريبة القيمة المضافة (0%)' : 'VAT (0%)'}</span>
                      <span>0 ${t('currency')}</span>
                    </div>
                    <div class="grand-total">
                      <div class="total-row">
                        <span>${dir === 'rtl' ? 'الإجمالي' : 'TOTAL'}</span>
                        <span>${Number(invoice?.amount).toLocaleString()} ${t('currency')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                ${invoice?.notes ? `
                <div class="notes-section">
                  <h4>📝 ${dir === 'rtl' ? 'ملاحظات:' : 'Notes:'}</h4>
                  <p>${invoice.notes}</p>
                </div>` : ''}

                <div class="footer">
                  <div class="footer-thanks">${dir === 'rtl' ? '🙏 شكراً لتعاملكم معنا' : '🙏 Thank you for your business'}</div>
                  <p>${t('appName')} &copy; ${new Date().getFullYear()} - ${dir === 'rtl' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
                </div>
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
    } 
  };

  if (!invoice) return null;

  const StatusIcon = invoice.status === 'paid' ? CheckCircle : Clock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" dir={dir}>
        <div className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b flex items-center justify-between">
          <DialogTitle>{dir === 'rtl' ? 'معاينة الفاتورة' : 'Invoice Preview'}</DialogTitle>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 me-2" />
            {dir === 'rtl' ? 'طباعة' : 'Print'}
          </Button>
        </div>
        
        <div className="p-6 md:p-8 bg-muted/30">
          <div id="invoice-print-content" className="bg-white p-6 md:p-10 rounded-2xl shadow-xl max-w-[800px] mx-auto border">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-4 border-primary pb-8 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{t('appName')}</h1>
                <p className="text-muted-foreground text-sm max-w-[280px]">{t('companyDescription')}</p>
              </div>
              <div className={`text-${dir === 'rtl' ? 'start' : 'end'}`}>
                <div className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-primary/80 text-white text-xl font-bold rounded-lg mb-3">
                  {dir === 'rtl' ? 'فاتورة' : 'INVOICE'}
                </div>
                <p className="text-2xl font-bold">{invoice.invoice_number}</p>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(invoice.created_at), 'PPP', { locale: dir === 'rtl' ? ar : undefined })}
                </p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/20">
                <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-4">
                  {dir === 'rtl' ? 'بيانات العميل' : 'BILL TO'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{dir === 'rtl' ? 'الاسم:' : 'Name:'}</span>
                    <span className="font-semibold">{invoice.customers?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{dir === 'rtl' ? 'الهاتف:' : 'Phone:'}</span>
                    <span className="font-semibold" dir="ltr">{invoice.customers?.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{dir === 'rtl' ? 'العنوان:' : 'Address:'}</span>
                    <span className="font-semibold text-end">{invoice.customers?.address || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/20">
                <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-4">
                  {dir === 'rtl' ? 'تفاصيل الفاتورة' : 'INVOICE DETAILS'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{dir === 'rtl' ? 'رقم الفاتورة:' : 'Invoice No:'}</span>
                    <span className="font-semibold">{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{dir === 'rtl' ? 'التاريخ:' : 'Date:'}</span>
                    <span className="font-semibold">{format(new Date(invoice.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{dir === 'rtl' ? 'الحالة:' : 'Status:'}</span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      <StatusIcon className="w-3 h-3" />
                      {invoice.status === 'paid' ? (dir === 'rtl' ? 'مدفوعة' : 'Paid') : (dir === 'rtl' ? 'غير مدفوعة' : 'Unpaid')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-xl overflow-hidden border shadow-sm mb-8">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary to-primary/80 text-white">
                    <th className="p-4 text-start font-semibold text-sm w-12">#</th>
                    <th className="p-4 text-start font-semibold text-sm">{dir === 'rtl' ? 'الوصف' : 'Description'}</th>
                    <th className="p-4 text-start font-semibold text-sm w-28">{dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                    <th className="p-4 text-end font-semibold text-sm w-32">{dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-5">1</td>
                    <td className="p-5">
                      <p className="font-semibold">
                        {dir === 'rtl' ? (invoice.appointments?.services?.name_ar || 'خدمة') : (invoice.appointments?.services?.name_en || 'Service')}
                      </p>
                      {invoice.appointments?.scheduled_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {dir === 'rtl' ? 'موعد الخدمة:' : 'Service date:'} {invoice.appointments.scheduled_date}
                        </p>
                      )}
                    </td>
                    <td className="p-5 text-muted-foreground text-sm">
                      {invoice.appointments?.scheduled_date || format(new Date(invoice.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-5 text-end font-bold text-lg">{Number(invoice.amount).toLocaleString()} {t('currency')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'} mb-8`}>
              <div className="w-full sm:w-80 bg-muted/50 rounded-xl border overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{dir === 'rtl' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{Number(invoice.amount).toLocaleString()} {t('currency')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{dir === 'rtl' ? 'ضريبة (0%)' : 'Tax (0%)'}</span>
                    <span>0 {t('currency')}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">{dir === 'rtl' ? 'الإجمالي' : 'TOTAL'}</span>
                    <span className="text-xl font-bold">{Number(invoice.amount).toLocaleString()} {t('currency')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-8">
                <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                  📝 {dir === 'rtl' ? 'ملاحظات:' : 'Notes:'}
                </h4>
                <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-8 border-t">
              <p className="text-primary font-semibold text-lg mb-2">
                🙏 {dir === 'rtl' ? 'شكراً لتعاملكم معنا' : 'Thank you for your business'}
              </p>
              <p className="text-muted-foreground text-sm">
                {t('appName')} &copy; {new Date().getFullYear()} - {dir === 'rtl' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePrint;
