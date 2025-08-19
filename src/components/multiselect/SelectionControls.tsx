import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface SelectionControlsProps {
  isSelectionMode: boolean;
  selectedCount: number;
  totalFilteredCount: number;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  deleteButtonText?: string;
  selectAllText?: string;
  deselectAllText?: string;
  cancelText?: string;
  selectItemsText?: string;
  className?: string;
}

const SelectionControls: React.FC<SelectionControlsProps> = ({
  isSelectionMode,
  selectedCount,
  totalFilteredCount,
  onToggleSelectionMode,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  deleteButtonText = 'Delete',
  selectAllText = 'Select All',
  deselectAllText = 'Deselect All',
  cancelText = 'Cancel',
  selectItemsText = 'Select Items',
  className = '',
}) => {
  const isAllSelected =
    selectedCount === totalFilteredCount && totalFilteredCount > 0;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isSelectionMode && (
        <>
          <span className="text-sm text-muted-foreground">
            {selectedCount} selected
          </span>

          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
              className="flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>
                {deleteButtonText} ({selectedCount})
              </span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            disabled={totalFilteredCount === 0}
          >
            {isAllSelected ? deselectAllText : selectAllText}
          </Button>
        </>
      )}

      <Button
        variant={isSelectionMode ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleSelectionMode}
      >
        {isSelectionMode ? (
          <>
            <X className="h-4 w-4 mr-1" />
            {cancelText}
          </>
        ) : (
          selectItemsText
        )}
      </Button>
    </div>
  );
};

export default SelectionControls;
