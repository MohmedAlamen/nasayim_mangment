import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Employee = Tables<'employees'>;
export type EmployeeInsert = TablesInsert<'employees'>;
export type EmployeeUpdate = TablesUpdate<'employees'>;

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Employee[];
    },
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employee: EmployeeInsert) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'تم بنجاح',
        description: 'تمت إضافة الموظف بنجاح',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message,
      });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...employee }: EmployeeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث الموظف بنجاح',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message,
      });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف الموظف بنجاح',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message,
      });
    },
  });
};
