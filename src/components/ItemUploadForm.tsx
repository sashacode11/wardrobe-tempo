import React, { useCallback, useEffect, useState } from 'react';
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
import { capitalizeFirst, parseArrayField } from '../utils/helpers';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';
import { toast } from 'sonner';
import { OptimizedImage } from '../trash/OptimizedImage';
import { compressImage } from '@/utils/imageCache';
import { Area } from 'react-easy-crop/types';
import Cropper from 'react-easy-crop';

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
  brand: string;
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
    brand: '',
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

  // Get data from hook including brands
  const {
    categories: existingCategories,
    colors: existingColors,
    occasions: existingOccasions,
    brands: existingBrands,
  } = useWardrobeItems();

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

  const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];

  const [occasions, setOccasions] = useState([
    'Casual',
    'Work',
    'Formal',
    'Party',
    'Workout',
    'Beach',
    'Travel',
  ]);

  useEffect(() => {
    if (editingItem) {
      const newItemData = {
        image: null,
        imagePreview: editingItem.image_url || null,
        name: editingItem.name || '',
        category: capitalizeFirst(editingItem.category || ''),
        color: capitalizeFirst(editingItem.color || ''),
        brand: editingItem.brand || '',
        location: editingItem.location || '',
        tags: parseArrayField(editingItem.tags),
        seasons: parseArrayField(editingItem.seasons),
        occasions: parseArrayField(editingItem.occasions),
        notes: editingItem.notes || '',
      };

      setItemData(newItemData);
      setActiveTab('details');
    } else {
      setItemData({
        image: null,
        imagePreview: null,
        name: '',
        category: '',
        color: '',
        brand: '',
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
    const normalized = new Set<string>();
    const uniqueOccasions: string[] = [];

    const addIfNotExists = (arr: string[]) => {
      arr.forEach(item => {
        const lower = item.toLowerCase().trim();
        if (!normalized.has(lower)) {
          normalized.add(lower);
          uniqueOccasions.push(capitalizeFirst(lower));
        }
      });
    };

    addIfNotExists(occasions);
    addIfNotExists(existingOccasions);
    itemData.occasions.forEach(o => addIfNotExists([o]));

    setOccasions(uniqueOccasions);
  }, [existingOccasions, itemData.occasions]);

  useEffect(() => {
    const normalized = new Set<string>();
    const uniqueColors: string[] = [];

    const addIfNotExists = (arr: string[]) => {
      arr.forEach(item => {
        const lower = item.toLowerCase().trim();
        if (!normalized.has(lower)) {
          normalized.add(lower);
          uniqueColors.push(capitalizeFirst(lower));
        }
      });
    };

    addIfNotExists(colors);
    addIfNotExists(existingColors);
    addIfNotExists([itemData.color]);

    setColors(uniqueColors);
  }, [existingColors, itemData.color]);

  useEffect(() => {
    const normalized = new Set<string>();
    const uniqueCategories: string[] = [];

    // Helper to add only if not already present (case-insensitive)
    const addIfNotExists = (arr: string[]) => {
      arr.forEach(item => {
        const lower = item.toLowerCase().trim();
        if (!normalized.has(lower)) {
          normalized.add(lower);
          uniqueCategories.push(capitalizeFirst(lower)); // Store consistently capitalized
        }
      });
    };

    addIfNotExists(categories); // Add current hardcoded + user-added
    addIfNotExists(existingCategories); // Add fetched ones
    addIfNotExists([itemData.category]); // Include current editing value if missing

    setCategories(uniqueCategories);
  }, [existingCategories]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];

      try {
        // Compress the image before processing
        const compressedFile = await compressImage(originalFile, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
          format: 'jpeg',
        });

        const reader = new FileReader();
        reader.onload = event => {
          if (event.target?.result) {
            setItemData({
              ...itemData,
              image: compressedFile, // Use compressed file
              imagePreview: event.target.result as string,
            });
            // setActiveTab('details');
          }
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file if compression fails
        const reader = new FileReader();
        reader.onload = event => {
          if (event.target?.result) {
            setItemData({
              ...itemData,
              image: originalFile,
              imagePreview: event.target.result as string,
            });
            setActiveTab('details');
          }
        };
        reader.readAsDataURL(originalFile);
      }
    }
  };

  const [categoryJustAdded, setCategoryJustAdded] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!itemData.imagePreview || !croppedAreaPixels) return;

    const image = new Image();
    image.src = itemData.imagePreview;

    await new Promise(resolve => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx?.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise<string>(resolve => {
      canvas.toBlob(
        blob => {
          if (blob) {
            const croppedUrl = URL.createObjectURL(blob);
            resolve(croppedUrl);
          }
        },
        'image/jpeg',
        0.8
      );
    });
  };

  const handleCropSave = async () => {
    const croppedImage = await createCroppedImage();
    if (croppedImage) {
      // Convert blob URL to File
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], 'cropped-image.jpg', {
        type: 'image/jpeg',
      });

      setItemData({
        ...itemData,
        image: file,
        imagePreview: croppedImage,
      });
      setShowCropModal(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag && !itemData.tags.includes(currentTag)) {
      setItemData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
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

  const handleRemoveOccasion = (occasion: string) => {
    setItemData({
      ...itemData,
      occasions: itemData.occasions.filter(o => o !== occasion),
    });
  };

  const handleSave = async () => {
    if (!itemData.imagePreview) {
      toast.error('Please upload an image for your item');
      return;
    }

    if (!itemData.location) {
      toast.error('Please specify where this item is stored');
      return;
    }

    if (!itemData.category) {
      toast.error('Please select a category for your item');
      return;
    }

    if (currentTag.trim()) {
      toast.warning('Please press Enter or click Add to include the tag.');
      return;
    }

    if (
      currentOccasion.trim() &&
      !itemData.occasions.includes(currentOccasion)
    ) {
      toast.warning('Please click Add to include the occasion.');
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

      if (itemData.image) {
        const { data: imageData, error: imageError } = await uploadImage(
          itemData.image
        );

        if (imageError || !imageData) {
          console.error('Error uploading image:', imageError);
          let errorMessage = 'Failed to upload image. Please try again.';

          if (imageError?.message) {
            errorMessage = imageError.message;
          }

          toast.error(errorMessage);
          setSaving(false);
          return;
        }
        imageUrl = imageData.publicUrl;
      }

      const clothingItem = {
        user_id: user.id,
        name: itemData.name,
        category: itemData.category.toLowerCase().trim(),
        color: itemData.color ? itemData.color.toLowerCase().trim() : null,
        brand: itemData.brand ? itemData.brand.trim() : null,
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
          toast.error('Failed to update item. Please try again.');
          setSaving(false);
          return;
        }
        toast.success('Item updated successfully!');
      } else {
        const { data, error } = await createClothingItem(clothingItem);
        if (error) {
          console.error('Error creating clothing item:', error);
          toast.error('Failed to save item. Please try again.');
          setSaving(false);
          return;
        }
        setItemData({
          image: null,
          imagePreview: null,
          name: '',
          category: '',
          color: '',
          brand: '',
          location: '',
          tags: [],
          seasons: [],
          occasions: [],
          notes: '',
        });
        setActiveTab('upload');

        toast.success('Item created successfully!');
      }

      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomCategory = () => {
    console.log('🔵 ADD CATEGORY - Start');
    console.log('customCategory:', customCategory);
    console.log('categories before:', categories);
    console.log('itemData.category before:', itemData.category);
    if (customCategory && !categories.includes(customCategory)) {
      const newCategories = [...categories, customCategory];
      console.log('newCategories:', newCategories);
      setCategories(newCategories);
      console.log('✅ setCategories called');
      setItemData({ ...itemData, category: customCategory });
      console.log('✅ setItemData called with category:', customCategory);
      setCustomCategory('');
      setShowAddCategory(false);
      console.log('✅ setItemData called with category:', customCategory);
    } else {
      console.log('❌ Category not added - already exists or empty');
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
    if (customOccasion && !occasions.includes(customOccasion)) {
      const newOccasions = [...occasions, customOccasion];
      setOccasions(newOccasions);
      setItemData({
        ...itemData,
        occasions: [...itemData.occasions, customOccasion],
      });
      setCustomOccasion('');
      setShowAddOccasion(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card w-full max-w-md sm:max-w-2xl max-h-[100vh] overflow-y-auto flex flex-col mx-0 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold ">
              {editingItem ? 'Edit Clothing Item' : 'Add New Clothing Item'}
            </DialogTitle>
          </DialogHeader>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4 bg-foreground/5">
              <TabsTrigger value="upload">
                Upload Image
                {!itemData.imagePreview && (
                  <span className="ml-1 text-red-500 text-xs">*</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="details" disabled={!itemData.imagePreview}>
                Item Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-2 bg-muted">
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
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        <span className="hidden md:inline">
                          Drag and drop an image or click to browse
                        </span>
                        <span className="md:hidden">Tap to add a photo</span>
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Camera className="h-4 w-4 mr-2" />
                          Add Photo
                        </label>
                      </Button>
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {/* <Button variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button> */}
                    </div>
                  </div>
                )}
              </div>

              {itemData.imagePreview && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
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
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => setShowCropModal(true)}
                    >
                      <Crop className="h-4 w-4 mr-2" />
                      Crop Image
                    </Button>
                    <Button
                      onClick={() => setActiveTab('details')}
                      className="flex-1 sm:flex-none"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">
                    Category
                    <span className="ml-1 text-red-500 text-xs">*</span>
                  </Label>
                  <div className="space-y-2">
                    <Select
                      key={itemData.category}
                      value={itemData.category}
                      onValueChange={value =>
                        setItemData({ ...itemData, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(category => category.trim() !== '') // Remove empty/whitespace
                          .map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
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
                  <Label htmlFor="location">Storage Location</Label>
                  <Input
                    id="location"
                    value={itemData.location}
                    onChange={e =>
                      setItemData({ ...itemData, location: e.target.value })
                    }
                    placeholder="E.g., Bedroom closet, Dresser drawer 2"
                  />
                  {!itemData.location && (
                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
                      💡 Tip: Adding a location helps you find this item quickly
                      in your wardrobe
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">
                    Item Name
                    {/* <span className="ml-1 text-red-500 text-xs">*</span> */}
                  </Label>
                  <Input
                    id="name"
                    value={itemData.name}
                    onChange={e =>
                      setItemData({ ...itemData, name: e.target.value })
                    }
                    placeholder="e.g., White Linen Shirt, Black Ankle Boots..."
                  />
                </div>

                <div>
                  <Label htmlFor="color">Primary Color</Label>
                  <div className="space-y-2">
                    <Select
                      key={itemData.color}
                      value={itemData.color}
                      onValueChange={value =>
                        setItemData({ ...itemData, color: value })
                      }
                    >
                      <SelectTrigger id="color">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent className="pt-5 pb-5">
                        {colors
                          .filter(colorOption => colorOption.trim() !== '') // Avoid empty/whitespace
                          .map(colorOption => (
                            <SelectItem key={colorOption} value={colorOption}>
                              {colorOption}
                            </SelectItem>
                          ))}
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
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={itemData.brand}
                    onChange={e =>
                      setItemData({ ...itemData, brand: e.target.value })
                    }
                    placeholder="E.g., Nike, Uniqlo"
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
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={currentTag}
                      onChange={e => setCurrentTag(e.target.value)}
                      placeholder="Add a tag (e.g., favorite, new)"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>

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
                </div>

                <div className="md:col-span-2">
                  <Label>Occasions</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2 mt-2">
                      <Select
                        key={currentOccasion}
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
                          {occasions.map(occasion => (
                            <SelectItem key={occasion} value={occasion}>
                              {capitalizeFirst(occasion)}
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

                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {itemData.occasions.map(occasion => (
                      <span
                        key={occasion}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                      >
                        {occasion}
                        <button
                          className="text-blue-600 hover:text-blue-800 ml-1"
                          onClick={() => handleRemoveOccasion(occasion)}
                        >
                          ×
                        </button>
                      </span>
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

              <div className="flex flex-row justify-end gap-2 bg-card mb-5 pb-20 sm:pb-0">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  // disabled={
                  //   !itemData.imagePreview ||
                  //   !itemData.category ||
                  //   !itemData.name ||
                  //   saving
                  // }
                >
                  {saving
                    ? 'Saving...'
                    : editingItem
                    ? 'Update Item'
                    : 'Save Item'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Crop modal - separate Dialog */}
      {showCropModal && itemData.imagePreview && (
        <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Crop Image</DialogTitle>
            </DialogHeader>
            <div className="relative h-96 w-full">
              <Cropper
                image={itemData.imagePreview}
                crop={crop}
                zoom={zoom}
                aspect={undefined}
                minZoom={0.5}
                maxZoom={5}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCropModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCropSave}>Apply Crop</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ItemUploadForm;
