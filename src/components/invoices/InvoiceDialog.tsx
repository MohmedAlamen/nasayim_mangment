import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useAppointments } from '@/hooks/useAppointments';
import { Invoice, useCreateInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { useAuth } from '@/contexts/AuthContext';

const invoiceSchema = z.object({
  customer_id: z.string().min(1, 'العميل مطلوب'),
  appointment_id: z.string().optional(),
  amount: z.number().min(1, 'المبلغ مطلوب'),
  due_date: z.date().optional(),
  status: z.string().default('pending'),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  preselectedCustomerId?: string;
  preselectedAppointmentId?: string;
}

const InvoiceDialog: React.FC<InvoiceDialogProps> = ({ 
  open, 
  onOpenChange, 
  invoice, 
  preselectedCustomerId,
  preselectedAppointmentId 
}) => {
  const { dir } = useLanguage();
  const { user } = useAuth();
  const { data: customers } = useCustomers();
  const { data: appointments } = useAppointments();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: invoice?.customer_id || preselectedCustomerId || '',
      appointment_id: invoice?.appointment_id || preselectedAppointmentId || '',
      amount: invoice?.amount || 0,
      due_date: invoice?.due_date ? new Date(invoice.due_date) : addDays(new Date(), 7),
      status: invoice?.status || 'pending',
      notes: invoice?.notes || '',
    },
  });

  React.useEffect(() => {
    if (invoice) {
      form.reset({
        customer_id: invoice.customer_id,
        appointment_id: invoice.appointment_id || '',
        amount: invoice.amount,
        due_date: invoice.due_date ? new Date(invoice.due_date) : undefined,
        status: invoice.status || 'pending',
        notes: invoice.notes || '',
      });
    } else {
      form.reset({
        customer_id: preselectedCustomerId || '',
        appointment_id: preselectedAppointmentId || '',
        amount: 0,
        due_date: addDays(new Date(), 7),
        status: 'pending',
        notes: '',
      });
    }
  }, [invoice, preselectedCustomerId, preselectedAppointmentId, form]);

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      const invoiceData = {
        customer_id: values.customer_id,
        appointment_id: values.appointment_id || null,
        amount: values.amount,
        due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
        status: values.status,
        notes: values.notes || null,
        created_by: user?.id || null,
      };

      if (invoice) {
        await updateInvoice.mutateAsync({ id: invoice.id, ...invoiceData });
      } else {
        await createInvoice.mutateAsync(invoiceData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const isLoading = createInvoice.isPending || updateInvoice.isPending;

  // Filter appointments by selected customer
  const selectedCustomerId = form.watch('customer_id');
  const filteredAppointments = appointments?.filter(a => a.customer_id === selectedCustomerId) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle>
            {invoice ? (dir === 'rtl' ? 'تعديل الفاتورة' : 'Edit Invoice') : (dir === 'rtl' ? 'إنشاء فاتورة جديدة' : 'Create Invoice')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'العميل' : 'Customer'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={dir === 'rtl' ? 'اختر العميل' : 'Select customer'} /></SelectTrigger></FormControl>
                    <SelectContent>
                      {customers?.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'الموعد (اختياري)' : 'Appointment (optional)'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={dir === 'rtl' ? 'ربط بموعد' : 'Link to appointment'} /></SelectTrigger></FormControl>
                    <SelectContent>
                      {filteredAppointments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.scheduled_date} - {a.scheduled_time.substring(0, 5)}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'المبلغ (ر.س)' : 'Amount (SAR)'}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{dir === 'rtl' ? 'تاريخ الاستحقاق' : 'Due Date'}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : (dir === 'rtl' ? 'اختر التاريخ' : 'Pick a date')}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'الحالة' : 'Status'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="pending">{dir === 'rtl' ? 'معلقة' : 'Pending'}</SelectItem>
                      <SelectItem value="paid">{dir === 'rtl' ? 'مدفوعة' : 'Paid'}</SelectItem>
                      <SelectItem value="overdue">{dir === 'rtl' ? 'متأخرة' : 'Overdue'}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'ملاحظات' : 'Notes'}</FormLabel>
                  <FormControl><Textarea placeholder={dir === 'rtl' ? 'ملاحظات...' : 'Notes...'} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...') : (dir === 'rtl' ? 'حفظ' : 'Save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{dir === 'rtl' ? 'إلغاء' : 'Cancel'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;
