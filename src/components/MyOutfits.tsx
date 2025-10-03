// MyOutfits.tsx - Fixed version
import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Shirt, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useMultiselect } from '../hooks/useMultiSelect';
import SelectionControls from './common/SelectionControls';
import SelectionCheckbox from './common/SelectionCheckbox';
import { supabase } from '../lib/supabaseClient';
import OutfitActions from './common/OutfitActions';
import ViewModal from './common/ViewModal';
import DeleteModal from './common/DeleteModal';
import { useOutfitActions } from '../hooks/useOutfitActions';
import { ClothingItemType, OutfitWithItems } from '@/types';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';
import { useWardrobe } from '../contexts/WardrobeContext';
import { OptimizedImage } from '../trash/OptimizedImage';
import { capitalizeFirst } from '@/utils/helpers';
import { OutfitCard } from './OutfitCard';

interface MyOutfitsProps {
  searchQuery?: string;
  onEditOutfit: (outfit: OutfitWithItems) => void;
  onCreateOutfit: () => void;
}

// Helper function to organize outfit items - moved outside component
// const organizeOutfitItems = (
//   outfit: OutfitWithItems,
//   allCategories: string[]
// ) => {
//   if (!outfit?.outfit_items) {
//     return {};
//   }

//   const organized: Record<string, ClothingItemType | null> = {};

//   allCategories.forEach(cat => {
//     organized[cat] = null;
//   });

//   outfit.outfit_items?.forEach(item => {
//     const clothingItem = item.wardrobe_items;
//     if (clothingItem) {
//       const itemCategory = clothingItem.category.toLowerCase();
//       const matchedCategory = allCategories.find(
//         cat => cat.toLowerCase() === itemCategory
//       );

//       if (matchedCategory) {
//         if (!organized[matchedCategory]) {
//           organized[matchedCategory] = clothingItem;
//         }
//       }
//     }
//   });

//   return outfit.outfit_items.map(item => item.wardrobe_items).filter(Boolean);
// };

// OutfitCard component - moved outside and properly memoized
// const OutfitCard = React.memo(
//   ({
//     outfit,
//     isSelectionMode,
//     isSelected,
//     onView,
//     onEdit,
//     onDelete,
//     onToggleSelection,
//     categories,
//   }: {
//     outfit: OutfitWithItems;
//     isSelectionMode: boolean;
//     isSelected: boolean;
//     onView: () => void;
//     onEdit: () => void;
//     onDelete: () => void;
//     onToggleSelection: () => void;
//     categories: string[];
//   }) => {
//     const items = useMemo(
//       () => organizeOutfitItems(outfit, categories),
//       [outfit.id, outfit.outfit_items?.length, categories.length]
//     );

//     const itemsWithContent = Object.entries(items).filter(
//       ([category, item]) => item !== null
//     );

//     const totalItemCount = outfit.outfit_items?.length || 0;
//     const maxDisplayItems = 3;
//     const hasMoreItems = totalItemCount > maxDisplayItems;

//     return (
//       <div className="relative">
//         <SelectionCheckbox
//           isSelectionMode={isSelectionMode}
//           isSelected={isSelected}
//           onToggleSelection={onToggleSelection}
//         />

//         <Card
//           className={`group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 h-[200px] flex flex-col overflow-hidden ${
//             isSelectionMode && isSelected
//               ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
//               : ''
//           }`}
//         >
//           <CardHeader className="py-2 px-4 md:p-6 pb-2 md:pb-4 flex-shrink-0">
//             <div className="flex justify-between items-center">
//               <div className="flex flex-row gap-2 items-center min-w-0">
//                 <CardTitle className="text-l font-semibold text-foreground truncate">
//                   {capitalizeFirst(outfit.name)}
//                 </CardTitle>
//                 <span className="text-sm font-medium text-muted-foreground">
//                   ({totalItemCount} item{totalItemCount !== 1 ? 's' : ''})
//                 </span>
//               </div>

