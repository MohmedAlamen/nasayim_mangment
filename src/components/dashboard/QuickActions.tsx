import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Calendar, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QuickActions: React.FC = () => {
  const { t, dir } = useLanguage();

  const actions = [
    { 
      icon: Plus, 
      label: dir === 'rtl' ? 'إضافة موعد' : 'Add Appointment',
      variant: 'default' as const,
      gradient: true
    },
    { 
      icon: Users, 
      label: dir === 'rtl' ? 'عميل جديد' : 'New Customer',
      variant: 'outline' as const
    },
    { 
      icon: FileText, 
      label: dir === 'rtl' ? 'إنشاء فاتورة' : 'Create Invoice',
      variant: 'outline' as const
    },
    { 
      icon: Calendar, 
      label: dir === 'rtl' ? 'جدولة خدمة' : 'Schedule Service',
      variant: 'outline' as const
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant}
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
