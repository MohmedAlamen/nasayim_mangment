import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateExpense, useUpdateExpense, Expense } from '@/hooks/useExpenses';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  description: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'المبلغ مطلوب'),
  category: z.string().min(1, 'الفئة مطلوبة'),
  expense_date: z.string().min(1, 'التاريخ مطلوب'),
  receipt_url: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

const categories = [
  { value: 'materials', labelAr: 'مواد ومستلزمات', labelEn: 'Materials & Supplies' },
  { value: 'fuel', labelAr: 'وقود ومواصلات', labelEn: 'Fuel & Transportation' },
  { value: 'salaries', labelAr: 'رواتب وأجور', labelEn: 'Salaries & Wages' },
  { value: 'rent', labelAr: 'إيجار', labelEn: 'Rent' },
  { value: 'utilities', labelAr: 'فواتير خدمات', labelEn: 'Utilities' },
  { value: 'maintenance', labelAr: 'صيانة', labelEn: 'Maintenance' },
  { value: 'marketing', labelAr: 'تسويق وإعلان', labelEn: 'Marketing & Advertising' },
  { value: 'equipment', labelAr: 'معدات وأجهزة', labelEn: 'Equipment' },
  { value: 'general', labelAr: 'مصروفات عامة', labelEn: 'General Expenses' },
];

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({ open, onOpenChange, expense }) => {
  const { dir } = useLanguage();
  const { toast } = useToast();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const isEditing = !!expense;
  
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      category: 'general',
      expense_date: format(new Date(), 'yyyy-MM-dd'),
      receipt_url: null,
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        title: expense.title,
        description: expense.description || '',
        amount: expense.amount,
        category: expense.category,
        expense_date: expense.expense_date,
        receipt_url: expense.receipt_url,
      });
      setReceiptUrl(expense.receipt_url);
    } else {
      form.reset({
        title: '',
        description: '',
        amount: 0,
        category: 'general',
        expense_date: format(new Date(), 'yyyy-MM-dd'),
        receipt_url: null,
      });
      setReceiptUrl(null);
    }
  }, [expense, form, open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `receipts/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);

      setReceiptUrl(publicUrl);
      form.setValue('receipt_url', publicUrl);
      toast({
        title: dir === 'rtl' ? 'تم بنجاح' : 'Success',
        description: dir === 'rtl' ? 'تم رفع الإيصال' : 'Receipt uploaded',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: error.message,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptUrl(null);
    form.setValue('receipt_url', null);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const expenseData = {
        title: values.title,
        amount: values.amount,
        category: values.category,
        expense_date: values.expense_date,
        description: values.description || null,
        receipt_url: receiptUrl,
      };

      if (isEditing && expense) {
        await updateExpense.mutateAsync({ id: expense.id, ...expenseData });
      } else {
        await createExpense.mutateAsync(expenseData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={dir}>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? (dir === 'rtl' ? 'تعديل المصروف' : 'Edit Expense')
              : (dir === 'rtl' ? 'إضافة مصروف جديد' : 'Add New Expense')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'العنوان' : 'Title'}</FormLabel>
                  <FormControl>
                    <Input placeholder={dir === 'rtl' ? 'وصف المصروف' : 'Expense description'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dir === 'rtl' ? 'المبلغ' : 'Amount'}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dir === 'rtl' ? 'التاريخ' : 'Date'}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'الفئة' : 'Category'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={dir === 'rtl' ? 'اختر الفئة' : 'Select category'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {dir === 'rtl' ? cat.labelAr : cat.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'ملاحظات' : 'Notes'}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={dir === 'rtl' ? 'تفاصيل إضافية (اختياري)' : 'Additional details (optional)'}
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Receipt Upload */}
            <div className="space-y-2">
              <FormLabel>{dir === 'rtl' ? 'إيصال المصروف' : 'Expense Receipt'}</FormLabel>
              {receiptUrl ? (
                <div className="relative group">
                  <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted">
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(receiptUrl) ? (
                      <img src={receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileImage className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground ms-2">
                          {dir === 'rtl' ? 'ملف مرفق' : 'File attached'}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 end-2 h-7 w-7"
                    onClick={handleRemoveReceipt}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {dir === 'rtl' ? 'اضغط لرفع الإيصال' : 'Click to upload receipt'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={createExpense.isPending || updateExpense.isPending}>
                {isEditing
                  ? (dir === 'rtl' ? 'حفظ التعديلات' : 'Save Changes')
                  : (dir === 'rtl' ? 'إضافة المصروف' : 'Add Expense')}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
