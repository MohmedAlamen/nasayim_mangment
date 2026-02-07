import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Appointment = Tables<'appointments'>;
export type AppointmentInsert = TablesInsert<'appointments'>;
export type AppointmentUpdate = TablesUpdate<'appointments'>;

export interface AppointmentWithRelations extends Appointment {
  customers?: { name: string; email?: string | null } | null;
  services?: { name_ar: string; name_en: string; color: string | null } | null;
  employees?: { name: string } | null;
}

// Helper function to send appointment notification
const sendAppointmentNotification = async (
  appointmentId: string,
  type: 'created' | 'updated' | 'cancelled',
  language: 'ar' | 'en' = 'ar'
) => {
  try {
    // Fetch appointment with customer and service details
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers(name, email),
        services(name_ar, name_en)
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      console.error('Failed to fetch appointment for notification:', error);
      return;
    }

    const customerEmail = (appointment.customers as any)?.email;
    if (!customerEmail) {
      console.log('No customer email, skipping notification');
      return;
    }

    const serviceName = language === 'ar' 
      ? (appointment.services as any)?.name_ar 
      : (appointment.services as any)?.name_en;

    const { error: notifyError } = await supabase.functions.invoke('send-appointment-notification', {
      body: {
        customerEmail,
        customerName: (appointment.customers as any)?.name || 'Customer',
        serviceName: serviceName || 'Service',
        appointmentDate: appointment.scheduled_date,
        appointmentTime: appointment.scheduled_time.substring(0, 5),
        type,
        language,
      },
    });

    if (notifyError) {
      console.error('Failed to send appointment notification:', notifyError);
    } else {
      console.log(`Appointment ${type} notification sent successfully`);
    }
  } catch (err) {
    console.error('Error sending notification:', err);
  }
};

export const useAppointments = (date?: string) => {
  return useQuery({
    queryKey: ['appointments', date],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          customers(name, email),
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
          customers(name, email),
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء الموعد بنجاح',
      });
      // Send email notification in background
      sendAppointmentNotification(data.id, 'created');
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث الموعد بنجاح',
      });
      // Send email notification in background
      sendAppointmentNotification(data.id, 'updated');
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
      // Send cancellation notification before deleting
      await sendAppointmentNotification(id, 'cancelled');
      
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
