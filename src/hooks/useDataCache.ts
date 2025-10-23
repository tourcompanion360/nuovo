// Data caching hook for improved performance
import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseDataCacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number; // Maximum cache size (default: 100 entries)
}

export function useDataCache<T>(options: UseDataCacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options;
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());

  // Clean expired entries
  const cleanExpired = useCallback(() => {
    const now = Date.now();
    setCache(prev => {
      const newCache = new Map();
      for (const [key, entry] of prev) {
        if (entry.expiresAt > now) {
          newCache.set(key, entry);
        }
      }
      return newCache;
    });
  }, []);

  // Get data from cache
  const get = useCallback((key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (entry.expiresAt <= Date.now()) {
      // Expired, remove from cache
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }
    
    return entry.data;
  }, [cache]);

  // Set data in cache
  const set = useCallback((key: string, data: T) => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    setCache(prev => {
      const newCache = new Map(prev);
      
      // Remove oldest entries if cache is full
      if (newCache.size >= maxSize) {
        const entries = Array.from(newCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toRemove = entries.slice(0, Math.floor(maxSize * 0.1)); // Remove 10%
        toRemove.forEach(([key]) => newCache.delete(key));
      }
      
      newCache.set(key, entry);
      return newCache;
    });
  }, [ttl, maxSize]);

  // Clear cache
  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  // Clear specific key
  const clearKey = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  // Clean expired entries periodically
  useEffect(() => {
    const interval = setInterval(cleanExpired, 60000); // Clean every minute
    return () => clearInterval(interval);
  }, [cleanExpired]);

  return {
    get,
    set,
    clear,
    clearKey,
    size: cache.size,
  };
}


