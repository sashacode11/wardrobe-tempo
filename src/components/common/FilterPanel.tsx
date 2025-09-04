// components/common/FilterPanel.tsx
import React from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '@/lib/utils';
import { FilterConfig } from '@/hooks/useFilters';

// export interface FilterConfig {
//   key: string;
//   label: string;
//   options: string[];
//   placeholder?: string;
// }

export interface ActiveFilterEntry {
  key: string;
  label: string;
  value: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  activeFilters: Record<string, string>;
  onUpdateFilter: (key: string, value: string) => void;
  onClearFilter: (key: string) => void;
  onClearAllFilters: () => void;
  activeFilterEntries: ActiveFilterEntry[];
  hasActiveFilters: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
  className?: string;
  buttonText?: string;
  showMobileButton?: boolean;
}

const FilterPanel = ({
  filters,
  activeFilters,
  onUpdateFilter,
  onClearFilter,
  onClearAllFilters,
  activeFilterEntries,
  hasActiveFilters,
  showFilters,
  onToggleFilters,
  className,
  buttonText = 'Filter',
  showMobileButton = true,
}: FilterPanelProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {activeFilterEntries.map(entry => (
            <Badge
              key={entry.key}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {entry.label}: {entry.value}
              <button
                onClick={() => onClearFilter(entry.key)}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label={`Clear ${entry.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="h-7"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Toggle Buttons */}
      <div className="flex justify-between items-center">
        {/* Mobile Filter Button */}
        {showMobileButton && (
          <button
            onClick={onToggleFilters}
            className="flex md:hidden items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            type="button"
          >
            <Filter className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-700">
              {buttonText}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                showFilters ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
        )}

        {/* Desktop Filter Button */}
        <button
          onClick={onToggleFilters}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors duration-200"
          type="button"
        >
          <Filter className="h-4 w-4" />
          {buttonText}
        </button>
      </div>

      {/* Filter Options Panel */}
      {showFilters && (
        <div className="bg-muted/30 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map(filter => (
            <div key={filter.key}>
              <label className="text-sm font-medium mb-1 block">
                {filter.label}
              </label>
              <Select
                value={activeFilters[filter.key] || ''}
                onValueChange={value => onUpdateFilter(filter.key, value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      filter.placeholder ||
                      `Select ${filter.label.toLowerCase()}`
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map(option => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
