import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  ArrowLeft, 
  ArrowRight,
  Calendar, 
  Clock, 
  User, 
  Briefcase, 
  Download, 
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppointment } from '@/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Photo {
  url: string;
  type: 'before' | 'after';
  uploaded_at: string;
}

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const { data: appointment, isLoading } = useAppointment(id || '');
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoFilter, setPhotoFilter] = useState<'all' | 'before' | 'after'>('all');

  const photos: Photo[] = (appointment as any)?.photos || [];
  
  const filteredPhotos = photos.filter(p => 
    photoFilter === 'all' ? true : p.type === photoFilter
  );

  const statusStyles: Record<string, string> = { 
    pending: 'bg-warning/10 text-warning border-warning/20', 
    confirmed: 'bg-primary/10 text-primary border-primary/20', 
    in_progress: 'bg-accent/10 text-accent border-accent/20', 
    completed: 'bg-success/10 text-success border-success/20', 
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20' 
  };
  
  const statusLabels: Record<string, string> = { 
    pending: dir === 'rtl' ? 'قيد الانتظار' : 'Pending', 
    confirmed: dir === 'rtl' ? 'مؤكد' : 'Confirmed', 
    in_progress: dir === 'rtl' ? 'جاري' : 'In Progress', 
    completed: dir === 'rtl' ? 'مكتمل' : 'Completed', 
    cancelled: dir === 'rtl' ? 'ملغي' : 'Cancelled' 
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `appointment-${id}-photo-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentPhotoIndex(prev => (prev > 0 ? prev - 1 : filteredPhotos.length - 1));
    } else {
      setCurrentPhotoIndex(prev => (prev < filteredPhotos.length - 1 ? prev + 1 : 0));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {dir === 'rtl' ? 'الموعد غير موجود' : 'Appointment not found'}
        </p>
        <Button onClick={() => navigate('/appointments')} className="mt-4">
          {dir === 'rtl' ? 'العودة للمواعيد' : 'Back to Appointments'}
        </Button>
      </div>
    );
  }

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/appointments')}
        >
          <BackIcon className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {dir === 'rtl' ? 'تفاصيل الموعد' : 'Appointment Details'}
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(appointment.scheduled_date), 'EEEE, d MMMM yyyy', { 
              locale: dir === 'rtl' ? ar : undefined 
            })}
          </p>
        </div>
        <Badge 
          variant="outline" 
          className={`text-sm px-3 py-1 ${statusStyles[appointment.status || 'pending']}`}
        >
          {statusLabels[appointment.status || 'pending']}
        </Badge>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {dir === 'rtl' ? 'العميل' : 'Customer'}
              </p>
              <p className="font-medium">{appointment.customers?.name || '-'}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-accent/10">
              <Briefcase className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {dir === 'rtl' ? 'الخدمة' : 'Service'}
              </p>
              <p className="font-medium">
                {appointment.services 
                  ? (dir === 'rtl' ? appointment.services.name_ar : appointment.services.name_en)
                  : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-success/10">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {dir === 'rtl' ? 'التاريخ' : 'Date'}
              </p>
              <p className="font-medium">
                {format(new Date(appointment.scheduled_date), 'dd/MM/yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {dir === 'rtl' ? 'الوقت' : 'Time'}
              </p>
              <p className="font-medium">{appointment.scheduled_time.substring(0, 5)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee & Notes */}
      {(appointment.employees || appointment.notes) && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {appointment.employees && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {dir === 'rtl' ? 'الموظف المكلف' : 'Assigned Employee'}
                </p>
                <p className="font-medium">{appointment.employees.name}</p>
              </div>
            )}
            {appointment.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {dir === 'rtl' ? 'ملاحظات' : 'Notes'}
                </p>
                <p className="text-foreground">{appointment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photos Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {dir === 'rtl' ? 'صور الخدمة' : 'Service Photos'}
              {photos.length > 0 && (
                <Badge variant="secondary">{photos.length}</Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{dir === 'rtl' ? 'لا توجد صور' : 'No photos'}</p>
            </div>
          ) : (
            <>
              {/* Filter Tabs */}
              <Tabs value={photoFilter} onValueChange={(v) => setPhotoFilter(v as any)} className="mb-4">
                <TabsList>
                  <TabsTrigger value="all">
                    {dir === 'rtl' ? 'الكل' : 'All'} ({photos.length})
                  </TabsTrigger>
                  <TabsTrigger value="before">
                    {dir === 'rtl' ? 'قبل' : 'Before'} ({photos.filter(p => p.type === 'before').length})
                  </TabsTrigger>
                  <TabsTrigger value="after">
                    {dir === 'rtl' ? 'بعد' : 'After'} ({photos.filter(p => p.type === 'after').length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    <img 
                      src={photo.url} 
                      alt={`${photo.type} photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Badge 
                      className={`absolute top-2 ${dir === 'rtl' ? 'right-2' : 'left-2'} ${
                        photo.type === 'before' 
                          ? 'bg-warning text-warning-foreground' 
                          : 'bg-success text-success-foreground'
                      }`}
                    >
                      {photo.type === 'before' 
                        ? (dir === 'rtl' ? 'قبل' : 'Before')
                        : (dir === 'rtl' ? 'بعد' : 'After')
                      }
                    </Badge>
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`absolute bottom-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(photo.url, index);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <div className="relative">
            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation */}
            {filteredPhotos.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox('prev')}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox('next')}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Image */}
            <div className="flex items-center justify-center min-h-[60vh] p-8">
              {filteredPhotos[currentPhotoIndex] && (
                <img
                  src={filteredPhotos[currentPhotoIndex].url}
                  alt={`Photo ${currentPhotoIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Badge className={
                    filteredPhotos[currentPhotoIndex]?.type === 'before'
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-success text-success-foreground'
                  }>
                    {filteredPhotos[currentPhotoIndex]?.type === 'before'
                      ? (dir === 'rtl' ? 'قبل' : 'Before')
                      : (dir === 'rtl' ? 'بعد' : 'After')
                    }
                  </Badge>
                  <span className="text-sm opacity-80">
                    {currentPhotoIndex + 1} / {filteredPhotos.length}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => handleDownload(filteredPhotos[currentPhotoIndex].url, currentPhotoIndex)}
                >
                  <Download className="w-4 h-4" />
                  {dir === 'rtl' ? 'تحميل' : 'Download'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentDetails;
