// MyOutfits.tsx - Complete improved version with better styling
import React, { useState, useEffect } from 'react';
import { Plus, Shirt, Sparkles, TrendingUp } from 'lucide-react';
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
import { Input } from './ui/input';
import OutfitBuilder from './OutfitBuilder';
import { useMultiselect } from '../hooks/useMultiSelect';
import SelectionControls from './common/SelectionControls';
import SelectionCheckbox from './common/SelectionCheckbox';
import { getCurrentUser, supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

// Import our reusable components
import OutfitActions from './common/OutfitActions';
import ViewModal from './common/ViewModal';
import DeleteModal from './common/DeleteModal';
import { useOutfitActions } from '../hooks/useOutfitActions';
import { ClothingItemType, OutfitWithItems } from '@/types';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';

interface MyOutfitsProps {
  onCreateOutfit?: () => void;
  onEditOutfit: (outfit: OutfitWithItems) => void;
}

const MyOutfits: React.FC<MyOutfitsProps> = ({
  onCreateOutfit,
  onEditOutfit,
}) => {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);
  const [myOutfitsEditingOutfit, setMyOutfitsEditingOutfit] = useState(null);

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
    deleteSelectedItems,
  } = useMultiselect();

  // Use our reusable entity actions hook
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
    onView: outfit => {
      // Custom view logic if needed
    },
    onDelete: async outfit => {
      await handleDeleteOutfit(outfit.id);
    },
  });

  // Keep your original edit function exactly as it was
  const handleEditOutfit = (outfit: OutfitWithItems) => {
    setMyOutfitsEditingOutfit(outfit);
    setShowOutfitBuilder(true);
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      setLoading(true);

      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('outfits')
        .select(
          `
          *,
          outfit_items (
            clothing_item_id,
            wardrobe_items (*)
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching outfits:', error);
        setError('Failed to load outfits');
        return;
      }

      setOutfits((data as OutfitWithItems[]) || []);
    } catch (error) {
      console.error('Error fetching outfits:', error);
      setError('Failed to load outfits');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    // First delete the outfit_items
    const { error: outfitItemsError } = await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', outfitId);

    if (outfitItemsError) {
      throw new Error('Failed to delete outfit items');
    }

    // Then delete the outfit
    const { error: outfitError } = await supabase
      .from('outfits')
      .delete()
      .eq('id', outfitId);

    if (outfitError) {
      throw new Error('Failed to delete outfit');
    }

    setOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
  };

  // Handle bulk delete function specifically for outfits
  const handleBulkDeleteOutfits = async () => {
    if (selectedItems.size === 0) return;

    try {
      const idsToDelete = Array.from(selectedItems);

      // Delete outfit_items for all selected outfits first
      const { error: outfitItemsError } = await supabase
        .from('outfit_items')
        .delete()
        .in('outfit_id', idsToDelete);

      if (outfitItemsError) {
        console.error('Error deleting outfit items:', outfitItemsError);
        setError('Failed to delete outfit items');
        return;
      }

      // Delete the outfits
      const { error: outfitsError } = await supabase
        .from('outfits')
        .delete()
        .in('id', idsToDelete);

      if (outfitsError) {
        console.error('Error deleting outfits:', outfitsError);
        setError('Failed to delete outfits');
        return;
      }

      // Update local state
      setOutfits(prev =>
        prev.filter(outfit => !idsToDelete.includes(outfit.id))
      );

      // Reset multiselect state
      deselectAllItems();
      setShowDeleteDialog(false);
      toggleSelectionMode(); // Exit selection mode
    } catch (error) {
      console.error('Error in bulk delete:', error);
      setError('Failed to delete outfits');
    }
  };

  // Helper function to organize outfit items by category
  const organizeOutfitItems = (
    outfit: OutfitWithItems,
    allCategories: string[]
  ) => {
    if (!outfit?.outfit_items) {
      console.log('No outfit_items found in outfit:', outfit);
      return {};
    }

    const organized: Record<string, ClothingItemType | null> = {};

    // Initialize all categories
    allCategories.forEach(cat => {
      organized[cat] = null;
    });

    // Process each item
    outfit.outfit_items?.forEach(item => {
      const clothingItem = item.wardrobe_items;
      if (clothingItem) {
        const itemCategory = clothingItem.category.toLowerCase();

        const matchedCategory = allCategories.find(
          cat => cat.toLowerCase() === itemCategory
        );

        if (matchedCategory) {
          organized[matchedCategory] = clothingItem;
        } else {
          console.warn(`🔴 No match for category: "${clothingItem.category}"`);
        }
      }
    });

    return organized;
  };

  // ViewModalContent component that properly uses categories
  const ViewModalContent: React.FC<{ outfit: OutfitWithItems }> = ({
    outfit,
  }) => {
    const { categories } = useWardrobeItems();
    const items = organizeOutfitItems(outfit, categories);

    return (
      <div className="space-y-6">
        {/* Occasions */}
        {outfit.occasions && outfit.occasions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {outfit.occasions.map((occasion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium"
              >
                {occasion}
              </Badge>
            ))}
          </div>
        )}

        {/* Outfit Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(items).map(
            ([category, item]) =>
              item && (
                <div
                  key={category}
                  className="flex flex-col gap-2 p-1 bg-gray-50 hover:shadow-sm transition-shadow"
                >
                  {/* <CardHeader className="pb-3">
                    <CardTitle className="text-sm capitalize font-semibold text-gray-900">
                      {category}
                    </CardTitle>
                  </CardHeader> */}
                  {/* <CardContent className="pt-0 "> */}
                  <div className="flex md:flex-col items-center gap-2">
                    <div className="w-20 h-20 md:w-full md:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image_url || ''}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      {item.color && (
                        <p className="text-sm text-gray-600 capitalize mt-1">
                          {item.color}
                        </p>
                      )}
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 2).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs px-2 py-0.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* </CardContent> */}
                </div>
              )
          )}
        </div>
      </div>
    );
  };

  const OutfitCard: React.FC<{ outfit: OutfitWithItems }> = ({ outfit }) => {
    const { categories } = useWardrobeItems();
    const isSelected = selectedItems.has(outfit.id);
    const items = organizeOutfitItems(outfit, categories);

    // Filter out empty categories - only show categories that have items
    const itemsWithContent = Object.entries(items).filter(
      ([category, item]) => item !== null
    );

    return (
      <div className="relative">
        {/* Selection checkbox */}
        <SelectionCheckbox
          isSelectionMode={isSelectionMode}
          isSelected={isSelected}
          onToggleSelection={() => toggleItemSelection(outfit.id)}
        />

        <Card
          className={`group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 ${
            isSelectionMode && isSelected
              ? 'ring-2 ring-blue-500 ring-offset-2'
              : ''
          }`}
        >
          <CardHeader className="py-2 px-4 md:p-6 pb-2 md:pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-l font-semibold text-gray-900 mb-1 truncate">
                  {outfit.name}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Created:{' '}
                  {new Date(outfit.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>

                {/* Occasions with improved styling */}
                {/* {outfit.occasions && outfit.occasions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {outfit.occasions.slice(0, 3).map((occasion, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border-0 rounded-full font-medium"
                      >
                        {occasion}
                      </Badge>
                    ))}
                    {outfit.occasions.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full"
                      >
                        +{outfit.occasions.length - 3}
                      </Badge>
                    )}
                  </div>
                )} */}
              </div>

              {/* Action buttons with improved positioning */}
              {!isSelectionMode && (
                <div className="group-hover:opacity-100 transition-opacity duration-200 ml-3">
                  <OutfitActions
                    onView={() => handleView(outfit)}
                    onEdit={() => handleEditOutfit(outfit)}
                    onDelete={() => handleDelete(outfit)}
                    viewTitle="View outfit details"
                    editTitle="Edit outfit"
                    deleteTitle="Delete outfit"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-6 py-2">
            {/* Items display with improved layout */}
            {itemsWithContent.length > 0 ? (
              <div className="space-y-0">
                {/* Item count indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {itemsWithContent.length} item
                    {itemsWithContent.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items grid with better spacing */}
                <div className="grid grid-cols-3 gap-3">
                  {itemsWithContent.map(([category, item]) => (
                    <div key={category} className="group/item relative">
                      {/* Image container with better aspect ratio */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-100 shadow-sm group-hover/item:shadow-md transition-all duration-200">
                        <img
                          src={item.image_url || ''}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-all duration-200" />
                      </div>

                      {/* Category label with better typography */}
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-gray-700 capitalize tracking-wide">
                          {category}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5 max-w-full">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👔</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  No items in this outfit
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your outfits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Error display */}
        {(error || multiselectError || entityError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <p className="text-red-800 text-sm font-medium">
              {error || multiselectError || entityError}
            </p>
            <button
              onClick={() => {
                setError(null);
                setMultiselectError(null);
                setEntityError(null);
              }}
              className="text-red-600 hover:text-red-800 hover:underline text-sm mt-2 font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              {/* Icon with gradient background */}
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Shirt className="h-8 w-8 text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  My Outfits
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-gray-600">
                    {/* <TrendingUp className="h-4 w-4" /> */}
                    <p className="text-sm font-medium">
                      You have {outfits.length} saved outfit
                      {outfits.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {outfits.length > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Sparkles className="h-4 w-4" />
                      {/* <span className="text-sm font-medium">Collection</span> */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Selection Controls */}
            <SelectionControls
              isSelectionMode={isSelectionMode}
              selectedCount={selectedItems.size}
              totalFilteredCount={outfits.length}
              onToggleSelectionMode={toggleSelectionMode}
              onSelectAll={() => selectAllItems(outfits)}
              onDeselectAll={deselectAllItems}
              onDeleteSelected={() => setShowDeleteDialog(true)}
            />

            {/* Create button with gradient */}
            {onCreateOutfit && !isSelectionMode && (
              <Button
                onClick={onCreateOutfit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create New Outfit
              </Button>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showOutfitBuilder && (
          <OutfitBuilder
            isOpen={true}
            editingOutfit={myOutfitsEditingOutfit}
            onClose={() => {
              setShowOutfitBuilder(false);
              setMyOutfitsEditingOutfit(null);
            }}
            onEditComplete={() => {
              fetchOutfits();
              setShowOutfitBuilder(false);
              setMyOutfitsEditingOutfit(null);
            }}
            onOutfitSaved={() => {
              fetchOutfits();
              setShowOutfitBuilder(false);
              setMyOutfitsEditingOutfit(null);
            }}
          />
        )}

        {/* Outfits Grid */}
        {outfits.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">👔</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No outfits yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Create your first outfit by mixing and matching items from your
              wardrobe
            </p>
            {onCreateOutfit && (
              <Button
                onClick={onCreateOutfit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                Create Your First Outfit
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
            {outfits.map(outfit => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        )}

        {/* Reusable View Modal */}
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

        {/* Reusable Delete Modal */}
        <DeleteModal
          isOpen={!!showDeleteModal}
          onClose={closeModals}
          onConfirm={confirmDelete}
          title="Delete Outfit"
          itemName={selectedItem?.name}
          isLoading={isDeleting}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                Delete Selected Outfits
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
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
