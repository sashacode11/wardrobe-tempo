// components/SearchResults.tsx
import React from 'react';
import { Search, Plus, Package, Shirt } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useWardrobe } from '../contexts/WardrobeContext';
import { ClothingItemType, OutfitWithItems } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface UnifiedSearchResultsProps {
  onAddItem: () => void;
  onEditItem: (item: ClothingItemType) => void;
  onAddToOutfit: (item: ClothingItemType) => void;
  onEditOutfit: (outfit: OutfitWithItems) => void;
  onCreateOutfit: () => void;
}

const UnifiedSearchResults: React.FC<UnifiedSearchResultsProps> = ({
  onAddItem,
  onEditItem,
  onAddToOutfit,
  onEditOutfit,
  onCreateOutfit,
}) => {
  const { searchQuery, clearSearch, searchResults, outfitSearchResults } =
    useWardrobe();

  const totalResults = searchResults.length + outfitSearchResults.length;

  if (totalResults === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No results found</h3>
          <p className="text-muted-foreground">
            No items or outfits match "{searchQuery}". Try different keywords or
            add new items.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={clearSearch} variant="outline">
              Clear Search
            </Button>
            <Button onClick={onAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-blue-800">
            Found <strong>{totalResults}</strong> result
            {totalResults !== 1 ? 's' : ''} for "{searchQuery}"
          </span>
        </div>
        <Button
          onClick={clearSearch}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
        >
          Clear
        </Button>
      </div>

      {/* Wardrobe Items */}
      {searchResults.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 px-4">
            <Package className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">
              Items ({searchResults.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {searchResults.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square relative overflow-hidden bg-gray-50">
                  {item.image_url ? (
                    <OptimizedImage
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
        </div>
      )}

      {/* Outfits */}
      {outfitSearchResults.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 px-4">
            <Shirt className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">
              Outfits ({outfitSearchResults.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {outfitSearchResults.map(outfit => (
              <div
                key={outfit.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {outfit.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {outfit.items?.length || 0} item
                        {outfit.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditOutfit(outfit)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Outfit items preview */}
                  {outfit.items && outfit.items.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {outfit.items.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gray-50 rounded overflow-hidden"
                        >
                          {item.image_url ? (
                            <OptimizedImage
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No items in outfit
                    </div>
                  )}

                  {/* Occasions */}
                  {outfit.occasions && outfit.occasions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {outfit.occasions.slice(0, 2).map((occasion, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {occasion}
                        </Badge>
                      ))}
                      {outfit.occasions.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{outfit.occasions.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchResults;
