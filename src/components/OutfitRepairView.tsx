// OutfitRepairView.tsx - Simplified to match MyOutfits pattern
import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Trash2,
  CheckCircle,
  Shirt,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWardrobe } from '../contexts/WardrobeContext';
import { OutfitWithItems } from '../types';
import { useMultiselect } from '../hooks/useMultiSelect';
import OutfitActions from './common/OutfitActions';
import OutfitBuilder from './OutfitBuilder';
import { supabase } from '../lib/supabaseClient';

interface OutfitRepairViewProps {
  onClose: () => void;
}

const OutfitRepairView: React.FC<OutfitRepairViewProps> = ({ onClose }) => {
  const { incompleteOutfits, incompleteCount, refreshOutfits, removeOutfit } =
    useWardrobe();

  // OutfitBuilder state (same as MyOutfits)
  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<OutfitWithItems | null>(
    null
  );
  const [deletingOutfit, setDeletingOutfit] = useState<string | null>(null);

  // Multiselect functionality using the reusable hook
  const multiselect = useMultiselect<OutfitWithItems>({
    onDelete: async outfitIds => {
      // Delete outfit_items first, then outfits
      const { error: outfitItemsError } = await supabase
        .from('outfit_items')
        .delete()
        .in('outfit_id', outfitIds);

      if (outfitItemsError) throw new Error('Failed to delete outfit items');

      const { error: outfitsError } = await supabase
        .from('outfits')
        .delete()
        .in('id', outfitIds);

      if (outfitsError) throw new Error('Failed to delete outfits');
    },
    onSuccess: deletedIds => {
      deletedIds.forEach(id => removeOutfit(id));

      // If we were editing one of the deleted outfits, close the editor
      if (editingOutfit && deletedIds.includes(editingOutfit.id)) {
        setEditingOutfit(null);
        setShowOutfitBuilder(false);
      }
    },
    onError: error => {
      console.error('Bulk delete failed:', error);
    },
  });

  // Handle edit outfit (same as MyOutfits)
  const handleEditOutfit = (outfit: OutfitWithItems) => {
    setEditingOutfit(outfit);
    setShowOutfitBuilder(true);
  };

  // Handle single delete (same as MyOutfits)
  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      setDeletingOutfit(outfitId);

      const { error: outfitItemsError } = await supabase
        .from('outfit_items')
        .delete()
        .eq('outfit_id', outfitId);

      if (outfitItemsError) throw outfitItemsError;

      const { error: outfitError } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

      if (outfitError) throw outfitError;

      removeOutfit(outfitId);

      if (editingOutfit?.id === outfitId) {
        setEditingOutfit(null);
        setShowOutfitBuilder(false);
      }
    } catch (error) {
      console.error('Error deleting outfit:', error);
    } finally {
      setDeletingOutfit(null);
    }
  };

  // OutfitCard component (simplified version of MyOutfits card)
  const OutfitCard: React.FC<{ outfit: OutfitWithItems }> = ({ outfit }) => {
    const isSelected = multiselect.selectedItems.has(outfit.id);
    const itemCount = outfit.items?.length || 0;

    return (
      <div className="relative">
        {/* Selection checkbox */}
        {multiselect.isSelectionMode && (
          <div className="absolute top-2 md:top-3 right-2 md:right-3 z-10">
            <div
              className={`w-7 h-7 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              onClick={() => multiselect.toggleItemSelection(outfit.id)}
            >
              {isSelected && <Check className="h-4 w-4 text-white" />}
            </div>
          </div>
        )}

        <Card
          className={`group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 ${
            multiselect.isSelectionMode && isSelected
              ? 'ring-2 ring-green-500 ring-offset-2'
              : ''
          }`}
        >
          <CardHeader className="py-2 px-4 md:p-6 pb-2 md:pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {outfit.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 text-xs"
                  >
                    {itemCount} items
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Incomplete
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Created:{' '}
                  {new Date(outfit.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Action buttons (same as MyOutfits) */}
              {!multiselect.isSelectionMode && (
                <div className="group-hover:opacity-100 transition-opacity duration-200 ml-3">
                  <OutfitActions
                    onView={() => {}} // No view action needed for repair
                    onEdit={() => handleEditOutfit(outfit)}
                    onDelete={() => handleDeleteOutfit(outfit.id)}
                    viewTitle="View outfit details"
                    editTitle="Edit outfit"
                    deleteTitle="Delete outfit"
                    showView={false} // Hide view button for repair interface
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-6 py-2">
            {/* Items preview */}
            {itemCount > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {outfit.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="group/item relative">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                        <img
                          src={item.image_url || ''}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mt-1 text-center">
                        <p className="text-xs font-medium text-gray-700 capitalize truncate">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {itemCount > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{itemCount - 3} more items
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shirt className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-xs font-medium">
                  No items in this outfit
                </p>
              </div>
            )}

            {/* Occasions */}
            {outfit.occasions && outfit.occasions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {outfit.occasions.slice(0, 2).map((occasion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-white border-gray-300"
                  >
                    {occasion}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (incompleteCount === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-hidden pb-20 md:pb-0">
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">All Set!</h1>
            <p className="text-gray-600 text-lg mb-8">
              You have no incomplete outfits that need repair. Your wardrobe is
              perfectly organized!
            </p>
            <Button onClick={onClose} size="lg" className="px-8">
              Back to Wardrobe
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 pb-20 md:pb-0 flex flex-col">
      {' '}
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10 px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="p-2 md:p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg md:rounded-xl shadow-sm">
              <AlertTriangle className="h-5 w-5 md:h-7 md:w-7 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Fix Incomplete Outfits
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {incompleteCount} outfit{incompleteCount !== 1 ? 's' : ''} need
                attention
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            size="sm"
            className="rounded-full p-2 md:p-3"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      </div>
      {/* Content */}
      {!showOutfitBuilder ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
            {/* Error display */}
            {multiselect.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                <p className="text-red-800 text-sm font-medium">
                  {multiselect.error}
                </p>
                <button
                  onClick={() => multiselect.setError(null)}
                  className="text-red-600 hover:text-red-800 hover:underline text-sm mt-2 font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Header Section (same structure as MyOutfits) */}
            <div className="flex flex-row items-center justify-end sm:justify-between">
              <div className="flex items-center gap-3">
                {/* Selection Controls (same as MyOutfits) */}
                <div className="flex items-center gap-2">
                  {multiselect.isSelectionMode ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={
                          multiselect.selectedCount === incompleteOutfits.length
                            ? multiselect.deselectAllItems
                            : () =>
                                multiselect.selectAllItems(incompleteOutfits)
                        }
                        className="text-xs px-2 md:px-3"
                      >
                        {multiselect.selectedCount === incompleteOutfits.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                      {multiselect.hasSelection && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => multiselect.setShowDeleteDialog(true)}
                          className="text-xs px-2 md:px-3"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete ({multiselect.selectedCount})
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={multiselect.toggleSelectionMode}
                        className="text-xs px-2 md:px-3"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={multiselect.toggleSelectionMode}
                      className="text-xs px-2 md:px-3"
                    >
                      Select Multiple
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Outfits Grid (same as MyOutfits) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 mt-6">
              {incompleteOutfits.map(outfit => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* OutfitBuilder (same as MyOutfits) */
        <OutfitBuilder
          isOpen={true}
          editingOutfit={editingOutfit}
          onClose={() => {
            setShowOutfitBuilder(false);
            setEditingOutfit(null);
          }}
          onEditComplete={() => {
            refreshOutfits();
            setShowOutfitBuilder(false);
            setEditingOutfit(null);
          }}
          onOutfitSaved={() => {
            refreshOutfits();
            setShowOutfitBuilder(false);
            setEditingOutfit(null);
          }}
        />
      )}
      {/* Footer */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t p-4 py-1 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="text-sm order-1">
            {incompleteCount === 0 ? (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                All outfits are complete!
              </div>
            ) : (
              <span className="text-gray-600 font-medium text-center sm:text-left">
                {incompleteCount} outfit{incompleteCount !== 1 ? 's' : ''} still
                need attention
              </span>
            )}
          </div>
          <Button
            onClick={onClose}
            size="lg"
            className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-semibold px-6 md:px-8 py-3 rounded-lg md:rounded-xl shadow-lg order-1 sm:order-2 w-auto"
          >
            Done
          </Button>
        </div>
      </div>
      {/* Bulk Delete Confirmation Dialog (same as MyOutfits) */}
      <AlertDialog
        open={multiselect.showDeleteDialog}
        onOpenChange={multiselect.setShowDeleteDialog}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Delete Selected Outfits
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete {multiselect.selectedCount} outfit
              {multiselect.selectedCount !== 1 ? 's' : ''}? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={multiselect.deleteSelectedItems}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
              disabled={multiselect.deletingItems}
            >
              {multiselect.deletingItems ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </div>
              ) : (
                <>
                  Delete {multiselect.selectedCount} outfit
                  {multiselect.selectedCount !== 1 ? 's' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OutfitRepairView;
