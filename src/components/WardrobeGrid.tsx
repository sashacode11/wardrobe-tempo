// WardrobeGrid.tsx - Fixed filter button implementation
import React, { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  Shirt,
  Filter,
  Trash2,
  Square,
} from 'lucide-react';
import { ClothingItemType } from '../types';
import { useMultiselect } from '../hooks/useMultiSelect';
import SelectionControls from './common/SelectionControls';
import SelectionCheckbox from './common/SelectionCheckbox';
import ClothingItem from './ClothingItem';
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
import OutfitRepairView from './OutfitRepairView';
import { Tabs } from '@radix-ui/react-tabs';
import IncompleteOutfitsNotification from './IncompleteOutfitsNotification';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import EmptyWardrobeState from './EmptyWardrobeState';

interface WardrobeGridProps {
  items: ClothingItemType[];
  loading?: boolean;
  onAddItem: () => void;
  onAddToOutfit: (item: ClothingItemType) => void;
  onEditItem: (item: ClothingItemType) => void;
  activeFilters: Record<string, string>;
  activeCategory: string;
  onClearFilters: () => void;
  searchQuery?: string;
  onShowFilterModal?: () => void;
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
  searchQuery = '',
  onShowFilterModal, // Add this prop
}) => {
  const { isOnline, isSupabaseConnected, lastSyncTime, isConnected } =
    useConnectionStatus();

  // Get global context
  const {
    removeItem,
    markOutfitsAsIncomplete,
    getAffectedOutfits,
    refreshItems,
  } = useWardrobe();

  // Handle refresh
  const handleRefresh = async () => {
    await refreshItems();
  };

  // State for outfit impact warning
  const [showOutfitWarning, setShowOutfitWarning] = useState(false);
  const [affectedOutfits, setAffectedOutfits] = useState([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [showRepairView, setShowRepairView] = useState(false);
  const [activeTab, setActiveTab] = useState('wardrobe');
  const [isNotificationDismissed, setIsNotificationDismissed] = useState(false);

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

  // Calculate active filters
  const hasActiveFilters =
    Object.values(activeFilters).some(value => value && value !== '') ||
    activeCategory !== 'all';
  const activeFilterCount =
    Object.values(activeFilters).filter(value => value && value !== '').length +
    (activeCategory !== 'all' ? 1 : 0);

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
      // toggleSelectionMode();
      if (isSelectionMode) {
        toggleSelectionMode();
      }
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

  // Handle individual item deletion
  const handleDeleteItem = async (id: string) => {
    await checkOutfitImpact([id]);
  };

  // Handle editing individual item
  const handleEditItem = (id: string) => {
    const itemToEdit = items.find(item => item.id === id);
    if (itemToEdit) {
      onEditItem(itemToEdit);
    }
  };

  // Handle adding item to outfit
  const handleAddToOutfit = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item && onAddToOutfit) {
      onAddToOutfit(item);
    }
  };

  // Handle view outfit from item
  const handleViewOutfitFromItem = (outfit: any) => {
    // Implement outfit viewing logic here
    console.log('View outfit:', outfit);
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
      <EmptyWardrobeState
        hasActiveFilters={hasActiveFilters}
        isConnected={isConnected}
        isOnline={isOnline}
        lastSyncTime={lastSyncTime}
        itemCount={items.length}
        onAddItem={onAddItem}
        onClearFilters={onClearFilters}
        onRefresh={handleRefresh}
        loading={loading}
      />
    );
  }

  return (
    <>
      {/* Connection status banner  */}
      {!isConnected && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-orange-800 text-sm">
              {!isOnline
                ? "You're offline. Some features may not work."
                : 'Connection issue detected. Data may not be current.'}
            </p>
            <button
              onClick={handleRefresh}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium underline"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      )}

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

      {/* count items and multiselect */}
      <div className="flex justify-between items-center mb-4 px-2 gap-4">
        {/* Left: Filter Button */}
        {/* <button
          onClick={() => {
            if (onShowFilterModal) {
              onShowFilterModal();
            } else {
              console.error('onShowFilterModal is not defined');
            }
          }}
          className={`flex flex-row gap-1 items-center py-1.5 px-3 rounded-lg transition-colors text-sm ${
            hasActiveFilters
              ? 'text-blue-600'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-blue-600 text-white text-xs font-medium rounded-full px-1.5">
              {activeFilterCount}
            </span>
          )}
        </button> */}

        {/* Center: Item Count */}
        <div className="text-sm text-muted-foreground text-center">
          You have {items.length} item{items.length !== 1 ? 's' : ''} total
        </div>

        {/* Right: Bulk Delete Button */}
        <Button
          variant="outline"
          size="sm"
          className="text-sm"
          onClick={toggleSelectionMode}
        >
          <Square className="mr-2 h-4 w-4" />
          Bulk Delete
        </Button>
      </div>

      {/* Clothing Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 overflow-y-auto flex-grow px-0 w-full !mt-2">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className="relative">
              {/* Reusable Selection Checkbox Component */}
              <SelectionCheckbox
                isSelectionMode={isSelectionMode}
                isSelected={selectedItems.has(item.id)}
                onToggleSelection={() => toggleItemSelection(item.id)}
              />

              <ClothingItem
                id={item.id}
                image={item.image_url}
                name={item.name}
                category={item.category}
                color={item.color}
                location={item.location}
                seasons={item.seasons}
                occasions={item.occasions}
                tags={item.tags}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onAddToOutfit={handleAddToOutfit}
                isSelected={selectedItems.has(item.id)}
                isSelectionMode={isSelectionMode}
                onViewOutfit={handleViewOutfitFromItem}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {items.length === 0
                ? 'No items in your wardrobe yet'
                : searchQuery
                ? `No items found matching "${searchQuery}"`
                : 'No items found matching your filters'}
            </p>
            {items.length === 0 ? (
              <Button onClick={onAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            ) : (
              <Button variant="outline" onClick={onClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {!isNotificationDismissed && (
        <IncompleteOutfitsNotification
          onFixOutfits={() => setShowRepairView(true)}
          onDismiss={() => setIsNotificationDismissed(true)}
          showDismiss={true}
        />
      )}

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
