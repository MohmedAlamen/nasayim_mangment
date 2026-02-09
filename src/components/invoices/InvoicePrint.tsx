import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, CheckCircle, Clock, Building2, Phone, MapPin, Calendar, FileText, Hash, Download } from 'lucide-react';
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
              <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Cairo', Arial, sans-serif; 
                  padding: 0; 
                  direction: ${dir}; 
                  color: #1a1a2e; 
                  background: white;
                  font-size: 13px;
                  line-height: 1.7;
                }
                .invoice-wrapper {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 0;
                  background: white;
                }
                
                /* Premium Header */
                .header {
                  background: linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%);
                  color: white;
                  padding: 35px 40px;
                  position: relative;
                  overflow: hidden;
                }
                .header::before {
                  content: '';
                  position: absolute;
                  top: -50%;
                  ${dir === 'rtl' ? 'left' : 'right'}: -20%;
                  width: 60%;
                  height: 200%;
                  background: rgba(255,255,255,0.05);
                  transform: rotate(25deg);
                }
                .header-content {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  position: relative;
                  z-index: 1;
                }
                .company-info h1 {
                  font-size: 28px;
                  font-weight: 800;
                  margin-bottom: 6px;
                  letter-spacing: -0.5px;
                }
                .company-info p {
                  opacity: 0.9;
                  font-size: 13px;
                  font-weight: 400;
                }
                .invoice-badge {
                  text-align: ${dir === 'rtl' ? 'left' : 'right'};
                }
                .invoice-label {
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 3px;
                  opacity: 0.8;
                  margin-bottom: 4px;
                }
                .invoice-number-display {
                  font-size: 26px;
                  font-weight: 800;
                  letter-spacing: 1px;
                }
                
                /* Body Content */
                .body-content {
                  padding: 35px 40px;
                }
                
                /* Meta Row */
                .meta-row {
                  display: flex;
                  justify-content: space-between;
                  gap: 30px;
                  margin-bottom: 35px;
                  padding-bottom: 25px;
                  border-bottom: 2px solid #f1f5f9;
                }
                .meta-item {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                }
                .meta-icon {
                  width: 36px;
                  height: 36px;
                  background: #f0fdfa;
                  border-radius: 10px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #0d9488;
                }
                .meta-text span {
                  display: block;
                  font-size: 11px;
                  color: #94a3b8;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .meta-text strong {
                  font-size: 14px;
                  color: #1e293b;
                  font-weight: 600;
                }
                .status-badge {
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  padding: 6px 14px;
                  border-radius: 30px;
                  font-size: 12px;
                  font-weight: 600;
                }
                .status-paid {
                  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                  color: #15803d;
                }
                .status-pending {
                  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                  color: #b45309;
                }
                
                /* Two Column Layout */
                .two-columns {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 30px;
                  margin-bottom: 35px;
                }
                .info-card {
                  background: #fafafa;
                  border-radius: 16px;
                  padding: 24px;
                  border: 1px solid #f1f5f9;
                }
                .info-card-header {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  margin-bottom: 18px;
                  padding-bottom: 12px;
                  border-bottom: 1px dashed #e2e8f0;
                }
                .info-card-icon {
                  width: 32px;
                  height: 32px;
                  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 14px;
                }
                .info-card-title {
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 1.5px;
                  color: #64748b;
                  font-weight: 600;
                }
                .info-row {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  padding: 8px 0;
                }
                .info-row-icon {
                  color: #0d9488;
                  width: 16px;
                  flex-shrink: 0;
                }
                .info-row-label {
                  color: #94a3b8;
                  font-size: 12px;
                  min-width: 70px;
                }
                .info-row-value {
                  color: #1e293b;
                  font-weight: 600;
                  font-size: 13px;
                }
                
                /* Items Table */
                .items-section {
                  margin-bottom: 30px;
                }
                .section-title {
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 1.5px;
                  color: #64748b;
                  font-weight: 600;
                  margin-bottom: 15px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                .section-title::after {
                  content: '';
                  flex: 1;
                  height: 1px;
                  background: #e2e8f0;
                }
                .items-table {
                  width: 100%;
                  border-collapse: separate;
                  border-spacing: 0;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                  border: 1px solid #e2e8f0;
                }
                .items-table thead tr {
                  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                }
                .items-table th {
                  color: white;
                  padding: 16px 20px;
                  text-align: ${dir === 'rtl' ? 'right' : 'left'};
                  font-weight: 600;
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .items-table th:last-child {
                  text-align: ${dir === 'rtl' ? 'left' : 'right'};
                }
                .items-table td {
                  padding: 20px;
                  background: white;
                  font-size: 13px;
                  border-bottom: 1px solid #f1f5f9;
                }
                .items-table tr:last-child td {
                  border-bottom: none;
                }
                .item-name {
                  font-weight: 700;
                  color: #1e293b;
                  font-size: 14px;
                  margin-bottom: 4px;
                }
                .item-details {
                  font-size: 11px;
                  color: #94a3b8;
                }
                .amount-cell {
                  text-align: ${dir === 'rtl' ? 'left' : 'right'};
                  font-weight: 800;
                  font-size: 16px;
                  color: #0d9488;
                }
                
                /* Totals Section */
                .totals-wrapper {
                  display: flex;
                  justify-content: ${dir === 'rtl' ? 'flex-start' : 'flex-end'};
                  margin-bottom: 30px;
                }
                .totals-card {
                  width: 320px;
                  background: #fafafa;
                  border-radius: 16px;
                  overflow: hidden;
                  border: 1px solid #e2e8f0;
                }
                .totals-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 14px 20px;
                  border-bottom: 1px dashed #e2e8f0;
                }
                .totals-row:last-of-type {
                  border-bottom: none;
                }
                .totals-label {
                  color: #64748b;
                  font-size: 13px;
                }
                .totals-value {
                  font-weight: 600;
                  color: #1e293b;
                }
                .grand-total-row {
                  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                  padding: 20px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .grand-total-label {
                  color: rgba(255,255,255,0.9);
                  font-size: 14px;
                  font-weight: 600;
                }
                .grand-total-value {
                  color: white;
                  font-size: 24px;
                  font-weight: 800;
                }
                
                /* Notes */
                .notes-section {
                  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                  border: 1px solid #fde68a;
                  border-radius: 16px;
                  padding: 20px;
                  margin-bottom: 30px;
                }
                .notes-title {
                  color: #b45309;
                  font-weight: 700;
                  margin-bottom: 8px;
                  font-size: 13px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                }
                .notes-content {
                  color: #92400e;
                  font-size: 12px;
                  line-height: 1.8;
                }
                
                /* Footer */
                .footer {
                  background: #f8fafc;
                  padding: 30px 40px;
                  text-align: center;
                  border-top: 2px solid #e2e8f0;
                }
                .footer-thanks {
                  color: #0d9488;
                  font-size: 18px;
                  font-weight: 700;
                  margin-bottom: 8px;
                }
                .footer-info {
                  color: #94a3b8;
                  font-size: 12px;
                }
                .footer-divider {
                  width: 60px;
                  height: 3px;
                  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                  margin: 15px auto;
                  border-radius: 2px;
                }
                
                @media print {
                  body { padding: 0; }
                  .invoice-wrapper { padding: 0; }
                  @page { margin: 0.5cm; size: A4; }
                }
              </style>
            </head>
            <body>
              <div class="invoice-wrapper">
                <!-- Header -->
                <div class="header">
                  <div class="header-content">
                    <div class="company-info">
                      <h1>${t('appName')}</h1>
                      <p>${t('companyDescription')}</p>
                    </div>
                    <div class="invoice-badge">
                      <div class="invoice-label">${dir === 'rtl' ? 'فاتورة رقم' : 'INVOICE NO.'}</div>
                      <div class="invoice-number-display">${invoice?.invoice_number}</div>
                    </div>
                  </div>
                </div>
                
                <!-- Body -->
                <div class="body-content">
                  <!-- Meta Row -->
                  <div class="meta-row">
                    <div class="meta-item">
                      <div class="meta-icon">📅</div>
                      <div class="meta-text">
                        <span>${dir === 'rtl' ? 'تاريخ الإصدار' : 'Issue Date'}</span>
                        <strong>${format(new Date(invoice?.created_at || new Date()), 'dd/MM/yyyy')}</strong>
                      </div>
                    </div>
                    <div class="meta-item">
                      <div class="meta-icon">📆</div>
                      <div class="meta-text">
                        <span>${dir === 'rtl' ? 'تاريخ الاستحقاق' : 'Due Date'}</span>
                        <strong>${invoice?.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : (dir === 'rtl' ? 'عند الاستلام' : 'On Receipt')}</strong>
                      </div>
                    </div>
                    <div class="meta-item">
                      <span class="status-badge ${invoice?.status === 'paid' ? 'status-paid' : 'status-pending'}">
                        ${invoice?.status === 'paid' ? '✓' : '⏳'}
                        ${invoice?.status === 'paid' ? (dir === 'rtl' ? 'مدفوعة' : 'PAID') : (dir === 'rtl' ? 'غير مدفوعة' : 'UNPAID')}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Two Columns -->
                  <div class="two-columns">
                    <div class="info-card">
                      <div class="info-card-header">
                        <div class="info-card-icon">👤</div>
                        <div class="info-card-title">${dir === 'rtl' ? 'فاتورة إلى' : 'BILL TO'}</div>
                      </div>
                      <div class="info-row">
                        <span class="info-row-label">${dir === 'rtl' ? 'الاسم:' : 'Name:'}</span>
                        <span class="info-row-value">${invoice?.customers?.name || '-'}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-row-label">${dir === 'rtl' ? 'الهاتف:' : 'Phone:'}</span>
                        <span class="info-row-value" dir="ltr">${invoice?.customers?.phone || '-'}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-row-label">${dir === 'rtl' ? 'المدينة:' : 'City:'}</span>
                        <span class="info-row-value">${invoice?.customers?.city || '-'}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-row-label">${dir === 'rtl' ? 'العنوان:' : 'Address:'}</span>
                        <span class="info-row-value">${invoice?.customers?.address || '-'}</span>
                      </div>
                    </div>
                    
                    <div class="info-card">
                      <div class="info-card-header">
                        <div class="info-card-icon">🏢</div>
                        <div class="info-card-title">${dir === 'rtl' ? 'فاتورة من' : 'BILL FROM'}</div>
                      </div>
                      <div class="info-row">
                        <span class="info-row-label">${dir === 'rtl' ? 'الشركة:' : 'Company:'}</span>
                        <span class="info-row-value">${t('appName')}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-row-label">${dir === 'rtl' ? 'النشاط:' : 'Business:'}</span>
                        <span class="info-row-value">${t('companyDescription')}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-row-label">${dir === 'rtl' ? 'رقم الفاتورة:' : 'Invoice #:'}</span>
                        <span class="info-row-value">${invoice?.invoice_number}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Items -->
                  <div class="items-section">
                    <div class="section-title">${dir === 'rtl' ? 'تفاصيل الخدمات' : 'SERVICE DETAILS'}</div>
                    <table class="items-table">
                      <thead>
                        <tr>
                          <th style="width: 50px;">#</th>
                          <th>${dir === 'rtl' ? 'الخدمة' : 'Service'}</th>
                          <th style="width: 130px;">${dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                          <th style="width: 140px;">${dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style="text-align: center; color: #94a3b8;">01</td>
                          <td>
                            <div class="item-name">${dir === 'rtl' ? (invoice?.appointments?.services?.name_ar || 'خدمة تنظيف') : (invoice?.appointments?.services?.name_en || 'Cleaning Service')}</div>
                            <div class="item-details">
                              ${invoice?.appointments?.scheduled_date ? `${dir === 'rtl' ? 'تاريخ الخدمة:' : 'Service date:'} ${invoice?.appointments?.scheduled_date}` : ''}
                            </div>
                          </td>
                          <td style="color: #64748b;">${invoice?.appointments?.scheduled_date || format(new Date(invoice?.created_at || new Date()), 'dd/MM/yyyy')}</td>
                          <td class="amount-cell">${Number(invoice?.amount).toLocaleString()} ${t('currency')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <!-- Totals -->
                  <div class="totals-wrapper">
                    <div class="totals-card">
                      <div class="totals-row">
                        <span class="totals-label">${dir === 'rtl' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span class="totals-value">${Number(invoice?.amount).toLocaleString()} ${t('currency')}</span>
                      </div>
                      <div class="totals-row">
                        <span class="totals-label">${dir === 'rtl' ? 'ضريبة القيمة المضافة (0%)' : 'VAT (0%)'}</span>
                        <span class="totals-value">0 ${t('currency')}</span>
                      </div>
                      <div class="totals-row">
                        <span class="totals-label">${dir === 'rtl' ? 'الخصم' : 'Discount'}</span>
                        <span class="totals-value">0 ${t('currency')}</span>
                      </div>
                      <div class="grand-total-row">
                        <span class="grand-total-label">${dir === 'rtl' ? 'الإجمالي المستحق' : 'TOTAL DUE'}</span>
                        <span class="grand-total-value">${Number(invoice?.amount).toLocaleString()} ${t('currency')}</span>
                      </div>
                    </div>
                  </div>
                  
                  ${invoice?.notes ? `
                  <div class="notes-section">
                    <div class="notes-title">📝 ${dir === 'rtl' ? 'ملاحظات' : 'Notes'}</div>
                    <div class="notes-content">${invoice.notes}</div>
                  </div>` : ''}
                </div>
                
                <!-- Footer -->
                <div class="footer">
                  <div class="footer-thanks">${dir === 'rtl' ? '🙏 شكراً لثقتكم بنا' : '🙏 Thank you for your business'}</div>
                  <div class="footer-divider"></div>
                  <div class="footer-info">
                    ${t('appName')} &copy; ${new Date().getFullYear()} - ${dir === 'rtl' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
                  </div>
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
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {dir === 'rtl' ? 'معاينة الفاتورة' : 'Invoice Preview'}
          </DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              {dir === 'rtl' ? 'طباعة' : 'Print'}
            </Button>
          </div>
        </div>
        
        <div className="p-4 md:p-6 bg-muted/30">
          <div id="invoice-print-content" className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-[800px] mx-auto border">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 text-white p-8 relative overflow-hidden">
              <div className="absolute top-0 end-0 w-1/2 h-full bg-white/5 transform skew-x-12 translate-x-20"></div>
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('appName')}</h1>
                  <p className="opacity-90 text-sm mt-1">{t('companyDescription')}</p>
                </div>
                <div className={`text-${dir === 'rtl' ? 'start' : 'end'}`}>
                  <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                    {dir === 'rtl' ? 'فاتورة رقم' : 'INVOICE NO.'}
                  </p>
                  <p className="text-2xl md:text-3xl font-extrabold tracking-wide">{invoice.invoice_number}</p>
                </div>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 md:p-8">
              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-4 md:gap-8 pb-6 mb-6 border-b-2 border-muted">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {dir === 'rtl' ? 'تاريخ الإصدار' : 'Issue Date'}
                    </p>
                    <p className="font-semibold">{format(new Date(invoice.created_at), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {dir === 'rtl' ? 'رقم الفاتورة' : 'Invoice #'}
                    </p>
                    <p className="font-semibold">{invoice.invoice_number}</p>
                  </div>
                </div>
                <div className="ms-auto">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    invoice.status === 'paid' 
                      ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' 
                      : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                  }`}>
                    <StatusIcon className="w-4 h-4" />
                    {invoice.status === 'paid' ? (dir === 'rtl' ? 'مدفوعة' : 'Paid') : (dir === 'rtl' ? 'غير مدفوعة' : 'Unpaid')}
                  </span>
                </div>
              </div>

              {/* Two Column Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Bill To */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-dashed border-slate-300">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                      {dir === 'rtl' ? 'فاتورة إلى' : 'BILL TO'}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-lg font-bold text-slate-800">{invoice.customers?.name || '-'}</p>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-teal-600" />
                      <span dir="ltr">{invoice.customers?.phone || '-'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-teal-600 mt-0.5" />
                      <span>{invoice.customers?.city}, {invoice.customers?.address || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Bill From */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-dashed border-slate-300">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                      {dir === 'rtl' ? 'فاتورة من' : 'BILL FROM'}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-lg font-bold text-slate-800">{t('appName')}</p>
                    <p className="text-slate-600">{t('companyDescription')}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4 flex items-center gap-2">
                  {dir === 'rtl' ? 'تفاصيل الخدمات' : 'SERVICE DETAILS'}
                  <div className="flex-1 h-px bg-slate-200"></div>
                </h3>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                        <th className="p-4 text-start font-semibold text-xs uppercase tracking-wide w-14">#</th>
                        <th className="p-4 text-start font-semibold text-xs uppercase tracking-wide">{dir === 'rtl' ? 'الخدمة' : 'Service'}</th>
                        <th className="p-4 text-start font-semibold text-xs uppercase tracking-wide w-28">{dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                        <th className="p-4 text-end font-semibold text-xs uppercase tracking-wide w-36">{dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="p-5 text-center text-slate-400 font-medium">01</td>
                        <td className="p-5">
                          <p className="font-bold text-slate-800 text-[15px]">
                            {dir === 'rtl' ? (invoice.appointments?.services?.name_ar || 'خدمة تنظيف') : (invoice.appointments?.services?.name_en || 'Cleaning Service')}
                          </p>
                          {invoice.appointments?.scheduled_date && (
                            <p className="text-xs text-slate-500 mt-1">
                              {dir === 'rtl' ? 'تاريخ الخدمة:' : 'Service date:'} {invoice.appointments.scheduled_date}
                            </p>
                          )}
                        </td>
                        <td className="p-5 text-slate-500">
                          {invoice.appointments?.scheduled_date || format(new Date(invoice.created_at), 'dd/MM/yyyy')}
                        </td>
                        <td className="p-5 text-end font-extrabold text-lg text-teal-600">
                          {Number(invoice.amount).toLocaleString()} {t('currency')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'} mb-8`}>
                <div className="w-full sm:w-80 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{dir === 'rtl' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span className="font-semibold">{Number(invoice.amount).toLocaleString()} {t('currency')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{dir === 'rtl' ? 'ضريبة (0%)' : 'Tax (0%)'}</span>
                      <span className="font-semibold">0 {t('currency')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{dir === 'rtl' ? 'الخصم' : 'Discount'}</span>
                      <span className="font-semibold">0 {t('currency')}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{dir === 'rtl' ? 'الإجمالي المستحق' : 'TOTAL DUE'}</span>
                      <span className="text-2xl font-extrabold">{Number(invoice.amount).toLocaleString()} {t('currency')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 mb-6">
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm">
                    📝 {dir === 'rtl' ? 'ملاحظات' : 'Notes'}
                  </h4>
                  <p className="text-amber-700 text-sm leading-relaxed">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 text-center py-8 px-6 border-t-2 border-slate-100">
              <p className="text-teal-600 font-bold text-lg mb-2">
                🙏 {dir === 'rtl' ? 'شكراً لثقتكم بنا' : 'Thank you for your business'}
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-teal-500 to-teal-600 mx-auto rounded-full mb-3"></div>
              <p className="text-slate-400 text-sm">
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