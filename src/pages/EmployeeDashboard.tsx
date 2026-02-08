import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar, Clock, User, MapPin, Wrench, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployeeAppointments } from '@/hooks/useEmployeeAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  confirmed: 'bg-primary/10 text-primary border-primary/30',
  in_progress: 'bg-accent/10 text-accent border-accent/30',
  completed: 'bg-success/10 text-success border-success/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
};

const EmployeeDashboard: React.FC = () => {
  const { t, dir } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: appointments, isLoading, stats } = useEmployeeAppointments();

  const statusLabels: Record<string, string> = {
    pending: dir === 'rtl' ? 'قيد الانتظار' : 'Pending',
    confirmed: dir === 'rtl' ? 'مؤكد' : 'Confirmed',
    in_progress: dir === 'rtl' ? 'جاري التنفيذ' : 'In Progress',
    completed: dir === 'rtl' ? 'مكتمل' : 'Completed',
    cancelled: dir === 'rtl' ? 'ملغي' : 'Cancelled',
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          {dir === 'rtl' ? `مرحباً، ${profile?.full_name || 'موظف'}` : `Hello, ${profile?.full_name || 'Employee'}`}
        </h1>
        <p className="text-muted-foreground">
          {dir === 'rtl' ? 'مواعيدك المكلف بها' : 'Your assigned appointments'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'اليوم' : 'Today'}</p>
              <p className="text-xl font-bold">{stats?.today || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'قيد الانتظار' : 'Pending'}</p>
              <p className="text-xl font-bold">{stats?.pending || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-accent/10">
              <Wrench className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'جاري التنفيذ' : 'In Progress'}</p>
              <p className="text-xl font-bold">{stats?.inProgress || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'مكتملة' : 'Completed'}</p>
              <p className="text-xl font-bold">{stats?.completed || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {dir === 'rtl' ? 'مواعيدي' : 'My Appointments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/appointments/${appointment.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Customer & Status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {appointment.customers?.name || '-'}
                        </h3>
                        <Badge variant="outline" className={statusStyles[appointment.status || 'pending']}>
                          {statusLabels[appointment.status || 'pending']}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(appointment.scheduled_date), 'dd MMM yyyy', {
                            locale: dir === 'rtl' ? ar : undefined,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {appointment.scheduled_time?.substring(0, 5)}
                        </span>
                        {appointment.services && (
                          <span className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: appointment.services.color || '#2d8a5f' }}
                            />
                            {dir === 'rtl' ? appointment.services.name_ar : appointment.services.name_en}
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      {appointment.customers?.address && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {appointment.customers.address}
                          {appointment.customers.city && ` - ${appointment.customers.city}`}
                        </div>
                      )}
                    </div>

                    {/* Time Badge */}
                    <div className="text-center px-3 py-2 bg-muted rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {appointment.scheduled_time?.substring(0, 5)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {dir === 'rtl' ? 'لا توجد مواعيد مكلف بها حالياً' : 'No appointments assigned to you'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
