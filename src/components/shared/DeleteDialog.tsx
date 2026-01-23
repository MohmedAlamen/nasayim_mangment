import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading = false,
}) => {
  const { dir } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={dir}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || (dir === 'rtl' ? 'تأكيد الحذف' : 'Confirm Delete')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || (dir === 'rtl' 
              ? 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.'
              : 'Are you sure? This action cannot be undone.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={dir === 'rtl' ? 'flex-row-reverse gap-2' : ''}>
          <AlertDialogCancel disabled={isLoading}>
            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading 
              ? (dir === 'rtl' ? 'جاري الحذف...' : 'Deleting...') 
              : (dir === 'rtl' ? 'حذف' : 'Delete')
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
