// components/CacheManagement.tsx - Cache management UI component
import React, { useState, useEffect } from 'react';
import { getCacheStats, clearImageCache } from '../utils/imageCache';

export const CacheManagement: React.FC = () => {
  const [stats, setStats] = useState(getCacheStats());
  const [clearing, setClearing] = useState(false);

  const refreshStats = () => {
    setStats(getCacheStats());
  };

  const handleClearCache = async () => {
    setClearing(true);
    clearImageCache();
    await new Promise(resolve => setTimeout(resolve, 500));
    refreshStats();
    setClearing(false);
  };

  useEffect(() => {
    const interval = setInterval(refreshStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Image Cache</h3>
        <button
          onClick={refreshStats}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Cached Images</p>
          <p className="font-semibold">
            {stats.itemsCount} / {stats.maxItems}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Memory Used</p>
          <p className="font-semibold">
            {stats.totalSizeMB} / {stats.maxSizeMB} MB
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${stats.utilizationPercent}%` }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClearCache}
          disabled={clearing || stats.itemsCount === 0}
          className="flex-1 bg-red-600 text-white text-sm px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {clearing ? 'Clearing...' : 'Clear Cache'}
        </button>

        <button
          onClick={refreshStats}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {stats.itemsCount > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            View cached images ({stats.itemsCount})
          </summary>
          <div className="mt-2 max-h-32 overflow-y-auto bg-white p-2 rounded border">
            {stats.entries.map((url, index) => (
              <div key={index} className="truncate text-gray-500 py-1">
                {url.split('/').pop()}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};
