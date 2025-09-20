// components/common/SearchSuggestions.tsx
import React, { useMemo } from 'react';
import { Search, Tag, Palette, Calendar, Star } from 'lucide-react';
import { ClothingItemType } from '../../types';

interface SearchSuggestionsProps {
  items: ClothingItemType[];
  onSuggestionClick: (suggestion: string) => void;
  currentQuery: string;
  isVisible: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  items,
  onSuggestionClick,
  currentQuery,
  isVisible,
}) => {
  const suggestions = useMemo(() => {
    if (!items.length || currentQuery.length > 0) return [];

    // Extract unique values for suggestions
    const categories = [
      ...new Set(items.map(item => item.category).filter(Boolean)),
    ];
    const colors = [...new Set(items.map(item => item.color).filter(Boolean))];
    const brands = [...new Set(items.map(item => item.brand).filter(Boolean))];
    const seasons = [...new Set(items.flatMap(item => item.seasons || []))];

    return [
      ...categories
        .slice(0, 3)
        .map(cat => ({ type: 'category', value: cat, icon: Tag })),
      ...colors
        .slice(0, 3)
        .map(color => ({ type: 'color', value: color, icon: Palette })),
      ...brands
        .slice(0, 2)
        .map(brand => ({ type: 'brand', value: brand, icon: Star })),
      ...seasons
        .slice(0, 2)
        .map(season => ({ type: 'season', value: season, icon: Calendar })),
    ].slice(0, 8); // Limit to 8 suggestions
  }, [items, currentQuery]);

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow-lg z-20 max-h-60 overflow-y-auto">
      <div className="p-2">
        <div className="text-xs text-gray-500 mb-2 px-2">Quick search</div>
        {suggestions.map(({ type, value, icon: Icon }, index) => (
          <button
            key={`${type}-${value}`}
            onClick={() => onSuggestionClick(value)}
            className="w-full flex items-center gap-3 px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors text-left"
          >
            <Icon className="h-4 w-4 text-gray-400" />
            <div>
              <span className="text-gray-900">{value}</span>
              <span className="text-gray-500 ml-2 text-xs capitalize">
                ({type})
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchSuggestions;
