// 📁 components/CategoryTabs.tsx
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollArrow } from '@/hooks/useScrollArrow';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
}) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const { showLeftArrow, showRightArrow, scrollLeft, scrollRight } =
    useScrollArrow(tabsRef);

  return (
    <div className="relative mb-2">
      <Tabs
        defaultValue="all"
        value={activeCategory}
        onValueChange={setActiveCategory}
      >
        <TabsList
          ref={tabsRef}
          className="bg-transparent w-full overflow-x-auto flex-nowrap gap-6 justify-start h-auto min-h-[25px] relative scrollbar-hide p-0 m-0 border-0"
        >
          <TabsTrigger
            key="all"
            value="all"
            className="capitalize whitespace-nowrap p-0 bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:rounded-none hover:text-foreground transition-colors"
          >
            All
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger
              key={category}
              value={category}
              className="capitalize whitespace-nowrap p-0 bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary hover:text-foreground data-[state=active]:shadow-none data-[state=active]:rounded-none transition-colors"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-white via-white/80 to-transparent px-3 py-1 rounded-r-md text-gray-600 hover:text-blue-600 transition-colors duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-l from-white via-white/80 to-transparent px-3 py-1 rounded-l-md text-gray-600 hover:text-blue-600 transition-colors duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
