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
    console.log('🔍 useItemOutfits: Starting fetch for itemId:', itemId);

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
      console.log(
        '🔍 useItemOutfits: User check:',
        user?.id ? 'authenticated' : 'not authenticated'
      );

      if (!user) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      console.log(
        '🔍 useItemOutfits: Querying outfit_items for clothing_item_id:',
        itemId
      );

      // First, get all outfit_items that contain this clothing item
      const { data: outfitItems, error: outfitItemsError } = await supabase
        .from('outfit_items')
        .select('outfit_id, clothing_item_id') // Added clothing_item_id to debug
        .eq('clothing_item_id', itemId);

      console.log('🔍 useItemOutfits: outfit_items query result:', {
        data: outfitItems,
        error: outfitItemsError,
        count: outfitItems?.length || 0,
      });

      if (outfitItemsError) {
        console.error(
          '❌ useItemOutfits: outfit_items query error:',
          outfitItemsError
        );
        throw new Error(outfitItemsError.message);
      }

      if (!outfitItems || outfitItems.length === 0) {
        console.log(
          '🔍 useItemOutfits: No outfit_items found, checking if item exists in wardrobe...'
        );

        // Debug: Check if the item exists at all
        const { data: wardrobeCheck, error: wardrobeError } = await supabase
          .from('wardrobe_items')
          .select('id, name, category')
          .eq('id', itemId)
          .eq('user_id', user.id)
          .single();

        console.log('🔍 useItemOutfits: Wardrobe item check:', {
          data: wardrobeCheck,
          error: wardrobeError,
        });

        // Debug: Check what outfit_items exist for this user
        const { data: allOutfitItems, error: allOutfitItemsError } =
          await supabase
            .from('outfit_items')
            .select('outfit_id, clothing_item_id')
            .limit(10);

        console.log('🔍 useItemOutfits: Sample outfit_items in database:', {
          data: allOutfitItems,
          error: allOutfitItemsError,
        });

        setOutfits([]);
        setIsLoading(false);
        return;
      }

      // Get the outfit IDs
      const outfitIds = outfitItems.map(item => item.outfit_id);
      console.log('🔍 useItemOutfits: Found outfit IDs:', outfitIds);

      // Fetch the full outfit details
      console.log(
        '🔍 useItemOutfits: Fetching outfit details for IDs:',
        outfitIds
      );

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

      console.log('🔍 useItemOutfits: Outfits query result:', {
        data: outfitsData,
        error: outfitsError,
        count: outfitsData?.length || 0,
      });

      if (outfitsError) {
        console.error('❌ useItemOutfits: outfits query error:', outfitsError);
        throw new Error(outfitsError.message);
      }

      // Debug: Log the structure of returned data
      if (outfitsData && outfitsData.length > 0) {
        outfitsData.forEach((outfit, index) => {
          console.log(`🔍 useItemOutfits: Outfit ${index + 1} structure:`, {
            id: outfit.id,
            name: outfit.name,
            user_id: outfit.user_id,
            outfit_items_count: outfit.outfit_items?.length || 0,
            outfit_items: outfit.outfit_items?.map(item => ({
              clothing_item_id: item.clothing_item_id,
              clothing_item_id: item.wardrobe_items?.id,
              wardrobe_item_name: item.wardrobe_items?.name,
              wardrobe_item_exists: !!item.wardrobe_items,
            })),
          });
        });
      }

      console.log(
        '🔍 useItemOutfits: Setting outfits state with',
        outfitsData?.length || 0,
        'outfits'
      );
      setOutfits((outfitsData as OutfitWithItems[]) || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch outfits';
      console.error('❌ useItemOutfits: Error fetching item outfits:', err);
      setError(errorMessage);
    } finally {
      console.log(
        '🔍 useItemOutfits: Fetch completed, setting loading to false'
      );
      setIsLoading(false);
    }
  }, []);

  const clearOutfits = useCallback(() => {
    console.log('🔍 useItemOutfits: Clearing outfits');
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
