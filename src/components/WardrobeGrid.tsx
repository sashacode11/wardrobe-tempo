// WardrobeGrid.tsx - Enhanced with outfit impact warning
import React, { useState } from 'react';
import { Plus, AlertTriangle, Shirt } from 'lucide-react';
import { ClothingItemType } from '../types';
import { useMultiselect } from '../hooks/useMultiSelect';
import SelectionControls from './common/SelectionControls';
import SelectionCheckbox from './common/SelectionCheckbox';
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
import { Button } from '@/components/ui/button';
import { supabase } from '../lib/supabaseClient';
import { useWardrobe } from '../contexts/WardrobeContext';

interface WardrobeGridProps {
  items: ClothingItemType[];
  loading?: boolean;
  onAddItem: () => void;
  onAddToOutfit: (item: ClothingItemType) => void;
  onEditItem: (item: ClothingItemType) => void;
  activeFilters: Record<string, string>;
  activeCategory: string;
  onClearFilters: () => void;
}

const WardrobeGrid: React.FC<WardrobeGridProps> = ({
  items,
  loading = false,
  onAddItem,
  onAddToOutfit,
  onEditItem,
  activeFilters,
  activeCategory,
  onClearFilters,
}) => {
  // Get global context
  const { removeItem, markOutfitsAsIncomplete, getAffectedOutfits } =
    useWardrobe();

  // State for outfit impact warning
  const [showOutfitWarning, setShowOutfitWarning] = useState(false);
  const [affectedOutfits, setAffectedOutfits] = useState([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  // Add multiselect functionality
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
  } = useMultiselect();

  // Check outfit impact before showing delete confirmation
  const checkOutfitImpact = async (itemIds: string[]) => {
    try {
      const affected = await getAffectedOutfits(itemIds);
      setAffectedOutfits(affected);
      setPendingDeleteIds(itemIds);

      if (affected.length > 0) {
        setShowOutfitWarning(true);
      } else {
        // No outfits affected, proceed directly to delete
        await handleConfirmedDelete(itemIds);
      }
    } catch (error) {
      console.error('Error checking outfit impact:', error);
      setMultiselectError('Failed to check outfit impact');
    }
  };

  // Handle the actual deletion after user confirmation
  const handleConfirmedDelete = async (itemIds: string[]) => {
    try {
      // First mark affected outfits as incomplete
      await markOutfitsAsIncomplete(itemIds);

      // Delete related outfit_items
      const { error: outfitItemsError } = await supabase
        .from('outfit_items')
        .delete()
        .in('clothing_item_id', itemIds);

      if (outfitItemsError) {
        console.error('Error deleting related outfit items:', outfitItemsError);
        setMultiselectError('Failed to delete related outfit items');
        return;
      }

      // Delete the wardrobe items
      const { error: itemsError } = await supabase
        .from('wardrobe_items')
        .delete()
        .in('id', itemIds);

      if (itemsError) {
        console.error('Error deleting wardrobe items:', itemsError);
        setMultiselectError('Failed to delete items');
        return;
      }

      // Update global state
      itemIds.forEach(id => removeItem(id));

      // Reset states
      deselectAllItems();
      setShowDeleteDialog(false);
      setShowOutfitWarning(false);
      toggleSelectionMode();
    } catch (error) {
      console.error('Error in confirmed delete:', error);
      setMultiselectError('Failed to delete items');
    }
  };

  // Handle bulk delete - now with outfit impact check
  const handleBulkDeleteItems = async () => {
    if (selectedItems.size === 0) return;
    const idsToDelete = Array.from(selectedItems);
    await checkOutfitImpact(idsToDelete);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading items...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    const hasActiveFilters =
      Object.values(activeFilters).some(Boolean) || activeCategory !== 'all';

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-4 max-w-md">
          {hasActiveFilters ? (
            <>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No items found</h3>
              <p className="text-muted-foreground">
                No items match your current filters. Try adjusting your search
                criteria.
              </p>
              <button
                onClick={onClearFilters}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Your wardrobe is empty</h3>
              <p className="text-muted-foreground">
                Start building your digital wardrobe by adding your first
                clothing item.
              </p>
              <button
                onClick={onAddItem}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add Your First Item
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Error display */}
      {multiselectError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm mb-4">
          <p className="text-red-800 text-sm font-medium">{multiselectError}</p>
          <button
            onClick={() => setMultiselectError(null)}
            className="text-red-600 hover:text-red-800 hover:underline text-sm mt-2 font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Selection Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </div>

        <SelectionControls
          isSelectionMode={isSelectionMode}
          selectedCount={selectedItems.size}
          totalFilteredCount={items.length}
          onToggleSelectionMode={toggleSelectionMode}
          onSelectAll={() => selectAllItems(items)}
          onDeselectAll={deselectAllItems}
          onDeleteSelected={() => setShowDeleteDialog(true)}
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {items.map(item => {
          const isSelected = selectedItems.has(item.id);

          return (
            <div
              key={item.id}
              className={`relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group ${
                isSelectionMode && isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : ''
              }`}
            >
              <SelectionCheckbox
                isSelectionMode={isSelectionMode}
                isSelected={isSelected}
                onToggleSelection={() => toggleItemSelection(item.id)}
              />

              <div className="aspect-square relative overflow-hidden bg-gray-50">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Plus className="h-12 w-12" />
                  </div>
                )}

                {!isSelectionMode && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditItem(item)}
                        className="px-3 py-1 bg-white text-black text-sm rounded hover:bg-gray-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onAddToOutfit(item)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Add to Outfit
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 capitalize">
                    {item.category}
                  </span>
                  {item.color && (
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: item.color }}
                      title={item.color}
                    />
                  )}
                </div>
                {item.brand && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {item.brand}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Initial Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Delete Selected Items
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete {selectedItems.size} item
              {selectedItems.size !== 1 ? 's' : ''}? We'll check if any outfits
              will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteItems}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
              disabled={deletingItems}
            >
              {deletingItems ? 'Checking...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Outfit Impact Warning Dialog */}
      <AlertDialog open={showOutfitWarning} onOpenChange={setShowOutfitWarning}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-semibold text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Outfits Will Be Affected
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Deleting these items will affect{' '}
                  <strong>{affectedOutfits.length}</strong> outfit
                  {affectedOutfits.length !== 1 ? 's' : ''}. The affected
                  outfits will be marked as
                  <strong> incomplete</strong> and you can fix them later.
                </p>

                {/* Show affected outfits */}
                <div className="bg-amber-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
                    <Shirt className="h-4 w-4" />
                    Affected Outfits:
                  </h4>
                  <div className="space-y-1">
                    {affectedOutfits.map(outfit => (
                      <div
                        key={outfit.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-amber-700">
                          {outfit.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {outfit.items?.length || 0} items
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>What happens next:</strong>
                    <br />
                    • Affected outfits will be marked as "incomplete"
                    <br />
                    • You'll see a notification to fix them
                    <br />• You can add replacement items or delete incomplete
                    outfits
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmedDelete(pendingDeleteIds)}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              Delete Items & Mark Outfits Incomplete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WardrobeGrid;
