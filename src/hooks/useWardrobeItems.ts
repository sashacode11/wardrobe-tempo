// useWardrobeItems.ts
import { ClothingItemType } from '@/types';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentUser, supabase } from '../lib/supabaseClient';

export function getUniqueCategories(items: ClothingItemType[]): string[] {
  if (!items || !Array.isArray(items)) return [];
  return [...new Set(items.map(item => item.category))].filter(Boolean);
}

export function getUniqueColors(items: ClothingItemType[]): string[] {
  if (!items || !Array.isArray(items)) return [];
  return [...new Set(items.map(item => item.color))].filter(Boolean);
}

export function getUniqueSeasons(items: ClothingItemType[]): string[] {
  if (!items || !Array.isArray(items)) return [];

  const allSeasons = items.flatMap(item => {
    // Try both 'seasons' (plural) and 'season' (singular) fields
    const seasonData = item.seasons || item.season;

    if (!seasonData) return [];

    // If it's already an array
    if (Array.isArray(seasonData)) {
      return seasonData.flatMap(s => {
        // Handle nested arrays or JSON strings
        if (typeof s === 'string') {
          // Check if it's a JSON string like '["spring"]'
          if (s.startsWith('[') && s.endsWith(']')) {
            try {
              const parsed = JSON.parse(s);
              return Array.isArray(parsed) ? parsed : [s];
            } catch {
              return [s];
            }
          }
          return [s];
        }
        if (Array.isArray(s)) return s;
        return [];
      });
    }

    // If it's a string
    if (typeof seasonData === 'string') {
      // Check if it's a JSON string like '["spring"]'
      if (seasonData.startsWith('[') && seasonData.endsWith(']')) {
        try {
          const parsed = JSON.parse(seasonData);
          return Array.isArray(parsed) ? parsed : [seasonData];
        } catch {
          return [seasonData];
        }
      }
      return [seasonData];
    }

    return [];
  });

  // Clean up: remove empty values and ensure we only have strings
  const cleanSeasons = allSeasons
    .filter(
      season => season && typeof season === 'string' && season.trim() !== ''
    )
    .map(season => season.trim());

  return [...new Set(cleanSeasons)];
}

export function getUniqueOccasions(items: ClothingItemType[]): string[] {
  if (!items || !Array.isArray(items)) return [];

  const allOccasions = items.flatMap(item => {
    // Try both 'occasions' (plural) and 'occasion' (singular) fields
    const occasionData = item.occasions || item.occasion;

    if (!occasionData) return [];

    // If it's already an array
    if (Array.isArray(occasionData)) {
      return occasionData.flatMap(o => {
        // Handle nested arrays or JSON strings
        if (typeof o === 'string') {
          // Check if it's a JSON string like '["casual"]'
          if (o.startsWith('[') && o.endsWith(']')) {
            try {
              const parsed = JSON.parse(o);
              return Array.isArray(parsed) ? parsed : [o];
            } catch {
              return [o];
            }
          }
          return [o];
        }
        if (Array.isArray(o)) return o;
        return [];
      });
    }

    // If it's a string
    if (typeof occasionData === 'string') {
      // Check if it's a JSON string like '["casual"]'
      if (occasionData.startsWith('[') && occasionData.endsWith(']')) {
        try {
          const parsed = JSON.parse(occasionData);
          return Array.isArray(parsed) ? parsed : [occasionData];
        } catch {
          return [occasionData];
        }
      }
      return [occasionData];
    }

    return [];
  });

  // Clean up: remove empty values and ensure we only have strings
  const cleanOccasions = allOccasions
    .filter(
      occasion =>
        occasion && typeof occasion === 'string' && occasion.trim() !== ''
    )
    .map(occasion => occasion.trim());

  return [...new Set(cleanOccasions)];
}

// Global cache to share data across all hook instances
let globalWardrobeCache: {
  data: ClothingItemType[] | null;
  loading: boolean;
  error: string | null;
  promise: Promise<ClothingItemType[]> | null;
  subscribers: Set<() => void>;
} = {
  data: null,
  loading: false,
  error: null,
  promise: null,
  subscribers: new Set(),
};

