import { Database } from './supabase';

export type ClothingItemType =
  Database['public']['Tables']['wardrobe_items']['Row'];

export type OutfitType = Database['public']['Tables']['outfits']['Row'];

export type OutfitWithItemsView =
  Database['public']['Tables']['outfits_with_items']['Row'];

export interface OutfitWithItems {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  occasions?: string[];
  outfit_items: {
    clothing_item_id: string;
    wardrobe_items: ClothingItemType;
  }[];
}

export interface OutfitItem {
  category: string;
  item: ClothingItemType | null;
}

export interface OutfitBuilderProps {
  onSave?: (outfit: {
    name: string;
    items: ClothingItemType[];
    occasions: string[];
  }) => void;
  onClose?: () => void;
  isOpen?: boolean;
  selectedItem?: ClothingItemType;
  onItemAdded?: () => void;
  onOutfitSaved?: () => void;
  editingOutfit: OutfitWithItemsView | null;
  onEditComplete: () => void;
  initialOutfit?: OutfitWithItems | null;
}

export interface ClothingItemProps {
  id?: string;
  image?: string;
  name?: string;
  category?: string;
  color?: string;
  location?: string;
  seasons?: string[];
  occasions?: string[];
  tags?: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddToOutfit?: (id: string) => void;
  onViewDetails?: () => void;
  onViewOutfit?: (outfit: OutfitWithItems) => void;
  isSelected: boolean;
  isSelectionMode: boolean;
}
