// MyOutfits.tsx - Component for the tab
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
// import { supabase } from '../lib/supabase'; // Adjust path to your supabase config

interface OutfitItem {
  id: number;
  name: string;
  color: string;
  category: string;
  image_url?: string;
}

interface Outfit {
  id: number;
  name: string;
  created_at: string;
  user_id: string;
  outfit_items?: {
    category: string;
    wardrobe_item: OutfitItem;
  }[];
}

interface MyOutfitsProps {
  onCreateOutfit?: () => void; // Callback to switch to outfit builder tab
}

const MyOutfits: React.FC<MyOutfitsProps> = ({ onCreateOutfit }) => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      setLoading(true);

      // Replace this with your actual Supabase query
      const { data, error } = await supabase
        .from('outfits')
        .select(
          `
          *,
          outfit_items (
            category,
            wardrobe_item:wardrobe_items (
              id,
              name,
              color,
              category,
              image_url
            )
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOutfits(data || []);
    } catch (error) {
      console.error('Error fetching outfits:', error);
      // Mock data for development
      setOutfits([
        {
          id: 1,
          name: 'Casual Friday',
          created_at: '2024-08-10T10:00:00Z',
          user_id: 'user1',
          outfit_items: [
            {
              category: 'tops',
              wardrobe_item: {
                id: 1,
                name: 'White Button Shirt',
                color: 'white',
                category: 'tops',
              },
            },
            {
              category: 'bottoms',
              wardrobe_item: {
                id: 2,
                name: 'Dark Jeans',
                color: 'blue',
                category: 'bottoms',
              },
            },
            {
              category: 'shoes',
              wardrobe_item: {
                id: 3,
                name: 'White Sneakers',
                color: 'white',
                category: 'shoes',
              },
            },
          ],
        },
        {
          id: 2,
          name: 'Business Meeting',
          created_at: '2024-08-09T09:00:00Z',
          user_id: 'user1',
          outfit_items: [
            {
              category: 'tops',
              wardrobe_item: {
                id: 4,
                name: 'Navy Polo',
                color: 'navy',
                category: 'tops',
              },
            },
            {
              category: 'bottoms',
              wardrobe_item: {
                id: 5,
                name: 'Black Trousers',
                color: 'black',
                category: 'bottoms',
              },
            },
            {
              category: 'shoes',
              wardrobe_item: {
                id: 6,
                name: 'Brown Loafers',
                color: 'brown',
                category: 'shoes',
              },
            },
            {
              category: 'accessories',
              wardrobe_item: {
                id: 7,
                name: 'Brown Belt',
                color: 'brown',
                category: 'accessories',
              },
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutfit = async (outfitId: number) => {
    try {
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

      if (error) throw error;

      setOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting outfit:', error);
    }
  };

  // Helper function to organize outfit items by category
  const organizeOutfitItems = (outfit: Outfit) => {
    const organized: { [key: string]: OutfitItem } = {};

    outfit.outfit_items?.forEach(item => {
      organized[item.category] = item.wardrobe_item;
    });

    return organized;
  };

  const OutfitCard: React.FC<{ outfit: Outfit }> = ({ outfit }) => {
    const items = organizeOutfitItems(outfit);
    const categories = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              {outfit.name}
            </h3>
            <p className="text-sm text-gray-500">
              Created {new Date(outfit.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedOutfit(outfit)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View outfit details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setShowDeleteModal(outfit.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete outfit"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {categories.map(category => {
            const item = items[category];
            return (
              <div key={category} className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg mb-1 flex items-center justify-center overflow-hidden">
                  {item ? (
                    item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-600 font-medium">
                          {item.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="text-gray-400 text-xs">-</div>
                  )}
                </div>
                <p className="text-xs text-gray-600 capitalize truncate">
                  {category}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const OutfitDetailModal: React.FC<{
    outfit: Outfit | null;
    onClose: () => void;
  }> = ({ outfit, onClose }) => {
    if (!outfit) return null;

    const items = organizeOutfitItems(outfit);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {outfit.name}
                </h2>
                <p className="text-gray-600">
                  Created on {new Date(outfit.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(items).map(([category, item]) => (
                <div
                  key={category}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-semibold capitalize text-gray-700 mb-3">
                    {category}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm text-gray-600 font-medium">
                            {item.name.substring(0, 3).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        Color: {item.color}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your outfits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Outfits</h2>
          <p className="text-gray-600">
            You have {outfits.length} saved outfit
            {outfits.length !== 1 ? 's' : ''}
          </p>
        </div>
        {onCreateOutfit && (
          <button
            onClick={onCreateOutfit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Create New Outfit
          </button>
        )}
      </div>

      {outfits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👔</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No outfits yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first outfit to get started
          </p>
          {onCreateOutfit && (
            <button
              onClick={onCreateOutfit}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Outfit
            </button>
          )}
        </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Outfit</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this outfit? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOutfit(showDeleteModal)}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOutfits;