// Global fetch function that ensures only one API call happens
const fetchWardrobeItemsGlobal = async (): Promise<ClothingItemType[]> => {
  // If already fetching, return the existing promise
  if (globalWardrobeCache.promise) {
    return globalWardrobeCache.promise;
  }

  // If data already exists, return it
  if (globalWardrobeCache.data) {
    return globalWardrobeCache.data;
  }

  // Create new fetch promise
  globalWardrobeCache.promise = (async () => {
    try {
      globalWardrobeCache.loading = true;
      globalWardrobeCache.error = null;

      // Notify all subscribers about loading state
      globalWardrobeCache.subscribers.forEach(callback => callback());

      const user = await getCurrentUser();
      if (!user) {
        throw new Error('No user found');
      }

      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Failed to load wardrobe items');
      }

      const wardrobeData = data || [];

      // Update global cache
      globalWardrobeCache.data = wardrobeData;
      globalWardrobeCache.loading = false;
      globalWardrobeCache.error = null;

      return wardrobeData;
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      globalWardrobeCache.loading = false;
      globalWardrobeCache.error =
        error instanceof Error
          ? error.message
          : 'Failed to load wardrobe items';
      globalWardrobeCache.data = [];
      return [];
    } finally {
      globalWardrobeCache.promise = null;
      // Notify all subscribers about completion
      globalWardrobeCache.subscribers.forEach(callback => callback());
    }
  })();

  return globalWardrobeCache.promise;
};

// 🔹 Custom Hook: Use Wardrobe Items + Categories with shared caching
export function useWardrobeItems(initialItems: ClothingItemType[] = []) {
  const [localData, setLocalData] = useState<{
    items: ClothingItemType[];
    loading: boolean;
    error: string | null;
  }>(() => ({
    items: globalWardrobeCache.data || initialItems,
    loading: globalWardrobeCache.loading,
    error: globalWardrobeCache.error,
  }));

  const forceUpdate = useCallback(() => {
    setLocalData({
      items: globalWardrobeCache.data || [],
      loading: globalWardrobeCache.loading,
      error: globalWardrobeCache.error,
    });
  }, []);

  // Subscribe to global cache updates
  useEffect(() => {
    globalWardrobeCache.subscribers.add(forceUpdate);

    return () => {
      globalWardrobeCache.subscribers.delete(forceUpdate);
    };
  }, [forceUpdate]);

  // Fetch data on mount if needed
  useEffect(() => {
    if (
      initialItems.length === 0 &&
      !globalWardrobeCache.data &&
      !globalWardrobeCache.loading
    ) {
      fetchWardrobeItemsGlobal();
    }
  }, [initialItems.length]);

  // Automatically compute categories when items change
  const categories = useMemo(
    () => getUniqueCategories(localData.items),
    [localData.items]
  );

  const colors = useMemo(
    () => getUniqueColors(localData.items),
    [localData.items]
  );

  const seasons = useMemo(
    () => getUniqueSeasons(localData.items),
    [localData.items]
  );

  const occasions = useMemo(
    () => getUniqueOccasions(localData.items),
    [localData.items]
  );

  const refetch = useCallback(async () => {
    // Clear cache and fetch fresh data
    globalWardrobeCache.data = null;
    globalWardrobeCache.error = null;
    globalWardrobeCache.promise = null;

    return fetchWardrobeItemsGlobal();
  }, []);

  const setWardrobeItems = useCallback(
    (items: ClothingItemType[]) => {
      // Update both global cache and local state
      globalWardrobeCache.data = items;
      setLocalData(prev => ({ ...prev, items }));

      // Notify all other subscribers
      globalWardrobeCache.subscribers.forEach(callback => {
        if (callback !== forceUpdate) {
          callback();
        }
      });
    },
    [forceUpdate]
  );

  return {
    wardrobeItems: localData.items,
    setWardrobeItems,
    categories,
    colors,
    seasons,
    occasions,
    loading: localData.loading,
    error: localData.error,
    refetch,
  };
}
