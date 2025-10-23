import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SyncStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

interface UseDataSyncOptions {
  userId?: string | null;
  projectId?: string;
  onUpdate?: () => void;
  debounceMs?: number;
  enableLogging?: boolean;
}

interface UseDataSyncReturn {
  syncStatus: SyncStatus;
  forceRefresh: () => void;
  lastUpdate: Date | null;
  error: string | null;
}

export function useDataSync({
  userId,
  projectId,
  onUpdate,
  debounceMs = 1000,
  enableLogging = false
}: UseDataSyncOptions): UseDataSyncReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const log = useCallback((message: string, data?: any) => {
    if (enableLogging) {
      console.log(`[DataSync] ${message}`, data || '');
    }
  }, [enableLogging]);

  const debouncedUpdate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      log('Triggering debounced update');
      setLastUpdate(new Date());
      onUpdate?.();
    }, debounceMs);
  }, [onUpdate, debounceMs, log]);

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      log('Max reconnection attempts reached');
      setSyncStatus('error');
      setError('Connection failed after multiple attempts');
      return;
    }

    reconnectAttempts.current += 1;
    log(`Attempting reconnection (${reconnectAttempts.current}/${maxReconnectAttempts})`);
    
    setSyncStatus('connecting');
    
    reconnectTimeoutRef.current = setTimeout(() => {
      // Reconnect logic will be handled by the useEffect
      setSyncStatus('disconnected');
    }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
  }, [log]);

  const setupSubscriptions = useCallback(() => {
    if (!userId) {
      log('No userId provided, skipping subscriptions');
      return;
    }

    log('Setting up real-time subscriptions', { userId, projectId });
    setSyncStatus('connecting');
    setError(null);

    // Create channel name based on context
    const channelName = projectId 
      ? `data-sync-${userId}-${projectId}` 
      : `data-sync-${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        (payload) => {
          log('Request change detected', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          log('Project change detected', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
        },
        (payload) => {
          log('Asset change detected', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          log('Analytics change detected', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'end_clients',
        },
        (payload) => {
          log('Client change detected', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbots',
        },
        (payload) => {
          log('Chatbot change detected', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          log('Lead change detected', payload);
          debouncedUpdate();
        }
      )
      .subscribe((status) => {
        log('Subscription status changed', status);
        
        switch (status) {
          case 'SUBSCRIBED':
            setSyncStatus('connected');
            setError(null);
            reconnectAttempts.current = 0;
            break;
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
            setSyncStatus('error');
            setError('Connection error');
            handleReconnect();
            break;
          case 'CLOSED':
            setSyncStatus('disconnected');
            break;
          default:
            log('Unknown subscription status', status);
        }
      });

    channelRef.current = channel;
  }, [userId, projectId, debouncedUpdate, log, handleReconnect]);

  const forceRefresh = useCallback(() => {
    log('Force refresh triggered');
    setLastUpdate(new Date());
    onUpdate?.();
  }, [onUpdate, log]);

  useEffect(() => {
    setupSubscriptions();

    return () => {
      log('Cleaning up subscriptions');
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [setupSubscriptions, log]);

  // Handle reconnection when status changes to disconnected
  useEffect(() => {
    if (syncStatus === 'disconnected' && userId) {
      const timeout = setTimeout(() => {
        setupSubscriptions();
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [syncStatus, userId, setupSubscriptions]);

  return {
    syncStatus,
    forceRefresh,
    lastUpdate,
    error
  };
}