//               {!isSelectionMode && (
//                 <div className="group-hover:opacity-100 transition-opacity duration-200 ml-3">
//                   <OutfitActions
//                     onView={onView}
//                     onEdit={onEdit}
//                     onDelete={onDelete}
//                     viewTitle="View outfit details"
//                     editTitle="Edit outfit"
//                     deleteTitle="Delete outfit"
//                   />
//                 </div>
//               )}
//             </div>
//           </CardHeader>

//           <CardContent className="pt-0 pb-4 px-4 flex-1 flex flex-col overflow-hidden">
//             {itemsWithContent.length > 0 ? (
//               <div className="flex-1 flex flex-col">
//                 <div className="flex-1 overflow-hidden min-h-0">
//                   <div className="grid grid-cols-3 gap-2 h-full max-h-full">
//                     {itemsWithContent
//                       .slice(0, maxDisplayItems)
//                       .map(([category, item], index) => {
//                         const isLastItem = index === maxDisplayItems - 1;
//                         const shouldBlur = isLastItem && hasMoreItems;

//                         return (
//                           <div
//                             key={category}
//                             className={`group/item relative flex flex-col ${
//                               shouldBlur ? 'cursor-pointer' : ''
//                             }`}
//                             onClick={shouldBlur ? onView : undefined}
//                           >
//                             <div className="aspect-square bg-gradient-to-br from-gray-50 dark:from-gray-700 to-gray-100 dark:to-gray-600 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm group-hover/item:shadow-md transition-all duration-200 flex-shrink-0 relative">
//                               <img
//                                 src={item.image_url || ''}
//                                 alt={item.name}
//                                 className={`w-full h-full object-cover transition-all duration-300 ${
//                                   shouldBlur
//                                     ? 'blur-sm group-hover/item:blur-[2px]'
//                                     : 'group-hover/item:scale-105'
//                                 }`}
//                               />

//                               {shouldBlur && (
//                                 <div className="absolute inset-0 bg-black/40 group-hover/item:bg-black/50 transition-all duration-200 flex flex-col items-center justify-center">
//                                   <span className="text-2xl font-bold text-white drop-shadow-lg">
//                                     +{totalItemCount - maxDisplayItems}
//                                   </span>
//                                   <span className="text-xs text-white/90 font-medium mt-1">
//                                     more items
//                                   </span>
//                                 </div>
//                               )}

//                               {!shouldBlur && (
//                                 <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-all duration-200" />
//                               )}
//                             </div>

//                             <div className="mt-1 ml-2 text-left h-8 flex flex-col flex-shrink-0">
//                               <p className="text-xs font-medium text-foreground truncate leading-tight">
//                                 {capitalizeFirst(item.name)}
//                               </p>
//                               {item.location && (
//                                 <p className="text-xs text-muted-foreground truncate leading-tight">
//                                   {capitalizeFirst(item.location)}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex-1 flex items-center justify-center">
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
//                     <span className="text-2xl">👔</span>
//                   </div>
//                   <p className="text-muted-foreground text-sm font-medium">
//                     No items in this outfit
//                   </p>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     );
//   },
//   (prevProps, nextProps) => {
//     return (
//       prevProps.outfit.id === nextProps.outfit.id &&
//       prevProps.outfit.name === nextProps.outfit.name &&
//       prevProps.outfit.outfit_items?.length ===
//         nextProps.outfit.outfit_items?.length &&
//       prevProps.isSelectionMode === nextProps.isSelectionMode &&
//       prevProps.isSelected === nextProps.isSelected &&
//       prevProps.categories.length === nextProps.categories.length
//     );
//   }
// );

