// components/ItemOutfitsModal.tsx - Updated with reusable components
import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';
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
import { useState } from 'react';

// Import reusable components
import OutfitActions from './common/OutfitActions';
import ViewModal from './common/ViewModal';
import { useOutfitActions } from '../hooks/useOutfitActions';
import OutfitBuilder from './OutfitBuilder';

type ClothingItemType = Database['public']['Tables']['wardrobe_items']['Row'];
type OutfitType = Database['public']['Tables']['outfits']['Row'];

interface OutfitWithItems extends OutfitType {
  name(arg0: string, name: any): unknown;
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
  onEditOutfit?: (outfit: OutfitWithItems) => void;
}

const ItemOutfitsModal: React.FC<ItemOutfitsModalProps> = ({
  isOpen,
  onClose,
  clothingItem,
  onViewOutfit,
  onEditOutfit,
}) => {
  // Debug: Log component render
  console.log('🔍 ItemOutfitsModal: Component render', {
    isOpen,
    clothingItemId: clothingItem?.id,
    clothingItemName: clothingItem?.name,
  });

  const [editingOutfit, setEditingOutfit] = useState<OutfitWithItems | null>(
    null
  );
  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);

  const { outfits, isLoading, error, fetchItemOutfits, clearOutfits } =
    useItemOutfits();

  // Use reusable entity actions hook for view functionality
  const { selectedItem, showViewModal, handleView, closeModals } =
    useOutfitActions<OutfitWithItems>({
      onView: outfit => {
        // Call the parent's onViewOutfit if provided
        if (onViewOutfit) {
          onViewOutfit(outfit);
        }
      },
    });

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

    const handleEditOutfit = (outfit: OutfitWithItems) => {
      console.log('✏️ ItemOutfitsModal: Edit button clicked', {
        outfitId: outfit.id,
        outfitName: outfit.name,
        onEditOutfitType: typeof onEditOutfit,
        onEditOutfitExists: !!onEditOutfit,
      });

      if (onEditOutfit && typeof onEditOutfit === 'function') {
        console.log(
          '✅ ItemOutfitsModal: Calling parent onEditOutfit handler...'
        );
        onEditOutfit(outfit);
      } else {
        console.warn('❌ ItemOutfitsModal: onEditOutfit is not a function!', {
          onEditOutfit,
        });
      }
    };

    function handleDelete(outfit: OutfitWithItems): void {
      throw new Error('Function not implemented.');
    }

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

            {/* Use reusable OutfitActions - only show view button */}
            <div className="flex gap-1 ml-2">
              <OutfitActions
                // onView={() => handleView(outfit)}
                // showEdit={false}
                // showDelete={false}
                // size="sm"
                // viewTitle="View outfit details"

                onView={() => handleView(outfit)}
                onEdit={() => handleEditOutfit(outfit)}
                onDelete={() => handleDelete(outfit)}
                viewTitle="View outfit details"
                editTitle="Edit outfit"
                deleteTitle="Delete outfit"
              />
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
    <>
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

      {/* Reusable ViewModal for outfit details */}
      <ViewModal
        isOpen={!!showViewModal}
        onClose={closeModals}
        title={selectedItem?.name || 'Outfit Details'}
        subtitle={
          selectedItem
            ? `Created on ${new Date(
                selectedItem.created_at
              ).toLocaleDateString()}`
            : ''
        }
        maxWidth="2xl"
      >
        {selectedItem && (
          <div>
            {/* Occasions */}
            {selectedItem.occasions && selectedItem.occasions.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedItem.occasions.map((occasion, index) => (
                  <Badge key={index} variant="secondary">
                    {occasion}
                  </Badge>
                ))}
              </div>
            )}

            {/* Outfit Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(organizeOutfitItems(selectedItem)).map(
                ([category, item]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm capitalize">
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                          <img
                            src={item.image_url || ''}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          {item.color && (
                            <p className="text-sm text-muted-foreground capitalize">
                              Color: {item.color}
                            </p>
                          )}
                          {Array.isArray(item.tags) && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.tags.slice(0, 2).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        )}
      </ViewModal>

      {/* Outfit Builder Modal */}
      {showOutfitBuilder && editingOutfit && (
        <OutfitBuilder
          isOpen={true}
          initialOutfit={{
            id: editingOutfit.id,
            name: editingOutfit.name,
            items: editingOutfit.outfit_items.map(oi => oi.wardrobe_items),
            occasions: editingOutfit.occasions || [],
          }}
          onClose={() => {
            setShowOutfitBuilder(false);
            setEditingOutfit(null);
          }}
          onSave={() => {
            // Optionally refresh outfits list
            if (clothingItem) {
              fetchItemOutfits(clothingItem.id);
            }
            setShowOutfitBuilder(false);
            setEditingOutfit(null);
          }}
        />
      )}
    </>
  );
};

export default ItemOutfitsModal;
