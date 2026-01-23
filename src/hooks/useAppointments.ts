import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Appointment = Tables<'appointments'>;
export type AppointmentInsert = TablesInsert<'appointments'>;
export type AppointmentUpdate = TablesUpdate<'appointments'>;

export interface AppointmentWithRelations extends Appointment {
  customers?: { name: string } | null;
  services?: { name_ar: string; name_en: string; color: string | null } | null;
  employees?: { name: string } | null;
}

export const useAppointments = (date?: string) => {
  return useQuery({
    queryKey: ['appointments', date],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          customers(name),
          services(name_ar, name_en, color),
          employees(name)
        `)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (date) {
        query = query.eq('scheduled_date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AppointmentWithRelations[];
    },
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers(name),
          services(name_ar, name_en, color),
          employees(name)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as AppointmentWithRelations;
    },
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء الموعد بنجاح',
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

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...appointment }: AppointmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(appointment)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث الموعد بنجاح',
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

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إلغاء الموعد بنجاح',
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
