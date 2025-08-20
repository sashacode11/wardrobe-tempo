import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, X, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import ClothingItem from './ClothingItem';
import SelectionControls from './multiselect/SelectionControls';
import SelectionCheckbox from './multiselect/SelectionCheckbox';
import {
  supabase,
  getCurrentUser,
  getClothingItems,
  deleteClothingItem,
} from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import { ClothingItemType } from '../types';
import { useMultiselect } from '../hooks/useMultiSelect';

interface WardrobeGridProps {
  searchQuery?: string;
  selectedCategory?: string;
  onAddItem?: () => void;
  onSelectItem?: (item: ClothingItemType) => void;
  onAddToOutfit?: (item: ClothingItemType) => void;
  onEditItem?: (item: ClothingItemType) => void;
}

const WardrobeGrid = ({
  searchQuery = '',
  selectedCategory = 'all',
  onAddItem = () => {},
  onSelectItem = () => {},
  onAddToOutfit = () => {},
  onEditItem = () => {},
}: WardrobeGridProps) => {
  const [items, setItems] = useState<ClothingItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [activeFilters, setActiveFilters] = useState<{
    color: string;
    season: string;
    occasion: string;
  }>({
    color: '',
    season: '',
    occasion: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Use the multiselect hook
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

  const [error, setError] = useState<string | null>(null);

  // Update activeCategory when selectedCategory prop changes
  useEffect(() => {
    setActiveCategory(selectedCategory);
  }, [selectedCategory]);

  // Load clothing items from Supabase
  useEffect(() => {
    loadClothingItems();
  }, []);

  const loadClothingItems = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.log('No user found');
        setLoading(false);
        return;
      }

      const { data, error } = await getClothingItems(user.id);
      if (error) {
        console.error('Error loading clothing items:', error);
        setError('Failed to load items');
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error loading clothing items:', error);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await deleteClothingItem(id);
      if (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item');
      } else {
        // Remove item from local state
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item');
    }
  };

  const handleEditItem = (id: string) => {
    const itemToEdit = items.find(item => item.id === id);
    if (itemToEdit) {
      onEditItem(itemToEdit);
    }
  };

  const handleAddToOutfit = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item && onAddToOutfit) {
      onAddToOutfit(item);
    }
  };

  // Handle bulk delete success
  const handleBulkDeleteSuccess = (deletedIds: string[]) => {
    setItems(prev => prev.filter(item => !deletedIds.includes(item.id)));
  };

  // Filter items based on search query and active filters
  const filteredItems = items.filter(item => {
    // Search filter
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }

    // Color filter
    if (activeFilters.color && item.color !== activeFilters.color) {
      return false;
    }

    // Season filter
    if (
      activeFilters.season &&
      item.seasons &&
      !item.seasons.includes(activeFilters.season)
    ) {
      return false;
    }

    // Occasion filter
    if (
      activeFilters.occasion &&
      item.occasions &&
      !item.occasions.includes(activeFilters.occasion)
    ) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setActiveFilters({
      color: '',
      season: '',
      occasion: '',
    });
    setActiveCategory('all');
  };

  const categories = [
    'all',
    'tops',
    'bottoms',
    'dresses',
    'outerwear',
    'shoes',
    'accessories',
    'formal',
  ];
  const colors = [
    'black',
    'white',
    'blue',
    'red',
    'green',
    'yellow',
    'purple',
    'pink',
    'brown',
    'gray',
  ];
  const seasons = ['spring', 'summer', 'fall', 'winter', 'all'];
  const occasions = [
    'casual',
    'formal',
    'business',
    'party',
    'sporty',
    'semi-formal',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background flex flex-col gap-4">
      {/* Error display */}
      {(error || multiselectError) && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <p className="text-destructive text-sm">
            {error || multiselectError}
          </p>
          <button
            onClick={() => {
              setError(null);
              setMultiselectError(null);
            }}
            className="text-destructive hover:underline text-sm mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          <Button onClick={onAddItem} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-4">
        {/* Results info */}
        <div className="text-sm text-muted-foreground">
          {searchQuery
            ? `Found ${filteredItems.length} item${
                filteredItems.length !== 1 ? 's' : ''
              } matching "${searchQuery}"`
            : `${filteredItems.length} item${
                filteredItems.length !== 1 ? 's' : ''
              } ${activeCategory !== 'all' ? `in ${activeCategory}` : 'total'}`}
        </div>

        {/* Multiselects */}
        <div className="flex-shrink-0">
          <SelectionControls
            isSelectionMode={isSelectionMode}
            selectedCount={selectedItems.size}
            totalFilteredCount={filteredItems.length}
            onToggleSelectionMode={toggleSelectionMode}
            onSelectAll={() => selectAllItems(filteredItems)}
            onDeselectAll={deselectAllItems}
            onDeleteSelected={() => setShowDeleteDialog(true)}
          />
        </div>
      </div>

      {/* Active Filters */}
      {(activeFilters.color ||
        activeFilters.season ||
        activeFilters.occasion ||
        activeCategory !== 'all') && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {activeCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {activeCategory}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setActiveCategory('all')}
              />
            </Badge>
          )}

          {activeFilters.color && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Color: {activeFilters.color}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setActiveFilters({ ...activeFilters, color: '' })
                }
              />
            </Badge>
          )}

          {activeFilters.season && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Season: {activeFilters.season}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setActiveFilters({ ...activeFilters, season: '' })
                }
              />
            </Badge>
          )}

          {activeFilters.occasion && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Occasion: {activeFilters.occasion}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setActiveFilters({ ...activeFilters, occasion: '' })
                }
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-muted/30 p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Color</label>
            <Select
              value={activeFilters.color}
              onValueChange={value =>
                setActiveFilters({ ...activeFilters, color: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map(color => (
                  <SelectItem key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Season</label>
            <Select
              value={activeFilters.season}
              onValueChange={value =>
                setActiveFilters({ ...activeFilters, season: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map(season => (
                  <SelectItem key={season} value={season}>
                    {season.charAt(0).toUpperCase() + season.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Occasion</label>
            <Select
              value={activeFilters.occasion}
              onValueChange={value =>
                setActiveFilters({ ...activeFilters, occasion: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                {occasions.map(occasion => (
                  <SelectItem key={occasion} value={occasion}>
                    {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      {!searchQuery && (
        <Tabs
          defaultValue="all"
          value={activeCategory}
          onValueChange={setActiveCategory}
        >
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto py-2">
            {categories.map(category => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Clothing Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  overflow-y-auto flex-grow px-2 w-full">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
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
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.size} item
              {selectedItems.size !== 1 ? 's' : ''}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingItems}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSelectedItems(handleBulkDeleteSuccess)}
              disabled={deletingItems}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingItems
                ? 'Deleting...'
                : `Delete ${selectedItems.size} item${
                    selectedItems.size !== 1 ? 's' : ''
                  }`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WardrobeGrid;
