// 📁 components/CategoryContent.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Plus } from 'lucide-react';
import { ClothingItemType } from '@/types';
import { OptimizedImage } from './OptimizedImage';

interface CategoryContentProps {
  items: ClothingItemType[];
  loading: boolean;
  onAddItem: (item: ClothingItemType) => void;
  isItemSelected: (item: ClothingItemType) => boolean;
}

export const CategoryContent: React.FC<CategoryContentProps> = ({
  items,
  loading,
  onAddItem,
  isItemSelected,
}) => {
  return (
    <ScrollArea className="md:h-[500px] rounded-xl pb-16">
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wardrobe...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-3">
          {items.length > 0 ? (
            items.map(item => {
              const isSelected = isItemSelected(item);
              return (
                <Card
                  key={item.id}
                  className={`cursor-pointer hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl group overflow-hidden ${
                    isSelected
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-card/80 border border-border'
                  }`}
                  onClick={() => onAddItem(item)}
                >
                  <CardContent className="p-0">
                    <div className="relative w-full h-40 overflow-hidden">
                      <OptimizedImage
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-2 right-2 transition-all duration-300">
                        <div
                          className={`p-1.5 backdrop-blur-sm rounded-full shadow-lg ${
                            isSelected
                              ? 'bg-primary opacity-100'
                              : 'bg-card/90 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Plus className="h-3 w-3 text-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 sm:p-3">
                      <h4 className="font-medium truncate text-sm text-foreground mb-1">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {item.location && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-card/80"
                          >
                            {item.location}
                          </Badge>
                        )}
                        {Array.isArray(item.tags) &&
                          item.tags.slice(0, 1).map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-primary/10 text-primary"
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-2 text-center text-muted-foreground py-12">
              <p className="text-sm">No items available</p>
            </div>
          )}
        </div>
      )}
    </ScrollArea>
  );
};
