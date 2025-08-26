import { useState, useCallback } from 'react';
import { supabase, getCurrentUser } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type ClothingItemType = Database['public']['Tables']['wardrobe_items']['Row'];
type OutfitType = Database['public']['Tables']['outfits']['Row'];

interface OutfitWithItems extends OutfitType {
  occasions?: string[];
  outfit_items: {
    clothing_item_id: string;
    wardrobe_items: ClothingItemType;
  }[];
}

interface UseItemOutfitsReturn {
  outfits: OutfitWithItems[];
  isLoading: boolean;
  error: string | null;
  fetchItemOutfits: (itemId: string) => Promise<void>;
  clearOutfits: () => void;
}

export const useItemOutfits = (): UseItemOutfitsReturn => {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItemOutfits = useCallback(async (itemId: string) => {
    if (!itemId) {
      console.error('❌ useItemOutfits: No itemId provided');
      setError('Item ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutfits([]); // Clear previous results

    try {
      const user = await getCurrentUser();

      if (!user) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      // First, get all outfit_items that contain this clothing item
      const { data: outfitItems, error: outfitItemsError } = await supabase
        .from('outfit_items')
        .select('outfit_id, clothing_item_id') // Added clothing_item_id to debug
        .eq('clothing_item_id', itemId);

      if (outfitItemsError) {
        console.error(
          '❌ useItemOutfits: outfit_items query error:',
          outfitItemsError
        );
        throw new Error(outfitItemsError.message);
      }

      if (!outfitItems || outfitItems.length === 0) {
        // Debug: Check if the item exists at all
        const { data: wardrobeCheck, error: wardrobeError } = await supabase
          .from('wardrobe_items')
          .select('id, name, category')
          .eq('id', itemId)
          .eq('user_id', user.id)
          .single();

        // Debug: Check what outfit_items exist for this user
        const { data: allOutfitItems, error: allOutfitItemsError } =
          await supabase
            .from('outfit_items')
            .select('outfit_id, clothing_item_id')
            .limit(10);

        setOutfits([]);
        setIsLoading(false);
        return;
      }

      // Get the outfit IDs
      const outfitIds = outfitItems.map(item => item.outfit_id);

      const { data: outfitsData, error: outfitsError } = await supabase
        .from('outfits')
        .select(
          `
          *,
          outfit_items (
            clothing_item_id,
            wardrobe_items (*)
          )
        `
        )
        .in('id', outfitIds)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (outfitsError) {
        console.error('❌ useItemOutfits: outfits query error:', outfitsError);
        throw new Error(outfitsError.message);
      }

      setOutfits((outfitsData as OutfitWithItems[]) || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch outfits';
      console.error('❌ useItemOutfits: Error fetching item outfits:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearOutfits = useCallback(() => {
    setOutfits([]);
    setError(null);
  }, []);

  return {
    outfits,
    isLoading,
    error,
    fetchItemOutfits,
    clearOutfits,
  };
};
