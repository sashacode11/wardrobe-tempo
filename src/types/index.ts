import { Database } from './supabase';

export type ClothingItemType =
  Database['public']['Tables']['wardrobe_items']['Row'];
