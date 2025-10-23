/**
 * Authentication Service Layer
 * Centralized authentication operations with proper error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { api } from '../api';
import { db } from '../database';
import { AUTH_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/config';
import type { User } from '@supabase/supabase-js';

// Auth service class
class AuthService {
  /**
   * Get current user session
   */
  async getSession() {
    return api.execute(() => supabase.auth.getSession());
  }

  /**
   * Get current user
   */
  async getUser() {
    return api.execute(() => supabase.auth.getUser());
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, metadata?: any) {
    return api.execute(() =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
    );
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    return api.execute(() =>
      supabase.auth.signInWithPassword({
        email,
        password,
      })
    );
  }

  /**
   * Sign out
   */
  async signOut() {
    return api.execute(() => supabase.auth.signOut());
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    return api.execute(() =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
    );
  }

  /**
   * Update password
   */
  async updatePassword(password: string) {
    return api.execute(() =>
      supabase.auth.updateUser({
        password,
      })
    );
  }

  /**
   * Update user metadata
   */
  async updateUser(updates: { email?: string; data?: any }) {
    return api.execute(() =>
      supabase.auth.updateUser(updates)
    );
  }

  /**
   * Complete sign up with creator profile creation
   */
  async completeSignUp(email: string, password: string, agencyData: {
    agencyName: string;
    contactEmail: string;
    phone?: string;
    website?: string;
  }) {
    try {
      // Step 1: Create auth user
      const authResult = await this.signUp(email, password, {
        agency_name: agencyData.agencyName,
        phone: agencyData.phone,
        website: agencyData.website,
      });

      if (!authResult.success || !authResult.data?.user) {
        return {
          success: false,
          error: authResult.error || ERROR_MESSAGES.auth,
          data: null,
        };
      }

      const user = authResult.data.user;

      // Step 2: Create creator profile (if email is confirmed)
      if (user.email_confirmed_at) {
        const creatorResult = await db.createCreator({
          user_id: user.id,
          agency_name: agencyData.agencyName,
          contact_email: agencyData.contactEmail,
          phone: agencyData.phone || null,
          website: agencyData.website || null,
          agency_logo: '/tourcompanion-logo.png',
          subscription_plan: 'basic',
          subscription_status: 'active',
        });

        if (!creatorResult.success) {
          return {
            success: false,
            error: creatorResult.error || 'Failed to create creator profile',
            data: null,
          };
        }
      }

      return {
        success: true,
        error: null,
        data: authResult.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.unknown,
        data: null,
      };
    }
  }

  /**
   * Complete sign in with creator profile validation and JWT token generation
   */
  async completeSignIn(email: string, password: string) {
    try {
      // Step 1: Sign in
      const authResult = await this.signIn(email, password);

      if (!authResult.success || !authResult.data?.user) {
        return {
          success: false,
          error: authResult.error || ERROR_MESSAGES.auth,
          data: null,
        };
      }

      const user = authResult.data.user;

      // Step 2: Check if creator profile exists
      const creatorResult = await db.getCreator(user.id);

      if (!creatorResult.success || !creatorResult.data) {
        // If no profile found, try to create one (user might have confirmed email)
        if (user.email_confirmed_at) {
          const createResult = await db.createCreator({
            user_id: user.id,
            agency_name: user.user_metadata?.agency_name || 'My Agency',
            contact_email: user.email || '',
            subscription_plan: 'basic',
            subscription_status: 'active',
          });

          if (!createResult.success) {
            // Sign out if profile creation fails
            await this.signOut();
            return {
              success: false,
              error: 'Account setup failed. Please contact support.',
              data: null,
            };
          }
        } else {
          // Sign out if email not confirmed
          await this.signOut();
          return {
            success: false,
            error: 'Email confirmation required. Please check your email and click the confirmation link before signing in.',
            data: null,
          };
        }
      }

      // Step 3: Generate JWT token with subscription info
      const jwtToken = await this.generateJWTToken(user.id);

      return {
        success: true,
        error: null,
        data: {
          ...authResult.data,
          jwtToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.unknown,
        data: null,
      };
    }
  }

  /**
   * Generate JWT token for authenticated user
   */
  async generateJWTToken(userId: string): Promise<string> {
    try {
      // Get creator info for token payload
      const creatorResult = await db.getCreator(userId);
      
      if (!creatorResult.success || !creatorResult.data) {
        throw new Error('Creator profile not found');
      }

      const creator = creatorResult.data;
      
      // Import JWT generation function from backend
      const { generateToken } = await import('../../backend/middleware/auth.js');
      
      return generateToken(userId, {
        subscriptionStatus: creator.subscription_status,
        isTester: creator.is_tester,
        plan: creator.subscription_plan,
      });
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const result = await this.getSession();
    return result.success && !!result.data?.session;
  }

  /**
   * Get current user with creator profile
   */
  async getCurrentUserWithProfile() {
    try {
      const userResult = await this.getUser();
      
      if (!userResult.success || !userResult.data?.user) {
        return {
          success: false,
          error: 'No authenticated user',
          data: null,
        };
      }

      const creatorResult = await db.getCreator(userResult.data.user.id);
      
      return {
        success: true,
        error: null,
        data: {
          user: userResult.data.user,
          creator: creatorResult.data,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.unknown,
        data: null,
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Refresh session
   */
  async refreshSession() {
    return api.execute(() => supabase.auth.refreshSession());
  }
}

// Create singleton instance
export const auth = new AuthService();

// Export types
export type { User };

