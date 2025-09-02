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
import { Plus, X, ArrowLeft, Palette, Save, Sparkles } from 'lucide-react';
import {
  getCurrentUser,
  getClothingItems,
  createOutfit,
  supabase,
} from '../lib/supabaseClient';
// import { Database } from '../types/supabase';
import { ClothingItemType, OutfitBuilderProps, OutfitItem } from '@/types';
import { categories } from '@/lib/data';

const OutfitBuilder = ({
  onClose,
  selectedItem,
  onItemAdded,
  onOutfitSaved,
  editingOutfit,
  onEditComplete,
}: OutfitBuilderProps) => {
  // Categories that match your wardrobe
  // const categories = [
  //   'tops',
  //   'bottoms',
  //   'shoes',
  //   'accessories',
  //   'outerwear',
  //   'dresses',
  //   'formal',
  // ];

  const [wardrobeItems, setWardrobeItems] = useState<ClothingItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentOutfit, setCurrentOutfit] = useState<OutfitItem[]>([
    { category: 'tops', item: null },
    { category: 'bottoms', item: null },
    { category: 'shoes', item: null },
    { category: 'accessories', item: null },
    { category: 'outerwear', item: null },
  ]);

  const [activeCategory, setActiveCategory] = useState('tops');
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
    if (!editingOutfit) {
      // Not editing → reset form
      setOutfitName('');
      setOccasions([]);
      setCurrentOutfit([
        { category: 'tops', item: null },
        { category: 'bottoms', item: null },
        { category: 'shoes', item: null },
        { category: 'accessories', item: null },
        { category: 'outerwear', item: null },
      ]);
      return;
    }

    // Load basic fields safely
    setOutfitName(editingOutfit.name || 'Unnamed Outfit');
    setOccasions(
      Array.isArray(editingOutfit.occasions) ? editingOutfit.occasions : []
    );

    // Handle missing or invalid `items`
    const outfitItems = editingOutfit.outfit_items;

    // Check if items is a valid array
    if (!Array.isArray(outfitItems)) {
      // Reset to empty slots
      setCurrentOutfit([
        { category: 'tops', item: null },
        { category: 'bottoms', item: null },
        { category: 'shoes', item: null },
        { category: 'accessories', item: null },
        { category: 'outerwear', item: null },
      ]);
      return;
    }

    // Map valid items by category
    const itemMap = outfitItems.reduce<Record<string, ClothingItemType>>(
      (acc, outfitItem) => {
        if (
          outfitItem &&
          typeof outfitItem === 'object' &&
          outfitItem.wardrobe_items &&
          outfitItem.wardrobe_items.category
        ) {
          const wardrobeItem = outfitItem.wardrobe_items;
          acc[wardrobeItem.category] = wardrobeItem;
        } else {
          console.warn('Invalid outfit item structure:', outfitItem);
        }
        return acc;
      },
      {}
    );

    // Update outfit slots
    const updatedOutfit = [
      { category: 'tops', item: itemMap['tops'] || null },
      { category: 'bottoms', item: itemMap['bottoms'] || null },
      { category: 'shoes', item: itemMap['shoes'] || null },
      { category: 'accessories', item: itemMap['accessories'] || null },
      { category: 'outerwear', item: itemMap['outerwear'] || null },
    ];
    setCurrentOutfit(updatedOutfit);
  }, [editingOutfit]);

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
    setCurrentOutfit(prev =>
      prev.map(outfitItem =>
        outfitItem.category === item.category
          ? { ...outfitItem, item }
          : outfitItem
      )
    );
  };

  const handleRemoveItem = (category: string) => {
    setCurrentOutfit(prev =>
      prev.map(outfitItem =>
        outfitItem.category === category
          ? { ...outfitItem, item: null }
          : outfitItem
      )
    );
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
      alert('Please enter an outfit name');
      return;
    }

    // Check if any items are selected
    const selectedItems = currentOutfit.filter(slot => slot.item !== null);

    if (selectedItems.length === 0) {
      alert('Please add at least one item to your outfit');
      return;
    }
    if (occasionInput.trim()) {
      alert('Please press Enter or click Add to include the occasion.');
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

        // Insert new outfit_items
        const outfitItemsToInsert = selectedItems.map(slot => {
          return {
            outfit_id: editingOutfit.id,
            clothing_item_id: slot.item!.id,
            created_at: new Date().toISOString(),
          };
        });

        const { error: itemsError } = await supabase
          .from('outfit_items')
          .insert(outfitItemsToInsert);

        if (itemsError) {
          console.error('Error inserting outfit items:', itemsError);
          throw itemsError;
        }

        alert('Outfit updated successfully!');
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

        // Create outfit items
        const outfitItemsToInsert = selectedItems.map(slot => ({
          outfit_id: newOutfit.id,
          clothing_item_id: slot.item!.id,
          created_at: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from('outfit_items')
          .insert(outfitItemsToInsert);

        if (itemsError) {
          console.error('Error creating outfit items:', itemsError);
          throw itemsError;
        }

        alert('Outfit saved successfully!');
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

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!editingOutfit;
  const filteredItems = wardrobeItems.filter(
    item => item.category === activeCategory
  );
  const selectedItemsCount = currentOutfit.filter(
    slot => slot.item !== null
  ).length;

  const getCategoryIcon = categoryKey => {
    const category = categories.find(cat => cat.key === categoryKey);
    return category ? category.icon : Shirt;
  };

  const handleClose = () => {
    // Reset form state when closing
    setOutfitName('');
    setOccasions([]);
    setOccasionInput('');
    setSaveDialogOpen(false);
    setCurrentOutfit([
      { category: 'tops', item: null },
      { category: 'bottoms', item: null },
      { category: 'shoes', item: null },
      { category: 'accessories', item: null },
      { category: 'outerwear', item: null },
    ]);

    // Call the parent's onClose function
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto p-4 relative">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2 hover:bg-white/50 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button> */}
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {isEditing ? 'Edit Outfit' : 'Create Outfit'}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Mix and match your wardrobe items
                  </p>
                </div>
              </div>
              {isEditing && editingOutfit && (
                <div className="mt-3">
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
              <Palette className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">
                {selectedItemsCount} items selected
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 md:gap-8">
          {/* Enhanced Current Outfit Preview - List View */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 order-2 xl:order-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Your Outfit
                </h2>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {selectedItemsCount}{' '}
                {selectedItemsCount === 1 ? 'item' : 'items'}
              </Badge>
            </div>

            {selectedItemsCount > 0 ? (
              <div className="space-y-3">
                {currentOutfit
                  .filter(outfitItem => outfitItem.item !== null)
                  .map(outfitItem => {
                    const IconComponent = getCategoryIcon(outfitItem.category);
                    return (
                      <div
                        key={outfitItem.category}
                        className="flex items-center gap-4 p-3 bg-white/60 rounded-xl border border-slate-200/40 hover:bg-white/80 transition-all duration-300 group"
                      >
                        {/* Item Image */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <img
                            src={outfitItem.item.image_url}
                            alt={outfitItem.item.name}
                            className="w-full h-full object-cover rounded-lg shadow-sm"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className="h-4 w-4 text-slate-500" />
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              {outfitItem.category}
                            </span>
                          </div>
                          <h3 className="font-medium text-slate-800 truncate">
                            {outfitItem.item.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {outfitItem.item.color && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-white/80"
                              >
                                {outfitItem.item.color}
                              </Badge>
                            )}
                            {Array.isArray(outfitItem.item.tags) &&
                              outfitItem.item.tags.slice(0, 2).map(tag => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs bg-blue-100 text-blue-700"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          onClick={() => handleRemoveItem(outfitItem.category)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Start Building Your Outfit
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Select items from your wardrobe to create the perfect look
                </p>
                {/* <Button
                  variant="outline"
                  onClick={() => setActiveCategory('tops')}
                  className="bg-white/80 hover:bg-white border-slate-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button> */}
              </div>
            )}

            {selectedItemsCount > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
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
                <p className="text-xs text-blue-700 mt-1">
                  Your outfit looks great! Save it to your collection.
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Item Selection */}
          <div className="flex flex-col order-1 xl:order-2">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2 md:p-6">
              <h2 className="text-xl font-semibold mb-2 md:mb-6 text-slate-800">
                Browse Your Wardrobe
              </h2>

              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <div className="md:mb-6 -mx-6 px-6">
                  <div className="overflow-x-auto scrollbar-hide">
                    <TabsList className="flex w-max min-w-full bg-slate-100/80 backdrop-blur-sm p-1 rounded-xl overflow-y-hidden">
                      {categories.map(category => {
                        const IconComponent = category.icon;
                        return (
                          <TabsTrigger
                            key={category.key}
                            value={category.key}
                            className="capitalize text-sm px-6 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-2 min-w-max"
                          >
                            <IconComponent className="h-4 w-4 hidden sm:inline" />
                            <span>{category.label}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>
                </div>

                {categories.map(category => (
                  <TabsContent key={category.key} value={category.key}>
                    <ScrollArea className="md:h-[500px] p-2 md:p-4 rounded-xl bg-slate-50/50">
                      {loading ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-slate-600">
                              Loading wardrobe...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                          {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                              <Card
                                key={item.id}
                                className="cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl group overflow-hidden"
                                onClick={() => handleAddItem(item)}
                              >
                                <CardContent className="p-0">
                                  <div className="relative w-full h-40 overflow-hidden">
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                      <div className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                                        <Plus className="h-3 w-3 text-slate-700" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <h4 className="font-medium truncate text-sm text-slate-800 mb-2">
                                      {item.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                      {item.color && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-white/80"
                                        >
                                          {item.color}
                                        </Badge>
                                      )}
                                      {Array.isArray(item.tags) &&
                                        item.tags.slice(0, 1).map(tag => (
                                          <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-xs bg-blue-100 text-blue-700"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="col-span-2 text-center text-slate-500 py-12">
                              <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <category.icon className="h-8 w-8" />
                              </div>
                              <p className="text-sm">
                                No {category.label.toLowerCase()} in your
                                wardrobe yet.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>

        {/* Enhanced Floating Save Button */}
        {/* <div className="flex md:hidden justify-end mt-6">
          <Button
            onClick={() => setSaveDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-3xl"
            disabled={selectedItemsCount === 0}
          >
            <Save className="h-5 w-5 mr-2" />
            Save Outfit
          </Button>
        </div> */}

        {/* Enhanced Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isEditing ? 'Update Outfit' : 'Save Your Outfit'}
              </DialogTitle>
              <p className="text-slate-600 mt-2">
                Give your outfit a name and add occasions where you'd wear it.
              </p>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label
                  htmlFor="outfit-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Outfit Name
                </Label>
                <Input
                  id="outfit-name"
                  value={outfitName}
                  onChange={e => setOutfitName(e.target.value)}
                  placeholder="My Amazing Outfit"
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="occasions"
                  className="text-sm font-medium text-slate-700"
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
                    className="flex-1 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
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
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
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
                className="border-slate-200 hover:bg-slate-50"
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
