import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { dir } = useLanguage();

  useEffect(() => {
    // Subscribe to appointments changes
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          queryClient.invalidateQueries({ queryKey: ['today-appointments'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          toast({
            title: dir === 'rtl' ? '📅 موعد جديد' : '📅 New Appointment',
            description: dir === 'rtl' ? 'تم إضافة موعد جديد' : 'A new appointment has been added',
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'appointments' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          queryClient.invalidateQueries({ queryKey: ['today-appointments'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          const newStatus = payload.new?.status;
          if (newStatus === 'completed') {
            toast({
              title: dir === 'rtl' ? '✅ موعد مكتمل' : '✅ Appointment Completed',
              description: dir === 'rtl' ? 'تم إكمال الموعد بنجاح' : 'Appointment has been completed',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to invoices changes
    const invoicesChannel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'invoices' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          toast({
            title: dir === 'rtl' ? '📄 فاتورة جديدة' : '📄 New Invoice',
            description: dir === 'rtl' ? 'تم إنشاء فاتورة جديدة' : 'A new invoice has been created',
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'invoices' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          if (payload.new?.status === 'paid') {
            toast({
              title: dir === 'rtl' ? '💰 فاتورة مدفوعة' : '💰 Invoice Paid',
              description: dir === 'rtl' ? 'تم دفع الفاتورة بنجاح' : 'Invoice has been paid',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to customers changes
    const customersChannel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'customers' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['customers'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          toast({
            title: dir === 'rtl' ? '👤 عميل جديد' : '👤 New Customer',
            description: dir === 'rtl' ? 'تم إضافة عميل جديد' : 'A new customer has been added',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(invoicesChannel);
      supabase.removeChannel(customersChannel);
    };
  }, [queryClient, toast, dir]);
};
