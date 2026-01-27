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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee, useCreateEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const employeeSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  role: z.string().min(1, 'الدور مطلوب'),
  status: z.string().default('available'),
});

const accountSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  role: z.string().min(1, 'الدور مطلوب'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;
type AccountFormValues = z.infer<typeof accountSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

// Map Arabic roles to English keys if they somehow get through
const roleMap: Record<string, string> = {
  'فني': 'technician',
  'فني أول': 'senior_technician',
  'مشرف': 'supervisor',
  'technician': 'technician',
  'senior_technician': 'senior_technician',
  'supervisor': 'supervisor'
};

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ open, onOpenChange, employee }) => {
  const { dir } = useLanguage();
  const { toast } = useToast();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const [creatingAccount, setCreatingAccount] = React.useState(false);

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

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      role: 'technician',
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
      console.log('Submitting employee form with values:', values);
      const employeeData = {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        role: roleMap[values.role] || values.role,
        status: values.status,
      };
      console.log('Processed employee data for Supabase:', employeeData);
      
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

  const onCreateAccount = async (values: AccountFormValues) => {
    setCreatingAccount(true);
    try {
      console.log('Creating account with values:', values);
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-employee-account', {
        body: {
          email: values.email,
          password: values.password,
          full_name: values.name,
          phone: values.phone,
          role: roleMap[values.role] || values.role,
        },
      });
      console.log('Edge Function response:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: dir === 'rtl' ? 'تم بنجاح' : 'Success',
        description: dir === 'rtl' ? 'تم إنشاء حساب الموظف بنجاح' : 'Employee account created successfully',
      });

      onOpenChange(false);
      accountForm.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: error.message,
      });
    } finally {
      setCreatingAccount(false);
    }
  };

  const isLoading = createEmployee.isPending || updateEmployee.isPending;

  const roles = [
    { value: 'technician', label: dir === 'rtl' ? 'فني' : 'Technician' },
    { value: 'senior_technician', label: dir === 'rtl' ? 'فني أول' : 'Senior Technician' },
    { value: 'supervisor', label: dir === 'rtl' ? 'مشرف' : 'Supervisor' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={dir}>
        <DialogHeader>
          <DialogTitle>
            {employee ? (dir === 'rtl' ? 'تعديل الموظف' : 'Edit Employee') : (dir === 'rtl' ? 'إضافة موظف جديد' : 'Add New Employee')}
          </DialogTitle>
        </DialogHeader>

        {employee ? (
          // Edit mode - just the simple form
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
        ) : (
          // Add mode - tabs for with/without account
          <Tabs defaultValue="with-account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="with-account">
                {dir === 'rtl' ? 'مع حساب' : 'With Account'}
              </TabsTrigger>
              <TabsTrigger value="without-account">
                {dir === 'rtl' ? 'بدون حساب' : 'Without Account'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="with-account" className="mt-4">
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onCreateAccount)} className="space-y-4">
                  <FormField
                    control={accountForm.control}
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
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{dir === 'rtl' ? 'كلمة المرور' : 'Password'}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
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
                    control={accountForm.control}
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
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={creatingAccount}>
                      {creatingAccount && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                      {dir === 'rtl' ? 'إنشاء حساب' : 'Create Account'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="without-account" className="mt-4">
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
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDialog;
