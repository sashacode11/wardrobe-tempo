// WardrobeGrid.tsx - Updated to work with FlexSearch
import React from 'react';
import { Plus } from 'lucide-react';
import { ClothingItemType } from '../types';

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {items.map(item => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
        >
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

            {/* Hover overlay */}
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
      ))}
    </div>
  );
};

export default WardrobeGrid;
