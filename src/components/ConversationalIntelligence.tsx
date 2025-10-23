import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Users, TrendingUp, Clock, Search, Filter, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TEXT } from '@/constants/text';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ChatbotQuestion {
  id: string;
  question: string;
  frequency: number;
  category: string;
  last_asked: string;
  answered: boolean;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  created_at: string;
  last_interaction: string;
  score: number;
}

const ConversationalIntelligence: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [topQuestions, setTopQuestions] = useState<ChatbotQuestion[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<ChatbotQuestion[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Real-time subscription setup
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadConversationalData();
  }, []);

  // Set up real-time subscriptions for leads
  useEffect(() => {
    if (!user?.id) return;

    console.log('[ConversationalIntelligence] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`conversational-intelligence-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('[ConversationalIntelligence] Lead change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          console.log('[ConversationalIntelligence] Analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[ConversationalIntelligence] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[ConversationalIntelligence] Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [user?.id]);

  const debouncedRefresh = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[ConversationalIntelligence] Triggering debounced refresh');
      loadConversationalData();
    }, 1000);
  };

  const loadConversationalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load top asked questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('chatbot_questions')
        .select('*')
        .order('frequency', { ascending: false })
        .limit(10);

      if (questionsError) throw questionsError;

      // Load unanswered questions
      const { data: unansweredData, error: unansweredError } = await supabase
        .from('chatbot_questions')
        .select('*')
        .eq('answered', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (unansweredError) throw unansweredError;

      // Load leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (leadsError) throw leadsError;

      setTopQuestions(questionsData || []);
      setUnansweredQuestions(unansweredData || []);
      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error loading conversational data:', error);
      setError(TEXT.ANALYTICS.ERROR_LOADING_QUESTIONS);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.ANALYTICS.ERROR_LOADING_QUESTIONS,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new':
        return 'default';
      case 'contacted':
        return 'secondary';
      case 'qualified':
        return 'outline';
      case 'converted':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return TEXT.ANALYTICS.LEAD_STATUS.NEW;
      case 'contacted':
        return TEXT.ANALYTICS.LEAD_STATUS.CONTACTED;
      case 'qualified':
        return TEXT.ANALYTICS.LEAD_STATUS.QUALIFIED;
      case 'converted':
        return TEXT.ANALYTICS.LEAD_STATUS.CONVERTED;
      default:
        return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredQuestions = topQuestions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{TEXT.ANALYTICS.CONVERSATIONAL_INTELLIGENCE}</h2>
          <p className="text-foreground-secondary">{TEXT.ANALYTICS.CHATBOT_INSIGHTS}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
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
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{TEXT.ANALYTICS.CONVERSATIONAL_INTELLIGENCE}</h2>
          <p className="text-foreground-secondary">{TEXT.ANALYTICS.CHATBOT_INSIGHTS}</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-destructive mb-2">{error}</div>
              <Button onClick={loadConversationalData} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{TEXT.ANALYTICS.CONVERSATIONAL_INTELLIGENCE}</h2>
        <p className="text-foreground-secondary">{TEXT.ANALYTICS.CHATBOT_INSIGHTS}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Asked Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {TEXT.ANALYTICS.TOP_ASKED_QUESTIONS}
            </CardTitle>
            <CardDescription>
              {TEXT.ANALYTICS.MOST_FREQUENT_QUESTIONS}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={TEXT.ANALYTICS.SEARCH_QUESTIONS}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={TEXT.ANALYTICS.CATEGORY} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{TEXT.ANALYTICS.ALL_CATEGORIES}</SelectItem>
                    <SelectItem value="pricing">{TEXT.ANALYTICS.CATEGORIES.PRICING}</SelectItem>
                    <SelectItem value="features">{TEXT.ANALYTICS.CATEGORIES.FEATURES}</SelectItem>
                    <SelectItem value="support">{TEXT.ANALYTICS.CATEGORIES.SUPPORT}</SelectItem>
                    <SelectItem value="technical">{TEXT.ANALYTICS.CATEGORIES.TECHNICAL}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{TEXT.ANALYTICS.NO_QUESTIONS_FOUND}</p>
                  </div>
                ) : (
                  filteredQuestions.map((question, index) => (
                    <div key={question.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {question.question}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {question.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {TEXT.ANALYTICS.ASKED_TIMES.replace('{count}', question.frequency.toString())}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unanswered Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {TEXT.ANALYTICS.UNANSWERED_QUESTIONS}
            </CardTitle>
            <CardDescription>
              {TEXT.ANALYTICS.QUESTIONS_NEED_ATTENTION}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {unansweredQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{TEXT.ANALYTICS.NO_UNANSWERED_QUESTIONS}</p>
                </div>
              ) : (
                unansweredQuestions.map((question) => (
                  <div key={question.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {question.question}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {question.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(question.last_asked).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {TEXT.ANALYTICS.ANSWER}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Generated */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {TEXT.ANALYTICS.LEADS_GENERATED}
          </CardTitle>
          <CardDescription>
            {TEXT.ANALYTICS.POTENTIAL_CUSTOMERS}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {TEXT.ANALYTICS.TOTAL_LEADS}: <span className="font-medium text-foreground">{leads.length}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {TEXT.ANALYTICS.NEW_THIS_WEEK}: <span className="font-medium text-foreground">
                    {leads.filter(lead => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(lead.created_at) > weekAgo;
                    }).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {leads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{TEXT.ANALYTICS.NO_LEADS_GENERATED}</p>
                </div>
              ) : (
                leads.map((lead) => (
                  <div key={lead.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{lead.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(lead.status)} className="flex-shrink-0">
                            {getStatusLabel(lead.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{TEXT.ANALYTICS.COMPANY}: {lead.company}</span>
                          <span>{TEXT.ANALYTICS.SOURCE}: {lead.source}</span>
                          <span>{TEXT.ANALYTICS.SCORE}: <span className={`font-medium ${getScoreColor(lead.score)}`}>{lead.score}/100</span></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {TEXT.ANALYTICS.CONTACT}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationalIntelligence;
