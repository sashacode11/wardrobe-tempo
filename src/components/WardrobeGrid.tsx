// WardrobeGrid.tsx - Simplified, receives filters from parent

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import ClothingItem from './ClothingItem';
import SelectionControls from './common/SelectionControls';
import SelectionCheckbox from './common/SelectionCheckbox';
import {
  getCurrentUser,
  getClothingItems,
  deleteClothingItem,
} from '../lib/supabaseClient';
import { ClothingItemType, OutfitWithItems, WardrobeGridProps } from '../types';
import { useMultiselect } from '../hooks/useMultiSelect';
import { useSearch } from '../hooks/useSearch';

const WardrobeGrid = ({
  searchQuery = '',
  activeCategory = 'all',
  activeFilters = {},
  onAddItem = () => {},
  onAddToOutfit = () => {},
  onEditItem = () => {},
}: WardrobeGridProps) => {
  const [items, setItems] = useState<ClothingItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items
  useEffect(() => {
    loadClothingItems();
  }, []);

  const loadClothingItems = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await getClothingItems(user.id);
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error('Error loading items:', err);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Apply search, category, and filters
  const { filteredItems: searchFilteredItems } = useSearch(items, {
    searchFields: ['name', 'category', 'color', 'tags'],
    caseSensitive: false,
  });

  const searchFiltered = searchQuery
    ? searchFilteredItems.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.color?.toLowerCase().includes(q) ||
          (Array.isArray(item.tags) &&
            item.tags.some(tag => tag?.toLowerCase().includes(q)))
        );
      })
    : searchFilteredItems;

  const categoryFiltered =
    activeCategory !== 'all'
      ? searchFiltered.filter(item => item.category === activeCategory)
      : searchFiltered;

  // Apply dynamic filters (color, seasons, occasions)
  const finalFilteredItems = Object.keys(activeFilters).length
    ? categoryFiltered.filter(item => {
        return Object.entries(activeFilters).every(([key, value]) => {
          if (!value) return true;
          if (key === 'color') return item.color === value;
          if (key === 'seasons')
            return Array.isArray(item.seasons) && item.seasons.includes(value);
          if (key === 'occasions')
            return (
              Array.isArray(item.occasions) && item.occasions.includes(value)
            );
          return true;
        });
      })
    : categoryFiltered;

  // Multiselect
  const {
    isSelectionMode,
    selectedItems,
    showDeleteDialog,
    deletingItems,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    toggleSelectionMode,
    deleteSelectedItems,
    setShowDeleteDialog,
  } = useMultiselect();

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await deleteClothingItem(id);
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const handleEditItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) onEditItem(item);
  };

  const handleAddToOutfit = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) onAddToOutfit(item);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Results Info (now receives counts from parent) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto px-2">
        {finalFilteredItems.length > 0 ? (
          finalFilteredItems.map(item => (
            <div key={item.id} className="relative">
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
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No items match your filters.
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {}}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Multiselect */}
      <SelectionControls
        isSelectionMode={isSelectionMode}
        selectedCount={selectedItems.size}
        totalFilteredCount={finalFilteredItems.length}
        onToggleSelectionMode={toggleSelectionMode}
        onSelectAll={() => selectAllItems(finalFilteredItems)}
        onDeselectAll={deselectAllItems}
        onDeleteSelected={() => setShowDeleteDialog(true)}
      />
    </div>
  );
};

export default WardrobeGrid;
