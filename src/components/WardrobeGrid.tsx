// WardrobeGrid.tsx - Using pre-filtered data from parent
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import ClothingItem from './ClothingItem';
import SelectionControls from './common/SelectionControls';
import SelectionCheckbox from './common/SelectionCheckbox';
import {
  getCurrentUser,
  getClothingItems,
  deleteClothingItem,
} from '../lib/supabaseClient';
import { ClothingItemType, WardrobeGridProps } from '../types';
import { useMultiselect } from '../hooks/useMultiSelect';
import ResultsInfo from './common/ResultsInfo';
import { Search, Shirt, Sparkles } from 'lucide-react';

const WardrobeGrid = ({
  searchQuery = '',
  activeCategory = 'all',
  activeFilters = {},
  filteredItems = [], // Add this prop to receive pre-filtered items
  onAddItem = () => {},
  onAddToOutfit = () => {},
  onEditItem = () => {},
  onClearFilters = () => {},
}: WardrobeGridProps & { filteredItems?: ClothingItemType[] }) => {
  const [items, setItems] = useState<ClothingItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items from Supabase
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

  // Apply search and category filters to the pre-filtered items from parent
  const finalFilteredItems = useMemo(() => {
    // Use filteredItems from parent if provided, otherwise use all items
    let result = filteredItems.length > 0 ? [...filteredItems] : [...items];

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.name?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.color?.toLowerCase().includes(q) ||
          (Array.isArray(item.tags) &&
            item.tags.some(tag => tag?.toLowerCase().includes(q)))
      );
    }

    // Apply category filter
    if (activeCategory !== 'all') {
      result = result.filter(item => item.category === activeCategory);
    }

    return result;
  }, [filteredItems, items, searchQuery, activeCategory, activeFilters]);

  const totalCount = items.length;
  const filteredCount = finalFilteredItems.length;

  // Multiselect logic
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Loading your wardrobe
            </p>
            <p className="text-sm text-gray-500">
              Fetching your amazing collection...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4 bg-red-50 rounded-2xl p-8 border border-red-200">
          <div className="w-12 h-12 bg-red-100 rounded-full mx-auto flex items-center justify-center">
            <Shirt className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-red-800 font-medium">
              Oops! Something went wrong
            </p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <Button
            onClick={loadClothingItems}
            variant="outline"
            className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Determine what state to show
  const hasItems = items.length > 0;
  const hasFilters =
    searchQuery ||
    activeCategory !== 'all' ||
    Object.keys(activeFilters).some(key => activeFilters[key]);
  const hasResults = finalFilteredItems.length > 0;

  return (
    <div className="w-full">
      {/* Header: Results Info + Selection Controls */}
      <div className="flex items-center justify-between p-2">
        <ResultsInfo
          totalCount={totalCount}
          filteredCount={filteredCount}
          itemType="item"
          searchQuery={searchQuery}
          activeCategory={activeCategory}
        />

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

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6">
        {hasResults ? (
          finalFilteredItems.map((item, index) => (
            <div
              key={item.id}
              className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{
                animationDelay: `${Math.min(index * 50, 1000)}ms`,
                animationFillMode: 'both',
              }}
            >
              <SelectionCheckbox
                isSelectionMode={isSelectionMode}
                isSelected={selectedItems.has(item.id)}
                onToggleSelection={() => toggleItemSelection(item.id)}
              />
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
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
            </div>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl mx-auto flex items-center justify-center">
                  {hasFilters ? (
                    <Search className="w-10 h-10 text-gray-400" />
                  ) : (
                    <Shirt className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-yellow-600" />
                </div>
              </div>

              <div className="space-y-3">
                {!hasItems ? (
                  // No items at all in wardrobe
                  <>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Your wardrobe is empty
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Start building your digital wardrobe by adding your first
                      item. Upload photos and organize your clothing collection.
                    </p>
                  </>
                ) : hasFilters && !hasResults ? (
                  // Has items but no filtered results
                  <>
                    <h3 className="text-xl font-semibold text-gray-900">
                      No items found
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      We couldn't find any items matching your current filters.
                      Try adjusting your search or clearing some filters.
                    </p>
                  </>
                ) : (
                  // Fallback
                  <>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Your wardrobe is empty
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Start building your digital wardrobe by adding your first
                      item.
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-row gap-3 justify-center">
                {hasFilters ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={onClearFilters}
                      className="rounded-full border-2 backdrop-blur-sm hover:bg-white/80 px-6 py-2.5"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      onClick={onAddItem}
                      className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-2.5 font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                    >
                      <Shirt className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={onAddItem}
                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                  >
                    <Shirt className="w-5 h-5 mr-2" />
                    Add Your First Item
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobeGrid;
