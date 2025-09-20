// components/OptimizedImage.tsx - React component for cached images
import React, { useState, useEffect } from 'react';
import { imageCache } from '../utils/imageCache';

// Custom hook for using cached images
export const useCachedImage = (originalUrl: string | null) => {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originalUrl) {
      setCachedUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    imageCache
      .getImage(originalUrl)
      .then(url => {
        setCachedUrl(url);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load cached image:', err);
        setError(err.message);
        setCachedUrl(originalUrl);
        setLoading(false);
      });

    return () => {
      if (cachedUrl && cachedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cachedUrl);
      }
    };
  }, [originalUrl]);

  return { cachedUrl, loading, error };
};

// Props interface for OptimizedImage
interface OptimizedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  lazy?: boolean;
}

// OptimizedImage component with caching
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallback = '/placeholder-image.jpg',
  onLoad,
  onError,
  lazy = true,
}) => {
  const { cachedUrl, loading, error } = useCachedImage(src);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== fallback) {
      target.src = fallback;
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
      >
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={cachedUrl || fallback}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
