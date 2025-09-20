// components/common/SearchBar.tsx
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '@/utils/helpers';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SearchBar = ({
  searchQuery,
  onSearchChange,
  onClear,
  placeholder = 'Search...',
  className,
  showClearButton = true,
  disabled = false,
  size = 'md',
}: SearchBarProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground',
          iconSizeClasses[size]
        )}
      />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'pl-8',
          sizeClasses[size],
          showClearButton && searchQuery && 'pr-8'
        )}
      />
      {showClearButton && searchQuery && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          type="button"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
