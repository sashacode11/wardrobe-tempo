// FilterPanel.tsx
import React, { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
import { FilterConfig } from '@/hooks/useFilters';

interface FilterPanelProps {
  filters: FilterConfig[];
  activeFilters: Record<string, string>;
  onUpdateFilter: (key: string, value: string) => void;
  // ... other props
}

const FilterPanel = ({
  filters,
  activeFilters,
  onUpdateFilter,
}: FilterPanelProps) => {
  // 💡 Compute expanded state based on active filters
  const initialExpanded = useMemo(() => {
    const expanded: Record<string, boolean> = {};
    filters.forEach(filter => {
      // Open if there's an active value for this filter
      expanded[filter.key] = !!activeFilters[filter.key];
    });
    return expanded;
  }, [filters, activeFilters]);

  const [expandedFilters, setExpandedFilters] = useState<
    Record<string, boolean>
  >({});

  // 🔁 Keep expanded state in sync when activeFilters change
  React.useEffect(() => {
    const newExpanded = { ...expandedFilters };
    let hasChanges = false;

    filters.forEach(filter => {
      const isActive = !!activeFilters[filter.key];
      if (isActive && !newExpanded[filter.key]) {
        newExpanded[filter.key] = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setExpandedFilters(newExpanded);
    }
  }, [activeFilters, filters, expandedFilters]);

  const toggleExpand = (key: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6 px-1">
      {filters.map(filter => (
        <div key={filter.key} className="space-y-4">
          {/* Header */}
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpand(filter.key)}
          >
            <h4 className="text-sm text-gray-500  tracking-wide font-bold">
              {filter.label}
            </h4>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                expandedFilters[filter.key] ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>

          {expandedFilters[filter.key] && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filter.options.map(option => {
                const displayValue =
                  option.charAt(0).toUpperCase() + option.slice(1);
                const isActive = activeFilters[filter.key] === option;

                return (
                  <Button
                    key={option}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs px-3 py-1.5 rounded-md"
                    onClick={e => {
                      e.stopPropagation();
                      const currentFilterValue = activeFilters[filter.key];
                      if (currentFilterValue === option) {
                        // Deselect if already selected
                        onUpdateFilter(filter.key, '');
                      } else {
                        onUpdateFilter(filter.key, option);
                      }
                    }}
                  >
                    {displayValue}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterPanel;
