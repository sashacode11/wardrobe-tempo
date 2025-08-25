import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Plus, X, Save, Trash2 } from 'lucide-react';
import {
  getCurrentUser,
  getClothingItems,
  createOutfit,
  supabase,
} from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type ClothingItemType = Database['public']['Tables']['wardrobe_items']['Row'];
type OutfitWithItems =
  Database['public']['Tables']['outfits_with_items']['Row'];

interface OutfitItem {
  category: string;
  item: ClothingItemType | null;
}

interface OutfitBuilderProps {
  onSave?: (outfit: {
    name: string;
    items: ClothingItemType[];
    occasions: string[];
  }) => void;
  onClose?: () => void;
  isOpen?: boolean;
  selectedItem?: ClothingItemType;
  onItemAdded?: () => void;
  onOutfitSaved?: () => void;
  editingOutfit: OutfitWithItems | null;
  onEditComplete: () => void;
}

const OutfitBuilder = ({
  onSave,
  onClose,
  isOpen = true,
  selectedItem,
  onItemAdded,
  onOutfitSaved,
  editingOutfit,
  onEditComplete,
}: OutfitBuilderProps) => {
  // Categories that match your wardrobe
  const categories = [
    'tops',
    'bottoms',
    'shoes',
    'accessories',
    'outerwear',
    'dresses',
    'formal',
  ];

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

  useEffect(() => {
    console.log(
      '🔧 OutfitBuilder: isOpen=',
      isOpen,
      'onClose=',
      typeof onClose
    );
  }, [isOpen, onClose]);

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
      console.log('🔍 [useEffect] editingOutfit changed:', editingOutfit);
      console.log('🔍 [useEffect] isOpen:', isOpen);

      if (!isOpen) {
        console.log('⏸ Dialog is closed → skipping reset logic');
        return;
      }

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

    console.log('✏️ Switch to EDIT mode → populate fields');

    // ✅ Load basic fields safely
    setOutfitName(editingOutfit.name || 'Unnamed Outfit');
    setOccasions(
      Array.isArray(editingOutfit.occasions) ? editingOutfit.occasions : []
    );

    // 🔥 Critical Fix: Handle missing or invalid `items`
    const outfitItems = editingOutfit.outfit_items;

    // ✅ Check if items is a valid array
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

    // ✅ Map valid items by category
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
          console.warn('🏗️ Invalid outfit item structure:', outfitItem);
        }
        return acc;
      },
      {}
    );
    // ✅ Update outfit slots
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

  // Add detailed error handling and debugging to your handleSaveOutfit function:

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
        console.error('💾 No user found');
        return;
      }

      const isEditing = !!editingOutfit;
      if (isEditing) {
        // 1. Update the outfit basic info
        const { error: outfitError } = await supabase
          .from('outfits')
          .update({
            name: outfitName.trim(),
            occasions: occasions,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingOutfit.id);

        if (outfitError) {
          console.error('💾 Error updating outfit:', outfitError);
          throw outfitError;
        }

        // 2. Delete existing outfit_items
        const { error: deleteError } = await supabase
          .from('outfit_items')
          .delete()
          .eq('outfit_id', editingOutfit.id);

        if (deleteError) {
          console.error('💾 Error deleting old outfit items:', deleteError);
          throw deleteError;
        }
        // 3. Insert new outfit_items
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
          console.error('💾 Error inserting outfit items:', itemsError);
          throw itemsError;
        }

        alert('Outfit updated successfully!');
      } else {
        // 1. Create the outfit
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
          console.error('💾 Error creating outfit:', outfitError);
          throw outfitError;
        }

        // 2. Create outfit items
        const outfitItemsToInsert = selectedItems.map(slot => ({
          outfit_id: newOutfit.id,
          clothing_item_id: slot.item!.id,
          created_at: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from('outfit_items')
          .insert(outfitItemsToInsert);

        if (itemsError) {
          console.error('💾 Error creating outfit items:', itemsError);
          throw itemsError;
        }

        alert('Outfit saved successfully!');
      }

      // Clear editing state and redirect
      onEditComplete?.();
      onOutfitSaved();
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
      setSaving(false); // or setIsLoading(false)
    }
  };

  // Update your save button to show different text:
  const isEditing = !!editingOutfit;

  const filteredItems = wardrobeItems.filter(
    item => item.category === activeCategory
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl max-h-screen overflow-hidden p-0 flex flex-col"
        style={{ maxHeight: 'calc(100vh - 80px)' }}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Edit Outfit' : 'Create Outfit'}
          </DialogTitle>
          {isEditing && editingOutfit && (
            <p className="text-sm text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mt-1">
              Editing: {editingOutfit.name}
            </p>
          )}
        </DialogHeader>

        {/* Scrollable Body */}
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Current Outfit Preview */}
            <div className="bg-muted/20 rounded-lg p-4 flex flex-col">
              <h3 className="text-lg font-medium mb-4">Current Outfit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentOutfit.map(outfitItem => (
                  <div key={outfitItem.category} className="relative">
                    <Card className="h-full">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm capitalize">
                          {outfitItem.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 flex items-center justify-center">
                        {outfitItem.item ? (
                          <div className="relative w-full h-40">
                            <img
                              src={outfitItem.item.image_url}
                              alt={outfitItem.item.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() =>
                                handleRemoveItem(outfitItem.category)
                              }
                              aria-label={`Remove ${outfitItem.category}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-xs truncate">
                              {outfitItem.item.name}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() =>
                              setActiveCategory(outfitItem.category)
                            }
                          >
                            <div className="text-center">
                              <Plus className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                              <span className="text-muted-foreground text-xs">
                                Add {outfitItem.category}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Selection */}
            <div className="flex flex-col">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="grid grid-cols-5 mb-2">
                  {categories.slice(0, 5).map(category => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="capitalize"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.slice(0, 5).map(category => (
                  <TabsContent key={category} value={category}>
                    <ScrollArea className="h-[500px] p-4 border rounded-md">
                      {loading ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">
                              Loading clothes...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                              <Card
                                key={item.id}
                                className="cursor-pointer hover:border-primary transition-colors"
                                onClick={() => handleAddItem(item)}
                              >
                                <CardContent className="p-3">
                                  <div className="relative w-full h-40 mb-2">
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      className="w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium truncate">
                                      {item.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.color && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {item.color}
                                        </Badge>
                                      )}
                                      {Array.isArray(item.tags) &&
                                        item.tags.slice(0, 2).map(tag => (
                                          <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-xs"
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
                            <div className="col-span-2 text-center text-muted-foreground text-sm">
                              No {category} in your wardrobe yet.
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

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 pt-0 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveOutfit}
            disabled={saving || !outfitName.trim()}
          >
            {saving
              ? isEditing
                ? 'Updating...'
                : 'Saving...'
              : isEditing
              ? 'Update Outfit'
              : 'Save Outfit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OutfitBuilder;
