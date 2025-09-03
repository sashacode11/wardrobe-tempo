import { ClothingItemType } from '@/types';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentUser, supabase } from '../lib/supabaseClient';

export function getUniqueCategories(items: ClothingItemType[]): string[] {
  if (!items || !Array.isArray(items)) return [];
  return [...new Set(items.map(item => item.category))].filter(Boolean);
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
    loading: localData.loading,
    error: localData.error,
    refetch,
  };
}
