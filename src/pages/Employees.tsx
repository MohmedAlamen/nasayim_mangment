import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Phone, Mail, Star, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Employees: React.FC = () => {
  const { t, dir } = useLanguage();

  const employees = [
    {
      id: 1,
      name: dir === 'rtl' ? 'خالد العتيبي' : 'Khaled Al-Otaibi',
      role: dir === 'rtl' ? 'فني مكافحة حشرات' : 'Pest Control Technician',
      email: 'khaled@company.com',
      phone: '+966 50 111 2222',
      completedJobs: 156,
      rating: 4.8,
      status: 'available',
    },
    {
      id: 2,
      name: dir === 'rtl' ? 'فيصل الدوسري' : 'Faisal Al-Dosari',
      role: dir === 'rtl' ? 'فني أول' : 'Senior Technician',
      email: 'faisal@company.com',
      phone: '+966 55 333 4444',
      completedJobs: 234,
      rating: 4.9,
      status: 'busy',
    },
    {
      id: 3,
      name: dir === 'rtl' ? 'سعد الشهري' : 'Saad Al-Shehri',
      role: dir === 'rtl' ? 'مشرف فني' : 'Technical Supervisor',
      email: 'saad@company.com',
      phone: '+966 54 555 6666',
      completedJobs: 312,
      rating: 4.7,
      status: 'available',
    },
    {
      id: 4,
      name: dir === 'rtl' ? 'عبدالله القحطاني' : 'Abdullah Al-Qahtani',
      role: dir === 'rtl' ? 'فني تعقيم' : 'Disinfection Technician',
      email: 'abdullah@company.com',
      phone: '+966 56 777 8888',
      completedJobs: 89,
      rating: 4.6,
      status: 'off',
    },
    {
      id: 5,
      name: dir === 'rtl' ? 'ماجد العمري' : 'Majid Al-Omari',
      role: dir === 'rtl' ? 'فني تبخير' : 'Fumigation Technician',
      email: 'majid@company.com',
      phone: '+966 59 999 0000',
      completedJobs: 145,
      rating: 4.5,
      status: 'busy',
    },
  ];

  const statusStyles = {
    available: 'bg-success/10 text-success border-success/20',
    busy: 'bg-warning/10 text-warning border-warning/20',
    off: 'bg-muted text-muted-foreground border-border',
  };

  const statusLabels = {
    available: dir === 'rtl' ? 'متاح' : 'Available',
    busy: dir === 'rtl' ? 'مشغول' : 'Busy',
    off: dir === 'rtl' ? 'إجازة' : 'Off',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('employees')}</h1>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? 'إدارة فريق العمل والفنيين' : 'Manage work team and technicians'}
          </p>
        </div>
        <Button className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="w-4 h-4 me-2" />
          {dir === 'rtl' ? 'إضافة موظف' : 'Add Employee'}
        </Button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div 
            key={employee.id}
            className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {employee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.role}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                  <DropdownMenuItem>{t('edit')}</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">{t('delete')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border",
                statusStyles[employee.status as keyof typeof statusStyles]
              )}>
                {statusLabels[employee.status as keyof typeof statusLabels]}
              </span>
              <div className="flex items-center gap-1 text-accent">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{employee.rating}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span dir="ltr">{employee.phone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  {dir === 'rtl' ? 'المهام المكتملة' : 'Completed Jobs'}
                </span>
                <span className="font-bold text-primary">{employee.completedJobs}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employees;
