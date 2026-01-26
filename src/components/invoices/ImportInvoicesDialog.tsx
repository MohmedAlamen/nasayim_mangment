import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSVForImport } from '@/utils/invoiceExport';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';

interface ImportInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportInvoicesDialog: React.FC<ImportInvoicesDialogProps> = ({ open, onOpenChange }) => {
  const { dir } = useLanguage();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  const { data: customers } = useCustomers();
  const createInvoice = useCreateInvoice();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResults(null);

    const text = await selectedFile.text();
    const parsed = parseCSVForImport(text);
    setPreview(parsed.slice(0, 5)); // Preview first 5 rows
  };

  const handleImport = async () => {
    if (!file || !customers) return;

    setImporting(true);
    const text = await file.text();
    const rows = parseCSVForImport(text);

    let success = 0;
    let failed = 0;

    for (const row of rows) {
      // Find customer by name
      const customer = customers.find(c => 
        c.name.toLowerCase().includes(row.customer_name.toLowerCase()) ||
        row.customer_name.toLowerCase().includes(c.name.toLowerCase())
      );

      if (!customer || row.amount <= 0) {
        failed++;
        continue;
      }

      try {
        await createInvoice.mutateAsync({
          customer_id: customer.id,
          amount: row.amount,
          status: row.status,
          due_date: row.due_date,
          notes: row.notes
        });
        success++;
      } catch {
        failed++;
      }
    }

    setResults({ success, failed });
    setImporting(false);

    if (success > 0) {
      toast({
        title: dir === 'rtl' ? 'تم الاستيراد' : 'Import Complete',
        description: dir === 'rtl' 
          ? `تم استيراد ${success} فاتورة بنجاح` 
          : `Successfully imported ${success} invoices`,
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" dir={dir}>
        <DialogHeader>
          <DialogTitle>
            {dir === 'rtl' ? 'استيراد الفواتير' : 'Import Invoices'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                <span className="font-medium">{file.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {dir === 'rtl' ? 'اختر ملف CSV للاستيراد' : 'Select a CSV file to import'}
                </p>
              </>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && !results && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">
                {dir === 'rtl' ? 'معاينة البيانات:' : 'Data Preview:'}
              </p>
              <div className="space-y-1 text-sm">
                {preview.map((row, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{row.customer_name}</span>
                    <span className="font-medium">{row.amount} ر.س</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-2">
              {results.success > 0 && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span>{dir === 'rtl' ? `تم استيراد ${results.success} فاتورة` : `${results.success} invoices imported`}</span>
                </div>
              )}
              {results.failed > 0 && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <span>{dir === 'rtl' ? `فشل استيراد ${results.failed} فاتورة` : `${results.failed} invoices failed`}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          {!results && (
            <Button onClick={handleImport} disabled={!file || importing}>
              {importing && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {dir === 'rtl' ? 'استيراد' : 'Import'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportInvoicesDialog;
