// 📁 components/FilterModal.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { capitalizeFirst } from '@/utils/helpers';
import FilterPanel from './common/FilterPanel';

interface FilterPanelContainerProps {
  // Filter state
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activeFilters: Record<string, any>;
  activeFilterEntries: { key: string; label: string; value: string }[];
  hasActiveFilters: boolean;
  hasSearchQuery: boolean;
  searchQuery: string;

  // Actions
  clearAllFilters: () => void;
  clearFilter: (key: string) => void;
  updateFilter: (key: string, value: any) => void;
  filterConfigs: any[];

  // UI mode
  isMobile?: boolean;
  onClose?: () => void;
}

const FilterPanelContainer: React.FC<FilterPanelContainerProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
  activeFilters,
  activeFilterEntries,
  hasActiveFilters,
  hasSearchQuery,
  searchQuery,
  clearAllFilters,
  clearFilter,
  updateFilter,
  filterConfigs,
  isMobile = false,
  onClose,
}) => {
  return (
    <div className="flex flex-col  h-[calc(100vh-180px)]  bg-card">
      {/* Header */}
      <div
        className={`p-2 ${
          isMobile ? 'pt-4' : ''
        } border-b flex items-center justify-between`}
      >
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="flex items-center gap-5 cursor-pointer">
          {(hasActiveFilters || activeCategory !== 'all' || hasSearchQuery) && (
            <div
              className="text-sm text-blue-600"
              onClick={() => {
                clearAllFilters();
                setActiveCategory('all');
              }}
            >
              Clear All
            </div>
          )}
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {(hasActiveFilters || activeCategory !== 'all') && (
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {(activeCategory !== 'all'
              ? [
                  {
                    key: 'category',
                    label: 'Category',
                    value: activeCategory,
                  },
                ]
              : []
            )
              .concat(activeFilterEntries)
              .map(entry => (
                <div
                  key={entry.key}
                  className="flex items-center justify-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  <span className="text-xs">
                    {capitalizeFirst(entry.value)}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (entry.key === 'category') {
                        setActiveCategory('all');
                      } else {
                        clearFilter(entry.key);
                      }
                    }}
                    className="ml-1 w-4 h-4 flex items-center justify-center hover:bg-blue-200 text-lg rounded-full"
                    aria-label={`Remove ${entry.label} filter`}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Category Filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Category</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors
                ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                }
              `}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors
                  ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Filters */}
        <FilterPanel
          filters={filterConfigs}
          activeFilters={activeFilters}
          onUpdateFilter={updateFilter}
          onClearFilter={clearFilter}
          onClearAllFilters={() => {
            clearAllFilters();
            setActiveCategory('all');
          }}
          activeFilterEntries={[
            ...(hasSearchQuery
              ? [
                  {
                    key: 'search',
                    label: 'Search',
                    value: searchQuery,
                  },
                ]
              : []),
            ...(activeCategory !== 'all'
              ? [
                  {
                    key: 'category',
                    label: 'Category',
                    value: activeCategory,
                  },
                ]
              : []),
            ...activeFilterEntries,
          ]}
          hasActiveFilters={
            hasActiveFilters || activeCategory !== 'all' || hasSearchQuery
          }
          showFilters={true}
          onToggleFilters={() => {}}
          inline={true}
        />
      </div>

      {/* Mobile Footer */}
      {isMobile && (
        <div className="p-2 border-t flex flex-row justify-end gap-3">
          {(hasActiveFilters || activeCategory !== 'all') && (
            <Button
              variant="outline"
              className="w-auto"
              onClick={() => {
                clearAllFilters();
                setActiveCategory('all');
              }}
            >
              Clear All
            </Button>
          )}
          <Button className="w-auto" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterPanelContainer;
