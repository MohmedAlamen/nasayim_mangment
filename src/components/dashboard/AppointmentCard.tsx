import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  customerName: string;
  service: string;
  time: string;
  location: string;
  status: 'pending' | 'inProgress' | 'completed' | 'cancelled';
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  customerName,
  service,
  time,
  location,
  status,
}) => {
  const { t } = useLanguage();

  const statusStyles = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    inProgress: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const statusLabels = {
    pending: 'pending',
    inProgress: 'inProgress',
    completed: 'completed',
    cancelled: 'cancelled',
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all duration-200 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{customerName}</h4>
          <p className="text-sm text-muted-foreground">{service}</p>
        </div>
        <span className={cn(
          "px-3 py-1 text-xs font-medium rounded-full border",
          statusStyles[status]
        )}>
          {t(statusLabels[status])}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
