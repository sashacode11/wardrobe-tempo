import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";

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
}

const ClothingItem = ({
  id = "default-id",
  image = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
  name = "Sample Item",
  category = "tops",
  color = "blue",
  location = "closet",
  seasons = ["spring", "summer"],
  occasions = ["casual", "work"],
  tags = ["favorite"],
  onEdit = () => {},
  onDelete = () => {},
  onAddToOutfit = () => {},
}: ClothingItemProps) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

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

  const parseArrayField = (field: any) => {
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return [];
  };

  return (
    <>
      <Card
        className="w-[250px] h-[300px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={() => setShowDetails(true)}
      >
        <div className="relative h-[220px] overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover" />
          <Badge className="absolute top-2 right-2">{category}</Badge>
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm truncate">{name}</h3>
          <p className="text-xs text-muted-foreground">{color}</p>
        </CardContent>
      </Card>

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
                <span className="font-medium">Seasons:</span>{" "}
                {parseArrayField(seasons).length > 0
                  ? parseArrayField(seasons).join(", ")
                  : "Not specified"}
              </div>
              <div>
                <span className="font-medium">Occasions:</span>{" "}
                {parseArrayField(occasions).length > 0
                  ? parseArrayField(occasions).join(", ")
                  : "Not specified"}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.isArray(tags) && tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">No tags</span>
                )}
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
    </>
  );
};

export default ClothingItem;
