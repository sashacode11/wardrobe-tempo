// components/ItemOutfitsModal.tsx - Modal to display outfits containing a specific item
import React, { useEffect } from 'react';
import { Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useItemOutfits } from '../hooks/useItemOutfits';
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

interface ItemOutfitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clothingItem: ClothingItemType | null;
  onViewOutfit?: (outfit: OutfitWithItems) => void;
}

const ItemOutfitsModal: React.FC<ItemOutfitsModalProps> = ({
  isOpen,
  onClose,
  clothingItem,
  onViewOutfit,
}) => {
  // Debug: Log component render
  console.log('🔍 ItemOutfitsModal: Component render', {
    isOpen,
    clothingItemId: clothingItem?.id,
    clothingItemName: clothingItem?.name,
  });
  const { outfits, isLoading, error, fetchItemOutfits, clearOutfits } =
    useItemOutfits();

  // Debug: Log hook state changes
  console.log('🔍 ItemOutfitsModal: Hook state:', {
    outfitsCount: outfits?.length || 0,
    isLoading,
    error,
    clothingItemId: clothingItem?.id,
    isOpen,
  });

  useEffect(() => {
    if (isOpen && clothingItem) {
      console.log('🔍 ItemOutfitsModal: Fetching outfits for item:', {
        itemId: clothingItem.id,
        itemName: clothingItem.name,
        itemCategory: clothingItem.category,
      });

      // Check if fetchItemOutfits function exists
      if (typeof fetchItemOutfits === 'function') {
        console.log('🔍 ItemOutfitsModal: Calling fetchItemOutfits...');
        fetchItemOutfits(clothingItem.id);
      } else {
        console.error(
          '❌ ItemOutfitsModal: fetchItemOutfits is not a function:',
          typeof fetchItemOutfits
        );
      }
    } else if (!isOpen) {
      console.log('🔍 ItemOutfitsModal: Clearing outfits (modal closed)');
      if (typeof clearOutfits === 'function') {
        clearOutfits();
      }
    }
  }, [isOpen, clothingItem, fetchItemOutfits, clearOutfits]);

  // Debug: Log outfits data when it changes
  useEffect(() => {
    console.log('🔍 ItemOutfitsModal: Outfits state changed:', {
      outfits: outfits,
      outfitsType: typeof outfits,
      outfitsLength: outfits?.length,
      isArray: Array.isArray(outfits),
      clothingItemId: clothingItem?.id,
    });

    if (outfits && outfits.length > 0) {
      console.log('🔍 ItemOutfitsModal: Outfits received:', outfits.length);
      outfits.forEach((outfit, index) => {
        console.log(`🔍 Outfit ${index + 1}:`, {
          id: outfit.id,
          name: outfit.name,
          itemsCount: outfit.outfit_items?.length || 0,
          outfitItems: outfit.outfit_items?.map(item => ({
            clothing_item_id: item.clothing_item_id,
            wardrobe_item_id: item.wardrobe_items?.id,
            wardrobe_item_name: item.wardrobe_items?.name,
            wardrobe_item_category: item.wardrobe_items?.category,
          })),
        });
      });
    } else if (outfits && outfits.length === 0) {
      console.log(
        '🔍 ItemOutfitsModal: Empty outfits array for item:',
        clothingItem?.id
      );
    } else if (outfits === null || outfits === undefined) {
      console.log(
        '🔍 ItemOutfitsModal: Outfits is null/undefined for item:',
        clothingItem?.id
      );
    }
  }, [outfits, clothingItem]);

  // Helper function to organize outfit items by category
  const organizeOutfitItems = (outfit: OutfitWithItems) => {
    console.log('🔍 Organizing outfit items for:', outfit.name);
    const organized: { [key: string]: ClothingItemType } = {};

    if (!outfit.outfit_items) {
      console.log('⚠️ No outfit_items array found for outfit:', outfit.name);
      return organized;
    }

    outfit.outfit_items?.forEach((item, index) => {
      const clothingItemData = item.wardrobe_items;
      console.log(`🔍 Processing outfit item ${index + 1}:`, {
        clothing_item_id: item.clothing_item_id,
        wardrobe_item: clothingItemData
          ? {
              id: clothingItemData.id,
              name: clothingItemData.name,
              category: clothingItemData.category,
              color: clothingItemData.color,
            }
          : null,
      });

      if (clothingItemData) {
        organized[clothingItemData.category] = clothingItemData;
        console.log(
          `✅ Added to ${clothingItemData.category}:`,
          clothingItemData.name
        );
      } else {
        console.log(
          '⚠️ No wardrobe_items data for clothing_item_id:',
          item.clothing_item_id
        );
      }
    });

    console.log(
      '🔍 Final organized items:',
      Object.keys(organized).map(cat => ({
        category: cat,
        item: organized[cat].name,
      }))
    );

    return organized;
  };

  const OutfitCard: React.FC<{ outfit: OutfitWithItems }> = ({ outfit }) => {
    const items = organizeOutfitItems(outfit);
    const categories = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];

    // Debug: Check if current item is in this outfit
    const currentItemInOutfit = outfit.outfit_items?.some(
      item =>
        item.clothing_item_id === clothingItem?.id ||
        item.wardrobe_items?.id === clothingItem?.id
    );

    console.log(`🔍 OutfitCard for "${outfit.name}":`, {
      currentItemId: clothingItem?.id,
      currentItemInOutfit,
      outfitItemIds: outfit.outfit_items?.map(item => ({
        clothing_item_id: item.clothing_item_id,
        wardrobe_item_id: item.wardrobe_items?.id,
      })),
    });

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{outfit.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Created {new Date(outfit.created_at).toLocaleDateString()}
              </p>
              {outfit.occasions && outfit.occasions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {outfit.occasions.slice(0, 2).map((occasion, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {occasion}
                    </Badge>
                  ))}
                  {outfit.occasions.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{outfit.occasions.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-1 ml-2">
              {onViewOutfit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewOutfit(outfit)}
                  className="h-8 w-8"
                  title="View outfit details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-5 gap-2">
            {categories.map(category => {
              const item = items[category];

              // Debug: Check multiple ways to identify current item
              const isCurrentItemCheck1 = item?.id === clothingItem?.id;
              const isCurrentItemCheck2 = outfit.outfit_items?.some(
                outfitItem =>
                  outfitItem.wardrobe_items?.id === clothingItem?.id &&
                  outfitItem.wardrobe_items?.category === category
              );
              const isCurrentItemCheck3 = outfit.outfit_items?.some(
                outfitItem =>
                  outfitItem.clothing_item_id === clothingItem?.id &&
                  outfitItem.wardrobe_items?.category === category
              );

              const isCurrentItem =
                isCurrentItemCheck1 ||
                isCurrentItemCheck2 ||
                isCurrentItemCheck3;

              if (item && clothingItem) {
                console.log(`🔍 Category ${category} item check:`, {
                  itemId: item.id,
                  currentItemId: clothingItem.id,
                  isCurrentItemCheck1,
                  isCurrentItemCheck2,
                  isCurrentItemCheck3,
                  finalIsCurrentItem: isCurrentItem,
                });
              }

              return (
                <div key={category} className="text-center">
                  <div
                    className={`w-12 h-12 rounded-md mb-1 flex items-center justify-center overflow-hidden border-2 transition-colors ${
                      isCurrentItem
                        ? 'border-primary bg-primary/10'
                        : 'border-muted bg-muted'
                    }`}
                  >
                    {item ? (
                      <img
                        src={item.image_url || ''}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground text-xs">-</div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {category}
                  </p>
                  {isCurrentItem && (
                    <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading outfits...</p>
          </div>
        </div>
      );
    }

    if (error) {
      console.log('🔍 ItemOutfitsModal: Error state:', error);
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Outfits</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => clothingItem && fetchItemOutfits(clothingItem.id)}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      );
    }

    if (outfits.length === 0) {
      console.log(
        '🔍 ItemOutfitsModal: No outfits state - showing empty message'
      );
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👔</div>
          <h3 className="text-lg font-semibold mb-2">No Outfits Found</h3>
          <p className="text-muted-foreground">
            This item hasn't been used in any outfits yet.
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-4 p-1">
          {outfits.map(outfit => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Outfits with "{clothingItem?.name}"
          </DialogTitle>
          {clothingItem && (
            <div className="flex items-center gap-3 pt-2">
              <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                <img
                  src={clothingItem.image_url || ''}
                  alt={clothingItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{clothingItem.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {clothingItem.category}
                  </Badge>
                  {clothingItem.color && (
                    <span className="capitalize">{clothingItem.color}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ItemOutfitsModal;
