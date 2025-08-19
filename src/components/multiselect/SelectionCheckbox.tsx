import React from 'react';
import { Checkbox } from '../ui/checkbox';

interface SelectionCheckboxProps {
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  className?: string;
  checkboxClassName?: string;
}

const SelectionCheckbox: React.FC<SelectionCheckboxProps> = ({
  isSelectionMode,
  isSelected,
  onToggleSelection,
  className = 'absolute top-2 left-2 z-10',
  checkboxClassName = 'bg-white border-2',
}) => {
  if (!isSelectionMode) return null;

  return (
    <div className={className}>
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelection}
        className={checkboxClassName}
      />
    </div>
  );
};

export default SelectionCheckbox;
