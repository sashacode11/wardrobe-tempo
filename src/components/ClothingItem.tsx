import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Eye, X, ChevronRight } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { capitalizeFirst, parseArrayField } from '@/utils/helpers';
import { OutfitWithItems, ClothingItemProps } from '@/types';
import ViewOutfitsModal from './ViewOutfitsModal';
import OutfitBuilder from './OutfitBuilder';
import { OptimizedImage } from './OptimizedImage';
import { supabase } from '@/lib/supabaseClient';

const ClothingItem = ({
  id = 'unknown',
  image = '/placeholder.jpg',
  name = 'Unnamed Item',
  category = 'uncategorized',
  color = 'unknown',
  location = 'unknown',
  seasons = [],
  occasions = [],
  tags = [],
  onEdit = () => {},
  onDelete = () => {},
  onAddToOutfit = () => {},
  onViewOutfit,
}: ClothingItemProps) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [showOutfitsModal, setShowOutfitsModal] = React.useState(false);

  const [previewOutfit, setPreviewOutfit] = useState<OutfitWithItems | null>(
    null
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  // const { name, category, image_url: image } = item;

  useEffect(() => {
    const fetchPreviewOutfit = async () => {
      if (!id || id === 'unknown') return;

      setIsLoadingPreview(true);
      try {
        const { data, error } = await supabase
          .from('outfit_items')
          .select(
            `
            outfits (
              id,
              name,
              occasions,
              created_at,
              outfit_items (
                id,
                clothing_item_id,
                wardrobe_items (
                  id,
                  name,
                  category,
                  color,
                  image_url
                )
              )
            )
          `
          )
          .eq('clothing_item_id', id)
          .limit(1)
          .single();

        if (data && data.outfits) {
          setPreviewOutfit(data.outfits as any);
        }
      } catch (error) {
        console.error('Error fetching preview outfit:', error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchPreviewOutfit();
  }, [id]);

  const handleViewOutfit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOutfitsModal(true);
  };

  const handleOutfitView = (outfit: OutfitWithItems) => {
    setShowOutfitsModal(false);

    if (onViewOutfit) {
      onViewOutfit(outfit);
    }
  };

  const handleEdit = () => {
    onEdit(id);
    setShowDetails(false);
  };

  const handleDelete = () => {
    onDelete(id);
    setConfirmDelete(false);
    setShowDetails(false);
  };

  const handleAddToOutfit = () => {
    onAddToOutfit(id);
    setShowDetails(false);
  };

  const [editingOutfit, setEditingOutfit] = useState<OutfitWithItems | null>(
    null
  );

  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);

  function fetchOutfits() {
    throw new Error('Function not implemented.');
  }

  const handleClose = () => {
    setShowOutfitBuilder(false);

    // Delay clearing editingOutfit so title doesn't flash
    setTimeout(() => {
      setEditingOutfit(null);
    }, 300); // match Dialog close animation duration
  };

  // Modal data configuration
  const detailFields = [
    {
      id: 'category',
      label: 'Category',
      value: category,
      type: 'text',
    },
    {
      id: 'color',
      label: 'Color',
      value: color,
      type: 'color',
    },
    {
      id: 'location',
      label: 'Location',
      value: location,
      type: 'text',
    },
    {
      id: 'season',
      label: 'Season',
      value: parseArrayField(seasons).join(', '),
      isEmpty: parseArrayField(seasons).length === 0,
      type: 'text',
    },
  ];

  const metaFields = [
    {
      id: 'occasions',
      label: 'Occasions',
      value: parseArrayField(occasions),
      isEmpty: parseArrayField(occasions).length === 0,
      type: 'badges',
      badgeStyle:
        'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'tags',
      label: 'Tags',
      value: parseArrayField(tags),
      isEmpty: parseArrayField(tags).length === 0,
      type: 'badges',
      badgeStyle: 'bg-muted text-muted-foreground',
      prefix: '#',
    },
  ];

  // Reusable field component
  const DetailField = ({ field }) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {field.label}
      </p>

      {field.type === 'color' ? (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full border border-border"
            style={{
              backgroundColor:
                field.value === 'white' ? '#ffffff' : field.value,
            }}
          />
          <p
            className={`text-sm font-normal capitalize ${
              field.isEmpty ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            {field.value || 'Not specified'}
          </p>
        </div>
      ) : (
        <p
          className={`text-sm font-normal capitalize ${
            field.isEmpty ? 'text-muted-foreground' : 'text-foreground'
          }`}
        >
          {field.value || 'Not specified'}
        </p>
      )}
    </div>
  );

  const MetaField = ({ field }) => (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        {field.label}
      </p>

      {field.isEmpty ? (
        <span className="text-sm text-muted-foreground font-normal">
          {field.id === 'tags' ? 'No tags' : 'Not specified'}
        </span>
      ) : (
        <div className="flex flex-wrap gap-2">
          {field.value.map((item, index) => (
            <span
              key={index}
              className={`px-2.5 py-1 text-xs font-medium rounded-md ${field.badgeStyle}`}
            >
              {field.prefix || ''}
              {item.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card
        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-card border border-border rounded-lg shadow-sm duration-200"
        onClick={() => setShowDetails(true)}
      >
        <div className="relative h-[220px] overflow-hidden">
          <OptimizedImage
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-2 right-2 bg-white dark:bg-gray-900 text-black dark:text-white px-1.5 py-0.5 text-xs font-medium rounded border border-gray-200 dark:border-gray-700">
            {category}
          </Badge>
          {/* <button
            className="absolute bottom-2 left-2 text-xs p-2 rounded-md shadow-lg px-3 py-1 bg-black/70 dark:bg-gray-800 text-white font-medium hover:bg-black/80 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={handleViewOutfit}
            type="button"
          >
            View Outfits
          </button> */}
          {/* "Complete the Look" Section - Shows preview of first outfit */}
          {/* "Complete the Look" Section - Shows preview of first outfit */}
          {!isLoadingPreview &&
            previewOutfit &&
            previewOutfit.outfit_items &&
            previewOutfit.outfit_items.length > 0 && (
              <div className="absolute bottom-3 left-3 w-1/2 bg-primary-foreground backdrop-blur-sm rounded-sm shadow-lg">
                <button
                  className="w-full p-1 flex items-center gap-0 hover:bg-muted transition-colors"
                  onClick={handleViewOutfit}
                  type="button"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h6 className="text-left font-semibold text-xs sm:text-sm text-foreground">
                        My Looks
                      </h6>
                      <ChevronRight className="h-5 w-5 text-foreground flex-shrink-0" />
                    </div>

                    {/* Horizontal scrollable row of items from first outfit */}
                    <div
                      className="flex gap-0 overflow-x-auto scrollbar-hide"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                      }}
                    >
                      {previewOutfit.outfit_items.map((item, index) => {
                        const clothingItemData = item.wardrobe_items;
                        if (!clothingItemData) return null;

                        return (
                          <div
                            key={index}
                            className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14"
                          >
                            <div className="w-full h-full bg-muted rounded-lg overflow-hidden border-2 border-border">
                              <OptimizedImage
                                src={clothingItemData.image_url || ''}
                                alt={clothingItemData.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </button>
              </div>
            )}
        </div>

        <CardContent className="py-1 px-2 h-[52px]">
          <h3 className="font-medium text-sm truncate text-foreground">
            {capitalizeFirst(name)}
          </h3>
          {/* <p className="text-xs text-muted-foreground">{color}</p> */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-foreground capitalize ">
              {location}
            </span>
            {color && (
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color }}
                title={color}
              />
            )}
          </div>
          {/* {brand && (
    <p className="text-xs text-gray-500 mt-1 truncate">
      {brand}
    </p>
  )} */}
        </CardContent>
      </Card>

      {/* Item Outfits Modal */}
      <ViewOutfitsModal
        isOpen={showOutfitsModal}
        onClose={() => setShowOutfitsModal(false)}
        // clothingItem={}
        clothingItem={{
          id,
          name,
          category,
          color,
          image_url: image,
        }}
        onViewOutfit={handleOutfitView}
        onEditOutfit={outfit => {
          setEditingOutfit(outfit); // Set the outfit to edit
          setShowOutfitBuilder(true); // Open the builder
        }}
      />

      {/* Item Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="w-full max-w-md max-h-[90vh] mx-auto p-0 overflow-hidden [&>button]:hidden bg-card">
          {/* Image Header with Title Overlay */}
          <div className="relative">
            <div className="relative w-full h-48 sm:h-64 overflow-hidden">
              <OptimizedImage
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Title overlay on image */}
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-white text-xl font-bold drop-shadow-lg">
                  {capitalizeFirst(name)}
                </h2>
              </div>

              {/* Close button */}
              <DialogPrimitive.Close className="absolute top-4 right-4 w-8 h-8 bg-black/20 dark:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white dark:text-black hover:bg-black/30 dark:hover:bg-white/30 transition-colors">
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            {/* Details Grid - Now data-driven */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {detailFields.map(field => (
                <DetailField key={field.id} field={field} />
              ))}
            </div>

            {/* Meta Fields - Now data-driven */}
            <div className="space-y-4 mb-6">
              {metaFields.map(field => (
                <MetaField key={field.id} field={field} />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex-1"
              >
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
              <Button
                onClick={handleAddToOutfit}
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" /> Add to Outfit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit outfit builder */}
      {showOutfitBuilder && (
        <OutfitBuilder
          isOpen={showOutfitBuilder}
          editingOutfit={editingOutfit}
          onClose={handleClose}
          onEditComplete={() => {
            // Optionally refresh outfits
            fetchOutfits(); // or whatever refresh function you have
          }}
          onOutfitSaved={() => {
            fetchOutfits();
            setShowOutfitBuilder(false);
            setEditingOutfit(null);
          }}
        />
      )}
    </>
  );
};

export default ClothingItem;
