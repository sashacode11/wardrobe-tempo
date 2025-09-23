import React, { useState } from 'react';
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
import { Pencil, Trash2, Plus, Eye, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { capitalizeFirst, parseArrayField } from '@/utils/helpers';
import { OutfitWithItems, ClothingItemProps } from '@/types';
import ViewOutfitsModal from './ViewOutfitsModal';
import OutfitBuilder from './OutfitBuilder';
import { OptimizedImage } from './OptimizedImage';

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

  // const { name, category, image_url: image } = item;

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
          <Badge className="absolute top-2 right-2 bg-white text-black px-1.5 py-0.5 text-xs font-medium rounded">
            {category}
          </Badge>
          <button
            className="absolute bottom-2 left-2 text-xs p-2 rounded-md shadow-lg px-3 py-1 bg-gray-700 text-white font-medium  hover:text-blue-300 transition-colors duration-200"
            onClick={handleViewOutfit}
            type="button"
          >
            View Outfits
          </button>
        </div>
        <CardContent className="py-1 px-2 h-[52px]">
          <h3 className="font-medium text-sm truncate text-blue-400 ">
            {capitalizeFirst(name)}
          </h3>
          {/* <p className="text-xs text-muted-foreground">{color}</p> */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-foreground capitalize ">
              {location}
            </span>
            {color && (
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
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
        <DialogContent className="w-full max-w-md max-h-[90vh] mx-auto p-0 overflow-hidden [&>button]:hidden">
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
              <DialogPrimitive.Close className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-black hover:bg-white/30 transition-colors">
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Category
                </p>
                <p className="text-sm font-medium capitalize">{category}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Color
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{
                      backgroundColor: color === 'white' ? '#ffffff' : color,
                    }}
                  ></div>
                  <p className="text-sm font-medium capitalize">{color}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Location
                </p>
                <p className="text-sm font-medium">
                  {location || 'Not specified'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Season
                </p>
                <p className="text-sm font-medium capitalize">
                  {parseArrayField(seasons).length > 0
                    ? parseArrayField(seasons).join(', ')
                    : 'Not specified'}
                </p>
              </div>
            </div>

            {/* Tags and Occasions */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Occasions
                </p>
                <div className="flex flex-wrap gap-1">
                  {parseArrayField(occasions).length > 0 ? (
                    parseArrayField(occasions).map((occasion, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {occasion.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Not specified
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {parseArrayField(tags).length > 0 ? (
                    parseArrayField(tags).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        #{tag.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No tags
                    </span>
                  )}
                </div>
              </div>
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
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
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
