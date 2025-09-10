// hooks/useFlexSearch.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { Index } from 'flexsearch';
import { ClothingItemType } from '../types';

interface UseFlexSearchOptions {
  searchFields?: (keyof ClothingItemType)[];
  minQueryLength?: number;
  maxResults?: number;
}

export const useFlexSearch = (
  items: ClothingItemType[],
  options: UseFlexSearchOptions = {}
) => {
  const {
    searchFields = ['name', 'description', 'color', 'category', 'brand'],
    minQueryLength = 1,
    maxResults = 100,
  } = options;

  const indexRef = useRef<Index | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClothingItemType[]>([]);

  // Initialize FlexSearch index
  const index = useMemo(() => {
    return new Index({
      preset: 'match',
      tokenize: 'forward',
      resolution: 9,
      depth: 2,
      bidirectional: true,
      suggest: true,
    });
  }, []);

  // Index items when they change
  useEffect(() => {
    if (!items.length) {
      setSearchResults([]);
      return;
    }

    setIsIndexing(true);
    indexRef.current = index;

    // Clear existing index
    index.clear();

    // Add items to index
    items.forEach(item => {
      // Combine searchable fields into a single text
      const searchableText = searchFields
        .map(field => {
          const value = item[field];
          return Array.isArray(value) ? value.join(' ') : String(value || '');
        })
        .join(' ')
        .toLowerCase();

      index.add(item.id, searchableText);
    });

    setIsIndexing(false);
  }, [items, index, searchFields]);

  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery || searchQuery.length < minQueryLength) {
      setSearchResults([]);
      return;
    }

    if (!indexRef.current || isIndexing) {
      return;
    }

    try {
      // Perform the search
      const resultIds = indexRef.current.search(searchQuery.toLowerCase(), {
        limit: maxResults,
        suggest: true,
      });

      // Map result IDs back to items
      const results = (resultIds as string[])
        .map(id => items.find(item => item.id === id))
        .filter(Boolean) as ClothingItemType[];

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  }, [searchQuery, items, isIndexing, maxResults, minQueryLength]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const hasResults = searchResults.length > 0;
  const hasQuery = searchQuery.length >= minQueryLength;

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    clearSearch,
    isIndexing,
    hasResults,
    hasQuery,
    resultCount: searchResults.length,
  };
};
