import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { shouldUseOfflineMode, offlineDatabase, getOfflineAgencySettings } from '@/utils/offlineMode';

interface AgencySettings {
  agency_name: string;
  agency_logo: string;
  current_user_email: string;
}

interface AgencyContextType {
  agencySettings: AgencySettings;
  loading: boolean;
  updateAgencySettings: (settings: Partial<AgencySettings>) => Promise<void>;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (context === undefined) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};

export const AgencyProviderSimplified: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agencySettings, setAgencySettings] = useState<AgencySettings>({
    agency_name: 'TourCompanion',
    agency_logo: '/tourcompanion-logo.png',
    current_user_email: 'user@example.com'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadAgencySettings = async () => {
      try {
        console.log('🏢 [AgencyProviderSimplified] Loading agency settings...');

        // Skip agency settings loading for public client portal routes
        if (window.location.pathname.startsWith('/client/')) {
          console.log('🏢 [AgencyProviderSimplified] Skipping agency settings for public client portal');
          if (isMounted) {
            setAgencySettings({
              agency_name: 'TourCompanion',
              agency_logo: '/tourcompanion-logo.png',
              current_user_email: 'contact@youragency.com'
            });
            setLoading(false);
          }
          return;
        }

        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('⚠️ [AgencyProviderSimplified] Agency settings timeout, using defaults');
            setAgencySettings({
              agency_name: 'TourCompanion',
              agency_logo: '/tourcompanion-logo.png',
              current_user_email: 'contact@youragency.com'
            });
            setLoading(false);
          }
        }, 3000); // 3 second timeout

        // Use offline mode if needed
        if (shouldUseOfflineMode()) {
          console.log('🏢 [AgencyProviderSimplified] Using offline mode');
          if (isMounted) {
            setAgencySettings(getOfflineAgencySettings());
            setLoading(false);
          }
          return;
        }

        // Try to get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.log('🏢 [AgencyProviderSimplified] No user found, using defaults');
          if (isMounted) {
            setAgencySettings({
              agency_name: 'TourCompanion',
              agency_logo: '/tourcompanion-logo.png',
              current_user_email: 'contact@youragency.com'
            });
            setLoading(false);
          }
          return;
        }

        // Try to load user's agency settings from database
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('creators')
            .select('agency_name, agency_logo, contact_email')
            .eq('user_id', user.id)
            .single();

          if (profileData && !profileError) {
            // Use user's custom agency name and logo
            const logoPath = profileData.agency_logo || '/tourcompanion-logo.png';
            console.log('🏢 [AgencyProviderSimplified] Using custom agency settings');
            if (isMounted) {
              setAgencySettings({
                agency_name: profileData.agency_name || 'Your Agency',
                agency_logo: logoPath,
                current_user_email: profileData.contact_email || user.email || 'contact@youragency.com'
              });
            }
          } else {
            // If no profile found, use default values
            console.log('🏢 [AgencyProviderSimplified] No profile found, using defaults');
            if (isMounted) {
              setAgencySettings({
                agency_name: 'TourCompanion',
                agency_logo: '/tourcompanion-logo.png',
                current_user_email: user.email || 'contact@youragency.com'
              });
            }
          }
        } catch (dbError) {
          console.warn('⚠️ [AgencyProviderSimplified] Database error, using defaults:', dbError);
          if (isMounted) {
            setAgencySettings({
              agency_name: 'TourCompanion',
              agency_logo: '/tourcompanion-logo.png',
              current_user_email: user.email || 'contact@youragency.com'
            });
          }
        }

        // Clear timeout if we got here
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

      } catch (error) {
        console.error('❌ [AgencyProviderSimplified] Error loading agency settings:', error);
        // Fallback to default values
        if (isMounted) {
          setAgencySettings({
            agency_name: 'TourCompanion',
            agency_logo: '/tourcompanion-logo.png',
            current_user_email: 'contact@youragency.com'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAgencySettings();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const updateAgencySettings = async (settings: Partial<AgencySettings>) => {
    try {
      // Update local state immediately
      setAgencySettings(prev => ({
        ...prev, 
        ...settings
      }));

      // Try to save to database
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.warn('⚠️ [AgencyProviderSimplified] User not authenticated, skipping database save');
          return;
        }

        const { error } = await supabase
          .from('creators')
          .update({
            agency_name: settings.agency_name,
            contact_email: settings.current_user_email,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.warn('⚠️ [AgencyProviderSimplified] Error saving agency settings:', error);
        } else {
          console.log('✅ [AgencyProviderSimplified] Agency settings saved successfully');
        }
      } catch (dbError) {
        console.warn('⚠️ [AgencyProviderSimplified] Database error during save:', dbError);
      }
    } catch (error) {
      console.error('❌ [AgencyProviderSimplified] Error updating agency settings:', error);
    }
  };

  const value = {
    agencySettings,
    loading,
    updateAgencySettings
  };

  return (
    <AgencyContext.Provider value={value}>
      {children}
    </AgencyContext.Provider>
  );
};
