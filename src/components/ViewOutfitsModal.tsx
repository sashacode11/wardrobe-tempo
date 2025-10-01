// components/ViewOutfitsModal.tsx - Optimized to prevent excessive re-renders
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { OutfitWithItems, ClothingItemType } from '@/types';
import OutfitActions from './common/OutfitActions';
import ViewModal from './common/ViewModal';
import { useOutfitActions } from '../hooks/useOutfitActions';
import OutfitBuilder from './OutfitBuilder';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';
import { OptimizedImage } from './OptimizedImage';

interface ViewOutfitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clothingItem: ClothingItemType | null;
  onViewOutfit?: (outfit: OutfitWithItems) => void;
  onEditOutfit?: (outfit: OutfitWithItems) => void;
}

// Memoized OutfitCard component
interface OutfitCardProps {
  outfit: OutfitWithItems;
  categories: string[];
  clothingItemId?: number | null;
  onView: (outfit: OutfitWithItems) => void;
  onEdit: (outfit: OutfitWithItems) => void;
  onDelete: (outfit: OutfitWithItems) => void;
}

const OutfitCard = React.memo<OutfitCardProps>(
  ({ outfit, categories, clothingItemId, onView, onEdit, onDelete }) => {
    const items = useMemo(() => {
      if (!outfit.outfit_items) return {};
      const organized: { [key: string]: ClothingItemType } = {};
      outfit.outfit_items.forEach(item => {
        const clothingItemData = item.wardrobe_items;
        if (clothingItemData) {
          organized[clothingItemData.category] = clothingItemData;
        }
      });
      return organized;
    }, [outfit.outfit_items]);

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
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{outfit.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Locations: {outfit.locations || 'Not specified'}
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

        <CardContent className="pt-0">
          <div className="grid grid-cols-5 gap-2">
            {categories.map(category => {
              const item = items[category];

              const isCurrentItem = outfit.outfit_items?.some(
                outfitItem =>
                  (outfitItem.wardrobe_items?.id === clothingItemId ||
                    outfitItem.clothing_item_id === clothingItemId) &&
                  outfitItem.wardrobe_items?.category === category
              );

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
                      <OptimizedImage
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

  const organizeOutfitItems = useCallback((outfit: OutfitWithItems) => {
    const organized: { [key: string]: ClothingItemType } = {};

    if (!outfit.outfit_items) {
      return organized;
    }

    outfit.outfit_items.forEach(item => {
      const clothingItemData = item.wardrobe_items;
      if (clothingItemData) {
        organized[clothingItemData.category] = clothingItemData;
      }
    });

    return organized;
  }, []);

  const handleEditOutfit = useCallback(
    (outfit: OutfitWithItems) => {
      if (onEditOutfit && typeof onEditOutfit === 'function') {
        onEditOutfit(outfit);
      }
    },
    [onEditOutfit]
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
      <Dialog open={isOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Outfits with "{clothingItem?.name}"
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
            {selectedItem.occasions && selectedItem.occasions.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedItem.occasions.map((occasion, index) => (
                  <Badge key={index} variant="secondary">
                    {occasion}
                  </Badge>
                ))}
              </div>
            )}

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
                          <OptimizedImage
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
