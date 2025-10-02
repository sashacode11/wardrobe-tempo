// components/common/ViewModal.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

const ViewModal: React.FC<ViewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${maxWidthClasses[maxWidth]} bg-card max-h-[90vh] overflow-y-auto gap-0 py-2`}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {/* {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )} */}
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div>{children}</div>
        </ScrollArea>

        {showCloseButton && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewModal;
