// contexts/WardrobeContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import {
  getClothingItems,
  getCurrentUser,
  supabase,
} from '../lib/supabaseClient';
import { ClothingItemType } from '../types';

// Types based on your existing structure
export interface OutfitItem {
  id: string;
  outfit_id: string;
  clothing_item_id: number;
  created_at: string;
  wardrobe_items?: ClothingItemType; // Join data
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  occasions?: string[];
  created_at: string;
  updated_at: string;
  outfit_items?: OutfitItem[];
}

export interface OutfitWithItems extends Outfit {
  items: ClothingItemType[]; // Flattened items for easier use
  outfit_items: OutfitItem[];
}

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

  // Methods
  refreshItems: () => Promise<void>;
  refreshOutfits: () => Promise<void>;
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Simple text-based search (you can enhance this later with FlexSearch)
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
        // Search through outfit items
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

  // Fetch wardrobe items
  const refreshItems = async () => {
    if (!user) {
      setWardrobeItems([]);
      setItemsLoading(false);
      return;
    }

    try {
      setItemsLoading(true);
      setError(null);

      const { data, error: fetchError } = await getClothingItems(user.id);
      if (fetchError) throw fetchError;

      setWardrobeItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error('Error fetching wardrobe items:', err);
    } finally {
      setItemsLoading(false);
    }
  };

  // Fetch outfits with items
  const refreshOutfits = async () => {
    if (!user) {
      setOutfits([]);
      setOutfitsLoading(false);
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

      // Transform the data to match your existing structure
      const transformedOutfits: OutfitWithItems[] = (data || []).map(
        outfit => ({
          ...outfit,
          items:
            outfit.outfit_items?.map(oi => oi.wardrobe_items).filter(Boolean) ||
            [],
          outfit_items: outfit.outfit_items || [],
        })
      );

      setOutfits(transformedOutfits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch outfits');
      console.error('Error fetching outfits:', err);
    } finally {
      setOutfitsLoading(false);
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    await Promise.all([refreshItems(), refreshOutfits()]);
  };

  // Item management methods
  const addItem = (item: ClothingItemType) => {
    setWardrobeItems(prev => [item, ...prev]);
  };

  const updateItem = (updatedItem: ClothingItemType) => {
    setWardrobeItems(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const removeItem = (id: string) => {
    setWardrobeItems(prev => prev.filter(item => item.id !== id));
  };

  // Outfit management methods
  const addOutfit = (outfit: OutfitWithItems) => {
    setOutfits(prev => [outfit, ...prev]);
  };

  const updateOutfit = (updatedOutfit: OutfitWithItems) => {
    setOutfits(prev =>
      prev.map(outfit =>
        outfit.id === updatedOutfit.id ? updatedOutfit : outfit
      )
    );
  };

  const removeOutfit = (id: string) => {
    setOutfits(prev => prev.filter(outfit => outfit.id !== id));
  };

  // Initial auth check
  useEffect(() => {
    checkUser();

    // Listen to auth changes
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
  }, [user]);

  const value: WardrobeContextType = {
    // Data
    wardrobeItems,
    outfits,
    user,

    // Loading states
    itemsLoading,
    outfitsLoading,
    authLoading,
    error,

    // Search state
    searchQuery,
    setSearchQuery,
    clearSearch,

    // Search results
    searchResults,
    outfitSearchResults,
    hasSearchResults,
    hasSearchQuery,

    // Methods
    refreshItems,
    refreshOutfits,
    refreshAll,
    checkUser,
    setUser,

    // Item management
    addItem,
    updateItem,
    removeItem,

    // Outfit management
    addOutfit,
    updateOutfit,
    removeOutfit,
  };

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  );
};

// Custom hook to use the wardrobe context
export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within WardrobeProvider');
  }
  return context;
};
