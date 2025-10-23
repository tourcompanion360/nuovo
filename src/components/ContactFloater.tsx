import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  X, 
  ChevronUp,
  Building2,
  User,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AgencyInfo {
  agency_name: string;
  contact_email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
}

interface ContactFloaterProps {
  projectId: string;
}

const ContactFloater: React.FC<ContactFloaterProps> = ({ projectId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgencyInfo = useCallback(async () => {
    try {
      // First get the project and its end_client
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          end_clients!inner(
            creator_id
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project data:', projectError);
        return;
      }

      if (!projectData?.end_clients?.creator_id) {
        console.error('No creator found for this project');
        return;
      }

      // Then get the creator info directly
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select(`
          agency_name,
          contact_email,
          phone,
          website,
          address,
          description
        `)
        .eq('id', projectData.end_clients.creator_id)
        .single();

      if (creatorError) {
        console.error('Error fetching creator info:', creatorError);
        return;
      }

      if (creatorData) {
        setAgencyInfo(creatorData);
      }
    } catch (error) {
      console.error('Error fetching agency info:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAgencyInfo();
  }, [fetchAgencyInfo]);

  const handleEmailClick = () => {
    if (agencyInfo?.contact_email) {
      window.open(`mailto:${agencyInfo.contact_email}?subject=Inquiry about Virtual Tour Project`, '_blank');
    }
  };

  const handlePhoneClick = () => {
    if (agencyInfo?.phone) {
      // Clean phone number for tel: link
      const cleanPhone = agencyInfo.phone.replace(/\D/g, '');
      window.open(`tel:${cleanPhone}`, '_blank');
    }
  };

  const handleWebsiteClick = () => {
    if (agencyInfo?.website) {
      const websiteUrl = agencyInfo.website.startsWith('http') 
        ? agencyInfo.website 
        : `https://${agencyInfo.website}`;
      window.open(websiteUrl, '_blank');
    }
  };

  const handleWhatsAppClick = () => {
    if (agencyInfo?.phone) {
      // Clean phone number for WhatsApp
      const cleanPhone = agencyInfo.phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hi! I have a question about my virtual tour project.`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Don't show if no agency info or still loading
  if (isLoading || !agencyInfo) {
    return null;
  }

  // Don't show if no contact information available
  if (!agencyInfo.contact_email && !agencyInfo.phone && !agencyInfo.website) {
    return null;
  }

  // Count available contact methods
  const contactMethods = [
    agencyInfo.contact_email && 'email',
    agencyInfo.phone && 'phone',
    agencyInfo.website && 'website'
  ].filter(Boolean).length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <Card className="w-80 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Contact Agency</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Agency Name */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {agencyInfo.agency_name || 'Agency'}
                </span>
              </div>

              {/* Contact Options */}
              <div className="space-y-2">
                {agencyInfo.contact_email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEmailClick}
                    className="w-full justify-start gap-2 h-10"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email: {agencyInfo.contact_email}</span>
                  </Button>
                )}

                {agencyInfo.phone && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePhoneClick}
                      className="w-full justify-start gap-2 h-10"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Call: {agencyInfo.phone}</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={handleWhatsAppClick}
                      className="w-full justify-start gap-2 h-10 bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span className="text-sm">WhatsApp</span>
                    </Button>
                  </>
                )}

                {agencyInfo.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWebsiteClick}
                    className="w-full justify-start gap-2 h-10"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Visit Website</span>
                  </Button>
                )}
              </div>

              {/* Agency Description */}
              {agencyInfo.description && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {agencyInfo.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <Button
            onClick={() => setIsExpanded(true)}
            className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 border-2 border-primary/20"
            size="lg"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContactFloater;
