// hooks/useMultiselect.ts - Improved reusable version
import { useState } from 'react';

interface MultiselectOptions<T> {
  // Optional custom delete function - if not provided, assumes simple table deletion
  onDelete?: (selectedIds: string[]) => Promise<void>;
  // Table name for simple deletions (when onDelete not provided)
  tableName?: string;
  // Success callback after deletion
  onSuccess?: (deletedIds: string[]) => void;
  // Error callback
  onError?: (error: string) => void;
}

export const useMultiselect = <T extends { id: string }>(
  options: MultiselectOptions<T> = {}
) => {
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
  const selectAllItems = (filteredItems: T[]) => {
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
    setError(null); // Clear any existing errors
  };

  // Delete selected items - now fully customizable
  const deleteSelectedItems = async () => {
    if (selectedItems.size === 0) return;

    try {
      setDeletingItems(true);
      setError(null);
      const idsToDelete = Array.from(selectedItems);

      if (options.onDelete) {
        // Use custom delete function
        await options.onDelete(idsToDelete);
      } else if (options.tableName) {
        // Use simple table deletion with Supabase
        const { supabase } = await import('../lib/supabaseClient');
        const { error } = await supabase
          .from(options.tableName)
          .delete()
          .in('id', idsToDelete);

        if (error) throw new Error(error.message);
      } else {
        throw new Error('No delete method provided');
      }

      // Call success callback
      if (options.onSuccess) {
        options.onSuccess(idsToDelete);
      }

      // Reset selection state
      setSelectedItems(new Set());
      setIsSelectionMode(false);
      setShowDeleteDialog(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete items';
      setError(errorMessage);

      if (options.onError) {
        options.onError(errorMessage);
      }
    } finally {
      setDeletingItems(false);
    }
  };

  return {
    // State
    isSelectionMode,
    selectedItems,
    showDeleteDialog,
    deletingItems,
    error,

    // Setters
    setShowDeleteDialog,
    setError,

    // Actions
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    toggleSelectionMode,
    deleteSelectedItems,

    // Computed values
    selectedCount: selectedItems.size,
    hasSelection: selectedItems.size > 0,
  };
};
