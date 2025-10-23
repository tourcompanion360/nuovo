import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { shouldUseOfflineMode, offlineAuth, logOfflineModeStatus } from '@/utils/offlineMode';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Simplified and robust useAuth hook
export const useAuthSimplified = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🔐 [useAuthSimplified] Initializing authentication...');
        logOfflineModeStatus();

        // Skip auto-login for public client portal routes
        if (window.location.pathname.startsWith('/client/')) {
          console.log('🔐 [useAuthSimplified] Skipping auth for public client portal');
          if (isMounted) {
            setAuthState({
              user: null,
              loading: false,
              error: null,
            });
          }
          return;
        }

        // Use offline mode if needed
        if (shouldUseOfflineMode()) {
          console.log('🔐 [useAuthSimplified] Using offline authentication');
          const { data, error } = await offlineAuth.getSession();
          
          if (isMounted) {
            setAuthState({
              user: data?.session?.user || null,
              loading: false,
              error: error?.message || null,
            });
          }
          return;
        }

        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('⚠️ [useAuthSimplified] Auth initialization timeout, using fallback');
            setAuthState({
              user: null,
              loading: false,
              error: 'Authentication timeout - please try again',
            });
          }
        }, 8000); // 8 second timeout

        // Try to get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [useAuthSimplified] Error getting session:', error);
          if (isMounted) {
            setAuthState({
              user: null,
              loading: false,
              error: error.message,
            });
          }
          return;
        }

        if (session?.user) {
          console.log('✅ [useAuthSimplified] User authenticated:', session.user.email);
          if (isMounted) {
            setAuthState({
              user: session.user,
              loading: false,
              error: null,
            });
          }
        } else {
          console.log('ℹ️ [useAuthSimplified] No active session');
          if (isMounted) {
            setAuthState({
              user: null,
              loading: false,
              error: null,
            });
          }
        }

        // Clear timeout if we got here
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

      } catch (error) {
        console.error('❌ [useAuthSimplified] Unexpected error:', error);
        if (isMounted) {
          setAuthState({
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [useAuthSimplified] Auth state changed:', event, session?.user?.id);
        
        if (isMounted) {
          setAuthState({
            user: session?.user || null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Use offline mode if needed
      if (shouldUseOfflineMode()) {
        const { data, error } = await offlineAuth.signIn(email, password);
        
        if (error) {
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
          return { data: null, error };
        }

        setAuthState(prev => ({ ...prev, loading: false }));
        return { data, error: null };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { data: null, error };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: { message: errorMessage } };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { data: null, error };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: { message: errorMessage } };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: { message: errorMessage } };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
};
