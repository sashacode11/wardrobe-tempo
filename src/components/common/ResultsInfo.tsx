// components/common/ResultsInfo.tsx
import React from 'react';
import { cn } from '@/utils/helpers';

interface ResultsInfoProps {
  totalCount: number;
  filteredCount: number;
  itemType: string; // 'item' or 'outfit'
  searchQuery?: string;
  activeCategory?: string;
  className?: string;
}

const ResultsInfo = ({
  totalCount,
  filteredCount,
  itemType,
  searchQuery,
  activeCategory,
  className,
}: ResultsInfoProps) => {
  const formatItemType = (count: number, type: string) => {
    return `${count} ${type}${count !== 1 ? 's' : ''}`;
  };

  const getResultsMessage = () => {
    if (searchQuery) {
      return `Found ${formatItemType(
        filteredCount,
        itemType
      )} matching "${searchQuery}"`;
    }

    if (activeCategory && activeCategory !== 'all') {
      return `${formatItemType(filteredCount, itemType)} in ${activeCategory}`;
    }

    return `${formatItemType(filteredCount, itemType)} total`;
  };

  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      {getResultsMessage()}
    </div>
  );
};

export default ResultsInfo;
