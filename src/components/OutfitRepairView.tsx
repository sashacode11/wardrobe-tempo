// components/OutfitRepairView.tsx
import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Check,
  X,
  AlertTriangle,
  Shirt,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWardrobe } from '../contexts/WardrobeContext';
import { ClothingItemType, OutfitWithItems } from '../types';

interface OutfitRepairViewProps {
  onClose: () => void;
}

const OutfitRepairView: React.FC<OutfitRepairViewProps> = ({ onClose }) => {
  const {
    incompleteOutfits,
    wardrobeItems,
    repairOutfit,
    deleteIncompleteOutfit,
    refreshOutfits,
  } = useWardrobe();

  const [selectedOutfit, setSelectedOutfit] = useState<OutfitWithItems | null>(
    null
  );
  const [selectedReplacements, setSelectedReplacements] = useState<
    ClothingItemType[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRepairing, setIsRepairing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
      await repairOutfit(selectedOutfit.id, selectedReplacements);

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

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      setIsDeleting(outfitId);
      await deleteIncompleteOutfit(outfitId);

      // If we were editing this outfit, close the editor
      if (selectedOutfit?.id === outfitId) {
        setSelectedOutfit(null);
        setSelectedReplacements([]);
      }
    } catch (error) {
      console.error('Error deleting outfit:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (incompleteOutfits.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Outfit Repair Center</h1>
        </div>

        <div className="text-center py-16">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            All outfits complete!
          </h3>
          <p className="text-gray-600">
            You have no incomplete outfits that need repair.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            Outfit Repair Center
          </h1>
          <p className="text-gray-600">
            Fix {incompleteOutfits.length} incomplete outfit
            {incompleteOutfits.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Incomplete Outfits List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Incomplete Outfits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incompleteOutfits.map(outfit => (
                <div
                  key={outfit.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedOutfit?.id === outfit.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedOutfit(outfit);
                    setSelectedReplacements([]);
                    setSearchQuery('');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {outfit.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {outfit.items?.length || 0} items remaining
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs text-amber-700 border-amber-300"
                        >
                          {outfit.missing_items_count} missing
                        </Badge>
                      </div>
                      {outfit.occasions && outfit.occasions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {outfit.occasions
                            .slice(0, 2)
                            .map((occasion, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
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
                      disabled={isDeleting === outfit.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Repair Interface */}
        <div>
          {selectedOutfit ? (
            <Card>
              <CardHeader>
                <CardTitle>Repair: {selectedOutfit.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search for replacement items..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                {/* Current Items */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Current Items
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedOutfit.items.map(item => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-2 text-center"
                      >
                        <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
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
                        <p className="text-xs font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.category}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Replacements */}
                {selectedReplacements.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Selected Replacements ({selectedReplacements.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedReplacements.map(item => (
                        <div
                          key={item.id}
                          className="bg-blue-50 rounded-lg p-2 text-center relative"
                        >
                          <button
                            onClick={() => handleSelectReplacement(item)}
                            className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
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
                          <p className="text-xs font-medium truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-blue-600 capitalize">
                            {item.category}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Items */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Add Items to Outfit
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-4">
                    {Object.entries(itemsByCategory).map(
                      ([category, items]) => (
                        <div key={category}>
                          <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                            {category} ({items.length})
                          </h5>
                          <div className="grid grid-cols-4 gap-2">
                            {items.map(item => {
                              const isSelected = selectedReplacements.some(
                                r => r.id === item.id
                              );
                              return (
                                <div
                                  key={item.id}
                                  className={`relative cursor-pointer border-2 rounded-lg p-1 transition-colors ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => handleSelectReplacement(item)}
                                >
                                  {isSelected && (
                                    <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                      <Check className="h-3 w-3" />
                                    </div>
                                  )}
                                  <div className="aspect-square bg-gray-100 rounded mb-1 overflow-hidden">
                                    {item.image_url ? (
                                      <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Shirt className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs font-medium truncate">
                                    {item.name}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleRepairOutfit}
                    disabled={selectedReplacements.length === 0 || isRepairing}
                    className="flex-1"
                  >
                    {isRepairing
                      ? 'Repairing...'
                      : `Add ${selectedReplacements.length} Items`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteOutfit(selectedOutfit.id)}
                    disabled={isDeleting === selectedOutfit.id}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Delete Outfit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Shirt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select an outfit to repair</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitRepairView;
