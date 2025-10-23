/**
 * Development Authentication Service
 * Simplified auth for development mode that bypasses complex JWT generation
 */

import { supabase } from '@/integrations/supabase/client';
import { canBypassSubscription } from '@/config/dev-mode';

export interface DevAuthResult {
  success: boolean;
  error?: string;
  data?: {
    user: any;
    jwtToken?: string;
  };
}

/**
 * Simplified sign in for development mode
 */
export const devSignIn = async (email: string, password: string): Promise<DevAuthResult> => {
  try {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'No user returned from authentication',
      };
    }

    // In dev mode, create a simple JWT-like token
    const devToken = canBypassSubscription() 
      ? `dev_token_${data.user.id}_${Date.now()}`
      : null;

    // Store the token in localStorage for development
    if (devToken) {
      localStorage.setItem('jwt_token', devToken);
    }

    return {
      success: true,
      data: {
        user: data.user,
        jwtToken: devToken,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check if user has a valid dev session
 */
export const checkDevSession = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error('Error checking dev session:', error);
    return false;
  }
};

/**
 * Get current dev user
 */
export const getDevUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting dev user:', error);
    return null;
  }
};


