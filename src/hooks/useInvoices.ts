import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Invoice = Tables<'invoices'>;
export type InvoiceInsert = TablesInsert<'invoices'>;
export type InvoiceUpdate = TablesUpdate<'invoices'>;

export interface InvoiceWithRelations extends Invoice {
  customers?: { name: string; phone: string; address: string } | null;
  appointments?: { 
    scheduled_date: string; 
    scheduled_time: string;
    services?: { name_ar: string; name_en: string; price: number } | null;
  } | null;
}

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers(name, phone, address),
          appointments(
            scheduled_date, 
            scheduled_time,
            services(name_ar, name_en, price)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as InvoiceWithRelations[];
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers(name, phone, address),
          appointments(
            scheduled_date, 
            scheduled_time,
            services(name_ar, name_en, price)
          )
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as InvoiceWithRelations | null;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invoice: Omit<InvoiceInsert, 'invoice_number'>) => {
      // Generate invoice number using DB function
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({ ...invoice, invoice_number: invoiceNumber || `INV-${Date.now()}` })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'تم بنجاح', description: 'تم إنشاء الفاتورة بنجاح' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'خطأ', description: error.message });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...invoice }: InvoiceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(invoice)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'تم بنجاح', description: 'تم تحديث الفاتورة بنجاح' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'خطأ', description: error.message });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'تم بنجاح', description: 'تم حذف الفاتورة بنجاح' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'خطأ', description: error.message });
    },
  });
};
