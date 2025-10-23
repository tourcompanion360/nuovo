import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Lock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAgency } from '@/contexts/AgencyContext';
interface AccountSettings {
  email: string;
}
const defaultAccountSettings: AccountSettings = {
  email: 'support@tourcompanion.com'
};
const STATIC_PASSWORD = 'TourCompanion2024!';
const Impostazioni = () => {
  const [accountSettings, setAccountSettings] = useState<AccountSettings>(defaultAccountSettings);
  const { toast } = useToast();
  const { agencySettings } = useAgency();

  // Carica impostazioni da localStorage
  useEffect(() => {
    const savedAccount = localStorage.getItem('account-settings');
    if (savedAccount) {
      setAccountSettings(JSON.parse(savedAccount));
    }
  }, []);
  const handleSave = () => {
    localStorage.setItem('account-settings', JSON.stringify(accountSettings));
    toast({
      title: "Impostazioni salvate",
      description: "L'email è stata salvata con successo."
    });
  };
  return <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={agencySettings.agency_logo} 
              alt={`${agencySettings.agency_name} Logo`} 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.src = '/tourcompanion-logo.png';
              }}
            />
            <h1 className="text-3xl font-bold text-foreground">Impostazioni</h1>
          </div>
          <p className="text-foreground-secondary">Gestisci le credenziali del tuo account software.</p>
        </div>
        
      </div>

      {/* Account & Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Credenziali Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="account-email" className="flex items-center gap-2">
                <Mail size={16} />
                Email RealSee
              </Label>
              <Input id="account-email" type="email" value={accountSettings.email} disabled className="mt-2 bg-accent/50 cursor-not-allowed" />
            </div>
            
            <div>
              <Label htmlFor="account-password" className="flex items-center gap-2">
                <Lock size={16} />
                Password
              </Label>
              <Input id="account-password" type="text" value={STATIC_PASSWORD} disabled className="mt-2 bg-accent/50 cursor-not-allowed" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-foreground-secondary">
              Queste credenziali vengono utilizzate per accedere al software RealSee per la creazione dei tour virtuali.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Impostazioni;