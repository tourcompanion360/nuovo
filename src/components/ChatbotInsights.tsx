import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare, Brain, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ChatbotInsightsProps {
  projectId: string;
}

const ChatbotInsights: React.FC<ChatbotInsightsProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [chatbot, setChatbot] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    avgResponseTime: 0,
    satisfaction: 0,
    activeConversations: 0,
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get chatbot for this project
      const { data: chatbotData, error: chatbotErr } = await supabase
        .from('chatbots')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (!chatbotErr && chatbotData) {
        setChatbot(chatbotData);

        // Get conversation messages
        const { data: messagesData, error: messagesErr } = await supabase
          .from('conversation_messages')
          .select('*')
          .eq('chatbot_id', chatbotData.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!messagesErr) {
          setConversations(messagesData || []);
        }

        // Get memory insights
        const { data: insightsData, error: insightsErr } = await supabase
          .from('memory_insights')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!insightsErr) {
          setInsights(insightsData || []);
        }

        // Calculate stats
        const statistics = chatbotData.statistics || {};
        setStats({
          totalMessages: statistics.total_messages || 0,
          avgResponseTime: statistics.avg_response_time || 0,
          satisfaction: statistics.satisfaction_rate || 0,
          activeConversations: statistics.total_conversations || 0,
        });
      }
    } catch (error) {
      console.error('Error loading chatbot insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No chatbot configured</h3>
            <p className="text-muted-foreground">
              Set up a chatbot for this project to see insights and conversation history.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConversations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime.toFixed(1)}s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.satisfaction.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Conversations and Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Chatbot Intelligence</CardTitle>
          <CardDescription>
            View conversation history and AI-generated insights from user interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="conversations">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversations">Recent Conversations</TabsTrigger>
              <TabsTrigger value="insights">Memory Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="space-y-4">
              {conversations.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {conversations.map((msg) => (
                      <Card key={msg.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant={msg.role === 'user' ? 'default' : 'secondary'}>
                              {msg.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No conversations yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {insights.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {insights.map((insight) => (
                      <Card key={insight.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              {insight.period} Insights
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(insight.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {insight.summary && (
                            <div>
                              <h4 className="font-semibold mb-2">Summary</h4>
                              <p className="text-sm text-muted-foreground">{insight.summary}</p>
                            </div>
                          )}
                          {insight.top_questions && Array.isArray(insight.top_questions) && insight.top_questions.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Top Questions</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {insight.top_questions.map((q: string, idx: number) => (
                                  <li key={idx} className="text-sm text-muted-foreground">{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {insight.topics && Array.isArray(insight.topics) && insight.topics.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Topics</h4>
                              <div className="flex flex-wrap gap-2">
                                {insight.topics.map((topic: string, idx: number) => (
                                  <Badge key={idx} variant="outline">{topic}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    AI insights will appear here after the chatbot has enough conversations
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotInsights;







