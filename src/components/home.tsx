import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Grid,
  Menu,
  LogOut,
  User,
  ArrowLeft,
  Shirt,
  Grid3x3,
  Headphones,
  Heart,
  HomeIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Dialog, DialogTrigger } from './ui/dialog';
import WardrobeGrid from './WardrobeGrid';
import ItemUploadForm from './ItemUploadForm';
import OutfitBuilder from './OutfitBuilder';
import AuthDialog from './AuthDialog';
import MyOutfits from './MyOutfits';
import { getCurrentUser, signOut, supabase } from '../lib/supabaseClient';
import { ClothingItemType } from '../types';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('wardrobe');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [wardrobeKey, setWardrobeKey] = useState(0);
  const [user, setUser] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedItemForOutfit, setSelectedItemForOutfit] = useState(null);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [editingItem, setEditingItem] = useState<ClothingItemType | null>(null);

  const handleItemSaved = () => {
    // Refresh the wardrobe grid by changing its key
    setWardrobeKey(prev => prev + 1);
  };

  const handleAuthSuccess = () => {
    checkUser();
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const checkUser = async () => {
    setAuthLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setAuthLoading(false);
  };

  const handleAddItemClick = () => {
    if (!user) {
      setShowAuthDialog(true);
    } else {
      setShowUploadForm(true);
      setEditingItem(null); // Reset editing item when opening form
    }
  };

  const handleAddToOutfit = item => {
    setSelectedItemForOutfit(item);
    setActiveTab('outfit');
  };

  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Listen for custom auth events from ItemUploadForm
    const handleShowAuth = () => {
      setShowAuthDialog(true);
    };

    window.addEventListener('showAuth', handleShowAuth);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('showAuth', handleShowAuth);
    };
  }, []);

  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);

  // Mock categories for demonstration
  // const categories = [
  //   { id: 'all', name: 'All Items' },
  //   { id: 'tops', name: 'Tops' },
  //   { id: 'bottoms', name: 'Bottoms' },
  //   { id: 'shoes', name: 'Shoes' },
  //   { id: 'accessories', name: 'Accessories' },
  //   { id: 'outerwear', name: 'Outerwear' },
  // ];

  // console.log(user);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 md:border-b bg-background pb-0 pt-2 pl-4 pr-4 sm:pb-4 sm:pt-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="md:text-2xl font-bold">My Wardrobe</h1>

          <div className="hidden md:flex items-center space-x-4">
            {/* {user && (
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            )} */}

            {user && (
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-2">
                {/* <Button onClick={handleAddItemClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button> */}
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

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* show search outside of hamburger menu in mobile */}
        {user && (
          <div className="md:hidden relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        )}

        {/* Mobile menu */}
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Sliding menu */}
            <div
              className={`
      fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l z-50 md:hidden
      transform transition-transform duration-300 ease-in-out
      ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}
    `}
            >
              {/* Menu content container */}
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="py-4 px-2 ">
                  <div className="flex items-center justify-between border-b">
                    {/* <h2 className="text-lg font-semibold">Menu</h2> */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMobileMenu(false)}
                      className="p-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>

                    {/* User Account Section */}
                    {user && (
                      <div className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {user.user_metadata.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Add your contact functionality here
                        console.log('Contact clicked');
                        setShowMobileMenu(false);
                      }}
                      className="p-2 ml-2"
                    >
                      <Headphones className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Main menu items */}
                <div className="flex-1 p-4">
                  {user ? (
                    <div className="space-y-6">
                      {/* First row - Shortcuts */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Shortcut
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                          <button
                            onClick={handleAddItemClick}
                            className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                              <Plus className="h-5 w-5 text-blue-400" />
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
                              <Shirt className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              Create Outfit
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('myoutfits');
                              setShowMobileMenu(false);
                            }}
                            className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                              <Grid3x3 className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              My Outfits
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Second row - Recommendations */}
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

                {/* Bottom section - Sign Out */}
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
      <main className="container mx-auto md:p-4 pb-20 md:pb-4">
        {' '}
        {authLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : !user ? (
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
            {/* Desktop Tabs - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-between lg:mb-6">
              <TabsList>
                <TabsTrigger value="wardrobe" className="px-4">
                  <Grid className="mr-2 h-4 w-4" />
                  Wardrobe
                </TabsTrigger>
                <TabsTrigger value="outfit" className="px-4">
                  Create Outfit
                </TabsTrigger>
                <TabsTrigger value="my-outfits" className="px-4">
                  My Outfits
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <TabsContent value="wardrobe">
              {/* Your wardrobe content */}
            </TabsContent>
            <TabsContent value="outfit">
              {/* Your create outfit content */}
            </TabsContent>
            <TabsContent value="my-outfits">
              {/* Your my outfits content */}
            </TabsContent>

            {/* Category filters */}
            {/* <div className="mb-6 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {activeTab === 'wardrobe' &&
                  categories.map(category => (
                    <Button
                      key={category.id}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {category.name}
                    </Button>
                  ))}
              </div>
            </div> */}

            <TabsContent value="wardrobe" className="mt-0">
              <WardrobeGrid
                key={wardrobeKey}
                searchQuery={searchQuery}
                onAddItem={handleAddItemClick}
                onAddToOutfit={handleAddToOutfit}
                onEditItem={item => {
                  setEditingItem(item);
                  setShowUploadForm(true);
                }}
              />
            </TabsContent>

            <TabsContent value="outfit" className="mt-0">
              <OutfitBuilder
                selectedItem={selectedItemForOutfit}
                onItemAdded={() => setSelectedItemForOutfit(null)}
                onOutfitSaved={() => setActiveTab('my-outfits')}
                editingOutfit={editingOutfit}
                onEditComplete={() => setEditingOutfit(null)}
                onClose={() => {
                  setShowOutfitBuilder(false);
                  setEditingOutfit(null);
                }}
              />
            </TabsContent>

            <TabsContent value="my-outfits" className="mt-0">
              <MyOutfits
                onCreateOutfit={() => setActiveTab('outfit')}
                onEditOutfit={outfit => {
                  // ✅ Patch missing items
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
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Mobile Bottom Ho - Fixed at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex items-center justify-around py-2 px-4">
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'wardrobe'
                ? 'text-blue-600 '
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <HomeIcon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('outfit')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'outfit'
                ? 'text-blue-600 '
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Plus className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Create</span>
          </button>

          <button
            onClick={() => setActiveTab('my-outfits')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'my-outfits'
                ? 'text-blue-600 '
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Shirt className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">My Outfits</span>
          </button>
        </div>
      </div>

      {/* Upload Form Dialog */}
      <ItemUploadForm
        open={showUploadForm}
        // onOpenChange={setShowUploadForm}
        onOpenChange={open => {
          setShowUploadForm(open);
          // if (!open) {
          //   setEditingItem(null);
          // }
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
