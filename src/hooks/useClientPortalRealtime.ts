import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

interface UseClientPortalRealtimeOptions {
  projectId: string;
  onUpdate: () => void;
  debounceMs?: number;
  enableLogging?: boolean;
}

interface UseClientPortalRealtimeReturn {
  connectionStatus: ConnectionStatus;
  lastUpdate: Date | null;
  error: string | null;
  forceRefresh: () => void;
}

/**
 * Enhanced hook to subscribe to real-time updates for a client portal
 * When the creator changes projects, assets, requests, or chatbots,
 * the client portal will automatically refresh with debouncing and connection monitoring
 */
export function useClientPortalRealtime({
  projectId,
  onUpdate,
  debounceMs = 1000,
  enableLogging = false
}: UseClientPortalRealtimeOptions): UseClientPortalRealtimeReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const log = useCallback((message: string, data?: any) => {
    if (enableLogging) {
      console.log(`[ClientPortalRealtime] ${message}`, data || '');
    }
  }, [enableLogging]);

  const debouncedUpdate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      log('Triggering debounced update');
      setLastUpdate(new Date());
      onUpdate();
    }, debounceMs);
  }, [onUpdate, debounceMs, log]);

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      log('Max reconnection attempts reached');
      setConnectionStatus('error');
      setError('Connection failed after multiple attempts');
      return;
    }

    reconnectAttempts.current += 1;
    log(`Attempting reconnection (${reconnectAttempts.current}/${maxReconnectAttempts})`);
    
    setConnectionStatus('connecting');
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionStatus('disconnected');
    }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
  }, [log]);

  const forceRefresh = useCallback(() => {
    log('Force refresh triggered');
    setLastUpdate(new Date());
    onUpdate();
  }, [onUpdate, log]);

  useEffect(() => {
    if (!projectId) return;

    log('Setting up client portal real-time subscriptions', { projectId });
    setConnectionStatus('connecting');
    setError(null);

    const channel = supabase
      .channel(`client-portal-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          log('Project updated', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          log('Assets updated', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbots',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          log('Chatbot updated', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          log('Requests updated', payload);
          debouncedUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          log('Analytics updated', payload);
          debouncedUpdate();
        }
      )
      .subscribe((status) => {
        log('Subscription status changed', status);
        
        switch (status) {
          case 'SUBSCRIBED':
            setConnectionStatus('connected');
            setError(null);
            reconnectAttempts.current = 0;
            break;
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
            setConnectionStatus('error');
            setError('Connection error');
            handleReconnect();
            break;
          case 'CLOSED':
            setConnectionStatus('disconnected');
            break;
          default:
            log('Unknown subscription status', status);
        }
      });

    channelRef.current = channel;

    return () => {
      log('Cleaning up client portal subscriptions');
      
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
  }, [projectId, debouncedUpdate, log, handleReconnect]);

  // Handle reconnection when status changes to disconnected
  useEffect(() => {
    if (connectionStatus === 'disconnected' && projectId) {
      const timeout = setTimeout(() => {
        log('Attempting reconnection after disconnect');
        setConnectionStatus('connecting');
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [connectionStatus, projectId, log]);

  return {
    connectionStatus,
    lastUpdate,
    error,
    forceRefresh
  };
}

// Legacy function for backward compatibility
export function useClientPortalRealtimeLegacy(projectId: string, onUpdate: () => void) {
  const { forceRefresh } = useClientPortalRealtime({
    projectId,
    onUpdate,
    enableLogging: true
  });
  
  return { forceRefresh };
}



