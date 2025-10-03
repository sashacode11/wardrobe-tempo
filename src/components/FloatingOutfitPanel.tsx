// FloatingOutfitPanel.tsx
import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Save,
  ChevronUp,
  Plus,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { OptimizedImage } from '../trash/OptimizedImage';

const FloatingOutfitPanel = ({
  currentOutfit,
  selectedItemsCount,
  handleRemoveItem,
  setSaveDialogOpen,
  setActiveCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // Get categories that have items
  const categoriesWithItems = Object.entries(currentOutfit).filter(
    ([category, items]) => items && items.length > 0
  );

  // Get all items flattened for mobile thumbnails
  const allSelectedItems = Object.values(currentOutfit).flat();

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <>
      {/* Desktop Version - Full Panel */}
      <div className="hidden lg:block bg-gray-100 dark:bg-gray-800 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20 order-2 xl:order-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Your Outfit
            </h2>
          </div>
          <Badge
            variant="secondary"
            className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
          >
            {selectedItemsCount} {selectedItemsCount === 1 ? 'item' : 'items'}
          </Badge>
        </div>

        {selectedItemsCount > 0 ? (
          <div className="space-y-4">
            {categoriesWithItems.map(([category, items]) => (
              <div key={category} className="space-y-2">
                {/* Category Header */}
                <div
                  className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-white/40 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {category}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        setActiveCategory(category);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 px-2 py-1 h-6"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                    {expandedCategories[category] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Category Items */}
                {(expandedCategories[category] || items.length === 1) && (
                  <div className="space-y-2 ml-4">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-700/60 rounded-xl border border-slate-200/40 dark:border-gray-600/40 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 group"
                      >
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg shadow-sm"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate text-sm">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.color && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-white/80 dark:bg-gray-800/80"
                              >
                                {item.color}
                              </Badge>
                            )}
                            {Array.isArray(item.tags) &&
                              item.tags.slice(0, 2).map(tag => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          onClick={() => handleRemoveItem(category, item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Collapsed view for multiple items */}
                {!expandedCategories[category] && items.length > 1 && (
                  <div className="ml-4 flex -space-x-2">
                    {items.slice(0, 3).map((item, index) => (
                      <div
                        key={item.id}
                        className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm"
                        style={{ zIndex: 10 - index }}
                      >
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="relative w-10 h-10 rounded-lg bg-muted border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          +{items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gradient-to-br from-slate-100 dark:from-gray-700 to-slate-200 dark:to-gray-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Start Building Your Outfit
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select items from your wardrobe to create the perfect look
            </p>
          </div>
        )}

        {selectedItemsCount > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 dark:from-blue-950 to-purple-50 dark:to-purple-950 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Outfit Ready!
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => setSaveDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs px-3 py-1 h-8"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Your outfit looks great! Save it to your collection.
            </p>
          </div>
        )}
      </div>

      {/* Mobile Version - Floating Badge */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 z-50">
        {/* Floating Badge/Button */}
        {!isExpanded && (
          <div
            className="bg-gray-100 dark:bg-gray-800 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 dark:border-gray-700/20 cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => setIsExpanded(true)}
          >
            {/* Header Row */}
            <div className="flex flex-row justify-between items-center">
              <div className="flex items-center gap-1">
                <h3 className="text-foreground font-semibold text-sm">
                  Your Outfit
                </h3>
                {selectedItemsCount > 0 && (
                  <span className="text-muted-foreground text-xs flex items-center">
                    ({selectedItemsCount}{' '}
                    {selectedItemsCount === 1 ? 'item' : 'items'} )
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 px-4">
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Content Row */}
            {selectedItemsCount > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  {/* Images on the left */}
                  <div className="flex -space-x-1">
                    {allSelectedItems
                      .slice(0, 4) // Show max 4 items
                      .map((item, index) => (
                        <div
                          key={item.id}
                          className="relative w-9 h-9 rounded-lg overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm"
                          style={{ zIndex: 10 - index }}
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    {/* Show "more items" indicator if there are more than 4 */}
                    {selectedItemsCount > 4 && (
                      <div
                        className="relative w-9 h-9 rounded-lg bg-muted border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center"
                        style={{ zIndex: 5 }}
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          +{selectedItemsCount - 4}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Save button on the right */}
                  <Button
                    size="sm"
                    onClick={e => {
                      e.stopPropagation(); // Prevent expanding the panel
                      setSaveDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs px-3 py-1.5 h-8"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </>
            ) : (
              // When empty - show build outfit message
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    Select items from your wardrobe to build your outfit
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expanded Panel for Mobile */}
        {isExpanded && (
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200/40 dark:border-gray-700/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Your Outfit
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                >
                  {selectedItemsCount}{' '}
                  {selectedItemsCount === 1 ? 'item' : 'items'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedItemsCount > 0 ? (
                <div className="space-y-4">
                  {categoriesWithItems.map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      {/* Category Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            {category}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {items.length}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveCategory(category)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 px-2 py-1 h-6"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>

                      {/* Category Items */}
                      <div className="space-y-2">
                        {items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-700/60 rounded-xl border border-slate-200/40 dark:border-gray-600/40"
                          >
                            <div className="relative w-10 h-10 flex-shrink-0">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg shadow-sm"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground truncate text-sm">
                                {item.name}
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-500 dark:hover:text-red-400"
                              onClick={() =>
                                handleRemoveItem(category, item.id)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-3 bg-gradient-to-br from-slate-100 dark:from-gray-700 to-slate-200 dark:to-gray-600 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium text-muted-foreground mb-2">
                    Start Building Your Outfit
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select items from your wardrobe to create the perfect look
                  </p>
                </div>
              )}
            </div>

            {/* Save Button */}
            {selectedItemsCount > 0 && (
              <div className="p-4 border-t border-slate-200/40 dark:border-gray-700/40">
                <Button
                  onClick={() => setSaveDialogOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Outfit
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// Badge component with dark mode support
const Badge = ({ children, variant, className }) => {
  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = {
    secondary: 'bg-muted text-muted-foreground',
    outline: 'border border-border bg-transparent text-foreground',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Button component with dark mode support
const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-muted hover:text-muted-foreground',
    outline:
      'border border-border bg-transparent hover:bg-muted hover:text-muted-foreground',
  };

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-sm',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default FloatingOutfitPanel;
