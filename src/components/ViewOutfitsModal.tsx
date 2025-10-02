// components/ViewOutfitsModal.tsx - Fixed to show all items
import React, { useCallback, useEffect, useState } from 'react';
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
  DialogOverlay,
} from '@/components/ui/dialog';
import { useItemOutfits } from '../hooks/useItemOutfits';
import { OutfitWithItems, ClothingItemType } from '@/types';
import OutfitActions from './common/OutfitActions';
import ViewModal from './common/ViewModal';
import { useOutfitActions } from '../hooks/useOutfitActions';
import OutfitBuilder from './OutfitBuilder';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';
import { OptimizedImage } from './OptimizedImage';
import { capitalizeFirst } from '@/utils/helpers';
import { on } from 'events';

interface ViewOutfitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clothingItem: ClothingItemType | null;
  onViewOutfit?: (outfit: OutfitWithItems) => void;
  onEditOutfit?: (outfit: OutfitWithItems) => void;
}

interface OutfitCardProps {
  outfit: OutfitWithItems;
  categories: string[];
  clothingItemId?: number | null;
  onView: (outfit: OutfitWithItems) => void;
  onEdit: (outfit: OutfitWithItems) => void;
  onDelete: (outfit: OutfitWithItems) => void;
}

// Shared function - moved outside components
const organizeOutfitItems = (
  outfit: OutfitWithItems
): { [key: string]: ClothingItemType[] } => {
  const organized: { [key: string]: ClothingItemType[] } = {};

  if (!outfit.outfit_items) {
    return organized;
  }

  outfit.outfit_items.forEach(item => {
    const clothingItemData = item.wardrobe_items;
    if (clothingItemData) {
      const category = clothingItemData.category;
      if (!organized[category]) {
        organized[category] = [];
      }
      organized[category].push(clothingItemData);
    }
  });

  return organized;
};

