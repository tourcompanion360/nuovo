import React, { useState } from 'react';
import { Camera, BarChart3, Image, HelpCircle, Settings, FileText, Sun, Moon, Menu, X, Share2, GraduationCap, User, Bot, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAgency } from '@/contexts/AgencyContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TEXT } from '@/constants/text';
import FloatingContact from './FloatingContact';
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
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    label: TEXT.NAVIGATION.CHATBOTS,
    icon: Bot
  }, {
    id: 'chatbot-requests',
    label: 'Request Chatbot',
    icon: FileText
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
    document.documentElement.classList.toggle('light');
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
  return <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-sidebar border-b border-sidebar-border">
        {/* Top row with logo and menu */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={agencySettings.agency_logo} 
              alt={`${agencySettings.agency_name} Logo`} 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-xl font-bold text-primary tracking-tight">{agencySettings.agency_name}</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
                  className="w-8 h-8 object-contain"
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
                className="w-8 h-8 object-contain"
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

          {/* Bottom Section with Settings, Theme Toggle, and Sign Out */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {/* User Info */}
            {user && (
              <div className="px-3 py-2 bg-accent/50 rounded-lg">
                <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => onPageChange('settings')}
              className="w-full justify-start"
            >
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
            
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
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* Premium Floating Contact */}
      <FloatingContact />
    </div>;
};
export default Layout;