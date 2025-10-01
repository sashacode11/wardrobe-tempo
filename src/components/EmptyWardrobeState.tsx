// components/EmptyWardrobeState.tsx
import React from 'react';
import { Plus, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmptyWardrobeStateProps {
  hasActiveFilters: boolean;
  isConnected: boolean;
  isOnline: boolean;
  lastSyncTime: Date | null;
  itemCount: number;
  onAddItem: () => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  loading?: boolean;
  error?: string;
  refetch?: () => void;
  isSuccess?: boolean;
}

const EmptyWardrobeState: React.FC<EmptyWardrobeStateProps> = ({
  hasActiveFilters,
  isConnected,
  isOnline,
  lastSyncTime,
  itemCount,
  onAddItem,
  onClearFilters,
  onRefresh,
  loading = false,
  error,
  refetch,
  isSuccess,
}) => {
  // Determine the state to show
  const getStateInfo = () => {
    // If filters are active, show filter-specific empty state
    if (hasActiveFilters) {
      return {
        icon: <Plus className="h-8 w-8 text-muted-foreground" />,
        title: 'No items found',
        description:
          'No items match your current filters. Try adjusting your search criteria.',
        action: (
          <Button onClick={onClearFilters} variant="default">
            Clear Filters
          </Button>
        ),
      };
    }

    // If offline
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-8 w-8 text-orange-500" />,
        title: "You're offline",
        description: 'Connect to the internet to see your wardrobe items.',
        action: (
          <Button onClick={onRefresh} variant="outline" disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Try Again
          </Button>
        ),
      };
    }

    // If online but not connected to Supabase
    // if (!isConnected) {
    //   const timeSinceSync = lastSyncTime
    //     ? Math.floor((Date.now() - lastSyncTime.getTime()) / (1000 * 60))
    //     : null;

    //   return {
    //     icon: <AlertCircle className="h-8 w-8 text-orange-500" />,
    //     title: 'Connection issue',
    //     description: timeSinceSync
    //       ? `Last synced ${timeSinceSync} minutes ago. There might be a connection issue.`
    //       : 'Unable to connect to the server. Your items might not be up to date.',
    //     action: (
    //       <Button onClick={onRefresh} variant="outline" disabled={loading}>
    //         <RefreshCw
    //           className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
    //         />
    //         Refresh
    //       </Button>
    //     ),
    //   };
    // }

    if (error || !isSuccess) {
      return {
        icon: <AlertCircle className="h-8 w-8 text-destructive" />,
        title: 'Something went wrong',
        description:
          'Unable to load your wardrobe. This may be due to network issues.',
        action: (
          <Button
            onClick={refetch}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        ),
      };
    }

    // If connected but no items (truly empty wardrobe)
    return {
      icon: <Plus className="h-8 w-8 text-muted-foreground" />,
      title: 'Your wardrobe is empty',
      description:
        'Start building your digital wardrobe by adding your first clothing item.',
      action: (
        <Button onClick={onAddItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Item
        </Button>
      ),
    };
  };

  const { icon, title, description, action } = getStateInfo();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* Connection status alert */}
      {!isConnected && (
        <Alert className="mb-6 max-w-md">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            {!isOnline
              ? "You're currently offline. Some features may not work properly."
              : 'Having trouble connecting to the server. Your data may not be current.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>

        <h3 className="text-xl font-semibold">{title}</h3>

        <p className="text-muted-foreground">{description}</p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {action}

          {/* Show refresh button for any connection issues */}
          {(!isConnected || !isOnline) && (
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              disabled={loading}
              className="text-xs"
            >
              Last updated:{' '}
              {lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Unknown'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyWardrobeState;
