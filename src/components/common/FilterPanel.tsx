// components/common/FilterPanel.tsx
import React from 'react';
import { X } from 'lucide-react';
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
  className?: string;
}

const FilterPanel = ({
  filters,
  activeFilters,
  onUpdateFilter,
  onClearFilter,
  onClearAllFilters,
  activeFilterEntries,
  hasActiveFilters,
  className,
}: FilterPanelProps) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Active Filters Pills */}
      {/* {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active:</span>

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
            className="h-7 text-xs font-medium"
          >
            Clear all
          </Button>
        </div>
      )} */}

      {/* Filter Options (Always Visible in Modal) */}
      <div className="grid rid-cols gap-4">
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
                    filter.placeholder || `Select ${filter.label.toLowerCase()}`
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
    </div>
  );
};

export default FilterPanel;
