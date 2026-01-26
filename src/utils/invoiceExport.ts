import { InvoiceWithRelations } from '@/hooks/useInvoices';
import { format } from 'date-fns';

// Export invoices to CSV
export const exportInvoicesToCSV = (invoices: InvoiceWithRelations[], dir: string) => {
  const headers = dir === 'rtl' 
    ? ['رقم الفاتورة', 'العميل', 'المبلغ', 'الحالة', 'تاريخ الإنشاء', 'تاريخ الاستحقاق', 'ملاحظات']
    : ['Invoice Number', 'Customer', 'Amount', 'Status', 'Created Date', 'Due Date', 'Notes'];

  const rows = invoices.map(inv => [
    inv.invoice_number,
    inv.customers?.name || '',
    inv.amount.toString(),
    inv.status || 'pending',
    format(new Date(inv.created_at), 'yyyy-MM-dd'),
    inv.due_date ? format(new Date(inv.due_date), 'yyyy-MM-dd') : '',
    inv.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Add BOM for proper Arabic encoding
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `invoices-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
};

// Export invoices to JSON
export const exportInvoicesToJSON = (invoices: InvoiceWithRelations[]) => {
  const data = invoices.map(inv => ({
    invoice_number: inv.invoice_number,
    customer_name: inv.customers?.name || '',
    customer_phone: inv.customers?.phone || '',
    amount: inv.amount,
    status: inv.status,
    created_at: inv.created_at,
    due_date: inv.due_date,
    paid_at: inv.paid_at,
    notes: inv.notes
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `invoices-${format(new Date(), 'yyyy-MM-dd')}.json`;
  link.click();
};

// Parse CSV for import
export const parseCSVForImport = (csvText: string): Array<{
  customer_name: string;
  amount: number;
  status: string;
  due_date: string | null;
  notes: string | null;
}> => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Skip header row
  const dataRows = lines.slice(1);
  
  return dataRows.map(row => {
    const cells = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const cleanCells = cells.map(c => c.replace(/^"|"$/g, '').trim());
    
    return {
      customer_name: cleanCells[1] || '',
      amount: parseFloat(cleanCells[2]) || 0,
      status: cleanCells[3] || 'pending',
      due_date: cleanCells[5] || null,
      notes: cleanCells[6] || null
    };
  });
};