const MyOutfits: React.FC<MyOutfitsProps> = ({
  searchQuery: externalSearchQuery,
  onEditOutfit,
  onCreateOutfit,
}) => {
  const {
    outfits,
    outfitsLoading: loading,
    error,
    searchQuery,
    setSearchQuery,
    clearSearch,
    outfitSearchResults,
    hasSearchQuery,
    refreshOutfits,
    removeOutfit,
  } = useWardrobe();

  const { categories } = useWardrobeItems();

  const displayedOutfits = hasSearchQuery ? outfitSearchResults : outfits;
  const resultCount = displayedOutfits.length;

  const {
    isSelectionMode,
    selectedItems,
    showDeleteDialog,
    deletingItems,
    error: multiselectError,
    setShowDeleteDialog,
    setError: setMultiselectError,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    toggleSelectionMode,
    deleteSelectedItems,
  } = useMultiselect();

  const {
    selectedItem,
    showDeleteModal,
    showViewModal,
    isDeleting,
    error: entityError,
    handleView,
    handleDelete,
    confirmDelete,
    closeModals,
    setError: setEntityError,
  } = useOutfitActions<OutfitWithItems>({
    onView: outfit => {},
    onDelete: async outfit => {
      await handleDeleteOutfit(outfit.id);
    },
  });

  const handleCreateNewOutfit = useCallback(() => {
    onCreateOutfit();
  }, [onCreateOutfit]);

  const handleEditOutfit = useCallback(
    (outfit: OutfitWithItems) => {
      onEditOutfit(outfit);
    },
    [onEditOutfit]
  );

  const handleDeleteOutfit = async (outfitId: string) => {
    const { error: outfitItemsError } = await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', outfitId);

    if (outfitItemsError) {
      throw new Error('Failed to delete outfit items');
    }

    const { error: outfitError } = await supabase
      .from('outfits')
      .delete()
      .eq('id', outfitId);

    if (outfitError) {
      throw new Error('Failed to delete outfit');
    }

    removeOutfit(outfitId);
  };

  const handleBulkDeleteOutfits = async () => {
    if (selectedItems.size === 0) return;

    try {
      const idsToDelete = Array.from(selectedItems);

      const { error: outfitItemsError } = await supabase
        .from('outfit_items')
        .delete()
        .in('outfit_id', idsToDelete);

      if (outfitItemsError) {
        setMultiselectError('Failed to delete outfit items');
        return;
      }

      const { error: outfitsError } = await supabase
        .from('outfits')
        .delete()
        .in('id', idsToDelete);

      if (outfitsError) {
        setMultiselectError('Failed to delete outfits');
        return;
      }

      idsToDelete.forEach(id => removeOutfit(id));
      deselectAllItems();
      setShowDeleteDialog(false);
      toggleSelectionMode();
    } catch (error) {
      setMultiselectError('Failed to delete outfits');
    }
  };

  // ViewModalContent component
  const ViewModalContent: React.FC<{ outfit: OutfitWithItems }> = ({
    outfit,
  }) => {
    const itemsByCategory: Record<string, ClothingItemType[]> = {};

    categories.forEach(cat => {
      itemsByCategory[cat] = [];
    });

    outfit.outfit_items?.forEach(item => {
      const clothingItem = item.wardrobe_items;
      if (clothingItem) {
        const itemCategory = clothingItem.category.toLowerCase();
        const matchedCategory = categories.find(
          cat => cat.toLowerCase() === itemCategory
        );

        if (matchedCategory) {
          itemsByCategory[matchedCategory].push(clothingItem);
        }
      }
    });

    const categoriesWithItems = Object.entries(itemsByCategory).filter(
      ([category, items]) => items.length > 0
    );

    return (
      <div className="space-y-6">
        {outfit.occasions && outfit.occasions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {outfit.occasions.map((occasion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium"
              >
                {occasion}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {categoriesWithItems.map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground capitalize border-b border-border pb-2">
                {category} ({items.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 p-3 bg-muted rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={item.image_url || ''}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm truncate">
                        {item.name}
                      </p>
                      {item.color && (
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                          {item.color}
                        </p>
                      )}
                      {item.location && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          {item.location}
                        </p>
                      )}
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 2).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs px-1 py-0.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">
            Loading your outfits...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {(error || multiselectError || entityError) && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-sm">
            <p className="text-red-800 dark:text-red-200 text-sm font-medium">
              {error || multiselectError || entityError}
            </p>
            <button
              onClick={() => {
                setMultiselectError(null);
                setEntityError(null);
              }}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 hover:underline text-sm mt-2 font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full mx-auto">
              <div className="flex items-center gap-4 mb-2">
                <div className="hidden md:block p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Shirt className="h-8 w-8 text-white" />
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-between md:justify-start md:flex-col md:items-start gap-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      My Outfits
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <p className="text-sm font-medium">
                          {outfits.length} saved outfits
                          {hasSearchQuery && (
                            <span className="text-blue-600 dark:text-blue-400">
                              {' '}
                              ({resultCount})
                            </span>
                          )}
                        </p>
                      </div>
                      {outfits.length > 0 && (
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SelectionControls
                isSelectionMode={isSelectionMode}
                selectedCount={selectedItems.size}
                totalFilteredCount={displayedOutfits.length}
                onToggleSelectionMode={toggleSelectionMode}
                onSelectAll={() => selectAllItems(displayedOutfits)}
                onDeselectAll={deselectAllItems}
                onDeleteSelected={() => setShowDeleteDialog(true)}
              />

              {!isSelectionMode && (
                <Button
                  onClick={handleCreateNewOutfit}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create New Outfit
                </Button>
              )}
            </div>
          </div>

          {hasSearchQuery && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  {resultCount > 0 ? (
                    <>
                      Found <strong>{resultCount}</strong> outfit
                      {resultCount === 1 ? '' : 's'} matching "{searchQuery}"
                    </>
                  ) : (
                    <>No outfits found for "{searchQuery}"</>
                  )}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Clear
              </Button>
            </div>
          )}

          {displayedOutfits.length === 0 ? (
            <div className="text-center py-16">
              {hasSearchQuery ? (
                <div>
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    No matching outfits
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                    Try adjusting your search terms or browse all your outfits
                  </p>
                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    className="px-8 py-4"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-50 dark:from-blue-950 to-indigo-100 dark:to-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">👔</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    No outfits yet
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                    Create your first outfit by mixing and matching items from
                    your wardrobe
                  </p>
                  <Button
                    onClick={handleCreateNewOutfit}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                  >
                    Create Your First Outfit
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 mt-6">
              {displayedOutfits.map(outfit => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedItems.has(outfit.id)}
                  onView={() => handleView(outfit)}
                  onEdit={() => handleEditOutfit(outfit)}
                  onDelete={() => handleDelete(outfit)}
                  onToggleSelection={() => toggleItemSelection(outfit.id)}
                  categories={categories}
                />
              ))}
            </div>
          )}
        </div>

        <ViewModal
          isOpen={!!showViewModal}
          onClose={closeModals}
          title={
            selectedItem?.name ? `Outfit: ${selectedItem.name}` : 'Your Outfit'
          }
          subtitle={
            selectedItem
              ? (() => {
                  const count = selectedItem.outfit_items?.length || 0;
                  return `${count} item${
                    count !== 1 ? 's' : ''
                  } in this outfit`;
                })()
              : ''
          }
          maxWidth="xl"
        >
          {selectedItem && <ViewModalContent outfit={selectedItem} />}
        </ViewModal>

        <DeleteModal
          isOpen={!!showDeleteModal}
          onClose={closeModals}
          onConfirm={confirmDelete}
          title="Delete Outfit"
          itemName={selectedItem?.name}
          isLoading={isDeleting}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-foreground">
                Delete Selected Outfits
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete {selectedItems.size} outfit
                {selectedItems.size !== 1 ? 's' : ''}? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="px-6">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDeleteOutfits}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                Delete {selectedItems.size} outfit
                {selectedItems.size !== 1 ? 's' : ''}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default MyOutfits;
