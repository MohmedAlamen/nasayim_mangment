import React, { useState } from 'react';
import { Plus, Phone, Mail, Star, MoreVertical, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEmployees, useDeleteEmployee, Employee } from '@/hooks/useEmployees';
import EmployeeDialog from '@/components/employees/EmployeeDialog';
import DeleteDialog from '@/components/shared/DeleteDialog';
import { useAuth } from '@/contexts/AuthContext';

const Employees: React.FC = () => {
  const { t, dir } = useLanguage();
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { data: employees, isLoading } = useEmployees();
  const deleteEmployee = useDeleteEmployee();

  const statusStyles: Record<string, string> = { available: 'bg-success/10 text-success', busy: 'bg-warning/10 text-warning', off: 'bg-muted text-muted-foreground' };
  const statusLabels: Record<string, string> = { available: dir === 'rtl' ? 'متاح' : 'Available', busy: dir === 'rtl' ? 'مشغول' : 'Busy', off: dir === 'rtl' ? 'إجازة' : 'Off' };
  const roleLabels: Record<string, string> = {
    technician: dir === 'rtl' ? 'فني' : 'Technician',
    senior_technician: dir === 'rtl' ? 'فني أول' : 'Senior Technician',
    supervisor: dir === 'rtl' ? 'مشرف' : 'Supervisor',
    admin: dir === 'rtl' ? 'مدير' : 'Admin',
  };

  const handleEdit = (e: Employee) => { setSelectedEmployee(e); setDialogOpen(true); };
  const handleDelete = (e: Employee) => { setSelectedEmployee(e); setDeleteDialogOpen(true); };
  const confirmDelete = async () => { if (selectedEmployee) { await deleteEmployee.mutateAsync(selectedEmployee.id); setDeleteDialogOpen(false); setSelectedEmployee(null); } };
  const handleAdd = () => { setSelectedEmployee(null); setDialogOpen(true); };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-foreground">{t('employees')}</h1><p className="text-muted-foreground">{dir === 'rtl' ? 'إدارة فريق العمل' : 'Manage your team'}</p></div>
        {isAdmin && <Button onClick={handleAdd} className="gap-2"><Plus className="w-4 h-4" />{dir === 'rtl' ? 'إضافة موظف' : 'Add Employee'}</Button>}
      </div>

      {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
      {!isLoading && employees?.length === 0 && <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">{dir === 'rtl' ? 'لا يوجد موظفين' : 'No employees yet'}</p></CardContent></Card>}

      {!isLoading && employees && employees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">{employee.name.charAt(0)}</div>
                    <div><h3 className="font-semibold text-foreground">{employee.name}</h3><p className="text-sm text-muted-foreground">{roleLabels[employee.role] || employee.role}</p><Badge variant="outline" className={statusStyles[employee.status || 'available']}>{statusLabels[employee.status || 'available']}</Badge></div>
                  </div>
                  {isAdmin && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}><DropdownMenuItem onClick={() => handleEdit(employee)}>{dir === 'rtl' ? 'تعديل' : 'Edit'}</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(employee)} className="text-destructive">{dir === 'rtl' ? 'حذف' : 'Delete'}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}
                </div>
                <div className="space-y-2 text-sm text-muted-foreground"><div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{employee.phone}</span></div>{employee.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span className="truncate">{employee.email}</span></div>}</div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t"><div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="font-medium">{employee.rating || 5.0}</span></div><span className="text-sm text-muted-foreground">{employee.completed_jobs || 0} {dir === 'rtl' ? 'مهمة' : 'jobs'}</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <EmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} employee={selectedEmployee} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} isLoading={deleteEmployee.isPending} />
    </div>
  );
};

export default Employees;
