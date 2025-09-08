// hooks/useFilters.ts
import { useState, useMemo } from 'react';

export interface FilterOptions {
  [key: string]: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: string[];
  placeholder?: string;
}

export interface UseFiltersOptions {
  filterConfigs: FilterConfig[];
  initialFilters?: FilterOptions;
}

export const useFilters = <T>(items: T[], options: UseFiltersOptions) => {
  const { filterConfigs, initialFilters = {} } = options;

  // Initialize filter state
  const [activeFilters, setActiveFilters] = useState<FilterOptions>(() => {
    const initial: FilterOptions = {};
    filterConfigs.forEach(config => {
      initial[config.key] = initialFilters[config.key] || '';
    });
    return initial;
  });

  // Helper function to check if a value contains the filter value
  const valueContainsFilter = (value: any, filterValue: string): boolean => {
    if (!value || !filterValue) return false;

    // If it's an array, check if it includes the filter value
    if (Array.isArray(value)) {
      return value.includes(filterValue);
    }

    // If it's a string, check different formats
    if (typeof value === 'string') {
      // Direct match
      if (value === filterValue) return true;

      // Check if it's a JSON array string like '["exercise"]'
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.includes(filterValue);
          }
        } catch {
          // If parsing fails, treat as regular string
          return value === filterValue;
        }
      }

      // Check if it contains the value (for comma-separated strings)
      if (value.includes(',')) {
        return value
          .split(',')
          .map(v => v.trim())
          .includes(filterValue);
      }
    }

    return false;
  };

  // Apply filters to items
  const filteredItems = useMemo(() => {
    console.log('🔍 FILTERING START:');
    console.log('Total items:', items?.length);
    console.log('Active filters:', activeFilters);

    if (!items || !Array.isArray(items)) {
      console.log('❌ Items is not an array or is null/undefined');
      return [];
    }

    const filtered = items.filter(item => {
      // Check each filter
      for (const config of filterConfigs) {
        const filterValue = activeFilters[config.key];
        if (!filterValue) continue; // Skip if no filter value

        // Get the item's value for this field
        let itemValue = (item as any)[config.key];

        // For seasons/occasions, also check singular forms
        if (
          !itemValue &&
          (config.key === 'seasons' || config.key === 'occasions')
        ) {
          const singularKey = config.key.slice(0, -1); // remove 's'
          itemValue = (item as any)[singularKey];
        }

        console.log(`🔍 Checking ${config.key}:`, {
          filterValue,
          itemValue,
          itemValueType: typeof itemValue,
        });

        // Check if this item matches the filter
        const matches = valueContainsFilter(itemValue, filterValue);
        console.log(`🎯 Match result for ${config.key}:`, matches);

        if (!matches) {
          return false; // If any filter doesn't match, exclude this item
        }
      }

      return true; // All filters match
    });

    console.log('🏁 Filtered items count:', filtered.length);
    return filtered;
  }, [items, activeFilters, filterConfigs]);

  // Update a single filter
  const updateFilter = (key: string, value: string) => {
    console.log('🔥 FILTER UPDATE TRIGGERED:');
    console.log('Filter key:', key);
    console.log('New value:', value);
    setActiveFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {};
    filterConfigs.forEach(config => {
      clearedFilters[config.key] = '';
    });
    setActiveFilters(clearedFilters);
  };

  // Clear a specific filter
  const clearFilter = (key: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: '',
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some(value => value !== '');
  }, [activeFilters]);

  // Get active filter entries (for displaying badges)
  const activeFilterEntries = useMemo(() => {
    return filterConfigs
      .map(config => ({
        key: config.key,
        label: config.label,
        value: activeFilters[config.key],
      }))
      .filter(entry => entry.value !== '');
  }, [activeFilters, filterConfigs]);

  return {
    activeFilters,
    filteredItems,
    updateFilter,
    clearAllFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterEntries,
    setActiveFilters,
  };
};
