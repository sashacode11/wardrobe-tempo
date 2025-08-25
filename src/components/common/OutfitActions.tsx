import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OutfitActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
}

const OutfitActions: React.FC<OutfitActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
  size = 'md',
  variant = 'ghost',
  className = '',
  viewTitle = 'View details',
  editTitle = 'Edit',
  deleteTitle = 'Delete',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {showView && onView && (
        <Button
          variant={variant}
          size="icon"
          onClick={onView}
          className={sizeClasses[size]}
          title={viewTitle}
        >
          <Eye className={iconSizes[size]} />
        </Button>
      )}
      {showEdit && onEdit && (
        <Button
          variant={variant}
          size="icon"
          onClick={onEdit}
          className={sizeClasses[size]}
          title={editTitle}
        >
          <Edit className={iconSizes[size]} />
        </Button>
      )}
      {showDelete && onDelete && (
        <Button
          variant={variant}
          size="icon"
          onClick={onDelete}
          className={`${sizeClasses[size]} text-destructive hover:text-destructive`}
          title={deleteTitle}
        >
          <Trash2 className={iconSizes[size]} />
        </Button>
      )}
    </div>
  );
};

export default OutfitActions;
