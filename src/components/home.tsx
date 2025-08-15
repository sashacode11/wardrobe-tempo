import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Grid, Menu, LogOut, User } from 'lucide-react';
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

  // Mock categories for demonstration
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'tops', name: 'Tops' },
    { id: 'bottoms', name: 'Bottoms' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'outerwear', name: 'Outerwear' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Wardrobe</h1>

          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-2">
                <Button onClick={handleAddItemClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
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

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden p-4 border-t">
            <div className="flex flex-col space-y-4">
              {user && (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              )}

              {user ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Button className="flex-1" onClick={handleAddItemClick}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setActiveTab('outfit')}
                    >
                      Create Outfit
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={() => setShowAuthDialog(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAuthDialog(true)}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4">
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
            <div className="flex items-center justify-between mb-6">
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

              <Button variant="outline" size="sm" className="hidden md:flex">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Category filters */}
            <div className="mb-6 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {categories.map(category => (
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
            </div>

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
