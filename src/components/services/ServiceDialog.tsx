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
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { Service, useCreateService, useUpdateService } from '@/hooks/useServices';

const serviceSchema = z.object({
  name_ar: z.string().min(2, 'الاسم بالعربية مطلوب'),
  name_en: z.string().min(2, 'الاسم بالإنجليزية مطلوب'),
  description_ar: z.string().optional(),
  description_en: z.string().optional(),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من صفر'),
  duration: z.string().optional(),
  color: z.string().default('#2d8a5f'),
  is_active: z.boolean().default(true),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
}

const colorOptions = [
  '#2d8a5f', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', 
  '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#f97316'
];

const ServiceDialog: React.FC<ServiceDialogProps> = ({ open, onOpenChange, service }) => {
  const { dir } = useLanguage();
  const createService = useCreateService();
  const updateService = useUpdateService();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name_ar: service?.name_ar || '',
      name_en: service?.name_en || '',
      description_ar: service?.description_ar || '',
      description_en: service?.description_en || '',
      price: service?.price || 0,
      duration: service?.duration || '',
      color: service?.color || '#2d8a5f',
      is_active: service?.is_active ?? true,
    },
  });

  React.useEffect(() => {
    if (service) {
      form.reset({
        name_ar: service.name_ar,
        name_en: service.name_en,
        description_ar: service.description_ar || '',
        description_en: service.description_en || '',
        price: service.price,
        duration: service.duration || '',
        color: service.color || '#2d8a5f',
        is_active: service.is_active ?? true,
      });
    } else {
      form.reset({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        price: 0,
        duration: '',
        color: '#2d8a5f',
        is_active: true,
      });
    }
  }, [service, form]);

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      const serviceData = {
        name_ar: values.name_ar,
        name_en: values.name_en,
        description_ar: values.description_ar || null,
        description_en: values.description_en || null,
        price: values.price,
        duration: values.duration || null,
        color: values.color,
        is_active: values.is_active,
      };
      
      if (service) {
        await updateService.mutateAsync({ id: service.id, ...serviceData });
      } else {
        await createService.mutateAsync(serviceData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const isLoading = createService.isPending || updateService.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle>
            {service ? (dir === 'rtl' ? 'تعديل الخدمة' : 'Edit Service') : (dir === 'rtl' ? 'إضافة خدمة جديدة' : 'Add New Service')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'الاسم بالعربية' : 'Arabic Name'}</FormLabel>
                  <FormControl>
                    <Input placeholder="مكافحة الحشرات" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'الاسم بالإنجليزية' : 'English Name'}</FormLabel>
                  <FormControl>
                    <Input placeholder="Pest Control" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'الوصف بالعربية' : 'Arabic Description'}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={dir === 'rtl' ? 'وصف الخدمة...' : 'Service description...'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'الوصف بالإنجليزية' : 'English Description'}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Service description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dir === 'rtl' ? 'السعر (ر.س)' : 'Price (SAR)'}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dir === 'rtl' ? 'المدة' : 'Duration'}</FormLabel>
                    <FormControl>
                      <Input placeholder={dir === 'rtl' ? '2-3 ساعات' : '2-3 hours'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'اللون' : 'Color'}</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          field.value === color ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="cursor-pointer">
                    {dir === 'rtl' ? 'الخدمة نشطة' : 'Service Active'}
                  </FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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

export default ServiceDialog;
