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

  // Apply filters to items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      return filterConfigs.every(config => {
        const filterValue = activeFilters[config.key];
        if (!filterValue) return true; // No filter applied

        const itemValue = (item as any)[config.key];

        // Handle array fields (like seasons, occasions, tags)
        if (Array.isArray(itemValue)) {
          return itemValue.includes(filterValue);
        }

        // Handle string fields
        return itemValue === filterValue;
      });
    });
  }, [items, activeFilters, filterConfigs]);

  // Update a single filter
  const updateFilter = (key: string, value: string) => {
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
