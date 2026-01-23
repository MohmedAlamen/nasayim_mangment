import React, { useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin, MoreVertical, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCustomers, useDeleteCustomer, Customer } from '@/hooks/useCustomers';
import CustomerDialog from '@/components/customers/CustomerDialog';
import DeleteDialog from '@/components/shared/DeleteDialog';

const Customers: React.FC = () => {
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers, isLoading } = useCustomers(searchTerm);
  const deleteCustomer = useDeleteCustomer();

  const statusStyles: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    inactive: 'bg-muted text-muted-foreground border-muted',
    vip: 'bg-accent/10 text-accent border-accent/20',
  };

  const statusLabels: Record<string, string> = {
    active: dir === 'rtl' ? 'نشط' : 'Active',
    inactive: dir === 'rtl' ? 'غير نشط' : 'Inactive',
    vip: 'VIP',
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCustomer) {
      await deleteCustomer.mutateAsync(selectedCustomer.id);
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleAdd = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('customers')}</h1>
          <p className="text-muted-foreground">{dir === 'rtl' ? 'إدارة قاعدة بيانات العملاء' : 'Manage your customer database'}</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          {dir === 'rtl' ? 'إضافة عميل' : 'Add Customer'}
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground start-3" />
        <Input placeholder={dir === 'rtl' ? 'البحث...' : 'Search...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10" />
      </div>

      {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}

      {!isLoading && customers?.length === 0 && (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">{dir === 'rtl' ? 'لا يوجد عملاء' : 'No customers yet'}</p></CardContent></Card>
      )}

      {!isLoading && customers && customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">{customer.name.charAt(0)}</div>
                    <div>
                      <h3 className="font-semibold text-foreground">{customer.name}</h3>
                      <Badge variant="outline" className={statusStyles[customer.status || 'active']}>{statusLabels[customer.status || 'active']}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                      <DropdownMenuItem onClick={() => handleEdit(customer)}>{dir === 'rtl' ? 'تعديل' : 'Edit'}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(customer)} className="text-destructive">{dir === 'rtl' ? 'حذف' : 'Delete'}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {customer.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span className="truncate">{customer.email}</span></div>}
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{customer.phone}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{customer.city}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CustomerDialog open={dialogOpen} onOpenChange={setDialogOpen} customer={selectedCustomer} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} isLoading={deleteCustomer.isPending} />
    </div>
  );
};

export default Customers;
