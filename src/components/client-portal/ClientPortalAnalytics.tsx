import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, TrendingUp, Eye, Users, Clock } from 'lucide-react';
import { formatDuration, formatNumber, getDisplayLabel, getAnalyticsSummary } from '@/utils/analyticsTerminology';
import { useUnifiedAnalytics } from '@/hooks/useUnifiedAnalytics';
import SimpleAnalytics from './SimpleAnalytics';

interface ClientPortalAnalyticsProps {
  projectId: string;
}

const ClientPortalAnalytics: React.FC<ClientPortalAnalyticsProps> = ({ projectId }) => {
  // Use unified analytics hook for consistent data
  const unifiedAnalytics = useUnifiedAnalytics({ 
    projectId: projectId 
  });

  console.log('[ClientPortalAnalytics] Using unified analytics:', {
    projectId,
    loading: unifiedAnalytics.loading,
    error: unifiedAnalytics.error,
    totalViews: unifiedAnalytics.totalViews,
    totalVisitors: unifiedAnalytics.totalVisitors,
    avgEngagementTime: unifiedAnalytics.avgEngagementTime
  });

  if (unifiedAnalytics.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (unifiedAnalytics.error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-red-500">
          <p>Error loading analytics: {unifiedAnalytics.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Real-time performance metrics and insights for your virtual tour
        </p>
      </div>
      
      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Views Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700">Total Views</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-1">{unifiedAnalytics.totalViews}</div>
            <p className="text-xs text-blue-500 font-medium">Page impressions</p>
          </CardContent>
        </Card>

        {/* Visitors Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-700">Unique Visitors</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">{unifiedAnalytics.totalVisitors}</div>
            <p className="text-xs text-green-500 font-medium">Individual users</p>
          </CardContent>
        </Card>

        {/* Average Time Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-700">Avg. Session</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-1">{formatDuration(unifiedAnalytics.avgEngagementTime)}</div>
            <p className="text-xs text-purple-500 font-medium">Time per visit</p>
          </CardContent>
        </Card>

        {/* Leads Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-orange-700">Leads</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-1">{unifiedAnalytics.totalLeads}</div>
            <p className="text-xs text-orange-500 font-medium">Generated leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{unifiedAnalytics.conversionRate}%</div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{unifiedAnalytics.avgSatisfaction}/5</div>
              <p className="text-sm text-gray-600">Avg. Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Active</div>
              <p className="text-sm text-gray-600">Tracking Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPortalAnalytics;



