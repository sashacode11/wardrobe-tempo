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
    // <div className="flex items-center gap-3 p-3 ounded-lg">
    //   {' '}
    //   {/* <div className="flex items-start gap-3"> */}
    //   {/* <div className="flex-shrink-0"> */}
    //   <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
    //   {/* </div> */}
    //   <span className="text-sm font-medium text-amber-800 whitespace-nowrap">
    //     {incompleteCount} incomplete outfit{incompleteCount === 1 ? '' : 's'}{' '}
    //     detected
    //   </span>
    //   {/* <div className="flex-1 min-w-0"> */}
    //   {/* <div className="flex items-center gap-2 mb-1">
    //         <h4 className="text-sm font-medium text-amber-800 whitespace-nowrap">
    //           Incomplete Outfits Detected
    //         </h4>
    //         <Badge variant="secondary" className="bg-amber-100 text-amber-800">
    //           {incompleteCount}
    //         </Badge>
    //       </div> */}
    //   {/* <p className="text-sm text-amber-700 mb-3">
    //         {incompleteCount === 1
    //           ? 'One outfit is missing items and needs attention.'
    //           : `${incompleteCount} outfits are missing items and need attention.`}
    //       </p> */}
    //   {/* Show first few incomplete outfit names */}
    //   {/* <div className="flex flex-wrap gap-1 mb-3">
    //         {incompleteOutfits.slice(0, 3).map(outfit => (
    //           <Badge
    //             key={outfit.id}
    //             variant="outline"
    //             className="text-xs bg-white border-amber-300 text-amber-700"
    //           >
    //             {outfit.name}
    //           </Badge>
    //         ))}
    //         {incompleteCount > 3 && (
    //           <Badge
    //             variant="outline"
    //             className="text-xs bg-white border-amber-300 text-amber-700"
    //           >
    //             +{incompleteCount - 3} more
    //           </Badge>
    //         )}
    //       </div> */}
    //   {/* <div className="flex gap-2"> */}
    //   {/* <Button
    //     size="sm"
    //     onClick={onFixOutfits}
    //     className="bg-amber-600 hover:bg-amber-700 text-white"
    //   >
    //     <Settings className="h-4 w-4 mr-1" />
    //     Fix Outfits
    //   </Button> */}
    //   <Button
    //     size="sm"
    //     variant="outline"
    //     onClick={onFixOutfits}
    //     className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100"
    //   >
    //     Review & Fix
    //   </Button>
    //   {/* </div> */}
    //   {/* </div> */}
    //   {showDismiss && onDismiss && (
    //     <button
    //       onClick={onDismiss}
    //       className="flex-shrink-0 p-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded"
    //     >
    //       <X className="h-4 w-4" />
    //     </button>
    //   )}
    //   {/* </div> */}
    // </div>

    <>
      {/* Mobile version - compact */}
      <div className="fixed bottom-20 left-0 z-50 max-w-[280px] mx-auto animate-in slide-in-from-bottom-2 duration-300 sm:hidden">
        <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />

            <span className="text-xs font-medium text-amber-800 flex-1 min-w-0 leading-tight">
              {incompleteCount} incomplete
            </span>

            <Button
              onClick={onFixOutfits}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-6 px-2 flex-shrink-0"
            >
              Fix
            </Button>

            {showDismiss && onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop version - full featured */}
      <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-2 duration-300 hidden sm:block">
        <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                {incompleteCount} incomplete outfit
                {incompleteCount === 1 ? '' : 's'} detected
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Some items are missing categories or details
              </p>
            </div>

            {showDismiss && onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              onClick={onFixOutfits}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
            >
              Review & Fix
            </Button>
            {showDismiss && onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="text-amber-700 hover:text-amber-800 text-xs"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default IncompleteOutfitsNotification;
