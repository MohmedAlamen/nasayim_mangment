import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Camera } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useServices } from '@/hooks/useServices';
import { useEmployees } from '@/hooks/useEmployees';
import { Appointment, useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments';
import ServicePhotos from './ServicePhotos';

interface Photo {
  url: string;
  type: 'before' | 'after';
  uploaded_at: string;
}

const appointmentSchema = z.object({
  customer_id: z.string().min(1, 'العميل مطلوب'),
  service_id: z.string().optional(),
  employee_id: z.string().optional(),
  scheduled_date: z.date({ required_error: 'التاريخ مطلوب' }),
  scheduled_time: z.string().min(1, 'الوقت مطلوب'),
  status: z.string().default('pending'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({ open, onOpenChange, appointment }) => {
  const { dir } = useLanguage();
  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { data: employees } = useEmployees();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeTab, setActiveTab] = useState('details');

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customer_id: appointment?.customer_id || '',
      service_id: appointment?.service_id || '',
      employee_id: appointment?.employee_id || '',
      scheduled_date: appointment?.scheduled_date ? new Date(appointment.scheduled_date) : undefined,
      scheduled_time: appointment?.scheduled_time || '',
      status: appointment?.status || 'pending',
      notes: appointment?.notes || '',
    },
  });

  React.useEffect(() => {
    if (appointment) {
      form.reset({
        customer_id: appointment.customer_id,
        service_id: appointment.service_id || '',
        employee_id: appointment.employee_id || '',
        scheduled_date: new Date(appointment.scheduled_date),
        scheduled_time: appointment.scheduled_time,
        status: appointment.status || 'pending',
        notes: appointment.notes || '',
      });
      // Load existing photos from appointment
      const existingPhotos = (appointment as any).photos;
      if (existingPhotos && Array.isArray(existingPhotos)) {
        setPhotos(existingPhotos);
      } else {
        setPhotos([]);
      }
    } else {
      form.reset({
        customer_id: '',
        service_id: '',
        employee_id: '',
        scheduled_date: undefined,
        scheduled_time: '',
        status: 'pending',
        notes: '',
      });
      setPhotos([]);
    }
    setActiveTab('details');
  }, [appointment, form, open]);

  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      const appointmentData: any = {
        customer_id: values.customer_id,
        service_id: values.service_id || null,
        employee_id: values.employee_id || null,
        scheduled_date: format(values.scheduled_date, 'yyyy-MM-dd'),
        scheduled_time: values.scheduled_time,
        status: values.status,
        notes: values.notes || null,
        photos: photos.length > 0 ? JSON.parse(JSON.stringify(photos)) : null,
      };

      if (appointment) {
        await updateAppointment.mutateAsync({ id: appointment.id, ...appointmentData });
      } else {
        await createAppointment.mutateAsync(appointmentData);
      }
      onOpenChange(false);
      form.reset();
      setPhotos([]);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const isLoading = createAppointment.isPending || updateAppointment.isPending;

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle>
            {appointment ? (dir === 'rtl' ? 'تعديل الموعد' : 'Edit Appointment') : (dir === 'rtl' ? 'حجز موعد جديد' : 'New Appointment')}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">
              {dir === 'rtl' ? 'تفاصيل الموعد' : 'Details'}
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-2">
              <Camera className="w-4 h-4" />
              {dir === 'rtl' ? 'الصور' : 'Photos'}
              {photos.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 rounded-full">
                  {photos.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <TabsContent value="details" className="space-y-4 mt-0">
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dir === 'rtl' ? 'العميل' : 'Customer'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={dir === 'rtl' ? 'اختر العميل' : 'Select customer'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
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
                  name="service_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dir === 'rtl' ? 'الخدمة' : 'Service'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={dir === 'rtl' ? 'اختر الخدمة' : 'Select service'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services?.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {dir === 'rtl' ? service.name_ar : service.name_en}
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
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dir === 'rtl' ? 'الموظف المكلف' : 'Assigned Employee'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={dir === 'rtl' ? 'اختر الموظف' : 'Select employee'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees?.filter(e => e.status === 'available').map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} - {employee.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduled_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{dir === 'rtl' ? 'التاريخ' : 'Date'}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="me-2 h-4 w-4" />
                                {field.value ? format(field.value, "dd/MM/yyyy") : (dir === 'rtl' ? 'اختر' : 'Pick')}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scheduled_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{dir === 'rtl' ? 'الوقت' : 'Time'}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={dir === 'rtl' ? 'اختر' : 'Select'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-48">
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dir === 'rtl' ? 'الحالة' : 'Status'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">{dir === 'rtl' ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                          <SelectItem value="confirmed">{dir === 'rtl' ? 'مؤكد' : 'Confirmed'}</SelectItem>
                          <SelectItem value="in_progress">{dir === 'rtl' ? 'جاري التنفيذ' : 'In Progress'}</SelectItem>
                          <SelectItem value="completed">{dir === 'rtl' ? 'مكتمل' : 'Completed'}</SelectItem>
                          <SelectItem value="cancelled">{dir === 'rtl' ? 'ملغي' : 'Cancelled'}</SelectItem>
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
              </TabsContent>
              
              <TabsContent value="photos" className="mt-0">
                <ServicePhotos
                  photos={photos}
                  onChange={setPhotos}
                  disabled={isLoading}
                />
              </TabsContent>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...') : (dir === 'rtl' ? 'حفظ' : 'Save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
