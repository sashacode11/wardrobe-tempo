// hooks/useSearch.ts
import { useState, useMemo } from 'react';

export interface SearchableItem {
  id: string;
  name: string;
  [key: string]: any;
}

export interface UseSearchOptions {
  searchFields?: string[];
  caseSensitive?: boolean;
}

export const useSearch = <T extends SearchableItem>(
  items: T[],
  options: UseSearchOptions = {}
) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { searchFields = ['name'], caseSensitive = false } = options;

  const filteredItemsfromSearch = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = caseSensitive ? searchQuery : searchQuery.toLowerCase();

    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];

        // Handle string values with null checks
        if (typeof value === 'string' && value) {
          const searchValue = caseSensitive ? value : value.toLowerCase();
          return searchValue.includes(query);
        }

        // Handle array values with null checks
        if (Array.isArray(value)) {
          return value.some(v => {
            if (v == null) return false; // Skip null/undefined values
            const searchValue = caseSensitive
              ? String(v)
              : String(v).toLowerCase();
            return searchValue.includes(query);
          });
        }

        return false;
      });
    });
  }, [items, searchQuery, searchFields, caseSensitive]);

  const clearSearch = () => setSearchQuery('');

  return {
    searchQuery,
    setSearchQuery,
    filteredItemsfromSearch,
    clearSearch,
    hasActiveSearch: searchQuery.trim().length > 0,
  };
};
