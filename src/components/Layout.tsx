import React, { useState, useEffect } from 'react';
import { Camera, BarChart3, Image, HelpCircle, Settings, FileText, Sun, Moon, Menu, X, Share2, GraduationCap, User, Bot, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAgency } from '@/contexts/AgencyContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TEXT } from '@/constants/text';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';
import { useEffect as ReactUseEffect, useState as ReactUseState } from 'react';
import { supabase } from '@/integrations/supabase/client';
interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}
const Layout = ({
  children,
  currentPage,
  onPageChange
}: LayoutProps) => {
  const { toast } = useToast();
  const { agencySettings } = useAgency();
  
  // Debug logging for agency settings
  console.log('🏢 [Layout] Agency settings:', agencySettings);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [adminKeySequence, setAdminKeySequence] = useState<string[]>([]);
  const [logoClickCount, setLogoClickCount] = useState(0);
  
  // Apply light theme on component mount
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }, []);

  // Hidden admin access - Secret key combination: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        navigate('/admin');
        toast({
          title: 'Admin Access',
          description: 'Accessing admin dashboard...',
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toast]);
  
  const navigationItems = [{
    id: 'projects',
    label: TEXT.NAVIGATION.PROJECTS,
    icon: Camera
  }, {
    id: 'client-requests',
    label: TEXT.NAVIGATION.CLIENT_REQUESTS,
    icon: FileText
  }, {
    id: 'media-library',
    label: TEXT.NAVIGATION.MEDIA_LIBRARY,
    icon: Image
  }, {
    id: 'clients',
    label: 'Clients',
    icon: User
  }, {
    id: 'chatbots',
    label: 'Chatbots',
    icon: Bot
  }, {
    id: 'support',
    label: TEXT.NAVIGATION.SUPPORT,
    icon: HelpCircle
  }, {
    id: 'settings',
    label: TEXT.NAVIGATION.SETTINGS,
    icon: Settings
  }];
  
  const toggleTheme = () => {
    setIsLightTheme(!isLightTheme);
    if (isLightTheme) {
      // Switch to dark theme
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      // Switch to light theme
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      navigate('/auth');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMobileMenuClick = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  // Hidden admin access - Click logo 5 times
  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        navigate('/admin');
        toast({
          title: 'Admin Access',
          description: 'Accessing admin dashboard...',
        });
        return 0; // Reset counter
      }
      return newCount;
    });
  };
  return <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-sidebar border-b border-sidebar-border">
        {/* Top row with logo and menu */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={agencySettings.agency_logo} 
              alt={`${agencySettings.agency_name} Logo`} 
              className="w-8 h-8 object-contain cursor-pointer"
              onClick={handleLogoClick}
              onError={(e) => {
                e.currentTarget.src = '/tourcompanion-logo.png';
              }}
            />
            <h1 className="text-xl font-bold text-primary tracking-tight">{agencySettings.agency_name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Bottom row with theme toggle */}
        <div className="px-4 pb-4">
          <Button 
            onClick={toggleTheme} 
            variant="outline"
            className="w-full justify-start"
            title={isLightTheme ? TEXT.THEME.SWITCH_TO_DARK : TEXT.THEME.SWITCH_TO_LIGHT}
          >
            {isLightTheme ? <Moon size={18} className="mr-2" /> : <Sun size={18} className="mr-2" />}
            {isLightTheme ? TEXT.THEME.SWITCH_TO_DARK : TEXT.THEME.SWITCH_TO_LIGHT}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="absolute right-0 top-0 w-64 h-full bg-sidebar border-l border-sidebar-border flex flex-col animate-slide-in-right">
            {/* Mobile Logo */}
            <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src={agencySettings.agency_logo} 
                  alt={`${agencySettings.agency_name} Logo`} 
                  className="w-8 h-8 object-contain cursor-pointer"
                  onClick={handleLogoClick}
                  onError={(e) => {
                    e.currentTarget.src = '/tourcompanion-logo.png';
                  }}
                />
                <h1 className="text-2xl font-bold text-primary tracking-tight">{agencySettings.agency_name}</h1>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-foreground-secondary hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map(item => {
                const Icon = item.icon;
                return <button 
                  key={item.id} 
                  onClick={() => handleMobileMenuClick(item.id)} 
                  className={`nav-item w-full ${currentPage === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>;
              })}
            </nav>

            {/* Mobile Sign Out */}
            <div className="p-4 border-t border-sidebar-border space-y-3">
              {user && (
                <div className="px-3 py-2 bg-accent/50 rounded-lg mb-3">
                  <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                </div>
              )}
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <img 
                src={agencySettings.agency_logo} 
                alt={`${agencySettings.agency_name} Logo`} 
                className="w-8 h-8 object-contain cursor-pointer"
                onClick={handleLogoClick}
                onError={(e) => {
                  e.currentTarget.src = '/tourcompanion-logo.png';
                }}
              />
              <h1 className="text-2xl font-bold text-primary tracking-tight">{agencySettings.agency_name}</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return <button 
                key={item.id} 
                onClick={() => onPageChange(item.id)} 
                className={`nav-item w-full ${currentPage === item.id ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>;
            })}
          </nav>

          {/* Bottom Section with Theme Toggle and Sign Out */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {/* User Info */}
            {user && (
              <div className="px-3 py-2 bg-accent/50 rounded-lg">
                <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
              </div>
            )}
            
            {/* Theme Toggle */}
            <Button 
              onClick={toggleTheme} 
              variant="outline"
              className="w-full justify-start"
              title={isLightTheme ? TEXT.THEME.SWITCH_TO_DARK : TEXT.THEME.SWITCH_TO_LIGHT}
            >
              {isLightTheme ? <Moon size={16} className="mr-2" /> : <Sun size={16} className="mr-2" />}
              {isLightTheme ? TEXT.THEME.SWITCH_TO_DARK : TEXT.THEME.SWITCH_TO_LIGHT}
            </Button>

            {/* Sign Out */}
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Desktop Header Bar */}
          <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-sidebar-border bg-background">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground capitalize">
                {currentPage.replace('-', ' ')}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Persistent Upgrade button for Free tier */}
              <UpgradeCtaButton />
              <NotificationBell />
            </div>
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>


      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={isNotificationPanelOpen} 
        onClose={() => setIsNotificationPanelOpen(false)} 
      />
    </div>;
};
export default Layout;

// Upgrade CTA component rendered in header
const UpgradeCtaButton: React.FC = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = React.useState<'free' | 'pro' | 'unknown'>('unknown');

  React.useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;
        const res = await fetch('/api/billing/subscription-status', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.success) setPlan(data.data.plan === 'pro' ? 'pro' : 'free');
      } catch {}
    };
    load();
  }, []);

  if (plan !== 'free') return null;

  return (
    <Button onClick={() => navigate('/pricing')} className="bg-purple-600 hover:bg-purple-700 text-white">
      Upgrade to Pro
    </Button>
  );
};