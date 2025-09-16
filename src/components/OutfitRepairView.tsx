// components/OutfitRepairView.tsx - Full-screen overlay for fixing incomplete outfits
import React, { useState, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  Shirt,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useWardrobe } from '../contexts/WardrobeContext';
import { OutfitWithItems } from '../contexts/WardrobeContext';
import { ClothingItemType } from '../types';
import { supabase } from '../lib/supabaseClient';

interface OutfitRepairViewProps {
  onClose: () => void;
}

const OutfitRepairView: React.FC<OutfitRepairViewProps> = ({ onClose }) => {
  const {
    incompleteOutfits,
    incompleteCount,
    wardrobeItems,
    refreshOutfits,
    removeOutfit,
  } = useWardrobe();

  const [selectedOutfit, setSelectedOutfit] = useState<OutfitWithItems | null>(
    null
  );
  const [selectedReplacements, setSelectedReplacements] = useState<
    ClothingItemType[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fixingOutfit, setFixingOutfit] = useState<string | null>(null);
  const [deletingOutfit, setDeletingOutfit] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);

  // Filter available items for replacement suggestions
  const availableItems = useMemo(() => {
    if (!selectedOutfit) return [];

    const query = searchQuery.toLowerCase();
    return wardrobeItems.filter(item => {
      // Don't show items already in the outfit
      const isAlreadyInOutfit = selectedOutfit.items.some(
        outfitItem => outfitItem.id === item.id
      );
      if (isAlreadyInOutfit) return false;

      // Apply search filter
      if (
        searchQuery &&
        !item.name?.toLowerCase().includes(query) &&
        !item.category?.toLowerCase().includes(query) &&
        !item.color?.toLowerCase().includes(query)
      ) {
        return false;
      }

      return true;
    });
  }, [wardrobeItems, selectedOutfit, searchQuery]);

  // Group available items by category for better organization
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, ClothingItemType[]> = {};
    availableItems.forEach(item => {
      const category = item.category || 'Other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });
    return grouped;
  }, [availableItems]);

  const handleSelectReplacement = (item: ClothingItemType) => {
    setSelectedReplacements(prev =>
      prev.find(r => r.id === item.id)
        ? prev.filter(r => r.id !== item.id)
        : [...prev, item]
    );
  };

  const handleRepairOutfit = async () => {
    if (!selectedOutfit || selectedReplacements.length === 0) return;

    try {
      setIsRepairing(true);

      // Add each selected item to the outfit
      for (const item of selectedReplacements) {
        await supabase.from('outfit_items').insert({
          outfit_id: selectedOutfit.id,
          clothing_item_id: parseInt(item.id),
        });
      }

      // Reset state
      setSelectedOutfit(null);
      setSelectedReplacements([]);
      setSearchQuery('');

      // Refresh to get updated data
      await refreshOutfits();
    } catch (error) {
      console.error('Error repairing outfit:', error);
    } finally {
      setIsRepairing(false);
    }
  };

  // Handle deleting outfit
  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      setDeletingOutfit(outfitId);

      // Delete outfit_items first
      const { error: outfitItemsError } = await supabase
        .from('outfit_items')
        .delete()
        .eq('outfit_id', outfitId);

      if (outfitItemsError) throw outfitItemsError;

      // Delete outfit
      const { error: outfitError } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

      if (outfitError) throw outfitError;

      // Update local state
      removeOutfit(outfitId);

      // If we were editing this outfit, close the editor
      if (selectedOutfit?.id === outfitId) {
        setSelectedOutfit(null);
        setSelectedReplacements([]);
      }
    } catch (error) {
      console.error('Error deleting outfit:', error);
    } finally {
      setDeletingOutfit(null);
    }
  };

  const handleAddItemToOutfit = async (outfitId: string, itemId: string) => {
    try {
      setFixingOutfit(outfitId);

      // Add item to outfit_items table
      const { error } = await supabase.from('outfit_items').insert({
        outfit_id: outfitId,
        clothing_item_id: parseInt(itemId),
      });

      if (error) throw error;

      // Refresh outfits to get updated data
      await refreshOutfits();
    } catch (error) {
      console.error('Error adding item to outfit:', error);
    } finally {
      setFixingOutfit(null);
    }
  };

  if (incompleteCount === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-hidden">
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
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10 px-6 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl shadow-sm">
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Fix Incomplete Outfits
              </h1>
              <p className="text-gray-600 mt-1">
                {incompleteCount} outfit{incompleteCount !== 1 ? 's' : ''} need
                attention
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            size="lg"
            className="rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Incomplete Outfits List */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-red-900">
                      {incompleteCount} Incomplete Outfits
                    </h2>
                    <p className="text-red-700 text-sm">
                      Select an outfit to add items
                    </p>
                  </div>
                </div>
              </div>

              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Shirt className="h-6 w-6 text-blue-600" />
                    Outfits to Fix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {incompleteOutfits.map(outfit => (
                    <div
                      key={outfit.id}
                      className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedOutfit?.id === outfit.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => {
                        setSelectedOutfit(outfit);
                        setSelectedReplacements([]);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-lg">
                            {outfit.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-700"
                            >
                              {outfit.items?.length || 0} items
                            </Badge>
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Incomplete
                            </Badge>
                          </div>
                          {outfit.occasions && outfit.occasions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {outfit.occasions
                                .slice(0, 2)
                                .map((occasion, index) => (
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
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteOutfit(outfit.id);
                          }}
                          disabled={deletingOutfit === outfit.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {deletingOutfit === outfit.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Quick add suggestions */}
                      {outfit.items && outfit.items.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {outfit.items.slice(0, 3).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-2 py-1"
                              >
                                <span className="truncate max-w-16">
                                  {item.name}
                                </span>
                                <span className="text-gray-500">
                                  ({item.category})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Repair Interface */}
            <div className="space-y-6">
              {selectedOutfit ? (
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-blue-900">
                      Repair: {selectedOutfit.name}
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Search for items to add..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white border-gray-200 focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        Current Items
                        <Badge variant="secondary" className="text-xs">
                          {selectedOutfit.items?.length || 0}
                        </Badge>
                      </h4>
                      {selectedOutfit.items &&
                      selectedOutfit.items.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {selectedOutfit.items.map(item => (
                            <div
                              key={item.id}
                              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center border border-gray-200"
                            >
                              <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden shadow-sm">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Shirt className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs font-medium truncate text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-600 capitalize mt-1">
                                {item.category}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <Shirt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm font-medium">
                            This outfit has no items yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Selected Items to Add */}
                    {selectedReplacements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          Items to Add
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {selectedReplacements.length}
                          </Badge>
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {selectedReplacements.map(item => (
                            <div
                              key={item.id}
                              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center relative border border-blue-200"
                            >
                              <button
                                onClick={() => handleSelectReplacement(item)}
                                className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-700 transition-colors shadow-lg"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden shadow-sm">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Shirt className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs font-medium truncate text-blue-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-blue-700 capitalize mt-1">
                                {item.category}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Available Items
                      </h4>
                      <div className="max-h-72 overflow-y-auto space-y-4 bg-gray-50 rounded-xl p-4">
                        {Object.entries(itemsByCategory).length > 0 ? (
                          Object.entries(itemsByCategory).map(
                            ([category, items]) => (
                              <div key={category}>
                                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  {category}
                                  <Badge variant="outline" className="text-xs">
                                    {items.length}
                                  </Badge>
                                </h5>
                                <div className="grid grid-cols-4 gap-3">
                                  {items.map(item => {
                                    const isSelected =
                                      selectedReplacements.some(
                                        r => r.id === item.id
                                      );
                                    return (
                                      <div
                                        key={item.id}
                                        className={`relative cursor-pointer rounded-xl p-2 transition-all duration-200 ${
                                          isSelected
                                            ? 'bg-blue-100 border-2 border-blue-500 shadow-lg scale-105'
                                            : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                        onClick={() =>
                                          handleSelectReplacement(item)
                                        }
                                      >
                                        {isSelected && (
                                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                            <Plus className="h-3 w-3" />
                                          </div>
                                        )}
                                        <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                          {item.image_url ? (
                                            <img
                                              src={item.image_url}
                                              alt={item.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <Shirt className="h-6 w-6 text-gray-400" />
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-xs font-medium truncate text-center">
                                          {item.name}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-8">
                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm font-medium">
                              {searchQuery
                                ? `No items found matching "${searchQuery}"`
                                : 'No items available to add'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={handleRepairOutfit}
                        disabled={
                          selectedReplacements.length === 0 || isRepairing
                        }
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                        size="lg"
                      >
                        {isRepairing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Adding Items...
                          </div>
                        ) : (
                          `Add ${selectedReplacements.length} Item${
                            selectedReplacements.length !== 1 ? 's' : ''
                          }`
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteOutfit(selectedOutfit.id)}
                        disabled={deletingOutfit === selectedOutfit.id}
                        className="text-red-600 border-red-300 hover:bg-red-50 font-semibold py-3 px-6 rounded-xl"
                        size="lg"
                      >
                        {deletingOutfit === selectedOutfit.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardContent className="flex items-center justify-center py-24">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shirt className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Select an Outfit to Repair
                      </h3>
                      <p className="text-gray-600">
                        Choose an incomplete outfit from the list to start
                        adding items
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm">
            {incompleteCount === 0 ? (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                All outfits are complete!
              </div>
            ) : (
              <span className="text-gray-600 font-medium">
                {incompleteCount} outfit{incompleteCount !== 1 ? 's' : ''} still
                need attention
              </span>
            )}
          </div>
          <Button
            onClick={onClose}
            size="lg"
            className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutfitRepairView;
