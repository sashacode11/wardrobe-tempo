import { Database } from './supabase';

export type ClothingItemType =
  Database['public']['Tables']['wardrobe_items']['Row'];

export type OutfitType = Database['public']['Tables']['outfits']['Row'];

export type OutfitWithItems =
  Database['public']['Tables']['outfits_with_items']['Row'];
