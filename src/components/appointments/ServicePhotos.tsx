import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Photo {
  url: string;
  type: 'before' | 'after';
  uploaded_at: string;
}

interface ServicePhotosProps {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  disabled?: boolean;
}

const ServicePhotos: React.FC<ServicePhotosProps> = ({ photos, onChange, disabled }) => {
  const { dir } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);

  const beforePhotos = photos.filter(p => p.type === 'before');
  const afterPhotos = photos.filter(p => p.type === 'after');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(type);
    const newPhotos: Photo[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast({
            variant: 'destructive',
            title: dir === 'rtl' ? 'خطأ' : 'Error',
            description: dir === 'rtl' ? 'يرجى اختيار صور فقط' : 'Please select images only',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${type}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName);

        newPhotos.push({
          url: urlData.publicUrl,
          type,
          uploaded_at: new Date().toISOString(),
        });
      }

      onChange([...photos, ...newPhotos]);
      toast({
        title: dir === 'rtl' ? 'تم الرفع' : 'Uploaded',
        description: dir === 'rtl' ? 'تم رفع الصور بنجاح' : 'Photos uploaded successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: error.message,
      });
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter(p => p.url !== url));
  };

  const PhotoGrid: React.FC<{ items: Photo[]; type: 'before' | 'after' }> = ({ items, type }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {type === 'before' 
            ? (dir === 'rtl' ? 'صور قبل الخدمة' : 'Before Service') 
            : (dir === 'rtl' ? 'صور بعد الخدمة' : 'After Service')}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading !== null}
          className="gap-2"
          asChild
        >
          <label className="cursor-pointer">
            {uploading === type ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{dir === 'rtl' ? 'رفع صور' : 'Upload'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e, type)}
              disabled={disabled || uploading !== null}
            />
          </label>
        </Button>
      </div>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {items.map((photo, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={photo.url}
                alt={`${type} ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removePhoto(photo.url)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground",
          type === 'before' ? 'border-warning/30 bg-warning/5' : 'border-primary/30 bg-primary/5'
        )}>
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {dir === 'rtl' ? 'لا توجد صور' : 'No photos'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <PhotoGrid items={beforePhotos} type="before" />
      <PhotoGrid items={afterPhotos} type="after" />
    </div>
  );
};

export default ServicePhotos;
