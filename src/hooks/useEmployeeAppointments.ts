import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useEmployeeAppointments = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['employee-appointments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First, get the employee record for the current user
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (employeeError || !employee) {
        console.log('No employee record found for user');
        return [];
      }

      // Now get appointments assigned to this employee
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (id, name, phone, address, city),
          services (id, name_ar, name_en, color, price),
          employees (id, name)
        `)
        .eq('employee_id', employee.id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const stats = {
    today: query.data?.filter((a) => a.scheduled_date === today).length || 0,
    pending: query.data?.filter((a) => a.status === 'pending' || a.status === 'confirmed').length || 0,
    inProgress: query.data?.filter((a) => a.status === 'in_progress').length || 0,
    completed: query.data?.filter((a) => a.status === 'completed').length || 0,
  };

  return {
    ...query,
    stats,
  };
};
