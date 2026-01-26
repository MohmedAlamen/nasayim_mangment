import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface FileUploadProps {
  folder: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  folder,
  value = [],
  onChange,
  maxFiles = 5,
  accept = 'image/*,.pdf,.doc,.docx'
}) => {
  const { dir } = useLanguage();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxFiles) {
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: dir === 'rtl' 
          ? `الحد الأقصى ${maxFiles} ملفات` 
          : `Maximum ${maxFiles} files allowed`,
      });
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName);

        newUrls.push(publicUrl);
      }

      onChange([...value, ...newUrls]);
      toast({
        title: dir === 'rtl' ? 'تم بنجاح' : 'Success',
        description: dir === 'rtl' ? 'تم رفع الملفات' : 'Files uploaded successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: error.message,
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (url: string) => {
    onChange(value.filter(v => v !== url));
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleUpload}
          className="hidden"
        />
        {uploading ? (
          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
        ) : (
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        )}
        <p className="text-sm text-muted-foreground">
          {dir === 'rtl' ? 'اضغط لرفع الملفات أو اسحب وأفلت' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {dir === 'rtl' ? `الحد الأقصى ${maxFiles} ملفات` : `Max ${maxFiles} files`}
        </p>
      </div>

      {/* Preview Files */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {value.map((url, index) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
            return (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                  {isImage ? (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FileImage className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -end-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(url)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
