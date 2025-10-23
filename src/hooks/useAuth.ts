import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { devSignIn, checkDevSession, getDevUser } from '@/services/auth/dev-auth';
import { isDevMode } from '@/config/dev-mode';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Skip auto-login for public client portal routes
        if (window.location.pathname.startsWith('/client/')) {
          console.log('🔧 [useAuth] Skipping auto-login for public client portal');
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
          return;
        }

        // Use development session check if in dev mode
        if (isDevMode()) {
          const hasSession = await checkDevSession();
          let user = hasSession ? await getDevUser() : null;
          
          // Auto-login test user in development mode if no session
          if (!user && import.meta.env.DEV) {
            console.log('🔧 Dev mode: Auto-logging in test user...');
            const result = await devSignIn('samirechchttioui@gmail.com', 'test123456');
            if (result.success && result.data) {
              user = result.data.user;
              console.log('✅ Dev mode: Auto-login successful');
            } else {
              console.error('❌ Dev mode: Auto-login failed:', result.error);
              console.log('🔧 Dev mode: Trying to sign in with Supabase directly...');
              
              // Try to sign in directly with Supabase
              const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: 'samirechchttioui@gmail.com',
                password: 'test123456'
              });
              
              if (authError && import.meta.env.DEV) {
                console.error('❌ Dev mode: Direct Supabase sign-in failed:', authError.message);
                console.log('🔧 Dev mode: Creating mock user for testing...');
                user = {
                  id: 'fdc63ea1-081c-4ade-8097-ca6d4b4ba258',
                  email: 'samirechchttioui@gmail.com',
                  app_metadata: { provider: 'email' },
                  user_metadata: { full_name: 'Samir Echchttioui', is_developer: true },
                  aud: 'authenticated',
                  created_at: new Date().toISOString(),
                  role: 'authenticated',
                  updated_at: new Date().toISOString(),
                  email_confirmed_at: new Date().toISOString(),
                  phone_confirmed_at: null,
                  last_sign_in_at: new Date().toISOString(),
                  confirmed_at: new Date().toISOString(),
                  factors: null,
                };
                console.log('✅ Dev mode: Mock user created with ID:', user.id);
                console.log('⚠️ Dev mode: Using mock user - RLS policies may not work properly');
              } else {
                user = authData.user;
                console.log('✅ Dev mode: Direct Supabase sign-in successful');
              }
            }
          }
          
          setAuthState({
            user,
            loading: false,
            error: null,
          });
          return;
        }

        // Regular Supabase session check
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
          return;
        }

        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: { message: errorMessage } };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Use development authentication if in dev mode
      if (isDevMode()) {
        const result = await devSignIn(email, password);
        
        if (!result.success) {
          setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Sign in failed' }));
          return { data: null, error: { message: result.error || 'Sign in failed' } };
        }

        setAuthState(prev => ({ ...prev, loading: false }));
        return { data: result.data, error: null };
      }

      // Regular Supabase authentication
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: { message: errorMessage } };
    }
  };


  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
};
