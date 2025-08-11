import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Save, Trash2 } from "lucide-react";
import {
  getCurrentUser,
  getClothingItems,
  createOutfit,
} from "../lib/supabaseClient";
import { Database } from "../types/supabase";

type ClothingItemType = Database["public"]["Tables"]["wardrobe_items"]["Row"];

interface OutfitItem {
  category: string;
  item: ClothingItemType | null;
}

interface OutfitBuilderProps {
  onSave?: (outfit: {
    name: string;
    items: ClothingItemType[];
    occasions: string[];
  }) => void;
  onClose?: () => void;
  isOpen?: boolean;
  selectedItem?: ClothingItemType;
  onItemAdded?: () => void;
}

const OutfitBuilder = ({
  onSave,
  onClose,
  isOpen = true,
  selectedItem,
  onItemAdded,
}: OutfitBuilderProps) => {
  // Categories that match your wardrobe
  const categories = [
    "tops",
    "bottoms",
    "shoes",
    "accessories",
    "outerwear",
    "dresses",
    "formal",
  ];

  const [wardrobeItems, setWardrobeItems] = useState<ClothingItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentOutfit, setCurrentOutfit] = useState<OutfitItem[]>([
    { category: "tops", item: null },
    { category: "bottoms", item: null },
    { category: "shoes", item: null },
    { category: "accessories", item: null },
    { category: "outerwear", item: null },
  ]);

  const [activeCategory, setActiveCategory] = useState("tops");
  const [outfitName, setOutfitName] = useState("");
  const [occasions, setOccasions] = useState<string[]>([]);
  const [occasionInput, setOccasionInput] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Load wardrobe items from Supabase
  useEffect(() => {
    loadWardrobeItems();
  }, []);

  // Add selected item to outfit when it changes
  useEffect(() => {
    if (selectedItem) {
      handleAddItem(selectedItem);
      if (onItemAdded) {
        onItemAdded();
      }
    }
  }, [selectedItem]);

  const loadWardrobeItems = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await getClothingItems(user.id);
      if (error) {
        console.error("Error loading wardrobe items:", error);
      } else {
        setWardrobeItems(data || []);
      }
    } catch (error) {
      console.error("Error loading wardrobe items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: ClothingItemType) => {
    setCurrentOutfit((prev) =>
      prev.map((outfitItem) =>
        outfitItem.category === item.category
          ? { ...outfitItem, item }
          : outfitItem,
      ),
    );
  };

  const handleRemoveItem = (category: string) => {
    setCurrentOutfit((prev) =>
      prev.map((outfitItem) =>
        outfitItem.category === category
          ? { ...outfitItem, item: null }
          : outfitItem,
      ),
    );
  };

  const handleAddOccasion = () => {
    if (occasionInput && !occasions.includes(occasionInput)) {
      setOccasions([...occasions, occasionInput]);
      setOccasionInput("");
    }
  };

  const handleRemoveOccasion = (occasion: string) => {
    setOccasions(occasions.filter((o) => o !== occasion));
  };

  const handleSaveOutfit = async () => {
    const outfitItems = currentOutfit
      .filter((outfitItem) => outfitItem.item !== null)
      .map((outfitItem) => outfitItem.item as ClothingItemType);

    if (outfitItems.length === 0) {
      alert("Please add at least one item to your outfit");
      return;
    }

    try {
      const user = await getCurrentUser();
      if (!user) {
        alert("Please log in to save outfits");
        return;
      }

      const outfitData = {
        user_id: user.id,
        name: outfitName || "Unnamed Outfit",
        occasions: occasions,
      };

      const clothingItemIds = outfitItems.map((item) => item.id);
      const { data, error } = await createOutfit(outfitData, clothingItemIds);

      if (error) {
        console.error("Error saving outfit:", error);
        alert("Failed to save outfit. Please try again.");
        return;
      }

      alert("Outfit saved successfully!");

      if (onSave) {
        onSave({
          name: outfitName || "Unnamed Outfit",
          items: outfitItems,
          occasions,
        });
      }

      // Reset form
      setCurrentOutfit([
        { category: "tops", item: null },
        { category: "bottoms", item: null },
        { category: "shoes", item: null },
        { category: "accessories", item: null },
        { category: "outerwear", item: null },
      ]);
      setOutfitName("");
      setOccasions([]);
      setSaveDialogOpen(false);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving outfit:", error);
      alert("Failed to save outfit. Please try again.");
    }
  };

  const filteredItems = wardrobeItems.filter(
    (item) => item.category === activeCategory,
  );

  return (
    <div className="bg-background w-full h-full p-4">
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="text-2xl">Outfit Builder</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6 h-[calc(100%-160px)]">
          {/* Current Outfit Preview */}
          <div className="w-full md:w-1/2 bg-muted/20 rounded-lg p-4 flex flex-col">
            <h3 className="text-lg font-medium mb-4">Current Outfit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
              {currentOutfit.map((outfitItem) => (
                <div key={outfitItem.category} className="relative">
                  <Card className="h-full">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">
                        {outfitItem.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 flex items-center justify-center">
                      {outfitItem.item ? (
                        <div className="relative w-full h-40">
                          <img
                            src={outfitItem.item.image_url}
                            alt={outfitItem.item.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() =>
                              handleRemoveItem(outfitItem.category)
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-xs truncate">
                            {outfitItem.item.name}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => setActiveCategory(outfitItem.category)}
                        >
                          <div className="text-center">
                            <Plus className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">
                              Click to add {outfitItem.category}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Item Selection */}
          <div className="w-full md:w-1/2 flex flex-col">
            <Tabs
              defaultValue={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-5">
                {categories.slice(0, 5).map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="capitalize"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.slice(0, 5).map((category) => (
                <TabsContent
                  key={category}
                  value={category}
                  className="border rounded-md mt-2"
                >
                  <ScrollArea className="h-[500px] p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">
                            Loading your clothes...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredItems.length > 0 ? (
                          filteredItems.map((item) => (
                            <Card
                              key={item.id}
                              className="cursor-pointer hover:border-primary transition-colors"
                              onClick={() => handleAddItem(item)}
                            >
                              <CardContent className="p-3">
                                <div className="relative w-full h-40 mb-2">
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.color && (
                                      <Badge variant="outline">
                                        {item.color}
                                      </Badge>
                                    )}
                                    {Array.isArray(item.tags) &&
                                      item.tags.slice(0, 2).map((tag) => (
                                        <Badge
                                          key={tag}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="col-span-2 flex flex-col items-center justify-center h-40 text-center">
                            <p className="text-muted-foreground mb-2">
                              No {category} in your wardrobe yet
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Add some {category} to your wardrobe to use them
                              in outfits
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => setSaveDialogOpen(true)}>Save Outfit</Button>
        </CardFooter>
      </Card>

      {/* Save Outfit Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Outfit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="outfit-name" className="text-right">
                Name
              </Label>
              <Input
                id="outfit-name"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="My Favorite Outfit"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="occasions" className="text-right">
                Occasions
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="occasions"
                    value={occasionInput}
                    onChange={(e) => setOccasionInput(e.target.value)}
                    placeholder="Add occasion (e.g., Casual, Work)"
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={handleAddOccasion}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {occasions.map((occasion) => (
                    <Badge
                      key={occasion}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {occasion}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveOccasion(occasion)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOutfit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutfitBuilder;
