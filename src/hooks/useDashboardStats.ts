import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, startOfToday } from 'date-fns';

export interface DashboardStats {
  totalCustomers: number;
  activeServices: number;
  todayAppointments: number;
  pendingAppointments: number;
  monthlyRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const today = format(startOfToday(), 'yyyy-MM-dd');
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      // Parallel queries for all stats
      const [
        customersResult,
        servicesResult,
        todayAppointmentsResult,
        pendingAppointmentsResult,
        monthlyInvoicesResult,
      ] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('scheduled_date', today),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('invoices').select('amount, status').gte('created_at', monthStart).lte('created_at', monthEnd),
      ]);

      const invoices = monthlyInvoicesResult.data || [];
      const monthlyRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
      const pendingInvoices = invoices.filter(inv => inv.status !== 'paid').length;

      return {
        totalCustomers: customersResult.count || 0,
        activeServices: servicesResult.count || 0,
        todayAppointments: todayAppointmentsResult.count || 0,
        pendingAppointments: pendingAppointmentsResult.count || 0,
        monthlyRevenue,
        paidInvoices,
        pendingInvoices,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useTodayAppointments = () => {
  return useQuery({
    queryKey: ['today-appointments'],
    queryFn: async () => {
      const today = format(startOfToday(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers(name, address),
          services(name_ar, name_en, color),
          employees(name)
        `)
        .eq('scheduled_date', today)
        .order('scheduled_time', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
};
