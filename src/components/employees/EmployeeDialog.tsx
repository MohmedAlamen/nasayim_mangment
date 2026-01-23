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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee, useCreateEmployee, useUpdateEmployee } from '@/hooks/useEmployees';

const employeeSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  role: z.string().min(1, 'الدور مطلوب'),
  status: z.string().default('available'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ open, onOpenChange, employee }) => {
  const { dir } = useLanguage();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || '',
      phone: employee?.phone || '',
      email: employee?.email || '',
      role: employee?.role || '',
      status: employee?.status || 'available',
    },
  });

  React.useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        phone: employee.phone,
        email: employee.email || '',
        role: employee.role,
        status: employee.status || 'available',
      });
    } else {
      form.reset({
        name: '',
        phone: '',
        email: '',
        role: '',
        status: 'available',
      });
    }
  }, [employee, form]);

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      const employeeData = {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        role: values.role,
        status: values.status,
      };
      
      if (employee) {
        await updateEmployee.mutateAsync({ id: employee.id, ...employeeData });
      } else {
        await createEmployee.mutateAsync(employeeData);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const isLoading = createEmployee.isPending || updateEmployee.isPending;

  const roles = dir === 'rtl' 
    ? [
        { value: 'فني', label: 'فني' },
        { value: 'مشرف', label: 'مشرف' },
        { value: 'سائق', label: 'سائق' },
        { value: 'إداري', label: 'إداري' },
      ]
    : [
        { value: 'technician', label: 'Technician' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'driver', label: 'Driver' },
        { value: 'admin', label: 'Admin' },
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={dir}>
        <DialogHeader>
          <DialogTitle>
            {employee ? (dir === 'rtl' ? 'تعديل الموظف' : 'Edit Employee') : (dir === 'rtl' ? 'إضافة موظف جديد' : 'Add New Employee')}
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
                    <Input placeholder={dir === 'rtl' ? 'أدخل اسم الموظف' : 'Enter employee name'} {...field} />
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dir === 'rtl' ? 'الدور الوظيفي' : 'Role'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={dir === 'rtl' ? 'اختر الدور' : 'Select role'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
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
                      <SelectItem value="available">{dir === 'rtl' ? 'متاح' : 'Available'}</SelectItem>
                      <SelectItem value="busy">{dir === 'rtl' ? 'مشغول' : 'Busy'}</SelectItem>
                      <SelectItem value="off">{dir === 'rtl' ? 'إجازة' : 'Off'}</SelectItem>
                    </SelectContent>
                  </Select>
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

export default EmployeeDialog;
