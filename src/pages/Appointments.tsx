import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, User, MoreVertical, Loader2 } from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAppointments, useDeleteAppointment, AppointmentWithRelations } from '@/hooks/useAppointments';
import AppointmentDialog from '@/components/appointments/AppointmentDialog';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { useAuth } from '@/contexts/AuthContext';

const Appointments: React.FC = () => {
  const { t, dir } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);

  const dateFilter = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { data: appointments, isLoading } = useAppointments(dateFilter);
  const deleteAppointment = useDeleteAppointment();

  const statusStyles: Record<string, string> = { pending: 'bg-warning/10 text-warning', confirmed: 'bg-primary/10 text-primary', in_progress: 'bg-accent/10 text-accent', completed: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive' };
  const statusLabels: Record<string, string> = { pending: dir === 'rtl' ? 'قيد الانتظار' : 'Pending', confirmed: dir === 'rtl' ? 'مؤكد' : 'Confirmed', in_progress: dir === 'rtl' ? 'جاري' : 'In Progress', completed: dir === 'rtl' ? 'مكتمل' : 'Completed', cancelled: dir === 'rtl' ? 'ملغي' : 'Cancelled' };

  const handleEdit = (a: AppointmentWithRelations) => { setSelectedAppointment(a); setDialogOpen(true); };
  const handleDelete = (a: AppointmentWithRelations) => { setSelectedAppointment(a); setDeleteDialogOpen(true); };
  const confirmDelete = async () => { if (selectedAppointment) { await deleteAppointment.mutateAsync(selectedAppointment.id); setDeleteDialogOpen(false); setSelectedAppointment(null); } };
  const handleAdd = () => { setSelectedAppointment(null); setDialogOpen(true); };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-foreground">{t('appointments')}</h1><p className="text-muted-foreground">{dir === 'rtl' ? 'إدارة المواعيد' : 'Manage appointments'}</p></div>
        <Button onClick={handleAdd} className="gap-2"><Plus className="w-4 h-4" />{dir === 'rtl' ? 'موعد جديد' : 'New Appointment'}</Button>
      </div>

      <div className="flex gap-2 items-center">
        <Button variant={selectedDate ? 'default' : 'outline'} size="sm" onClick={() => setSelectedDate(startOfToday())}>{dir === 'rtl' ? 'اليوم' : 'Today'}</Button>
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(undefined)}>{dir === 'rtl' ? 'الكل' : 'All'}</Button>
        <Popover><PopoverTrigger asChild><Button variant="outline" size="sm" className="gap-2"><CalendarIcon className="w-4 h-4" />{selectedDate ? format(selectedDate, 'PPP', { locale: dir === 'rtl' ? ar : undefined }) : (dir === 'rtl' ? 'تاريخ' : 'Date')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus className={cn("p-3 pointer-events-auto")} /></PopoverContent></Popover>
      </div>

      {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
      {!isLoading && appointments?.length === 0 && <Card><CardContent className="py-12 text-center"><CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{dir === 'rtl' ? 'لا توجد مواعيد' : 'No appointments'}</p></CardContent></Card>}

      {!isLoading && appointments && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/appointments/${a.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="text-center min-w-[60px]"><div className="text-2xl font-bold text-primary">{a.scheduled_time.substring(0, 5)}</div><div className="text-xs text-muted-foreground">{format(new Date(a.scheduled_date), 'dd MMM', { locale: dir === 'rtl' ? ar : undefined })}</div></div>
                    <div className="flex-1 border-s ps-4">
                      <div className="flex items-center gap-2 mb-2"><h3 className="font-semibold text-foreground">{a.customers?.name || '-'}</h3><Badge variant="outline" className={statusStyles[a.status || 'pending']}>{statusLabels[a.status || 'pending']}</Badge></div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {a.services && <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.services.color || '#2d8a5f' }} /><span>{dir === 'rtl' ? a.services.name_ar : a.services.name_en}</span></div>}
                        {a.employees && <div className="flex items-center gap-1"><User className="w-4 h-4" /><span>{a.employees.name}</span></div>}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}><DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(a); }}>{dir === 'rtl' ? 'تعديل' : 'Edit'}</DropdownMenuItem>{isAdmin && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(a); }} className="text-destructive">{dir === 'rtl' ? 'إلغاء' : 'Cancel'}</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} appointment={selectedAppointment} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} isLoading={deleteAppointment.isPending} title={dir === 'rtl' ? 'إلغاء الموعد' : 'Cancel Appointment'} />
    </div>
  );
};

export default Appointments;
