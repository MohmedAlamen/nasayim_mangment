import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Calendar, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAddAppointment?: () => void;
  onAddCustomer?: () => void;
  onCreateInvoice?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddAppointment,
  onAddCustomer,
  onCreateInvoice,
}) => {
  const { dir } = useLanguage();
  const navigate = useNavigate();

  const handleAddAppointment = () => {
    if (onAddAppointment) {
      onAddAppointment();
    } else {
      navigate('/appointments?action=new');
    }
  };

  const handleAddCustomer = () => {
    if (onAddCustomer) {
      onAddCustomer();
    } else {
      navigate('/customers?action=new');
    }
  };

  const handleCreateInvoice = () => {
    if (onCreateInvoice) {
      onCreateInvoice();
    } else {
      navigate('/invoices?action=new');
    }
  };

  const handleScheduleService = () => {
    navigate('/services');
  };

  const actions = [
    { 
      icon: Plus, 
      label: dir === 'rtl' ? 'إضافة موعد' : 'Add Appointment',
      variant: 'default' as const,
      gradient: true,
      onClick: handleAddAppointment,
    },
    { 
      icon: Users, 
      label: dir === 'rtl' ? 'عميل جديد' : 'New Customer',
      variant: 'outline' as const,
      onClick: handleAddCustomer,
    },
    { 
      icon: FileText, 
      label: dir === 'rtl' ? 'إنشاء فاتورة' : 'Create Invoice',
      variant: 'outline' as const,
      onClick: handleCreateInvoice,
    },
    { 
      icon: Calendar, 
      label: dir === 'rtl' ? 'جدولة خدمة' : 'Schedule Service',
      variant: 'outline' as const,
      onClick: handleScheduleService,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant}
          onClick={action.onClick}
          className={
            action.gradient 
              ? "gradient-primary text-primary-foreground hover:opacity-90 shadow-glow" 
              : "hover:bg-muted"
          }
        >
          <action.icon className="w-4 h-4 me-2" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
