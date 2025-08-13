// MyOutfits.tsx - Component for the tab that matches your OutfitBuilder
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCurrentUser, supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type ClothingItemType = Database['public']['Tables']['wardrobe_items']['Row'];
type OutfitType = Database['public']['Tables']['outfits']['Row'];

interface OutfitWithItems extends OutfitType {
  outfit_items: {
    clothing_item_id: string;
    wardrobe_items: ClothingItemType;
  }[];
}

interface MyOutfitsProps {
  onCreateOutfit?: () => void; // Callback to switch to outfit builder tab
}

const MyOutfits: React.FC<MyOutfitsProps> = ({ onCreateOutfit }) => {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitWithItems | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      setLoading(true);

      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('outfits')
        .select(
          `
          *,
          outfit_items (
            clothing_item_id,
            wardrobe_items (*)
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching outfits:', error);
        return;
      }

      setOutfits((data as OutfitWithItems[]) || []);
    } catch (error) {
      console.error('Error fetching outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      // First delete the outfit_items
      const { error: outfitItemsError } = await supabase
        .from('outfit_items')
        .delete()
        .eq('outfit_id', outfitId);

      if (outfitItemsError) {
        console.error('Error deleting outfit items:', outfitItemsError);
        return;
      }

      // Then delete the outfit
      const { error: outfitError } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

      if (outfitError) {
        console.error('Error deleting outfit:', outfitError);
        return;
      }

      setOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting outfit:', error);
    }
  };

  // Helper function to organize outfit items by category
  const organizeOutfitItems = (outfit: OutfitWithItems) => {
    const organized: { [key: string]: ClothingItemType } = {};

    outfit.outfit_items?.forEach(item => {
      const clothingItem = item.wardrobe_items;
      if (clothingItem) {
        organized[clothingItem.category] = clothingItem;
      }
    });

    return organized;
  };

  const OutfitCard: React.FC<{ outfit: OutfitWithItems }> = ({ outfit }) => {
    const items = organizeOutfitItems(outfit);
    const categories = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{outfit.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Created {new Date(outfit.created_at).toLocaleDateString()}
              </p>
              {outfit.occasions && outfit.occasions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {outfit.occasions.slice(0, 2).map((occasion, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {occasion}
                    </Badge>
                  ))}
                  {outfit.occasions.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{outfit.occasions.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedOutfit(outfit)}
                className="h-8 w-8"
                title="View outfit details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditOutfit(outfit)}
                className="h-8 w-8"
                title="Edit outfit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteModal(outfit.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Delete outfit"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-5 gap-2">
            {categories.map(category => {
              const item = items[category];
              return (
                <div key={category} className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-md mb-1 flex items-center justify-center overflow-hidden">
                    {item ? (
                      <img
                        src={item.image_url || ''}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground text-xs">-</div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {category}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const OutfitDetailModal: React.FC<{
    outfit: OutfitWithItems | null;
    onClose: () => void;
  }> = ({ outfit, onClose }) => {
    if (!outfit) return null;

    const items = organizeOutfitItems(outfit);

    return (
      <Dialog open={!!outfit} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{outfit.name}</DialogTitle>
            <p className="text-muted-foreground">
              Created on {new Date(outfit.created_at).toLocaleDateString()}
            </p>
            {outfit.occasions && outfit.occasions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {outfit.occasions.map((occasion, index) => (
                  <Badge key={index} variant="secondary">
                    {occasion}
                  </Badge>
                ))}
              </div>
            )}
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {Object.entries(items).map(([category, item]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm capitalize">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image_url || ''}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        {item.color && (
                          <p className="text-sm text-muted-foreground capitalize">
                            Color: {item.color}
                          </p>
                        )}
                        {Array.isArray(item.tags) && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.slice(0, 2).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your outfits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Outfits</h2>
          <p className="text-muted-foreground">
            You have {outfits.length} saved outfit
            {outfits.length !== 1 ? 's' : ''}
          </p>
        </div>
        {onCreateOutfit && (
          <Button onClick={onCreateOutfit} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Outfit
          </Button>
        )}
      </div>

      {outfits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">👔</div>
            <h3 className="text-xl font-semibold mb-2">No outfits yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first outfit to get started
            </p>
            {onCreateOutfit && (
              <Button onClick={onCreateOutfit} className="mt-4">
                Create Your First Outfit
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outfits.map(outfit => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}

      {/* Outfit Detail Modal */}
      {selectedOutfit && (
        <OutfitDetailModal
          outfit={selectedOutfit}
          onClose={() => setSelectedOutfit(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Dialog
          open={!!showDeleteModal}
          onOpenChange={() => setShowDeleteModal(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Outfit</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground py-4">
              Are you sure you want to delete this outfit? This action cannot be
              undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteOutfit(showDeleteModal)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyOutfits;
