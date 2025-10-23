
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Mail, MessageCircle, Clock, CheckCircle2, PlayCircle, Star, Video, GraduationCap, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TEXT } from '@/constants/text';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
}

const Support = () => {
  const { toast } = useToast();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Academy data
  const videoTutorials = [
    {
      id: 1,
      title: TEXT.ACADEMY.TUTORIALS.PLATFORM_OVERVIEW,
      duration: "12 min",
      level: TEXT.ACADEMY.LEVELS.BEGINNER,
      thumbnail: "/api/placeholder/300/180",
      youtubeId: "dQw4w9WgXcQ",
      description: "Get started with the platform and understand the main features"
    }
  ];


  const openYouTubeVideo = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
  };

  const openVideoModal = (youtubeId: string) => {
    console.log('Opening video modal with YouTube ID:', youtubeId);
    setSelectedVideo(youtubeId);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsVideoModalOpen(false);
  };

  const playVideoInCard = (youtubeId: string) => {
    setPlayingVideo(youtubeId);
  };

  const stopVideoInCard = () => {
    setPlayingVideo(null);
  };


  const faqItems = [
    {
      question: TEXT.FAQ.CREATE_FIRST_PROJECT_QUESTION,
      answer: TEXT.FAQ.CREATE_FIRST_PROJECT_ANSWER
    },
    {
      question: TEXT.FAQ.CLIENT_PORTAL_ACCESS_QUESTION,
      answer: TEXT.FAQ.CLIENT_PORTAL_ACCESS_ANSWER
    },
    {
      question: TEXT.FAQ.CHATBOT_SETUP_QUESTION,
      answer: TEXT.FAQ.CHATBOT_SETUP_ANSWER
    },
    {
      question: TEXT.FAQ.REQUEST_TYPES_QUESTION,
      answer: TEXT.FAQ.REQUEST_TYPES_ANSWER
    },
    {
      question: TEXT.FAQ.NOTIFICATIONS_QUESTION,
      answer: TEXT.FAQ.NOTIFICATIONS_ANSWER
    },
    {
      question: TEXT.FAQ.PROJECT_SHARING_QUESTION,
      answer: TEXT.FAQ.PROJECT_SHARING_ANSWER
    }
  ];

  useEffect(() => {
    loadSupportTickets();
  }, []);

  const loadSupportTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportTickets(data || []);
    } catch (error) {
      console.error('Error loading support requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
      // Use the new support_requests table and function
      const { data, error } = await supabase.rpc('create_support_request', {
        p_subject: subject,
        p_message: message,
        p_request_type: subject // Use subject as request type
      });

      if (error) throw error;

      toast({
        title: 'Message Sent',
        description: 'Your support request has been submitted successfully. We\'ll respond as soon as possible.',
      });

      setSubject('');
      setMessage('');
      loadSupportTickets();
    } catch (error: any) {
      console.error('Error submitting support request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit your request. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aperto':
        return 'default';
      case 'in_corso':
        return 'secondary';
      case 'risolto':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.HEADERS.SUPPORT_ASSISTANCE}</h1>
        <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.DESCRIPTIONS.SUPPORT_SUBTITLE}</p>
      </div>

      <Tabs defaultValue="support" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="support">Support & Help</TabsTrigger>
          <TabsTrigger value="academy">{TEXT.ACADEMY.TRAINING_ACADEMY}</TabsTrigger>
        </TabsList>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Us Directly */}
        <Card className="p-6 bg-background-secondary border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">{TEXT.HEADERS.CONTACT_US_DIRECTLY}</h2>
          <p className="text-foreground-secondary mb-6">
            {TEXT.DESCRIPTIONS.CONTACT_DESCRIPTION}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-foreground font-medium mb-2">{TEXT.FORMS.SUBJECT}</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder={TEXT.FORMS.SELECT_REQUEST_TYPE} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical_support">{TEXT.SUPPORT_SUBJECTS.TECHNICAL_SUPPORT}</SelectItem>
                  <SelectItem value="project_creation">{TEXT.SUPPORT_SUBJECTS.PROJECT_CREATION}</SelectItem>
                  <SelectItem value="client_portal">{TEXT.SUPPORT_SUBJECTS.CLIENT_PORTAL}</SelectItem>
                  <SelectItem value="chatbot_setup">{TEXT.SUPPORT_SUBJECTS.CHATBOT_SETUP}</SelectItem>
                  <SelectItem value="payment_billing">{TEXT.SUPPORT_SUBJECTS.PAYMENT_BILLING}</SelectItem>
                  <SelectItem value="account_management">{TEXT.SUPPORT_SUBJECTS.ACCOUNT_MANAGEMENT}</SelectItem>
                  <SelectItem value="feature_request">{TEXT.SUPPORT_SUBJECTS.FEATURE_REQUEST}</SelectItem>
                  <SelectItem value="other">{TEXT.SUPPORT_SUBJECTS.OTHER}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your request here..."
                className="bg-input border-border min-h-[120px] resize-none"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={isSubmitting || !subject || !message}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </Card>

        {/* FAQ */}
        <Card className="p-6 bg-background-secondary border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Answers (FAQ)</h2>
          
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-item">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-background-tertiary transition-colors"
                >
                  <span className="font-medium text-foreground">{item.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="text-foreground-secondary" size={20} />
                  ) : (
                    <ChevronDown className="text-foreground-secondary" size={20} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-foreground-secondary animate-slide-up">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Your Support Requests */}
      {supportTickets.length > 0 && (
        <Card className="p-6 bg-background-secondary border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Support Requests</h2>
          
          <div className="space-y-4">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 border border-border rounded-lg bg-background-tertiary">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">
                      {ticket.subject === 'technical_support' && 'Technical Support'}
                      {ticket.subject === 'project_creation' && 'Project Creation Help'}
                      {ticket.subject === 'client_portal' && 'Client Portal Issues'}
                      {ticket.subject === 'chatbot_setup' && 'Chatbot Setup & Configuration'}
                      {ticket.subject === 'payment_billing' && 'Payment & Billing'}
                      {ticket.subject === 'account_management' && 'Account Management'}
                      {ticket.subject === 'feature_request' && 'Feature Request'}
                      {ticket.subject === 'other' && 'Other'}
                    </h3>
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-foreground-secondary text-sm">
                    <Clock size={14} />
                    {new Date(ticket.created_at).toLocaleDateString('it-IT')}
                  </div>
                </div>
                
                <p className="text-foreground-secondary text-sm line-clamp-2 mb-3">
                  {ticket.message}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <span>Priority: {ticket.priority}</span>
                  {ticket.status === 'resolved' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 size={12} />
                      Resolved
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Guides and Alternative Contacts */}
      <Card className="p-6 bg-background-secondary border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Guides and Alternative Contacts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-12 bg-background-tertiary border-border hover:bg-accent"
            onClick={() => window.open('mailto:prismatica360@gmail.com', '_blank')}
          >
            <Mail size={20} />
            Direct Email
          </Button>
          
          <Button 
            className="flex items-center gap-2 h-12 bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => {
              const phoneNumber = '393293763839'; // +39 329 376 3839
              const whatsappUrl = `https://wa.me/${phoneNumber}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp Chat
          </Button>
        </div>
      </Card>
        </TabsContent>

        {/* Academy Tab */}
        <TabsContent value="academy" className="space-y-8">
          {/* Academy Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{TEXT.ACADEMY.TRAINING_ACADEMY}</h2>
              <p className="text-foreground-secondary">{TEXT.ACADEMY.IMPROVE_SKILLS}</p>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>


          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                {TEXT.ACADEMY.VIDEO_TUTORIALS_SECTION}
              </CardTitle>
              <CardDescription>
                {TEXT.ACADEMY.VIDEO_TUTORIALS_DESCRIPTION}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videoTutorials.map((tutorial) => (
                  <div key={tutorial.id} className="border rounded-lg p-4 hover:shadow-lg transition-all duration-200 group">
                    <div className="aspect-video rounded-lg mb-4 overflow-hidden bg-black">
                      {playingVideo === tutorial.youtubeId ? (
                        // Embedded Video Player
                        <div className="relative w-full h-full">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${tutorial.youtubeId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1`}
                            title={tutorial.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                          <button
                            onClick={stopVideoInCard}
                            className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded hover:bg-black/80 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        // Video Thumbnail with YouTube Preview
                        <div 
                          className="w-full h-full relative cursor-pointer group"
                          onClick={() => playVideoInCard(tutorial.youtubeId)}
                        >
                          {/* YouTube Thumbnail */}
                          <img
                            src={`https://img.youtube.com/vi/${tutorial.youtubeId}/maxresdefault.jpg`}
                            alt={tutorial.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to medium quality if maxresdefault fails
                              e.currentTarget.src = `https://img.youtube.com/vi/${tutorial.youtubeId}/hqdefault.jpg`;
                            }}
                          />
                          
                          {/* Dark Overlay */}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-200"></div>
                          
                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300 border-4 border-white/50">
                              <div className="w-0 h-0 border-l-[12px] border-l-blue-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                          
                          {/* Duration Badge */}
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {tutorial.duration}
                          </div>
                          
                          {/* Expand Icon */}
                          <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Maximize2 className="h-4 w-4" />
                          </div>
                          
                          {/* Hover Text */}
                          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
                              Click to play
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{tutorial.level}</Badge>
                        <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{tutorial.title}</h3>
                      <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                      
                      <div className="flex gap-2">
                        {playingVideo === tutorial.youtubeId ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              stopVideoInCard();
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Stop Video
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              playVideoInCard(tutorial.youtubeId);
                            }}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Play Video
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVideoModal(tutorial.youtubeId);
                          }}
                        >
                          <Maximize2 className="h-4 w-4 mr-2" />
                          Fullscreen
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openYouTubeVideo(tutorial.youtubeId);
                          }}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          YouTube
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Call to Action */}
          <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 border-indigo-500 shadow-xl">
            <CardContent className="p-6 text-center text-white">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2 text-white">
                  {TEXT.ACADEMY.NEED_PERSONALIZED_SUPPORT}
                </h2>
                <p className="text-blue-100 text-sm max-w-lg mx-auto">
                  {TEXT.ACADEMY.CONTACT_FOR_TRAINING}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button 
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2 text-sm font-semibold rounded-lg"
                  onClick={() => {
                    const phoneNumber = '393293763839'; // +39 329 376 3839
                    const whatsappUrl = `https://wa.me/${phoneNumber}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </Button>
                <Button 
                  size="sm" 
                  className="bg-white hover:bg-gray-100 text-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2 text-sm font-semibold rounded-lg"
                  onClick={() => {
                    const email = 'tourcompanion360@gmail.com';
                    const subject = 'Support Request - TourCompanion';
                    const body = 'Hello,\n\nI need assistance with:\n\n';
                    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.location.href = mailtoUrl;
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Video Modal */}
      {isVideoModalOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Video Tutorial</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeVideoModal}
                className="h-8 w-8 p-0 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1`}
                title="Video Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
                loading="lazy"
                onError={() => {
                  console.error('Failed to load YouTube video:', selectedVideo);
                }}
              ></iframe>
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-600 text-center">
                Having trouble viewing the video? 
                <button 
                  onClick={() => openYouTubeVideo(selectedVideo)}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  Open in YouTube
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
