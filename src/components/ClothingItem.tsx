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
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import { parseArrayField } from '@/lib/utils';
import { ClothingItemType, OutfitType } from '@/types';
import ItemOutfitsModal from './ItemOutfitsModal';
import OutfitBuilder from './OutfitBuilder';

interface OutfitWithItems extends OutfitType {
  occasions?: string[];
  outfit_items: {
    clothing_item_id: string;
    wardrobe_items: ClothingItemType;
  }[];
}

interface ClothingItemProps {
  id?: string;
  image?: string;
  name?: string;
  category?: string;
  color?: string;
  location?: string;
  seasons?: string[];
  occasions?: string[];
  tags?: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddToOutfit?: (id: string) => void;
  onViewDetails?: () => void;
  onViewOutfit?: (outfit: OutfitWithItems) => void;
}

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
  onViewDetails,
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
        className="md:w-[250px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={() => setShowDetails(true)}
      >
        <div className="relative h-[220px] overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover" />
          <Badge className="absolute top-2 right-2 bg-white text-black">
            {category}
          </Badge>
          <button
            className="absolute bottom-2 left-2 bg-gray-700  text-white text-xs p-2 rounded-md shadow-lg"
            onClick={handleViewOutfit}
            type="button"
          >
            View Outfits
          </button>
        </div>
        <CardContent className="py-1 px-2 sm:p-3">
          <h3 className="font-medium text-sm truncate text-blue-400">{name}</h3>
          <p className="text-xs text-muted-foreground">{color}</p>
        </CardContent>
      </Card>

      {/* Item Outfits Modal */}
      <ItemOutfitsModal
        isOpen={showOutfitsModal}
        onClose={() => setShowOutfitsModal(false)}
        // clothingItem={}
        clothingItem={{
          id,
          name,
          category,
          color,
          image_url: image,
          // ... other fields
        }}
        onViewOutfit={handleOutfitView}
        onEditOutfit={outfit => {
          setEditingOutfit(outfit); // Set the outfit to edit
          setShowOutfitBuilder(true); // Open the builder
        }}
      />

      {/* Item Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>Item details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="relative w-full h-[300px] overflow-hidden rounded-md">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid gap-2">
              <div>
                <span className="font-medium">Category:</span> {category}
              </div>
              <div>
                <span className="font-medium">Color:</span> {color}
              </div>
              <div>
                <span className="font-medium">Location:</span> {location}
              </div>
              <div>
                <span className="font-medium">Seasons:</span>{' '}
                {parseArrayField(seasons).length > 0
                  ? parseArrayField(seasons).join(', ')
                  : 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Occasions:</span>{' '}
                {parseArrayField(occasions).length > 0
                  ? parseArrayField(occasions).join(', ')
                  : 'Not specified'}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="font-medium">Tags:</span>{' '}
                {parseArrayField(tags).length > 0
                  ? parseArrayField(tags).join(', ')
                  : 'No tags'}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
            <Button onClick={handleAddToOutfit}>
              <Plus className="h-4 w-4 mr-1" /> Add to Outfit
            </Button>
          </DialogFooter>
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