// OutfitCard component - moved before ViewOutfitsModal
const OutfitCard = React.memo<OutfitCardProps>(
  ({ outfit, categories, clothingItemId, onView, onEdit, onDelete }) => {
    const itemsByCategory = organizeOutfitItems(outfit);

    const handleView = useCallback(() => {
      onView(outfit);
    }, [onView, outfit]);

    const handleEdit = useCallback(() => {
      onEdit(outfit);
    }, [onEdit, outfit]);

    const handleDelete = useCallback(() => {
      onDelete(outfit);
    }, [onDelete, outfit]);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-2">
          <div className="flex justify-between items-start">
            <div className="flex flex-row items-center gap-3">
              <CardTitle className="text-lg">
                {capitalizeFirst(outfit.name)}
              </CardTitle>
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
              <OutfitActions
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                viewTitle="View outfit details"
                editTitle="Edit outfit"
                deleteTitle="Delete outfit"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-2">
          <div className="flex flex-row gap-2 flex-wrap">
            {categories.map(category => {
              const items = itemsByCategory[category] || [];

              if (items.length === 0) {
                return (
                  <div key={category} className="text-center">
                    <div className="w-12 h-12 rounded-md mb-1 flex items-center justify-center overflow-hidden border-2 border-muted bg-muted">
                      <div className="text-muted-foreground text-xs">-</div>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      {category}
                    </p>
                  </div>
                );
              }

              return (
                <React.Fragment key={category}>
                  {items.map((item, index) => {
                    const isCurrentItem = item.id === clothingItemId;

                    return (
                      <div
                        key={`${category}-${item.id}-${index}`}
                        className="text-center"
                      >
                        <div
                          className={`w-12 h-12 rounded-md mb-1 flex items-center justify-center overflow-hidden border-2 transition-colors ${
                            isCurrentItem
                              ? 'border-primary bg-primary/10'
                              : 'border-muted bg-muted'
                          }`}
                        >
                          <OptimizedImage
                            src={item.image_url || ''}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground capitalize truncate w-12">
                          {category}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize truncate w-12">
                          {item.location}
                        </p>
                        {isCurrentItem && (
                          <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1"></div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.outfit.id === nextProps.outfit.id &&
      prevProps.outfit.outfit_items?.length ===
        nextProps.outfit.outfit_items?.length &&
      prevProps.clothingItemId === nextProps.clothingItemId &&
      prevProps.categories.length === nextProps.categories.length
    );
  }
);

OutfitCard.displayName = 'OutfitCard';

const ViewOutfitsModal: React.FC<ViewOutfitsModalProps> = ({
  isOpen,
  onClose,
  clothingItem,
  onViewOutfit,
  onEditOutfit,
}) => {
  const [editingOutfit, setEditingOutfit] = useState<OutfitWithItems | null>(
    null
  );
  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);

  const { outfits, isLoading, error, fetchItemOutfits, clearOutfits } =
    useItemOutfits();

  const { categories } = useWardrobeItems();

  const { selectedItem, showViewModal, handleView, closeModals } =
    useOutfitActions<OutfitWithItems>({
      onView: outfit => {
        if (onViewOutfit) {
          onViewOutfit(outfit);
        }
      },
    });

  useEffect(() => {
    console.log('[ViewOutfitsModal] Main useEffect triggered:', {
      isOpen,
      clothingItemId: clothingItem?.id,
      timestamp: new Date().toISOString(),
    });

    if (isOpen && clothingItem?.id) {
      console.log(
        '[ViewOutfitsModal] Fetching outfits for item:',
        clothingItem.id
      );

      fetchItemOutfits(clothingItem.id);
    } else if (!isOpen) {
      console.log('[ViewOutfitsModal] Modal closed, clearing outfits');

      clearOutfits();
    }
  }, [isOpen, clothingItem?.id, fetchItemOutfits, clearOutfits]);

  const handleEditOutfit = useCallback(
    (outfit: OutfitWithItems) => {
      onClose();
      setEditingOutfit(outfit);
      setShowOutfitBuilder(true);
      if (onEditOutfit && typeof onEditOutfit === 'function') {
        onEditOutfit(outfit);
      }
    },
    [onEditOutfit, onClose]
  );

  const handleDeleteOutfit = useCallback((outfit: OutfitWithItems) => {
    console.log('Delete outfit:', outfit.id);
    // Implement delete functionality here
  }, []);

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
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              categories={categories}
              clothingItemId={clothingItem?.id}
              onView={handleView}
              onEdit={handleEditOutfit}
              onDelete={handleDeleteOutfit}
            />
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
        <DialogOverlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />

        <DialogContent
          className="
      bg-muted 
      sm:top-[50%] top-auto 
      bottom-0 sm:bottom-auto
      
      sm:translate-x-[-50%] sm:translate-y-[-50%]
      translate-y-0 sm:translate-y-auto
      border-0
      p-3
    "
          onInteractOutside={e => e.preventDefault()}
          onEscapeKeyDown={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Outfits with "{capitalizeFirst(clothingItem?.name)}"
            </DialogTitle>
            {clothingItem && (
              <div className="flex items-center gap-3 pt-2">
                <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                  <OptimizedImage
                    src={clothingItem.image_url || ''}
                    alt={clothingItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-left pl-2">
                    {capitalizeFirst(clothingItem.name)}
                  </p>
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

      {/* <ViewModal
        isOpen={!!showViewModal}
        onClose={closeModals}
        title={selectedItem?.name || 'Outfit Details'}
        maxWidth="2xl"
      >
        {selectedItem && (
          <div className="px-2">
            {selectedItem.occasions && selectedItem.occasions.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedItem.occasions.map((occasion, index) => (
                  <Badge key={index} variant="secondary">
                    {occasion}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {Object.entries(organizeOutfitItems(selectedItem)).map(
                ([category, items]) =>
                  items.map((item, index) => (
                    <div
                      key={`${category}-${item.id}-${index}`}
                      className="text-center"
                    >
                      <div className="w-full aspect-square bg-muted rounded-md overflow-hidden mb-1">
                        <OptimizedImage
                          src={item.image_url || ''}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium capitalize truncate px-1">
                        {category}
                      </p>
                      <p className="text-xs text-muted-foreground truncate px-1">
                        {item.location}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </ViewModal> */}

      {showOutfitBuilder && editingOutfit && (
        <OutfitBuilder
          isOpen={true}
          initialOutfit={editingOutfit}
          onClose={() => {
            setShowOutfitBuilder(false);
            setEditingOutfit(null);
          }}
          onSave={() => {
            if (clothingItem) {
              fetchItemOutfits(clothingItem.id);
            }
            setShowOutfitBuilder(false);
            setEditingOutfit(null);
          }}
          editingOutfit={undefined}
          onEditComplete={() => {
            console.log('Edit complete');
          }}
        />
      )}
    </>
  );
};

export default ViewOutfitsModal;
