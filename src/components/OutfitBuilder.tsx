import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  X,
  ArrowLeft,
  Palette,
  Save,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  getCurrentUser,
  getClothingItems,
  createOutfit,
  supabase,
} from '../lib/supabaseClient';
// import { Database } from '../types/supabase';
import { ClothingItemType, OutfitBuilderProps, OutfitItem } from '@/types';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';
import { useFilters } from '@/hooks/useFilters';
import FloatingOutfitPanel from './FloatingOutfitPanel';
import { toast } from 'sonner';
import { OptimizedImage } from './OptimizedImage';
import { CategoryTabs } from './CategoryTabs';
import { CategoryContent } from './CategoryContent';
// import { categories } from '@/lib/data';

const OutfitBuilder = ({
  onClose,
  selectedItem,
  onItemAdded,
  onOutfitSaved,
  editingOutfit,
  onEditComplete,
}: OutfitBuilderProps) => {
  const { wardrobeItems, setWardrobeItems, categories } = useWardrobeItems();

  const [loading, setLoading] = useState(true);

  // ✅ NEW: Changed to store arrays of items per category
  const [currentOutfit, setCurrentOutfit] = useState<
    Record<string, ClothingItemType[]>
  >(() => {
    const initialOutfit: Record<string, ClothingItemType[]> = {};
    categories.forEach(category => {
      initialOutfit[category] = [];
    });
    return initialOutfit;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [outfitName, setOutfitName] = useState('');
  const [occasions, setOccasions] = useState<string[]>([]);
  const [occasionInput, setOccasionInput] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load wardrobe items from Supabase
  useEffect(() => {
    loadWardrobeItems();
  }, []);

  // Add selected item to outfit when it changes
  useEffect(() => {
    if (selectedItem) {
      handleAddItem(selectedItem);
      if (onItemAdded) {
        onItemAdded();
      }
    }
  }, [selectedItem]);

  useEffect(() => {
    // Initialize outfit structure when categories are loaded
    if (categories.length > 0) {
      setCurrentOutfit(prev => {
        const newOutfit: Record<string, ClothingItemType[]> = {};
        categories.forEach(category => {
          newOutfit[category] = prev[category] || [];
        });
        return newOutfit;
      });
    }
  }, [categories]);

  useEffect(() => {
    if (!editingOutfit) {
      // Reset form
      setOutfitName('');
      setOccasions([]);
      const emptyOutfit: Record<string, ClothingItemType[]> = {};
      categories.forEach(category => {
        emptyOutfit[category] = [];
      });
      setCurrentOutfit(emptyOutfit);
      return;
    }

    // Load basic fields
    setOutfitName(editingOutfit.name || 'Unnamed Outfit');
    setOccasions(
      Array.isArray(editingOutfit.occasions) ? editingOutfit.occasions : []
    );

    const outfitItems = editingOutfit.outfit_items;

    if (!Array.isArray(outfitItems)) {
      const emptyOutfit: Record<string, ClothingItemType[]> = {};
      categories.forEach(category => {
        emptyOutfit[category] = [];
      });
      setCurrentOutfit(emptyOutfit);
      return;
    }

    // ✅ Fixed: Group items by category and allow multiple items per category
    const groupedOutfit: Record<string, ClothingItemType[]> = {};
    categories.forEach(category => {
      groupedOutfit[category] = [];
    });

    outfitItems.forEach(outfitItem => {
      if (outfitItem.wardrobe_items && outfitItem.wardrobe_items.category) {
        const category = outfitItem.wardrobe_items.category.toLowerCase();
        if (groupedOutfit[category]) {
          groupedOutfit[category].push(outfitItem.wardrobe_items);
        }
      }
    });

    setCurrentOutfit(groupedOutfit);
  }, [editingOutfit, categories]);

  const loadWardrobeItems = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await getClothingItems(user.id);
      if (error) {
        console.error('Error loading wardrobe items:', error);
      } else {
        setWardrobeItems(data || []);
      }
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: ClothingItemType) => {
    setCurrentOutfit(prev => {
      const category = item.category?.toLowerCase();
      if (!category || !prev[category]) return prev;

      // Check if item is already in this category
      const isAlreadyAdded = prev[category].some(
        existingItem => existingItem.id === item.id
      );
      if (isAlreadyAdded) {
        // toast.info('Item removed from your outfit');

        return {
          ...prev,
          [category]: prev[category].filter(
            existingItem => existingItem.id !== item.id
          ),
        };
      }

      // toast.info('Item added to your outfit');
      return {
        ...prev,
        [category]: [...prev[category], item],
      };
    });
  };

  const handleRemoveItem = (category: string, itemId: string) => {
    setCurrentOutfit(prev => ({
      ...prev,
      [category]: prev[category]?.filter(item => item.id !== itemId) || [],
    }));
  };

  const handleAddOccasion = () => {
    if (occasionInput && !occasions.includes(occasionInput)) {
      setOccasions([...occasions, occasionInput]);
      setOccasionInput('');
    }
  };

  const handleRemoveOccasion = (occasion: string) => {
    setOccasions(occasions.filter(o => o !== occasion));
  };

  const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      toast.error('Please enter an outfit name');
      return;
    }

    // Check if any items are selected
    const allSelectedItems = Object.values(currentOutfit).flat();
    if (allSelectedItems.length === 0) {
      toast.error('Please add at least one item to your outfit');
      return;
    }

    if (occasionInput.trim()) {
      toast.warning('Please press Enter or click Add to include the occasion.');
      return;
    }

    try {
      setSaving(true);

      const user = await getCurrentUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      const isEditing = !!editingOutfit;
      if (isEditing) {
        // Update the outfit basic info
        const { error: outfitError } = await supabase
          .from('outfits')
          .update({
            name: outfitName.trim(),
            occasions: occasions,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingOutfit.id);

        if (outfitError) {
          console.error('Error updating outfit:', outfitError);
          throw outfitError;
        }

        // Delete existing outfit_items
        const { error: deleteError } = await supabase
          .from('outfit_items')
          .delete()
          .eq('outfit_id', editingOutfit.id);

        if (deleteError) {
          console.error('Error deleting old outfit items:', deleteError);
          throw deleteError;
        }

        // Insert new outfit_items (all selected items)
        const outfitItemsToInsert = allSelectedItems.map(item => ({
          outfit_id: editingOutfit.id,
          clothing_item_id: item.id,
          created_at: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from('outfit_items')
          .insert(outfitItemsToInsert);

        if (itemsError) {
          console.error('Error inserting outfit items:', itemsError);
          throw itemsError;
        }

        toast.success('Outfit updated successfully!');
      } else {
        // Create the outfit
        const { data: newOutfit, error: outfitError } = await supabase
          .from('outfits')
          .insert({
            name: outfitName.trim(),
            occasions: occasions,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (outfitError || !newOutfit) {
          console.error('Error creating outfit:', outfitError);
          throw outfitError;
        }

        // Create outfit items (all selected items)
        const outfitItemsToInsert = allSelectedItems.map(item => ({
          outfit_id: newOutfit.id,
          clothing_item_id: item.id,
          created_at: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from('outfit_items')
          .insert(outfitItemsToInsert);

        if (itemsError) {
          console.error('Error creating outfit items:', itemsError);
          throw itemsError;
        }

        toast.success('Outfit saved successfully!');
      }

      // Close the save dialog first
      setSaveDialogOpen(false);

      if (isEditing) {
        // Close the edit dialog and navigate back
        handleClose();
        onEditComplete();
        onOutfitSaved();
      } else {
        // Only call onOutfitSaved for new outfits, with error protection
        try {
          if (onOutfitSaved) {
            onOutfitSaved();
          }
        } catch (error) {
          console.error('Error in onOutfitSaved:', error.message);
        }
      }
    } catch (error) {
      // More specific error messages
      let errorMessage = 'Failed to save outfit. ';
      if (error.message) {
        errorMessage += error.message;
      }
      if (error.details) {
        errorMessage += ` Details: ${error.details}`;
      }

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!editingOutfit;

  // ✅ Filter items by active category
  const filteredItems = wardrobeItems.filter(
    item => item.category?.toLowerCase() === activeCategory.toLowerCase()
  );

  // ✅ Calculate total selected items across all categories
  const selectedItemsCount = Object.values(currentOutfit).reduce(
    (total, items) => total + items.length,
    0
  );

  // ✅ Check if an item is already selected in current category
  const isItemSelected = (item: ClothingItemType) => {
    const category = item.category?.toLowerCase();
    if (!category || !currentOutfit[category]) return false;
    return currentOutfit[category].some(
      selectedItem => selectedItem.id === item.id
    );
  };

  const handleClose = () => {
    // Reset form state when closing
    setOutfitName('');
    setOccasions([]);
    setOccasionInput('');
    setSaveDialogOpen(false);
    const emptyOutfit: Record<string, ClothingItemType[]> = {};
    categories.forEach(category => {
      emptyOutfit[category] = [];
    });
    setCurrentOutfit(emptyOutfit);

    // Call the parent's onClose function
    if (onClose) {
      onClose();
    }
  };

  // Get the correct items based on active category
  const getCurrentItems = () => {
    if (activeCategory === 'all') {
      return wardrobeItems; // Show all items
    }
    return wardrobeItems.filter(
      item => item.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  };

  console.log('WardrobeItems:', wardrobeItems);
  console.log('Active Category:', activeCategory);
  console.log('Filtered Items:', filteredItems);

  return (
    <div className="min-h-screen">
      {/* Animated Background Pattern - Semantic colors */}
      {/* <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-1000"></div>
      </div> */}

      <div
        className={`
    w-full mx-auto
    ${isEditing ? 'p-1' : 'px-1 pt-2 sm:p-4'}
    relative
  `}
      >
        {/* Enhanced Header */}
        <div className="flex justify-between items-start mt-2 mb-0 sm:mb-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="pb-1 sm:pb-2 flex items-center gap-3">
                <div className="hidden sm:block p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-3xl font-bold text-muted-foreground">
                    {isEditing ? 'Edit Outfit' : 'Create Outfit'}
                  </h1>
                  {!isEditing && (
                    <p className="hidden sm:block text-sm text-muted-foreground mt-1">
                      Mix and match your wardrobe items
                    </p>
                  )}
                </div>
              </div>
              {isEditing && editingOutfit && (
                <div className="mt-2 sm:mt-3">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    Editing: {editingOutfit.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Item count badge - positioned on the right for mobile */}
            <div className="sm:hidden">
              <div className="flex items-center gap-2 bg-accent backdrop-blur-sm rounded-lg border border-border px-2 py-1">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedItemsCount} selected
                </span>
              </div>
            </div>

            {/* Close Button - positioned on the right */}
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="flex gap-2 hover:bg-red-50 text-red-600 transition-colors border-border p-1 sm:p-2"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex justify-center">
          <div className="w-full max-w-[1600px] grid grid-cols-1 xl:grid-cols-6 gap-2 md:gap-8">
            {/* Enhanced Current Outfit Preview - List View - Narrower column */}
            <div className="xl:col-span-2">
              <FloatingOutfitPanel
                currentOutfit={currentOutfit}
                selectedItemsCount={selectedItemsCount}
                handleRemoveItem={handleRemoveItem}
                setSaveDialogOpen={setSaveDialogOpen}
                setActiveCategory={setActiveCategory}
              />
            </div>

            {/* Enhanced Item Selection - Wider column for better readability */}
            <div className="flex flex-col order-1 xl:order-2 xl:col-span-4">
              <div className="sm:bg-card sm:backdrop-blur-md sm:rounded-2xl sm:shadow-xl sm:border sm:border-border sm:p-2">
                <div className="sm:px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-0 mb-1 sm:mt-2 sm:mb-4">
                  <h2 className="hidden sm:block text-md font-semibold text-muted-foreground">
                    Browse Your Wardrobe
                  </h2>
                  <div className="hidden sm:flex w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-2 bg-accent backdrop-blur-sm rounded-lg border border-border px-3 py-1">
                      <Palette className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {selectedItemsCount} items selected
                      </span>
                    </div>
                  </div>
                </div>

                <Tabs
                  value={activeCategory}
                  onValueChange={setActiveCategory}
                  className="px-1 sm:px-2"
                >
                  {/* Category Tabs*/}
                  <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                  />

                  <TabsContent
                    value={activeCategory}
                    className="mt-0 px-1 sm:px-2"
                  >
                    <CategoryContent
                      items={getCurrentItems()}
                      loading={loading}
                      onAddItem={handleAddItem}
                      isItemSelected={isItemSelected}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent className="bg-background/95 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isEditing ? 'Update Outfit' : 'Save Your Outfit'}
              </DialogTitle>
              <p className="text-muted-foreground mt-2">
                Give your outfit a name and add occasions where you'd wear it.
              </p>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label
                  htmlFor="outfit-name"
                  className="text-sm font-medium text-foreground"
                >
                  Outfit Name
                </Label>
                <Input
                  id="outfit-name"
                  value={outfitName}
                  onChange={e => setOutfitName(e.target.value)}
                  placeholder="My Amazing Outfit"
                  className="border-border focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="occasions"
                  className="text-sm font-medium text-foreground"
                >
                  Occasions
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="occasions"
                    value={occasionInput}
                    onChange={e => setOccasionInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOccasion();
                      }
                    }}
                    placeholder="Work, Casual, Date Night..."
                    className="flex-1 border-border focus:border-primary focus:ring-primary/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOccasion}
                    className="px-4"
                  >
                    Add
                  </Button>
                </div>
                {occasions.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                    {occasions.map(occasion => (
                      <Badge
                        key={occasion}
                        variant="secondary"
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {occasion}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-blue-900"
                          onClick={() => handleRemoveOccasion(occasion)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
                className="border-border hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveOutfit}
                disabled={saving || !outfitName.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Update Outfit' : 'Save Outfit'}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OutfitBuilder;
