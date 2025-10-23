import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Database query result cache for B2B dashboard
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DatabaseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Generate cache key for database queries
  generateKey(table: string, filters: Record<string, any> = {}): string {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        result[key] = filters[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${table}:${JSON.stringify(sortedFilters)}`;
  }
}

// Global cache instance
const dbCache = new DatabaseCache();

// Hook for cached database queries
export const useDatabaseCache = () => {
  const cacheRef = useRef(dbCache);

  const getCachedQuery = useCallback(async <T>(
    table: string,
    queryFn: () => Promise<T>,
    filters: Record<string, any> = {},
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> => {
    const cacheKey = cacheRef.current.generateKey(table, filters);
    
    // Check cache first
    const cachedData = cacheRef.current.get<T>(cacheKey);
    if (cachedData) {
      console.log('📦 [Database Cache] Cache hit:', cacheKey);
      return cachedData;
    }

    // Fetch from database
    console.log('🌐 [Database Cache] Cache miss, fetching:', cacheKey);
    const data = await queryFn();
    
    // Cache the result
    cacheRef.current.set(cacheKey, data, ttl);
    
    return data;
  }, []);

  const invalidateTable = useCallback((table: string) => {
    const keysToDelete: string[] = [];
    for (const key of cacheRef.current['cache'].keys()) {
      if (key.startsWith(`${table}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cacheRef.current.delete(key));
    console.log('🗑️ [Database Cache] Invalidated table:', table);
  }, []);

  const invalidateAll = useCallback(() => {
    cacheRef.current.clear();
    console.log('🗑️ [Database Cache] Cleared all cache');
  }, []);

  return {
    getCachedQuery,
    invalidateTable,
    invalidateAll,
  };
};

// Specific cached query hooks for common operations
export const useCachedClients = (creatorId: string) => {
  const { getCachedQuery, invalidateTable } = useDatabaseCache();

  const fetchClients = useCallback(async () => {
    return getCachedQuery(
      'end_clients',
      async () => {
        const { data, error } = await supabase
          .from('end_clients')
          .select('*')
          .eq('creator_id', creatorId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      { creator_id: creatorId },
      10 * 60 * 1000 // 10 minutes cache
    );
  }, [creatorId, getCachedQuery]);

  const invalidateClients = useCallback(() => {
    invalidateTable('end_clients');
  }, [invalidateTable]);

  return { fetchClients, invalidateClients };
};

export const useCachedProjects = (clientId?: string) => {
  const { getCachedQuery, invalidateTable } = useDatabaseCache();

  const fetchProjects = useCallback(async () => {
    return getCachedQuery(
      'projects',
      async () => {
        let query = supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (clientId) {
          query = query.eq('end_client_id', clientId);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
      },
      clientId ? { end_client_id: clientId } : {},
      5 * 60 * 1000 // 5 minutes cache
    );
  }, [clientId, getCachedQuery]);

  const invalidateProjects = useCallback(() => {
    invalidateTable('projects');
  }, [invalidateTable]);

  return { fetchProjects, invalidateProjects };
};

export const useCachedAnalytics = (projectId: string, dateRange: string = '30d') => {
  const { getCachedQuery, invalidateTable } = useDatabaseCache();

  const fetchAnalytics = useCallback(async () => {
    return getCachedQuery(
      'analytics',
      async () => {
        const { data, error } = await supabase
          .from('analytics')
          .select('*')
          .eq('project_id', projectId)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      { project_id: projectId, date_range: dateRange },
      2 * 60 * 1000 // 2 minutes cache (analytics change frequently)
    );
  }, [projectId, dateRange, getCachedQuery]);

  const invalidateAnalytics = useCallback(() => {
    invalidateTable('analytics');
  }, [invalidateTable]);

  return { fetchAnalytics, invalidateAnalytics };
};

export const useCachedSupportRequests = (creatorId: string) => {
  const { getCachedQuery, invalidateTable } = useDatabaseCache();

  const fetchSupportRequests = useCallback(async () => {
    return getCachedQuery(
      'support_requests',
      async () => {
        const { data, error } = await supabase
          .from('support_requests')
          .select('*')
          .eq('creator_id', creatorId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      { creator_id: creatorId },
      3 * 60 * 1000 // 3 minutes cache
    );
  }, [creatorId, getCachedQuery]);

  const invalidateSupportRequests = useCallback(() => {
    invalidateTable('support_requests');
  }, [invalidateTable]);

  return { fetchSupportRequests, invalidateSupportRequests };
};
