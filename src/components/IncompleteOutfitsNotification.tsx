// components/IncompleteOutfitsNotification.tsx
import React from 'react';
import { AlertTriangle, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWardrobe } from '../contexts/WardrobeContext';

interface IncompleteOutfitsNotificationProps {
  onFixOutfits: () => void; // Navigate to outfit repair view
  onDismiss?: () => void;
  showDismiss?: boolean;
}

const IncompleteOutfitsNotification: React.FC<
  IncompleteOutfitsNotificationProps
> = ({ onFixOutfits, onDismiss, showDismiss = false }) => {
  const { incompleteCount, incompleteOutfits } = useWardrobe();

  if (incompleteCount === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-amber-800">
              Incomplete Outfits Detected
            </h4>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {incompleteCount}
            </Badge>
          </div>

          <p className="text-sm text-amber-700 mb-3">
            {incompleteCount === 1
              ? 'One outfit is missing items and needs attention.'
              : `${incompleteCount} outfits are missing items and need attention.`}
          </p>

          {/* Show first few incomplete outfit names */}
          <div className="flex flex-wrap gap-1 mb-3">
            {incompleteOutfits.slice(0, 3).map(outfit => (
              <Badge
                key={outfit.id}
                variant="outline"
                className="text-xs bg-white border-amber-300 text-amber-700"
              >
                {outfit.name}
              </Badge>
            ))}
            {incompleteCount > 3 && (
              <Badge
                variant="outline"
                className="text-xs bg-white border-amber-300 text-amber-700"
              >
                +{incompleteCount - 3} more
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onFixOutfits}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Settings className="h-4 w-4 mr-1" />
              Fix Outfits
            </Button>
          </div>
        </div>

        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default IncompleteOutfitsNotification;
