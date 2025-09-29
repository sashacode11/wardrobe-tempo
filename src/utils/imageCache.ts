// utils/imageCache.ts - Cache logic only (TypeScript, no React components)

interface CacheEntry {
  url: string;
  timestamp: number;
  blob: Blob;
  size: number;
}

class ImageCache {
  private cache = new Map<string, CacheEntry>();
  private maxCacheSize = 100;
  private maxAge = 24 * 60 * 60 * 1000;
  private maxTotalSize = 50 * 1024 * 1024;

  async getImage(url: string): Promise<string> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return URL.createObjectURL(cached.blob);
    }

    if (cached) {
      this.cache.delete(url);
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      this.addToCache(url, blob);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to load image:', error);
      return url;
    }
  }

  private addToCache(url: string, blob: Blob): void {
    this.cleanExpiredEntries();
    this.enforceSize();

    this.cache.set(url, {
      url,
      blob,
      timestamp: Date.now(),
      size: blob.size,
    });
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(url);
      }
    }
  }

  private enforceSize(): void {
    while (
      this.cache.size >= this.maxCacheSize ||
      this.getTotalSize() > this.maxTotalSize
    ) {
      const oldestEntry = this.getOldestEntry();
      if (oldestEntry) {
        this.cache.delete(oldestEntry[0]);
      } else {
        break;
      }
    }
  }

  private getOldestEntry(): [string, CacheEntry] | null {
    let oldest: [string, CacheEntry] | null = null;

    for (const entry of this.cache.entries()) {
      if (!oldest || entry[1].timestamp < oldest[1].timestamp) {
        oldest = entry;
      }
    }

    return oldest;
  }

  private getTotalSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.size;
    }
    return total;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheInfo() {
    return {
      size: this.cache.size,
      totalSize: this.getTotalSize(),
      entries: Array.from(this.cache.keys()),
      maxSize: this.maxCacheSize,
      maxTotalSize: this.maxTotalSize,
    };
  }

  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url =>
      this.getImage(url).catch(err => {
        console.warn('Failed to preload image:', url, err);
      })
    );

    await Promise.all(promises);
  }

  removeFromCache(url: string): boolean {
    const removed = this.cache.delete(url);

    return removed;
  }
}

// Export the global cache instance
export const imageCache = new ImageCache();

// Export utility functions
export const getCacheStats = () => {
  const info = imageCache.getCacheInfo();

  return {
    itemsCount: info.size,
    totalSizeMB: (info.totalSize / (1024 * 1024)).toFixed(2),
    entries: info.entries,
    maxItems: info.maxSize,
    maxSizeMB: (info.maxTotalSize / (1024 * 1024)).toFixed(0),
    utilizationPercent: Math.round((info.size / info.maxSize) * 100),
  };
};

export const clearImageCache = (): void => {
  imageCache.clearCache();
};

export const preloadImages = (urls: string[]) => {
  return imageCache.preloadImages(urls);
};

// Image compression utilities
export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export const compressImage = (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
