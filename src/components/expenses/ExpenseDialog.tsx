import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateExpense, useUpdateExpense, Expense } from '@/hooks/useExpenses';

const formSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  description: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'المبلغ مطلوب'),
  category: z.string().min(1, 'الفئة مطلوبة'),
  expense_date: z.string().min(1, 'التاريخ مطلوب'),
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
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const isEditing = !!expense;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      category: 'general',
      expense_date: format(new Date(), 'yyyy-MM-dd'),
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
      });
    } else {
      form.reset({
        title: '',
        description: '',
        amount: 0,
        category: 'general',
        expense_date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [expense, form, open]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && expense) {
        await updateExpense.mutateAsync({ id: expense.id, ...values });
      } else {
        await createExpense.mutateAsync({
          title: values.title,
          amount: values.amount,
          category: values.category,
          expense_date: values.expense_date,
          description: values.description || null,
        });
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
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
