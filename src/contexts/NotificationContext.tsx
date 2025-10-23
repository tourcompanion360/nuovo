import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { isValidRequest, isValidChatbotRequest, isValidLead } from '../utils/notificationUtils';

export interface Notification {
  id: string;
  type: 'request' | 'chatbot_request' | 'lead' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load notifications from localStorage on mount
  // Clear all notifications and start fresh
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('[NotificationProvider] Clearing all notifications for user:', user.id);
    
    // Clear all notification data from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('notifications_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Set empty notifications array
    setNotifications([]);
    
    console.log('[NotificationProvider] All notifications cleared');
  }, [user?.id]);


  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user?.id && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      created_at: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
      variant: newNotification.priority === 'urgent' ? 'destructive' : 'default',
    });

    // Play notification sound (if supported)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
      });
    }
  }, [toast]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    console.log('[NotificationProvider] Manually clearing all notifications');
    setNotifications([]);
    // Also clear from localStorage
    if (user?.id) {
      localStorage.removeItem(`notifications_${user.id}`);
    }
    // Clear ALL notification data from localStorage (for all users)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('notifications_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('[NotificationProvider] All notifications cleared manually');
  }, [user?.id]);

  // Set up real-time subscriptions for client requests
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Skip notification setup for public client portal routes
    if (window.location.pathname.startsWith('/client/')) {
      console.log('[NotificationProvider] Skipping notification setup for public client portal');
      return;
    }

    console.log('[NotificationProvider] Setting up notifications for user:', user.id);

    // Listen to ALL request inserts - simple and direct
    const requestsChannel = supabase
      .channel('requests-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requests',
        },
        async (payload) => {
          console.log('NEW REQUEST DETECTED:', payload.new);
          
          const request = payload.new;
          
          // Get the project and check if it belongs to this user
          const { data: project } = await supabase
            .from('projects')
            .select(`
              id,
              end_clients!inner(
                creator_id,
                creators!inner(user_id)
              )
            `)
            .eq('id', request.project_id)
            .single();

          if (!project) {
            console.log('Project not found for request');
            return;
          }

          const creatorUserId = project.end_clients?.creators?.user_id;
          if (creatorUserId !== user.id) {
            console.log('Request not for this creator');
            return;
          }

          // Create notification immediately
          addNotification({
            type: 'request',
            title: 'New Client Request',
            message: `${request.title} - ${request.description}`,
            data: {
              requestId: request.id,
              projectId: request.project_id,
              clientId: request.end_client_id,
            },
            priority: 'medium',
          });

          console.log('✅ NOTIFICATION CREATED FOR REQUEST:', request.title);
        }
      )
      .subscribe();


    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('[NotificationProvider] Cleaning up real-time subscriptions');
      supabase.removeChannel(requestsChannel);
    };
  }, [user?.id, addNotification]);


  // Add test function to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testNotification = () => {
        console.log('[NotificationProvider] Manual test notification triggered');
        addNotification({
          type: 'request',
          title: 'Test Notification',
          message: 'This is a test notification to verify the system works',
          data: { test: true },
          priority: 'medium',
        });
      };
    }
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
