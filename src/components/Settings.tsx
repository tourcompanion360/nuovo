import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Building, 
  CreditCard, 
  Shield, 
  Link, 
  Calendar,
  Settings as SettingsIcon,
  Upload,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  Globe,
  MapPin,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAgency } from '@/contexts/AgencyContext';
import { supabase } from '@/integrations/supabase/client';
import { TEXT } from '@/constants/text';
import { useNavigate } from 'react-router-dom';

interface ProfileSettings {
  agency_name: string;
  agency_logo: string;
  contact_email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
}

interface IntegrationSettings {
  google_calendar: boolean;
  realsee_oauth: boolean;
  stripe_connected: boolean;
  webhook_url: string;
}


const Settings: React.FC = () => {
  const { toast } = useToast();
  const { agencySettings, updateAgencySettings } = useAgency();
  const navigate = useNavigate();
  
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    agency_name: agencySettings.agency_name,
    agency_logo: '/tourcompanion-logo.png', // Always TourCompanion logo
    contact_email: agencySettings.current_user_email,
    phone: '',
    website: '',
    address: '',
    description: ''
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    google_calendar: false,
    realsee_oauth: false,
    stripe_connected: false,
    webhook_url: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{ plan: 'basic' | 'pro' | null; status: string | null; isTester: boolean; }>({ plan: null, status: null, isTester: false });

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Load profile settings from creators table
      const { data: profileData, error: profileError } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData && !profileError) {
        setProfileSettings({
          agency_name: profileData.agency_name || '',
          agency_logo: '/tourcompanion-logo.png', // Always TourCompanion logo
          contact_email: profileData.contact_email || user.email || '',
          phone: profileData.phone || '',
          website: profileData.website || '',
          address: profileData.address || '',
          description: profileData.description || ''
        });
      } else {
        console.error('Profile error:', profileError);
        // Set default values if no profile found
        setProfileSettings({
          agency_name: '',
          agency_logo: '/tourcompanion-logo.png', // Always TourCompanion logo
          contact_email: user.email || '',
          phone: '',
          website: '',
          address: '',
          description: ''
        });
      }

      // Load subscription status from backend
      try {
        const token = localStorage.getItem('jwt_token');
        if (token) {
          const res = await fetch('/api/billing/subscription-status', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const sub = await res.json();
          if (sub?.success) {
            setSubscription({ plan: sub.data.plan, status: sub.data.status, isTester: sub.data.isTester });
          }
        }
      } catch (e) {
        console.warn('Unable to load subscription status in settings');
      }

      // Load integration settings (keep existing logic for now)
      const { data: integrationData, error: integrationError } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', 'anonymous')
        .single();

      if (integrationData && !integrationError) {
        setIntegrationSettings(prev => ({ ...prev, ...integrationData }));
      }

    } catch (error) {
      console.error('Error loading settings:', error);
      setError(TEXT.SETTINGS_PAGE.ERROR_SAVING_PROFILE);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_SAVING_PROFILE,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!profileSettings.agency_name.trim()) {
        toast({
          title: TEXT.TOAST.ERROR,
          description: "Agency name is required",
          variant: "destructive"
        });
        return;
      }

      if (!profileSettings.contact_email.trim()) {
        toast({
          title: TEXT.TOAST.ERROR,
          description: "Contact email is required",
          variant: "destructive"
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileSettings.contact_email)) {
        toast({
          title: TEXT.TOAST.ERROR,
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }

      await updateAgencySettings({
        agency_name: profileSettings.agency_name,
        agency_logo: '/tourcompanion-logo.png', // Always keep TourCompanion logo
        current_user_email: profileSettings.contact_email
      });

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Save to creators table
      const { error } = await supabase
        .from('creators')
        .update({
          agency_name: profileSettings.agency_name,
          agency_logo: '/tourcompanion-logo.png', // Always keep TourCompanion logo
          contact_email: profileSettings.contact_email,
          phone: profileSettings.phone,
          website: profileSettings.website,
          address: profileSettings.address,
          description: profileSettings.description,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: TEXT.SETTINGS_PAGE.PROFILE_UPDATED,
        description: TEXT.SETTINGS_PAGE.PROFILE_UPDATED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_SAVING_PROFILE,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIntegrations = async () => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          ...integrationSettings,
          user_id: 'anonymous',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: TEXT.SETTINGS_PAGE.INTEGRATIONS_UPDATED,
        description: TEXT.SETTINGS_PAGE.INTEGRATIONS_UPDATED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error saving integrations:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_SAVING_INTEGRATIONS,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      setIsSaving(true);
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrationSettings(prev => ({ ...prev, google_calendar: true }));
      
      toast({
        title: TEXT.SETTINGS_PAGE.GOOGLE_CALENDAR_CONNECTED,
        description: TEXT.SETTINGS_PAGE.GOOGLE_CALENDAR_CONNECTED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_CONNECTING_GOOGLE,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectRealsee = async () => {
    try {
      setIsSaving(true);
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrationSettings(prev => ({ ...prev, realsee_oauth: true }));
      
      toast({
        title: TEXT.SETTINGS_PAGE.REALSEE_CONNECTED,
        description: TEXT.SETTINGS_PAGE.REALSEE_CONNECTED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error connecting Realsee:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_CONNECTING_REALSEE,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setIsSaving(true);
      
      // Simulate Stripe connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrationSettings(prev => ({ ...prev, stripe_connected: true }));
      
      toast({
        title: TEXT.SETTINGS_PAGE.STRIPE_CONNECTED,
        description: TEXT.SETTINGS_PAGE.STRIPE_CONNECTED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_CONNECTING_STRIPE,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.SETTINGS_PAGE.SETTINGS}</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.SETTINGS_PAGE.MANAGE_ACCOUNT}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.SETTINGS_PAGE.SETTINGS}</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.SETTINGS_PAGE.MANAGE_ACCOUNT}</p>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-destructive mb-2">{error}</div>
              <Button onClick={loadSettings} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.SETTINGS_PAGE.SETTINGS}</h1>
        <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.SETTINGS_PAGE.MANAGE_ACCOUNT}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">{TEXT.SETTINGS_PAGE.PROFILE}</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs sm:text-sm">{TEXT.SETTINGS_PAGE.BILLING}</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">{TEXT.SETTINGS_PAGE.INTEGRATIONS}</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          {/* Required Fields Notice */}
          {!profileSettings.contact_email.trim() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-medium text-red-800">Required Information Missing</h3>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Please provide your contact email address. This is required for support requests and account management.
              </p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {TEXT.SETTINGS_PAGE.AGENCY_PROFILE}
              </CardTitle>
              <CardDescription>
                {TEXT.SETTINGS_PAGE.MANAGE_AGENCY_INFO}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="agency_name">{TEXT.SETTINGS_PAGE.AGENCY_NAME} *</Label>
                  <Input
                    id="agency_name"
                    value={profileSettings.agency_name}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, agency_name: e.target.value }))}
                    placeholder={TEXT.SETTINGS_PAGE.ENTER_AGENCY_NAME}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email" className="text-red-600 font-medium">
                    {TEXT.SETTINGS_PAGE.CONTACT_EMAIL} *
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={profileSettings.contact_email}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder={TEXT.SETTINGS_PAGE.ENTER_CONTACT_EMAIL}
                    className={!profileSettings.contact_email.trim() ? "border-red-300 focus:border-red-500" : ""}
                    required
                  />
                  {!profileSettings.contact_email.trim() && (
                    <p className="text-sm text-red-600">Contact email is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{TEXT.SETTINGS_PAGE.PHONE}</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={TEXT.SETTINGS_PAGE.ENTER_PHONE}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{TEXT.SETTINGS_PAGE.WEBSITE}</Label>
        <Input
          id="website"
          value={profileSettings.website}
          onChange={(e) => setProfileSettings(prev => ({ ...prev, website: e.target.value }))}
          placeholder={TEXT.SETTINGS_PAGE.ENTER_WEBSITE}
          className="input-safe"
        />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <img 
                    src="/tourcompanion-logo.png" 
                    alt="TourCompanion Logo" 
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <p className="text-sm font-medium">TourCompanion Logo</p>
                    <p className="text-xs text-muted-foreground">This logo cannot be changed</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{TEXT.SETTINGS_PAGE.ADDRESS}</Label>
                <Textarea
                  id="address"
                  value={profileSettings.address}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={TEXT.SETTINGS_PAGE.ENTER_ADDRESS}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{TEXT.SETTINGS_PAGE.DESCRIPTION}</Label>
                <Textarea
                  id="description"
                  value={profileSettings.description}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={TEXT.SETTINGS_PAGE.ENTER_DESCRIPTION}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving || !profileSettings.agency_name.trim() || !profileSettings.contact_email.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    {TEXT.SETTINGS_PAGE.SAVE_PROFILE}
                  </>
                )}
              </Button>
              {(!profileSettings.agency_name.trim() || !profileSettings.contact_email.trim()) && (
                <p className="text-sm text-muted-foreground">
                  Please fill in all required fields (marked with *) to save your profile.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing & Subscription */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {TEXT.SETTINGS_PAGE.BILLING_SUBSCRIPTION}
              </CardTitle>
              <CardDescription>
                {TEXT.SETTINGS_PAGE.MANAGE_SUBSCRIPTION}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{TEXT.SETTINGS_PAGE.CURRENT_PLAN}</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription.plan === 'pro' ? 'Pro' : 'Free'}
                  </p>
                </div>
                <Badge variant={(subscription.plan === 'pro' ? subscription.status === 'active' : true) ? 'default' : 'outline'}>
                  {subscription.plan === 'pro'
                    ? (subscription.status ? subscription.status : 'Inactive')
                    : 'Active'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('jwt_token');
                      if (!token) {
                        toast({ title: 'Sign in required', description: 'Please sign in to manage billing', variant: 'destructive' });
                        return;
                      }
                      const res = await fetch('/api/billing/customer-portal', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                      });
                      const data = await res.json();
                      if (data?.success && data.data?.url) {
                        window.open(data.data.url, '_blank');
                      } else {
                        toast({ title: 'Billing portal unavailable', description: data?.error || 'Try again later', variant: 'destructive' });
                      }
                    } catch (e) {
                      toast({ title: 'Billing portal error', description: 'Unable to open billing portal', variant: 'destructive' });
                    }
                  }}
                  disabled={!subscription.plan}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {TEXT.SETTINGS_PAGE.MANAGE_PAYMENT_METHODS}
                </Button>
                <Button
                  variant="outline"
                  className="h-20"
                  onClick={() => navigate('/billing')}
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  {TEXT.SETTINGS_PAGE.VIEW_BILLING_HISTORY}
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{TEXT.SETTINGS_PAGE.USAGE_THIS_MONTH}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{TEXT.SETTINGS_PAGE.PROJECTS}</span>
                    <span className="text-muted-foreground">Plan limit applies</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{TEXT.SETTINGS_PAGE.STORAGE}</span>
                    <span className="text-muted-foreground">Real-time data</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{TEXT.SETTINGS_PAGE.API_CALLS}</span>
                    <span className="text-muted-foreground">Real-time data</span>
                  </div>
                </div>
              </div>

              {subscription.plan === 'basic' && (
                <div className="flex justify-end">
                  <Button onClick={() => navigate('/pricing')}>
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                {TEXT.SETTINGS_PAGE.INTEGRATIONS_TITLE}
              </CardTitle>
              <CardDescription>
                {TEXT.SETTINGS_PAGE.CONNECT_SERVICES}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{TEXT.SETTINGS_PAGE.GOOGLE_CALENDAR}</h3>
                      <p className="text-sm text-muted-foreground">{TEXT.SETTINGS_PAGE.SYNC_APPOINTMENTS}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.google_calendar ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {TEXT.SETTINGS_PAGE.CONNECTED}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={handleConnectGoogleCalendar} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : TEXT.SETTINGS_PAGE.CONNECT}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium">{TEXT.SETTINGS_PAGE.REALSEE_OAUTH}</h3>
                      <p className="text-sm text-muted-foreground">{TEXT.SETTINGS_PAGE.SECURE_CONNECTION}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.realsee_oauth ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {TEXT.SETTINGS_PAGE.CONNECTED}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={handleConnectRealsee} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : TEXT.SETTINGS_PAGE.CONNECT}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-medium">{TEXT.SETTINGS_PAGE.STRIPE}</h3>
                      <p className="text-sm text-muted-foreground">{TEXT.SETTINGS_PAGE.PAYMENT_PROCESSING}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.stripe_connected ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {TEXT.SETTINGS_PAGE.CONNECTED}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={handleConnectStripe} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : TEXT.SETTINGS_PAGE.CONNECT}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_url">{TEXT.SETTINGS_PAGE.WEBHOOK_URL}</Label>
                <Input
                  id="webhook_url"
                  value={integrationSettings.webhook_url}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder={TEXT.SETTINGS_PAGE.ENTER_WEBHOOK_URL}
                />
              </div>

              <Button onClick={handleSaveIntegrations} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    {TEXT.SETTINGS_PAGE.SAVE_INTEGRATIONS}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default Settings;