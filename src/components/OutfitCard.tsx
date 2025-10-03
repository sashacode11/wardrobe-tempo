// components/OutfitCard.tsx
import React, { useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OutfitWithItems, ClothingItemType } from '@/types';
import OutfitActions from './common/OutfitActions';
import SelectionCheckbox from './common/SelectionCheckbox';
import { OptimizedImage } from '../trash/OptimizedImage';
import { capitalizeFirst } from '@/utils/helpers';

interface OutfitCardProps {
  outfit: OutfitWithItems;
  categories: string[];
  clothingItemId?: number | null;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onView?: (outfit: OutfitWithItems) => void;
  onEdit?: (outfit: OutfitWithItems) => void;
  onDelete?: (outfit: OutfitWithItems) => void;
  onToggleSelection?: () => void;
}

const organizeOutfitItems = (
  outfit: OutfitWithItems,
  allCategories: string[]
) => {
  if (!outfit?.outfit_items) {
    return {};
  }

  const organized: Record<string, ClothingItemType | null> = {};

  allCategories.forEach(cat => {
    organized[cat] = null;
  });

  outfit.outfit_items?.forEach(item => {
    const clothingItem = item.wardrobe_items;
    if (clothingItem) {
      const itemCategory = clothingItem.category.toLowerCase();
      const matchedCategory = allCategories.find(
        cat => cat.toLowerCase() === itemCategory
      );

      if (matchedCategory) {
        if (!organized[matchedCategory]) {
          organized[matchedCategory] = clothingItem;
        }
      }
    }
  });

  return outfit.outfit_items.map(item => item.wardrobe_items).filter(Boolean);
};

export const OutfitCard = React.memo<OutfitCardProps>(
  ({
    outfit,
    isSelectionMode,
    isSelected,
    onView,
    onEdit,
    onDelete,
    onToggleSelection,
    categories,
  }: {
    outfit: OutfitWithItems;
    isSelectionMode: boolean;
    isSelected: boolean;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onToggleSelection: () => void;
    categories: string[];
  }) => {
    const items = useMemo(
      () => organizeOutfitItems(outfit, categories),
      [outfit.id, outfit.outfit_items?.length, categories.length]
    );

    const itemsWithContent = Object.entries(items).filter(
      ([category, item]) => item !== null
    );

    const totalItemCount = outfit.outfit_items?.length || 0;
    const maxDisplayItems = 3;
    const hasMoreItems = totalItemCount > maxDisplayItems;

    return (
      <div className="relative">
        <SelectionCheckbox
          isSelectionMode={isSelectionMode}
          isSelected={isSelected}
          onToggleSelection={onToggleSelection}
        />

        <Card
          className={`group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 h-[200px] flex flex-col overflow-hidden ${
            isSelectionMode && isSelected
              ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
              : ''
          }`}
        >
          <CardHeader className="py-2 px-4 md:p-6 pb-2 md:pb-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex flex-row gap-2 items-center min-w-0">
                <CardTitle className="text-l font-semibold text-foreground truncate">
                  {capitalizeFirst(outfit.name)}
                </CardTitle>
                <span className="text-sm font-medium text-muted-foreground">
                  ({totalItemCount} item{totalItemCount !== 1 ? 's' : ''})
                </span>
              </div>

              {!isSelectionMode && (
                <div className="group-hover:opacity-100 transition-opacity duration-200 ml-3">
                  <OutfitActions
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    viewTitle="View outfit details"
                    editTitle="Edit outfit"
                    deleteTitle="Delete outfit"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-4 px-4 flex-1 flex flex-col overflow-hidden">
            {itemsWithContent.length > 0 ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-hidden min-h-0">
                  <div className="grid grid-cols-3 gap-2 h-full max-h-full">
                    {itemsWithContent
                      .slice(0, maxDisplayItems)
                      .map(([category, item], index) => {
                        const isLastItem = index === maxDisplayItems - 1;
                        const shouldBlur = isLastItem && hasMoreItems;

                        return (
                          <div
                            key={category}
                            className={`group/item relative flex flex-col ${
                              shouldBlur ? 'cursor-pointer' : ''
                            }`}
                            onClick={shouldBlur ? onView : undefined}
                          >
                            <div className="aspect-square bg-gradient-to-br from-gray-50 dark:from-gray-700 to-gray-100 dark:to-gray-600 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm group-hover/item:shadow-md transition-all duration-200 flex-shrink-0 relative">
                              <img
                                src={item.image_url || ''}
                                alt={item.name}
                                className={`w-full h-full object-cover transition-all duration-300 ${
                                  shouldBlur
                                    ? 'blur-sm group-hover/item:blur-[2px]'
                                    : 'group-hover/item:scale-105'
                                }`}
                              />

                              {shouldBlur && (
                                <div className="absolute inset-0 bg-black/40 group-hover/item:bg-black/50 transition-all duration-200 flex flex-col items-center justify-center">
                                  <span className="text-2xl font-bold text-white drop-shadow-lg">
                                    +{totalItemCount - maxDisplayItems}
                                  </span>
                                  <span className="text-xs text-white/90 font-medium mt-1">
                                    more items
                                  </span>
                                </div>
                              )}

                              {!shouldBlur && (
                                <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-all duration-200" />
                              )}
                            </div>

                            <div className="mt-1 ml-2 text-left h-8 flex flex-col flex-shrink-0">
                              <p className="text-xs font-medium text-foreground truncate leading-tight">
                                {capitalizeFirst(item.name)}
                              </p>
                              {item.location && (
                                <p className="text-xs text-muted-foreground truncate leading-tight">
                                  {capitalizeFirst(item.location)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👔</span>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    No items in this outfit
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.outfit.id === nextProps.outfit.id &&
      prevProps.outfit.name === nextProps.outfit.name &&
      prevProps.outfit.outfit_items?.length ===
        nextProps.outfit.outfit_items?.length &&
      prevProps.isSelectionMode === nextProps.isSelectionMode &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.categories.length === nextProps.categories.length
    );
  }
);

OutfitCard.displayName = 'OutfitCard';
