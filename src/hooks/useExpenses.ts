import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string;
  expense_date: string;
  receipt_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert {
  title: string;
  description?: string | null;
  amount: number;
  category?: string;
  expense_date?: string;
  receipt_url?: string | null;
  created_by?: string | null;
}

export interface ExpenseUpdate {
  id: string;
  title?: string;
  description?: string | null;
  amount?: number;
  category?: string;
  expense_date?: string;
  receipt_url?: string | null;
}

export const useExpenses = (dateRange?: { from?: Date; to?: Date }) => {
  return useQuery({
    queryKey: ['expenses', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (dateRange?.from) {
        query = query.gte('expense_date', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        query = query.lte('expense_date', dateRange.to.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Expense[];
    },
  });
};

export const useExpenseStats = () => {
  return useQuery({
    queryKey: ['expense-stats'],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('expenses')
        .select('amount, category, expense_date')
        .gte('expense_date', startOfMonth)
        .lte('expense_date', endOfMonth);

      if (error) throw error;

      const totalMonthly = data.reduce((sum, e) => sum + Number(e.amount), 0);
      const byCategory = data.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {} as Record<string, number>);

      return { totalMonthly, byCategory, count: data.length };
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة المصروف بنجاح',
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

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...expense }: ExpenseUpdate) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(expense)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث المصروف بنجاح',
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

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف المصروف بنجاح',
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
