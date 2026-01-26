import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Customer, useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import FileUpload from '@/components/shared/FileUpload';

const customerSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  city: z.string().min(2, 'المدينة مطلوبة'),
  address: z.string().min(5, 'العنوان مطلوب'),
  status: z.string().default('active'),
  notes: z.string().optional(),
  attachments: z.array(z.string()).default([]),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({ open, onOpenChange, customer }) => {
  const { t, dir } = useLanguage();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      city: customer?.city || '',
      address: customer?.address || '',
      status: customer?.status || 'active',
      notes: customer?.notes || '',
      attachments: (customer?.attachments as string[]) || [],
    },
  });

  React.useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        city: customer.city,
        address: customer.address,
        status: customer.status || 'active',
        notes: customer.notes || '',
        attachments: (customer.attachments as string[]) || [],
      });
    } else {
      form.reset({
        name: '',
        phone: '',
        email: '',
        city: '',
        address: '',
        status: 'active',
        notes: '',
        attachments: [],
      });
    }
  }, [customer, form]);

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      const customerData = {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        city: values.city,
        address: values.address,
        status: values.status,
        notes: values.notes || null,
        attachments: values.attachments,
      };
      
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, ...customerData });
      } else {
        await createCustomer.mutateAsync(customerData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const isLoading = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={dir}>
        <DialogHeader>
          <DialogTitle>
            {customer ? (dir === 'rtl' ? 'تعديل العميل' : 'Edit Customer') : (dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Customer')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'الاسم' : 'Name'}</FormLabel>
                  <FormControl>
                    <Input placeholder={dir === 'rtl' ? 'أدخل اسم العميل' : 'Enter customer name'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'رقم الهاتف' : 'Phone'}</FormLabel>
                  <FormControl>
                    <Input placeholder="05xxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'المدينة' : 'City'}</FormLabel>
                  <FormControl>
                    <Input placeholder={dir === 'rtl' ? 'أدخل المدينة' : 'Enter city'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'العنوان' : 'Address'}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={dir === 'rtl' ? 'أدخل العنوان التفصيلي' : 'Enter detailed address'} {...field} />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</SelectItem>
                      <SelectItem value="inactive">{dir === 'rtl' ? 'غير نشط' : 'Inactive'}</SelectItem>
                      <SelectItem value="vip">{dir === 'rtl' ? 'VIP' : 'VIP'}</SelectItem>
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
                  <FormControl>
                    <Textarea placeholder={dir === 'rtl' ? 'ملاحظات إضافية...' : 'Additional notes...'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'المرفقات' : 'Attachments'}</FormLabel>
                  <FormControl>
                    <FileUpload
                      folder="customers"
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...') : (dir === 'rtl' ? 'حفظ' : 'Save')}
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

export default CustomerDialog;
