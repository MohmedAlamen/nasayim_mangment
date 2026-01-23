import React, { useState } from 'react';
import { Plus, MoreVertical, Clock, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useServices, useDeleteService, Service } from '@/hooks/useServices';
import ServiceDialog from '@/components/services/ServiceDialog';
import DeleteDialog from '@/components/shared/DeleteDialog';

const Services: React.FC = () => {
  const { t, dir } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { data: services, isLoading } = useServices();
  const deleteService = useDeleteService();

  const handleEdit = (service: Service) => { setSelectedService(service); setDialogOpen(true); };
  const handleDelete = (service: Service) => { setSelectedService(service); setDeleteDialogOpen(true); };
  const confirmDelete = async () => { if (selectedService) { await deleteService.mutateAsync(selectedService.id); setDeleteDialogOpen(false); setSelectedService(null); } };
  const handleAdd = () => { setSelectedService(null); setDialogOpen(true); };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-foreground">{t('services')}</h1><p className="text-muted-foreground">{dir === 'rtl' ? 'إدارة الخدمات والأسعار' : 'Manage services and pricing'}</p></div>
        <Button onClick={handleAdd} className="gap-2"><Plus className="w-4 h-4" />{dir === 'rtl' ? 'إضافة خدمة' : 'Add Service'}</Button>
      </div>

      {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
      {!isLoading && services?.length === 0 && <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">{dir === 'rtl' ? 'لا توجد خدمات' : 'No services yet'}</p></CardContent></Card>}

      {!isLoading && services && services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-2" style={{ backgroundColor: service.color || '#2d8a5f' }} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: service.color || '#2d8a5f' }}><span className="text-xl font-bold">{(dir === 'rtl' ? service.name_ar : service.name_en).charAt(0)}</span></div>
                    <div><h3 className="font-semibold text-foreground">{dir === 'rtl' ? service.name_ar : service.name_en}</h3><Badge variant={service.is_active ? 'default' : 'secondary'}>{service.is_active ? (dir === 'rtl' ? 'نشط' : 'Active') : (dir === 'rtl' ? 'غير نشط' : 'Inactive')}</Badge></div>
                  </div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}><DropdownMenuItem onClick={() => handleEdit(service)}>{dir === 'rtl' ? 'تعديل' : 'Edit'}</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(service)} className="text-destructive">{dir === 'rtl' ? 'حذف' : 'Delete'}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{dir === 'rtl' ? service.description_ar : service.description_en}</p>
                <div className="flex items-center justify-between pt-3 border-t"><div className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>{service.duration || '-'}</span></div><div className="text-lg font-bold text-primary">{service.price} {dir === 'rtl' ? 'ر.س' : 'SAR'}</div></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ServiceDialog open={dialogOpen} onOpenChange={setDialogOpen} service={selectedService} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} isLoading={deleteService.isPending} />
    </div>
  );
};

export default Services;
