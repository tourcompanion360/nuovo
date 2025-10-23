/**
 * Offline Mode Utilities
 * Provides fallback functionality when Supabase is not available
 */

export interface OfflineUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

export interface OfflineAgencySettings {
  agency_name: string;
  agency_logo: string;
  current_user_email: string;
}

// Default offline user for development/demo
export const getOfflineUser = (): OfflineUser => ({
  id: 'offline-user-123',
  email: 'demo@tourcompanion.com',
  created_at: new Date().toISOString(),
  role: 'authenticated'
});

// Default offline agency settings
export const getOfflineAgencySettings = (): OfflineAgencySettings => ({
  agency_name: 'TourCompanion Demo',
  agency_logo: '/tourcompanion-logo.png',
  current_user_email: 'demo@tourcompanion.com'
});

// Check if we should use offline mode
export const shouldUseOfflineMode = (): boolean => {
  // Use offline mode if:
  // 1. We're in development mode
  // 2. Supabase URL is not configured
  // 3. We're on a client portal route (public access)
  const isDev = import.meta.env.DEV;
  const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const isClientPortal = window.location.pathname.startsWith('/client/');
  
  return isDev || !hasSupabaseUrl || isClientPortal;
};

// Simulate a delay for offline operations
export const simulateOfflineDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Offline authentication functions
export const offlineAuth = {
  async signIn(email: string, password: string) {
    await simulateOfflineDelay();
    
    if (email === 'demo@tourcompanion.com' && password === 'demo123') {
      return {
        data: {
          user: getOfflineUser(),
          session: {
            user: getOfflineUser(),
            access_token: 'offline-token',
            refresh_token: 'offline-refresh-token'
          }
        },
        error: null
      };
    }
    
    return {
      data: null,
      error: { message: 'Invalid credentials. Use demo@tourcompanion.com / demo123' }
    };
  },

  async signUp(email: string, password: string) {
    await simulateOfflineDelay();
    
    return {
      data: {
        user: getOfflineUser(),
        session: null
      },
      error: null
    };
  },

  async signOut() {
    await simulateOfflineDelay();
    return { error: null };
  },

  async getSession() {
    await simulateOfflineDelay();
    
    return {
      data: {
        session: {
          user: getOfflineUser(),
          access_token: 'offline-token',
          refresh_token: 'offline-refresh-token'
        }
      },
      error: null
    };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Simulate auth state change
    setTimeout(() => {
      callback('SIGNED_IN', {
        user: getOfflineUser(),
        access_token: 'offline-token'
      });
    }, 1000);

    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
};

// Offline database functions
export const offlineDatabase = {
  async from(table: string) {
    return {
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            await simulateOfflineDelay();
            
            if (table === 'creators') {
              return {
                data: {
                  id: 'offline-creator-123',
                  user_id: 'offline-user-123',
                  agency_name: 'TourCompanion Demo',
                  agency_logo: '/tourcompanion-logo.png',
                  contact_email: 'demo@tourcompanion.com'
                },
                error: null
              };
            }
            
            return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
          }
        })
      }),
      
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: async (callback: (result: any) => void) => {
            await simulateOfflineDelay();
            callback({ error: null });
          }
        })
      })
    };
  },

  async rpc(functionName: string, params: any) {
    await simulateOfflineDelay();
    
    if (functionName === 'check_user_admin_status') {
      return {
        data: false, // Demo user is not admin
        error: null
      };
    }
    
    return {
      data: null,
      error: { message: 'RPC function not available in offline mode' }
    };
  }
};

// Log offline mode status
export const logOfflineModeStatus = () => {
  const isOffline = shouldUseOfflineMode();
  console.log(`🔌 [OfflineMode] ${isOffline ? 'ENABLED' : 'DISABLED'}`);
  
  if (isOffline) {
    console.log('🔌 [OfflineMode] Using offline authentication and database');
    console.log('🔌 [OfflineMode] Demo credentials: demo@tourcompanion.com / demo123');
  }
};
