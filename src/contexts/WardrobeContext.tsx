// contexts/WardrobeContext.tsx - Fixed image reloading issue
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  getClothingItems,
  getCurrentUser,
  supabase,
} from '../lib/supabaseClient';
import {
  ClothingItemType,
  OutfitItem,
  Outfit,
  OutfitWithItems,
} from '../types';

interface WardrobeContextType {
  // Data
  wardrobeItems: ClothingItemType[];
  outfits: OutfitWithItems[];
  user: any;

  // Loading states
  itemsLoading: boolean;
  outfitsLoading: boolean;
  authLoading: boolean;
  error: string | null;

  // Global search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Search results (computed)
  searchResults: ClothingItemType[];
  outfitSearchResults: OutfitWithItems[];
  hasSearchResults: boolean;
  hasSearchQuery: boolean;

  // New properties for incomplete outfits
  incompleteOutfits: OutfitWithItems[];
  incompleteCount: number;

  // Refresh states
  refreshItems: () => Promise<void>;
  refreshOutfits: (force?: Boolean) => Promise<void>;
  refreshAll: () => Promise<void>;

  // User management
  checkUser: () => Promise<void>;
  setUser: (user: any) => void;

  // Item management
  addItem: (item: ClothingItemType) => void;
  updateItem: (item: ClothingItemType) => void;
  removeItem: (id: string) => void;

  // Outfit management
  addOutfit: (outfit: OutfitWithItems) => void;
  updateOutfit: (outfit: OutfitWithItems) => void;
  removeOutfit: (id: string) => void;

