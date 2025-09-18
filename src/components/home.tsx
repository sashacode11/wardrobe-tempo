// home.tsx - Updated to use global context
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Menu,
  LogOut,
  User,
  ArrowLeft,
  Shirt,
  Headphones,
  HomeIcon,
  Package,
  Filter,
  X,
  Globe,
  ChevronDown,
  Check,
  Settings,
} from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SearchBar from './common/SearchBar';
import WardrobeGrid from './WardrobeGrid';
import ItemUploadForm from './ItemUploadForm';
import OutfitBuilder from './OutfitBuilder';
import AuthDialog from './AuthDialog';
import MyOutfits from './MyOutfits';
import { signOut, supabase } from '../lib/supabaseClient';
import { ClothingItemType } from '../types';
import { FilterConfig, useFilters } from '@/hooks/useFilters';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';
import FilterPanel from './common/FilterPanel';
import { capitalizeFirst } from '@/lib/utils';
import { useWardrobe } from '../contexts/WardrobeContext';
import UnifiedSearchResults from './SearchResults';
import OutfitRepairView from './OutfitRepairView';
import IncompleteOutfitsNotification from './IncompleteOutfitsNotification';
import LanguageSelector from './LanguageSelector';
import SettingsModal from './SettingsModal';

const Home = () => {
  const [activeTab, setActiveTab] = useState('wardrobe');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [wardrobeKey, setWardrobeKey] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedItemForOutfit, setSelectedItemForOutfit] = useState(null);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [editingItem, setEditingItem] = useState<ClothingItemType | null>(null);
  const [showRepairView, setShowRepairView] = useState(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  /* Global languages */
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Default to English

  const handleLanguageChange = language => {
    setCurrentLanguage(language);
    setShowLanguageMenu(false);
    // Add your language change logic here
    // e.g., i18n.changeLanguage(language);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest('.language-selector')) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 🔹 Use global context instead of local state
  const {
    wardrobeItems: items,
    outfits,
    user,
    itemsLoading: loadingItems,
    outfitsLoading,
    authLoading,
    error: globalError,
    searchQuery,
    setSearchQuery,
    clearSearch,
    searchResults,
    hasSearchResults,
    hasSearchQuery,
    checkUser,
    setUser,
    addItem,
    updateItem,
    refreshItems,
    refreshAll,
  } = useWardrobe();

  // Get wardrobe metadata (categories, colors, etc.)
  const {
    categories,
    colors,
    seasons,
    occasions,
    loading: metadataLoading,
  } = useWardrobeItems();

  // Category filter
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Define filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: 'color',
      label: 'Color',
      options: colors,
      placeholder: 'Select color',
    },
    {
      key: 'seasons',
      label: 'Season',
      options: seasons,
      placeholder: 'Select season',
    },
    {
      key: 'occasions',
      label: 'Occasion',
      options: occasions,
      placeholder: 'Select occasion',
    },
  ];

  // Handle Filters - now works with search results from global context
  const baseItems = useMemo(
    () => (hasSearchQuery ? searchResults : items),
    [hasSearchQuery, JSON.stringify(searchResults), JSON.stringify(items)]
  );
  const {
    activeFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterEntries,
    filteredItems,
  } = useFilters(baseItems, { filterConfigs });

  // Calculate active filter count
  const activeFilterCount =
    (activeCategory !== 'all' ? 1 : 0) +
    Object.values(activeFilters).filter(Boolean).length;

  // Filter by category
  const finalItems = useMemo(() => {
    let result = filteredItems;

    if (activeCategory !== 'all') {
      result = result.filter(
        item => item.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    return result;
  }, [filteredItems, activeCategory]);

  const handleItemSaved = () => {
    // Refresh data from global context
    refreshItems();
    setWardrobeKey(prev => prev + 1);
  };

  const handleAuthSuccess = () => {
    checkUser();
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const handleAddItemClick = () => {
    if (!user) {
      setShowAuthDialog(true);
    } else {
      setShowUploadForm(true);
      setEditingItem(null);
    }
  };

  const handleAddToOutfit = item => {
    setSelectedItemForOutfit(item);
    setActiveTab('outfit');
  };

  // Listen to auth changes (still needed for some auth events)
  useEffect(() => {
    const handleShowAuth = () => {
      setShowAuthDialog(true);
    };

    window.addEventListener('showAuth', handleShowAuth);

    return () => {
      window.removeEventListener('showAuth', handleShowAuth);
    };
  }, []);

  // Reset filters when switching to wardrobe tab (but keep search query persistent)
  useEffect(() => {
    if (activeTab === 'wardrobe') {
      setActiveCategory('all');
      clearAllFilters();
      // Note: We DON'T clear search query anymore - it stays persistent!
    }
  }, [activeTab]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-2xl font-bold">Welcome to Vesti</h2>
          <p className="text-gray-600">
            Organize your wardrobe, plan outfits, and style your life.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setShowAuthDialog(true)}>Login</Button>
            <Button variant="outline" onClick={() => setShowAuthDialog(true)}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 md:border-b bg-background pb-0 px-2 md:px-20 sm:pb-4 pt-4">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-600">Vesti</h1>

            {/* Desktop tabs */}
            {user && (
              <nav className="hidden md:flex bg-white/60 backdrop-blur-sm rounded-full p-1 border border-white/20">
                {[
                  { key: 'wardrobe', label: 'Wardrobe', icon: HomeIcon },
                  { key: 'outfit', label: 'Create Outfit', icon: Package },
                  { key: 'my-outfits', label: 'My Outfits', icon: Shirt },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`relative mx-6 py-2.5  text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === key
                        ? 'border-b-2 border-blue-600 px-0'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Mobile search */}
          {user && (
            <div className="md:hidden">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClear={clearSearch}
                placeholder="Search items..."
                size="sm"
              />
            </div>
          )}

          {/* Desktop right side bar */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="relative">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onClear={clearSearch}
                  placeholder="Search items and outfits..."
                  className="w-64"
                />
                {/* Search results indicator */}
                {hasSearchQuery && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow-lg z-10 p-2 text-xs text-gray-600">
                    <div>
                      {searchResults.length > 0
                        ? `Found ${searchResults.length} item${
                            searchResults.length === 1 ? '' : 's'
                          }`
                        : 'No items found'}
                    </div>
                  </div>
                )}
              </div>
            )}

            <LanguageSelector variant="desktop" />

            <button
              onClick={handleAddItemClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors duration-200 flex items-center gap-2"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button onClick={() => setShowAuthDialog(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Hamburger menu in mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile menu modal*/}
        {showMobileMenu && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            <div
              className={`
                fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l z-50 md:hidden
                transform transition-transform duration-300 ease-in-out
                ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}
              `}
            >
              <div className="flex flex-col h-full">
                <div className="py-4 px-2">
                  <div className="flex items-center justify-between border-b">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileMenu(false)}
                        className="p-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>

                      {user && (
                        <div className="p-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.user_metadata.full_name}
                              </p>
                              {/* <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p> */}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Settings Icon */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(true)}
                      className="p-2 ml-2"
                    >
                      <Settings className="h-6 w-6 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Settings Modal */}
                <SettingsModal
                  isOpen={showSettings}
                  onClose={() => setShowSettings(false)}
                />

                <div className="flex-1 p-4">
                  {user ? (
                    <div className="space-y-6">
                      <div>
                        {/* <h3 className="text-lg font-semibold text-foreground mb-4">
                          Shortcut
                        </h3> */}
                        <div className="grid grid-cols-4 gap-4">
                          <button
                            onClick={handleAddItemClick}
                            className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                              <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              Add Item
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('outfit');
                              setShowMobileMenu(false);
                            }}
                            className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                              <Package className="h-5 w-5" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              Create Outfit
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('my-outfits');
                              setShowMobileMenu(false);
                            }}
                            className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                              <Shirt className="h-5 w-5" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              My Outfits
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setShowMobileMenu(false);
                            }}
                            className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                              <Headphones className="h-5 w-5" />{' '}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              Customer Service
                            </span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Recommend
                        </h3>
                        <div className="text-sm text-muted-foreground italic text-center py-8">
                          Coming soon...
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setShowAuthDialog(true);
                          setShowMobileMenu(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setShowAuthDialog(true);
                          setShowMobileMenu(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>

                {user && (
                  <div className="p-4 border-t mt-auto">
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main content */}
      <main className="container mx-auto py-4 px-2 md:p-4 pb-20 md:pb-4">
        {authLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : !user ? (
          // Not logged in
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Welcome to My Wardrobe</h2>
              <p className="text-muted-foreground max-w-md">
                Organize your clothing collection, plan outfits, and keep track
                of your wardrobe. Sign up or log in to get started!
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowAuthDialog(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent value="wardrobe" className="mt-0">
              {hasSearchQuery ? (
                // Show unified search results when searching
                <UnifiedSearchResults
                  onAddItem={handleAddItemClick}
                  onEditItem={item => {
                    setEditingItem(item);
                    setShowUploadForm(true);
                  }}
                  onAddToOutfit={handleAddToOutfit}
                  onEditOutfit={outfit => {
                    const outfitWithItems = {
                      ...outfit,
                      items: Array.isArray(outfit.outfit_items)
                        ? outfit.outfit_items
                        : [],
                    };
                    setEditingOutfit(outfitWithItems);
                    setActiveTab('outfit');
                  }}
                  onCreateOutfit={() => setActiveTab('outfit')}
                />
              ) : (
                // Show normal wardrobe content when not searching
                <div className="space-y-4">
                  {/* Filter Button */}
                  {/* <button
                    onClick={() => setShowFilterModal(true)}
                    className={`hidden md:flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                      hasActiveFilters
                        ? 'text-blue-600'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative">
                      <Filter className="h-5 w-5 mb-1" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-4 bg-blue-600 text-white text-xs font-medium w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-background z-10">
                          {activeFilterCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium">Filter</span>
                  </button> */}

                  {/* Category Tabs */}
                  <Tabs
                    defaultValue="all"
                    value={activeCategory}
                    onValueChange={setActiveCategory}
                  >
                    <TabsList className="bg-transparent w-full overflow-x-auto flex-nowrap justify-start h-auto">
                      <TabsTrigger key="all" value="all" className="capitalize">
                        All
                      </TabsTrigger>

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

                  {/* Wardrobe Grid */}
                  <WardrobeGrid
                    key={wardrobeKey}
                    items={finalItems}
                    loading={loadingItems}
                    onAddItem={handleAddItemClick}
                    onAddToOutfit={handleAddToOutfit}
                    onEditItem={item => {
                      setEditingItem(item);
                      setShowUploadForm(true);
                    }}
                    activeFilters={activeFilters}
                    activeCategory={activeCategory}
                    onClearFilters={() => {
                      clearAllFilters();
                      setActiveCategory('all');
                    }}
                    onShowFilterModal={() => setShowFilterModal(true)}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-outfits" className="mt-0">
              {hasSearchQuery ? (
                // Show unified search results when searching
                <UnifiedSearchResults
                  onAddItem={handleAddItemClick}
                  onEditItem={item => {
                    setEditingItem(item);
                    setShowUploadForm(true);
                  }}
                  onAddToOutfit={handleAddToOutfit}
                  onEditOutfit={outfit => {
                    const outfitWithItems = {
                      ...outfit,
                      items: Array.isArray(outfit.outfit_items)
                        ? outfit.outfit_items
                        : [],
                    };
                    setEditingOutfit(outfitWithItems);
                    setActiveTab('outfit');
                  }}
                  onCreateOutfit={() => setActiveTab('outfit')}
                />
              ) : (
                // Show normal MyOutfits component when not searching
                <MyOutfits
                  onCreateOutfit={() => setActiveTab('outfit')}
                  onEditOutfit={outfit => {
                    const outfitWithItems = {
                      ...outfit,
                      items: Array.isArray(outfit.outfit_items)
                        ? outfit.outfit_items
                        : [],
                    };
                    setEditingOutfit(outfitWithItems);
                    setActiveTab('outfit');
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="outfit" className="mt-0">
              <OutfitBuilder
                selectedItem={selectedItemForOutfit}
                onItemAdded={() => setSelectedItemForOutfit(null)}
                onOutfitSaved={() => setActiveTab('my-outfits')}
                editingOutfit={editingOutfit}
                onEditComplete={() => setEditingOutfit(null)}
                onClose={() => {
                  setEditingOutfit(null);
                }}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Show repair view if active */}
        {showRepairView ? (
          <OutfitRepairView onClose={() => setShowRepairView(false)} />
        ) : (
          <>
            {/* Incomplete outfits notification - show on all tabs */}
            <IncompleteOutfitsNotification
              onFixOutfits={() => setShowRepairView(true)}
            />

            {/* Your existing tabs content */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* ... your existing TabsContent components ... */}
            </Tabs>
          </>
        )}

        {/* Filter Modal - Same as before */}
        {showFilterModal && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowFilterModal(false)}
            />
            <div
              className={`
    fixed top-0 left-0 h-[85vh]  md:h-full w-80 max-w-[85vw] bg-background border-r z-50
    transform transition-transform duration-300 ease-in-out
    ${showFilterModal ? 'translate-x-0' : '-translate-x-full'}
  `}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-2 pt-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <div className="flex items-center gap-5 cursor-pointer">
                    {hasActiveFilters ||
                    activeCategory !== 'all' ||
                    hasSearchQuery ? (
                      <div
                        className="hidden text-sm md:inline text-blue-600"
                        onClick={() => {
                          clearAllFilters();
                          setActiveCategory('all');
                        }}
                      >
                        Clear All
                      </div>
                    ) : null}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilterModal(false)}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                {/* Active Filter Badges */}
                {(hasActiveFilters || activeCategory !== 'all') && (
                  <div className="px-4 p-2 border-b">
                    <div className="flex flex-wrap gap-2">
                      {/* Category and Filter Badges */}
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
                            className="flex items-center justify-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1"
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
                              className="ml-1 w-4 h-4 flex items-center justify-center hover:bg-blue-200 text-lg"
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
                      hasActiveFilters ||
                      activeCategory !== 'all' ||
                      hasSearchQuery
                    }
                    showFilters={true}
                    onToggleFilters={() => {}}
                    inline={true}
                  />
                </div>

                {/* Footer */}
                <div className="p-2 border-t flex md:hidden flex-row justify-end gap-3">
                  {hasActiveFilters || activeCategory !== 'all' ? (
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
                  ) : null}
                  <Button
                    className="w-auto"
                    onClick={() => setShowFilterModal(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 z-50 shadow-lg">
        <div className="flex items-center justify-around px-1 py-1 pb-safe">
          {/* Home button */}
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-200 min-w-[60px] ${
              activeTab === 'wardrobe'
                ? 'text-blue-600 bg-blue-50 scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
          >
            <HomeIcon
              className={`h-5 w-5 mb-1 transition-transform ${
                activeTab === 'wardrobe' ? 'scale-110' : ''
              }`}
            />
            <span className="text-[10px] font-medium leading-tight">Home</span>
          </button>

          {/* Filter Button */}
          <button
            onClick={() => {
              if (activeTab === 'wardrobe') {
                setShowFilterModal(true);
              } else {
                setActiveTab('wardrobe');
                setTimeout(() => setShowFilterModal(true), 300);
              }
            }}
            className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-200 min-w-[60px] relative ${
              activeFilterCount > 0
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
          >
            <div className="relative">
              <Filter
                className={`h-5 w-5 mb-1 transition-transform ${
                  activeFilterCount > 0 ? 'scale-110' : ''
                }`}
              />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-tight">
              Filter
            </span>
          </button>

          {/* Add item button - Make it stand out */}
          <button
            onClick={handleAddItemClick}
            className="flex flex-col items-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[60px] text-white bg-gradient-to-t from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-95 shadow-lg"
            type="button"
          >
            <div className="bg-white/20 rounded-full p-1 mb-1">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-medium leading-tight">Add</span>
          </button>

          {/* Create outfit */}
          <button
            onClick={() => setActiveTab('outfit')}
            className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-200 min-w-[60px] ${
              activeTab === 'outfit'
                ? 'text-blue-600 bg-blue-50 scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
          >
            <Package
              className={`h-5 w-5 mb-1 transition-transform ${
                activeTab === 'outfit' ? 'scale-110' : ''
              }`}
            />
            <span className="text-[10px] font-medium leading-tight">
              Create
            </span>
          </button>

          {/* My outfits */}
          <button
            onClick={() => setActiveTab('my-outfits')}
            className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-200 min-w-[60px] ${
              activeTab === 'my-outfits'
                ? 'text-blue-600 bg-blue-50 scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
          >
            <Shirt
              className={`h-5 w-5 mb-1 transition-transform ${
                activeTab === 'my-outfits' ? 'scale-110' : ''
              }`}
            />
            <span className="text-[10px] font-medium leading-tight">
              Outfits
            </span>
          </button>
        </div>
      </div>

      {/* Upload Form Dialog */}
      <ItemUploadForm
        open={showUploadForm}
        onOpenChange={open => {
          setShowUploadForm(open);
        }}
        onSave={handleItemSaved}
        editingItem={editingItem}
      />

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Home;
