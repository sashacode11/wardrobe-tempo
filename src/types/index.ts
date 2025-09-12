// types.ts - Consolidated type definitions
import { FilterOptions } from '@/hooks/useFilters';
import { Database } from './supabase';

// Base types from Supabase
export type ClothingItemType =
  Database['public']['Tables']['wardrobe_items']['Row'];
export type OutfitType = Database['public']['Tables']['outfits']['Row'];
export type OutfitWithItemsView =
  Database['public']['Tables']['outfits_with_items']['Row'];

// Enhanced outfit-related interfaces
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
  is_complete?: boolean; // Added for incomplete outfit tracking
  missing_items_count?: number; // Added for incomplete outfit tracking
  last_incomplete_at?: string; // Added for incomplete outfit tracking
  created_at: string;
  updated_at: string;
  outfit_items?: OutfitItem[];
}

export interface OutfitWithItems extends Outfit {
  items: ClothingItemType[]; // Flattened items for easier use
  outfit_items: OutfitItem[];
  missingItems?: ClothingItemType[]; // Items that were deleted but were part of this outfit
}

// New type for incomplete outfit management
export interface IncompleteOutfitInfo {
  outfit: OutfitWithItems;
  missingItemsCount: number;
  suggestions?: ClothingItemType[]; // Suggested replacement items
}

// Component prop interfaces
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

export interface WardrobeGridProps {
  searchQuery?: string;
  selectedCategory?: string;
  onAddItem?: () => void;
  onSelectItem?: (item: ClothingItemType) => void;
  onAddToOutfit?: (item: ClothingItemType) => void;
  onEditItem?: (item: ClothingItemType) => void;
  onClearFilters?: () => void;
  activeFilters?: FilterOptions;
  activeCategory?: string;
  filteredItems?: ClothingItemType[];
}