  // New methods for incomplete outfit management
  markOutfitsAsIncomplete: (itemIds: string[]) => Promise<void>;
  getAffectedOutfits: (itemIds: string[]) => Promise<OutfitWithItems[]>;
  repairOutfit: (
    outfitId: string,
    replacementItems: ClothingItemType[]
  ) => Promise<void>;
  deleteIncompleteOutfit: (outfitId: string) => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextType | null>(null);

interface WardrobeProviderProps {
  children: ReactNode;
}

export const WardrobeProvider: React.FC<WardrobeProviderProps> = ({
  children,
}) => {
  // Core data state
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItemType[]>([]);
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [user, setUser] = useState(null);

  // Loading states
  const [itemsLoading, setItemsLoading] = useState(true);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache management - separate for items and outfits
  const [lastItemsFetchTime, setLastItemsFetchTime] = useState<number | null>(
    null
  );
  const [lastOutfitsFetchTime, setLastOutfitsFetchTime] = useState<
    number | null
  >(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const SHORT_CACHE_DURATION = 30 * 1000; // 30 seconds for quick returns

  // Track last visibility change to prevent unnecessary refreshes
  const lastVisibilityChange = useRef<number>(Date.now());

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Simple text-based search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return wardrobeItems;

    const query = searchQuery.toLowerCase();
    return wardrobeItems.filter(
      item =>
        item.name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.color?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        (Array.isArray(item.seasons) &&
          item.seasons.some(season => season.toLowerCase().includes(query))) ||
        (Array.isArray(item.occasions) &&
          item.occasions.some(occasion =>
            occasion.toLowerCase().includes(query)
          )) ||
        (Array.isArray(item.tags) &&
          item.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [wardrobeItems, searchQuery]);

  // Search outfits
  const outfitSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return outfits;

    const query = searchQuery.toLowerCase();
    return outfits.filter(
      outfit =>
        outfit.name?.toLowerCase().includes(query) ||
        outfit.description?.toLowerCase().includes(query) ||
        (Array.isArray(outfit.occasions) &&
          outfit.occasions.some(occasion =>
            occasion.toLowerCase().includes(query)
          )) ||
        outfit.items?.some(
          item =>
            item.name?.toLowerCase().includes(query) ||
            item.category?.toLowerCase().includes(query) ||
            item.color?.toLowerCase().includes(query)
        )
    );
  }, [outfits, searchQuery]);

  // Computed search state
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasSearchResults =
    searchResults.length > 0 || outfitSearchResults.length > 0;

  // Computed incomplete outfits
  const incompleteOutfits = useMemo(() => {
    return outfits.filter(outfit => !outfit.is_complete);
  }, [outfits]);

  const incompleteCount = incompleteOutfits.length;

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Check user authentication
  const checkUser = async () => {
    try {
      setAuthLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check user');
      console.error('Error checking user:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch wardrobe items with caching
  const refreshItems = useCallback(
    async (force = false) => {
      if (!user) {
        setWardrobeItems([]);
        setItemsLoading(false);
        return;
      }

      // Check cache
      const now = Date.now();
      if (
        !force &&
        lastItemsFetchTime &&
        now - lastItemsFetchTime < CACHE_DURATION
      ) {
        return;
      }

      try {
        setItemsLoading(true);
        setError(null);

        const { data, error: fetchError } = await getClothingItems(user.id);
        if (fetchError) throw fetchError;

        setWardrobeItems(data || []);
        setLastItemsFetchTime(Date.now());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
        console.error('Error fetching wardrobe items:', err);
      } finally {
        setItemsLoading(false);
      }
    },
    [user, lastItemsFetchTime]
  );

  // Enhanced refresh outfits with caching
  const refreshOutfits = useCallback(
    async (force = false) => {
      if (!user) {
        setOutfits([]);
        setOutfitsLoading(false);
        return;
      }

      // Check cache
      const now = Date.now();
      if (
        !force &&
        lastOutfitsFetchTime &&
        now - lastOutfitsFetchTime < CACHE_DURATION
      ) {
        return;
      }

      try {
        setOutfitsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('outfits')
          .select(
            `
        *,
        outfit_items (
          *,
          wardrobe_items (*)
        )
      `
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const transformedOutfits: OutfitWithItems[] = (data || []).map(
          outfit => {
            const validItems =
              outfit.outfit_items?.filter(oi => oi.wardrobe_items) || [];
            const totalItems = outfit.outfit_items?.length || 0;

            return {
              ...outfit,
              items: validItems.map(oi => oi.wardrobe_items),
              outfit_items: outfit.outfit_items || [],
              is_complete: validItems.length === totalItems && totalItems > 0,
              missing_items_count: totalItems - validItems.length,
            };
          }
        );

        setOutfits(transformedOutfits);
        setLastOutfitsFetchTime(Date.now());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch outfits'
        );
        console.error('Error fetching outfits:', err);
      } finally {
        setOutfitsLoading(false);
      }
    },
    [user, lastOutfitsFetchTime]
  );

  // Refresh all data
  const refreshAll = useCallback(
    async (force = false) => {
      await Promise.all([refreshItems(force), refreshOutfits(force)]);
    },
    [refreshItems, refreshOutfits]
  );

  // Item management methods
  const addItem = (item: ClothingItemType) => {
    setWardrobeItems(prev => [item, ...prev]);
    setLastItemsFetchTime(Date.now()); // Update cache time
  };

  const updateItem = (updatedItem: ClothingItemType) => {
    setWardrobeItems(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
    setLastItemsFetchTime(Date.now()); // Update cache time
  };

  const removeItem = (id: string) => {
    setWardrobeItems(prev => prev.filter(item => item.id !== id));
    setLastItemsFetchTime(Date.now()); // Update cache time
  };

  // Outfit management methods
  const addOutfit = (outfit: OutfitWithItems) => {
    setOutfits(prev => [outfit, ...prev]);
    setLastOutfitsFetchTime(Date.now()); // Update cache time
  };

  const updateOutfit = (updatedOutfit: OutfitWithItems) => {
    setOutfits(prev =>
      prev.map(outfit =>
        outfit.id === updatedOutfit.id ? updatedOutfit : outfit
      )
    );
    setLastOutfitsFetchTime(Date.now()); // Update cache time
  };

  const removeOutfit = (id: string) => {
    setOutfits(prev => prev.filter(outfit => outfit.id !== id));
    setLastOutfitsFetchTime(Date.now()); // Update cache time
  };

  // Check which outfits will be affected by deleting items
  const getAffectedOutfits = async (
    itemIds: string[]
  ): Promise<OutfitWithItems[]> => {
    try {
      const { data, error } = await supabase
        .from('outfit_items')
        .select(
          `
        outfit_id,
        outfits (
          *,
          outfit_items (
            *,
            wardrobe_items (*)
          )
        )
      `
        )
        .in('clothing_item_id', itemIds);

      if (error) throw error;

      const affectedOutfitsMap = new Map();

      data?.forEach(item => {
        if (item.outfits && !affectedOutfitsMap.has(item.outfits.id)) {
          const outfit = {
            ...item.outfits,
            items:
              item.outfits.outfit_items
                ?.map(oi => oi.wardrobe_items)
                .filter(Boolean) || [],
            outfit_items: item.outfits.outfit_items || [],
          };
          affectedOutfitsMap.set(item.outfits.id, outfit);
        }
      });

      return Array.from(affectedOutfitsMap.values());
    } catch (error) {
      console.error('Error getting affected outfits:', error);
      return [];
    }
  };

  // Mark outfits as incomplete after item deletion
  const markOutfitsAsIncomplete = async (deletedItemIds: string[]) => {
    try {
      const affectedOutfits = await getAffectedOutfits(deletedItemIds);

      if (affectedOutfits.length === 0) return;

      const outfitIds = affectedOutfits.map(outfit => outfit.id);

      const { error } = await supabase
        .from('outfits')
        .update({
          is_complete: false,
          last_incomplete_at: new Date().toISOString(),
        })
        .in('id', outfitIds);

      if (error) throw error;

      setOutfits(prev =>
        prev.map(outfit =>
          outfitIds.includes(outfit.id)
            ? {
                ...outfit,
                is_complete: false,
                last_incomplete_at: new Date().toISOString(),
              }
            : outfit
        )
      );
      setLastOutfitsFetchTime(Date.now()); // Update cache time
    } catch (error) {
      console.error('Error marking outfits as incomplete:', error);
      throw error;
    }
  };

  // Repair an outfit by adding replacement items
  const repairOutfit = async (
    outfitId: string,
    replacementItems: ClothingItemType[]
  ) => {
    try {
      const outfitItems = replacementItems.map(item => ({
        outfit_id: outfitId,
        clothing_item_id: parseInt(item.id),
      }));

      if (outfitItems.length > 0) {
        const { error: insertError } = await supabase
          .from('outfit_items')
          .insert(outfitItems);

        if (insertError) throw insertError;
      }

      const { error: updateError } = await supabase
        .from('outfits')
        .update({
          is_complete: true,
          last_incomplete_at: null,
        })
        .eq('id', outfitId);

      if (updateError) throw updateError;

      await refreshOutfits(true); // Force refresh after repair
    } catch (error) {
      console.error('Error repairing outfit:', error);
      throw error;
    }
  };

  // Delete an incomplete outfit
  const deleteIncompleteOutfit = async (outfitId: string) => {
    try {
      const { error: outfitItemsError } = await supabase
        .from('outfit_items')
        .delete()
        .eq('outfit_id', outfitId);

      if (outfitItemsError) throw outfitItemsError;

      const { error: outfitError } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

      if (outfitError) throw outfitError;

      removeOutfit(outfitId);
    } catch (error) {
      console.error('Error deleting incomplete outfit:', error);
      throw error;
    }
  };

  // Initialize user
  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setWardrobeItems([]);
        setOutfits([]);
        setSearchQuery('');
        setLastItemsFetchTime(null);
        setLastOutfitsFetchTime(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      setWardrobeItems([]);
      setOutfits([]);
      setItemsLoading(false);
      setOutfitsLoading(false);
    }
  }, [user]); // Removed refreshAll from dependencies

  // Smart auto-refresh - only refresh if user was away for more than 30 seconds
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChange.current;

      if (!document.hidden && user) {
        // Only refresh if user was away for more than 30 seconds
        if (timeSinceLastChange > SHORT_CACHE_DURATION) {
          console.log('User returned after being away - refreshing data');
          refreshAll(false); // Use cache if available
        } else {
          console.log('User returned quickly - using cached data');
        }
        lastVisibilityChange.current = now;
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChange.current;

      if (user && timeSinceLastChange > SHORT_CACHE_DURATION) {
        console.log('Window got focus after being away - refreshing data');
        refreshAll(false); // Use cache if available
        lastVisibilityChange.current = now;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]); // Removed refreshAll from dependencies

  const value: WardrobeContextType = {
    wardrobeItems,
    outfits,
    user,
    itemsLoading,
    outfitsLoading,
    authLoading,
    error,
    searchQuery,
    setSearchQuery,
    clearSearch,
    searchResults,
    outfitSearchResults,
    hasSearchResults,
    hasSearchQuery,
    incompleteOutfits,
    incompleteCount,
    refreshItems,
    refreshOutfits,
    refreshAll,
    checkUser,
    setUser,
    addItem,
    updateItem,
    removeItem,
    addOutfit,
    updateOutfit,
    removeOutfit,
    markOutfitsAsIncomplete,
    getAffectedOutfits,
    repairOutfit,
    deleteIncompleteOutfit,
  };

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within WardrobeProvider');
  }
  return context;
};
