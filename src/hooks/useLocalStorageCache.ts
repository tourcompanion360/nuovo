import { useState, useEffect, useCallback } from 'react';

// Local storage cache for user preferences and frequently accessed data
export const useLocalStorageCache = <T>(
  key: string,
  initialValue: T,
  ttl: number = 24 * 60 * 60 * 1000 // 24 hours default
) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Check if data is expired
        if (parsed.timestamp && Date.now() - parsed.timestamp < ttl) {
          return parsed.value;
        } else {
          // Remove expired data
          window.localStorage.removeItem(key);
        }
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Store with timestamp for TTL
      const item = {
        value: valueToStore,
        timestamp: Date.now(),
      };
      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

// Specific cache hooks for common B2B dashboard data
export const useUserPreferencesCache = () => {
  return useLocalStorageCache('user-preferences', {
    theme: 'light',
    sidebarCollapsed: false,
    defaultView: 'overview',
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    dashboard: {
      itemsPerPage: 10,
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
  });
};

export const useDashboardSettingsCache = () => {
  return useLocalStorageCache('dashboard-settings', {
    selectedClients: [] as string[],
    selectedProjects: [] as string[],
    dateRange: '30d',
    viewMode: 'grid',
    filters: {
      status: 'all',
      priority: 'all',
      type: 'all',
    },
  });
};

export const useRecentSearchesCache = () => {
  return useLocalStorageCache('recent-searches', [] as string[], 7 * 24 * 60 * 60 * 1000); // 7 days
};

export const useFormDataCache = () => {
  return useLocalStorageCache('form-data', {} as Record<string, any>, 60 * 60 * 1000); // 1 hour
};

// Cache for frequently accessed static data
export const useStaticDataCache = () => {
  return useLocalStorageCache('static-data', {
    countries: [],
    timezones: [],
    currencies: [],
    languages: [],
  }, 7 * 24 * 60 * 60 * 1000); // 7 days
};

