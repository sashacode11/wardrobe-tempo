import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Camera, Crop, Plus } from 'lucide-react';
import {
  getCurrentUser,
  createClothingItem,
  updateClothingItem,
  uploadImage,
} from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import { ClothingItemType } from '../types';
import { parseArrayField } from '../lib/utils';

interface ItemUploadFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: () => void;
  editingItem?: ClothingItemType | null;
}

interface ItemData {
  image: File | null;
  imagePreview: string | null;
  name: string;
  category: string;
  color: string;
  location: string;
  tags: string[];
  seasons: string[];
  occasions: string[];
  notes: string;
}

const ItemUploadForm: React.FC<ItemUploadFormProps> = ({
  open = true,
  onOpenChange = () => {},
  onSave = () => {},
  editingItem = null,
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [itemData, setItemData] = useState<ItemData>({
    image: null,
    imagePreview: null,
    name: '',
    category: '',
    color: '',
    location: '',
    tags: [],
    seasons: [],
    occasions: [],
    notes: '',
  });
  const [currentTag, setCurrentTag] = useState('');
  const [currentOccasion, setCurrentOccasion] = useState('');
  const [saving, setSaving] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const [showAddColor, setShowAddColor] = useState(false);
  const [customOccasion, setCustomOccasion] = useState('');
  const [showAddOccasion, setShowAddOccasion] = useState(false);

  useEffect(() => {
    if (editingItem) {
      const newItemData = {
        image: null,
        imagePreview: editingItem.image_url || null,
        name: editingItem.name || '',
        category: editingItem.category || '',
        color: editingItem.color || '',
        location: editingItem.location || '',
        tags: parseArrayField(editingItem.tags),
        seasons: parseArrayField(editingItem.seasons),
        occasions: parseArrayField(editingItem.occasions),
        notes: editingItem.notes || '',
      };

      console.log('Setting itemData to:', newItemData);
      console.log('newItemData.tags:', newItemData.tags);

      setItemData(newItemData);
      setActiveTab('details');
    } else {
      console.log('🔍 setItemData called from: useEffect (new item)');
      setItemData({
        image: null,
        imagePreview: null,
        name: '',
        category: '',
        color: '',
        location: '',
        tags: [],
        seasons: [],
        occasions: [],
        notes: '',
      });
      setActiveTab('upload');
    }
  }, [editingItem]);

  useEffect(() => {
    console.log('=== ITEMDATA CHANGED ===');
    console.log('itemData:', itemData);
    console.log('itemData.tags:', itemData.tags);
    console.log('itemData.tags.length:', itemData.tags?.length);
  }, [itemData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setItemData({
            ...itemData,
            image: file,
            imagePreview: event.target.result as string,
          });
          setActiveTab('details');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (currentTag && !itemData.tags.includes(currentTag)) {
      // setItemData({ ...itemData, tags: [...itemData.tags, currentTag] });
      setItemData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    // setItemData({ ...itemData, tags: itemData.tags.filter(t => t !== tag) });
    setItemData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSeasonToggle = (season: string) => {
    if (itemData.seasons.includes(season)) {
      setItemData({
        ...itemData,
        seasons: itemData.seasons.filter(s => s !== season),
      });
    } else {
      setItemData({ ...itemData, seasons: [...itemData.seasons, season] });
    }
  };

  const handleAddOccasion = () => {
    if (currentOccasion && !itemData.occasions.includes(currentOccasion)) {
      setItemData({
        ...itemData,
        occasions: [...itemData.occasions, currentOccasion],
      });
      setCurrentOccasion('');
    }
  };

  const handleAddCustomOccasion = () => {
    if (customOccasion && !occasionSuggestions.includes(customOccasion)) {
      const newOccasions = [...occasionSuggestions, customOccasion];
      setOccasionSuggestions(newOccasions);
      setItemData({
        ...itemData,
        occasions: [...itemData.occasions, customOccasion],
      });
      setCustomOccasion('');
      setShowAddOccasion(false);
    }
  };

  const handleRemoveOccasion = (occasion: string) => {
    setItemData({
      ...itemData,
      occasions: itemData.occasions.filter(o => o !== occasion),
    });
  };

  const handleSave = async () => {
    console.log('Saving seasons:', itemData.seasons);
    console.log('Saving tags:', itemData.tags);
    console.log('Saving occasions:', itemData.occasions);
    if (
      (!itemData.image && !itemData.imagePreview) ||
      !itemData.name ||
      !itemData.category
    ) {
      alert('Please fill in all required fields: image, name, and category');
      return;
    }

    setSaving(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('No user found');
        const shouldLogin = window.confirm(
          'You need to be logged in to save items. Would you like to log in now?'
        );
        if (shouldLogin) {
          onOpenChange(false);
          window.dispatchEvent(new CustomEvent('showAuth'));
        }
        setSaving(false);
        return;
      }

      let imageUrl = itemData.imagePreview;

      // Only upload new image if one was selected
      if (itemData.image) {
        const { data: imageData, error: imageError } = await uploadImage(
          itemData.image,
          user.id
        );

        if (imageError || !imageData) {
          console.error('Error uploading image:', imageError);
          let errorMessage = 'Failed to upload image. Please try again.';

          if (imageError?.message) {
            errorMessage = imageError.message;
          }

          alert(errorMessage);
          setSaving(false);
          return;
        }
        imageUrl = imageData.publicUrl;
      }

      // Create clothing item in database
      const clothingItem = {
        user_id: user.id,
        name: itemData.name.trim(),
        category: itemData.category.toLowerCase().trim(),
        color: itemData.color ? itemData.color.toLowerCase().trim() : null,
        image_url: imageUrl,
        location: itemData.location ? itemData.location.trim() : null,
        seasons:
          itemData.seasons.length > 0
            ? itemData.seasons.map(s => s.toLowerCase().trim())
            : [],
        occasions:
          itemData.occasions.length > 0
            ? itemData.occasions.map(o => o.toLowerCase().trim())
            : [],
        tags:
          itemData.tags.length > 0
            ? itemData.tags.map(t => t.toLowerCase().trim())
            : [],
        notes: itemData.notes ? itemData.notes.trim() : null,
      };

      if (editingItem) {
        const { data, error } = await updateClothingItem(
          editingItem.id,
          clothingItem
        );
        if (error) {
          console.error('Error updating clothing item:', error);
          alert('Failed to update item. Please try again.');
          setSaving(false);
          return;
        }
        alert('Item updated successfully!');
      } else {
        const { data, error } = await createClothingItem(clothingItem);
        if (error) {
          console.error('Error creating clothing item:', error);
          alert('Failed to save item. Please try again.');
          setSaving(false);
          return;
        }
        // Reset form
        setItemData({
          image: null,
          imagePreview: null,
          name: '',
          category: '',
          color: '',
          location: '',
          tags: [],
          seasons: [],
          occasions: [],
          notes: '',
        });
        setActiveTab('upload');

        alert('Item created successfully!');
      }

      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const [categories, setCategories] = useState([
    'Tops',
    'Bottoms',
    'Dresses',
    'Outerwear',
    'Shoes',
    'Accessories',
  ]);

  const [colors, setColors] = useState([
    'Black',
    'White',
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Purple',
    'Pink',
    'Brown',
    'Gray',
    'Orange',
    'Multicolor',
  ]);

  const handleAddCustomCategory = () => {
    if (customCategory && !categories.includes(customCategory)) {
      const newCategories = [...categories, customCategory];
      setCategories(newCategories);
      setItemData({ ...itemData, category: customCategory });
      setCustomCategory('');
      setShowAddCategory(false);
    }
  };

  const handleAddCustomColor = () => {
    if (customColor && !colors.includes(customColor)) {
      const newColors = [...colors, customColor];
      setColors(newColors);
      setItemData({ ...itemData, color: customColor });
      setCustomColor('');
      setShowAddColor(false);
    }
  };

  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];

  const [occasionSuggestions, setOccasionSuggestions] = useState([
    'Casual',
    'Work',
    'Formal',
    'Party',
    'Workout',
    'Beach',
    'Travel',
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add New Clothing Item
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="details" disabled={!itemData.imagePreview}>
              Item Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50">
              {itemData.imagePreview ? (
                <div className="relative w-full max-w-md">
                  <img
                    src={itemData.imagePreview}
                    alt="Clothing item preview"
                    className="w-full h-auto rounded-md object-contain max-h-[300px]"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      setItemData({
                        ...itemData,
                        image: null,
                        imagePreview: null,
                      })
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Drag and drop an image or click to browse
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button asChild variant="outline">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </label>
                    </Button>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {itemData.imagePreview && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() =>
                    setItemData({
                      ...itemData,
                      image: null,
                      imagePreview: null,
                    })
                  }
                >
                  Choose Different Image
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Crop className="h-4 w-4 mr-2" />
                    Crop Image
                  </Button>
                  <Button onClick={() => setActiveTab('details')}>
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={itemData.name}
                  onChange={e =>
                    setItemData({ ...itemData, name: e.target.value })
                  }
                  placeholder="E.g., Blue Denim Jacket"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <div className="space-y-2">
                  <Select
                    value={itemData.category}
                    onValueChange={value =>
                      setItemData({ ...itemData, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      {/* Add the existing categroy */}
                      {itemData.category &&
                        !categories.includes(itemData.category) && (
                          <SelectItem value={itemData.category}>
                            {itemData.category}
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>

                  {!showAddCategory ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddCategory(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Category
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomCategory();
                          }
                          if (e.key === 'Escape') {
                            setShowAddCategory(false);
                            setCustomCategory('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomCategory}
                        size="sm"
                        disabled={!customCategory.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddCategory(false);
                          setCustomCategory('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="color">Primary Color</Label>
                <div className="space-y-2">
                  <Select
                    value={itemData.color}
                    onValueChange={value =>
                      setItemData({ ...itemData, color: value })
                    }
                  >
                    <SelectTrigger id="color">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map(color => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                      {/* Add the existing color */}
                      {itemData.color &&
                        !categories.includes(itemData.color) && (
                          <SelectItem value={itemData.color}>
                            {itemData.color}
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>

                  {!showAddColor ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddColor(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Color
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        placeholder="Enter custom color"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomColor();
                          }
                          if (e.key === 'Escape') {
                            setShowAddColor(false);
                            setCustomColor('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomColor}
                        size="sm"
                        disabled={!customColor.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddColor(false);
                          setCustomColor('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  value={itemData.location}
                  onChange={e =>
                    setItemData({ ...itemData, location: e.target.value })
                  }
                  placeholder="E.g., Bedroom closet, Dresser drawer 2"
                />
              </div>

              <div>
                <Label>Seasons</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {seasons.map(season => (
                    <Badge
                      key={season}
                      variant={
                        itemData.seasons.includes(season)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => handleSeasonToggle(season)}
                    >
                      {season}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Tags</Label>

                {/* Display existing tags */}
                {itemData.tags && itemData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {itemData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add new tags */}
                <div className="flex gap-2 mt-2">
                  <Input
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    placeholder="Add a tag (e.g., favorite, new)"
                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {/* <div className="flex flex-wrap gap-2 mt-2">
                  {itemData.tags.map(tag => (
                    <Badge key={tag} className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div> */}
              </div>

              <div className="md:col-span-2">
                <Label>Occasions</Label>
                <div className="space-y-2">
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={currentOccasion}
                      onValueChange={value => {
                        setCurrentOccasion(value);

                        if (!itemData.occasions.includes(value)) {
                          setItemData(prev => ({
                            ...prev,
                            occasions: [...prev.occasions, value],
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select or type occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        {occasionSuggestions.map(occasion => (
                          <SelectItem key={occasion} value={occasion}>
                            {occasion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={handleAddOccasion}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>

                  {!showAddOccasion ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddOccasion(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Occasion
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={customOccasion}
                        onChange={e => setCustomOccasion(e.target.value)}
                        placeholder="Enter custom occasion"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomOccasion();
                          }
                          if (e.key === 'Escape') {
                            setShowAddOccasion(false);
                            setCustomOccasion('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomOccasion}
                        size="sm"
                        disabled={!customOccasion.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddOccasion(false);
                          setCustomOccasion('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {itemData.occasions.map(occasion => (
                    <Badge key={occasion} className="flex items-center gap-1">
                      {occasion}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveOccasion(occasion)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={itemData.notes}
                  onChange={e =>
                    setItemData({ ...itemData, notes: e.target.value })
                  }
                  placeholder="Add any additional notes about this item"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={e => {
              e.preventDefault();
              handleSave();
            }}
            disabled={
              !itemData.imagePreview ||
              !itemData.name ||
              !itemData.category ||
              saving
            }
          >
            {saving ? 'Saving...' : 'Save Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemUploadForm;
