import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agencySettings, setAgencySettings] = useState<AgencySettings>({
    agency_name: 'TourCompanion',
    agency_logo: '/tourcompanion-logo.png',
    current_user_email: 'user@example.com'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgencySettings();
  }, []);

  const loadAgencySettings = async () => {
    try {
      // Skip agency settings loading for public client portal routes
      if (window.location.pathname.startsWith('/client/')) {
        console.log('[AgencyProvider] Skipping agency settings for public client portal');
        setAgencySettings({
          agency_name: 'TourCompanion',
          agency_logo: '/tourcompanion-logo.png',
          current_user_email: 'contact@youragency.com'
        });
        setLoading(false);
        return;
      }

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Agency settings timeout')), 5000); // 5 second timeout
      });

      const loadSettingsPromise = async () => {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          // If no user, use default values
          setAgencySettings({
            agency_name: 'TourCompanion',
            agency_logo: '/tourcompanion-logo.png',
            current_user_email: 'contact@youragency.com'
          });
          return;
        }

        // Load user's agency settings from database
        const { data: profileData, error: profileError } = await supabase
          .from('creators')
          .select('agency_name, agency_logo, contact_email')
          .eq('user_id', user.id)
          .single();

        if (profileData && !profileError) {
          // Use user's custom agency name and logo
          const logoPath = profileData.agency_logo || '/tourcompanion-logo.png';
          console.log('🏢 [AgencyProvider] Setting agency logo:', logoPath);
          setAgencySettings({
            agency_name: profileData.agency_name || 'Your Agency',
            agency_logo: logoPath,
            current_user_email: profileData.contact_email || user.email || 'contact@youragency.com'
          });
        } else {
          // If no profile found, use default values
          console.log('🏢 [AgencyProvider] Using default logo: /tourcompanion-logo.png');
          setAgencySettings({
            agency_name: 'TourCompanion',
            agency_logo: '/tourcompanion-logo.png',
            current_user_email: user.email || 'contact@youragency.com'
          });
        }
      };

      await Promise.race([loadSettingsPromise(), timeoutPromise]);
    } catch (error) {
      console.error('Error loading agency settings:', error);
      // Fallback to default values
      setAgencySettings({
        agency_name: 'TourCompanion',
        agency_logo: '/tourcompanion-logo.png',
        current_user_email: 'contact@youragency.com'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAgencySettings = async (settings: Partial<AgencySettings>) => {
    try {
      // Update local state
      setAgencySettings(prev => ({
        ...prev, 
        ...settings
      }));

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated');
        return;
      }

      // Save to database
      const { error } = await supabase
        .from('creators')
        .update({
          agency_name: settings.agency_name,
          contact_email: settings.current_user_email,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving agency settings:', error);
      }
    } catch (error) {
      console.error('Error updating agency settings:', error);
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
