import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, MousePointer, TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDuration } from '@/utils/analyticsTerminology';
import { TEXT } from '@/constants/text';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';

interface KPIData {
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
  viewsChange: number;
  visitorsChange: number;
  clicksChange: number;
  conversionChange: number;
}

const AnalyticsKPI: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { analytics, isLoading, error, refreshData } = useCreatorDashboard(user?.id || '');
  const [timeRange, setTimeRange] = useState('7d');
  
  // Real-time subscription setup
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate KPI data from real analytics
  const kpiData: KPIData = {
    totalViews: analytics?.reduce((sum, a) => sum + (a.views || 0), 0) || 0,
    uniqueVisitors: analytics?.reduce((sum, a) => sum + (a.unique_visitors || 0), 0) || 0,
    totalClicks: analytics?.reduce((sum, a) => sum + (a.clicks || 0), 0) || 0,
    conversionRate: analytics?.length > 0 ? analytics.reduce((sum, a) => sum + (a.conversion_rate || 0), 0) / analytics.length : 0,
    avgSessionDuration: analytics?.length > 0 ? analytics.reduce((sum, a) => sum + (a.avg_session_duration || 0), 0) / analytics.length : 0,
    bounceRate: analytics?.length > 0 ? analytics.reduce((sum, a) => sum + (a.bounce_rate || 0), 0) / analytics.length : 0,
    viewsChange: 0, // TODO: Calculate from historical data
    visitorsChange: 0, // TODO: Calculate from historical data
    clicksChange: 0, // TODO: Calculate from historical data
    conversionChange: 0, // TODO: Calculate from historical data
  };

  // Set up real-time subscriptions for analytics
  useEffect(() => {
    if (!user?.id) return;

    console.log('[AnalyticsKPI] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`analytics-kpi-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          console.log('[AnalyticsKPI] Analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[AnalyticsKPI] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[AnalyticsKPI] Cleaning up real-time subscriptions');
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
      console.log('[AnalyticsKPI] Triggering debounced refresh');
      refreshData();
    }, 1000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Using formatDuration from utils for consistency

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const kpiCards = [
    {
      title: TEXT.ANALYTICS.TOTAL_VIEWS,
      value: formatNumber(kpiData.totalViews),
      change: kpiData.viewsChange,
      icon: Eye,
      description: TEXT.ANALYTICS.PAGE_VIEWS_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.UNIQUE_VISITORS,
      value: formatNumber(kpiData.uniqueVisitors),
      change: kpiData.visitorsChange,
      icon: Users,
      description: TEXT.ANALYTICS.DISTINCT_USERS_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.TOTAL_CLICKS,
      value: formatNumber(kpiData.totalClicks),
      change: kpiData.clicksChange,
      icon: MousePointer,
      description: TEXT.ANALYTICS.INTERACTIVE_CLICKS_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.CONVERSION_RATE,
      value: isNaN(kpiData.conversionRate) ? '0.0%' : `${kpiData.conversionRate.toFixed(1)}%`,
      change: kpiData.conversionChange,
      icon: BarChart3,
      description: TEXT.ANALYTICS.CLICKS_PER_VIEW_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.AVG_SESSION_DURATION,
      value: formatDuration(kpiData.avgSessionDuration),
      change: 0, // Production ready - no random data
      icon: Clock,
      description: TEXT.ANALYTICS.AVG_TIME_SESSION_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.BOUNCE_RATE,
      value: isNaN(kpiData.bounceRate) ? '0.0%' : `${kpiData.bounceRate.toFixed(1)}%`,
      change: 0, // Production ready - no random data
      icon: TrendingDown,
      description: TEXT.ANALYTICS.SINGLE_PAGE_SESSIONS_DESCRIPTION
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{TEXT.ANALYTICS.PERFORMANCE_ANALYTICS}</h2>
            <p className="text-foreground-secondary">{TEXT.ANALYTICS.KEY_METRICS}</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant="outline"
                size="sm"
                disabled
              >
                {range === '7d' ? TEXT.ANALYTICS.LAST_7_DAYS : 
                 range === '30d' ? TEXT.ANALYTICS.LAST_30_DAYS : 
                 range === '90d' ? TEXT.ANALYTICS.LAST_90_DAYS : 
                 TEXT.ANALYTICS.LAST_YEAR}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{TEXT.ANALYTICS.PERFORMANCE_ANALYTICS}</h2>
            <p className="text-foreground-secondary">{TEXT.ANALYTICS.KEY_METRICS}</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-destructive mb-2">{error}</div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{TEXT.ANALYTICS.PERFORMANCE_ANALYTICS}</h2>
          <p className="text-foreground-secondary">{TEXT.ANALYTICS.KEY_METRICS}</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? TEXT.ANALYTICS.LAST_7_DAYS : 
               range === '30d' ? TEXT.ANALYTICS.LAST_30_DAYS : 
               range === '90d' ? TEXT.ANALYTICS.LAST_90_DAYS : 
               TEXT.ANALYTICS.LAST_YEAR}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
                <Badge 
                  variant={card.change >= 0 ? 'default' : 'secondary'}
                  className={`${getChangeColor(card.change)} flex items-center gap-1`}
                >
                  {getChangeIcon(card.change)}
                  {Math.abs(card.change).toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {card.value}
                </div>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsKPI;
