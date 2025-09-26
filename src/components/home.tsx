// home.tsx - Updated with desktop filter panel layout
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
  Moon,
  Sun,
  Camera,
  Edit3,
  Search,
  Square,
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
import { capitalizeFirst } from '@/utils/helpers';
import { useWardrobe } from '../contexts/WardrobeContext';
import UnifiedSearchResults from './SearchResults';
import OutfitRepairView from './OutfitRepairView';
import IncompleteOutfitsNotification from './IncompleteOutfitsNotification';
import LanguageSelector from './LanguageSelector';
import SettingsModal from './settings/SettingsModal';
import MobileMenu from './MobileMenu';
import { CategoryTabs } from './CategoryTabs';
import { useMultiselect } from '@/hooks/useMultiSelect';
import SelectionControls from './common/SelectionControls';
import { DarkModeProvider, useDarkMode } from '@/contexts/DarkModeContext';
import FilterModal from './FilterModal';

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
  const [setCurrentView, setShowLanguageMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Default to English
  // const [isDarkMode, setIsDarkMode] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Add this effect to check current theme
  // useEffect(() => {
  //   const isDark = document.documentElement.classList.contains('dark');
  //   setIsDarkMode(isDark);
  // }, []);

  // Add this handler function
  // const handleThemeChange = () => {
  //   const newDarkMode = !isDarkMode;
  //   setIsDarkMode(newDarkMode);

  //   if (newDarkMode) {
  //     document.documentElement.classList.add('dark');
  //     localStorage.setItem('theme', 'dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //     localStorage.setItem('theme', 'light');
  //   }
  // };

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
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    toggleSelectionMode,
    selectAllItems,
    deselectAllItems,
    setShowDeleteDialog,
    isSelectionMode,
    selectedItems,
  } = useMultiselect();

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
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 md:border-b bg-background pb-1 px-2 md:px-4 sm:pb-4 pt-4">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-600">Vesti</h1>

            {/* Desktop tabs */}
            {user && (
              <nav className="hidden md:flex backdrop-blur-sm rounded-full p-1">
                {[
                  { key: 'wardrobe', label: 'Wardrobe', icon: HomeIcon },
                  { key: 'outfit', label: 'Create Outfit', icon: Package },
                  { key: 'my-outfits', label: 'My Outfits', icon: Shirt },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`relative mx-3 py-2.5 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === key
                        ? 'border-b-2 border-blue-600 px-0'
                        : 'text-muted-foreground hover:text-blue-600'
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
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
            {user && (
              <div className="relative">
                {/* Full search bar for screens >= 1300px */}
                <div className="hidden min-[1300px]:block">
                  <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onClear={clearSearch}
                    placeholder="Search items and outfits..."
                    className="w-64"
                  />
                  {/* Search results indicator */}
                  {hasSearchQuery && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow-md z-10 p-2 text-xs text-gray-600">
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

                {/* Search icon only for screens < 1300px */}
                <div className="min-[1300px]:hidden">
                  {!searchExpanded ? (
                    <button
                      onClick={() => setSearchExpanded(true)}
                      className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-muted/50 rounded-md transition-colors duration-200"
                      type="button"
                      aria-label="Open search"
                    >
                      <Search className="h-4.5 w-4.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <SearchBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onClear={clearSearch}
                        placeholder="Search..."
                        className="w-48"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setSearchExpanded(false);
                          setSearchQuery('');
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-500 rounded-md transition-colors duration-200"
                        type="button"
                        aria-label="Close search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Item Button — Styled to be subtle and aligned */}
            <button
              onClick={handleAddItemClick}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap"
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Item</span>
            </button>

            {/* Sign Out / Login Buttons — Clean and compact */}
            {user ? (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-xs sm:text-sm h-auto flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setShowAuthDialog(true)}
                  className="px-3 py-1.5 text-xs sm:text-sm h-auto flex items-center gap-1.5"
                >
                  <User className="h-3.5 w-3.5" />
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAuthDialog(true)}
                  className="px-3 py-1.5 text-xs sm:text-sm h-auto flex items-center gap-1.5"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Language + Theme Toggle - Responsive */}
            <div className="relative flex items-center">
              {/* Show full controls on large screens (>= 1100px) */}
              <div className="hidden min-[1100px]:flex items-center gap-2">
                <LanguageSelector />
                {/* dark mode */}
                <button
                  onClick={toggleDarkMode}
                  className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-muted/50 rounded-md transition-colors duration-200 flex items-center"
                  type="button"
                  aria-label={
                    isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
                  }
                >
                  {isDarkMode ? (
                    <Sun className="h-4.5 w-4.5" />
                  ) : (
                    <Moon className="h-4.5 w-4.5" />
                  )}
                </button>
                {/* <button
                  onClick={handleThemeChange}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-background rounded-md transition-colors duration-200 flex items-center"
                  type="button"
                  aria-label={
                    isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
                  }
                >
                  {isDarkMode ? (
                    <Moon className="h-4.5 w-4.5" />
                  ) : (
                    <Sun className="h-4.5 w-4.5" />
                  )}
                </button> */}
                {/* <DarkModeProvider /> */}
                {/* Settings Icon for Desktop */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-background rounded-md transition-colors duration-200 flex items-center"
                  type="button"
                >
                  <Settings className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Show dropdown toggle on small screens (< 1100px) */}
              <div className="min-[1100px]:hidden">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-background rounded-md transition-colors duration-200"
                  type="button"
                  aria-label="Toggle settings menu"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-2 z-20">
                    <div className="px-4 py-1 border-b border-border hover:bg-background/40">
                      <LanguageSelector />
                    </div>
                    <button
                      onClick={() => {
                        // handleThemeChange();
                        toggleDarkMode();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-muted-foreground hover:text-blue-600 hover:bg-muted/50 text-sm flex items-center gap-2"
                      type="button"
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="h-4 w-4" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                    {/* Settings Icon for Desktop — Styled consistently */}
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-full px-4 py-2 text-left text-muted-foreground hover:text-blue-600 text-sm flex items-center gap-2 hover:bg-background/40"
                      type="button"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
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
        <MobileMenu
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          user={user}
          setShowSettings={setShowSettings}
          setCurrentView={setCurrentView}
          handleAddItemClick={handleAddItemClick}
          setActiveTab={setActiveTab}
          setShowAuthDialog={setShowAuthDialog}
          handleSignOut={handleSignOut}
        />
      </header>

      {/* Main content */}
      <div className="px-2 md:px-4">
        <div className="mx-auto py-0 sm:px-20 pb-20 md:pb-4">
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
                  Organize your clothing collection, plan outfits, and keep
                  track of your wardrobe. Sign up or log in to get started!
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
            <div className="flex gap-4">
              {/* Desktop Filter Panel - Left Side keep existing */}
              <div className="hidden md:block w-60 flex-shrink-0">
                {(activeTab === 'wardrobe' || activeTab === 'my-outfits') && (
                  <FilterModal
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    activeFilters={activeFilters}
                    activeFilterEntries={activeFilterEntries}
                    hasActiveFilters={hasActiveFilters}
                    hasSearchQuery={hasSearchQuery}
                    searchQuery={searchQuery}
                    clearAllFilters={clearAllFilters}
                    clearFilter={clearFilter}
                    updateFilter={updateFilter}
                    filterConfigs={filterConfigs}
                    isMobile={false}
                  />
                )}
              </div>

              {/* Main Content Area - Right Side */}
              <div
                className={`min-w-0 ${
                  activeTab === 'wardrobe' || activeTab === 'my-outfits'
                    ? 'flex-1' // Take remaining space when filter is shown
                    : 'w-full max-w-6xl' // Full width with max constraint when centered
                }`}
              >
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
                        <div className="flex flex-col sm:w-fit">
                          {/* Category Tabs*/}
                          <CategoryTabs
                            categories={categories}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                          />

                          {/* count items and multiselect */}
                          <div className="flex items-center px-2 gap-4 test-xs sm:test-sm justify-between bg-card sm:justify-normal">
                            {/* Item Count */}
                            <div className="text-sm sm:block text-muted-foreground text-center">
                              {items.length} item
                              {items.length !== 1 ? 's' : ''}
                            </div>

                            {/*Bulk Delete Button */}
                            <SelectionControls
                              isSelectionMode={isSelectionMode}
                              selectedCount={selectedItems.size}
                              totalFilteredCount={items.length}
                              onToggleSelectionMode={toggleSelectionMode}
                              onSelectAll={() => selectAllItems(items)}
                              onDeselectAll={deselectAllItems}
                              onDeleteSelected={() => setShowDeleteDialog(true)}
                              selectItemsText="Bulk Delete"
                            />
                          </div>
                        </div>

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
              </div>
            </div>
          )}

          {/* Settings Modal */}
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />

          {/* Mobile Filter Modal */}
          {showFilterModal && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setShowFilterModal(false)}
              />
              <div
                className={`
        fixed top-0 left-0 min-h-full w-80 max-w-[85vw] bg-background border-r z-50
        transform transition-transform duration-300 ease-in-out md:hidden
        ${showFilterModal ? 'translate-x-0' : '-translate-x-full'}
      `}
              >
                <FilterModal
                  categories={categories}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  activeFilters={activeFilters}
                  activeFilterEntries={activeFilterEntries}
                  hasActiveFilters={hasActiveFilters}
                  hasSearchQuery={hasSearchQuery}
                  searchQuery={searchQuery}
                  clearAllFilters={clearAllFilters}
                  clearFilter={clearFilter}
                  updateFilter={updateFilter}
                  filterConfigs={filterConfigs}
                  isMobile={true}
                  onClose={() => setShowFilterModal(false)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 shadow-lg">
        <div className="flex items-center justify-around px-1 py-1 pb-safe">
          {/* Home button */}
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-200 min-w-[60px] ${
              activeTab === 'wardrobe'
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95'
            }`}
          >
            <HomeIcon
              className={`h-5 w-5 mb-1 transition-transform ${
                activeTab === 'wardrobe' ? 'scale-110' : ''
              }`}
            />
            <span className="text-[10px] font-medium leading-tight">Home</span>
          </button>

          {/* Filter Button - Only show on mobile */}
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
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95'
            }`}
          >
            <div className="relative">
              <Filter
                className={`h-5 w-5 mb-1 transition-transform ${
                  activeFilterCount > 0 ? 'scale-110' : ''
                }`}
              />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-background shadow-sm">
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
            className="flex flex-col items-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[60px] text-white bg-gradient-to-t from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-600 dark:to-blue-500 dark:hover:from-blue-700 dark:hover:to-blue-600 active:scale-95 shadow-lg"
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
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95'
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
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95'
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
