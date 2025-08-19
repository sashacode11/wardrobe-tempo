import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useMultiselect = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItems, setDeletingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Select all visible items
  const selectAllItems = (filteredItems: Array<{ id: string }>) => {
    const allIds = filteredItems.map(item => item.id);
    setSelectedItems(new Set(allIds));
  };

  // Deselect all items
  const deselectAllItems = () => {
    setSelectedItems(new Set());
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems(new Set());
  };

  // Delete selected items
  const deleteSelectedItems = async (
    onSuccess: (deletedIds: string[]) => void
  ) => {
    try {
      setDeletingItems(true);
      const idsToDelete = Array.from(selectedItems);

      const { error } = await supabase
        .from('wardrobe_items') // Use your actual table name
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;

      // Call success callback to update local state
      onSuccess(idsToDelete);

      // Reset selection state
      setSelectedItems(new Set());
      setIsSelectionMode(false);
      setShowDeleteDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete items');
    } finally {
      setDeletingItems(false);
    }
  };

  return {
    isSelectionMode,
    selectedItems,
    showDeleteDialog,
    deletingItems,
    error,
    setShowDeleteDialog,
    setError,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    toggleSelectionMode,
    deleteSelectedItems,
  };
};
